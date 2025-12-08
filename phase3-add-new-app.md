# 阶段三：添加新应用（第 4-6 周）

## 目标

添加第二个应用，展示 Monorepo 的真正价值：代码共享、独立部署。

---

## 🎯 场景示例

根据你的需求，可能的新应用场景：

1. **Mobile H5 应用** (`@robot/mobile`)
   - 移动端管理界面
   - 共享 API 和工具函数
   - 独立部署

2. **Landing Page** (`@robot/landing`)
   - 产品官网
   - 共享品牌资源和工具
   - 独立部署

3. **Admin V2** (`@robot/admin-v2`)
   - 新版管理后台
   - 逐步迁移功能
   - 与旧版并存

以下以添加 **Mobile H5** 为例。

---

## 📁 最终目录结构

```
robot-admin-monorepo/
├── apps/
│   ├── admin/              # 现有管理后台
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/             # 新增移动端 🆕
│       ├── src/
│       │   ├── views/      # 移动端页面
│       │   ├── components/ # 移动端特定组件
│       │   ├── styles/     # 移动端样式
│       │   ├── App.vue
│       │   └── main.ts
│       ├── public/
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   ├── shared/             # 共享工具（已有）
│   │   └── src/
│   │
│   └── ui-mobile/          # 移动端 UI 组件库（可选）🆕
│       ├── src/
│       │   └── components/
│       ├── package.json
│       └── vite.config.ts
│
├── package.json
└── README.md
```

---

## 步骤 1：创建新应用

### 1.1 使用脚本快速创建

```bash
# 创建 mobile 应用骨架
bash scripts/phase3-create-app.sh mobile

# 或手动创建
mkdir -p apps/mobile/{src/{views,components,styles},public}
```

### 1.2 配置 package.json

```bash
cat > apps/mobile/package.json << 'EOF'
{
  "name": "@robot/mobile",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@robot/shared": "workspace:*",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^3.0.1",
    "vant": "^4.9.0",
    "@vueuse/core": "^11.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^7.0.6",
    "vue-tsc": "^2.2.8",
    "typescript": "~5.8.0",
    "sass": "^1.70.0"
  }
}
EOF
```

### 1.3 配置 Vite

```typescript
// apps/mobile/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@robot/shared': resolve(__dirname, '../../packages/shared/src')
    }
  },

  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

### 1.4 创建基础文件

```vue
<!-- apps/mobile/src/App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 移动端入口组件
</script>

<style lang="scss">
// 移动端全局样式
</style>
```

```typescript
// apps/mobile/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 使用共享工具
import { log } from '@robot/shared'

async function bootstrap() {
  log('Mobile App Starting...')

  const app = createApp(App)
  
  app.use(createPinia())
  app.use(router)
  
  await router.isReady()
  app.mount('#app')
  
  log('Mobile App Started!')
}

bootstrap()
```

```typescript
// apps/mobile/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    }
  ]
})

export default router
```

---

## 步骤 2：代码共享示例

### 2.1 共享 API 调用

```typescript
// packages/shared/src/api/user.ts 🆕
import type { ApiResponse, User } from '../types'

export async function getUserInfo(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// apps/admin/src/xxx.vue
import { getUserInfo } from '@robot/shared/api'

// apps/mobile/src/xxx.vue
import { getUserInfo } from '@robot/shared/api'
// 两个应用使用同一个 API 函数！
```

### 2.2 共享类型定义

```typescript
// packages/shared/src/types/user.ts 🆕
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
}

// 两个应用都使用相同的类型定义
```

### 2.3 共享工具函数

```typescript
// apps/admin 和 apps/mobile 都使用
import { formatDate, validateEmail } from '@robot/shared'
```

---

## 步骤 3：独立部署配置

### 3.1 更新根 package.json

```json
{
  "scripts": {
    "dev": "bun run dev:admin",
    "dev:admin": "bun --filter @robot/admin dev",
    "dev:mobile": "bun --filter @robot/mobile dev",
    "dev:all": "bun --filter '@robot/*' dev",
    
    "build": "bun run build:packages && bun run build:apps",
    "build:apps": "bun --filter './apps/*' build",
    "build:admin": "bun --filter @robot/admin build",
    "build:mobile": "bun --filter @robot/mobile build",
    
    "preview:admin": "bun --filter @robot/admin preview",
    "preview:mobile": "bun --filter @robot/mobile preview"
  }
}
```

### 3.2 CI/CD 配置（GitHub Actions）

```yaml
# .github/workflows/deploy.yml
name: Deploy Apps

on:
  push:
    branches: [main]

jobs:
  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install
        run: bun install
      
      - name: Build Admin
        run: bun run build:admin
      
      - name: Deploy Admin
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/admin/dist
          destination_dir: admin

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install
        run: bun install
      
      - name: Build Mobile
        run: bun run build:mobile
      
      - name: Deploy Mobile
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/mobile/dist
          destination_dir: mobile
```

### 3.3 Vercel 部署配置

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/admin/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "apps/admin/dist"
      }
    },
    {
      "src": "apps/mobile/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "apps/mobile/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "apps/admin/dist/$1"
    },
    {
      "src": "/mobile/(.*)",
      "dest": "apps/mobile/dist/$1"
    }
  ]
}
```

---

## 步骤 4：开发工作流

### 4.1 日常开发

```bash
# 开发 admin
bun run dev:admin

# 开发 mobile
bun run dev:mobile

# 同时开发两个应用
bun run dev:all
```

### 4.2 代码提交

```bash
# 修改了 shared 包
cd packages/shared
# ... 修改代码
git add .
git commit -m "feat(shared): add new utility function"

# 修改了 admin
cd apps/admin
# ... 修改代码
git add .
git commit -m "feat(admin): add new feature"

# 修改了 mobile
cd apps/mobile
# ... 修改代码
git add .
git commit -m "feat(mobile): add new page"
```

### 4.3 构建和部署

```bash
# 构建所有应用
bun run build

# 只构建 admin
bun run build:admin

# 只构建 mobile
bun run build:mobile

# 预览
bun run preview:admin  # http://localhost:4173
bun run preview:mobile # http://localhost:4174
```

---

## 步骤 5：创建可选的 UI 组件库

如果移动端需要独立的 UI 组件：

```bash
mkdir -p packages/ui-mobile/src/components
```

```json
// packages/ui-mobile/package.json
{
  "name": "@robot/ui-mobile",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "dependencies": {
    "@robot/shared": "workspace:*",
    "vue": "^3.5.13"
  }
}
```

```typescript
// packages/ui-mobile/src/index.ts
export { default as MButton } from './components/MButton.vue'
export { default as MCard } from './components/MCard.vue'
// ... 更多移动端组件
```

在 mobile 应用中使用：
```typescript
import { MButton, MCard } from '@robot/ui-mobile'
```

---

## 🎯 阶段三完成标志

- [x] 新应用创建成功
- [x] 可以独立运行和构建
- [x] 成功使用 `@robot/shared` 共享代码
- [x] 两个应用可以同时开发
- [x] CI/CD 配置完成
- [x] 可以独立部署

---

## 💡 最佳实践

### 1. 应用命名规范

```
@robot/admin          # 管理后台
@robot/mobile         # 移动端
@robot/landing        # 官网
@robot/admin-v2       # 新版管理后台
```

### 2. 共享代码原则

**应该共享：**
- ✅ API 调用函数
- ✅ 数据类型定义
- ✅ 工具函数
- ✅ 常量和配置
- ✅ 业务逻辑（如果多个应用需要）

**不应该共享：**
- ❌ 页面组件
- ❌ 路由配置
- ❌ 应用特定的样式
- ❌ 应用特定的状态管理

### 3. 版本管理

```bash
# 使用 Changesets 管理版本
bun add -D @changesets/cli
bun changeset init

# 创建变更集
bun changeset

# 更新版本
bun changeset version

# 发布（如果需要）
bun changeset publish
```

---

## 🚀 扩展可能

完成阶段三后，你的架构可以轻松扩展：

1. **添加更多应用**
   ```bash
   bash scripts/phase3-create-app.sh dashboard
   bash scripts/phase3-create-app.sh portal
   ```

2. **提取更多共享包**
   ```
   packages/
   ├── shared/          # 通用工具
   ├── ui-admin/        # Admin UI 组件
   ├── ui-mobile/       # Mobile UI 组件
   ├── api-client/      # API 客户端
   └── business-logic/  # 共享业务逻辑
   ```

3. **微前端集成**
   - 使用 qiankun 或 Module Federation
   - 将 apps 作为微前端子应用
   - 创建主应用壳

---

## 📋 完整检查清单

### 阶段三完成检查
- [ ] 新应用目录结构正确
- [ ] package.json 配置正确
- [ ] Vite 配置正确
- [ ] TypeScript 配置正确
- [ ] `bun install` 成功
- [ ] `bun run dev:mobile` 可以启动
- [ ] 页面可以正常访问
- [ ] 成功导入 `@robot/shared`
- [ ] 类型检查通过
- [ ] 构建成功
- [ ] 两个应用可以同时运行
- [ ] CI/CD 配置完成

---

## 🎉 恭喜！

完成三个阶段后，你将拥有：

✅ **完整的 Monorepo 架构**
- 支持多个应用
- 代码高度复用
- 独立开发部署

✅ **现代化的工作流**
- 基于 Bun 的高速构建
- 清晰的代码组织
- 完善的类型支持

✅ **灵活的扩展能力**
- 轻松添加新应用
- 轻松提取新的共享包
- 为微前端做好准备

✅ **没有过度设计**
- 保持简单实用
- 渐进式演进
- 低维护成本
