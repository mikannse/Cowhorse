---
title: Sprint Change Proposal
project: CowHorse
date: 2026-06-24
status: approved
change_scope: minor
---

# Sprint Change Proposal — Event Stage 标注规范化与引擎校验

## 1. Issue Summary

**问题描述：** 游戏事件 JSON 中的 `stage`（人生阶段）字段标注不一致，引擎也未对阶段转换做合法性校验。导致：
- `civil_three_years`（三年体制内经历）标注为 `firstJob`（第一份工作）
- `civil_promotion_chance`（提副科）和 `civil_ethics_test`（行贿测试）同样标注在错误的阶段
- 引擎在阶段转换时直接调用 `setStage()`，不做任何校验，允许叙事上不合理的阶段跳转

**发现方式：** 代码审查——分析全部 6 个事件 JSON 文件的 stage 分布后发现问题。

**类型：** 内容数据一致性 + 引擎缺失校验。

## 2. Impact Analysis

### Artifact Conflicts

- [x] Architecture 文档 — 缺少阶段转换规则定义
- [x] 事件内容文件 — `civil-exam.json` 中 3 个事件 stage 标注错误
- [x] 引擎层 — `useNarrative.ts` 缺少阶段转换合法性校验
- [ ] UI/UX — 无影响
- [ ] PRD — 不存在

### Technical Impact

- **eventEvaluator.ts**: 新增约 30 行代码（阶段转换规则 + 校验函数）
- **useNarrative.ts**: 添加 2 处校验调用（主线路 + 随机遭遇路径）
- **civil-exam.json**: 3 个事件的 `stage` 字段值修改
- **测试**: 现有测试全部通过，无回归

## 3. Recommended Approach

**路径：** Direct Adjustment — 直接修改。

| 评估 | 结果 |
|------|------|
| 可行性 | ✅ 可行 — 修改范围明确 |
| 工作量 | Low — 引擎层 ~30 行 + JSON 3 字段 |
| 风险 | Low — 不影响 UI，测试通过 |
| 时间影响 | 1-2 小时 |

## 4. Detailed Change Proposals

### Proposal A: 修正 Civil 路径 stage 标注

**文件:** `src/content/events/civil-exam.json`

| 事件 ID | 原来 | 改为 | 理由 |
|---------|------|------|------|
| `civil_promotion_chance` | `firstJob` | `work` | 提副科已属资深阶段 |
| `civil_ethics_test` | `firstJob` | `work` | 行贿测试发生在有职权的员工 |
| `civil_three_years` | `firstJob` | `work` | 3年体制内经验远非"第一份工作" |

### Proposal B: 引擎层阶段转换校验

**文件:** `src/engine/eventEvaluator.ts`

新增 `VALID_STAGE_TRANSITIONS` 映射表和 `isValidStageTransition()` 校验函数：

```
undergrad → graduation
graduation → firstJob / postgrad / gap
firstJob → work / gap
postgrad → work / gap
gap → work / firstJob / postgrad
work → retirement / gap
retirement → ending
```

**文件:** `src/hooks/useNarrative.ts`

在主线路阶段转换和随机遭遇阶段转换两处增加 `isValidStageTransition()` 检查。非法转换跳过 `setStage()`，维持当前阶段。

## 5. Implementation Handoff

**Scope Classification:** Minor — 可直接由 Developer agent 实施。

| 步骤 | 内容 | 负责人 |
|------|------|--------|
| 1 | 修改 `civil-exam.json` 3 个事件的 stage 字段 | ✅ 已完成 |
| 2 | 在 `eventEvaluator.ts` 添加阶段转换规则 | ✅ 已完成 |
| 3 | 在 `useNarrative.ts` 添加校验调用 | ✅ 已完成 |
| 4 | 验证编译和测试通过 | ✅ 已完成 |

**Success Criteria:**
- TypeScript 编译无错误
- 测试全部通过
- 游戏可正常启动，各路径可正常游玩
- 非法阶段转换被静默阻止（维持当前阶段）

## 6. 后续建议

| 建议 | 优先级 | 说明 |
|------|--------|------|
| 对其他 JSON 文件的 stage 标注进行全面审计 | 后续 | 目前无其他明显错误，但可做例行检查 |
| 路径切换事件的叙事文本适配 | 后续 | 如 mid-career → 考研文本不再说"室友"，需做分支文本 |
| 在 Architecture 文档中记录阶段转换规则 | 后续 | 保持文档与实现一致 |
