# 开发指南

本文档详细说明日常开发工作流程、调试技巧和注意事项。

## 📋 目录

- [环境准备](#环境准备)
- [日常开发](#日常开发)
- [调试技巧](#调试技巧)
- [代码规范](#代码规范)
- [常用命令](#常用命令)
- [问题排查](#问题排查)

---

## 环境准备

### 必需环境

```bash
# 1. 安装 Bun (>= 1.3.4)
curl -fsSL https://bun.sh/install | bash

# 2. 验证安装
bun --version  # 应输出 1.3.4 或更高

# 3. 克隆项目
git clone git@github.com:ChenyCHENYU/Robot_Admin.git
cd Robot_Admin

# 4. 安装依赖
bun install

# 5. 启动开发服务器
bun run dev:internal  # 或 dev:saas
```

### 推荐工具

- **IDE**: VS Code
- **插件**:
  - Vue - Official (Volar)
  - ESLint
  - Prettier
  - UnoCSS
  - Error Lens
- **浏览器**: Chrome/Edge + Vue DevTools

---

## 日常开发

### 启动项目

```bash
# 启动 Internal 版本（端口 1988）
bun run dev:internal

# 启动 SaaS 版本（端口 1989）
bun run dev:saas

# 同时启动两个版本
bun run dev:internal & bun run dev:saas
```

### 创建新页面

#### 1. 创建页面文件

```bash
# 在应用中创建页面
mkdir -p apps/robot-admin-internal/src/views/product
touch apps/robot-admin-internal/src/views/product/index.vue
```

#### 2. 编写页面组件

```vue
<!-- apps/robot-admin-internal/src/views/product/index.vue -->
<template>
  <div class="product-page">
    <PageHeader title="产品管理" />
    <ProductTable />
  </div>
</template>

<script setup lang="ts">
  import { ProductTable } from '@robot/business'
  import { PageHeader } from '@robot/ui'

  // 页面逻辑
</script>

<style scoped>
  .product-page {
    padding: 20px;
  }
</style>
```

#### 3. 配置路由

```typescript
// apps/robot-admin-internal/src/router/index.ts
const routes = [
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/views/product/index.vue'),
    meta: {
      title: '产品管理',
      requireAuth: true,
    },
  },
]
```

#### 4. 添加菜单

```typescript
// apps/robot-admin-internal/src/config/menu.ts
export const menuConfig = [
  {
    label: '产品管理',
    key: 'product',
    icon: 'i-ri-product-hunt-line',
    path: '/product',
  },
]
```

### 创建新组件

#### 在应用内部创建（本地组件）

```bash
# 创建本地组件
mkdir -p apps/robot-admin-internal/src/components/ProductCard
touch apps/robot-admin-internal/src/components/ProductCard/index.vue
```

```vue
<!-- apps/robot-admin-internal/src/components/ProductCard/index.vue -->
<template>
  <div class="product-card">
    <h3>{{ product.name }}</h3>
    <p>{{ product.price }}</p>
  </div>
</template>

<script setup lang="ts">
  interface Product {
    name: string
    price: number
  }

  defineProps<{
    product: Product
  }>()
</script>
```

#### 在共享包中创建（UI 组件）

```bash
# 创建 UI 组件
mkdir -p packages/ui/src/components/ProductCard
touch packages/ui/src/components/ProductCard/index.vue
```

```vue
<!-- packages/ui/src/components/ProductCard/index.vue -->
<template>
  <n-card
    class="product-card"
    hoverable
  >
    <template #header>
      <div class="product-header">
        <h3>{{ product.name }}</h3>
        <n-tag :type="statusType">{{ product.status }}</n-tag>
      </div>
    </template>
    <p class="product-price">¥{{ product.price }}</p>
    <p class="product-desc">{{ product.description }}</p>
  </n-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Product } from '@robot/shared'

  const props = defineProps<{
    product: Product
  }>()

  const statusType = computed(() => {
    return props.product.status === 'active' ? 'success' : 'warning'
  })
</script>

<style scoped>
  .product-card {
    width: 300px;
  }

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
```

**导出组件：**

```typescript
// packages/ui/src/index.ts
export { default as ProductCard } from './components/ProductCard'
```

**在应用中使用：**

```vue
<template>
  <ProductCard :product="product" />
</template>

<script setup lang="ts">
  import { ProductCard } from '@robot/ui'
  import type { Product } from '@robot/shared'

  const product: Product = {
    name: 'iPhone 15',
    price: 5999,
    status: 'active',
  }
</script>
```

### 使用 Composables

#### 创建 Composable

```typescript
// packages/ui/src/composables/useTable.ts
import { ref, computed } from 'vue'

export function useTable<T>(data: T[]) {
  const currentPage = ref(1)
  const pageSize = ref(10)

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return data.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(data.length / pageSize.value)
  })

  function goToPage(page: number) {
    currentPage.value = page
  }

  return {
    currentPage,
    pageSize,
    paginatedData,
    totalPages,
    goToPage,
  }
}
```

**导出：**

```typescript
// packages/ui/src/composables/index.ts
export { useTable } from './useTable'

// packages/ui/src/index.ts
export * from './composables'
```

**使用：**

```vue
<script setup lang="ts">
  import { useTable } from '@robot/ui'

  const data = ref([...])
  const { paginatedData, currentPage, totalPages, goToPage } = useTable(data.value)
</script>
```

### 状态管理

```typescript
// apps/robot-admin-internal/src/stores/user/index.ts
import { defineStore } from 'pinia'
import type { User } from '@robot/shared'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isLogin = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const res = await api.login({ username, password })
    user.value = res.user
    token.value = res.token
  }

  function logout() {
    user.value = null
    token.value = ''
  }

  return {
    user,
    token,
    isLogin,
    login,
    logout,
  }
})
```

### API 接口

```typescript
// apps/robot-admin-internal/src/api/product.ts
import { request } from '@/axios/request'
import type { Product } from '@robot/shared'

export const productApi = {
  // 获取产品列表
  getList(params: { page: number; size: number }) {
    return request.get<Product[]>('/api/products', { params })
  },

  // 获取产品详情
  getDetail(id: string) {
    return request.get<Product>(`/api/products/${id}`)
  },

  // 创建产品
  create(data: Partial<Product>) {
    return request.post<Product>('/api/products', data)
  },

  // 更新产品
  update(id: string, data: Partial<Product>) {
    return request.put<Product>(`/api/products/${id}`, data)
  },

  // 删除产品
  delete(id: string) {
    return request.delete(`/api/products/${id}`)
  },
}
```

---

## 调试技巧

### 浏览器调试

```typescript
// 1. 使用 console
console.log('用户数据:', user)
console.table(products)
console.time('API 请求')
// ... 代码
console.timeEnd('API 请求')

// 2. 使用 debugger
function handleSubmit() {
  debugger // 断点会在这里停止
  // ...
}

// 3. 条件断点
if (user.id === '123') {
  debugger // 只在特定条件下触发
}
```

### Vue DevTools

```bash
# 安装 Vue DevTools 浏览器扩展
# Chrome/Edge: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org

# 使用技巧：
# - Components: 查看组件树和 props/data
# - Timeline: 追踪性能和事件
# - Pinia: 查看状态管理
# - Router: 查看路由状态
```

### 网络请求调试

```typescript
// apps/robot-admin-internal/src/axios/request.ts
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    console.log('🚀 请求:', config.url, config.params)
    return config
  },
  error => {
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    console.log('✅ 响应:', response.config.url, response.data)
    return response.data
  },
  error => {
    console.error('❌ 响应错误:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)
```

### 性能分析

```bash
# 构建分析
ANALYZE=true bun run build:internal

# 会自动打开浏览器显示 bundle 分析报告
# 查看哪些包占用空间最大
```

### 源码调试

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "调试 Internal 应用",
      "url": "http://localhost:1988",
      "webRoot": "${workspaceFolder}/apps/robot-admin-internal"
    }
  ]
}
```

---

## 代码规范

### TypeScript 规范

```typescript
// ✅ 推荐：明确类型
interface User {
  id: string
  name: string
  age: number
}

const user: User = {
  id: '123',
  name: 'John',
  age: 30
}

// ❌ 不推荐：使用 any
const user: any = {...}

// ✅ 推荐：使用泛型
function getData<T>(url: string): Promise<T> {
  return request.get<T>(url)
}

// ✅ 推荐：使用 const 断言
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

type Status = typeof STATUS[keyof typeof STATUS]
```

### Vue 组件规范

```vue
<!-- ✅ 推荐：使用 setup 语法糖 -->
<script setup lang="ts">
  import { ref, computed } from 'vue'

  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }
</script>

<!-- ❌ 不推荐：使用 Options API -->
<script lang="ts">
  export default {
    data() {
      return { count: 0 }
    },
    computed: {
      doubleCount() {
        return this.count * 2
      },
    },
  }
</script>
```

### CSS 规范

```vue
<style scoped>
  /* ✅ 推荐：使用 UnoCSS 原子类 */
</style>

<template>
  <div class="flex items-center justify-between p-4 bg-white rounded">
    <h1 class="text-xl font-bold">标题</h1>
  </div>
</template>

<!-- ❌ 不推荐：写大量自定义 CSS -->
<style scoped>
  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: white;
    border-radius: 4px;
  }
</style>
```

### 命名规范

```typescript
// 文件名：kebab-case
user-profile.vue
product-list.ts

// 组件名：PascalCase
<UserProfile />
<ProductList />

// 函数名：camelCase
function getUserInfo() {}
function handleSubmit() {}

// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// 类型/接口：PascalCase
interface UserInfo {}
type ProductStatus = 'active' | 'inactive'

// 变量：camelCase
const userName = 'John'
const productList = []
```

---

## 常用命令

### 开发命令

```bash
# 启动开发服务器
bun run dev                # 启动 Internal（默认）
bun run dev:internal       # 启动 Internal
bun run dev:saas          # 启动 SaaS

# 类型检查
bun run type-check        # 检查所有应用

# 代码检查
bun run lint              # ESLint 检查
bun run lint:fix          # 自动修复

# 代码格式化
bun --filter @robot/admin-internal run format
```

### 构建命令

```bash
# 构建生产环境
bun run build             # 构建所有应用
bun run build:internal    # 构建 Internal
bun run build:saas        # 构建 SaaS

# 构建其他环境
bun --filter @robot/admin-internal run build:test
bun --filter @robot/admin-internal run build:staging

# 预览构建产物
bun run preview:internal
bun run preview:saas
```

### 依赖管理

```bash
# 安装依赖
bun install

# 添加依赖到特定应用
bun --filter @robot/admin-internal add lodash-es

# 添加依赖到共享包
bun --filter @robot/ui add @vueuse/core

# 添加开发依赖
bun --filter @robot/admin-internal add -d @types/lodash-es

# 升级依赖
bun update vue vite

# 查看过期依赖
bun outdated
```

### Git 命令

```bash
# 查看状态
git status

# 暂存修改
git add .

# 提交（使用 Commitizen）
git cz

# 推送
git push origin feature/xxx

# 拉取最新代码
git pull origin develop

# 切换分支
git checkout -b feature/user-management
```

---

## 问题排查

### 问题 1: 端口被占用

```bash
# Windows
netstat -ano | findstr :1988
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :1988
kill -9 <PID>

# 或者修改端口
# apps/robot-admin-internal/vite.config.ts
server: {
  port: 1999  # 改为其他端口
}
```

### 问题 2: 依赖安装失败

```bash
# 清理缓存
rm -rf node_modules
rm bun.lock

# 重新安装
bun install

# 如果还是失败，尝试使用 --force
bun install --force
```

### 问题 3: 类型错误

```bash
# 重新生成类型文件
bun run type-build

# 检查 tsconfig.json 配置
cat apps/robot-admin-internal/tsconfig.json

# 重启 IDE 的 TypeScript 服务
# VS Code: Cmd/Ctrl + Shift + P -> TypeScript: Restart TS Server
```

### 问题 4: HMR 不工作

```bash
# 检查 vite.config.ts
server: {
  hmr: true,
  watch: {
    usePolling: true  # 如果在 WSL 或 Docker 中开发
  }
}

# 重启开发服务器
Ctrl + C
bun run dev:internal
```

### 问题 5: 构建失败

```bash
# 检查构建日志
bun run build:internal 2>&1 | tee build.log

# 常见问题：
# 1. 类型错误 -> 运行 bun run type-check
# 2. 内存不足 -> 增加 Node 内存限制
NODE_OPTIONS=--max-old-space-size=4096 bun run build:internal

# 3. 路径错误 -> 检查 vite.config.ts 中的 resolve.alias
```

### 问题 6: 共享包修改不生效

```bash
# 确认依赖声明正确
cat apps/robot-admin-internal/package.json | grep @robot

# 应该是 "workspace:*"
"@robot/shared": "workspace:*"

# 重新安装依赖
bun install

# 重启开发服务器
```

---

## 开发技巧

### 快速调试技巧

```typescript
// 1. 使用 Vue 的 devtools 调试函数
import { devtools } from 'vue'

devtools.emit('custom-event', { data: 'test' })

// 2. 使用 @vueuse/core 的 useDevtools
import { useDevtools } from '@vueuse/core'

useDevtools({
  log: true,
  state: { count: 0 },
})

// 3. 性能监控
import { onMounted } from 'vue'

onMounted(() => {
  console.time('mounted')
  // ...代码
  console.timeEnd('mounted')
})
```

### 代码片段（VS Code）

创建 `.vscode/vue.code-snippets`：

```json
{
  "Vue Setup Component": {
    "prefix": "vsetup",
    "body": [
      "<template>",
      "  <div class=\"$1\">",
      "    $2",
      "  </div>",
      "</template>",
      "",
      "<script setup lang=\"ts\">",
      "import { ref } from 'vue'",
      "",
      "$0",
      "</script>",
      "",
      "<style scoped>",
      "</style>"
    ]
  }
}
```

### Git Hooks

项目已配置 Husky，会在提交时自动检查：

- `pre-commit`: 运行 lint-staged（格式化代码）
- `commit-msg`: 检查提交信息格式

```bash
# 跳过 hooks（不推荐）
git commit --no-verify
```

---

**最后更新：** 2025-12-08  
**维护者：** ChenY (ycyplus@gmail.com)
