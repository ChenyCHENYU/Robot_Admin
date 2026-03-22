<div align="center">
  <a href="https://robotadmin.cn">
    <picture>
      <source srcset="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" media="(prefers-color-scheme: dark)">
      <img src="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" height="120" />
    </picture>
  </a>

  <h1>🤖 Robot Admin — Monorepo</h1>
  <p><strong>基于 Bun Workspaces 的企业级多应用管理平台</strong></p>
  <p>Vue 3.5 · Vite 8 (Rolldown) · TypeScript 5.8 · Naive UI · Pinia · UnoCSS · Bun</p>

  <!-- 架构分支导航 -->
  <table>
    <tr>
      <td align="center" width="200">
        <strong>🏗️ 单体架构</strong><br>
        <sub>传统单应用 SPA</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/main">
          <img src="https://img.shields.io/badge/分支-main-4A90E2?style=flat-square" alt="Main">
        </a>
      </td>
      <td align="center" width="200">
        <strong>📦 Monorepo</strong><br>
        <sub><b>📍 当前分支</b> — Bun Workspaces</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/monorepo-upgrade">
          <img src="https://img.shields.io/badge/分支-monorepo--upgrade-00d8ff?style=flat-square" alt="Monorepo">
        </a>
      </td>
      <td align="center" width="200">
        <strong>🔷 微前端</strong><br>
        <sub>micro-app 子应用</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/micro-app">
          <img src="https://img.shields.io/badge/分支-micro--app-FF6B6B?style=flat-square" alt="Micro App">
        </a>
      </td>
      <td align="center" width="200">
        <strong>🌐 模块联邦</strong><br>
        <sub>Module Federation 2.0</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/feature/module-federation">
          <img src="https://img.shields.io/badge/分支-federation-9B59B6?style=flat-square" alt="Federation">
        </a>
      </td>
    </tr>
  </table>

  <br>

  <a href="https://github.com/ChenyCHENYU/Robot_Admin/blob/monorepo-upgrade/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <img src="https://img.shields.io/badge/Node.js-≥22-339933?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Bun-≥1.3-f9f1e1?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Naive_UI-2.44-18a058" alt="Naive UI">
  <img src="https://img.shields.io/badge/UnoCSS-66.x-858585" alt="UnoCSS">

  <p>
    <a href="./README.md">🇨🇳 中文</a> |
    <a href="./README_EN.md">🇺🇸 English</a> |
    <a href="https://robotadmin.cn">🌐 在线演示</a>
  </p>

</div>

---

## 目录

- [📖 简介](#-简介)
- [🏛️ Monorepo 架构设计哲学](#️-monorepo-架构设计哲学)
- [📂 目录结构全景](#-目录结构全景)
- [🔗 三层职责分离](#-三层职责分离)
- [🆚 社区最佳实践对比](#-社区最佳实践对比)
- [🛠️ 技术栈](#️-技术栈)
- [🚀 快速开始](#-快速开始)
- [📋 命令速查](#-命令速查)
- [📦 依赖治理策略](#-依赖治理策略)
- [🔨 构建与部署](#-构建与部署)
- [🧩 集成指南](#-集成指南)
- [🔮 演进路线图](#-演进路线图)
- [🤝 贡献指南](#-贡献指南)

---

## 📖 简介

本分支是 Robot Admin 的 **Monorepo 架构版本**，基于 **Bun Workspaces** 将原单体应用重构为多应用多包体系。

**为什么选择 Monorepo？**

- 🏢 **多应用共存** — 同一仓库管理内部版（完整功能 ERP）和 SaaS 版（多租户轻量版）
- 📋 **单点治理** — ESLint / Prettier / Commitlint / Git Hooks 全仓一份配置，消灭配置漂移
- 📦 **统一依赖** — Bun workspace hoisting 自动提升公共依赖，保证版本一致性
- 🔗 **@robot-admin/\* 包生态** — 复用已发布的 8 个 npm 包，不在本地重复造轮子
- 🚀 **独立构建部署** — 各 app 独立 `build` / `preview` / `deploy`，互不干扰

---

## 🏛️ Monorepo 架构设计哲学

> **核心原则**：根目录管治理，共享包管预设，应用管业务。

一个成熟的 Monorepo 必须回答三个问题：

| 问题                     | 答案                                      |
| ------------------------ | ----------------------------------------- |
| **「谁来制定规则？」**   | **根目录** — Workspace 级治理层           |
| **「规则如何复用？」**   | **packages/shared-config** — 可插拔预设包 |
| **「业务如何差异化？」** | **apps/\*** — 应用只关注自己的业务差异    |

### 三层架构逻辑图

```
┌─────────────────────────────────────────────────────────┐
│                  Root（Workspace 治理层）                  │
│                                                         │
│  ┌─ .prettierrc.js        统一格式化规则                  │
│  ├─ eslint.config.ts      根级 ESLint（覆盖 packages/）  │
│  ├─ commitlint.config.js  统一提交规范                    │
│  ├─ .husky/pre-commit     lint-staged → 全仓拦截         │
│  ├─ lint-staged            统一预提交检查策略              │
│  ├─ vercel.json           部署配置                        │
│  └─ tsconfig.json         TypeScript 项目引用             │
│         │                                               │
│         │  治理工具 hoisting（eslint / prettier / oxlint） │
│         ▼                                               │
├─────────────────────────────────────────────────────────┤
│              packages/（可复用预设层）                     │
│                                                         │
│  shared-config/                                         │
│  ├─ eslint/index.ts       createEslintConfig() 规则工厂  │
│  ├─ vite/index.mjs        createViteConfig() 构建工厂    │
│  ├─ tsconfig/app.json     Vue 应用基础 TS 配置           │
│  └─ tsconfig/node.json    Node 工具链基础 TS 配置        │
│         │                                               │
│         │  extends / import                             │
│         ▼                                               │
├─────────────────────────────────────────────────────────┤
│                 apps/（业务应用层）                        │
│                                                         │
│  admin-internal/           admin-saas/                   │
│  ├─ vite.config.ts         ├─ vite.config.ts            │
│  │  → createViteConfig()   │  → createViteConfig()      │
│  ├─ eslint.config.ts       ├─ eslint.config.ts          │
│  │  → createEslintConfig() │  → createEslintConfig()    │
│  ├─ unocss.config.ts      ├─ unocss.config.ts          │
│  ├─ tsconfig/(extends)     ├─ tsconfig/(extends)        │
│  ├─ envs/    (独立环境)    ├─ envs/    (独立环境)        │
│  └─ src/     (业务源码)    └─ src/     (业务源码)        │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 目录结构全景

```
Robot_Admin/                                  ← Workspace Root（治理层）
│
│  ── 治理配置（全仓统一，不允许 app 覆盖） ──
├── .editorconfig                             # 编辑器统一（UTF-8 / LF / 2 空格）
├── .prettierrc.js                            # Prettier 格式化规则
├── .prettierignore                           # Prettier 忽略
├── eslint.config.ts                          # 根级 ESLint Flat Config（覆盖 packages/）
├── commitlint.config.js                      # Git 提交规范（12 种 type + 强制 scope）
├── .cz-config.js                             # Commitizen 交互式提交配置
├── .husky/
│   ├── pre-commit                            # lint-staged（oxlint → eslint → prettier）
│   └── commit-msg                            # commitlint
│
│  ── 部署与工程配置 ──
├── vercel.json                               # Vercel 部署配置
├── tsconfig.json                             # TypeScript 项目引用（指向所有子项目）
├── .bunfig.toml                              # Bun 运行时配置
├── .gitattributes                            # Git 合并策略
├── package.json                              # workspace 定义 + 根脚本 + 治理依赖
├── bun.lock                                  # 统一锁文件
│
│  ── 文档 ──
├── README.md                                 # 本文件
├── CONTRIBUTING.md                           # 贡献指南
├── CHANGELOG.md                              # 变更日志
├── docs/                                     # 项目深度分析文档
│
│  ── 应用（business apps） ──
├── apps/
│   ├── admin-internal/                       ← 🏢 内部版（企业级完整功能 ERP）
│   │   ├── eslint.config.ts                  # 1 行：createEslintConfig()
│   │   ├── vite.config.ts                    # 使用 createViteConfig() + 应用插件
│   │   ├── unocss.config.ts                  # 应用级 UnoCSS 配置
│   │   ├── tsconfig.json                     # 项目引用 → tsconfig/
│   │   ├── tsconfig/
│   │   │   ├── tsconfig.app.json             # extends shared-config/tsconfig/app
│   │   │   └── tsconfig.node.json            # extends shared-config/tsconfig/node
│   │   ├── envs/                             # 环境变量（dev / test / staging / prod）
│   │   ├── lang/                             # i18n 语言文件
│   │   ├── scripts/                          # 构建 / 部署脚本
│   │   ├── src/
│   │   │   ├── api/                          # API 接口 + 自动生成类型
│   │   │   ├── assets/                       # 静态资源
│   │   │   ├── components/                   # 全局组件（C_） + 局部组件（c_）
│   │   │   ├── composables/                  # 组合式函数
│   │   │   ├── config/                       # 主题 + Vite + KeepAlive
│   │   │   ├── hooks/                        # 通用 Hooks
│   │   │   ├── plugins/                      # 12 个 Vue 插件（启动引导链）
│   │   │   ├── router/                       # 路由 + 动态路由 + 守卫
│   │   │   ├── stores/                       # Pinia 状态（6 个模块）
│   │   │   ├── styles/                       # 全局 SCSS + 主题变量
│   │   │   ├── types/                        # TypeScript 类型声明
│   │   │   ├── utils/                        # 工具函数
│   │   │   └── views/                        # 业务页面（55+ Demo）
│   │   └── package.json                      # @robot-admin/internal
│   │
│   └── admin-saas/                           ← ☁️ SaaS 版（多租户轻量版）
│       ├── ...                               # 与 internal 同构，按需裁剪
│       └── package.json                      # @robot-admin/saas
│
│  ── 共享包（reusable packages） ──
└── packages/
    └── shared-config/                        ← 📋 共享配置工厂包
        ├── eslint/index.ts                   # createEslintConfig() — 180+ 行规则
        ├── vite/index.mjs                    # createViteConfig() — env + optimizeDeps
        ├── vite/index.d.ts                   # Vite 工厂类型声明
        ├── tsconfig/app.json                 # Vue 应用基础 TS 配置
        ├── tsconfig/node.json                # Node 工具链基础 TS 配置
        ├── tsconfig.json                     # 包自身 TS 配置
        └── package.json                      # @robot-admin/shared-config
```

---

## 🔗 三层职责分离

### Layer 1：根目录 — Workspace 治理层

> **原则**：只放「全仓所有项目必须遵守」的约束，不放任何业务代码。

| 文件                      | 职责                       | 为什么在根目录                                                                 |
| ------------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| `.prettierrc.js`          | 代码格式化规则             | Prettier 从 CWD 向上查找配置，根级 = 全仓生效                                  |
| `eslint.config.ts`        | 根级 ESLint                | 覆盖 `packages/` 和根文件；各 app 有独立 config（ESLint Flat Config 就近优先） |
| `commitlint.config.js`    | 提交规范                   | Husky 从根目录触发，commitlint 读取根 config                                   |
| `.husky/` + `lint-staged` | 预提交拦截                 | Git hooks 只在 `.git` 所在目录生效，即根目录                                   |
| `vercel.json`             | 部署配置                   | Vercel 需要从 monorepo 根执行 `bun install`，再构建特定 app                    |
| `tsconfig.json`           | 项目引用                   | TypeScript Project References 统一 IDE 导航                                    |
| **治理 devDeps**          | ESLint / Prettier / Oxlint | Bun hoisting 到根 `node_modules/`，所有 app 和 package 共享                    |

> **关键规则**：`lint-staged` 配置只在根 `package.json`，各 app 不再重复配置。Husky `pre-commit` 只运行一次 `lint-staged`，由 lint-staged 统一调度 oxlint → ESLint → Prettier。

### Layer 2：packages/ — 可复用预设层

> **原则**：放可被多个 app（甚至外部项目）消费的配置工厂和共享逻辑。

| 包                | 导出                   | 被谁消费                                          |
| ----------------- | ---------------------- | ------------------------------------------------- |
| **shared-config** | `createEslintConfig()` | 根 `eslint.config.ts` + 各 app `eslint.config.ts` |
| **shared-config** | `createViteConfig()`   | 各 app `vite.config.ts`                           |
| **shared-config** | `tsconfig/app.json`    | 各 app `tsconfig.app.json` extends                |
| **shared-config** | `tsconfig/node.json`   | 各 app `tsconfig.node.json` extends               |

**与根目录的区别**：

```
根目录的 eslint.config.ts        →  "使用哪个配置"（消费者）
shared-config 的 eslint/index.ts →  "配置长什么样"（生产者）

根目录的 .prettierrc.js          →  "格式化规则是什么"（直接配置）
shared-config                     →  Prettier 不需要工厂，根级直接配置即可
```

**什么时候新建 `packages/` 下的包？**

| 场景                           | 做法                             |
| ------------------------------ | -------------------------------- |
| 配置/规则需要被 2+ 个 app 共享 | ✅ 放入 `packages/shared-config` |
| 工具函数被 2+ 个 app 共享      | ✅ 新建 `packages/shared-utils`  |
| 业务类型被 2+ 个 app 共享      | ✅ 新建 `packages/shared-types`  |
| 只有 1 个 app 使用             | ❌ 放在该 app 内部               |

### Layer 3：apps/ — 业务应用层

> **原则**：只放「这个 app 独有」的业务代码和差异化配置。

| 文件               | 职责        | 为什么在 app 级                                           |
| ------------------ | ----------- | --------------------------------------------------------- |
| `vite.config.ts`   | 构建配置    | 每个 app 有不同的插件、端口、分包策略                     |
| `unocss.config.ts` | CSS 配置    | 每个 app 可能扫描不同的组件路径                           |
| `eslint.config.ts` | ESLint 入口 | 2 行代码调用共享工厂，ESLint Flat Config 要求就近配置文件 |
| `tsconfig/`        | TS 配置     | extends 共享基础 + app 专属路径别名                       |
| `envs/`            | 环境变量    | 每个 app 的 domain / title / API URL 不同                 |
| `src/`             | 业务源码    | 核心业务各不相同                                          |

**一个 app 的 eslint.config.ts 长什么样？**

```typescript
// 仅 2 行 — 所有规则来自共享工厂
import { createEslintConfig } from '@robot-admin/shared-config/eslint'
export default createEslintConfig()
```

> 这不是 "每个项目单独配置"，而是 "每个项目有一个指针指向统一规则"。ESLint Flat Config 的设计要求配置文件与项目目录对应，2 行指针是最优雅的实现。

### 应用对比

| 特性         |    admin-internal 🏢    |     admin-saas ☁️     |
| ------------ | :---------------------: | :-------------------: |
| **定位**     |     企业内部完整版      |   SaaS 多租户轻量版   |
| **包名**     | `@robot-admin/internal` |  `@robot-admin/saas`  |
| **版本**     |          2.2.0          |         1.0.0         |
| **端口**     |          1988           |         1989          |
| **标题**     | ROBOT ADMIN \| INTERNAL |  ROBOT ADMIN \| SAAS  |
| **功能范围** |     55+ 个功能演示      |   按需裁剪核心页面    |
| **独立构建** |           ✅            |          ✅           |
| **独立部署** |           ✅            |          ✅           |
| **共享配置** |  ✅ 继承 shared-config  | ✅ 继承 shared-config |

---

## 🆚 社区最佳实践对比

### Turborepo / Nx 典型 Monorepo 结构

```
典型社区 Monorepo                         Robot Admin Monorepo
──────────────────                       ──────────────────────

ROOT/                                    ROOT/
├── .eslintrc.js  ← 根配置               ├── eslint.config.ts     ← 根配置（packages/）
├── .prettierrc   ← 根配置               ├── .prettierrc.js       ← 根配置 ✓
├── commitlint    ← 根配置               ├── commitlint.config.js ← 根配置 ✓
├── .husky/       ← 根 hooks             ├── .husky/              ← 根 hooks ✓
├── lint-staged   ← 根配置               ├── lint-staged          ← 根 package.json ✓
├── turbo.json    ← 任务编排              ├── (Bun scripts)        ← 内置 filter ✓
│                                        │
├── packages/                            ├── packages/
│   ├── eslint-config/  ← 规则工厂       │   └── shared-config/    ← 规则 + 构建工厂 ✓
│   ├── ts-config/      ← TS 预设        │       ├── eslint/       ← createEslintConfig()
│   ├── ui/             ← 共享组件        │       ├── vite/         ← createViteConfig()
│   ├── utils/          ← 共享工具        │       └── tsconfig/     ← TS 基础预设
│   └── types/          ← 共享类型        │
│                                        │   (共享组件/工具/类型当前由 npm 包提供：
├── apps/                                │    @robot-admin/naive-ui-components 等)
│   ├── web/                             │
│   │   ├── eslint.config → extends      ├── apps/
│   │   ├── tsconfig → extends           │   ├── admin-internal/
│   │   └── next.config → 独立           │   │   ├── eslint.config → createEslintConfig()
│   └── docs/                            │   │   ├── tsconfig → extends shared-config
│       ├── eslint.config → extends      │   │   ├── vite.config → createViteConfig()
│       └── tsconfig → extends           │   │   └── unocss.config → 独立
│                                        │   └── admin-saas/ (同构)
└── (turbo|Makefile)                     │
                                         └── package.json (Bun workspaces + 治理)
```

### 关键差异说明

| 维度              | 社区典型方案                     | Robot Admin 方案            | 说明                               |
| ----------------- | -------------------------------- | --------------------------- | ---------------------------------- |
| **任务编排**      | Turborepo / Nx                   | `bun --filter`              | Bun 原生 filter 足够，无需额外工具 |
| **共享组件/工具** | `packages/ui` + `packages/utils` | `@robot-admin/*` npm 包     | 已发布 8 个 npm 包，跨仓复用更灵活 |
| **ESLint 规则**   | 独立 `@repo/eslint-config` 包    | `shared-config/eslint` 导出 | 同一包内多配置导出，更轻量         |
| **Vite 构建**     | 各 app 完全独立                  | `shared-config/vite` 工厂   | 统一 optimizeDeps / env / analyzer |
| **部署**          | CI matrix 或 turbo deploy        | Vercel 单项目 + vercel.json | 按需扩展                           |

### 这种架构的优势

```
┌── 传统方式（每个项目独立配置）
│   app-1: eslint 180行 + prettier 20行 + commitlint 30行 + husky + lint-staged
│   app-2: eslint 180行 + prettier 20行 + commitlint 30行 + husky + lint-staged
│   app-3: eslint 180行 + prettier 20行 + commitlint 30行 + husky + lint-staged
│   → 690 行配置 × N 份副本 → 修一个规则要改 N 处
│
└── Robot Admin Monorepo
    root:          prettier 20行 + commitlint 30行 + husky + lint-staged（全仓 1 份）
    shared-config: eslint 工厂 180行（全仓 1 份）
    app-1:         eslint.config.ts 2行
    app-2:         eslint.config.ts 2行
    app-3:         eslint.config.ts 2行
    → 改一处规则，全仓立即生效
```

---

## 🛠️ 技术栈

| 技术           | 版本  | 用途                                      |
| -------------- | ----- | ----------------------------------------- |
| **Vue**        | 3.5   | 渐进式前端框架                            |
| **Vite**       | 8.x   | 基于 Rolldown / OXC 的下一代构建工具      |
| **TypeScript** | 5.8   | 类型安全                                  |
| **Naive UI**   | 2.44+ | 企业级 UI 组件库                          |
| **Pinia**      | 3.0   | 状态管理                                  |
| **Vue Router** | 4.6   | 路由系统                                  |
| **UnoCSS**     | 66+   | 原子化 CSS（Wind3 + Attributify + Icons） |
| **ECharts**    | 6.0   | 数据可视化                                |
| **Sass**       | 1.97+ | 样式预处理                                |
| **Bun**        | ≥1.3  | 包管理器 + 运行时                         |

### @robot-admin/\* 包生态

| 包名                               | 功能                                     | 版本   |
| ---------------------------------- | ---------------------------------------- | ------ |
| `@robot-admin/naive-ui-components` | 51 个业务组件（Form / Table / Upload …） | 0.6.31 |
| `@robot-admin/layout`              | 6 种布局模式 + 设置面板                  | 2.2.0  |
| `@robot-admin/request-core`        | Axios + 7 插件 + useTableCrud            | 0.1.3  |
| `@robot-admin/theme`               | 主题切换（Light / Dark / System）        | 0.1.1  |
| `@robot-admin/directives`          | 11 个 Vue 指令                           | 1.1.0  |
| `@robot-admin/form-validate`       | 48+ 表单验证规则                         | 2.0.0  |
| `@robot-admin/file-utils`          | 文件处理（Excel / ZIP / 分片上传）       | 1.0.0  |
| `@robot-admin/git-standards`       | Git 工程化标准                           | 1.0.3  |

---

## 🚀 快速开始

### 环境要求

| 工具        | 版本   | 安装指南                         |
| ----------- | ------ | -------------------------------- |
| **Node.js** | ≥ 22.x | [nodejs.org](https://nodejs.org) |
| **Bun**     | ≥ 1.3  | [bun.sh](https://bun.sh)         |

```bash
# 验证环境
node -v   # v22.x+
bun -v    # 1.3.x+
```

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin
git checkout monorepo-upgrade

# 安装所有 workspace 依赖（一次安装，全仓生效）
bun install
```

**两个应用独立运行，按需启动：**

| 应用               | 命令               | 地址                  | 定位                   |
| ------------------ | ------------------ | --------------------- | ---------------------- |
| **admin-internal** | `bun run dev`      | http://localhost:1988 | 企业内部完整版（默认） |
| **admin-saas**     | `bun run dev:saas` | http://localhost:1989 | SaaS 多租户版          |

```bash
# 启动内部版（日常开发首选）
bun run dev

# 启动 SaaS 版
bun run dev:saas

# 同时开发两个应用？分别在两个终端窗口运行以上命令即可，端口不冲突
```

> **注意**：两个 app 完全独立，各有自己的 `envs/`、`src/`、`dist/`，共享同一套治理规则（ESLint / Prettier / Commitlint）和构建工厂（createViteConfig）。

---

## 📋 命令速查

### Workspace 级（根目录执行）

| 命令                     | 说明                            |
| ------------------------ | ------------------------------- |
| `bun run dev`            | 启动 internal 应用              |
| `bun run dev:internal`   | 同上                            |
| `bun run dev:saas`       | 启动 saas 应用                  |
| `bun run build`          | 构建所有应用                    |
| `bun run build:internal` | 仅构建 internal                 |
| `bun run build:saas`     | 仅构建 saas                     |
| `bun run lint`           | 全仓代码检查（packages + apps） |
| `bun run lint:apps`      | 所有应用代码检查                |
| `bun run lint:packages`  | packages 代码检查               |
| `bun run format`         | 全仓格式化（Prettier）          |
| `bun run type-check`     | TypeScript 类型检查             |
| `bun run clean`          | 清理构建产物                    |
| `bun run clean:modules`  | 清理所有 node_modules           |
| `bun run fresh`          | 清理并重装依赖                  |
| `bun run cz`             | 规范化 Git 提交（Commitizen）   |

### 单应用级（进入 `apps/*` 目录）

| 命令                     | 说明                     |
| ------------------------ | ------------------------ |
| `bun run dev`            | 开发服务器               |
| `bun run dev:local`      | 本地包联调模式           |
| `bun run dev:components` | 组件库联调模式           |
| `bun run dev:devtools`   | 启用 Vue DevTools        |
| `bun run build`          | 生产构建                 |
| `bun run build:test`     | 测试环境构建             |
| `bun run build:staging`  | 预发布构建（含 profile） |
| `bun run lint`           | Oxlint + ESLint 双重检查 |
| `bun run format`         | Prettier 格式化          |
| `bun run type-watch`     | vue-tsc 实时类型检查     |
| `bun run analyze`        | 构建产物分析             |

---

## 📦 依赖治理策略

### 依赖三层分配原则

```
                          ┌─────────────────────────────────────┐
                          │          ROOT devDependencies        │
                          │                                     │
                          │  治理类：eslint / prettier / oxlint │
                          │  提交类：commitlint / husky / cz    │
                          │  基础类：typescript / @types/node    │
                          │  共享包：@robot-admin/shared-config  │
                          └──────────┬──────────────────────────┘
                                     │  Bun hoisting
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
          ┌──────────────────┐            ┌──────────────────┐
          │  app devDeps     │            │  package devDeps  │
          │                  │            │                   │
          │  构建：vite      │            │  类型检查专用：    │
          │  UI：naive-ui    │            │  eslint-plugin-*  │
          │  CSS：unocss     │            │  @vue/eslint-*    │
          │  插件：unplugin  │            │  @tsconfig/node22 │
          │  检查：vue-tsc   │            └──────────────────-┘
          └──────────────────┘
```

| 层级                         | 放什么                  | 典型示例                                                             |
| ---------------------------- | ----------------------- | -------------------------------------------------------------------- |
| **根 `devDependencies`**     | 全仓治理工具 + 基础类型 | eslint, prettier, oxlint, commitlint, husky, lint-staged, typescript |
| **app `dependencies`**       | 应用运行时              | vue, vue-router, pinia, naive-ui, @robot-admin/\*                    |
| **app `devDependencies`**    | 应用构建工具            | vite, unocss, unplugin-\*, vue-tsc, sass                             |
| **shared-config `devDeps`**  | 包自身类型检查          | eslint-plugin-vue, @vue/eslint-config-\*                             |
| **shared-config `peerDeps`** | 声明运行时需要          | eslint, vite（由 root 或 app 提供）                                  |

### 添加依赖

```bash
# 给某个应用添加依赖
bun --filter @robot-admin/internal add <package>

# 给根工作区添加治理工具
bun add -d <package>    # 在根目录执行

# 给共享包添加依赖
cd packages/shared-config && bun add -d <package>
```

---

## 🔨 构建与部署

### 生产构建

```bash
# 构建所有应用
bun run build

# 单独构建
bun run build:internal    # → apps/admin-internal/dist/
bun run build:saas        # → apps/admin-saas/dist/
```

### Vite 8 构建特性

| 特性                     | 说明                                                      |
| ------------------------ | --------------------------------------------------------- |
| **Rolldown**             | 替代 Rollup，Rust 编写的打包器，构建速度提升数倍          |
| **OXC**                  | 替代 esbuild / SWC 的 Rust 编译器                         |
| **codeSplitting.groups** | 智能代码分割（vue-vendor / ui-vendor / echarts-vendor …） |
| **LightningCSS**         | 原生 CSS 压缩与转换                                       |

### 部署策略

#### 策略一：独立部署（推荐）

> 每个 app 独立部署到不同的域名/服务器，互不影响。

```
bun run build:internal  →  apps/admin-internal/dist/  →  internal.example.com
bun run build:saas      →  apps/admin-saas/dist/      →  saas.example.com
```

**CI/CD 示例（GitHub Actions）**：

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-internal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build:internal
      - name: Deploy to internal.example.com
        uses: your-deploy-action@v1
        with:
          source: apps/admin-internal/dist/

  deploy-saas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build:saas
      - name: Deploy to saas.example.com
        uses: your-deploy-action@v1
        with:
          source: apps/admin-saas/dist/
```

**独立部署到不同的 Vercel 项目**：

每个 app 创建独立的 Vercel 项目，在 Vercel Dashboard 中设置：

| 设置项           | admin-internal 项目        | admin-saas 项目        |
| ---------------- | -------------------------- | ---------------------- |
| Root Directory   | `.` （monorepo 根）        | `.` （monorepo 根）    |
| Build Command    | `bun run build:internal`   | `bun run build:saas`   |
| Output Directory | `apps/admin-internal/dist` | `apps/admin-saas/dist` |
| Install Command  | `bun install`              | `bun install`          |

> 当前仓库的 `vercel.json` 默认构建 admin-internal。若需部署 admin-saas，创建新的 Vercel 项目并覆盖 Build Command。
>
> ⚠️ **注意**：`.vercelignore` 中 **不能** 忽略 `packages/` 目录，否则 Vercel 构建环境中 `@robot-admin/shared-config` 无法解析。如需忽略包的构建产物，使用 `packages/*/dist` 而非 `packages/`。

#### 策略二：统一部署（Docker / Nginx）

> 所有 app 构建到同一服务器，通过路径或子域名区分。

```bash
# 构建所有 app
bun run build

# 产物结构
apps/
├── admin-internal/dist/   →  /internal/
└── admin-saas/dist/       →  /saas/
```

**Nginx 配置示例**：

```nginx
server {
    listen 80;
    server_name admin.example.com;

    # 内部版 — 主路径
    location / {
        root /var/www/internal;
        try_files $uri $uri/ /index.html;
    }

    # SaaS 版 — 子路径
    location /saas {
        alias /var/www/saas;
        try_files $uri $uri/ /saas/index.html;
    }
}
```

**Docker 多阶段构建示例**：

```dockerfile
# 阶段 1：安装 + 构建
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

# 阶段 2：Nginx 托管
FROM nginx:alpine
COPY --from=builder /app/apps/admin-internal/dist /usr/share/nginx/html/internal
COPY --from=builder /app/apps/admin-saas/dist /usr/share/nginx/html/saas
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### 策略三：按需部署（Git 变更检测）

> 只构建发生变更的 app，节省 CI 时间。

```yaml
# GitHub Actions — 变更检测
jobs:
  detect:
    outputs:
      internal: ${{ steps.filter.outputs.internal }}
      saas: ${{ steps.filter.outputs.saas }}
    steps:
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            internal:
              - 'apps/admin-internal/**'
              - 'packages/shared-config/**'
            saas:
              - 'apps/admin-saas/**'
              - 'packages/shared-config/**'

  deploy-internal:
    needs: detect
    if: needs.detect.outputs.internal == 'true'
    # ...构建 + 部署 internal

  deploy-saas:
    needs: detect
    if: needs.detect.outputs.saas == 'true'
    # ...构建 + 部署 saas
```

> **注意**：`packages/shared-config/**` 变更会触发所有 app 重新构建，因为它影响构建行为。

---

## 🧩 集成指南

### 新增一个应用

```bash
# 1. 在 apps/ 下复制模板
cp -r apps/admin-internal apps/admin-new

# 2. 修改 package.json
#    name: "@robot-admin/new-app"
#    version: "1.0.0"

# 3. 修改端口号（避免冲突：internal 1988 / saas 1989）
# 4. 修改 envs/ 中的 VITE_APP_TITLE
# 5. bun install（自动加入 workspace）
# 6. bun --filter @robot-admin/new-app dev
```

**检查清单**：

- [ ] `package.json` name 唯一：`@robot-admin/xxx`
- [ ] `tsconfig/` extends 自 `@robot-admin/shared-config/tsconfig/app` 和 `node`
- [ ] `eslint.config.ts` 使用 `createEslintConfig()`
- [ ] `vite.config.ts` 使用 `createViteConfig()`
- [ ] `devDependencies` 包含 `"@robot-admin/shared-config": "workspace:*"`
- [ ] 端口号不冲突
- [ ] `VITE_APP_TITLE` 已设置
- [ ] 根 `tsconfig.json` 已添加 `references` 指向新 app

### 新增一个共享包

```bash
# 1. 创建包目录
mkdir -p packages/shared-utils/src

# 2. 初始化 package.json
cat > packages/shared-utils/package.json << 'EOF'
{
  "name": "@robot-admin/shared-utils",
  "version": "1.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

# 3. 在需要的 app 中添加依赖
bun --filter @robot-admin/internal add @robot-admin/shared-utils@workspace:*

# 4. 直接导入使用
# import { xxx } from '@robot-admin/shared-utils'
```

---

## 🔮 演进路线图

### 当前架构可扩展方向

```
Robot_Admin/
├── apps/
│   ├── admin-internal/          ← ✅ 已有：企业内部完整版
│   ├── admin-saas/              ← ✅ 已有：SaaS 多租户版
│   ├── admin-mobile/            ← 🔮 未来：移动端 H5
│   ├── admin-electron/          ← 🔮 未来：桌面端（Electron）
│   └── admin-docs/              ← 🔮 未来：VitePress 文档站
│
├── packages/
│   ├── shared-config/           ← ✅ 已有：ESLint + Vite + TSConfig 工厂
│   ├── shared-types/            ← 🔮 提取：跨 app 共享 TypeScript 类型
│   ├── shared-utils/            ← 🔮 提取：跨 app 共享工具函数 / hooks
│   ├── shared-api/              ← 🔮 提取：跨 app 共享 API 定义 + 类型
│   └── shared-components/       ← 🔮 提取：跨 app 共享业务组件（非 npm 发布）
│
└── (不会放在这里的)
    └── @robot-admin/* npm 包     ← 已独立仓库发布，通过 npm 安装
```

### 共享提取决策树

```
某段代码/类型需要在 app 间共享？
  │
  ├─ 否 → 留在当前 app 内
  │
  └─ 是 → 是否需要发布到 npm？
       │
       ├─ 是 → 放到独立仓库（@robot-admin/* 生态）
       │
       └─ 否 → 放到 packages/ 下
            │
            ├─ 是配置/预设 → packages/shared-config
            ├─ 是类型定义 → packages/shared-types
            ├─ 是工具函数 → packages/shared-utils
            ├─ 是 API 层  → packages/shared-api
            └─ 是 UI 组件 → packages/shared-components
```

### 未来支持的部署场景

| 场景               | 工具                     | 说明                                  |
| ------------------ | ------------------------ | ------------------------------------- |
| **SPA 静态部署**   | Vercel / Netlify / Nginx | 当前方案，各 app 独立 dist/           |
| **SSR 服务端渲染** | Nitro / Node.js          | 新增 `apps/admin-ssr/`，Vite SSR 模式 |
| **Docker 容器化**  | Docker Compose           | 多阶段构建 + Nginx / Node 托管        |
| **K8s 编排**       | Helm Chart               | 每个 app 一个 Deployment + Service    |
| **CDN 分发**       | CloudFlare / OSS         | dist/ 上传到 CDN，配合域名解析        |
| **桌面端**         | Electron Builder         | `apps/admin-electron/`，复用 Vue 源码 |

---

## 🤝 贡献指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)，Quick Start：

```bash
# 1. Fork & Clone
git clone https://github.com/你的用户名/Robot_Admin.git && cd Robot_Admin

# 2. 安装依赖
bun install

# 3. 创建功能分支
git checkout -b feat/your-feature

# 4. 开发 & 提交（使用规范化提交）
bun run cz

# 5. 推送 & 创建 PR
git push origin feat/your-feature
```

### 提交规范

```
<type>(<scope>): <subject>
```

**Type**：`feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `chore` · `deps` · `wip`

**Scope**：`components` · `views` · `stores` · `router` · `api` · `config` · `monorepo` · …

---

## 📄 License

[MIT License](./LICENSE) — Copyright (c) 2026 ChenY
