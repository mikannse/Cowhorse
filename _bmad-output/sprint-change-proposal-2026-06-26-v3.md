---
workflowType: 'correct-course'
project: 'CowHorse'
user: 'BMad'
date: '2026-06-26'
iteration: 3
status: 'proposed'
---

# Sprint Change Proposal: 结局体系重构 — 从 10 到 45 个结局

## Section 1: Issue Summary

**Problem Statement:** 游戏现有 10 个结局，其中 `mental_breakdown`（心理崩溃）和 `stable_retirement`（平稳退休）两个通用结局覆盖了绝大多数对局，真正有叙事区分度的路线结局偏少。考研和考公路线各只有 1 个结局，且引擎已支持的 `major` 条件从未被任何结局使用。

**触发来源:** 用户反馈：「结局不够丰富，应该更有定制性」「最终结局种类太少了」

**Evidence:**
- 当前结局总数：10 个（common=1, route=7, hidden=1, fallback=1）
- 考研线：1 个结局（academic_success）
- 考公线：1 个结局（civil_servant）
- `major` 条件在条件引擎中已完整实现，0 个结局使用
- 上次新增的 32 个黑色选择、20 个事件对结局无任何影响
- 所有黑暗选择（作弊、职场暗算、灰色收入）没有对应的后果结局

## Section 2: Impact Analysis

| 维度 | 评估 |
|------|------|
| Epic Impact | [N/A] 纯内容扩展，不改变已有 epic 结构 |
| Architecture Impact | [N/A] 引擎完全支持所有需要的条件类型（attribute/stage/visited/major/and/or/not） |
| UI/UX Impact | [N/A] EndingScreen 和 LifeResume 不需要改动；渲染逻辑自动适配新增结局 |
| Tech Impact | [N/A] 零架构改动，仅 `endings.json` 内容变更（注意 first-match 优先级顺序） |
| Test Impact | 集成测试零改动；`evaluateEnding()` 是纯函数，自动遍历 endings 数组 |

## Section 3: Recommended Approach

**路径:** Direct Adjustment — 在 `endings.json` 中新增结局条目

**理由:**
- 零架构改动，引擎条件系统已全部支持
- Ending 使用 first-match 机制，只需要注意排列顺序
- `major` 条件已实现但从未使用，这次发挥其价值
- `visited` 条件可以检测玩家是否经历了特定事件

**Effort Estimate:** Low（纯 JSON 编辑，仅 1 个文件）
**Risk Level:** Low（纯内容追加，不影响现有引擎或事件流）
**First-match priority ordering:**
```
F(极端失败) → mental_breakdown → A(人生形态) → B(道德) → D(专业高配) → C(路线强化) → E(隐藏) → D(专业低配) → stable_retirement(保底)
```

## Section 4: Detailed Change Proposals

### 4.1 A 类 — 人生形态结局（6 个）

不依赖路线和专业，按属性画像决定你活成了什么样的人。

| 结局 ID | 标题 | 触发条件 |
|---------|------|---------|
| `life_winner` | 人生赢家 | money≥60, energy≥50, skill≥60, connections≥50, mentalHealth≥60 |
| `money_king` | 金钱至上 | money≥70, mentalHealth≤30, skill≤30 |
| `lonely_genius` | 孤独天才 | skill≥70, connections≤25, mentalHealth≥40 |
| `social_butterfly` | 人脉达人 | connections≥70, skill≤30, money≥40 |
| `spiritually_rich` | 内心富足 | mentalHealth≥70, money≤30 |
| `ordinary_drift` | 平凡一生 | 保底：所有属性在 30-60 之间 |

### 4.2 B 类 — 道德结局（3 个）

反映玩家在旅程中做了多少黑暗选择。

| 结局 ID | 标题 | 触发条件 |
|---------|------|---------|
| `dark_path` | 不择手段 | money≥60, mentalHealth≤20（钱多但内心空虚，说明走了捷径） |
| `moral_grey` | 灰色地带 | mentalHealth 30-50, money 30-60（中间态） |
| `integrity` | 问心无愧 | mentalHealth≥60, connections≥50（心安+人缘好） |

### 4.3 C 类 — 路线强化结局（新增 7 个，总 14 个）

每条路线按走向分 2-3 档，而不是一条路一个结局。

**考研线（1→3）：**

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `exam_failure` | 落榜之后 | visited `exam_prep_normal` + skill<50 + mentalHealth≤30 |
| `exam_survivor` | 考研幸存者 | visited `exam_pass` + skill 40-55 |
| `academic_success` | 学术大佬 | visited `postgrad_publish` + skill≥60（已有） |

**考公线（1→3）：**

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `civil_failure` | 编制失格 | visited `civil_fail` |
| `civil_mediocre` | 稳定穷忙 | visited `civil_pass` + mentalHealth<40 |
| `civil_servant` | 编制护身符 | visited `civil_pass` + mentalHealth≥25（已有） |

**工作线（3→4）：**

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `corrupted_success` | 权力腐蚀 | visited `job_crisis` + money≥60 |
| `entrepreneur_dream` | 创业梦想家 | visited `job_entrepreneur` + mentalHealth≥20（已有） |
| `achiever` | 功成名就 | skill≥55, money≥60, mentalHealth≥25（已有） |
| `burned_out` | 燃尽的社畜 | mentalHealth≤30, money≥20（已有） |

**躺平线（2→3）：**

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `lie_flat_criminal` | 捞偏门的下场 | visited 躺平黑暗事件 + connections≤20 |
| `lie_flat_freedom` | 低欲望自由 | visited `lie_intro` + mentalHealth≥50（已有） |
| `digital_nomad_free` | 数字游民自由 | visited `lie_digital_nomad` + mentalHealth≥45（已有） |

### 4.4 D 类 — 专业终局结局（12 个）

利用引擎从未使用的 `major` 条件。每个专业高配/低配各一个：

**高配版（skill≥55 + 相关属性）：**

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `cs_founder` | 码农翻身 | major=cs + skill≥60 + money≥55 |
| `finance_shark` | 资本鲨鱼 | major=finance + money≥65 + connections≥55 |
| `med_savior` | 仁心仁术 | major=med + skill≥60 + mentalHealth≥40 |
| `eng_builder` | 工程脊梁 | major=eng + skill≥55 + mentalHealth≥35 |
| `law_advocate` | 正义代言人 | major=law + skill≥55 + connections≥50 |
| `art_visionary` | 艺术先知 | major=art + skill≥60 + mentalHealth≥30 |

**低配版（技能荒废）：**

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `cs_grunt` | 搬砖码农 | major=cs + skill<40 |
| `finance_loser` | 金融民工 | major=finance + money<35 |
| `med_burnout` | 医路疲惫 | major=med + mentalHealth<30 |
| `eng_drawer` | 画图匠 | major=eng + skill<40 |
| `law_clerk` | 律所螺丝钉 | major=law + money<30 |
| `art_starving` | 饥饿艺术家 | major=art + money<20 |

### 4.5 E 类 — 隐藏/彩蛋结局（新增 4 个，总 5 个）

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `millionaire_escape` | 财务自由跑路 | money≥85 + mentalHealth≥55 |
| `internet_myth` | 互联网神话 | connections≥65 + skill≥60 + mentalHealth≥30（已有） |
| `second_childhood` | 返老还童 | mentalHealth≥80 + money≥50 |
| `total_burnout` | 过劳死 | energy≤5 + skill≥60 |
| `prison_sentence` | 铁窗泪 | money≥40 + mentalHealth≤10 + connections≤15 |

### 4.6 F 类 — 极端失败结局（3 个）

优先级最高，first-match 最先检测：

| 结局 ID | 标题 | 条件 |
|---------|------|------|
| `death_by_overwork` | 过劳死 | energy≤0 |
| `academic_dishonor` | 学术开除 | visited 任意 `*_exam_cheat` + skill<30 |
| `exposed_fraud` | 身败名裂 | mentalHealth≤5 + connections≤5 |

### 变更统计

| 类别 | 已有 | 新增 | 合计 |
|------|:---:|:----:|:----:|
| A. 人生形态 | 0 | 6 | 6 |
| B. 道德结局 | 0 | 3 | 3 |
| C. 路线强化 | 7 | 7 | 14 |
| D. 专业终局 | 0 | 12 | 12 |
| E. 隐藏彩蛋 | 1 | 4 | 5 |
| F. 极端失败 | 0 | 3 | 3 |
| 通用 | 2 | 0 | 2 |
| **总计** | **10** | **35** | **45** |

**文件变更:** 仅 1 个文件 — `src/content/endings.json`

### First-Match 排序策略

```
F 类（极端失败）
  → death_by_overwork (energy≤0)
  → academic_dishonor (作弊+skill<30)
  → exposed_fraud (mentalHealth≤5 + connections≤5)
→ mental_breakdown (通用)
  → mentalHealth≤0
→ A 类（人生形态）
  → life_winner → money_king → lonely_genius → social_butterfly → spiritually_rich → ordinary_drift
→ B 类（道德结局）
  → dark_path → moral_grey → integrity
→ D 类高配专业终局
  → cs_founder → finance_shark → med_savior → eng_builder → law_advocate → art_visionary
→ C 类（路线强化）
  → 考研: exam_failure → exam_survivor → academic_success
  → 考公: civil_failure → civil_mediocre → civil_servant
  → 工作: corrupted_success → entrepreneur_dream → achiever → burned_out
  → 躺平: lie_flat_criminal → lie_flat_freedom → digital_nomad_free
→ E 类（隐藏彩蛋）
  → millionaire_escape → internet_myth → second_childhood → total_burnout → prison_sentence
→ D 类低配专业终局
  → cs_grunt → finance_loser → med_burnout → eng_drawer → law_clerk → art_starving
→ stable_retirement（保底）
```

## Section 5: Implementation Handoff

**Scope:** Minor — 可直接由 Developer agent 实施。

**Deliverables:**
- 更新后的 `endings.json`（45 个结局条目）
- TypeScript 编译验证
- 集成测试验证

**Implementation Notes:**
- 仅编辑 1 个文件：`src/content/endings.json`
- first-match 顺序必须严格遵守上述排序——F 类在最前，低配专业在最后
- 注意已有结局的 condition 保持不变，只调整它们在数组中的位置
- 所有新增 `major` 条件已在 `evaluateMajorCondition()` 中完整实现
- `visited` 条件已在 `evaluateVisitedCondition()` 中完整实现
- 不需要修改引擎、组件、hooks 或测试

**Success Criteria:**
- [ ] `npm run build` 编译通过（TypeScript 零错误）
- [ ] `npm run test` 集成测试通过（at least 2/2）
- [ ] 走考研线作弊失败 → 验证获得 `academic_dishonor` 结局
- [ ] 走工作线走黑暗路线 → 验证获得 `corrupted_success` 或 `dark_path`
- [ ] 走不同专业走相同路线 → 验证获得不同专业结局
