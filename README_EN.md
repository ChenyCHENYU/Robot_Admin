<div align="center">
  <a href="https://robotadmin.cn">
    <picture>
      <source srcset="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" media="(prefers-color-scheme: dark)">
      <img src="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" height="120" />
    </picture>
  </a>

  <h1>🤖 Robot Admin — Monorepo</h1>
  <p><strong>Enterprise Multi-App Platform based on Bun Workspaces</strong></p>
  <p>Vue 3.5 · Vite 8 (Rolldown) · TypeScript 5.8 · Naive UI · Pinia · UnoCSS · Bun</p>

  <!-- Branch Navigation -->
  <table>
    <tr>
      <td align="center" width="200">
        <strong>🏗️ Monolith</strong><br>
        <sub>Traditional single SPA</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/main">
          <img src="https://img.shields.io/badge/branch-main-4A90E2?style=flat-square" alt="Main">
        </a>
      </td>
      <td align="center" width="200">
        <strong>📦 Monorepo</strong><br>
        <sub><b>📍 Current branch</b> — Bun Workspaces</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/monorepo-upgrade">
          <img src="https://img.shields.io/badge/branch-monorepo--upgrade-00d8ff?style=flat-square" alt="Monorepo">
        </a>
      </td>
      <td align="center" width="200">
        <strong>🔷 Micro Frontend</strong><br>
        <sub>micro-app sub-apps</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/micro-app">
          <img src="https://img.shields.io/badge/branch-micro--app-FF6B6B?style=flat-square" alt="Micro App">
        </a>
      </td>
      <td align="center" width="200">
        <strong>🌐 Module Federation</strong><br>
        <sub>Module Federation 2.0</sub><br>
        <a href="https://github.com/ChenyCHENYU/Robot_Admin/tree/feature/module-federation">
          <img src="https://img.shields.io/badge/branch-federation-9B59B6?style=flat-square" alt="Federation">
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
    <a href="./README_EN.md"><strong>🇺🇸 English</strong></a> |
    <a href="https://robotadmin.cn">🌐 Live Demo</a>
  </p>

</div>

---

## Table of Contents

- [📖 Introduction](#-introduction)
- [🏛️ Architecture Philosophy](#️-architecture-philosophy)
- [📂 Directory Structure](#-directory-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📋 Command Reference](#-command-reference)
- [📦 Dependency Strategy](#-dependency-strategy)
- [🔨 Build & Deploy](#-build--deploy)
- [🧩 Integration Guide](#-integration-guide)
- [🔮 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)

---

## 📖 Introduction

This branch is the **Monorepo architecture** of Robot Admin, powered by **Bun Workspaces** to manage multiple apps and shared packages in a single repository.

**Why Monorepo?**

- 🏢 **Multi-app coexistence** — Internal (full-featured ERP) & SaaS (multi-tenant lightweight) in one repo
- 📋 **Single-point governance** — ESLint / Prettier / Commitlint / Git Hooks — one config for the entire repo
- 📦 **Unified dependencies** — Bun workspace hoisting ensures version consistency across all apps
- 🔗 **@robot-admin/\* ecosystem** — Reuse 8 published npm packages, no local duplication
- 🚀 **Independent build & deploy** — Each app builds / previews / deploys independently

---

## 🏛️ Architecture Philosophy

### Three-Layer Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────────┐
│  Root (Workspace Orchestrator)                                      │
│  Governance: ESLint · Prettier · Commitlint · Husky · lint-staged  │
│  Base types: typescript · @types/node                               │
├──────────────────────┬──────────────────────────────────────────────┤
│  apps/               │  packages/                                   │
│  ┌────────────────┐  │  ┌──────────────────┐                       │
│  │ admin-internal  │  │  │ shared-config    │                       │
│  │ (Full ERP)     │  │  │ TSConfig / ESLint│                       │
│  │ Port: 1988     │  │  │ / Vite factory   │                       │
│  ├────────────────┤  │  └──────────────────┘                       │
│  │ admin-saas     │  │                                              │
│  │ (Multi-tenant) │  │  Future:                                     │
│  │ Port: 1989     │  │  shared-types / shared-utils / shared-api   │
│  └────────────────┘  │                                              │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Community Best Practices Comparison

| Practice        | Turborepo / Nx     | Lerna     | **This Project**                     |
| --------------- | ------------------ | --------- | ------------------------------------ |
| Package Manager | pnpm (typical)     | npm/yarn  | **Bun** (fastest)                    |
| Orchestration   | Turbo / Nx CLI     | Lerna CLI | **Bun `--filter`** (native)          |
| Config Sharing  | Manual copy        | Manual    | **`packages/shared-config`** factory |
| Caching         | Remote cache       | ✗         | Vite persistent cache                |
| Extra Deps      | turbo / nx package | lerna     | **Zero** — Bun built-in              |

---

## 📂 Directory Structure

```
Robot_Admin/
├── apps/
│   ├── admin-internal/          ← 🏢 Internal (Full-featured ERP)
│   │   ├── src/                 │    Complete business modules
│   │   ├── envs/                │    Environment configs
│   │   ├── lang/                │    i18n translations
│   │   ├── vite.config.ts       │    Extends createViteConfig()
│   │   ├── eslint.config.ts     │    Extends createEslintConfig()
│   │   └── unocss.config.ts     │    UnoCSS configuration
│   │
│   └── admin-saas/              ← ☁️  SaaS (Multi-tenant lightweight)
│       ├── src/                 │    Simplified business modules
│       └── ...                  │    Same structure, different content
│
├── packages/
│   └── shared-config/           ← 📋 Shared Configuration Factory
│       ├── tsconfig/            │    Base TSConfig presets
│       ├── eslint/              │    createEslintConfig()
│       └── vite/                │    createViteConfig()
│
├── package.json                 ← Workspace orchestrator
├── vercel.json                  ← Vercel deployment config
├── bun.lock                     ← Unified lockfile
├── .bunfig.toml                 ← Bun configuration
└── .vercelignore                ← Vercel file exclusions
```

---

## 🛠️ Tech Stack

### Core Framework

| Technology     | Version | Purpose                                  |
| -------------- | ------- | ---------------------------------------- |
| **Vue**        | 3.5     | Progressive UI framework                 |
| **Vite**       | 8.x     | Next-gen build tool (Rolldown / OXC)     |
| **TypeScript** | 5.8     | Type safety                              |
| **Naive UI**   | 2.44+   | Enterprise UI component library          |
| **Pinia**      | 3.0     | State management                         |
| **Vue Router** | 4.6     | Routing                                  |
| **UnoCSS**     | 66+     | Atomic CSS (Wind3 + Attributify + Icons) |
| **ECharts**    | 6.0     | Data visualization                       |
| **Sass**       | 1.97+   | Style preprocessor                       |
| **Bun**        | ≥1.3    | Package manager + runtime                |

### @robot-admin/\* Ecosystem

| Package                            | Purpose                                  | Version |
| ---------------------------------- | ---------------------------------------- | ------- |
| `@robot-admin/naive-ui-components` | 51 business components                   | 0.6.31  |
| `@robot-admin/layout`              | 6 layout modes + settings panel          | 2.2.0   |
| `@robot-admin/request-core`        | Axios + 7 plugins + useTableCrud         | 0.1.3   |
| `@robot-admin/theme`               | Theme switching (Light/Dark/System)      | 0.1.1   |
| `@robot-admin/directives`          | 11 Vue directives                        | 1.1.0   |
| `@robot-admin/form-validate`       | 48+ form validation rules                | 2.0.0   |
| `@robot-admin/file-utils`          | File processing (Excel/ZIP/chunk upload) | 1.0.0   |
| `@robot-admin/git-standards`       | Git engineering standards                | 1.0.3   |

---

## 🚀 Quick Start

### Prerequisites

| Tool        | Version | Install Guide                    |
| ----------- | ------- | -------------------------------- |
| **Node.js** | ≥ 22.x  | [nodejs.org](https://nodejs.org) |
| **Bun**     | ≥ 1.3   | [bun.sh](https://bun.sh)         |

```bash
# Verify environment
node -v   # v22.x+
bun -v    # 1.3.x+
```

### Install & Run

```bash
# Clone the repository
git clone https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin
git checkout monorepo-upgrade

# Install all workspace dependencies (one install, entire repo)
bun install
```

**Two apps run independently — start as needed:**

| App                | Command            | URL                   | Purpose                                    |
| ------------------ | ------------------ | --------------------- | ------------------------------------------ |
| **admin-internal** | `bun run dev`      | http://localhost:1988 | Full-featured enterprise version (default) |
| **admin-saas**     | `bun run dev:saas` | http://localhost:1989 | SaaS multi-tenant version                  |

```bash
# Start internal version (daily development default)
bun run dev

# Start SaaS version
bun run dev:saas

# Developing both apps? Run each command in a separate terminal — ports don't conflict.
```

> **Note**: Both apps are fully independent with their own `envs/`, `src/`, `dist/`, sharing the same governance rules (ESLint / Prettier / Commitlint) and build factory (`createViteConfig`).

---

## 📋 Command Reference

### Workspace Level (run from root)

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `bun run dev`            | Start internal app                   |
| `bun run dev:internal`   | Same as above                        |
| `bun run dev:saas`       | Start saas app                       |
| `bun run build`          | Build all apps                       |
| `bun run build:internal` | Build internal only                  |
| `bun run build:saas`     | Build saas only                      |
| `bun run lint`           | Lint entire repo (packages + apps)   |
| `bun run lint:apps`      | Lint all apps                        |
| `bun run lint:packages`  | Lint packages                        |
| `bun run format`         | Format entire repo (Prettier)        |
| `bun run type-check`     | TypeScript type checking             |
| `bun run clean`          | Clean build artifacts                |
| `bun run clean:modules`  | Clean all node_modules               |
| `bun run fresh`          | Clean & reinstall dependencies       |
| `bun run cz`             | Standardized Git commit (Commitizen) |

### App Level (run from `apps/*` directory)

| Command                  | Description                     |
| ------------------------ | ------------------------------- |
| `bun run dev`            | Development server              |
| `bun run dev:local`      | Local package linking mode      |
| `bun run dev:components` | Component library linking mode  |
| `bun run dev:devtools`   | Enable Vue DevTools             |
| `bun run build`          | Production build                |
| `bun run build:test`     | Test environment build          |
| `bun run build:staging`  | Staging build (with profile)    |
| `bun run lint`           | Oxlint + ESLint dual check      |
| `bun run format`         | Prettier formatting             |
| `bun run type-watch`     | vue-tsc real-time type checking |
| `bun run analyze`        | Build artifact analysis         |

---

## 📦 Dependency Strategy

### Three-Tier Dependency Model

```
                          ┌─────────────────────────────────────┐
                          │          ROOT devDependencies        │
                          │                                     │
                          │  Governance: eslint / prettier       │
                          │  Commit: commitlint / husky / cz    │
                          │  Base: typescript / @types/node      │
                          │  Shared: @robot-admin/shared-config  │
                          └──────────┬──────────────────────────┘
                                     │  Bun hoisting
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
          ┌──────────────────┐            ┌──────────────────┐
          │  App devDeps     │            │  Package devDeps  │
          │                  │            │                   │
          │  Build: vite     │            │  Type-checking:   │
          │  UI: naive-ui    │            │  eslint-plugin-*  │
          │  CSS: unocss     │            │  @vue/eslint-*    │
          │  Plugins: unplugin│           │  @tsconfig/node22 │
          │  Check: vue-tsc  │            └──────────────────-┘
          └──────────────────┘
```

### Adding Dependencies

```bash
# Add to a specific app
bun --filter @robot-admin/internal add <package>

# Add governance tool to root
bun add -d <package>    # Run from root directory

# Add to shared package
cd packages/shared-config && bun add -d <package>
```

---

## 🔨 Build & Deploy

### Production Build

```bash
# Build all apps
bun run build

# Build individually
bun run build:internal    # → apps/admin-internal/dist/
bun run build:saas        # → apps/admin-saas/dist/
```

### Vite 8 Build Features

| Feature                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| **Rolldown**             | Rust-based bundler replacing Rollup — significantly faster builds |
| **OXC**                  | Rust compiler replacing esbuild / SWC                             |
| **codeSplitting.groups** | Smart code splitting (vue-vendor / ui-vendor / echarts-vendor …)  |
| **LightningCSS**         | Native CSS minification & transformation                          |

### Deployment Strategies

#### Strategy 1: Independent Deployment (Recommended)

Each app deploys to a separate domain/server independently.

```
bun run build:internal  →  apps/admin-internal/dist/  →  internal.example.com
bun run build:saas      →  apps/admin-saas/dist/      →  saas.example.com
```

**Vercel Deployment (per-app projects):**

| Setting          | admin-internal             | admin-saas             |
| ---------------- | -------------------------- | ---------------------- |
| Root Directory   | `.` (monorepo root)        | `.` (monorepo root)    |
| Build Command    | `bun run build:internal`   | `bun run build:saas`   |
| Output Directory | `apps/admin-internal/dist` | `apps/admin-saas/dist` |
| Install Command  | `bun install`              | `bun install`          |

> The repo's `vercel.json` builds admin-internal by default. For admin-saas, create a new Vercel project and override the Build Command.
>
> ⚠️ **Important**: The `.vercelignore` must **NOT** exclude the `packages/` directory, otherwise `@robot-admin/shared-config` cannot be resolved during build. Use `packages/*/dist` instead of `packages/` if you need to exclude build artifacts.

#### Strategy 2: Unified Deployment (Docker / Nginx)

All apps build to the same server, differentiated by path or subdomain.

```bash
# Build all apps
bun run build

# Output structure
apps/
├── admin-internal/dist/   →  /internal/
└── admin-saas/dist/       →  /saas/
```

**Docker Multi-Stage Build:**

```dockerfile
# Stage 1: Install + Build
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

# Stage 2: Nginx Hosting
FROM nginx:alpine
COPY --from=builder /app/apps/admin-internal/dist /usr/share/nginx/html/internal
COPY --from=builder /app/apps/admin-saas/dist /usr/share/nginx/html/saas
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### Strategy 3: On-Demand Deployment (Git Change Detection)

Only build apps that have changed — saves CI time.

```yaml
# GitHub Actions — Change detection
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
```

> **Note**: Changes to `packages/shared-config/**` trigger all app rebuilds since it affects build behavior.

---

## 🧩 Integration Guide

### Adding a New App

```bash
# 1. Copy template from existing app
cp -r apps/admin-internal apps/admin-new

# 2. Update package.json
#    name: "@robot-admin/new-app"
#    version: "1.0.0"

# 3. Change port (avoid conflicts: internal 1988 / saas 1989)
# 4. Update VITE_APP_TITLE in envs/
# 5. bun install (auto-joins workspace)
# 6. bun --filter @robot-admin/new-app dev
```

**Checklist:**

- [ ] `package.json` name is unique: `@robot-admin/xxx`
- [ ] `tsconfig/` extends `@robot-admin/shared-config/tsconfig/app` and `node`
- [ ] `eslint.config.ts` uses `createEslintConfig()`
- [ ] `vite.config.ts` uses `createViteConfig()`
- [ ] `devDependencies` includes `"@robot-admin/shared-config": "workspace:*"`
- [ ] Port number doesn't conflict
- [ ] `VITE_APP_TITLE` is set
- [ ] Root `tsconfig.json` has `references` pointing to the new app

### Adding a Shared Package

```bash
# 1. Create package directory
mkdir -p packages/shared-utils/src

# 2. Initialize package.json
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

# 3. Add dependency in the consuming app
bun --filter @robot-admin/internal add @robot-admin/shared-utils@workspace:*

# 4. Import directly
# import { xxx } from '@robot-admin/shared-utils'
```

---

## 🔮 Roadmap

### Extensible Architecture

```
Robot_Admin/
├── apps/
│   ├── admin-internal/          ← ✅ Exists: Full-featured enterprise version
│   ├── admin-saas/              ← ✅ Exists: SaaS multi-tenant version
│   ├── admin-mobile/            ← 🔮 Future: Mobile H5
│   ├── admin-electron/          ← 🔮 Future: Desktop (Electron)
│   └── admin-docs/              ← 🔮 Future: VitePress docs site
│
├── packages/
│   ├── shared-config/           ← ✅ Exists: ESLint + Vite + TSConfig factory
│   ├── shared-types/            ← 🔮 Extract: Cross-app TypeScript types
│   ├── shared-utils/            ← 🔮 Extract: Cross-app utilities / hooks
│   ├── shared-api/              ← 🔮 Extract: Cross-app API definitions
│   └── shared-components/       ← 🔮 Extract: Cross-app business components
```

### Sharing Decision Tree

```
Code/types need sharing across apps?
  │
  ├─ No  → Keep in current app
  │
  └─ Yes → Needs npm publishing?
       │
       ├─ Yes → Separate repo (@robot-admin/* ecosystem)
       │
       └─ No  → Place under packages/
            │
            ├─ Config/presets   → packages/shared-config
            ├─ Type definitions → packages/shared-types
            ├─ Utility functions → packages/shared-utils
            ├─ API layer        → packages/shared-api
            └─ UI components    → packages/shared-components
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details. Quick Start:

```bash
# 1. Fork & Clone
git clone https://github.com/YOUR_USERNAME/Robot_Admin.git && cd Robot_Admin

# 2. Install dependencies
bun install

# 3. Create feature branch
git checkout -b feat/your-feature

# 4. Develop & commit (use standardized commits)
bun run cz

# 5. Push & create PR
git push origin feat/your-feature
```

### Commit Convention

```
<type>(<scope>): <subject>
```

**Type**: `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `chore` · `deps` · `wip`

**Scope**: `components` · `views` · `stores` · `router` · `api` · `config` · `monorepo` · …

---

## 📄 License

[MIT License](./LICENSE) — Copyright (c) 2026 ChenY
