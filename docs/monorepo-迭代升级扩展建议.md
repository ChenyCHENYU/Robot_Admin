# Robot Admin Monorepo — 迭代升级与扩展建议

> 本文档基于 `monorepo-upgrade` 分支的重构成果，规划后续迭代方向和最佳实践建议。
> 最后更新：2026-03-20

---

## 一、当前架构概览

```
Robot_Admin/                          # Monorepo 根
├── apps/
│   ├── admin-internal/               # 内部版（完整功能）
│   └── admin-saas/                   # SaaS 版（轻量多租户）
├── packages/
│   └── shared-config/                # 共享 TypeScript 配置
├── package.json                      # Bun Workspaces 编排
├── .bunfig.toml                      # Bun 运行时配置
└── tsconfig.json                     # 项目引用（Project References）
```

**已完成**：

- Bun Workspaces Monorepo 基础架构搭建
- admin-internal（原单应用）完整迁移
- admin-saas 骨架初始化
- shared-config 包（TypeScript 基础配置）
- Release-Please 多包配置
- README / CONTRIBUTING / .gitignore 适配

---

## 二、近期迭代建议（P0 — 高优先级）

### 2.1 共享配置包完善 (`packages/shared-config`)

**目标**：将各 app 中重复的配置抽离为可复用的共享预设。

#### ESLint 共享预设

```typescript
// packages/shared-config/eslint/index.ts
import oxlint from 'eslint-plugin-oxlint'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export function createEslintConfig(options?: {
  extraRules?: Record<string, any>
}) {
  return [
    oxlint.configs['flat/recommended'],
    ...pluginVue.configs['flat/recommended'],
    ...vueTsEslintConfig(),
    // 项目统一规则
    {
      rules: {
        'max-depth': ['error', 4],
        complexity: ['warn', 10],
        quotes: ['error', 'single'],
        ...options?.extraRules,
      },
    },
  ]
}
```

各 app 使用：

```typescript
// apps/admin-internal/eslint.config.ts
import { createEslintConfig } from '@robot-admin/shared-config/eslint'
export default createEslintConfig()
```

#### Vite 共享预设

```typescript
// packages/shared-config/vite/index.ts
export function createViteConfig(options: {
  app: 'internal' | 'saas'
  port?: number
}) {
  return defineConfig({
    // 公共 Vite 配置
    resolve: { alias: { '@': resolve('src') } },
    server: { port: options.port ?? 1988 },
    build: {
      /* 统一分包策略 */
    },
    // 公共插件
    plugins: [vue(), UnoCSS(), AutoImport(/*...*/)],
  })
}
```

#### UnoCSS 共享预设

```typescript
// packages/shared-config/unocss/presets.ts
export function createUnocssConfig() {
  return defineConfig({
    presets: [presetWind3(), presetAttributify(), presetIcons()],
    shortcuts: {
      /* 统一原子类 */
    },
  })
}
```

**评估**：只有当两个 app 的配置确实趋同时才抽离，避免过度抽象。初期允许各 app 独立维护。

### 2.2 共享业务逻辑包 (`packages/shared-utils`)

从 `admin-internal` 中提取通用工具：

```
packages/shared-utils/
├── src/
│   ├── auth.ts           # Token 管理 + 超时检查
│   ├── route.ts          # 菜单过滤 + KeepAlive 工具
│   ├── storage.ts        # 统一 Storage 读写
│   └── error-handler.ts  # 全局错误处理
├── package.json          # @robot-admin/shared-utils
└── tsconfig.json
```

**迁移策略**：

1. 先在 `shared-utils` 中建立接口
2. `admin-internal` 逐步替换引用
3. `admin-saas` 直接使用 `@robot-admin/shared-utils`

### 2.3 共享类型包 (`packages/shared-types`)

将跨 app 共享的 TypeScript 类型集中管理：

```
packages/shared-types/
├── src/
│   ├── auth.d.ts         # 用户/登录/权限类型
│   ├── route.d.ts        # 路由/菜单类型
│   ├── api.d.ts          # API 通用响应类型
│   └── index.ts          # 统一导出
├── package.json          # @robot-admin/shared-types
└── tsconfig.json
```

---

## 三、中期迭代建议（P1 — 中优先级）

### 3.1 Turborepo / Bun 编排层优化

当前使用 `bun --filter` 进行任务编排，可考虑引入 **Turborepo** 获得：

- **缓存加速**：增量构建，已构建的包不重复执行
- **依赖图感知**：自动根据包依赖拓扑排序
- **并行执行**：无依赖任务并行运行

```json
// turbo.json（如果引入 Turborepo）
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

**权衡**：Bun Workspaces 本身已足够轻量。Turborepo 更适合 5+ 个包、需要频繁全量构建的场景。当前 2 个 app + 1 个 config 包，暂不急需。

### 3.2 admin-saas 应用差异化

SaaS 版与 Internal 版的差异点管理：

| 维度 | admin-internal | admin-saas        |
| ---- | -------------- | ----------------- |
| 登录 | 单机构登录     | 多租户 + 机构选择 |
| 权限 | RBAC           | RBAC + 租户隔离   |
| 布局 | 6 种全部       | 精简 2-3 种       |
| 功能 | 54 个 Demo     | 核心业务页面      |
| API  | 完整接口       | 租户作用域接口    |
| 主题 | 完整自定义     | 品牌色定制        |

建议通过 **环境变量 + 共享组件** 实现差异化，而非代码复制。

### 3.3 E2E 测试基础设施

在根级添加 Playwright/Vitest 集成测试：

```
packages/e2e-tests/
├── tests/
│   ├── login.spec.ts
│   ├── permission.spec.ts
│   └── layout.spec.ts
├── playwright.config.ts
└── package.json
```

配置 CI 在 PR 合并前自动运行：

```yaml
# .github/workflows/test.yml
- name: E2E Tests
  run: bun --filter @robot-admin/e2e-tests test
```

### 3.4 CI/CD Pipeline 增强

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run type-check

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check]
    strategy:
      matrix:
        app: [internal, saas]
    steps:
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build:${{ matrix.app }}
```

---

## 四、长期迭代建议（P2 — 低优先级）

### 4.1 Module Federation / Micro-Frontends

> 注："micro-app" 分支已规划此方向。

**方案选型**：

| 方案                           | 优势                            | 劣势                 | 适用场景          |
| ------------------------------ | ------------------------------- | -------------------- | ----------------- |
| **Module Federation 2.0**      | Webpack/Rspack 原生支持，粒度细 | 需要统一构建工具     | 已有 Webpack 生态 |
| **micro-app**                  | 接入简单，框架无关              | 沙箱有性能开销       | 渐进式接入        |
| **qiankun**                    | 成熟稳定                        | API 较重，沙箱限制多 | 大型企业已有应用  |
| **wujie**                      | 基于 iframe，隔离性最强         | iframe 天花板        | 安全性要求极高    |
| **Vite Federation (原生 ESM)** | 极轻量，零运行时                | 浏览器兼容性         | 现代浏览器环境    |

**建议路线**：

1. 先在 `micro-app` 分支验证 POC
2. 评估 admin-internal 与 admin-saas 是否需要运行时集成
3. 如果需要，优先考虑 **Module Federation 2.0**（与 Vite/Rolldown 生态更匹配）

### 4.2 组件库 Monorepo 内化

当前 `@robot-admin/naive-ui-components` 是独立仓库。长远可考虑将其纳入本 Monorepo：

```
packages/
├── shared-config/
├── naive-ui-components/      # ← 从独立仓库迁入
│   ├── src/components/
│   ├── package.json
│   └── tsdown.config.ts
└── shared-utils/
```

**优势**：

- 组件改动 → 应用端即时生效（无需发版）
- 统一 CI/CD 流水线
- 简化开发者体验

**劣势**：

- 仓库体积增大
- 组件库独立版本管理复杂
- 外部消费者仍需从 npm 安装

**建议**：保持独立仓库 + 通过 `bun link` 或 `bun add file:../` 本地联调。仅当团队规模增长或发版频繁时再考虑内化。

### 4.3 文档站内化

将 `AgileTeam_Doc`（VitePress 2.0）纳入 Monorepo：

```
apps/
├── admin-internal/
├── admin-saas/
└── docs/                     # ← VitePress 文档站
    ├── .vitepress/
    ├── guide/
    ├── api/
    └── package.json
```

### 4.4 国际化资源共享

当前各 app 独立维护 `lang/`，可抽离为共享包：

```
packages/shared-i18n/
├── locales/
│   ├── zh-CN/
│   ├── en-US/
│   └── ja-JP/
├── src/index.ts
└── package.json
```

---

## 五、架构演进路线图

```
Phase 1 (当前)                    Phase 2                        Phase 3
┌───────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  Bun Workspaces   │      │  + shared-utils      │      │  + Module Federation │
│  2 apps + 1 pkg   │ ───→ │  + shared-types      │ ───→ │  + E2E Tests         │
│  基础 Monorepo    │      │  + shared-config 完善│      │  + CI/CD Matrix      │
│                   │      │  + admin-saas 完善   │      │  + 组件库内化评估    │
└───────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 六、迁移注意事项

### 6.1 依赖版本一致性

Monorepo 中所有 app 的核心依赖应保持版本一致：

```bash
# 检查依赖版本差异
bun pm ls --all | grep -E "vue|naive-ui|vite"
```

建议在根 `package.json` 中使用 `overrides` 统一版本：

```json
{
  "overrides": {
    "vue": "^3.5.13",
    "naive-ui": "^2.41.0",
    "typescript": "~5.8.3"
  }
}
```

### 6.2 路径别名维护

每个 app 独立维护 `@/*` 别名指向各自的 `src/`：

```typescript
// apps/admin-internal/vite.config.ts
resolve: {
  alias: { '@': resolve(__dirname, 'src') }
}
```

⚠️ 不要在共享包中使用 `@/*` 别名（它指向的是 app 的 src，而非包自身）。

### 6.3 Git 工作流

- **主分支**：`main` — 稳定发布
- **开发分支**：`dev` — 日常开发
- **功能分支**：`feat/xxx` — 新功能
- **Monorepo 分支**：`monorepo-upgrade` — 架构重构
- **微前端分支**：`micro-app` — 微前端实验

功能分支基于 `dev` 创建，合并回 `dev`，再由版本发布合并到 `main`。

### 6.4 发版策略

采用 **独立版本管理**（independent versioning）：

- `@robot-admin/internal` — 跟随业务迭代
- `@robot-admin/saas` — 独立版本周期
- `@robot-admin/shared-config` — 仅在配置变更时发版

建议使用 [Changesets](https://github.com/changesets/changesets) 或 Release-Please（已配置）管理多包版本。

---

## 七、性能基线与监控

### 7.1 关键指标

| 指标                | 目标            | 当前  |
| ------------------- | --------------- | ----- |
| 冷启动 (dev)        | < 2s            | ~1.5s |
| HMR 热更新          | < 100ms         | ~50ms |
| 生产构建 (internal) | < 30s           | 待测  |
| 首屏 FCP            | < 1.5s          | 待测  |
| 包体积 (gzipped)    | < 500KB initial | 待测  |

### 7.2 构建分析

```bash
# 单个应用构建分析
bun --filter @robot-admin/internal analyze
```

---

## 八、常见问题

### Q: 新增一个 app 需要哪些步骤？

1. 在 `apps/` 下创建新目录（如 `apps/admin-mobile/`）
2. 初始化 `package.json`（name: `@robot-admin/mobile`）
3. 配置 `vite.config.ts`、`tsconfig.json`、`eslint.config.ts`
4. 根 `package.json` 的 `workspaces` 已包含 `apps/*`，无需修改
5. 在根 `package.json` 的 `scripts` 中添加快捷命令
6. 更新 Release-Please 配置

### Q: 共享包修改后如何让 app 感知？

Bun Workspaces 使用 symlink，共享包的代码修改会**即时生效**，无需重新安装或构建。

### Q: 如何处理跨 app 的 PR？

在 PR 描述中标明影响范围（如 `[internal][saas]`），CI 会自动检查所有受影响的包。

---

> **文档维护**：随着 Monorepo 演进，请同步更新本文档。每次重大架构变更后，在此记录决策理由和影响范围。
