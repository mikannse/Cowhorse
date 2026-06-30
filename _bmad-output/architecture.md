---
stepsCompleted: [1, 2, 3, 4, "correct-course", 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/prds/prd-CowHorse-2026-06-23/prd.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-06-23-15-14-06.md'
workflowType: 'architecture'
project_name: 'CowHorse'
user_name: 'BMad'
date: '2026-06-23'
lastStep: 8
status: 'complete'
completedAt: '2026-06-23'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Core Game Concept:**
CowHorse（社畜模拟器）is a narrative-driven choice simulation game starting from the final years of university, following the player through life stages into the workforce. References UnivSimulator's mechanics but set in Chinese "corporate slave" culture with a satirical, meme-rich tone.

**Functional Requirements:**

| Category | Features | Architectural Implications |
|----------|---------|---------------------------|
| Narrative Engine | Event-driven storytelling, multi-layer choice system (daily/major/random/hidden) | Requires event routing engine with conditional triggers |
| Attribute System | 5 attributes (Money/Energy/Skill/Connections/Mental Health), Mental Health as hidden critical path | Inter-attribute coupling + global state machine with zero-tolerance failure |
| Life Stages | 7 stages (Undergrad→Graduation→Postgrad/Work→Gap→First Job→Retirement→Ending) | Stage transitions are a first-class architectural concept |
| Decision Tree | 4 main paths (Postgrad Exam/Job Hunt/Civil Service Exam/Lie Flat) + Major×Career selection | Deep branching narrative data structure design |
| Random System | Fate dice (1-6 roll), hidden event triggers | Hybrid deterministic + random evaluation engine |
| Meme Power System | Context-sensitive meme timing with buff/debuff | Context-aware scoring engine |
| Social System | Auto-generated Moments (WeChat-style posts), virtual friend reactions | Templated content generation + choice influence |
| Ending System | Multiple endings + Life Resume poster (saveable/shareable) | Ending aggregation logic + poster rendering |
| Loneliness Moments | Condition-triggered ritual narrative segments | Advanced conditional trigger patterns |

**Non-Functional Requirements:**
- Platform: Web-first (potential WeChat Mini Program support)
- Session duration: 15-20 minutes per playthrough
- Single-player, offline-capable (can be pure frontend)
- Shareable ending posters (save/screenshot/share)
- Content boundary: unrestrained, humor-consistent
- Replayability: Academic path × Family background × Temporal randomness

### Scale & Complexity

- **Complexity Level**: Medium-High — deep branching narrative + multi-system coupling
- **Technical Domain**: Frontend-heavy + Narrative Engine + State Management
- **Core Components**: Narrative Engine / Attribute System / Event System / Decision Tree Manager / Social Content Generator / Rendering Layer
- **Estimated Components**: 8-12 architectural components
- **Cross-Cutting Concerns**: Game state persistence / Conditional trigger extensibility / Content-code separation

### Technical Constraints & Dependencies

- No backend assumed — pure client-side simulation possible
- Web-first with potential cross-platform (WeChat Mini Program)
- Heavy content volume (dialog, memes, events) needs data-driven approach
- No real-time multiplayer requirements

### Cross-Cutting Concerns Identified

1. **Narrative branch complexity management** — 4 trunks × N sub-branches, must avoid combinatorial explosion
2. **Attribute system coupling** — Mental Health as hidden critical affects all choices, need clean observer/event pattern
3. **Content-code separation** — Extensive dialog, memes, event definitions should be data-driven
4. **Conditional trigger extensibility** — Diverse trigger conditions (attribute thresholds/stage/random/hidden) need unified expression engine
5. **Platform adaptation** — Web-first + potential Mini Program requires sensible abstraction layer

## Starter Template Evaluation

### Primary Technology Domain

Frontend SPA (Single Page Application) — narrative-driven simulation game, no server required.

### Starter Options Considered

Evaluated the following options for a React + Vite + TypeScript stack:

| Option | Verdict |
|--------|---------|
| Official `create vite@latest --template react-ts` | ✅ Selected — minimal, official, always current |
| `@arc234/create-react` (React 19 + Vite 8 + Redux + Tailwind) | ❌ Too opinionated, includes Redux (overkill) |
| `jimmy-guzman/react-starter` (TanStack Router/Query + Tailwind) | ❌ Heavy on routing/query patterns (no server in CowHorse) |
| `create-base-react-app` (Rolldown + React Compiler) | ❌ Cutting-edge but unstable dependencies |

### Selected Starter: Official Vite React-TS

**Rationale for Selection:**
- Minimal overhead — CowHorse is a custom game, not a CRUD app
- Official template means zero dependency risk
- Easy to layer on Zustand, Tailwind, and custom engine without fighting starter opinionation
- Mobile-first responsive design is handled via Tailwind, not framework magic

**Initialization Command:**

```bash
pnpm create vite@latest cowhorse --template react-ts
cd cowhorse
pnpm install
pnpm add react@19 react-dom@19 zustand@5
pnpm add -D @types/react@19 @types/react-dom@19 tailwindcss@latest @tailwindcss/vite@latest
pnpm add vite-plugin-pwa --save-dev
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
TypeScript 6 (strict mode), React 19, Vite 8 dev server with HMR.

**Styling Solution:**
Tailwind CSS v4.3 — CSS-first configuration, mobile-first responsive breakpoints, <10KB production output.

**Build Tooling:**
Vite 8 — instant HMR, code splitting, asset optimization. PWA support via vite-plugin-pwa (add to home screen, offline play).

**Testing Framework:**
Vitest (Vite-native) + React Testing Library for component tests.

**Code Organization:**
```
src/
├── engine/        # 叙事引擎核心 (Zustand stores, evaluators)
├── content/       # 数据驱动的内容文件 (JSON/YAML)
├── components/    # React UI 组件
├── screens/       # 页面级组件 (Title, Game, Ending)
├── hooks/         # 自定义 hooks
└── utils/         # 工具函数
```

**Development Experience:**
- Vite HMR for instant feedback
- Biome for linting + formatting (10× faster than ESLint)
- PWA enabled for mobile "add to homescreen"

**Mobile Adaptation:**
- Tailwind mobile-first breakpoints (`sm:`, `md:`, `lg:`)
- Touch-friendly interaction targets (min 44px)
- PWA support via vite-plugin-pwa
- Future cross-platform path: keep engine layer clean for potential Taro/uni-app port

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Narrative Engine | Custom lightweight engine | Existing VN engines are English-oriented, CowHorse needs Chinese meme culture + unique mechanics (dice, meme power, 5-attribute system) |
| Content Format | JSON data-driven | TypeScript type-safe, strict parsing, easy to author and extend |
| State Persistence | **None (session-only)** | Game is one-session-per-playthrough. Players replay from start for different routes. Zustand without persist middleware. |
| Game Flow | Start → Play → Ending → "Play Again" | Mental health zero = immediate exit ending with Life Resume. No save/load, no continue. |

**Important Decisions (Shape Architecture):**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Condition System | Custom expression evaluator | Unified engine for attribute thresholds / stage / dice / hidden triggers |
| Component Architecture | Screen-based routing | 3 screens: Title / Game / Ending |
| Animation | Framer Motion | Text fade, choice panel slide, dice roll, <15KB gzipped |
| Life Resume Poster | html2canvas | Best shadow/gradient support for meme collage aesthetic |

**Deferred Decisions (Post-MVP):**
| Decision | Rationale |
|----------|-----------|
| WeChat Mini Program port | Dedicated cross-platform effort, content engine layer is clean enough for future migration |
| Content authoring tool | Manual JSON editing is fine for MVP |

### Data Architecture

**Content Data Format:**
- **Format:** JSON with strict TypeScript types
- **Storage:** Static files bundled with Vite (not fetched at runtime for a small game)
- **Structure:**
  ```
  content/
  ├── events/           # Event definitions with choices, conditions, effects
  ├── characters/       # Character profiles and dialogue
  ├── stages/           # Stage definitions and transitions
  ├── endings/          # Ending conditions and content
  └── constants/        # Game balance constants (attribute ranges, dice tables)
  ```

**Game State (Session Only):**
- Zustand store — no persist middleware
- Reset on "New Game" — all attributes, stage, event history cleared
- In-memory throughout a single playthrough (15-20 min session)

**No Backend — No Database:**
- Entire game runs client-side
- No API, no auth, no server
- PWA for mobile add-to-homescreen only

### Authentication & Security

**N/A** — Single-player client-side game. No user accounts, no API, no data transmission.

### API & Communication Patterns

**N/A** — No backend, no API. All game logic is client-side.

### Frontend Architecture

**Routing:**
- React Router v7 with 3 routes: `/` (Title) → `/game` → `/ending`
- No lazy loading needed (tiny app)

**Component Hierarchy:**
```
App
├── TitleScreen        # "开始游戏" + memetic intro
└── GameScreen         # Main game loop
│   ├── NarrativeBox   # Story text display with typewriter effect
│   ├── ChoicePanel    # Player choice buttons (2-4 options)
│   ├── AttributeBar   # 5-attribute display, collapsible on mobile
│   ├── DiceRoll       # Fate dice animation overlay
│   └── MomentsFeed    # Auto-generated WeChat-style Moments posts
└── EndingScreen       # Ending narrative + Life Resume poster
```

**Mobile Adaptation:**
- Tailwind mobile-first: single-column layout, bottom-sheet choices
- 44px+ touch targets, swipe-friendly
- PWA manifest for "Add to Home Screen"

**State Organization (Zustand):**
```typescript
// No persist — session only
interface GameState {
  // Player attributes
  money: number; energy: number; skill: number;
  connections: number; mentalHealth: number;
  
  // Narrative state
  currentStage: Stage;          // undergrad → graduation → work → ...
  currentEventId: EventId;      // current position in decision tree
  eventHistory: EventLog[];     // for condition evaluation & Moments generation
  visitedEvents: Set<EventId>;  // track visited branches
  
  // Dice system
  diceModifiers: DiceModifier[]; // active buffs/debuffs from meme system
  
  // Actions
  applyEffect: (effect: GameEffect) => void;
  navigateTo: (eventId: EventId) => void;
  rollDice: () => DiceResult;
  hasEnded: () => boolean;
}
```

**Poster Generation:**
- html2canvas renders the Life Resume DOM element to PNG
- Scale: 2× for retina quality
- User can save/share the poster image
- No server-side rendering needed

### Infrastructure & Deployment

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Hosting | Cloudflare Pages | Static SPA, unlimited bandwidth, global 330+ PoPs, free tier sufficient |
| CI/CD | GitHub Actions → auto-deploy on push | Simple, free for public repos |
| Domain | Custom domain via Cloudflare | Optional |
| Analytics | None for MVP | Game has no business KPIs |
| Monitoring | None | No server, nothing to monitor |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (Vite + React + TS + Tailwind + Zustand + Framer Motion)
2. Zustand game store (session state, no persist)
3. Content data format (JSON types + schemas)
4. Narrative engine core (event routing, condition evaluator)
5. UI components (NarrativeBox, ChoicePanel, AttributeBar)
6. Game flow (Title → Game → Ending screen routing)
7. Attribute system (5 attributes + mental health zero-tolerance)
8. Dice + meme systems
9. Decision tree content (4 paths)
10. Ending system + Life Resume poster
11. Moments social system
12. Loneliness moments

**Cross-Component Dependencies:**
- Game store is consumed by ALL components — must be defined first
- Content JSON schemas must be stable before event engine implementation
- Event engine doesn't depend on UI components (data → render, not render → data)
- Poster generation depends on ending system + Life Resume component

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas where AI agents could make different choices: content JSON key naming, Zustand action naming, event effect structure, condition expression format, file organization.

### Naming Patterns

**Code Naming Conventions:**
| Category | Convention | Example |
|----------|-----------|---------|
| React Components | PascalCase, default export | `NarrativeBox.tsx` → `export default function NarrativeBox` |
| Utilities/Engine | camelCase file, camelCase function | `eventEvaluator.ts`, `diceRoller.ts` |
| Zustand Store | Single file `useGameStore.ts` | Export `useGameStore` hook |
| Content JSON keys | camelCase | `eventId`, `choiceText`, `attributeEffects` |
| Content JSON files | kebab-case | `postgrad-exam.json`, `first-job.json` |
| Event IDs | snake_case | `exam_apply`, `boss_pua`, `gap_six_months` |
| State properties | camelCase | `mentalHealth`, `currentStage` |
| Store actions | verb + noun | `navigateTo`, `applyEffect`, `rollDice` |
| TypeScript types | PascalCase interfaces | `GameState`, `GameEvent`, `Choice`, `Condition` |
| TypeScript type aliases | PascalCase, \`Type\` suffix optional | `EventId`, `Stage`, `GameEffect` |

### Structure Patterns

**Project Organization:**
```
src/
├── engine/           # Zustand store + evaluators (no React dependency)
│   ├── useGameStore.ts      # Zustand store — single source of truth
│   ├── eventEvaluator.ts    # Condition evaluator (attribute/stage/dice/visited)
│   ├── diceRoller.ts        # Fate dice logic
│   └── memeEvaluator.ts     # Meme power context evaluator
├── content/          # Data-driven JSON content (static files bundled by Vite)
│   ├── events/              # Event definitions per route path
│   │   ├── index.ts         # Event registry — exports all events merged
│   │   ├── postgrad-exam.json
│   │   ├── job-hunt.json
│   │   ├── civil-exam.json
│   │   └── lie-flat.json
│   ├── stages.json          # Stage definitions (display labels + ordering only; transition rules are in eventEvaluator.ts)
│   ├── characters.json      # Character profiles
│   ├── endings.json         # Ending conditions + content
│   └── constants.json       # Attribute ranges, dice tables, balance
├── components/       # React UI components (pure presentational where possible)
│   ├── NarrativeBox.tsx     # Story text display + typewriter effect (Framer Motion)
│   ├── ChoicePanel.tsx      # 2-4 choice buttons, bottom-sheet on mobile
│   ├── AttributeBar.tsx     # 5-attribute display, collapsible on mobile
│   ├── DiceRoll.tsx         # Fate dice animation overlay
│   ├── MomentsFeed.tsx      # Auto-generated WeChat-style Moments posts
│   └── LifeResume.tsx       # Ending Life Resume poster (html2canvas target)
├── screens/          # Page-level components — one per route
│   ├── TitleScreen.tsx      # Route: /
│   ├── GameScreen.tsx       # Route: /game
│   └── EndingScreen.tsx     # Route: /ending
├── hooks/            # Custom React hooks
│   ├── useNarrative.ts      # Orchestrates event → render → choice → next event
│   └── useDiceAnimation.ts  # Dice roll animation state
└── utils/            # Pure utility functions
    ├── effects.ts           # applyEffect — applies GameEffect[] to Zustand state
    └── conditions.ts        # evaluateCondition — evaluates Condition against state
```

**File Structure Rules:**
- Test files co-located with source: `NarrativeBox.test.tsx` next to `NarrativeBox.tsx`
- Content JSON files are static imports (not fetched at runtime)
- No `index.ts` barrel files except for content registry (`content/events/index.ts`)
- CSS: Tailwind utility classes only — no separate `.css` files for components

### Format Patterns

**Content JSON Schemas (Consistency-critical):**

```typescript
// Event — basic narrative unit
interface GameEvent {
  id: EventId;                    // snake_case, unique across all events
  stage: Stage;                   // which life stage this belongs to
  text: string;                   // narrative text (supports {{attr}} interpolation)
  choices: Choice[];              // 2-4 options
  condition?: Condition;          // event availability condition
  diceRoll?: boolean;             // if true, roll dice before showing choices
  memeCheck?: MemeCheck;          // meme power context check
  moment?: MomentTemplate;        // auto-generate Moments post after this event
  lonelyMoment?: string;          // ritual narrative text (shown when conditions met)
}

// Choice — player option within an event
interface Choice {
  text: string;                   // choice display text
  effects: GameEffect[];          // attribute modifiers applied on selection
  nextEventId: EventId;           // where the story goes next
  condition?: Condition;          // visibility/enable condition
}

// GameEffect — attribute modification
interface GameEffect {
  target: 'money' | 'energy' | 'skill' | 'connections' | 'mentalHealth';
  value: number;                  // positive = gain, negative = loss
  label?: string;                 // e.g. "交了房租" — shown in attribute bar animation
}

// Condition — unified trigger expression
interface Condition {
  type: 'attribute' | 'stage' | 'dice' | 'visited' | 'and' | 'or' | 'not';
  // type=attribute: { attr: keyof AttributeMap, operator: 'lt'|'gt'|'gte'|'lte'|'eq', value: number }
  // type=stage:     { stage: Stage }
  // type=dice:      { min: number, max: number }
  // type=visited:   { eventId: EventId }
  // type=and/or:    { conditions: Condition[] }
  // type=not:       { condition: Condition }
}

// DiceResult — outcome of a fate dice roll
interface DiceResult {
  value: number;                  // 1-6
  success: boolean;               // 4-6 = success
  modifier: number;               // meme power modifier applied
}

// MemeCheck — contextual meme timing
interface MemeCheck {
  memeId: string;                 // which meme is referenced
  correctTiming: Condition;       // when using this meme is correct (buff)
  wrongTiming: Condition;         // when using this meme backfires (debuff)
  buff: number;                   // attribute modifier on correct use
  debuff: number;                 // attribute modifier on wrong use
}
```

**JSON Field Format:** All JSON keys use `camelCase`. No exceptions.

**Boolean Representations:** `true`/`false` in TypeScript, not 1/0.

### Communication Patterns

**State Management Patterns:**
- **Single Zustand store** — no slices, no sub-stores. One `useGameStore` for the entire game session.
- **Immutability:** Zustand's built-in immutability via `set()` — no direct mutation.
- **Actions only inside store** — no external action creators. All state transitions are store methods.
- **Selector pattern:** Components use `useGameStore(s => s.attribute)` for granular re-renders — not full store destructuring.
- **No persist middleware** — session only, everything resets on "New Game".

**Event Flow Pattern:**
```
User clicks choice
  → evaluate condition (if any)
  → apply effects to Zustand store
  → check mentalHealth ≤ 0 → trigger ending
  → evaluate memeCheck → apply buff/debuff
  → check diceRoll → show dice animation
  → resolveNextEvent (with error fallback)
  → if STORY_RETURN sentinel, restore saved storyReturnEventId
  → if currentEvent is NOT an encounter itself (chain-prevention guard):
      getRandomEncounter (20% chance; stage-filtered; excludes visited events)
      → if encounter fires: save storyReturnEventId, navigate to encounter
      → encounter's choice returns to saved storyReturnEventId
  → check stage transition: isValidStageTransition(from, to)?
      → valid: setStage + addMoment
      → invalid: skip setStage, preserve current stage
  → navigate to nextEvent.id
  → check lonelyMoment condition → show/hide overlay
```

**Meme Power Flow:**
```
Event with memeCheck triggers
  → evaluate correctTiming / wrongTiming
  → if correct: apply buff, show "😎 接住了！"
  → if wrong: apply debuff, show "😬 冷场了…"
  → if neither: no effect, skip
```

### Process Patterns

**Error Handling:**
- **Content JSON validation:** Parse via TypeScript `satisfies GameEvent[]` at import time. No runtime JSON.parse (static imports with Vite).
- **Missing event fallback:** If `nextEventId` doesn't exist in registry → navigate to `event_not_found` fallback event (a 4th-wall-breaking meme event).
- **Edge case — mental health at zero:** Immediately trigger ending evaluation (not next event). Handled in `useGameStore.applyEffect()` as a guard.
- **Dice roll errors:** `diceRoller.roll()` always returns 1-6. Invalid modifiers cap to [-3, +3].
- **Invalid stage transitions:** Silently rejected — current stage is preserved.
- **Encounter chain prevention:** When `currentEvent.id` starts with `encounter_`, `getRandomEncounter` is NOT called — encounters do not trigger other encounters.
- **Encounter single-play guard:** Each encounter event is only eligible once per game via `!state.visitedEvents.has(event.id)`. After it fires and is resolved, it is removed from the candidate pool.
- **Encounter fire rate:** 20% per eligible story event (`ENCOUNTER_FIRE_CHANCE = 0.2`).

**Loading States:**
- All content is statically imported — no async loading, no spinners.
- The only "loading" in the game is intentional narrative pacing (Framer Motion text fade-in).

**Component Patterns (Mandatory):**
- Every component file must have a single default export.
- Props typed inline via `interface ComponentNameProps`.
- No `React.FC` — use regular function declarations.
- Tailwind classes only — no `style={}` props except for dynamic values (e.g. animation position).
- Mobile-first: every component must be tested at 375px width.

### Enforcement Guidelines

**All AI Agents MUST:**
1. Use `camelCase` for all TypeScript identifiers and JSON keys.
2. Co-locate test files next to source files (`Component.test.tsx`).
3. Use the `Condition` interface for all trigger logic — no ad-hoc condition checks.
4. Never use Zustand persist middleware.
5. Never add a new store — use `useGameStore` only.
6. Prefix event IDs with the route path segment (`exam_`, `job_`, `civil_`, `lie_`).
7. Import content JSON statically — no fetch/ajax/runtime loading.

**Pattern Enforcement:**
- Violations are caught in PR review via Biome linting + manual check of content JSON structure.
- Pattern updates are documented in architecture.md — update the relevant section and note the change date.
- New patterns can be proposed if an AI agent identifies a conflict point not covered here.

### Pattern Examples

**Good Examples:**
```typescript
// ✅ Correct: event JSON with consistent key naming
{
  "id": "exam_register",
  "stage": "undergrad",
  "text": "考研报名开始了，你打开研招网…",
  "choices": [
    {
      "text": "报！冲击985",
      "effects": [{ "target": "energy", "value": -10, "label": "熬夜复习" }],
      "nextEventId": "exam_prepare_985"
    },
    {
      "text": "算了，报个普通的就行",
      "effects": [{ "target": "energy", "value": -5 }],
      "nextEventId": "exam_prepare_normal"
    }
  ]
}

// ✅ Correct: store selector granular
const mentalHealth = useGameStore(s => s.mentalHealth);

// ✅ Correct: condition with nested and/or
{
  "type": "and",
  "conditions": [
    { "type": "attribute", "attr": "energy", "operator": "lt", "value": 20 },
    { "type": "attribute", "attr": "mentalHealth", "operator": "lt", "value": 30 }
  ]
}
```

**Anti-Patterns:**
```typescript
// ❌ Wrong: snake_case in component file
// File: narrative-box.tsx → should be NarrativeBox.tsx

// ❌ Wrong: kebab-case in JSON keys
{ "event_id": "exam_register" }  // → should be "eventId" (not used in content JSON)

// ❌ Wrong: ad-hoc condition check outside Condition interface
if (mentalHealth < 30 && energy < 20) { ... }  // → should use Condition type

// ❌ Wrong: creating a second Zustand store
const useExtraStore = create(...)  // → should extend useGameStore

// ❌ Wrong: using persist middleware
create(persist(...))  // → forbidden — session only

// ❌ Wrong: async import of content
const events = await fetch('/content/events.json')  // → should be static import
```

### Stage Transition Rules

Stage transitions are validated by the engine to prevent narratively inconsistent jumps. The authoritative transition table lives in `src/engine/eventEvaluator.ts`:

| From | Allowed Transitions | Narrative Rationale |
|------|-------------------|-------------------|
| `undergrad` | `graduation` | Linear progression through graduation |
| `graduation` | `firstJob`, `postgrad`, `gap` | Route selection — job, academia, or drift |
| `firstJob` | `work`, `gap` | First job leads to career or burnout/gap |
| `postgrad` | `work`, `gap` | Postgrad leads to industry or gap |
| `gap` | `work`, `firstJob`, `postgrad` | Gap can re-enter at multiple points |
| `work` | `retirement`, `gap` | Career culminates or burns out |
| `retirement` | `ending` | Endgame |
| `ending` | (none) | Terminal |

- Self-transitions (same → same) are always allowed.
- Invalid transitions are silently rejected — the engine preserves the current stage.
- The `stages.json` content file provides display labels and ordering only; it is NOT the source of truth for transition logic.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
cowhorse/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts               # Vite + React + Tailwind + PWA plugin
├── index.html                   # Vite 入口
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI → Cloudflare Pages
├── public/
│   ├── favicon.svg
│   ├── manifest.json            # PWA manifest
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── og-image.png             # 社交分享图
├── src/
│   ├── main.tsx                 # ReactDOM.createRoot 入口
│   ├── App.tsx                  # BrowserRouter + Routes
│   ├── index.css                # Tailwind directives + 全局样式基调
│   ├── vite-env.d.ts            # Vite 类型声明
│   │
│   ├── engine/                  # ⚙️ 叙事引擎核心（无 React 依赖）
│   │   ├── useGameStore.ts      # Zustand store — 单文件
│   │   ├── eventEvaluator.ts    # 条件评估器（attribute/stage/dice/visited）
│   │   ├── diceRoller.ts        # 命运骰子逻辑
│   │   └── memeEvaluator.ts     # 梗力上下文评估
│   │
│   ├── content/                 # 📦 数据驱动内容（静态 JSON）
│   │   ├── events/
│   │   │   ├── index.ts         # 事件注册表 — 合并所有路线事件
│   │   │   ├── common.json      # 共享事件（孤独时刻、彩蛋等）
│   │   │   ├── undergrad.json   # 本科阶段事件
│   │   │   ├── postgrad-exam.json
│   │   │   ├── job-hunt.json
│   │   │   ├── civil-exam.json
│   │   │   └── lie-flat.json
│   │   ├── stages.json          # 阶段定义（仅显示标签和排序；转场规则在 eventEvaluator.ts）
│   │   ├── characters.json      # 角色配置
│   │   ├── endings.json         # 结局条件 + 内容
│   │   └── constants.json       # 属性范围、骰子表、平衡参数
│   │
│   ├── components/              # 🧩 React 组件
│   │   ├── NarrativeBox.tsx     # 叙事文本 + 打字机效果
│   │   ├── NarrativeBox.test.tsx
│   │   ├── ChoicePanel.tsx      # 选择面板（2-4选项，移动端底部弹出）
│   │   ├── ChoicePanel.test.tsx
│   │   ├── AttributeBar.tsx     # 5属性条（移动端可折叠）
│   │   ├── AttributeBar.test.tsx
│   │   ├── DiceRoll.tsx         # 命运骰子动画覆盖层
│   │   ├── DiceRoll.test.tsx
│   │   ├── MomentsFeed.tsx      # 自动生成朋友圈
│   │   ├── MomentsFeed.test.tsx
│   │   ├── LonelyMoment.tsx     # 孤独时刻覆盖层
│   │   ├── LifeResume.tsx       # 人生简历海报（html2canvas 目标）
│   │   └── LifeResume.test.tsx
│   │
│   ├── screens/                 # 🖥️ 页面级组件
│   │   ├── TitleScreen.tsx      # 路由 /
│   │   ├── GameScreen.tsx       # 路由 /game
│   │   └── EndingScreen.tsx     # 路由 /ending
│   │
│   ├── hooks/                   # 🪝 自定义 hooks
│   │   ├── useNarrative.ts      # 事件循环编排器
│   │   └── useDiceAnimation.ts  # 骰子动画状态
│   │
│   └── utils/                   # 🛠️ 纯工具函数
│       ├── effects.ts           # applyEffect — 应用 GameEffect[]
│       ├── conditions.ts        # evaluateCondition — 评估 Condition
│       ├── poster.ts            # html2canvas 封装
│       └── formatters.ts        # 数字格式化、文案模板插值
│
└── tests/                       # 🔬 集成测试
    └── game-flow.test.tsx       # 游戏全流程集成测试
```

### Architectural Boundaries

**Component Boundaries:**
```
┌─────────────────────────────────────────────────────┐
│                  GameScreen                          │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │NarrativeBox│  │ChoicePanel │  │ AttributeBar  │  │
│  │  ← 文本    │  │  点击选择  │  │ ← 属性更新    │  │
│  └──────┬─────┘  └─────┬──────┘  └───────┬───────┘  │
│         │              │                  │           │
│         └──────┬───────┘                  │           │
│                │ useNarrative hook        │           │
│                ▼                          │           │
│         ┌──────────┐                     │           │
│         │ GameStore │ ← ← ← ← ← ← ← ← ← ←           │
│         │ (Zustand) │                     │           │
│         └────┬─────┘                     │           │
│              │                           │           │
│         ┌────▼─────┐  ┌──────────┐       │           │
│         │Evaluator │  │DiceRoller│       │           │
│         └──────────┘  └──────────┘       │           │
│  ┌────────────┐  ┌──────────────┐        │           │
│  │MomentsFeed │  │LonelyMoment  │         │           │
│  │  ← store   │  │  ← condition │        │           │
│  └────────────┘  └──────────────┘        │           │
└─────────────────────────────────────────────────────┘
         ↑ statically imported
    ┌────┴────┐
    │ content │ JSON → TypeScript types
    └─────────┘
```

**Communication Rules:**
- **Data flow is unidirectional:** Content JSON → Event Evaluator → Zustand Store → React Components (one-way down)
- **Components never modify store directly:** All state changes go through `useGameStore.applyEffect()`
- **Renderers contain no branching logic:** NarrativeBox only displays text — it never decides what comes next
- **Event loop lives in the hook layer:** `useNarrative` orchestrates event → render → choice → next event
- **Engine has zero React dependency:** `engine/` and `utils/` are pure TypeScript, independently testable and portable

**No API Boundaries (N/A):** Single-player client-side game with no backend.

**No External Integrations (N/A):** No third-party services. html2canvas runs locally in-browser.

### Requirements to Structure Mapping

| Requirement | Location | Key Files |
|-------------|----------|-----------|
| Narrative engine (event routing, condition eval) | `src/engine/` | `useGameStore.ts`, `eventEvaluator.ts` |
| Content data (events, characters, stages) | `src/content/` | `events/*.json`, `stages.json`, `endings.json` |
| Story text display | `src/components/` | `NarrativeBox.tsx` |
| Choice interaction | `src/components/` | `ChoicePanel.tsx` |
| Attribute display | `src/components/` | `AttributeBar.tsx` |
| Fate dice | `src/components/` + `src/engine/` | `DiceRoll.tsx` + `diceRoller.ts` |
| Meme power system | `src/engine/` | `memeEvaluator.ts` |
| Moments social feed | `src/components/` | `MomentsFeed.tsx` |
| Loneliness ritual moments | `src/components/` | `LonelyMoment.tsx` |
| Life Resume poster | `src/components/` + `src/utils/` | `LifeResume.tsx` + `poster.ts` |
| Title screen | `src/screens/` | `TitleScreen.tsx` |
| Main game loop screen | `src/screens/` | `GameScreen.tsx` |
| Ending screen | `src/screens/` | `EndingScreen.tsx` |
| Game flow orchestration | `src/hooks/` | `useNarrative.ts` |

### File Organization Patterns

**Configuration Files (root):**
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (dev/build/preview) |
| `vite.config.ts` | Vite config + React plugin + Tailwind plugin + PWA plugin |
| `tsconfig.json` | TypeScript strict mode config |
| `index.html` | Vite SPA entry point |
| `.github/workflows/deploy.yml` | CI: build → Cloudflare Pages deploy |

**Source Organization:**
- `engine/` — Pure TypeScript, zero React imports. Testable in Node.js without DOM.
- `content/` — JSON only + `index.ts` barrel export. No logic.
- `components/` — React components, each self-contained with co-located test.
- `screens/` — Page-level composition. Imports components, connects hooks.
- `hooks/` — React hooks bridging engine ↔ components.
- `utils/` — Pure functions, zero side effects.

**Test Organization:**
- Unit tests: co-located with source files (`NarrativeBox.test.tsx`)
- Integration test: `tests/game-flow.test.tsx` — simulates a full playthrough
- No separate `__tests__` directories (consistent co-location)

**Asset Organization:**
- `public/icons/` — PWA icons (generated or hand-crafted PNGs)
- `public/manifest.json` — PWA manifest (hand-authored)
- PWA service worker: auto-generated by vite-plugin-pwa (no manual SW file)

### Development Workflow Integration

**Dev Commands:**
```bash
pnpm dev        # Vite HMR dev server
pnpm build      # Production build → dist/
pnpm preview    # Preview production build locally
pnpm test       # Vitest
pnpm lint       # Biome
pnpm format     # Biome --write
```

**Build Process:**
- `vite build` outputs to `dist/` — pure static files (HTML + JS + CSS + assets)
- Content JSON is bundled by Vite's import analysis — no runtime fetch
- PWA service worker generated by vite-plugin-pwa

**Deployment:**
- Cloudflare Pages: `pnpm build` → publish `dist/`
- GitHub Actions on push to main branch
- No server, no environment variables, no build secrets needed

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible: React 19 + Vite 8 + Zustand 5 + Tailwind v4.3 + Framer Motion — versions verified, stack well-tested.

**Pattern Consistency:**
Naming conventions are consistent across all domains (camelCase for TS/JSON, PascalCase for components, snake_case for event IDs). Communication patterns (unidirectional data flow) match React best practices.

**Structure Alignment:**
Directory structure precisely maps to architectural layers. Boundaries between engine/hooks/components are well-defined. Static content separation is maintained. Engine layer has zero React dependency.

### Requirements Coverage Validation ✅

**Brainstorming Feature Coverage:**
19/19 design ideas from brainstorming session are architecturally supported:
- 7 features directly map to engine components or UI components
- 12 features are content-layer concerns supported by the JSON data architecture

**Functional Requirements Coverage:**
All FR categories from requirements analysis are covered: narrative engine, attribute system, life stages, decision tree, random system, meme power, social system, ending system, loneliness moments.

**Non-Functional Requirements Coverage:**
- Platform: Web-first with clean engine layer for future WeChat Mini Program port
- Session duration: 15-20 min — no persist needed, session-only state
- Offline-capable: PWA + static content bundling
- Shareable posters: html2canvas 2× retina rendering
- Replayability: Full state reset on "New Game", randomness via dice + conditions

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions documented with rationale. Tech stack versions specified. Implementation sequence defined with cross-component dependencies.

**Structure Completeness:**
Complete directory structure with every file named. Component boundaries established. Integration points mapped. Requirements-to-structure mapping complete.

**Pattern Completeness:**
All 5 potential conflict points addressed. Naming/Structure/Format/Communication/Process patterns fully specified with examples and anti-patterns.

### Gap Analysis Results

| Severity | Gap | Resolution |
|----------|-----|------------|
| 🟡 Minor | Missing explicit type definitions: `Stage`, `EventLog`, `MomentTemplate`, `DiceModifier` | Document types in constants.json or types.ts — tracked in Implementation Step 2 (Zustand store) |
| 🟡 Minor | `init` command incomplete: missing `react-router-dom`, `framer-motion`, `html2canvas`, `biome`, `@testing-library/react` | Full dependency list should be in implementation handoff, not init command |
| 🟢 Nice-to-have | `App.tsx` routing orchestration not defined in architecture | Intentionally deferred — it's a 5-line Router implementation detail |
| 🟢 Nice-to-have | No explicit PWA offline strategy | vite-plugin-pwa generateSW default strategy is sufficient for MVP |

### Validation Issues Addressed

No critical or blocking issues found. Minor documentation gaps noted above are captured in the implementation sequence and will be resolved during Implementation Steps 1-2.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

All 16 checklist items verified. No critical gaps remain. The architecture is complete, coherent, and ready to guide AI agent implementation.

**Confidence Level:** High — comprehensive validation across all dimensions

**Key Strengths:**
- Clean separation between content data and rendering logic
- Session-only state model eliminates complexity of persistence
- Unidirectional data flow ensures predictable debugging
- Mobile-first design without SSR or backend overhead
- Content-code separation enables non-developer narrative authoring

**Areas for Future Enhancement:**
- Visual style guide (collage/meme aesthetic) — visual design specification
- Content authoring tooling — JSON editor or spreadsheet-to-JSON pipeline
- WeChat Mini Program port — once web version is stable
- Analytics for playthrough patterns — post-MVP if desired

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- Implementation sequence steps 1-12 must be followed in order

**Full Dependency List for Project Init:**
```bash
# Core
pnpm add react@19 react-dom@19 zustand@5 react-router-dom@7 framer-motion@latest html2canvas@latest

# Dev
pnpm add -D @types/react@19 @types/react-dom@19 \
  tailwindcss@latest @tailwindcss/vite@latest \
  vite-plugin-pwa@latest \
  vitest@latest @testing-library/react@latest @testing-library/jest-dom@latest jsdom@latest \
  @biomejs/biome@latest
```

**First Implementation Priority:**
Project initialization (Step 1) — `pnpm create vite@latest cowhorse --template react-ts` with full dependency list above. Then immediately implement Zustand game store (Step 2) which all other components depend on.
