# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev         # Start Vite dev server
npm run build       # TypeScript check + Vite production build
npm run preview     # Preview production build locally
npm run test        # Vitest (single run)
npm run test:watch  # Vitest (watch mode)
npm run lint        # Biome check
npm run lint:fix    # Biome check --write
npm run format      # Biome format --write
```

Run individual tests via vitest: `npx vitest run tests/game-flow.test.tsx`

## Project Structure

```
cowhorse/
├── src/
│   ├── types.ts                    # Core types: AttributeKey, Attributes, GameEffect,
│   │                               # Choice, GameEvent, Condition tree, Ending, store types
│   ├── App.tsx                     # Router: / (title), /game, /ending
│   ├── main.tsx                    # Entry point
│   │
│   ├── engine/                     # Game state machine & logic
│   │   ├── useGameStore.ts         # Zustand store (attributes, events, dice, moments, endings)
│   │   ├── eventEvaluator.ts       # Choice filtering, event routing, stage transition validation, encounter selection
│   │   ├── diceRoller.ts           # 1d6 with [-3,+3] modifier
│   │   └── memeEvaluator.ts        # Evaluate meme timing (correct/wrong/none)
│   │
│   ├── content/                    # JSON-driven game content
│   │   ├── events/*.json           # Event data per life path
│   │   ├── events/index.ts         # Loads JSON into Map<EventId, GameEvent>
│   │   ├── stages.json             # Stage display labels & ordering (transition rules in eventEvaluator.ts)
│   │   ├── endings.json            # Ending conditions with rarity tiers
│   │   └── constants.json          # Game config (typewriter speed, moment reply count)
│   │
│   ├── hooks/
│   │   ├── useNarrative.ts         # Core game loop: event→choices→next event/ending
│   │   ├── useDiceAnimation.ts     # Dice rolling animation (idle→rolling→settled)
│   │   └── useReducedMotion.ts     # Accessibility: respects prefers-reduced-motion
│   │
│   ├── components/                 # Reusable UI
│   │   ├── NarrativeBox.tsx        # Typewriter text with voice markers: *inner*, !social!, [meme]
│   │   ├── ChoicePanel.tsx         # Choice buttons with attribute effect pills
│   │   ├── AttributeBar.tsx        # Sticky 5-attribute header (click to expand bars)
│   │   ├── DiceRoll.tsx            # Dice roll overlay with animation
│   │   ├── MomentsFeed.tsx         # WeChat-style moments popup
│   │   ├── LonelyMoment.tsx        # Full-screen introspection overlay
│   │   └── LifeResume.tsx          # Ending poster content (for html2canvas capture)
│   │
│   ├── screens/
│   │   ├── TitleScreen.tsx         # Start screen with "玩法说明" about dialog
│   │   ├── GameScreen.tsx          # Main game: narrative + choices + dice + moments
│   │   └── EndingScreen.tsx        # Ending display with save/share poster
│   │
│   └── utils/
│       ├── conditions.ts           # Condition tree evaluator (attr/stage/dice/visited/and/or/not)
│       ├── effects.ts              # Apply GameEffect[], clamp values to [0, 100]
│       ├── endings.ts              # Evaluate & resolve endings
│       ├── narrativeParser.ts      # Parse *inner* / !social! / [meme] voice markers
│       └── poster.ts               # html2canvas rendering, download, share
│
├── tests/
│   └── game-flow.test.tsx          # E2E game flow test (job route → ending)
│
├── vite.config.ts                  # Vite + React + Tailwind v4 + PWA
├── tailwindcss v4 (@import "tailwindcss" in index.css)
└── tsconfig.app.json               # Target ES2023, bundler resolution, strict
```

## Architecture Overview

### Game Engine (Event-Driven, JSON-Powered)

All game content lives in `src/content/events/*.json` — each JSON file contains an array of `GameEvent` objects. `events/index.ts` loads them all into a flat `Map<EventId, GameEvent>`.

The game loop is driven by `useNarrative`:
1. Read `currentEvent` from store → display text via `NarrativeBox` (typewriter effect)
2. If event has `diceRoll`, trigger dice animation; filter choices via `getVisibleChoices()` → evaluate each choice's `condition` against current state
3. Player picks a choice → `applyEffect()` mutates attributes, check for meme reactions, stage transitions, or ending
4. **Encounter check**: if `currentEvent` is NOT itself an encounter, `getRandomEncounter()` fires (20% chance; stage-filtered; excludes already-visited encounters). If an encounter fires, save `storyReturnEventId` as the return target and navigate to the encounter. The encounter resolves back to the saved story target via `__return_to_story__` sentinel.
5. **Stage validation**: `isValidStageTransition(from, to)` checks the stage transition table. Invalid transitions silently preserve current stage.
6. Navigate to next event or end game

### State Machine (Zustand)

All mutable state lives in `useGameStore`: attributes (5 numbers clamped 0–100), current stage/event, visited events set, dice result, moments feed, lonely moment overlay, ending ID.

Key transitions:
- **Attribute → 0**: `mentalHealth <= 0` immediately triggers `mental_breakdown` ending
- **Stage change**: Validated via `isValidStageTransition(from, to)` — engine silently rejects illegal transitions (e.g. `work → undergrad`). Transition table in `eventEvaluator.ts` is the single source of truth.
- **Encounter injection**: 20% chance per story event (no chaining — encounters don't trigger other encounters). Each encounter fires at most once per game (`visitedEvents` check).
- **Ending**: Either explicit `ending_reached` event ID, or `nextEvent.stage === 'ending'` triggers `evaluateEnding()` against the condition tree

### Condition System

Compound conditions evaluated by `evaluateCondition()`:
- `attribute`: compare `state.attributes[attr]` via operator (lt/gt/lte/gte/eq)
- `stage`: check `state.currentStage`
- `dice`: check `state.diceResult.value` in range
- `visited`: check `state.visitedEvents.has(eventId)`
- `and`/`or`/`not`: logical combinators

Used for: choice visibility, event availability, meme timing, ending resolution.

### Voice Markers in Narrative Text

Event text can contain inline markers for styling:
- `*text*` → italic muted (inner thoughts)
- `!text!` → bold pink badge (social speech)
- `[text]` → monospace primary badge (meme/network lingo)

Parsed by `narrativeParser.ts` into `NarrativeSegment[]` and rendered by `NarrativeBox`.

### Mobile-First UI

Layout constrained to `max-width: 480px` centered. Paper-themed with shadow-card borders, typewriter text, and WYSIWYG poster export via html2canvas. Supports `prefers-reduced-motion`.

## Key Patterns

- **JSON content = game logic**: Event conditions, choices, effects, endings — all driven by JSON. TypeScript types validate structure at import time.
- **Effects describe both target and value**: `GameEffect { target: AttributeKey; value: number; label?: string }` — no side effects in content; `applyEffects()` in `effects.ts` handles clamping and returns deltas.
- **Ending evaluation is first-match**: `evaluateEnding()` iterates endings in order and returns the first whose condition matches; `stable_retirement` is the fallback.
- **Encounter events are single-play**: Each `encounter_*` event fires at most once per game (`visitedEvents` check). Encounters do not chain — resolving an encounter always returns to the main storyline.
- **Stage transitions are validated**: `isValidStageTransition()` enforces the legal transition graph. Invalid jumps (e.g. `work → undergrad`) are silently rejected, preserving the current stage.
