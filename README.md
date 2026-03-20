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
  <img src="https://img.shields.io/badge/Bun-≥1.2-f9f1e1?logo=bun" alt="Bun">
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

## 📖 简介

本分支是 Robot Admin 的 **Monorepo 架构版本**，基于 **Bun Workspaces** 将原单体应用重构为多应用多包体系。

**为什么选择 Monorepo？**

- 🏢 **多应用共存** — 同一仓库管理内部版（完整功能 ERP）和 SaaS 版（多租户轻量版）
- 📋 **共享配置** — TypeScript / ESLint / UnoCSS 等配置统一维护，各 app 继承复用
- 📦 **统一依赖** — Bun workspace hoisting 自动提升公共依赖，保证版本一致性
- 🔗 **@robot-admin/\* 包生态** — 复用已发布的 8 个 npm 包，不在本地重复造轮子
- 🚀 **独立构建部署** — 各 app 独立 `build` / `preview` / `deploy`，互不干扰

---

## 🏗️ Monorepo 架构

```
Robot_Admin/                              ← Workspace Root
│
├── apps/
│   ├── admin-internal/                   ← 🏢 内部版（企业级完整功能 ERP）
│   │   ├── src/
│   │   │   ├── api/                      # API 接口定义 + 自动生成类型
│   │   │   ├── assets/                   # 静态资源（css / data / images）
│   │   │   ├── components/               # 全局组件（C_） + 局部组件（c_）
│   │   │   ├── composables/              # 组合式函数（登录/布局/权限）
│   │   │   ├── config/                   # 主题 + Vite + KeepAlive 配置
│   │   │   ├── hooks/                    # 通用 Hooks（复制/表单/水印）
│   │   │   ├── plugins/                  # 12 个 Vue 插件（启动引导链）
│   │   │   ├── router/                   # 路由系统 + 动态路由 + 守卫
│   │   │   ├── stores/                   # Pinia 状态（6 个 Store 模块）
│   │   │   ├── styles/                   # 全局 SCSS + 主题变量
│   │   │   ├── types/                    # TypeScript 类型声明
│   │   │   ├── utils/                    # 工具函数（auth / route / error）
│   │   │   └── views/                    # 业务页面（55+ 个 Demo 示例）
│   │   ├── envs/                         # 环境变量（dev/test/staging/prod）
│   │   ├── lang/                         # i18n 语言文件
│   │   ├── scripts/                      # 构建 / 部署 / i18n 脚本
│   │   ├── vite.config.ts                # Vite 8 + Rolldown 构建
│   │   ├── unocss.config.ts              # UnoCSS 配置
│   │   ├── eslint.config.ts              # ESLint Flat Config
│   │   └── package.json                  # @robot-admin/internal
│   │
│   └── admin-saas/                       ← ☁️ SaaS 版（多租户轻量版）
│       ├── src/                          # 与 internal 同构，按需裁剪
│       ├── envs/                         # 独立环境变量
│       └── package.json                  # @robot-admin/saas
│
├── packages/
│   └── shared-config/                    ← 📋 共享配置包
│       ├── tsconfig/
│       │   ├── tsconfig.app.base.json    # 应用级 TS 基础配置
│       │   └── tsconfig.node.base.json   # Node 工具链 TS 配置
│       ├── eslint/
│       │   └── index.ts                  # createEslintConfig() 工厂
│       ├── vite/
│       │   └── index.ts                  # createViteConfig() + optimizeDeps
│       └── package.json                  # @robot-admin/shared-config
│
├── docs/                                 ← 📚 项目文档
│   └── monorepo-迭代升级扩展建议.md
│
├── package.json                          ← Workspace 编排 + 根脚本
├── tsconfig.json                         ← Project References
├── .bunfig.toml                          ← Bun 运行时配置
├── commitlint.config.js                  ← Git 提交规范
├── CONTRIBUTING.md                       ← 贡献指南
└── bun.lock                              ← 统一锁文件
```

### 应用对比

| 特性 | admin-internal 🏢 | admin-saas ☁️ |
|------|:--:|:--:|
| **定位** | 企业内部完整版 | SaaS 多租户轻量版 |
| **包名** | `@robot-admin/internal` | `@robot-admin/saas` |
| **版本** | 2.2.0 | 1.0.0 |
| **端口** | 1988 | 1989 |
| **标题** | ROBOT ADMIN \| INTERNAL | ROBOT ADMIN \| SAAS |
| **功能范围** | 55+ 个功能演示 | 按需裁剪核心页面 |
| **独立构建** | ✅ | ✅ |
| **独立部署** | ✅ | ✅ |
| **共享配置** | ✅ TSConfig + ESLint + Vite | ✅ TSConfig + ESLint + Vite |

### 共享配置继承关系

```
packages/shared-config/
├── tsconfig/
│   ├── tsconfig.app.base.json    ← 应用级:  Vue / JSX / 严格模式 / Bundler 解析
│   └── tsconfig.node.base.json   ← 工具链:  Node22 / ESNext / Bundler
├── eslint/
│   └── index.ts                  ← createEslintConfig() 工厂函数
└── vite/
    └── index.ts                  ← createViteConfig() + optimizeDeps 统一管理

        ↓ extends / import                  ↓ extends / import

apps/admin-internal/                apps/admin-saas/
├── tsconfig/                       ├── tsconfig/
│   ├── tsconfig.app.json           │   ├── tsconfig.app.json
│   └── tsconfig.node.json          │   └── tsconfig.node.json
├── eslint.config.ts                ├── eslint.config.ts
│   → createEslintConfig()          │   → createEslintConfig()
├── vite.config.ts                  ├── vite.config.ts
│   → createViteConfig(...)         │   → createViteConfig(...)
└── unocss.config.ts (独立)         └── unocss.config.ts (独立)
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue** | 3.5 | 渐进式前端框架 |
| **Vite** | 8.x | 基于 Rolldown / OXC 的下一代构建工具 |
| **TypeScript** | 5.8 | 类型安全 |
| **Naive UI** | 2.44+ | 企业级 UI 组件库 |
| **Pinia** | 3.0 | 状态管理 |
| **Vue Router** | 4.6 | 路由系统 |
| **UnoCSS** | 66+ | 原子化 CSS（Wind3 + Attributify + Icons） |
| **ECharts** | 6.0 | 数据可视化 |
| **Sass** | 1.97+ | 样式预处理 |
| **Bun** | ≥1.2 | 包管理器 + 运行时 |

### @robot-admin/* 包生态

| 包名 | 功能 | 版本 |
|------|------|------|
| `@robot-admin/naive-ui-components` | 51 个业务组件（Form / Table / Upload …） | 0.6.31 |
| `@robot-admin/layout` | 6 种布局模式 + 设置面板 | 2.2.0 |
| `@robot-admin/request-core` | Axios + 7 插件 + useTableCrud | 0.1.3 |
| `@robot-admin/theme` | 主题切换（Light / Dark / System） | 0.1.1 |
| `@robot-admin/directives` | 11 个 Vue 指令 | 1.1.0 |
| `@robot-admin/form-validate` | 48+ 表单验证规则 | 2.0.0 |
| `@robot-admin/file-utils` | 文件处理（Excel / ZIP / 分片上传） | 1.0.0 |
| `@robot-admin/git-standards` | Git 工程化标准 | 1.0.3 |

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本 | 安装指南 |
|------|------|----------|
| **Node.js** | ≥ 22.x | [nodejs.org](https://nodejs.org) |
| **Bun** | ≥ 1.2 | [bun.sh](https://bun.sh) |

```bash
# 验证环境
node -v   # v22.x+
bun -v    # 1.x+
```

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin
git checkout monorepo-upgrade

# 安装所有 workspace 依赖
bun install

# 启动内部版开发服务器（默认，端口 1988）
bun run dev

# 或启动 SaaS 版（端口 1989）
bun run dev:saas
```

### 全部命令

#### Workspace 级（根目录执行）

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动 internal 应用 |
| `bun run dev:internal` | 同上 |
| `bun run dev:saas` | 启动 saas 应用 |
| `bun run build` | 构建所有应用 |
| `bun run build:internal` | 仅构建 internal |
| `bun run build:saas` | 仅构建 saas |
| `bun run lint` | 所有应用代码检查（Oxlint + ESLint） |
| `bun run format` | 所有应用代码格式化（Prettier） |
| `bun run type-check` | TypeScript 类型检查 |
| `bun run clean` | 清理构建产物 |
| `bun run clean:modules` | 清理所有 node_modules |
| `bun run fresh` | 清理并重装依赖 |
| `bun run cz` | 规范化 Git 提交（Commitizen） |

#### 单应用级（进入 `apps/*` 目录）

| 命令 | 说明 |
|------|------|
| `bun run dev` | 开发服务器 |
| `bun run dev:local` | 本地包联调模式 |
| `bun run dev:components` | 组件库联调模式 |
| `bun run dev:devtools` | 启用 Vue DevTools |
| `bun run build` | 生产构建 |
| `bun run build:test` | 测试环境构建 |
| `bun run build:staging` | 预发布构建（含 profile） |
| `bun run lint` | Oxlint + ESLint 双重检查 |
| `bun run format` | Prettier 格式化 |
| `bun run type-watch` | vue-tsc 实时类型检查 |
| `bun run analyze` | 构建产物分析 |

---

## 📦 依赖管理

### 添加依赖

```bash
# 给某个应用添加依赖
bun --filter @robot-admin/internal add <package>

# 给根工作区添加开发依赖
bun add -d <package>    # 在根目录执行

# 或者进入应用目录
cd apps/admin-internal && bun add <package>
```

### 依赖分层原则

| 层级 | 放置的依赖 | 示例 |
|------|-----------|------|
| **根 `package.json`** | Git 工具链 + TypeScript | commitlint, husky, lint-staged |
| **`apps/*/package.json`** | 应用运行时 + 构建工具 + UI 库 | vue, naive-ui, vite, eslint |
| **`packages/shared-config`** | 共享配置包自身依赖 + peer deps | @vue/tsconfig, eslint-plugin-* |
| **其他 `packages/*`** | 共享业务逻辑包的依赖 | 按需定义 |

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

### 构建产物

每个应用独立产出 `dist/` 目录，可独立部署：

```
apps/admin-internal/dist/       apps/admin-saas/dist/
├── index.html                  ├── index.html
├── js/        (hash 命名)      ├── js/
├── assets/    (CSS + 资源)     ├── assets/
├── images/                     └── ...
└── ...
```

### Vite 8 构建特性

| 特性 | 说明 |
|------|------|
| **Rolldown** | 替代 Rollup，Rust 编写的打包器，构建速度提升数倍 |
| **OXC** | 替代 esbuild / SWC 的 Rust 编译器 |
| **codeSplitting.groups** | 智能代码分割（vue-vendor / ui-vendor / echarts-vendor …） |
| **LightningCSS** | 原生 CSS 压缩与转换 |

---

## 📋 共享配置机制

### shared-config 提供什么

| 配置 | 导出路径 | 用途 |
|------|---------|------|
| **TSConfig (App)** | `@robot-admin/shared-config/tsconfig/app` | Vue DOM / strict / Bundler / JSX / composite |
| **TSConfig (Node)** | `@robot-admin/shared-config/tsconfig/node` | Node22 / ESNext / Bundler |
| **ESLint** | `@robot-admin/shared-config/eslint` | `createEslintConfig()` — 180+ 行 Flat Config（oxlint + Vue + TS + JSDoc） |
| **Vite** | `@robot-admin/shared-config/vite` | `createViteConfig()` — env 加载 + optimizeDeps + analyzer 注入 |

### 各 app 的配置文件只需几行

```typescript
// eslint.config.ts
import { createEslintConfig } from '@robot-admin/shared-config/eslint'
export default createEslintConfig()

// vite.config.ts
import { createViteConfig } from '@robot-admin/shared-config/vite'
export default createViteConfig((_env, command) => ({
  plugins: [...],         // 应用自有插件
  resolve: resolveConfig, // 应用路径别名
  server: serverConfig,   // 应用端口 / proxy
  build: buildConfig,     // 应用分包策略
}))
```

### 根级配置（无需拆分）

| 文件 | 说明 |
|------|------|
| `.prettierrc.js` | Prettier 格式化（所有 app 共享） |
| `commitlint.config.js` | Git 提交规范 |
| `.cz-config.js` | Commitizen 交互式提交 |
| `.editorconfig` | 编辑器统一配置 |

> 以上文件由 `@robot-admin/git-standards` 生成，直接放在根目录即可被 Bun Workspace 所有 app 使用。

---

## 🧩 集成指南

### 新增一个应用

```bash
# 1. 在 apps/ 下复制模板（以 admin-internal 为基准）
cp -r apps/admin-internal apps/admin-new

# 2. 修改 package.json
#    - name: "@robot-admin/new-app"
#    - version: "1.0.0"
#    - description: "新应用描述"

# 3. 修改 viteServerConfig.ts 中的端口号
#    避免与现有 app 冲突（internal: 1988, saas: 1989）

# 4. 修改 envs/ 中的 VITE_APP_TITLE

# 5. 安装依赖（会自动加入 workspace）
bun install

# 6. 启动开发
bun --filter @robot-admin/new-app dev
```

**关键检查清单**：
- [ ] `package.json` 的 `name` 是唯一的 `@robot-admin/xxx`
- [ ] `tsconfig/tsconfig.app.json` extends 自 `@robot-admin/shared-config/tsconfig/app`
- [ ] `eslint.config.ts` 使用 `createEslintConfig()`
- [ ] `vite.config.ts` 使用 `createViteConfig()`
- [ ] `devDependencies` 包含 `"@robot-admin/shared-config": "workspace:*"`
- [ ] 端口号不与其他 app 冲突
- [ ] `VITE_APP_TITLE` 已在 `envs/` 中设置

### 新增一个共享包

```bash
# 1. 在 packages/ 下创建包
mkdir -p packages/my-utils

# 2. 初始化 package.json
cat > packages/my-utils/package.json << 'EOF'
{
  "name": "@robot-admin/my-utils",
  "version": "1.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

# 3. 创建源码
mkdir packages/my-utils/src
echo 'export const hello = () => "world"' > packages/my-utils/src/index.ts

# 4. 在需要的 app 中添加依赖
cd apps/admin-internal
bun add @robot-admin/my-utils@workspace:*

# 5. 直接导入使用
# import { hello } from '@robot-admin/my-utils'
```

### 独立构建与部署

每个 app 产出独立的 `dist/` 目录，可分别部署到不同的服务器或域名：

```bash
# 构建某个应用
bun run build:internal    # → apps/admin-internal/dist/
bun run build:saas        # → apps/admin-saas/dist/

# 预览构建产物
bun run preview:internal  # 本地 preview 验证
bun run preview:saas
```

**CI/CD 部署示意（以 admin-internal 为例）**：

```yaml
# GitHub Actions / Jenkins 等
steps:
  - run: bun install
  - run: bun run build:internal
  - run: deploy apps/admin-internal/dist/ → https://internal.example.com
```

**多应用独立部署架构**：

```
                    ┌─── apps/admin-internal/dist/ ──→ internal.example.com
bun run build:apps ─┤
                    └─── apps/admin-saas/dist/ ──────→ saas.example.com
```

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
