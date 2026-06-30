---
title: Sprint Change Proposal
project: CowHorse
date: 2026-06-24
status: approved
change_scope: minor
---

# Sprint Change Proposal — 遭遇战链式触发与频率优化

## 1. Issue Summary

**问题描述：** 遭遇战（Random Encounter）系统在 `handleChoice` 中每次选择后都会检查是否触发新遭遇战，包括在遭遇战自身解决时。加上 `getRandomEncounter()` 未检查事件是否已被访问过，导致：

- 毕业（graduation）阶段遭遇战反复触发，卡在毕业旅行/宿舍告别事件上无法推进主线
- 遭遇战可无限链式触发：遭遇战A → 解决 → 再次检查 → 遭遇战B → 解决 → 再次检查 → 遭遇战A...
- 30% 触发频率偏高，破坏剧情连贯性

**发现方式：** 用户反馈 + 代码审查——定位到 `useNarrative.ts:handleChoice` 和 `eventEvaluator.ts:getRandomEncounter` 的缺陷。

**类型：** 引擎逻辑缺陷。

## 2. Impact Analysis

### Artifact Conflicts

- [x] `useNarrative.ts` — `handleChoice` 缺少"是否正在解决遭遇战"的守卫检查
- [x] `eventEvaluator.ts` — `getRandomEncounter` 未过滤已访问事件
- [ ] 架构文档 — 需补充遭遇战不链式触发的设计约定（后续更新）
- [ ] UI/UX — 无影响
- [ ] 事件 JSON — 无影响

### Technical Impact

- **useNarrative.ts**: 新增 3 行守卫代码（阻止链式触发）
- **eventEvaluator.ts**: 新增 1 行已访问检查 + 修改 1 个常量（30%→20%）
- **测试**: 现有测试全部通过，无回归

## 3. Recommended Approach

**路径：** Direct Adjustment — 直接修改。

| 评估 | 结果 |
|------|------|
| 可行性 | ✅ 可行 — 修改范围明确，3 处小改动 |
| 工作量 | Low — 引擎层 ~5 行 |
| 风险 | Low — 不影响 UI，测试通过 |
| 时间影响 | < 30 分钟 |

## 4. Detailed Change Proposals

### Proposal A: 阻止遭遇战链式触发（核心修复）

**文件:** `src/hooks/useNarrative.ts`

**变更：**
```typescript
// Before:
const encounter = getRandomEncounter(eventsById, selectSnapshot(fresh));

// After:
const encounter = currentEvent.id.startsWith('encounter_')
  ? null
  : getRandomEncounter(eventsById, selectSnapshot(fresh));
```

**理由：** 当 `currentEvent` 本身就是遭遇战时，解决后应直接返回主线剧情，而不是再次触发新遭遇战。

### Proposal B: 遭遇战已访问检查

**文件:** `src/engine/eventEvaluator.ts`

**变更：**
```typescript
// Before:
event.id.startsWith('encounter_') &&
event.stage === state.currentStage &&
isEventAvailable(event, state)

// After:
event.id.startsWith('encounter_') &&
event.stage === state.currentStage &&
!state.visitedEvents.has(event.id) &&
isEventAvailable(event, state)
```

**理由：** 同一场遭遇战在一局游戏中只应出现一次。访问过后从候选池中移除。

### Proposal C: 降低遭遇战触发频率

**文件:** `src/engine/eventEvaluator.ts`

**变更：**
```typescript
// Before:
const ENCOUNTER_FIRE_CHANCE = 0.3;

// After:
const ENCOUNTER_FIRE_CHANCE = 0.2;
```

**理由：** 20% 触发率在保留随机惊喜感的同时减少打断感。

## 5. Implementation Handoff

**Scope Classification:** Minor — 可直接由 Developer agent 实施。

| 步骤 | 内容 | 状态 |
|------|------|------|
| 1 | 修改 `useNarrative.ts` 添加遭遇战守卫 | ✅ 已完成 |
| 2 | 修改 `eventEvaluator.ts` 添加 visited 检查 | ✅ 已完成 |
| 3 | 修改 `eventEvaluator.ts` 降低触发频率 | ✅ 已完成 |
| 4 | 验证编译 (tsc --noEmit) | ✅ 通过 |
| 5 | 验证测试 (vitest run) | ✅ 通过 |

**Success Criteria:**
- TypeScript 编译无错误 ✅
- 测试全部通过 ✅
- 毕业阶段不会反复触发毕业旅行/宿舍告别 ✅（链式阻止）
- 同一遭遇战不会在单局中重复出现 ✅（visited 检查）
- 遭遇战触发频率降低，主线剧情推进更流畅 ✅（20%）

## 6. 测试修复说明

测试 `tests/game-flow.test.tsx` 使用 `Math.random = 0.9` 模拟（所有骰子结果为 6）。三个修改后：

- 遭遇战仍然会在每条主线事件后触发（只触发一次，visited 后不再触发）
- 当阶段内的遭遇战全部触发后，主线事件直接推进
- 测试的 `waitFor` 超时机制处理了额外的遭遇战步骤
- 总执行时间仍在超时限制内
