<div align="center">
  <a href="https://robotadmin.cn">
    <picture>
      <source srcset="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" media="(prefers-color-scheme: dark)">
      <img src="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" height="120" />
    </picture>
  </a>

  <h1>🤖 Robot Admin — Monorepo</h1>

  <p><strong>Enterprise Multi-App Platform based on Bun Workspaces</strong></p>

  <br>

  <a href="https://github.com/ChenyCHENYU/Robot_Admin/blob/monorepo/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <img src="https://img.shields.io/badge/Node.js-≥22-339933?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Bun-≥1.x-f9f1e1?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/Vue-3.5.30-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript">

  <p>
    <a href="./README.md">🇨🇳 中文</a> |
    <strong>🇺🇸 English</strong>
  </p>

</div>

---

## Overview

This branch is the **Monorepo architecture** of Robot Admin, managed by **Bun Workspaces**.

- **Multi-app coexistence**: Internal (full-featured) + SaaS (multi-tenant lightweight) in one repo
- **Shared config**: ESLint, TSConfig, etc. maintained centrally
- **Unified dependencies**: Bun workspace hoisting ensures version consistency
- **@robot-admin/* ecosystem**: Reuse published npm packages

## Architecture

```
Robot_Admin/
├── apps/
│   ├── admin-internal/     ← 🏢 Internal (Full ERP)      Port: 1988
│   └── admin-saas/         ← ☁️  SaaS (Multi-tenant)      Port: 1989
├── packages/
│   └── shared-config/      ← 📋 Shared TSConfig / ESLint
├── package.json            ← Workspace orchestrator
└── bun.lock                ← Unified lock file
```

## Quick Start

```bash
# Requirements: Node.js ≥22, Bun ≥1.x

git clone https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin && git checkout monorepo

bun install             # Install all workspace deps
bun run dev             # Start internal app (port 1988)
bun run dev:saas        # Start saas app (port 1989)
bun run build           # Build all apps
```

## Tech Stack

Vue 3.5.30 · Vite 8.0.1 (Rolldown/Oxc) · TypeScript 5.8 · Naive UI 2.44 · Pinia 3.0 · UnoCSS · ECharts 6.0

## License

[MIT](./LICENSE) - Copyright (c) 2026 ChenY
