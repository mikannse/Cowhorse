---
workflowType: 'correct-course'
project: 'CowHorse'
user: 'BMad'
date: '2026-06-30'
status: 'proposed'
---

# Sprint Change Proposal：时间线稳定性 + 职业专业路线扩展前置

## Section 1: Issue Summary

**Problem Statement:** 游戏当前阶段转换规则在代码实现中过于宽松，允许玩家从后期阶段（如 `work`、`postgrad`）跳转回早期阶段（如 `graduation`、`undergrad`），破坏了叙事时间线的一致性。同时，后续需要丰富职业 × 专业路线内容，必须在严格的阶段转换框架下进行以防止再次错乱。

**触发来源:** 用户反馈「现在还是会有时间线错乱的剧情，并且我之后想要丰富职业专业路线，该如何确保时间线不会混乱」

**Evidence:**
- 引擎中 `VALID_STAGE_TRANSITIONS` 原实现包含大量回退边
- 45 处事件之间的非法阶段转换 detected（如 `work → graduation`、`postgrad → graduation` 等）
- 22 处事件引用了不存在的事件 ID（缺失事件疑为未编写的专业分支占位符）
- 远程仓库已包含转换表收紧修复和事件清理，但缺乏自动校验机制

## Section 2: Impact Analysis

| 维度 | 评估 |
|------|------|
| 引擎影响 | 阶段转换表已经收紧，`eventEvaluator.ts` 转换规则已更新 |
| 事件内容影响 | 所有事件 JSON 已清理，0 个非法转换、0 个缺失引用 |
| 文档影响 | `spec-cowhorse.md` 阶段转换表与当前引擎代码不一致，需同步更新 |
| 校验/构建影响 | 缺少校验脚本，后续新增事件无自动防护 |
| 后续扩展影响 | 职业专业路线扩展可在严格的阶段转换框架内安全进行 |

## Section 3: Recommended Approach

**路径:** Direct Adjustment（直接调整）

**理由:**
- 引擎代码的转换表收紧 + 事件内容清理已在远程仓中完成
- 需要补充：阶段转换校验脚本 + npm 脚本接入 + 文档同步
- 后续职业专业路线扩展可安全进行

**Effort Estimate:** Low
**Risk Level:** Low
**Status:** 引擎修复已完成（远程），补充工作仅校验脚本 + 文档

## Section 4: Detailed Change Proposals

### 4.1 [已完成·远程] 阶段转换表收紧 — `eventEvaluator.ts`

现行为：

```ts
undergrad: ['graduation', 'gap'],
graduation: ['firstJob', 'postgrad', 'gap'],
firstJob: ['work', 'gap'],
postgrad: ['work', 'gap'],
gap: ['work', 'firstJob', 'postgrad'],
work: ['retirement', 'gap', 'ending'],
retirement: ['ending'],
ending: [],
```

核心收紧点：
- 删除所有向早期阶段的回退边（`graduation → undergrad`, `firstJob → graduation` 等）
- `work` 新增允许直接触发结局（`ending`）
- `undergrad` 允许提前进入 `gap`（躺平）

### 4.2 [已完成·远程] 事件内容清理

所有 45 处 `ILLEGAL` 转换和 22 处 `MISSING` 事件引用已在远程仓中修复。

### 4.3 [待实施] 新增 `scripts/validate-stage-transitions.mjs`

**文件:** `cowhorse/scripts/validate-stage-transitions.mjs`

- 自动从 `eventEvaluator.ts` 的 `VALID_STAGE_TRANSITIONS` 读取转换规则
- 递归扫描 `src/content/events/` 下所有 JSON 文件
- 检查每个 `choice.nextEventId` 跳转的阶段合法性
- 排除运行时哨兵（`__xxx__`、`__return_to_story__`、`ending_reached`）
- 错误时 exit(1) 阻止构建

**Rationale:** 为后续职业专业路线扩展提供自动守门

### 4.4 [待实施] 修改 `package.json`

增加 `validate:stages` 脚本，并入 `build` 流程：

```json
"scripts": {
  "build": "npm run validate:stages && tsc -b && vite build",
  "validate:stages": "node scripts/validate-stage-transitions.mjs"
}
```

### 4.5 [待实施] 更新 `spec-cowhorse.md`

将阶段转换表更新为与当前引擎代码一致，删除已废弃的回退说明。

## Section 5: Implementation Handoff

**Scope:** Minor — 可直接由 Developer agent 实施

**待实施项：**
- [ ] 新增 `cowhorse/scripts/validate-stage-transitions.mjs`
- [ ] 修改 `cowhorse/package.json`（添加 validate:stages 脚本）
- [ ] 更新 `cowhorse/_bmad-output/spec-cowhorse.md` 阶段转换表

**后续扩展（在已稳定的框架内进行）：**
- 扩展职业 × 专业事件链（`exam-*.json`、`industry/*.json`、`civil-*.json`、`lie-*.json`）
- 在 `src/content/endings.json` 中补充专业终局结局

**Success Criteria:**
- [ ] `npm run validate:stages` 输出 `✅ All stage transitions are valid.`
- [ ] `npm run build` 通过（含 validate:stages）
- [ ] `spec-cowhorse.md` 阶段转换表与引擎代码一致
