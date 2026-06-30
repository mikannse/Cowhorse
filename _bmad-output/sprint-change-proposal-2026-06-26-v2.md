---
workflowType: 'correct-course'
project: 'CowHorse'
user: 'BMad'
date: '2026-06-26'
iteration: 2
status: 'proposed'
---

# Sprint Change Proposal: 黑色选择内容扩展

## Section 1: Issue Summary

**Problem Statement:** 游戏现有的选择系统缺少道德灰色地带——所有选择都在「积极vs消极」「努力vs摸鱼」的二元框架内，缺少现实中常见的道德困境选项（如作弊、职场政治、灰色收入等），导致剧情张力和 replayability 受限。

**触发来源:** 用户主动提出需求：「要适当增加一些黑色选择，比如给同事穿小鞋，考研作弊之类的」

**Evidence:**
- 考研路线原有 event 只有「努力复习」和「复习不顺」两种走向
- 职场路线只有「奋斗」「摸鱼」「跳槽」三种合法选择
- 考公路线缺少灰色利益冲突场景
- 躺平路线缺少边缘行为选择
- 通用随机事件全是温情或中性主题

## Section 2: Impact Analysis

| 维度 | 评估 |
|------|------|
| Epic Impact | [N/A] 纯内容扩展，不改变已有 epic 结构 |
| Architecture Impact | [N/A] 引擎、条件系统、事件系统完全支持 |
| UI/UX Impact | [N/A] 选择面板不需要改动 |
| Tech Impact | [N/A] 零架构改动，仅 JSON 内容变更 |
| Test Impact | 集成测试零改动，2/2 通过 |

## Section 3: Recommended Approach

**路径:** Direct Adjustment — 在所有已有路线内容文件中添加黑色选择选项

**理由:**
- 零架构改动，引擎已支持 unconditioned choice（无 condition 字段即始终可见）
- 所有效果通过现有 `GameEffect` 系统实现
- 新 encounter 事件通过 `encounter_` 前缀 + `condition` 字段自动参与随机事件池
- 风险极低：TypeScript 编译零错误，集成测试通过

**Effort Estimate:** Low（纯 JSON 编辑，8 个文件批量脚本处理）
**Risk Level:** Low（纯内容追加，不影响现有事件流）

## Section 4: Detailed Change Proposals

### 4.1 考研路线 — 作弊选择 🔴

**文件:** `exam-cs.json` ~ `exam-art.json`（6 文件）

**变更:**
- 在每个 `*_exam_prep` 事件中添加 unconditional 作弊选项（无 dice 条件）
- 新增 `*_exam_cheat` 事件（diceRoll 判定败露/成功）

**效果设计:**
- 成功路径（dice 4-6）: skill +15, mentalHealth -10, connections -5 → `exam_study_hard`
- 败露路径（dice 1-3）: skill -10, mentalHealth -20, connections -10 → `exam_prep_normal`

**各专业特有叙事:**
| 专业 | 作弊场景 | 售价 |
|------|---------|------|
| CS | 买 408 原题 | ¥3,000 |
| 金融 | 闲鱼买 431 真题 | ¥5,000 |
| 医学 | 偷看西综命题讨论会纪要 | 职业风险 |
| 土木 | 学长传答案 | ¥2,000 |
| 法学 | 买押题密卷 | ¥8,000（分期） |
| 艺术 | 买专业课答案 | ¥5,000 |

---

### 4.2 工作路线 — 职场黑色选择 🔴

**文件:** `job-hunt.json`（5 事件）+ `industry/*.json`（6 文件）

**job-hunt.json 通用黑色选择:**

| 事件 | 黑色选择 | 效果 |
|------|---------|------|
| `job_interview` | 编造实习经历 | connections +10, mentalHealth -10, skill -3 |
| `job_offer` | 拿 offer 去另一家抬价 | money +12, connections -5, mentalHealth -5 |
| `job_three_months` | 在代码里留隐患嫁祸同事 | skill +5, connections -8, mentalHealth -10 |
| `job_one_year` | 周报抢同事功劳 | connections ±10, mentalHealth -8 |
| `job_crisis` | 栽赃同事背裁员锅 | connections ±12/-8, mentalHealth -15 |

**行业特色 encounter 事件（6 个新事件）:**

| 行业 | 事件 ID | 道德困境 |
|------|---------|---------|
| CS | `encounter_cs_backstab` | Code Review 时公开羞辱同事 |
| 金融 | `encounter_finance_insider` | 内幕交易诱惑 |
| 医学 | `encounter_med_fraud` | 收红包开过度住院单 |
| 土木 | `encounter_eng_bribe` | 验收时收施工方好处费 |
| 法学 | `encounter_law_perjury` | 帮当事人作伪证 |
| 艺术 | `encounter_art_plagiarism` | 抄袭国外插画师作品 |

---

### 4.3 考公路线 — 灰色选择 🔴

**文件:** `civil-exam.json`（1 事件）+ `civil-*.json`（6 文件）

**变更:**
- `civil_routine`: 新增「灰色代办副业」选项
- 各专业 `*_civil_work`: 新增灰色利益冲突选项

| 专业 | 灰色选择类型 |
|------|-------------|
| CS | 帮同乡查企业备案数据（违反数据安全法） |
| 金融 | 预算审批照顾关系部门（利益交换） |
| 医学 | 收医药代表回扣加采购目录 |
| 土木 | 收施工方信封加快质检 |
| 法学 | 收老同学好处在案子上「从轻」 |
| 艺术 | 文化项目评审给朋友公司打高分拿分成 |

---

### 4.4 躺平路线 — 黑色选择 🔴

**文件:** `lie-flat.json`（2 事件）+ `lie-*.json`（6 文件）

**通用：**
| 事件 | 黑色选择 | 效果 |
|------|---------|------|
| `lie_full_flat` | 骗家里说在上培训班骗生活费 | money +8, mentalHealth -8, skill -3 |
| `lie_bottom` | 闲鱼卖来路不明货品 | money +10, connections -8, mentalHealth -8 |

**专业特色：**
| 专业 | 选择 |
|------|------|
| CS | 接黑产刷量脚本外包 |
| 金融 | 当非法网贷的「白手套」 |
| 医学 | 挂名私人诊所坐诊 |
| 土木 | 代签验收文件（盖章 500/张） |
| 法学 | 无证非法提供法律咨询 |
| 艺术 | 接代笔——署名不是自己 |

---

### 4.5 通用随机事件 — 黑色选择 🔴

**文件:** `common.json`（8 个新 encounter 事件）

| 事件 ID | 场景 | 黑暗选择 |
|---------|------|---------|
| `encounter_temptation_inside_deal` | 供应商暗示回扣 | 受贿 / 拒绝 |
| `encounter_gossip_weapon` | 知道同事的八卦可捅出去 | 添油加醋 / 不说 |
| `encounter_steal_idea` | 同事分享的方案你可以偷 | 剽窃提案 / 合作 |
| `encounter_expense_fraud` | 发现报销漏洞 | 虚报发票 / 不贪 |
| `encounter_blame_game` | 项目出事可以甩锅 | 沉默让同事背锅 / 澄清 |
| `encounter_friend_loan` | 老同学借钱（可能不还） | 全借 / 不借 / 借部分 |
| `encounter_opportunism` | 掌握未公开的信息优势 | 闷声准备 / 分享消息 |
| `encounter_pretend_busy` | 活做完了但大家都在装忙 | 装忙合群 / 准时下班 |

---

### 变更统计

| 类别 | 文件数 | 新增选择数 | 新增事件数 |
|------|:-----:|:----------:|:----------:|
| 考研作弊 | 6 | 6 | 6 |
| 工作黑色 | 7 | 11 | 6 |
| 考公灰色 | 7 | 7 | 0 |
| 躺平黑色 | 8 | 8 | 0 |
| 通用随机 | 1 | 0 | 8 |
| **总计** | **29** | **32** | **20** |

## Section 5: Implementation Handoff

**Scope:** Minor — 可直接由 Developer agent 实施。

**Deliverables:**
- ✅ 全部 29 个内容 JSON 文件已修改
- ✅ TypeScript 编译零错误
- ✅ 集成测试 2/2 通过

**Implementation Notes:**
- 所有新增选择使用 unconditional choice（无 `condition` 字段），始终可见
- 作弊事件使用已有 `diceRoll` + dice condition 系统判断败露
- Encounter 事件遵循已有 `encounter_` 前缀 + `condition` 规则
- 所有效果通过 `GameEffect` 系统实现，值域已考虑平衡性（最大 ±20）
- NoEncounters 保护：作弊事件和入口事件标记了 `noEncounters: true`（原有）

**Success Criteria:**
- [x] 所有 4 条主路线均有黑色选择
- [x] 6 个专业各有特色选择
- [x] 通用随机事件池含黑暗道德困境
- [x] 编译通过、测试通过
