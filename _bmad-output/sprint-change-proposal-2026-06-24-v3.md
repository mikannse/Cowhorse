# Sprint Change Proposal — Major×Career Industry Differentiation

**Date:** 2026-06-24
**Project:** CowHorse（社畜模拟器）
**Trigger:** 职业和行业界限不明确，剧情不够多样 — 选择法学专业但职业发展路径未体现行业差异

## Section 1: Issue Summary

### Problem Statement

CowHorse 的"专业选择"与"职业发展"之间存在严重的叙事断裂。

玩家在 `choose_major` 事件中从 6 个专业（CS/金融/医学/土木/法学/文史哲）中选择其一，但主线职业事件（`job-hunt.json`）完全通用，不区分玩家所学专业。具体问题：

1. **职业与行业无映射** — 选择"法学"后，求职→入职→转正→晋升→职业危机的一套主线内容与选择"计算机"或其他专业的玩家完全相同
2. **内容偏向程序员视角** — 现有 job-hunt 内容隐含大量编程/互联网语境（LeetCode、CRUD、开源项目 star、技术债务等）
3. **剧情多样性不足** — 6 个专业只影响初始 intro 事件和少数 random encounter，主线叙事分支度低
4. **重玩性受限** — 更换专业重新开局后，体验不到本质不同的职业发展线

### Evidence

- 现有事件链：`undergrad_start → job_intro → job_waiting → job_interview → job_offer → job_first_day → job_three_months → ...` 完全通用
- `common.json` 中有 5 个专业专属遭遇事件（`encounter_tech_leetcode`/`encounter_finance_bonus_season`/`encounter_med_first_surgery`/`encounter_eng_site_crisis`/`encounter_law_bar_exam`/`encounter_art_breakthrough`），但这只是"偶尔触发"的补充，非主线
- `spec-cowhorse.md` CAP-6 描述了 "Branching route skeleton" 和 "Major × Career selection system"，但当前实现中该机制不存在

## Section 2: Impact Analysis

### SPEC Capability Impact

| CAP | Impact | Detail |
|-----|--------|--------|
| **CAP-6: Branching route skeleton** | 🔴 Core | Major × Career 需要从"声明"到"实现"的完整设计 |
| **CAP-5: Life stage progression** | 🟡 Indirect | firstJob → work 阶段需按行业分化 |
| **CAP-10: Multiple endings** | 🟡 Indirect | endings 需增加行业专属结局 |

### Artifact Impact

| Artifact | Change Required | Effort |
|----------|----------------|--------|
| `src/types.ts` | Add `Major` type, `GameState.major` field, `Condition` union type | 🟢 Small |
| `src/engine/useGameStore.ts` | Add major/industry state, set on major-selection events | 🟢 Small |
| `src/utils/conditions.ts` | Add `evaluateMajorCondition()` | 🟢 Small |
| `content/events/index.ts` | Import industry event files | 🟢 Small |
| `content/events/job-hunt.json` | Convert to CS-industry default, extract generic parts | 🟡 Medium |
| `content/events/industry/cs.json` | CS career chain (8-15 events) | 🔴 Large |
| `content/events/industry/law.json` | Law career chain (8-15 events) | 🔴 Large |
| `content/events/industry/med.json` | Medical career chain (8-15 events) | 🔴 Large |
| `content/events/industry/finance.json` | Finance career chain (8-15 events) | 🔴 Large |
| `content/events/industry/eng.json` | Engineering career chain (8-15 events) | 🔴 Large |
| `content/events/industry/art.json` | Art career chain (8-15 events) | 🔴 Large |
| `src/hooks/useNarrative.ts` | Add major-aware event routing for `job_intro` | 🟢 Small |
| `architecture.md` | Update data model, content structure, state definition | 🟢 Small |
| `spec-cowhorse.md` | Update CAP-6 definition | 🟢 Small |
| `tests/game-flow.test.tsx` | Add industry-route tests | 🟡 Medium |
| `CLAUDE.md` | Update project structure section | 🟢 Small |

### Technical Complexity Assessment

**Engine layer:** Low — Zustand store extension + condition evaluator addition. Total ~30-50 lines.
**Content layer:** High — ~60-90 new events across 6 industries. Content authoring effort dominates.
**Integration:** Low — existing event routing and condition system accommodate the change naturally.
**Risk:** Low — backward compatible, no existing functionality changes.

## Section 3: Recommended Approach

**Path: Direct Adjustment** — 在现有架构上扩展，不破坏已有功能。

### Rationale

1. **引擎层改动极小** — Zustand 加字段 + 条件评估器加一个 `type: 'major'` 分支，20-30 行代码
2. **内容层改动量大但架构清晰** — 6 个行业各一套 JSON 文件，独立维护
3. **条件系统已可支持** — 现有 `Condition` 树形结构天然适合按行业筛选
4. **MVP 可分批交付** — 内容创作量大的行业可以在后续迭代中补充

### Phased Delivery Plan

| Phase | Scope | Events | Dependency |
|-------|-------|--------|------------|
| 🔵 Phase 1 | Engine layer: store + conditions + router | 0 | None |
| 🟢 Phase 2 | CS (现有可重用) + Law + Med | ~30-40 | Phase 1 |
| 🟡 Phase 3 | Finance + Eng + Art | ~30-40 | Phase 2 |
| 🟠 Phase 4 | Civil-exam + postgrad-exam path enhancement | ~15-20 | Phase 2 |
| 🔴 Phase 5 | Industry-specific endings + Life Resume fields | ~6-10 | Phase 3 |

### Effort Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1 (Engine) | Low (hours) | Low |
| Phase 2 (3 industries) | Medium (1-2 days) | Low |
| Phase 3 (3 industries) | Medium (1-2 days) | Low-Medium |
| Phase 4 (Cross-paths) | Medium (1 day) | Low |
| Phase 5 (Endings) | Low (hours) | Low |
| **Total** | **~3-5 days** | **Low-Medium** |

## Section 4: Detailed Change Proposals

### Proposal #1: Engine Layer

**Files:** `src/types.ts`, `src/engine/useGameStore.ts`, `src/utils/conditions.ts`

**`src/types.ts` — Add:**
```typescript
type Major = 'cs' | 'finance' | 'med' | 'eng' | 'law' | 'art';

// Extend Condition union:
type ConditionType = 'attribute' | 'stage' | 'dice' | 'visited' | 'major' | 'and' | 'or' | 'not';

// Add major condition shape:
// type=major: { major: Major | Major[] }
```

**`src/engine/useGameStore.ts` — Extend GameState:**
```typescript
interface GameState {
  // ... existing fields
  major: Major | null;
}
```
- `startGame()`: Reset major to null
- Major set by event evaluator when processing major-selection events (via action `setMajor`)

**`src/utils/conditions.ts` — Add evaluator:**
```typescript
case 'major':
  return Array.isArray(cond.major)
    ? cond.major.includes(state.major)
    : state.major === cond.major;
```

### Proposal #2: Content Architecture

**New file structure:**
```
content/events/industry/
  ├── cs.json
  ├── finance.json
  ├── med.json
  ├── eng.json
  ├── law.json
  └── art.json
```

**`content/events/index.ts` — Add imports:**
```typescript
import csEvents from './industry/cs.json';
import financeEvents from './industry/finance.json';
// ... etc
```

### Proposal #3: Event Routing

**`job_intro` event — Add major-aware routing:**

```json
{
  "id": "job_intro",
  "stage": "graduation",
  "text": "你打开招聘软件，[已读不回] 四个字成了你最熟悉的问候……",
  "choices": [
    {
      "text": "开始投简历",
      "effects": [],
      "nextEventId": "__route_by_major__"  // sentinel — runtime routes by major
    }
  ]
}
```

`useNarrative.ts` 中添加路由逻辑：当 `nextEventId === '__route_by_major__'` 时，根据 `state.major` 映射到 `{major}_job_intro`。

### Proposal #4: Industry-Specific Content (Law Example)

以法学为例，展示区别于当前 CS 默认线的叙事方向：

```
law_job_intro       → "法考成绩还没出，你已经投了十几家律所……"
law_job_interview   → "合伙人面试。对面坐着两个律师，一个在翻你的简历…"
law_job_offer       → "拿到了一家精品所的实习offer。工资3500，不包吃…"
law_job_first_day   → "第一天上班，带你的是个执业八年的律师……"
law_handle_cases    → "你的第一个案子是一起合同纠纷……"
law_boss_mentor     → "带教律师对你的工作很满意/不满意……"
law_stress_burnout  → "连续加班到凌晨，卷宗堆满了办公桌……"
law_career_cross    → "执业满三年了：独立执业 vs 跳公司法务 vs 考公……"
```

每个行业的事件链呼应其特有的文化符号：
- **CS**: LeetCode、PR Review、Oncall、架构重构、35岁危机
- **Law**: 法考、律所面试、案源焦虑、开庭、法律意见书
- **Med**: 规培、夜班、医患关系、论文、晋职称
- **Finance**: CFA、路演、KPI、应酬、周期波动
- **Eng**: 一建证、工地、甲方、回款、行业下行
- **Art**: 作品集、甲方改稿、AI冲击、自由职业焦虑

## Section 5: Implementation Handoff

### Change Scope Classification: **Moderate**

Engine changes are minor but content creation (50-90 events) requires significant authoring effort.

### Handoff Plan

| Phase | Route To | Deliverables |
|-------|----------|-------------|
| Phase 1 (Engine) | Developer Agent | 1. Add Major type<br>2. Extend GameState<br>3. Add condition evaluator<br>4. Add major routing in useNarrative |
| Phase 2 (CS+Law+Med) | Developer Agent / Content Author | 1. Create 3 industry JSON files<br>2. Update event registry<br>3. Update tests |
| Phase 3-5 | Iterative follow-up | Remaining content + endings |

### Success Criteria

1. Player selects major → subsequent job events are filtered/rerouted to industry-specific content
2. Law-graduate player sees law-firm job search, not LeetCode interviews
3. Each of the 6 majors maps to a distinct career chain with at least 8 unique events
4. All existing generic paths (civil-exam, postgrad-exam, lie-flat) continue to work with minor-aware adjustments
5. Integration test covers at least one industry-specific route
6. `pnpm build` + `pnpm test` passes after all changes

## Approval

**Status:** [ ] Pending / [x] Approved / [ ] Revise

**Next Steps:** Engine layer implementation → CS/Law/Med content authoring → Remaining industries
