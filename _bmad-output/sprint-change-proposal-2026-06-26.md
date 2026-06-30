# Sprint Change Proposal — 专业×路线剧情差异化增强

**日期**: 2026-06-26
**触发人**: BMad
**类型**: 内容增强 — 叙事丰富度

---

## Section 1: Issue Summary

### 问题描述
CowHorse 项目中，6 大专业（CS/金融/医学/土木/法学/文史哲）与 4 大职业路线（求职/考研/考公/躺平）的剧情矩阵存在严重差异化不足。原有内容中，**只有求职路线**（`industry/` 目录）为各专业提供了个性化剧情，而考研、考公、躺平三条路线完全使用通用事件，各专业在同一路线上的叙事体验雷同，缺乏区分度。

### 触发条件
用户通过 `/bmad-correct-course` 提交诉求：
> "不同专业职业的路线差异性仍然不足，要求剧情更加丰富独特不同"

### 证据
原始差异化矩阵：

| 路线 | CS | 金融 | 医学 | 土木 | 法学 | 文史哲 |
|------|:--:|:----:|:----:|:----:|:----:|:----:|
| 求职 | ✅ 专业化 | ✅ 专业化 | ✅ 专业化 | ✅ 专业化 | ✅ 专业化 | ✅ 专业化 |
| 考研 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 |
| 考公 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 |
| 躺平 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 | ❌ 通用 |

---

## Section 2: Impact Analysis

### Epic/规划影响
- **无影响**：本次变更为纯内容增强，不修改现有 Epic 或核心架构
- spec-cowhorse.md 的 CAP-6（分叉路线骨架）明确要求"可见不同的结局"，本次增强完全符合目标

### 制品冲突
| 制品 | 影响 | 说明 |
|------|:----:|------|
| PRD (spec) | ✅ 一致 | 增强后更符合 CAP-6 要求 |
| Architecture | ✅ 无影响 | 引擎已支持 `major` 条件类型和路由分发 |
| UI/UX | ✅ 无影响 | 无 UI/UX 变更 |
| Content JSON | ✏️ 修改 | `postgrad-exam.json`, `civil-exam.json`, `lie-flat.json` |
| Engine | ✏️ 修改 | `useNarrative.ts` 新增 3 个 sentinel 和 3 个路由函数 |
| Events Index | ✏️ 修改 | `events/index.ts` 注册 18 个新事件文件 |

### 技术影响
- 引擎改动最小化：仅添加 sentinel 解析和路由函数
- 所有新内容遵循现有的 `GameEvent` 接口和 JSON 格式
- 使用了现有 `major` 条件类型和 `setMajor`/`__return_to_story__` 机制

---

## Section 3: Recommended Approach

**选择：Direct Adjustment（直接调整）**

理由：
1. 引擎零改动核心架构 — 仅扩展了已有的 `__route_by_major__` 模式
2. 内容可增量交付 — 已先完成考研路线作为示例并获批准
3. 风险极低 — 所有测试通过，编译无错误
4. 叙事丰富度大幅提升 — 18 个新 JSON 文件，约 60+ 新事件

### 工作量评估
| 路线 | 新增文件 | 新增事件 | 风险 |
|------|:--------:|:--------:|:----:|
| 考研路线 | 6 | 24 | 低 |
| 考公路线 | 6 | 12 | 低 |
| 躺平路线 | 6 | 12 | 低 |
| **合计** | **18** | **~48** | **低** |

---

## Section 4: Detailed Change Proposals

### 4.1 引擎修改 (`src/hooks/useNarrative.ts`)

新增 3 个 sentinel 和 3 个路由解析函数：

| Sentinel | 路由函数 | 用途 |
|----------|---------|------|
| `__exam_route_by_major__` | `resolveMajorExamRoute()` | 考研路线 × 专业分发 |
| `__exam_postgrad_outcome_by_major__` | `resolveMajorPostgradOutcome()` | 硕士毕业结局 × 专业分发 |
| `__civil_route_by_major__` | `resolveMajorCivilRoute()` | 考公路线 × 专业分发 |
| `__lie_route_by_major__` | `resolveMajorLieRoute()` | 躺平路线 × 专业分发 |

### 4.2 考研路线差异化（24 事件）

| 文件 | 事件 ID | 核心叙事亮点 |
|------|---------|-------------|
| `exam-cs.json` | `cs_exam_intro` → `cs_exam_prep` → `cs_postgrad_life` → `cs_postgrad_outcome` | 408 统考 30:1 报录比、导师横向项目 vs 大厂 SP |
| `exam-finance.json` | 4 事件 | 金融鄙视链、CFA 双线作战、实习决定一切 |
| `exam-med.json` | 4 事件 | 专硕规培必答题、西综 306、值班室除夕夜 |
| `exam-eng.json` | 4 事件 | 行业下行 vs 跨考挣扎、一建证书、一带一路 |
| `exam-law.json` | 4 事件 | 考研 vs 法考双线、红圈所 9106、法检系统 |
| `exam-art.json` | 4 事件 | 无用之学的意义追问、诗与房租、学术 vs 创作 |

### 4.3 考公路线差异化（12 事件）

| 文件 | 事件 | 核心叙事亮点 |
|------|:----:|-------------|
| `civil-cs.json` | 2 | 大数据局 — ASP.NET 世界的 Python 程序员 |
| `civil-finance.json` | 2 | 财政局 — 预算审批不需要 CAPM 模型 |
| `civil-med.json` | 2 | 卫健委 — 告别临床的另一种救死扶伤 |
| `civil-eng.json` | 2 | 住建局 — 工地经验变成了审批判断力 |
| `civil-law.json` | 3 | 法检 — 判决书是人生的句号 |
| `civil-art.json` | 2 | 宣传部 — 公文写作与创作自由的拉锯 |

### 4.4 躺平路线差异化（12 事件）

| 文件 | 事件 | 核心叙事亮点 |
|------|:----:|-------------|
| `lie-cs.json` | 2 | 人躺着 GitHub 还在涨 star、技术合伙人的召唤 |
| `lie-finance.json` | 2 | 卷不动了 vs 用金融思维为自己工作 |
| `lie-med.json` | 2 | 八年沉没成本不敢躺 vs 重拾希波克拉底誓言 |
| `lie-eng.json` | 2 | 行业寒冬被迫躺 vs 工程师基因：再难也得开工 |
| `lie-law.json` | 2 | '好的收到'到'法律信仰'的回归 |
| `lie-art.json` | 2 | 文史哲躺最自洽 — 创作从躺平开始 |

### 4.5 修改的现有文件

**`src/content/events/postgrad-exam.json`**
- `exam_intro`：改为路由到 `__exam_route_by_major__`
- `postgrad_graduation`：改为路由到 `__exam_postgrad_outcome_by_major__`
- `postgrad_end`：改为路由到 `__exam_postgrad_outcome_by_major__`

**`src/content/events/civil-exam.json`**
- `civil_intro`：改为路由到 `__civil_route_by_major__`

**`src/content/events/lie-flat.json`**
- `lie_intro`：改为路由到 `__lie_route_by_major__`

---

## Section 5: Implementation Handoff

### 变更范围分类：Minor

本次变更为**内容增强**，可直接由 Developer 代理实施。

### 已完成的实施
- [x] 引擎路由扩展（`useNarrative.ts`）
- [x] 18 个新事件 JSON 文件
- [x] 事件注册（`events/index.ts`）
- [x] 3 条现有路线入口事件路由修改
- [x] TypeScript 编译通过
- [x] 集成测试通过（2/2）

### 成功标准
- [ ] 选择 CS 专业后走考研路线 → 看到 408 和导师横向的专属事件
- [ ] 选择法学专业后走考公路线 → 法院判决书和法检系统的专属事件
- [ ] 选择文史哲专业后走躺平路线 → 创作觉醒的专属事件
- [ ] 现有游戏流程不受影响，所有测试通过
- [ ] 无 TypeScript 编译错误
- [ ] 无运行时错误（`event_not_found` 不会触发）
