# Sprint Change Proposal — CowHorse 时间线修复

**日期**: 2026-06-25
**状态**: 已审批待执行
**提出人**: BMad

---

## 1. Issue Summary

### 问题描述
CowHorse（社畜模拟器）的剧情阶段转换验证系统（`VALID_STAGE_TRANSITIONS`）过于严格，导致叙事内容与系统的"人生阶段"跟踪发生错位。玩家体验到的叙事内容和系统内部 stage 状态不匹配，形成"时间线穿越"感。

### 发现方式
剧情内容开发过程中发现部分路线（如"躺平"路线）的 stage 转换被静默拒绝，另有事件（如 `postgrad_job`）的 stage 标注与叙事语义不一致。

### 核心证据
- `undergrad` → `gap` 静默失败（躺平路线 stage 卡死在 undergrad）
- `work` → `graduation` 静默失败（工作后考研/考公路线 stage 无法更新）
- `gap` → `graduation` 静默失败（空窗期后重新求职路线断裂）
- `postgrad_job` stage 标注为 `"graduation"`，语义应为 `"work"`

---

## 2. Impact Analysis

### 受影响子系统

| 子系统 | 影响程度 | 说明 |
|--------|---------|------|
| 叙事引擎 (`engine/`) | ⚠️ 修改 | `VALID_STAGE_TRANSITIONS` 扩展 |
| 事件内容 (`content/events/`) | ⚠️ 修复 | `postgrad_job.stage` 修正 |
| 游戏循环 (`useNarrative.ts`) | ✅ 无影响 | 转换逻辑本身无需改动 |
| UI 组件 | ✅ 无影响 | — |
| 测试 | ✅ 无影响 | 2 个测试全部通过 |

### 受影响的剧情路线

| 路线 | 修改前 | 修改后 |
|------|-------|-------|
| 躺平路线（undergrad→gap→work） | stage 卡在 undergrad | 正常推进 |
| 工作→考研（work→graduation→postgrad） | stage 卡在 work | 正常推进 |
| 工作→考公（work→graduation） | stage 卡在 work | 正常推进 |
| 空窗→求职（gap→graduation→firstJob） | stage 卡在 gap | 正常推进 |
| 研究生→求职（postgrad→work） | stage 变为 graduation（语义错） | 正常变为 work |

---

## 3. Recommended Approach

**选择**: 直接调整（Direct Adjustment）

**理由**:
- 修改范围极小（2 个文件，约 10 行）
- 零破坏风险（放宽验证限制不会破坏现有内容流）
- 修复后覆盖所有已知时间线穿越问题
- 无需新增内容、UI 变更或范围调整

**工作量**: 🟢 低
**风险**: 🟢 低

---

## 4. Detailed Change Proposals

### 变更 A：扩展 `VALID_STAGE_TRANSITIONS`

**文件**: `src/engine/eventEvaluator.ts`

| 阶段 | 原来允许 | 现在允许 |
|------|---------|---------|
| undergrad | graduation | graduation, **gap** |
| graduation | firstJob, postgrad, gap | firstJob, postgrad, gap, **undergrad** |
| firstJob | work, gap | work, gap, **graduation** |
| postgrad | work, gap | work, gap, **graduation** |
| gap | work, firstJob, postgrad | work, firstJob, postgrad, **graduation** |
| work | retirement, gap | retirement, gap, **graduation, postgrad** |

**理由**: 人生模拟游戏允许角色在不同阶段之间灵活转换。增加的回溯路径（工作→考研、躺平→重新出发等）都符合现实人生逻辑。

### 变更 B：修正 `postgrad_job` 的 stage 标注

**文件**: `src/content/events/postgrad-exam.json`

```
OLD: "stage": "graduation"
NEW: "stage": "work"
```

**理由**: 研究生毕业后求职属于"职场沉浮"阶段，不是大学"毕业季"。修正后配合新转换表（`postgrad`→`work`），时间线正常推进。

---

## 5. Implementation Handoff

### 范围分类：🟢 小 (Minor)

可以直接由 Developer agent 执行。修改已经完成。

### 验证结果

- ✅ `npx tsc --noEmit` — 类型检查通过
- ✅ `npx vitest run` — 2 个测试全部通过
- ✅ 已有剧情路线无破坏性影响

### 后续建议

建议手动验证以下路线确保体验正确：
1. 躺平路线：开始→选择躺平→躺平剧情→兼职/彻底躺平
2. 工作→考研路线：工作→选择考研→考研剧情
3. 快速通完一个完整 playthrough 验证整体流畅度

---

*Sprint Change Proposal 生成完毕 — 待用户最终确认*
