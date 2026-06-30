
# 🐄 CowHorse 社畜模拟器

> 从大四到退休，你打算怎么活？

一款文字叙事人生模拟游戏。扮演应届毕业生，在考研、工作、考公、躺平四条路线中做出选择，管理金钱、体力、能力、人脉和心态五项属性，体验从毕业到退休的跌宕人生。

**在线体验：[cowhorse.pages.dev](https://cowhorse.pages.dev)**

---

## ✨ 特色

- **四条人生路线** — 考研 / 工作 / 考公 / 躺平，每条路线有独立事件链
- **命运骰子系统** — 关键节点掷骰决定走向，+3 修正值影响结果
- **随机遭遇事件** — 20% 概率触发支线事件，增加不可预测性
- **五项属性** — 金钱💰 体力⚡ 能力📚 人脉🤝 心态😊，互相影响
- **多重结局** — 条件树驱动的结局系统，含隐藏结局
- **人生简历海报** — 游戏结束后生成可保存 / 分享的简历海报
- **微信朋友圈风格** — 事件中的"朋友圈"弹窗和独白时刻
- **全无后端** — 纯前端 SPA，部署即用

## 🎮 玩法

1. 阅读事件文本，在选项间做出选择
2. 每个选择影响五项属性
3. 心态归零会立即触发结局
4. 关键事件需要掷命运骰子
5. 游戏结束后可生成并保存"人生简历"海报

## 🧱 技术栈

| 技术 | 用途 |
|---|---|
| **React 19** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Vite 8** | 构建工具 |
| **Zustand** | 状态管理 |
| **Tailwind CSS v4** | 样式 |
| **Framer Motion** | 动画 |
| **html2canvas-pro** | 海报导出 |
| **Workbox (PWA)** | 离线支持 |

## 📁 项目结构

```
src/
├── engine/                # 游戏引擎
│   ├── useGameStore.ts    # Zustand 全局状态
│   ├── eventEvaluator.ts  # 事件路由 & 阶段验证
│   ├── diceRoller.ts      # 骰子系统
│   └── memeEvaluator.ts   # Meme 反应判定
├── content/               # JSON 游戏内容
│   ├── events/*.json      # 各路线事件数据
│   ├── endings.json       # 结局条件
│   ├── stages.json        # 阶段标签
│   └── constants.json     # 游戏常量
├── hooks/                 # React Hooks
├── components/            # 可复用组件
├── screens/               # 页面（标题 / 游戏 / 结局）
├── utils/                 # 工具函数
└── types.ts               # 核心类型定义
```

## 🚀 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
npm run test       # 运行测试
npm run lint       # 代码检查（Biome）
npm run format     # 代码格式化（Biome）
```

## 🏗️ 架构概览

游戏采用 **事件驱动 + JSON 驱动** 架构：

- **内容即代码** — 所有事件、选择、条件、结局均在 `src/content/` 的 JSON 文件中定义
- **条件树系统** — 支持属性比较、阶段判断、骰子范围、事件访问记录、逻辑组合
- **阶段验证** — 非法阶段跳转（如 工作 → 大学）会被引擎静默拒绝
- **遭遇注入** — 每次主线事件后 20% 概率触发遭遇事件（每场游戏每个遭遇仅一次）

## 📄 许可

MIT © [mikannse](https://github.com/mikannse)
