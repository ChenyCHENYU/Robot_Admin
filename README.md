<div align="center">
  <a href="https://robotadmin.cn">
    <picture>
      <source srcset="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" media="(prefers-color-scheme: dark)">
      <img src="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" height="120" />
    </picture>
  </a>

  <h1>🤖 Robot Admin — Monorepo</h1>

  <p><strong>基于 Bun Workspaces 的企业级多应用管理平台</strong></p>

  <!-- 架构选择器 -->
  <table>
    <tr>
      <td align="center" width="200">
        <img src="https://img.shields.io/badge/🏗️-单体架构-4A90E2?style=for-the-badge" alt="Monolithic"><br>
        <sub>传统 SPA 架构</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/main">
          <img src="https://img.shields.io/badge/查看代码-main-blue?style=flat-square" alt="Main Branch">
        </a>
      </td>
      <td align="center" width="200">
        <img src="https://img.shields.io/badge/📦-Monorepo-00D8FF?style=for-the-badge" alt="Monorepo"><br>
        <sub><strong>📍 当前分支</strong></sub><br>
        <sub>Bun Workspaces 多应用</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/monorepo">
          <img src="https://img.shields.io/badge/查看代码-monorepo-00d8ff?style=flat-square" alt="Monorepo Branch">
        </a>
      </td>
      <td align="center" width="200">
        <img src="https://img.shields.io/badge/🔷-微前端-FF6B6B?style=for-the-badge" alt="Micro App"><br>
        <sub>micro-app 架构</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/micro-app">
          <img src="https://img.shields.io/badge/查看代码-micro--app-red?style=flat-square" alt="Micro App Branch">
        </a>
      </td>
      <td align="center" width="200">
        <img src="https://img.shields.io/badge/🌐-模块联邦-9B59B6?style=for-the-badge" alt="Module Federation"><br>
        <sub>Module Federation</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/feature/module-federation">
          <img src="https://img.shields.io/badge/查看代码-federation-purple?style=flat-square" alt="Federation Branch">
        </a>
      </td>
    </tr>
  </table>

  <br>

  <a href="https://github.com/ChenyCHENYU/Robot_Admin/blob/monorepo/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <img src="https://img.shields.io/badge/Node.js-≥22-339933?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Bun-≥1.x-f9f1e1?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/Vue-3.5.30-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Naive_UI-2.44-18a058" alt="Naive UI">

</div>

---

## 📖 简介

本分支是 Robot Admin 的 **Monorepo 架构版本**，基于 **Bun Workspaces** 管理多个应用和共享包。

核心设计理念：

- **多应用共存**：同一个仓库管理内部版（完整功能）和 SaaS 版（多租户轻量）
- **共享配置**：ESLint、TSConfig 等配置统一维护，各应用继承使用
- **统一依赖**：Bun workspace 自动 hoisting，保证版本一致性
- **@robot-admin/\* 包生态**：复用已发布的 npm 包，不再本地维护重复包

---

## 🏗️ Monorepo 架构

```
Robot_Admin/                          ← Workspace Root
├── apps/
│   ├── admin-internal/               ← 🏢 内部版（完整功能 ERP）
│   │   ├── src/                      ← 完整业务代码
│   │   ├── envs/                     ← 环境变量
│   │   ├── vite.config.ts            ← Vite 8 + Rolldown 构建
│   │   ├── unocss.config.ts          ← UnoCSS 配置
│   │   ├── eslint.config.ts          ← ESLint Flat Config
│   │   └── package.json              ← 应用级依赖
│   │
│   └── admin-saas/                   ← ☁️ SaaS 版（多租户轻量版）
│       ├── src/                      ← 业务代码（可按需裁剪）
│       ├── envs/                     ← 独立环境变量
│       ├── vite.config.ts            ← 独立构建配置
│       └── package.json              ← 独立依赖声明
│
├── packages/
│   └── shared-config/                ← 📋 共享配置包
│       ├── tsconfig/                 ← 基础 TSConfig
│       └── package.json
│
├── package.json                      ← Workspace 编排（scripts / devDeps）
├── commitlint.config.js              ← Git 提交规范
├── .bunfig.toml                      ← Bun 配置
└── bun.lock                          ← 统一锁文件
```

### 应用对比

| 特性 | admin-internal | admin-saas |
|------|---------------|------------|
| 定位 | 企业内部完整版 | SaaS 多租户轻量版 |
| 端口 | 1988 | 1989 |
| 功能范围 | 全部 54+ 个功能演示 | 按需裁剪 |
| 包名 | `@robot-admin/internal` | `@robot-admin/saas` |
| 独立构建 | ✅ | ✅ |
| 独立部署 | ✅ | ✅ |

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue** | 3.5.30 | 渐进式前端框架 |
| **Vite** | 8.0.1 | 基于 Rolldown/Oxc 的构建工具 |
| **TypeScript** | 5.8.3 | 类型安全 |
| **Naive UI** | 2.44.1 | UI 组件库 |
| **Pinia** | 3.0.4 | 状态管理 |
| **Vue Router** | 4.6.4 | 路由系统 |
| **UnoCSS** | 66+ | 原子化 CSS |
| **Bun** | ≥1.x | 包管理器 + 运行时 |
| **ECharts** | 6.0.0 | 数据可视化 |
| **Sass** | 1.97+ | 样式预处理 |

### @robot-admin/* 包生态

| 包名 | 功能 |
|------|------|
| `@robot-admin/naive-ui-components` | 51 个业务组件 |
| `@robot-admin/layout` | 6 种布局模式 |
| `@robot-admin/request-core` | Axios + 7 插件 + useTableCrud |
| `@robot-admin/theme` | 主题切换（Light/Dark/System） |
| `@robot-admin/directives` | 11 个 Vue 指令 |
| `@robot-admin/form-validate` | 48+ 验证规则 |
| `@robot-admin/file-utils` | 文件处理（Excel/ZIP/分片上传） |
| `@robot-admin/git-standards` | Git 工程化标准 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 22.x
- **Bun** ≥ 1.x（[安装 Bun](https://bun.sh)）

```bash
# 验证环境
node -v   # v22.x+
bun -v    # 1.x+
```

### 安装与启动

```bash
# 克隆仓库并切换分支
git clone https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin
git checkout monorepo

# 安装所有 workspace 依赖
bun install

# 启动内部版开发服务器（默认端口 1988）
bun run dev

# 或启动 SaaS 版（端口 1989）
bun run dev:saas
```

### 全部命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动 internal 开发服务器 |
| `bun run dev:internal` | 同上 |
| `bun run dev:saas` | 启动 saas 开发服务器 |
| `bun run build` | 构建所有应用 |
| `bun run build:internal` | 仅构建 internal |
| `bun run build:saas` | 仅构建 saas |
| `bun run lint` | 所有应用代码检查 |
| `bun run format` | 所有应用代码格式化 |
| `bun run type-check` | TypeScript 类型检查 |
| `bun run clean` | 清理构建产物 |
| `bun run fresh` | 清理 node_modules 并重装 |
| `bun run cz` | 规范化 Git 提交 |

### 单应用开发

```bash
# 进入具体应用目录
cd apps/admin-internal

# 使用应用级脚本
bun run dev              # 开发
bun run build            # 构建
bun run lint             # 检查
bun run type-watch       # 实时类型检查
bun run analyze          # 构建分析
```

---

## 📦 Workspace 依赖管理

### 添加依赖

```bash
# 给某个应用添加依赖
cd apps/admin-internal && bun add <package>

# 给根工作区添加开发依赖
bun add -d <package>    # 在根目录执行

# 使用 bun --filter
bun --filter @robot-admin/internal add <package>
```

### 依赖分布原则

| 层级 | 放置的依赖 |
|------|-----------|
| **根 package.json** | Git 工具链（commitlint、husky、lint-staged）、TypeScript |
| **apps/*/package.json** | 应用运行时依赖、构建工具、UI 库 |
| **packages/*/package.json** | 共享配置包自身的依赖 |

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
apps/admin-internal/dist/
├── index.html
├── js/           # 脚本（hash 命名）
├── assets/       # CSS + 资源
├── images/
└── ...

apps/admin-saas/dist/
└── ...           # 同上
```

### Vite 8 构建特性

- **Rolldown**：替代 Rollup，Rust 编写的打包器
- **OXC**：替代 esbuild/SWC 的 Rust 编译器
- **codeSplitting.groups**：智能代码分割（vue-vendor、ui-vendor、echarts-vendor 等）
- **LightningCSS**：原生 CSS 压缩

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature`
3. 提交代码（使用 `bun run cz` 规范化提交）
4. 推送分支：`git push origin feat/your-feature`
5. 提交 Pull Request

### 提交规范

```bash
bun run cz    # 交互式规范提交
```

格式：`<type>(<scope>): <subject>`

类型：`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore` | `deps`

---

## 📄 License

[MIT License](./LICENSE) - Copyright (c) 2026 ChenY
