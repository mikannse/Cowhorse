---
project: CowHorse
slug: cowhorse
date: 2026-06-24
companions:
  - ../architecture.md
  - narrative-voice.md
  - DESIGN.md
sources:
  - ../brainstorming/brainstorming-session-2026-06-23-15-14-06.md
assumptions:
  - The target platform is web-first; WeChat Mini Program support is explicitly post-MVP.
  - A single playthrough is intentionally one session with no persistence, matching the replay-for-routes design intent.
  - All narrative content will be authored as static JSON and bundled at build time (no runtime CMS or fetch).
open_questions: []
---

# SPEC — CowHorse（社畜模拟器）

## Why

CowHorse is a narrative-driven choice simulation that follows a Chinese university student from their final undergraduate years into the workforce. It satirizes "corporate slave" culture through a meme-rich, collage-style visual tone and asks the player to trade short-term social approval against long-term mental health. The goal is a replayable, shareable web game that makes players laugh, then quietly recognize themselves.

## Capabilities

### CAP-1: Event-driven narrative engine
- **Intent:** Drive the story through discrete events that present 2-4 choices and route to the next event based on the player's selection.
- **Success:** The engine can load an event, render its text and choices, apply effects, and advance to the next event without any rendering component deciding what comes next.

### CAP-2: Multi-layer choice system
- **Intent:** Combine daily choices, major life decisions, random events, and hidden triggers so the player feels high agency without combinatorial explosion.
- **Success:** Every event declares its layer (daily/major/random/hidden) in content JSON, and the engine uses a unified condition expression type for all visibility and trigger logic.

### CAP-3: Five-attribute life simulation
- **Intent:** Track Money, Energy, Skill, Connections, and Mental Health as the core resource model.
- **Success:** The game store exposes all five attributes, applies typed attribute modifiers atomically, and supports granular reads by any consumer.

### CAP-4: Mental health as hidden critical path
- **Intent:** Make Mental Health the only attribute whose depletion immediately ends the run, turning every major choice into a "self-care vs. external expectation" trade-off.
- **Success:** Mental Health depletion is detected immediately after effect application and routes directly to ending evaluation before the next event is rendered.

### CAP-5: Life stage progression
- **Intent:** Structure the run into seven stages — Undergrad, Graduation, Postgrad/Work, Gap, First Job, Retirement, and Ending — each with stage-specific content and transition rules.
- **Success:** Current stage is a first-class state field; stage transitions are evaluated by the condition system and logged in event history.

### CAP-6: Branching route skeleton
- **Intent:** Offer four main post-graduation routes (Postgrad Exam, Job Hunt, Civil Service Exam, Lie Flat) plus a Major × Career selection system that opens or closes mid-game branches, including morally ambiguous choices.
- **Success:** Content JSON is split by route, event IDs are prefixed by route segment, and a player can reach visibly different outcomes — including common, route-specific, and rare easter-egg endings — by choosing different routes.

### CAP-7: Fate dice system
- **Intent:** Inject time-based randomness into important events so the player controls reaction, not outcome.
- **Success:** A dice roll produces a 1-6 value with optional capped modifier; results feed the condition evaluator and are surfaced by a dice animation overlay.

### CAP-8: Meme power system
- **Intent:** Turn internet memes and catchphrases into a context-sensitive mechanic: correct timing yields a buff, wrong timing backfires.
- **Success:** Events can declare meme opportunities with correct-timing and wrong-timing conditions; matching the correct context improves attributes and mismatched context harms them, with a short on-screen reaction for each.

### CAP-9: Auto-generated social Moments feed
- **Intent:** Summarize each life stage as a WeChat-style Moments post with virtual friend reactions that vary by player choices.
- **Success:** The Moments feed reads event history and stage transitions, generates at least one post per stage, and displays friend replies drawn from a templated content bank.

### CAP-10: Multiple endings with Life Resume poster
- **Intent:** Reward replayability with distinct endings — common, route-specific, and rare easter-egg outcomes — and a saveable/shareable "Life Resume" poster that captures the run's key choices.
- **Success:** The ending system evaluates ending conditions from the content data; the Life Resume component renders the poster and exports it as a 2× retina PNG suitable for saving or sharing.

### CAP-11: Loneliness ritual moments
- **Intent:** Provide quiet, choice-free narrative beats when the player is alone, under pressure, and socially isolated.
- **Success:** A loneliness overlay is triggered by a condition combining low social activity, late-night stage context, and high stress; it shows different text based on current Mental Health.

## Constraints

- **Platform:** Web-first responsive SPA, mobile-first baseline 375px, PWA-enabled for offline play and "add to home screen."
- **Runtime:** Pure client-side; no backend, API, auth, database, or real-time multiplayer.
- **Session model:** One-session-per-playthrough; no save, load, continue, or persistence middleware. State resets on "New Game."
- **Content model:** All narrative data, balance constants, stages, endings, and characters are static JSON bundled at build time; no runtime fetch or CMS.
- **Engine coupling:** The engine layer (`engine/` and `utils/`) must have zero React dependency so it can be tested in Node and ported later.
- **State management:** Exactly one Zustand store (`useGameStore`); no secondary stores and no persist middleware.
- **Styling:** Tailwind CSS utility classes only; no per-component `.css` files except `index.css` for global directives and base tone.
- **Naming:** `camelCase` for TypeScript identifiers and JSON keys; `PascalCase` for React components and TS types; `snake_case` for event IDs; `kebab-case` for content filenames.
- **Cross-platform future:** Keep the engine layer clean enough to support a future WeChat Mini Program port without rewriting core logic.

## Non-goals

- WeChat Mini Program support in the MVP.
- Save/load slots, continue game, or any form of cross-session persistence.
- Backend services, user accounts, leaderboards, or multiplayer.
- Server-side rendering or edge rendering.
- Analytics, monitoring, or business KPI tracking.
- A visual-novel engine plugin or off-the-shelf narrative framework; the engine is custom to support Chinese meme culture and the five-attribute model.
- A content authoring tool or spreadsheet-to-JSON pipeline; manual JSON editing is acceptable for MVP.

## Success signal

A player can open the deployed PWA, start a new game, complete a 15-20 minute playthrough from title screen to ending, reach at least four visibly different endings by choosing different routes, and save/share a Life Resume poster. The integration test in `tests/game-flow.test.tsx` passes by simulating one full route without runtime network requests.
