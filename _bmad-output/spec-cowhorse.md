---
title: 'CowHorse MVP — Full Implementation'
type: 'feature'
created: '2026-06-24'
status: 'in-review'
baseline_commit: 'NO_VCS'
context:
  - _bmad-output/architecture.md
  - _bmad-output/specs/spec-cowhorse/SPEC.md
  - _bmad-output/specs/spec-cowhorse/DESIGN.md
  - _bmad-output/specs/spec-cowhorse/narrative-voice.md
  - design-system/cowhorse/MASTER.md
  - design-system/cowhorse/pages/title-screen.md
  - design-system/cowhorse/pages/game-screen.md
  - design-system/cowhorse/pages/ending-screen.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** CowHorse is a satirical, meme-rich narrative life simulation. It currently has only architecture and design documents; no runnable game exists.

**Approach:** Build a web-first PWA with Vite + React 19 + TypeScript + Tailwind CSS, using a custom narrative engine, a single Zustand session store, and three screens (Title / Game / Ending). Ship enough content and mechanics so a player can complete one playthrough, reach different endings, and save/share a Life Resume poster.

</frozen-after-approval>

## Boundaries & Constraints

**Always:**
- Pure client-side SPA; no backend, API, auth, or database.
- One-session-per-playthrough; no save/load/continue or persistence middleware.
- Exactly one Zustand store (`useGameStore`) with no persist middleware.
- Engine layer (`engine/` and `utils/`) must have zero React dependency.
- All content is static JSON bundled by Vite; no runtime fetch/CMS.
- Styling uses Tailwind utility classes only; global styles live in `src/index.css`.
- camelCase for TypeScript identifiers and JSON keys; PascalCase for components/types; snake_case for event IDs; kebab-case for content filenames.
- Design tokens and page specs come from `design-system/cowhorse/`; page files override the master where they conflict.

**Ask First:**
- Any reduction in scope (e.g., dropping Moments, dice, or Life Resume poster) if implementation time runs short.
- Deployment target/hosting details if different from Cloudflare Pages.

**Never:**
- WeChat Mini Program support, server-side rendering, analytics, or leaderboards in this implementation.
- Per-component `.css` files, glassmorphism, AI-style gradients, emojis as structural icons, or rotated interactive elements.
- Zustand persist, secondary stores, or runtime `fetch` for content.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Start new game | Player taps "开始游戏" | TitleScreen navigates to GameScreen; all state resets to defaults | N/A |
| Event with choices | Engine loads event with 2-4 choices | NarrativeBox types text; ChoicePanel shows valid options only | Unknown `nextEventId` routes to fallback `event_not_found` |
| Choice with effects | Player selects a choice | Effects apply atomically; AttributeBar animates; mental health ≤0 triggers ending before next event | N/A |
| Dice event | Event has `diceRoll: true` | DiceRoll overlay shakes, rolls 1-6, shows result label, then auto-dismisses | Invalid modifiers are capped to [-3, +3] |
| Mental health zero | Applied effect brings mentalHealth to 0 | Store routes to EndingScreen with ending evaluation | N/A |
| Stage transition | Event triggers stage transition | MomentsFeed bottom sheet appears with generated post + friend replies | N/A |
| Ending reached | Ending condition satisfied | EndingScreen renders title/description + Life Resume poster; save/share buttons enabled after render | html2canvas failure disables share and shows fallback message |
| Replay | Player taps "再玩一次" | Store resets; app navigates to TitleScreen | N/A |
| Reduced motion | `prefers-reduced-motion: reduce` | Typewriter, dice shake, sticker pop, and fade transitions are disabled or shortened | N/A |

## Code Map

- `package.json` — dependencies, scripts (dev/build/preview/test/lint/format).
- `vite.config.ts` — Vite + React + Tailwind plugin + PWA plugin.
- `tsconfig.json` — strict TypeScript config.
- `src/main.tsx` — React root mount.
- `src/App.tsx` — BrowserRouter and three routes.
- `src/index.css` — Tailwind directives, Google Fonts import, CSS variables, paper texture.
- `src/types.ts` — shared TypeScript types (Event, Choice, Condition, GameEffect, Stage, etc.).
- `src/engine/useGameStore.ts` — single Zustand store with attributes, narrative state, and actions.
- `src/engine/eventEvaluator.ts` — event/choice condition evaluator.
- `src/engine/diceRoller.ts` — fate dice roll logic.
- `src/engine/memeEvaluator.ts` — meme timing evaluator.
- `src/utils/conditions.ts` — pure condition evaluator over state.
- `src/utils/effects.ts` — pure GameEffect applicator.
- `src/utils/poster.ts` — html2canvas wrapper.
- `src/content/constants.json` — attribute ranges and balance constants.
- `src/content/stages.json` — stage definitions and transition rules.
- `src/content/endings.json` — ending conditions and content.
- `src/content/events/index.ts` — event registry merging all route JSON files.
- `src/content/events/undergrad.json`, `postgrad-exam.json`, `job-hunt.json`, `civil-exam.json`, `lie-flat.json`, `common.json` — narrative content.
- `src/components/AttributeBar.tsx` — collapsible 5-attribute bar.
- `src/components/NarrativeBox.tsx` — narrative card with multi-voice rendering and typewriter.
- `src/components/ChoicePanel.tsx` — choice buttons with effect previews and disabled states.
- `src/components/DiceRoll.tsx` — dice animation overlay.
- `src/components/MomentsFeed.tsx` — WeChat-style Moments bottom sheet.
- `src/components/LonelyMoment.tsx` — full-screen quiet overlay.
- `src/components/LifeResume.tsx` — 9:16 poster target for html2canvas.
- `src/screens/TitleScreen.tsx` — route `/`.
- `src/screens/GameScreen.tsx` — route `/game`.
- `src/screens/EndingScreen.tsx` — route `/ending`.
- `src/hooks/useNarrative.ts` — event loop orchestration hook.
- `src/hooks/useDiceAnimation.ts` — dice animation state hook.
- `tests/game-flow.test.tsx` — integration test simulating one full route.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` + `vite.config.ts` + `tsconfig.json` — initialize project with Vite React-TS, install React 19, React Router 7, Zustand 5, Framer Motion, html2canvas, Tailwind CSS, vite-plugin-pwa, Vitest, Testing Library, jsdom, Biome.
- [x] `src/index.css` — import Noto Sans SC + JetBrains Mono, define CSS variables from MASTER.md, add paper grain texture, focus-ring utilities, and `prefers-reduced-motion` rules.
- [x] `src/types.ts` — define `GameEvent`, `Choice`, `GameEffect`, `Condition`, `Stage`, `DiceResult`, `MemeCheck`, `Ending`, and `GameState` interfaces.
- [x] `src/utils/conditions.ts` + `src/utils/effects.ts` — implement pure `evaluateCondition` and `applyEffects` helpers that operate on a plain state snapshot.
- [x] `src/engine/diceRoller.ts` + `src/engine/memeEvaluator.ts` — implement 1-6 dice roll with modifier capping and meme timing evaluator.
- [x] `src/engine/eventEvaluator.ts` — resolve event/choice availability and determine the next event, with fallback to `event_not_found`.
- [x] `src/engine/useGameStore.ts` — create the single Zustand store with five attributes, current stage/event/history, dice state, and actions (`startGame`, `applyEffect`, `navigateTo`, `rollDice`, `setDiceResult`, `resetGame`); guard mental health depletion to route to ending.
- [x] `src/content/constants.json` + `src/content/stages.json` + `src/content/endings.json` — define attribute ranges, seven life stages, and at least four endings (common + route-specific + hidden).
- [x] `src/content/events/*.json` — author sample events covering undergrad intro, route selection, one full route mini-chain, common fallback, and the `event_not_found` fallback.
- [x] `src/content/events/index.ts` — static registry that imports all route JSON files and exposes an `eventsById` map.
- [x] `src/components/AttributeBar.tsx` — render five pills, collapse/expand, color-coded mental health, numeric values in mono font.
- [x] `src/components/NarrativeBox.tsx` — render narrative card, typewriter reveal, multi-voice visual styles (inner/social/meme), `aria-live="polite"`, reduced-motion instant text.
- [x] `src/components/ChoicePanel.tsx` — render 2-4 choice buttons, evaluate visibility/enable conditions, show effect pills, arrow-key navigation.
- [x] `src/components/DiceRoll.tsx` — full-screen scrim, shake/roll animation, result label, auto-dismiss.
- [x] `src/components/MomentsFeed.tsx` — bottom sheet with avatar, stage summary text, and 1-3 friend replies; swipe/tap to dismiss.
- [x] `src/components/LonelyMoment.tsx` — full-screen overlay, no choices, tap/4s timeout to continue, mental-health-dependent text.
- [x] `src/components/LifeResume.tsx` — 9:16 portrait poster with header, key choices, final attributes, ending sticker, and Memphis decorations; serve as html2canvas target.
- [x] `src/screens/TitleScreen.tsx` — logo sticker card, tagline, primary CTA to `/game`, secondary link opening a gameplay bottom sheet.
- [x] `src/screens/GameScreen.tsx` — compose AttributeBar, stage dots, NarrativeBox, ChoicePanel, and overlay mounts for DiceRoll/MomentsFeed/LonelyMoment.
- [x] `src/screens/EndingScreen.tsx` — ending header, description, LifeResume poster, save/share/replay actions.
- [x] `src/hooks/useNarrative.ts` — orchestrate loading an event, running dice, handling choice clicks, applying effects, checking mental health, evaluating stage transitions, and loading the next event.
- [x] `src/hooks/useDiceAnimation.ts` — manage dice animation phases and result state.
- [x] `src/App.tsx` — BrowserRouter with routes `/`, `/game`, `/ending`.
- [x] `tests/game-flow.test.tsx` — simulate a start-to-ending route with mocked dice and assert that the ending screen renders.
- [x] `public/manifest.json` + PWA icons placeholder — enable add-to-home-screen.

**Acceptance Criteria:**
- Given the player opens the deployed app, when they tap "开始游戏", then the GameScreen loads with the first event and all five attributes at their starting values.
- Given an event is displayed, when the player taps a valid choice, then the choice's effects are applied, the attribute bar updates, and the next event (or ending) is loaded without a page reload.
- Given an event has `diceRoll: true`, when the dice animation completes, then the result is stored and used by the condition evaluator for the following choices.
- Given mental health reaches 0 after applying effects, when the check runs, then the app navigates to the EndingScreen before rendering the next event.
- Given a stage transition occurs, when the transition is complete, then a MomentsFeed bottom sheet appears with at least one post and 1-3 friend replies.
- Given the ending screen renders, when html2canvas finishes, then the save and share buttons become enabled.
- Given the player taps "再玩一次", when the action completes, then the store resets and the app returns to the title screen.
- Given `prefers-reduced-motion: reduce`, when narrative text or the dice overlay appears, then typewriter and shake animations are suppressed.
- Given the integration test runs with mocked dice, when it simulates a full route, then it reaches the ending screen and passes.

## Design Notes

- Keep the engine layer (`engine/` and `utils/`) free of React imports so it can be unit-tested in Node and ported later.
- Data flow is unidirectional: content JSON → evaluator → Zustand store → React components. Components never decide what event comes next.
- Use Tailwind custom CSS variables for the scrapbook palette; rely on `box-shadow` for paper cut-out elevation rather than soft drops.
- The LifeResume component should render at 9:16 inside a scrollable container on desktop but remain a fixed portrait card for the html2canvas capture.

## Stage Transition Rules

Stage transitions are validated by the engine to prevent narratively inconsistent jumps. The authoritative transition table lives in `src/engine/eventEvaluator.ts` (`VALID_STAGE_TRANSITIONS`):

| From | Allowed Transitions | Notes |
|------|-------------------|-------|
| `undergrad` | `graduation`, `gap` | 本科毕业后升学或提前躺平 |
| `graduation` | `firstJob`, `postgrad`, `gap` | 路线选择：工作/考研/躺平 |
| `firstJob` | `work`, `gap` | 首份工作可继续或暂时躺平 |
| `postgrad` | `work`, `gap` | 学术经历后进入工业界或 gap |
| `gap` | `work`, `firstJob`, `postgrad` | 可重新进入多条路线 |
| `work` | `retirement`, `gap`, `ending` | 职业生涯可迎来结局 |
| `retirement` | `ending` | 终局 |
| `ending` | (none) | Terminal state |

- Self-transitions (same → same) are always allowed.
- Transitions to earlier life stages (e.g. `work → graduation`) are **forbidden**. The engine silently rejects illegal transitions, preserving the current stage.
- `undergrad → gap` allows players to choose "lie flat" directly from the start without going through graduation events first.
- `work → ending` allows career-stage events to trigger game endings directly (e.g. burnout, retirement decisions).
- The `stages.json` file is for display labels and ordering only; the transition graph in `eventEvaluator.ts` is the single source of truth.

## Verification

**Commands:**
- `pnpm install` — expected: all dependencies resolve without peer conflicts.
- `pnpm dev` — expected: Vite dev server starts and TitleScreen is reachable at `http://localhost:5173`.
- `pnpm build` — expected: production build succeeds with no TypeScript errors.
- `pnpm test` — expected: Vitest runs and `tests/game-flow.test.tsx` passes.
- `pnpm lint` — expected: Biome reports no errors.

**Manual checks:**
- Resize browser to 375px width; verify no horizontal scroll and all touch targets ≥44px.
- Play through one route from title to ending; verify the Life Resume poster renders and the share/save buttons activate.
