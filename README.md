<div align="center">
  <a href="https://robotadmin.cn">
    <picture>
      <source srcset="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" media="(prefers-color-scheme: dark)">
      <img src="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" height="120" />
    </picture>
  </a>

  <h1>
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=3000&pause=1000&color=9B59B6&background=FFFFFF00&center=true&vCenter=true&multiline=true&width=700&height=100&lines=🔮+Robot+Admin+—+Module+Federation;运行时共享+·+独立部署+·+按需加载" alt="Robot Admin — Module Federation" />
  </h1>

  <p><strong>基于 @module-federation/vite + Vite 8 (Rolldown) + @robot-admin 包生态的新一代微前端架构</strong></p>

  <p>
    <img src="https://img.shields.io/badge/bun-%E2%89%A51.x-ff1e56?style=flat&logo=bun" alt="Bun">
    <img src="https://img.shields.io/badge/vue-3.5.13-4FC08D?style=flat&logo=vue.js" alt="Vue">
    <img src="https://img.shields.io/badge/typescript-5.8-blue?style=flat&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/vite-8_(Rolldown)-646CFF?style=flat&logo=vite" alt="Vite 8">
    <img src="https://img.shields.io/badge/@module--federation/vite-1.13.5-9B59B6?style=flat" alt="MF">
    <img src="https://img.shields.io/badge/naive--ui-2.41+-18A058?style=flat" alt="Naive UI">
  </p>
  <p>
    <img src="https://img.shields.io/github/stars/ChenyCHENYU/robot_admin?style=social" alt="Stars">
    <img src="https://img.shields.io/github/forks/ChenyCHENYU/robot_admin?style=social" alt="Forks">
  </p>

  <!-- 分支导航 -->
  <table>
    <tr>
      <td align="center" width="200">
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/main">
          <img src="https://img.shields.io/badge/🏗️-单体架构-4A90E2?style=for-the-badge" alt="Monolithic">
        </a><br>
        <sub>main 分支</sub>
      </td>
      <td align="center" width="200">
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/monorepo">
          <img src="https://img.shields.io/badge/📦-Monorepo-00D8FF?style=for-the-badge" alt="Monorepo">
        </a><br>
        <sub>monorepo 分支</sub>
      </td>
      <td align="center" width="200">
        <img src="https://img.shields.io/badge/🔮-模块联邦-9B59B6?style=for-the-badge" alt="Module Federation"><br>
        <sub><strong>👉 当前分支</strong></sub>
      </td>
      <td align="center" width="200">
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/micro-app">
          <img src="https://img.shields.io/badge/🚀-微前端-E74C3C?style=for-the-badge" alt="Micro Frontend">
        </a><br>
        <sub>micro-app 分支</sub>
      </td>
    </tr>
  </table>

  <p>
    <a href="https://robotadmin.cn">
      <img src="https://img.shields.io/badge/🚀-在线体验-00D8FF?style=for-the-badge&logo=vercel" alt="Live Demo">
    </a>
    <a href="https://www.tzagileteam.com">
      <img src="https://img.shields.io/badge/📖-完整文档-FF6B6B?style=for-the-badge&logo=gitbook" alt="Docs">
    </a>
    <a href="./README_EN.md">
      <img src="https://img.shields.io/badge/🌍-English-95E1D3?style=for-the-badge" alt="English">
    </a>
  </p>
</div>

---

## 目录

- [架构总览](#-架构总览)
- [项目结构](#-项目结构)
- [插拔式架构](#-插拔式架构)
- [快速开始](#-快速开始)
- [@robot-admin 包生态](#-robot-admin-包生态)
- [模块联邦配置详解](#-模块联邦配置详解)
- [Vue Bridge 集成](#-vue-bridge-集成)
- [共享依赖策略](#-共享依赖策略)
- [子应用集成指南](#-子应用集成指南)
- [应用间通信](#-应用间通信)
- [CSS 隔离](#-css-隔离)
- [部署策略](#-部署策略)
- [技术栈](#-技术栈)
- [路线图](#-路线图)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)

---

## 🔮 架构总览

Robot Admin Module Federation 采用 **Remote / Host** 双角色架构：主应用 (`robotAdmin`) 作为 **Remote** 暴露核心组件，子应用作为 **Host** 按需消费远程模块。

```
┌─────────────────────────────────────────────────────────┐
│                    Remote — robotAdmin                   │
│                      端口 1988 (dev)                      │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ ┌──────┐ │
│  │  Table  │ │  Form   │ │  Tree   │ │ Icon │ │Editor│ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──┬───┘ └──┬───┘ │
│       └───────────┴──────┬────┴──────────┴────────┘     │
│                          │                              │
│                 remoteEntry.js                          │
│                 + mf-manifest.json                      │
└──────────────────────────┬──────────────────────────────┘
                           │  运行时加载（ESM Import）
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌──────────────┐ ┌──────────┐ ┌──────────┐
     │  logistics   │ │  子应用B  │ │  子应用C  │
     │  端口 2001   │ │   ...    │ │   ...    │
     │  (Host)      │ │  (Host)  │ │  (Host)  │
     └──────────────┘ └──────────┘ └──────────┘

共享依赖（singleton）: vue / vue-router / pinia / naive-ui
                       @vueuse/core / @iconify/vue
                       @robot-admin/naive-ui-components
                       @robot-admin/request-core
                       @robot-admin/directives
```

### 核心特性

| 特性               | 说明                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **运行时共享**     | Vue / Pinia / Naive UI 等 9 个依赖 singleton 共享，不重复加载             |
| **Manifest 模式**  | 子应用通过 `mf-manifest.json` 动态发现可用模块，无需硬编码版本            |
| **Runtime Plugin** | 远程加载失败自动兜底空组件，防止白屏崩溃                                  |
| **Dev HMR**        | `@module-federation/vite` 官方支持开发环境热更新                          |
| **CSS 隔离**       | `MfRemoteContainer` + `cls-prefix` 命名空间，样式零泄漏                   |
| **包生态驱动**     | 8 个 `@robot-admin/*` npm 包统一导出，暴露文件一行代码                    |
| **Vue Bridge**     | `@module-federation/bridge-vue3` — 应用级联邦，暴露/加载整个 Vue 应用     |
| **插拔式架构**     | `federation/` 契约层 — Monorepo 路径引用 / Multi-repo 发 npm 包，随时切换 |
| **独立部署**       | 主应用、子应用独立构建部署，互不阻塞                                      |
| **全环境配置**     | dev / test / staging / production 四套 MF 环境变量                        |

---

## 📁 项目结构

> **插拔式设计**：每个应用（`src/` 主应用、`sub-apps/*` 子应用）都是独立完整的项目，可在同一仓库协作开发，也可拆分为独立仓库独立部署。`federation/` 作为应用间的唯一契约层，Monorepo 用路径引用，Multi-repo 发布为 npm 包引用。

```
Robot_Admin/
├── federation/                        # 🔗 联邦集成层（应用间唯一契约层）
│   ├── index.ts                       #    统一入口
│   ├── bridge/                        # 🌉 Vue Bridge — 应用级联邦通信
│   │   ├── index.ts                   #    统一出口
│   │   ├── create-provider.ts         #    Provider 封装 — 暴露整个 Vue 应用
│   │   └── create-consumer.ts         #    Consumer 封装 — 加载远程 Vue 应用
│   ├── runtime/                       # ⚡ 运行时插件
│   │   └── index.ts                   #    错误兜底 + 日志 + 动态 URL
│   ├── exposes/                       # 📤 模块暴露入口
│   │   ├── Table.ts                   #    → @robot-admin/naive-ui-components
│   │   ├── Form.ts                    #    → @robot-admin/naive-ui-components
│   │   ├── Tree.ts                    #    → @robot-admin/naive-ui-components
│   │   ├── Icon.ts                    #    → @robot-admin/naive-ui-components
│   │   └── Editor.ts                  #    → @robot-admin/naive-ui-components
│   ├── shared/                        # 🔗 跨应用共享
│   │   ├── index.ts                   #    统一出口
│   │   ├── constants.ts               #    应用名 / 端口 / 暴露路径注册表
│   │   ├── types.ts                   #    公共类型（RemoteModuleInfo, ApiResponse...）
│   │   └── utils.ts                   #    buildRemoteEntry() 等工具函数
│   └── README.md                      #    联邦层详细说明
│
├── src/                               # 🏠 主应用源码（Remote + 业务）
│   ├── components/
│   │   ├── global/                    #    布局桥接组件（其余 51+ 个由 npm 包自动解析）
│   │   └── local/
│   │       └── c_mf_remote_container/ #    远程组件容器（CSS 隔离 + 主题继承）
│   ├── views/                         #    页面（54+ 演示 + 系统管理）
│   ├── stores/                        #    Pinia 状态管理
│   ├── router/                        #    路由（动态路由 + 权限守卫）
│   ├── composables/                   #    组合式 API
│   ├── hooks/                         #    自定义 Hooks
│   ├── api/                           #    接口管理
│   ├── types/                         #    TypeScript 类型
│   └── styles/                        #    全局样式
│
├── sub-apps/                          # 📡 子应用（各自独立，可拆为独立仓库）
│   └── logistics/                     #    物流管理子应用（完整参考实现）
│       ├── package.json               #    独立依赖，可独立 install & deploy
│       ├── vite.config.ts             #    Host 联邦配置（端口 2001）
│       ├── tsconfig.json              #    独立 TS 配置
│       └── src/
│           ├── views/
│           │   ├── Dashboard.vue      #    消费远程 Table + Icon
│           │   └── Waybill.vue        #    消费远程 Form + Icon
│           └── types/federation.d.ts  #    远程模块类型声明
│
├── envs/                              # 🔧 环境变量（四套）
│   ├── .env.development               #    VITE_MF_REMOTE_URL=localhost:1988
│   ├── .env.test                      #    测试环境地址
│   ├── .env.staging                   #    预发布 CDN 地址
│   └── .env.production                #    生产 CDN 地址
│
├── vite.config.ts                     # 🔮 主应用 Vite + MF Remote 配置
├── vercel.json                        #    Vercel 部署配置（MF 专用 headers）
└── package.json                       #    联邦脚本 + @robot-admin 依赖
```

---

## 🔌 插拔式架构

> **核心理念**：应用之间通过 `federation/` 契约层通信，而非直接耦合。无论 Monorepo 还是 Multi-repo，同一套代码零改动切换。

### Monorepo 模式（当前）

所有应用在同一仓库，`federation/` 通过相对路径引用：

```
Robot_Admin/               ← 仓库根
├── federation/            ← 契约层（相对路径引用）
├── src/                   ← 主应用（vite.config.ts → ./federation/...）
└── sub-apps/logistics/    ← 子应用（alias @federation → ../../federation）
```

### Multi-repo 模式（拆分后）

将 `federation/` 发布为 npm 包 `@robot-admin/federation`，各应用独立仓库安装即可：

```
@robot-admin/federation    ← npm 包（单独仓库维护）
robot-admin                ← 主应用仓库（import from '@robot-admin/federation'）
logistics-app              ← 子应用仓库（import from '@robot-admin/federation'）
```

### 切换方式

| 场景     | 引用方式                         | 改动量            |
| -------- | -------------------------------- | ----------------- |
| 同一仓库 | `../../federation` 相对路径      | 零 — 开箱即用     |
| 独立仓库 | `@robot-admin/federation` npm 包 | 改 alias + 安装包 |

---

## 🚀 快速开始

### 环境要求

| 工具        | 版本要求 | 说明                     |
| ----------- | -------- | ------------------------ |
| **Bun**     | >= 1.2   | 推荐最新版，唯一包管理器 |
| **Node.js** | >= 20.19 | 运行时环境               |
| **Git**     | >= 2.20  | 版本控制                 |

### 启动主应用（Remote，端口 1988）

```bash
# 克隆 module-federation 分支
git clone -b module-federation https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin

# 安装依赖
bun install

# 启动主应用（同时作为 Remote 提供 remoteEntry.js）
bun dev
# → http://localhost:1988
# → http://localhost:1988/remoteEntry.js  ← 子应用消费入口
# → http://localhost:1988/mf-manifest.json  ← 模块清单
```

### 启动物流子应用（Host，端口 2001）

```bash
# 新开终端，进入子应用目录
cd sub-apps/logistics

# 安装子应用独立依赖
bun install

# 启动子应用（作为 Host 消费主应用远程组件）
bun dev
# → http://localhost:2001
# 确保主应用已启动，否则远程组件加载会触发 Fallback
```

### 全部命令

```bash
# ─── 主应用开发 ───
bun dev                      # 主应用 Remote（端口 1988）
bun run dev:local            # 本地 @robot-admin 包联调
bun run dev:components       # 组件库联调
bun run dev:devtools         # 开启 Vue DevTools

# ─── 主应用构建 ───
bun run build                # 生产构建（生成 remoteEntry.js + mf-manifest.json）
bun run build:test           # 测试环境构建
bun run build:staging        # 预发布构建
bun run preview              # 本地预览构建产物

# ─── 子应用（在 sub-apps/logistics/ 目录下执行）───
bun dev                      # 物流子应用 Host（端口 2001）
bun run build                # 构建物流子应用

# ─── 代码质量 ───
bun run lint                 # Oxlint + ESLint 双引擎检查修复
bun run format               # Prettier 格式化
bun run type-watch           # 实时 TypeScript 类型检查
bun run analyze              # Bundle 可视化分析

# ─── 提交规范 ───
bun run cz                   # Commitizen 交互式规范提交
```

---

## 📦 @robot-admin 包生态

本分支深度集成 8 个 `@robot-admin/*` npm 包，实现代码极简化。所有组件、指令、请求层等均由包提供，本地仅保留布局桥接组件和业务逻辑。

| 包名                                 | 版本    | 职责                                           | 替代本地代码                           |
| ------------------------------------ | ------- | ---------------------------------------------- | -------------------------------------- |
| **@robot-admin/naive-ui-components** | 0.6.31+ | 51+ 企业级组件 + RobotNaiveUiResolver 自动解析 | `src/components/global/` 31 个组件目录 |
| **@robot-admin/request-core**        | 0.1.3   | Axios 封装 + 7 个插件 + useTableCrud           | `src/axios/` 整个目录                  |
| **@robot-admin/directives**          | 1.1.0   | 11 个 Vue3 自定义指令                          | `src/directives/` 整个目录             |
| **@robot-admin/file-utils**          | 1.0.0   | Excel / 下载 / ZIP / 图片 / 分片上传           | `src/hooks/` 6 个 hooks                |
| **@robot-admin/layout**              | 2.2.0   | 6 种布局模式 + 设置管理                        | 本地布局配置逻辑                       |
| **@robot-admin/theme**               | 0.1.1   | 主题切换（深色/浅色/跟随系统）                 | 基础主题 store                         |
| **@robot-admin/form-validate**       | 2.0.0   | 企业级表单验证 PRESET_RULES（48+ 规则）        | —                                      |
| **@robot-admin/git-standards**       | 1.0.3   | Commitizen + ESLint + Husky 规范               | 本地 commitlint 配置                   |

> **RobotNaiveUiResolver** 自动解析 51+ 组件（以 `C_` 前缀匹配），全局无需手动 import 或注册。

---

## 🔮 模块联邦配置详解

### 主应用 Remote 配置（vite.config.ts）

```typescript
import { federation } from '@module-federation/vite'

federation({
  name: 'robotAdmin',
  filename: 'remoteEntry.js',

  // 暴露 5 个核心组件（全部从 npm 包统一导出，零维护成本）
  exposes: {
    './Table': './federation/exposes/Table.ts',
    './Form': './federation/exposes/Form.ts',
    './Tree': './federation/exposes/Tree.ts',
    './Icon': './federation/exposes/Icon.ts',
    './Editor': './federation/exposes/Editor.ts',
  },

  remotes: {}, // 主应用仅作为 Remote，不消费其他远程模块

  // 共享依赖 — singleton 保证全局唯一实例
  shared: {
    vue: { singleton: true, requiredVersion: '^3.5.0' },
    'vue-router': { singleton: true },
    pinia: { singleton: true },
    'naive-ui': { singleton: true },
    '@vueuse/core': { singleton: true },
    '@iconify/vue': { singleton: true },
    '@robot-admin/naive-ui-components': { singleton: true },
    '@robot-admin/request-core': { singleton: true },
    '@robot-admin/directives': { singleton: true },
  },

  manifest: true, // 生成 mf-manifest.json（子应用可动态发现模块）
  runtimePlugins: ['./federation/runtime/index.ts'],
})
```

### 暴露文件格式

每个暴露文件仅一行 — 从 npm 包统一导出，保证版本一致性：

```typescript
// federation/exposes/Table.ts
export { C_Table as default } from '@robot-admin/naive-ui-components'

// federation/exposes/Form.ts
export { C_Form as default } from '@robot-admin/naive-ui-components'

// federation/exposes/Icon.ts
export { C_Icon as default } from '@robot-admin/naive-ui-components'

// federation/exposes/Tree.ts
export { C_Tree as default } from '@robot-admin/naive-ui-components'

// federation/exposes/Editor.ts
export { C_Editor as default } from '@robot-admin/naive-ui-components'
```

### Runtime Plugin 三大钩子

`federation/runtime/index.ts` 注册运行时插件，处理三类场景：

| 钩子              | 触发时机            | 行为                               |
| ----------------- | ------------------- | ---------------------------------- |
| `beforeInit`      | 联邦初始化前        | 打印日志、注入环境信息             |
| `errorLoadRemote` | 远程模块加载失败    | 返回空 Fallback 组件，防止白屏崩溃 |
| `beforeRequest`   | 请求 remoteEntry 前 | 可根据环境变量动态修正 URL         |

```typescript
// 错误兜底示例 — 加载失败时不崩溃
errorLoadRemote({ id, error, options }) {
  console.error(`[MF Runtime] ❌ 远程模块 ${id} 加载失败:`, error)
  return () => ({
    // 返回空组件作为 Fallback
    __esModule: true,
    default: defineComponent({ template: '<div class="mf-fallback" />' }),
  })
}
```

---

## 🌉 Vue Bridge 集成

> **Exposes** 适合共享**单个组件**（Table / Form / Icon），**Bridge** 适合加载**整个 Vue 应用**（含路由 + Store + 生命周期）。

### Bridge vs Exposes 对比

|              | Bridge（应用级）                    | Exposes（组件级）   |
| ------------ | ----------------------------------- | ------------------- |
| **暴露粒度** | 整个 Vue 应用（含路由、状态、插件） | 独立组件            |
| **使用方式** | 路由挂载                            | `import()` 按需加载 |
| **适用场景** | 子应用嵌入、跨系统集成              | UI 组件库共享       |
| **示例**     | logistics 整个物流模块              | Table / Form / Icon |

### Provider（主应用暴露入口）

```typescript
// federation/bridge/create-provider.ts
import { createBridgeComponent } from '@module-federation/bridge-vue3'

export function createFederationProvider(options: { rootComponent: any }) {
  return createBridgeComponent(options)
}
```

### Consumer（子应用消费入口）

```typescript
// federation/bridge/create-consumer.ts
import { createRemoteAppComponent } from '@module-federation/bridge-vue3'

export function createFederationConsumer(options: {
  loader: () => Promise<any>
}) {
  return createRemoteAppComponent(options)
}
```

### 使用示例

```typescript
// 主应用暴露整个 App（在独立入口文件中）
import { createFederationProvider } from '../federation'
import App from './App.vue'
export default createFederationProvider({ rootComponent: App })

// 子应用消费远程整个 Vue 应用
import { createFederationConsumer } from '@federation'
const RemoteApp = createFederationConsumer({
  loader: () => import('robotAdmin/App'),
})
```

---

## 🔗 共享依赖策略

**设计原则：** 框架层 + UI 层 + 业务包层全部 `singleton: true`，保证 Host 和 Remote 使用同一份实例，避免 Vue 响应式断裂。

```
┌─────────────────────── singleton 共享 ────────────────────────┐
│                                                               │
│  框架层    vue / vue-router / pinia / @vueuse/core            │
│  UI 层     naive-ui / @iconify/vue                            │
│  业务包层  @robot-admin/naive-ui-components                   │
│            @robot-admin/request-core                          │
│            @robot-admin/directives                            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**为什么要共享 `@robot-admin/*` 包？**

- 组件内部使用 Vue 响应式 API，必须与 Host 共享同一个 Vue 实例
- 避免重复打包，大幅减少 Bundle 体积
- 保证远程组件与本地组件行为一致，UI 主题同步

---

## 🧩 子应用集成指南

### 1. 创建子应用

```bash
bun create vite my-sub-app --template vue-ts
cd my-sub-app
bun install
bun add -D @module-federation/vite
bun add vue pinia vue-router naive-ui \
     @robot-admin/naive-ui-components \
     @robot-admin/request-core \
     @robot-admin/directives
```

### 2. 配置 Host 联邦（vite.config.ts）

```typescript
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'mySubApp',
      filename: 'remoteEntry.js',
      remotes: {
        robotAdmin: {
          type: 'module',
          name: 'robotAdmin',
          // 开发环境指向主应用本地地址
          entry: 'http://localhost:1988/remoteEntry.js',
          // 生产环境推荐通过环境变量注入
          // entry: process.env.VITE_MF_REMOTE_URL,
        },
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.5.0' },
        'vue-router': { singleton: true },
        pinia: { singleton: true },
        'naive-ui': { singleton: true },
        '@vueuse/core': { singleton: true },
        '@iconify/vue': { singleton: true },
        '@robot-admin/naive-ui-components': { singleton: true },
        '@robot-admin/request-core': { singleton: true },
        '@robot-admin/directives': { singleton: true },
      },
    }),
  ],
  resolve: {
    alias: {
      // Monorepo 模式：相对路径引用联邦契约层
      '@federation': '../../federation',
      // Multi-repo 模式：npm 包引用
      // '@federation': '@robot-admin/federation',
    },
  },
  server: {
    port: 2001,
    cors: true, // ⚠️ 必须开启 CORS，远程加载需要
    origin: 'http://localhost:2001',
  },
})
```

### 3. 声明远程模块类型

```typescript
// src/types/federation.d.ts
declare module 'robotAdmin/Table' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module 'robotAdmin/Form' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module 'robotAdmin/Icon' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module 'robotAdmin/Tree' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module 'robotAdmin/Editor' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}
```

### 4. 消费远程组件

```vue
<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const RemoteTable = ref<any>(null)
  const RemoteIcon = ref<any>(null)

  onMounted(async () => {
    const [tableModule, iconModule] = await Promise.all([
      import('robotAdmin/Table'),
      import('robotAdmin/Icon'),
    ])
    RemoteTable.value = tableModule.default
    RemoteIcon.value = iconModule.default
  })

  const columns = [
    { title: 'ID', key: 'id' },
    { title: '名称', key: 'name' },
    { title: '状态', key: 'status' },
  ]
  const tableData = ref([
    { id: 1, name: '北京 → 上海', status: '运输中' },
    { id: 2, name: '深圳 → 广州', status: '已签收' },
  ])
</script>

<template>
  <component
    v-if="RemoteIcon"
    :is="RemoteIcon"
    icon="mdi:truck-delivery"
    :size="24"
  />
  <component
    v-if="RemoteTable"
    :is="RemoteTable"
    :data="tableData"
    :columns="columns"
  />
</template>
```

### 5. logistics 子应用实例

项目内置 `sub-apps/logistics/` 作为完整参考实现：

| 页面            | 消费的远程组件 | 说明                    |
| --------------- | -------------- | ----------------------- |
| `Dashboard.vue` | Table + Icon   | 运单数据表格 + 图标展示 |
| `Waybill.vue`   | Form + Icon    | 运单录入表单            |

```bash
# 启动参考子应用
cd sub-apps/logistics
bun install
bun dev        # → http://localhost:2001
```

---

## 💬 应用间通信

### federation/shared/ 共享常量与工具

`federation/shared/` 集中管理所有应用间共享的类型、常量和工具函数：

```typescript
// federation/shared/constants.ts
export const MF_APP_NAMES = {
  HOST: 'robotAdmin',
  LOGISTICS: 'logistics',
} as const

export const MF_EXPOSED_MODULES = {
  Table: './Table',
  Form: './Form',
  Tree: './Tree',
  Icon: './Icon',
  Editor: './Editor',
} as const

export const MF_DEV_PORTS = {
  robotAdmin: 1988,
  logistics: 2001,
} as const
```

```typescript
// federation/shared/utils.ts
export function buildRemoteEntry(appName: string, port: number): string {
  if (import.meta.env?.MODE === 'production') {
    return (
      import.meta.env?.[`VITE_MF_${appName.toUpperCase()}_URL`] ||
      `/${appName}/remoteEntry.js`
    )
  }
  return `http://localhost:${port}/remoteEntry.js`
}
```

### Pinia 共享状态

通过 `shared` 配置 `pinia: { singleton: true }`，Host 和 Remote 共享同一个 Pinia 实例，子应用可直接读取主应用的 Store：

```typescript
// 子应用中直接使用主应用的 Store（共享同一实例）
import { s_userStore } from '@/stores/user'
const userStore = s_userStore()
console.log(userStore.token) // 与主应用用户 token 完全同步
```

### 自定义事件通信

对于松耦合场景，使用 `CustomEvent` 跨应用通信：

```typescript
// Remote 派发事件
window.dispatchEvent(
  new CustomEvent('mf:theme-change', { detail: { mode: 'dark' } })
)

// Host 监听事件
window.addEventListener('mf:theme-change', (e: CustomEvent) => {
  applyTheme(e.detail.mode)
})
```

### Vue Bridge 应用级联邦

通过 `@module-federation/bridge-vue3` 实现整个 Vue 应用跨应用加载（不只是组件级，而是完整路由 + 状态 + 生命周期）：

```typescript
// 暴露方（federation/bridge/create-provider.ts）
export default createFederationProvider({ rootComponent: App })

// 消费方 — 加载远程整个 Vue 应用并挂载到路由
const RemoteApp = createFederationConsumer({
  loader: () => import('robotAdmin/App'),
})
// <RemoteApp /> 相当于在当前应用中完整运行主应用
```

---

## 🎨 CSS 隔离

三层隔离策略，防止 Host / Remote 样式互相污染：

### 1. MfRemoteContainer 容器隔离

```vue
<!-- src/components/local/c_mf_remote_container/index.vue -->
<template>
  <div
    :class="`${cssPrefix}-remote`"
    style="isolation: isolate; contain: style"
  >
    <NConfigProvider
      :cls-prefix="cssPrefix"
      :theme="theme"
      :theme-overrides="themeOverrides"
    >
      <slot />
    </NConfigProvider>
  </div>
</template>

<script setup lang="ts">
  // 使用固定前缀 "ra"，确保 Naive UI 类名不与 Host 冲突
  const cssPrefix = 'ra'
</script>
```

- `cls-prefix="ra"` — Naive UI 组件类名全部前缀化（如 `.ra-button`）
- `isolation: isolate` + `contain: style` — CSS 创建新的层叠上下文，样式不向外泄漏

### 2. UnoCSS 天然隔离

UnoCSS 原子类按需生成，不产生全局样式污染，Host / Remote 均可安全使用。

### 3. Vue scoped 样式

组件内 `<style scoped>` 生成唯一属性选择器，从根源杜绝样式冲突。

---

## 🚢 部署策略

### 独立部署（推荐）

主应用和子应用分别构建、分别部署，互不阻塞：

```bash
# 构建主应用（生成 remoteEntry.js + mf-manifest.json）
bun run build
# 部署到 CDN 根路径

# 构建物流子应用
cd sub-apps/logistics && bun run build
# 部署到 CDN /logistics/ 子路径
```

### 环境变量配置

在 `envs/` 目录下按环境配置 MF 远程地址：

| 环境        | VITE_MF_REMOTE_URL                           |
| ----------- | -------------------------------------------- |
| development | `http://localhost:1988/remoteEntry.js`       |
| test        | 测试服务器地址                               |
| staging     | 预发布 CDN 地址                              |
| production  | `https://cdn.your-domain.com/remoteEntry.js` |

### Nginx 反向代理

```nginx
# 主应用
location / {
  root /app/dist;
  try_files $uri $uri/ /index.html;
  # ⚠️ 关键：MF 请求需要跨域 headers
  add_header Access-Control-Allow-Origin *;
}

# 物流子应用
location /logistics/ {
  alias /app/sub-apps/logistics/dist/;
  try_files $uri $uri/ /logistics/index.html;
}
```

### Vercel 部署

```json
{
  "rewrites": [
    {
      "source": "/logistics/(.*)",
      "destination": "/sub-apps/logistics/dist/$1"
    },
    { "source": "/(.*)", "destination": "/dist/$1" }
  ],
  "headers": [
    {
      "source": "/remoteEntry.js",
      "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }]
    }
  ]
}
```

---

## 🏗️ 技术栈

| 分类       | 技术                             | 版本           | 说明                                      |
| ---------- | -------------------------------- | -------------- | ----------------------------------------- |
| **框架**   | Vue 3                            | 3.5.13         | Composition API                           |
| **语言**   | TypeScript                       | ~5.8           | 严格类型检查                              |
| **构建**   | Vite 8                           | 8.x (Rolldown) | 下一代 Rolldown 引擎，构建速度提升 10-30x |
| **联邦**   | @module-federation/vite          | ^1.13.5        | 官方维护，周下载 19 万+                   |
| **Bridge** | @module-federation/bridge-vue3   | ^2.2.3         | 应用级联邦通信                            |
| **UI**     | Naive UI                         | 2.41+          | 企业级组件库                              |
| **组件库** | @robot-admin/naive-ui-components | 0.6.31+        | 51+ 业务组件，自动导入                    |
| **样式**   | UnoCSS + Sass                    | 66+ / 1.87+    | 原子化 CSS + 预处理器                     |
| **包管理** | Bun                              | >= 1.2         | 极速安装，唯一包管理器                    |
| **状态**   | Pinia                            | 3.x            | 类型安全状态管理                          |
| **路由**   | Vue Router                       | 4.x            | 动态路由 + 权限守卫                       |
| **Lint**   | ESLint 10 + Oxlint               | —              | 双引擎代码质量保障                        |

---

## 📈 路线图

### ✅ P0 — 已完成

- [x] **federation/ 集成层** — 统一管理 Bridge、Runtime、Exposes、Shared
- [x] **5 个远程模块暴露** — Table / Form / Tree / Icon / Editor（一行代码，零维护）
- [x] **Vue Bridge 封装** — `@module-federation/bridge-vue3` Provider + Consumer 抽象
- [x] **Runtime Plugin** — errorLoadRemote Fallback + 日志 + 动态 URL 修正
- [x] **logistics 子应用** — 完整 Host 消费参考，包含 Dashboard + Waybill 两个页面
- [x] **插拔式架构** — Monorepo 路径引用 / Multi-repo npm 包，零改动切换
- [x] **共享依赖策略** — 9 个 singleton 共享，保证 Vue 响应式不断裂
- [x] **CSS 隔离方案** — MfRemoteContainer + cls-prefix + scoped 三层隔离

### 🔧 P1 — 进行中 / 高优先级

- [ ] **TypeScript dts 自动同步** — `federation({ dts: { generateTypes: true, consumeTypes: true } })`，子应用自动获取远程模块类型提示
- [ ] **更多模块暴露** — `useCopy` / `stores/user` / `stores/theme` 等 Composable 级暴露
- [ ] **动态远程发现** — 基于 mf-manifest.json 动态注册 Remote，无需重启

### 📋 P2 — 中优先级

- [ ] **灰度发布** — 基于 Manifest + CDN 多版本切换策略
- [ ] **性能监控** — Runtime Plugin 加载耗时埋点 + 远程模块预加载优化
- [ ] **更多子应用** — 增加 HR、财务等业务子应用参考实现

### 🔭 P3 — 远期规划

- [ ] **可视化微前端编排** — 拖拽式子应用路由管理
- [ ] **NestJS 全栈方案** — 后端服务集成，完整 Full-Stack 项目

---

## ❓ 常见问题

<details>
<summary><b>Q: 远程组件加载失败怎么办？</b></summary>

1. 确认主应用已启动：`curl http://localhost:1988/remoteEntry.js`
2. 检查 `envs/` 对应环境文件中的 `VITE_MF_REMOTE_URL` 地址是否正确
3. 查看控制台 `[MF Runtime] ❌` 日志定位具体错误
4. Runtime Plugin 会自动返回空 Fallback 组件，页面不会白屏崩溃

</details>

<details>
<summary><b>Q: 主应用和子应用版本不一致，组件行为异常？</b></summary>

检查 `shared` 配置中 `requiredVersion` 是否与实际安装版本匹配。Vue 必须使用 `singleton: true` + 匹配的版本范围，否则会出现双 Vue 实例导致响应式断裂。

</details>

<details>
<summary><b>Q: 如何新增一个暴露模块？</b></summary>

1. 在 `federation/exposes/` 下新建文件，一行导出：
   ```typescript
   // federation/exposes/Upload.ts
   export { C_Upload as default } from '@robot-admin/naive-ui-components'
   ```
2. 在 `vite.config.ts` 的 `exposes` 中注册：
   ```typescript
   exposes: { './Upload': './federation/exposes/Upload.ts' }
   ```
3. 在子应用 `src/types/federation.d.ts` 中添加类型声明
4. 重启两端开发服务器

</details>

<details>
<summary><b>Q: Monorepo 切换到 Multi-repo 需要改哪些？</b></summary>

1. 将 `federation/` 目录发布为 `@robot-admin/federation` npm 包
2. 各应用安装：`bun add @robot-admin/federation`
3. 修改 alias：`'@federation': '@robot-admin/federation'`
4. 其余代码**零改动**

</details>

<details>
<summary><b>Q: 为什么不用 vite.config.ts 中直接写 remotes，而是通过运行时加载？</b></summary>

静态配置 `remotes` 会在构建时硬编码远程地址，导致无法做灰度发布和动态切换。使用 `mf-manifest.json` + Runtime Plugin 可在运行时动态决定加载哪个版本的远程模块，更适合生产环境多版本并存场景。

</details>

---

## 🤝 贡献指南

欢迎贡献代码！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 提交规范

项目使用 Commitizen + Commitlint 严格规范提交信息：

```bash
bun run cz    # 交互式提交，自动生成规范 commit message
```

**示例：**

```
feat(federation): 新增 C_Upload 远程模块暴露
fix(logistics): 修复 Dashboard 远程组件加载超时问题
docs(readme): 更新模块联邦配置说明
```

### 开发流程

```bash
# 1. Fork 并克隆
git clone -b module-federation https://github.com/YOUR_NAME/Robot_Admin.git

# 2. 安装依赖
bun install

# 3. 创建功能分支
git checkout -b feat/your-feature

# 4. 开发 + 测试
bun dev

# 5. 规范提交
bun run cz

# 6. 推送并发起 PR
git push origin feat/your-feature
```

---

<div align="center">
  <p>
    <strong>中文</strong> | <a href="./README_EN.md">English</a>
  </p>
  <p>
    <sub>Made with ❤️ by <a href="https://github.com/ChenyCHENYU">ChenYu</a> · MIT License</sub>
  </p>
  <p>
    <a href="https://robotadmin.cn">
      <img src="https://img.shields.io/badge/🚀-在线体验-00D8FF?style=for-the-badge" alt="Live Demo">
    </a>
    <a href="https://www.tzagileteam.com">
      <img src="https://img.shields.io/badge/📖-团队文档-FF6B6B?style=for-the-badge" alt="Docs">
    </a>
    <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/main">
      <img src="https://img.shields.io/badge/🏗️-单体架构-4A90E2?style=for-the-badge" alt="Main">
    </a>
    <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/monorepo">
      <img src="https://img.shields.io/badge/📦-Monorepo-00D8FF?style=for-the-badge" alt="Monorepo">
    </a>
    <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/micro-app">
      <img src="https://img.shields.io/badge/🚀-微前端-E74C3C?style=for-the-badge" alt="Micro App">
    </a>
  </p>
</div>
