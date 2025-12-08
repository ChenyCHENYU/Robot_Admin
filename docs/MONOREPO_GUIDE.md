# Monorepo 架构指南

## 📚 目录

- [项目概述](#项目概述)
- [架构设计](#架构设计)
- [目录结构](#目录结构)
- [依赖管理](#依赖管理)
- [开发工作流](#开发工作流)
- [构建与部署](#构建与部署)
- [扩展新应用](#扩展新应用)
- [最佳实践](#最佳实践)

---

## 项目概述

Robot Admin Monorepo 是一个基于 Bun Workspaces 的企业级多应用管理平台，采用 Monorepo 架构统一管理多个前端应用和共享包。

### 核心特性

- 🎯 **多应用管理**：支持 Internal 版和 SaaS 版两个独立应用
- 📦 **代码共享**：5 个共享包统一管理公共代码
- 🚀 **独立部署**：每个应用可独立构建和部署
- 🔧 **统一工具链**：ESLint、Prettier、TypeScript、Commitizen 全局配置
- ⚡️ **高效开发**：Bun + Vite 提供极速开发体验

### 技术栈

| 技术       | 版本   | 用途             |
| ---------- | ------ | ---------------- |
| Bun        | 1.3.4+ | 包管理器和运行时 |
| Vue        | 3.5.13 | 前端框架         |
| TypeScript | 5.8.0  | 类型系统         |
| Vite       | 7.0.6  | 构建工具         |
| Naive UI   | 2.41.0 | UI 组件库        |
| UnoCSS     | 0.65+  | 原子化 CSS       |

---

## 架构设计

### 整体架构

```
Robot_Admin (Monorepo)
├── apps/                          # 应用层
│   ├── robot-admin-internal/      # 内部版应用 (端口 1988)
│   └── robot-admin-saas/          # SaaS 版应用 (端口 1989)
├── packages/                      # 共享包层
│   ├── shared/                    # @robot/shared - 工具函数
│   ├── core/                      # @robot/core - 核心逻辑
│   ├── ui/                        # @robot/ui - UI 组件库
│   ├── business/                  # @robot/business - 业务组件
│   └── integrations/              # @robot/integrations - 第三方集成
└── docs/                          # 文档
```

### 依赖关系图

```
┌─────────────────────────────────────────┐
│           应用层 (Apps)                  │
│  ┌──────────────┐    ┌──────────────┐   │
│  │   Internal   │    │     SaaS     │   │
│  └──────────────┘    └──────────────┘   │
│         ↓                    ↓           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│          共享包层 (Packages)             │
│  ┌──────┐  ┌──────┐  ┌──────────────┐  │
│  │  UI  │  │Business│ │Integrations │  │
│  └──────┘  └──────┘  └──────────────┘  │
│      ↓          ↓            ↓          │
│  ┌──────────────────────────────────┐  │
│  │      Core (核心逻辑)              │  │
│  └──────────────────────────────────┘  │
│              ↓                          │
│  ┌──────────────────────────────────┐  │
│  │    Shared (工具函数)              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 设计原则

1. **单一职责**：每个包有明确的职责边界
2. **依赖倒置**：上层依赖下层，下层不依赖上层
3. **开放封闭**：对扩展开放，对修改封闭
4. **最小依赖**：包之间的依赖保持最小化

---

## 目录结构

### 根目录配置

```
Robot_Admin/
├── .cz-config.cjs              # Commitizen 配置
├── .prettierrc.json            # Prettier 配置（全局共享）
├── commitlint.config.js        # Commitlint 配置
├── eslint.config.ts            # ESLint 配置（全局共享）
├── tsconfig.json               # TypeScript 基础配置
├── package.json                # 根 package.json
│   └── workspaces: ["apps/*", "packages/*"]
└── bun.lock                    # 依赖锁文件
```

### 应用目录结构

```
apps/robot-admin-internal/
├── src/
│   ├── api/                    # API 接口
│   ├── assets/                 # 静态资源
│   ├── components/             # 本地组件
│   ├── composables/            # 组合式函数
│   ├── router/                 # 路由配置
│   ├── stores/                 # 状态管理
│   ├── views/                  # 页面视图
│   ├── utils/                  # 工具函数
│   ├── config/                 # 配置文件
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 入口文件
├── public/                     # 公共资源
├── dist/                       # 构建产物
├── package.json                # 应用依赖
├── vite.config.ts              # Vite 配置
├── unocss.config.ts            # UnoCSS 配置
└── tsconfig.json               # TS 配置（继承根）
```

### 共享包目录结构

```
packages/ui/
├── src/
│   ├── components/             # 组件源码
│   │   ├── Button/
│   │   ├── Table/
│   │   └── index.ts
│   ├── composables/            # 组合式函数
│   ├── types/                  # 类型定义
│   └── index.ts                # 导出入口
├── package.json
└── tsconfig.json
```

---

## 依赖管理

### Workspace 依赖

在 `package.json` 中使用 `workspace:*` 声明依赖：

```json
{
  "dependencies": {
    "@robot/shared": "workspace:*",
    "@robot/core": "workspace:*",
    "@robot/ui": "workspace:*"
  }
}
```

**工作原理：**

- 开发时：Bun 自动链接到本地包目录
- 构建时：Vite 自动打包共享代码到 bundle
- 部署时：无需额外配置，dist 产物完全独立

### 依赖安装

```bash
# 安装所有依赖（根目录 + 所有子包）
bun install

# 为特定应用安装依赖
bun --filter @robot/admin-internal add lodash-es

# 为所有应用安装依赖
bun --filter './apps/*' add date-fns

# 为特定共享包安装依赖
bun --filter @robot/ui add @vueuse/core
```

### 依赖升级

```bash
# 升级所有依赖
bun update

# 升级特定包
bun update vue vite

# 检查过期依赖
bun outdated
```

---

## 开发工作流

### 启动开发服务器

```bash
# 启动 Internal 版本（端口 1988）
bun run dev:internal
# 或
bun --filter @robot/admin-internal dev

# 启动 SaaS 版本（端口 1989）
bun run dev:saas
# 或
bun --filter @robot/admin-saas dev

# 同时启动两个应用
bun run dev:internal & bun run dev:saas
```

### 修改共享包

当你修改 `packages/` 中的代码时，应用会自动热更新（HMR）：

```bash
# 1. 修改共享包代码
vim packages/ui/src/components/Button/index.vue

# 2. 保存后，使用该组件的应用自动刷新
# 无需重启开发服务器！
```

### 类型检查

```bash
# 检查所有应用的类型
bun run type-check

# 检查特定应用
bun --filter @robot/admin-internal run type-check
```

### 代码检查和格式化

```bash
# ESLint 检查（所有应用）
bun run lint

# ESLint 自动修复
bun run lint:fix

# Prettier 格式化
bun --filter @robot/admin-internal run format
```

### Git 提交

```bash
# 暂存修改
git add .

# 使用 Commitizen 提交（必须在根目录）
git cz

# 提交流程：
# 1. 选择提交类型（feat/fix/docs...）
# 2. 输入影响范围（admin-internal/admin-saas/ui...）
# 3. 输入简短描述
# 4. 输入详细描述（可选）
# 5. 自动触发 lint-staged 和 commitlint 检查
```

---

## 构建与部署

### 构建命令

```bash
# 构建所有应用
bun run build

# 构建特定应用
bun run build:internal    # Internal 版本
bun run build:saas        # SaaS 版本

# 构建并分析包大小
ANALYZE=true bun run build:internal
```

### 构建产物

```
apps/robot-admin-internal/dist/
├── index.html
├── assets/
│   ├── index-[hash].js        # 主 bundle（包含所有共享包代码）
│   ├── index-[hash].css
│   └── vendor-[hash].js       # 第三方库
└── favicon.ico
```

**关键特性：**

- ✅ 所有 `@robot/*` 包的代码已打包进 `dist/`
- ✅ `dist/` 可以直接部署到任何静态服务器
- ✅ 无需在生产环境安装依赖

### 部署方式

#### 1. Docker 部署（推荐）

**创建 Dockerfile：**

```dockerfile
# apps/robot-admin-internal/Dockerfile
FROM nginx:alpine

# 复制构建产物
COPY dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf：**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # 支持 Vue Router history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

**部署：**

```bash
# 构建
bun run build:internal

# 构建镜像
cd apps/robot-admin-internal
docker build -t robot-admin-internal:latest .

# 运行
docker run -d -p 80:80 robot-admin-internal:latest
```

#### 2. Vercel 部署

```bash
cd apps/robot-admin-internal

# 首次部署
vercel

# 生产环境部署
vercel --prod
```

**vercel.json：**

```json
{
  "buildCommand": "cd ../.. && bun run build:internal",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

#### 3. Nginx 静态部署

```bash
# 构建
bun run build:internal

# 部署到服务器
scp -r apps/robot-admin-internal/dist/* user@server:/var/www/internal/

# 配置 Nginx
sudo vim /etc/nginx/sites-available/internal
# 使用上面的 nginx.conf 配置

sudo nginx -t
sudo systemctl reload nginx
```

#### 4. OSS + CDN 部署

```bash
# 构建
bun run build:internal

# 上传到阿里云 OSS
cd apps/robot-admin-internal/dist
ossutil cp -r . oss://your-bucket/internal/ \
  --meta="Cache-Control:max-age=31536000"

# 配置 CDN 回源
# 在阿里云 CDN 控制台配置回源到 OSS
```

### 环境变量管理

```bash
# 开发环境
apps/robot-admin-internal/.env.development

# 测试环境
apps/robot-admin-internal/.env.test

# 生产环境
apps/robot-admin-internal/.env.production
```

**示例：**

```env
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=Robot Admin Internal
VITE_ENABLE_ANALYTICS=true
```

---

## 扩展新应用

### 步骤 1：创建应用目录

```bash
# 复制现有应用作为模板
cp -r apps/robot-admin-internal apps/robot-admin-mobile

cd apps/robot-admin-mobile
```

### 步骤 2：修改 package.json

```json
{
  "name": "@robot/admin-mobile",
  "version": "1.0.0",
  "description": "Robot Admin 移动端应用",
  "scripts": {
    "dev": "vite --port 1990",
    "build": "env-manager prod && vite build",
    "preview": "bun run build && vite preview"
  },
  "dependencies": {
    "@robot/shared": "workspace:*",
    "@robot/core": "workspace:*",
    "@robot/ui": "workspace:*",
    "@robot/business": "workspace:*",
    "vant": "^4.9.0"
  }
}
```

### 步骤 3：修改 vite.config.ts

```typescript
// apps/robot-admin-mobile/vite.config.ts
export default defineConfig(({ mode }) => {
  // ... 其他配置

  return {
    server: {
      port: 1990, // 修改端口
    },
    // ... 其他配置
  }
})
```

### 步骤 4：更新根 package.json

```json
{
  "scripts": {
    "dev:mobile": "bun --filter @robot/admin-mobile dev",
    "build:mobile": "bun --filter @robot/admin-mobile build"
  }
}
```

### 步骤 5：安装依赖并启动

```bash
# 回到根目录
cd ../..

# 安装依赖
bun install

# 启动新应用
bun run dev:mobile
```

---

## 最佳实践

### 1. 代码组织

#### ✅ 推荐：按功能模块组织

```
packages/business/src/
├── user/                    # 用户模块
│   ├── components/
│   ├── composables/
│   └── index.ts
├── order/                   # 订单模块
│   ├── components/
│   ├── composables/
│   └── index.ts
└── index.ts
```

#### ❌ 不推荐：按类型组织

```
packages/business/src/
├── components/              # 所有组件混在一起
├── composables/             # 所有 hooks 混在一起
└── utils/                   # 所有工具混在一起
```

### 2. 共享包职责划分

| 包名                  | 职责                   | 示例                          |
| --------------------- | ---------------------- | ----------------------------- |
| `@robot/shared`       | 纯工具函数，无业务逻辑 | `formatDate()`, `deepClone()` |
| `@robot/core`         | 核心业务逻辑           | 权限管理、路由守卫            |
| `@robot/ui`           | 纯 UI 组件             | Button, Table, Modal          |
| `@robot/business`     | 业务组件               | UserCard, OrderList           |
| `@robot/integrations` | 第三方集成             | 地图、支付、统计              |

### 3. 导出规范

**每个包必须有清晰的导出入口：**

```typescript
// packages/ui/src/index.ts
export { default as Button } from './components/Button'
export { default as Table } from './components/Table'
export * from './composables'
export type * from './types'
```

**应用中统一从入口导入：**

```typescript
// ✅ 推荐
import { Button, Table, useTable } from '@robot/ui'

// ❌ 不推荐
import Button from '@robot/ui/src/components/Button'
```

### 4. 类型定义

**共享类型放在 `@robot/shared`：**

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string
  name: string
  email: string
}

// 导出
// packages/shared/src/index.ts
export type * from './types/user'
```

**应用中使用：**

```typescript
import type { User } from '@robot/shared'
```

### 5. 版本管理

**使用 Conventional Commits：**

```bash
# 功能开发
git commit -m "feat(admin-internal): 添加用户管理页面"

# Bug 修复
git commit -m "fix(ui): 修复 Table 排序问题"

# 文档更新
git commit -m "docs: 更新 Monorepo 指南"

# 共享包更新
git commit -m "feat(shared): 新增日期格式化工具"
```

**Scope 命名规范：**

- `admin-internal` - Internal 应用
- `admin-saas` - SaaS 应用
- `shared` - Shared 包
- `core` - Core 包
- `ui` - UI 包
- `business` - Business 包
- `integrations` - Integrations 包
- `*` - 影响多个包

### 6. 性能优化

#### 代码分割

```typescript
// 路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('@/views/user/index.vue'),
  },
]

// 组件懒加载
const HeavyComponent = defineAsyncComponent(
  () => import('@robot/business/components/HeavyComponent')
)
```

#### 按需导入

```typescript
// ✅ 推荐：按需导入
import { formatDate } from '@robot/shared'

// ❌ 不推荐：全量导入
import * as shared from '@robot/shared'
const { formatDate } = shared
```

### 7. 测试策略

```bash
# 单元测试（共享包）
packages/ui/
└── src/
    └── components/
        └── Button/
            ├── index.vue
            └── __tests__/
                └── index.test.ts

# 集成测试（应用）
apps/robot-admin-internal/
└── src/
    └── views/
        └── user/
            ├── index.vue
            └── __tests__/
                └── index.test.ts
```

### 8. 文档维护

**每个共享包都应有 README：**

```
packages/ui/
├── README.md               # 包说明文档
├── CHANGELOG.md            # 变更日志
└── src/
    └── components/
        └── Button/
            └── README.md   # 组件文档
```

### 9. CI/CD 最佳实践

**GitHub Actions 示例：**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-internal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build:internal
      - uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.DEPLOY_KEY }}
          publish_dir: ./apps/robot-admin-internal/dist

  build-saas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build:saas
      - uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.DEPLOY_KEY_SAAS }}
          publish_dir: ./apps/robot-admin-saas/dist
```

### 10. 依赖升级策略

```bash
# 每月检查一次依赖更新
bun outdated

# 升级非破坏性更新
bun update

# 升级主版本前先测试
bun --filter @robot/admin-internal add vue@latest
bun run dev:internal  # 测试
bun run build:internal  # 确认构建通过

# 所有测试通过后，升级其他应用
bun --filter @robot/admin-saas add vue@latest
```

---

## 常见问题

### Q1: 修改共享包后，应用没有更新？

**A:** 确保开发服务器在运行，HMR 应该自动生效。如果没有：

```bash
# 重启开发服务器
Ctrl + C
bun run dev:internal
```

### Q2: 构建失败，提示找不到共享包？

**A:** 检查依赖声明：

```bash
# 在应用的 package.json 中确认
"dependencies": {
  "@robot/shared": "workspace:*"  # 必须是 workspace:*
}

# 重新安装依赖
bun install
```

### Q3: 如何调试共享包代码？

**A:** 可以直接在共享包中打断点：

```typescript
// packages/ui/src/components/Button/index.vue
console.log('Button clicked') // 直接添加日志

// 或在浏览器中打断点
// DevTools -> Sources -> packages/ui/src/...
```

### Q4: 如何发布共享包到私有 npm？

**A:** 如果需要其他团队使用：

```bash
cd packages/ui
npm login --registry=https://your-registry.com
npm publish

# 其他团队使用
npm install @robot/ui@1.0.0
```

### Q5: 多人协作时如何避免冲突？

**A:** 遵循分支策略：

```bash
# 功能分支
git checkout -b feat/admin-internal/user-management

# 只修改相关应用和共享包
apps/robot-admin-internal/
packages/business/

# 提交前拉取最新代码
git pull origin develop
git rebase develop

# 解决冲突后推送
git push origin feat/admin-internal/user-management
```

---

## 总结

Robot Admin Monorepo 通过合理的架构设计和最佳实践，实现了：

- ✅ **代码复用**：共享包统一管理，避免重复代码
- ✅ **独立部署**：每个应用独立构建和部署
- ✅ **类型安全**：TypeScript 全局类型检查
- ✅ **开发效率**：统一工具链，快速开发迭代
- ✅ **易于扩展**：新增应用只需几分钟

遵循本指南的规范，可以确保项目长期保持健康和可维护性。

---

**最后更新：** 2025-12-08  
**维护者：** ChenY (ycyplus@gmail.com)
