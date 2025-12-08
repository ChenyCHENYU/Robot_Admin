# Robot Admin Monorepo 完整指南

> 企业级多应用管理平台 - 架构、开发、部署完全手册

---

## 📚 目录

### 第一部分：架构与配置

- [项目概述](#项目概述)
- [架构设计](#架构设计)
- [目录结构](#目录结构)
- [依赖管理](#依赖管理)
- [配置说明](#配置说明)

### 第二部分：开发指南

- [环境准备](#环境准备)
- [日常开发](#日常开发)
- [创建页面与组件](#创建页面与组件)
- [使用 Composables](#使用-composables)
- [状态管理与 API](#状态管理与-api)
- [调试技巧](#调试技巧)
- [代码规范](#代码规范)

### 第三部分：构建与部署

- [构建命令](#构建命令)
- [部署方式](#部署方式)
- [环境变量管理](#环境变量管理)

### 第四部分：扩展与维护

- [扩展新应用](#扩展新应用)
- [最佳实践](#最佳实践)
- [常用命令](#常用命令)
- [问题排查](#问题排查)

---

# 第一部分：架构与配置

## 项目概述

Robot Admin Monorepo 是一个基于 Bun Workspaces 的企业级多应用管理平台，采用 Monorepo 架构统一管理多个前端应用和共享包。

### 核心特性

- 🎯 **多应用管理**：支持 Internal 版和 SaaS 版两个独立应用
- 📦 **代码共享**：5 个共享包统一管理公共代码
- 🚀 **独立部署**：每个应用可独立构建和部署
- 🔧 **统一工具链**：ESLint、Prettier、TypeScript、Commitizen 全局配置
- ⚡️ **高效开发**：Bun + Vite 提供极速开发体验
- 🔄 **HMR 热更新**：修改共享包代码，应用自动刷新

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
│  │  (端口 1988)  │    │  (端口 1989)  │   │
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

### 根目录结构

```
Robot_Admin/
├── apps/                       # 应用目录
│   ├── robot-admin-internal/
│   └── robot-admin-saas/
├── packages/                   # 共享包目录
│   ├── shared/
│   ├── core/
│   ├── ui/
│   ├── business/
│   └── integrations/
├── docs/                       # 文档目录
│   └── GUIDE.md               # 完整指南
├── scripts/                    # 通用工具脚本
│   └── phase3-create-app.sh   # 创建新应用脚本
├── .cz-config.cjs             # Commitizen 配置
├── .prettierrc.json           # Prettier 配置（全局）
├── .gitattributes             # Git 属性配置
├── .gitignore                 # Git 忽略配置
├── commitlint.config.js       # Commitlint 配置
├── eslint.config.ts           # ESLint 配置（全局）
├── tsconfig.json              # TypeScript 基础配置
├── package.json               # Monorepo 根配置
└── bun.lock                   # 依赖锁文件
```

### 应用目录结构

```
apps/robot-admin-internal/
├── src/
│   ├── api/                   # API 接口
│   ├── assets/                # 静态资源
│   ├── components/            # 本地组件
│   ├── composables/           # 组合式函数
│   ├── config/                # 配置文件
│   ├── router/                # 路由配置
│   ├── stores/                # 状态管理
│   ├── styles/                # 样式文件
│   ├── utils/                 # 工具函数
│   ├── views/                 # 页面视图
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── public/                    # 公共资源
├── scripts/                   # 应用特定脚本
│   ├── download-openapi.js
│   ├── generate-route-translations.ts
│   ├── merge-and-deploy.sh
│   └── sync-dev.sh
├── lang/                      # 国际化文件
│   ├── index.js
│   └── index.json
├── envs/                      # 环境配置模板
│   ├── .env.development
│   ├── .env.production
│   ├── .env.test
│   └── .env.staging
├── .env                       # 当前环境（由 env-manager 生成）
├── dist/                      # 构建产物（gitignore）
├── package.json               # 应用依赖
├── vite.config.ts             # Vite 配置
├── unocss.config.ts           # UnoCSS 配置
├── tsconfig.json              # TS 配置（继承根）
└── openapi-ts.config.ts       # OpenAPI 配置
```

### 共享包目录结构

```
packages/ui/
├── src/
│   ├── components/            # 组件源码
│   │   ├── Button/
│   │   ├── Table/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── composables/           # 组合式函数
│   │   ├── useTable.ts
│   │   └── index.ts
│   ├── types/                 # 类型定义
│   │   └── index.ts
│   └── index.ts               # 导出入口
├── package.json
└── tsconfig.json
```

---

## 依赖管理

### Workspace 依赖

在应用的 `package.json` 中使用 `workspace:*` 声明依赖：

```json
{
  "dependencies": {
    "@robot/shared": "workspace:*",
    "@robot/core": "workspace:*",
    "@robot/ui": "workspace:*",
    "@robot/business": "workspace:*",
    "@robot/integrations": "workspace:*"
  }
}
```

**工作原理：**

- **开发时**：Bun 自动链接到本地包目录，修改共享包代码自动 HMR
- **构建时**：Vite 自动打包共享代码到 bundle
- **部署时**：无需额外配置，dist 产物完全独立

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

# 安装开发依赖
bun --filter @robot/admin-internal add -d @types/lodash-es
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

## 配置说明

### 共享配置（根目录）

这些配置文件在根目录，所有应用和包共享：

| 配置文件               | 作用                | 说明                      |
| ---------------------- | ------------------- | ------------------------- |
| `tsconfig.json`        | TypeScript 基础配置 | 子应用通过 `extends` 继承 |
| `eslint.config.ts`     | ESLint 规则         | 全局代码检查规则          |
| `.prettierrc.json`     | Prettier 格式化     | 全局代码格式化规则        |
| `commitlint.config.js` | Commit 规范         | Git 提交信息检查          |
| `.cz-config.cjs`       | Commitizen 配置     | 交互式提交工具            |

### 应用特定配置

这些配置文件在各应用目录，每个应用独立管理：

| 配置文件           | 作用           | 说明                |
| ------------------ | -------------- | ------------------- |
| `vite.config.ts`   | Vite 构建配置  | 端口、插件等        |
| `unocss.config.ts` | UnoCSS 配置    | 原子化 CSS 规则     |
| `tsconfig.json`    | TS 扩展配置    | 路径映射（@/\*）等  |
| `.env*`            | 环境变量       | 由 env-manager 管理 |
| `package.json`     | 应用依赖和脚本 | 独立的依赖列表      |

### 环境变量配置

每个应用有独立的环境变量管理：

```
apps/robot-admin-internal/
├── .env                      # 当前激活的环境（自动生成）
└── envs/                     # 环境模板
    ├── .env.development      # 开发环境
    ├── .env.production       # 生产环境
    ├── .env.test             # 测试环境
    └── .env.staging          # 预发环境
```

**切换环境：**

```bash
# 使用 env-manager 工具切换
bun run dev              # 自动使用开发环境
bun run build            # 自动使用生产环境
bun run build:test       # 使用测试环境
```

---

# 第二部分：开发指南

## 环境准备

### 必需环境

```bash
# 1. 安装 Bun (>= 1.3.4)
curl -fsSL https://bun.sh/install | bash

# Windows 使用 PowerShell:
# powershell -c "irm bun.sh/install.ps1 | iex"

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

**IDE**: VS Code

**必装插件**:

- Vue - Official (Volar)
- ESLint
- Prettier - Code formatter
- UnoCSS

**推荐插件**:

- Error Lens
- GitLens
- Import Cost
- Better Comments

**浏览器扩展**:

- Vue DevTools (Chrome/Edge)

---

## 日常开发

### 启动项目

```bash
# 启动 Internal 版本（端口 1988）
bun run dev:internal

# 启动 SaaS 版本（端口 1989）
bun run dev:saas

# 同时启动两个版本（后台运行）
bun run dev:internal & bun run dev:saas
```

访问地址：

- Internal: http://localhost:1988
- SaaS: http://localhost:1989

---

## 创建页面与组件

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
  <div class="product-page p-4">
    <PageHeader title="产品管理" />
    <ProductTable :data="productList" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ProductTable } from '@robot/business'
  import { PageHeader } from '@robot/ui'
  import type { Product } from '@robot/shared'

  const productList = ref<Product[]>([])

  // 页面逻辑
</script>
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
      icon: 'i-ri-product-hunt-line',
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

### 创建组件

#### 在应用内创建（本地组件）

适用于**仅当前应用使用**的组件：

```bash
mkdir -p apps/robot-admin-internal/src/components/ProductCard
```

```vue
<!-- apps/robot-admin-internal/src/components/ProductCard/index.vue -->
<template>
  <n-card class="product-card">
    <h3>{{ product.name }}</h3>
    <p class="text-gray-600">¥{{ product.price }}</p>
  </n-card>
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

适用于**多个应用共用**的组件：

```bash
# 1. 创建组件
mkdir -p packages/ui/src/components/ProductCard
```

```vue
<!-- packages/ui/src/components/ProductCard/index.vue -->
<template>
  <n-card
    class="product-card"
    hoverable
  >
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold">{{ product.name }}</h3>
        <n-tag :type="statusType">{{ product.status }}</n-tag>
      </div>
    </template>
    <p class="text-2xl font-bold text-blue-600">¥{{ product.price }}</p>
    <p class="text-gray-600 mt-2">{{ product.description }}</p>
    <div class="mt-4">
      <n-button
        type="primary"
        @click="handleBuy"
        >购买</n-button
      >
    </div>
  </n-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Product } from '@robot/shared'

  const props = defineProps<{
    product: Product
  }>()

  const emit = defineEmits<{
    buy: [product: Product]
  }>()

  const statusType = computed(() => {
    return props.product.status === 'active' ? 'success' : 'warning'
  })

  function handleBuy() {
    emit('buy', props.product)
  }
</script>
```

**2. 导出组件：**

```typescript
// packages/ui/src/components/index.ts
export { default as ProductCard } from './ProductCard'

// packages/ui/src/index.ts
export * from './components'
```

**3. 在应用中使用：**

```vue
<template>
  <ProductCard
    :product="product"
    @buy="handleBuy"
  />
</template>

<script setup lang="ts">
  import { ProductCard } from '@robot/ui'
  import type { Product } from '@robot/shared'

  const product: Product = {
    id: '1',
    name: 'iPhone 15',
    price: 5999,
    status: 'active',
    description: '最新款 iPhone',
  }

  function handleBuy(product: Product) {
    console.log('购买', product)
  }
</script>
```

---

## 使用 Composables

### 创建 Composable

```typescript
// packages/ui/src/composables/useTable.ts
import { ref, computed } from 'vue'

export function useTable<T>(initialData: T[] = []) {
  const data = ref<T[]>(initialData)
  const currentPage = ref(1)
  const pageSize = ref(10)

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return data.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(data.value.length / pageSize.value)
  })

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function setData(newData: T[]) {
    data.value = newData
    currentPage.value = 1
  }

  return {
    data,
    currentPage,
    pageSize,
    paginatedData,
    totalPages,
    goToPage,
    setData,
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
  import type { Product } from '@robot/shared'

  const products = ref<Product[]>([...])
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToPage
  } = useTable(products.value)
</script>

<template>
  <div>
    <ProductCard
      v-for="product in paginatedData"
      :key="product.id"
      :product="product"
    />
    <n-pagination
      :page="currentPage"
      :page-count="totalPages"
      @update:page="goToPage"
    />
  </div>
</template>
```

---

## 状态管理与 API

### 状态管理

```typescript
// apps/robot-admin-internal/src/stores/user/index.ts
import { defineStore } from 'pinia'
import type { User } from '@robot/shared'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isLogin = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const res = await userApi.login({ username, password })
    user.value = res.user
    token.value = res.token
    localStorage.setItem('token', res.token)
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  function initUser() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 获取用户信息
      fetchUserInfo()
    }
  }

  async function fetchUserInfo() {
    try {
      const res = await userApi.getUserInfo()
      user.value = res
    } catch (error) {
      logout()
    }
  }

  return {
    user,
    token,
    isLogin,
    login,
    logout,
    initUser,
  }
})
```

### API 接口

```typescript
// apps/robot-admin-internal/src/api/product.ts
import { request } from '@/axios/request'
import type { Product, ApiResponse } from '@robot/shared'

export const productApi = {
  // 获取产品列表
  getList(params: { page: number; size: number }) {
    return request.get<ApiResponse<Product[]>>('/api/products', { params })
  },

  // 获取产品详情
  getDetail(id: string) {
    return request.get<ApiResponse<Product>>(`/api/products/${id}`)
  },

  // 创建产品
  create(data: Partial<Product>) {
    return request.post<ApiResponse<Product>>('/api/products', data)
  },

  // 更新产品
  update(id: string, data: Partial<Product>) {
    return request.put<ApiResponse<Product>>(`/api/products/${id}`, data)
  },

  // 删除产品
  delete(id: string) {
    return request.delete<ApiResponse<void>>(`/api/products/${id}`)
  },
}
```

---

## 调试技巧

### 浏览器调试

```typescript
// 1. 使用 console
console.log('用户数据:', user)
console.table(products) // 表格形式显示数组
console.time('API 请求')
await fetchData()
console.timeEnd('API 请求') // 输出耗时

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

安装 Vue DevTools 浏览器扩展后：

1. **Components 面板**：查看组件树、props、data
2. **Timeline 面板**：追踪性能和事件
3. **Pinia 面板**：查看状态管理
4. **Router 面板**：查看路由状态
5. **Performance 面板**：性能分析

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
    console.log(
      '🚀 请求:',
      config.method?.toUpperCase(),
      config.url,
      config.params
    )
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const request = instance
```

### 性能分析

```bash
# 构建分析
ANALYZE=true bun run build:internal

# 会自动打开浏览器显示 bundle 分析报告
# 查看哪些包占用空间最大
```

### 热更新调试

修改共享包代码时，应用会自动热更新：

```bash
# 1. 启动应用
bun run dev:internal

# 2. 修改共享包代码
vim packages/ui/src/components/Button/index.vue

# 3. 保存后，浏览器自动刷新
# 无需重启开发服务器！
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

// ✅ 推荐：使用联合类型
type ButtonType = 'primary' | 'secondary' | 'danger'
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

<template>
  <div class="flex items-center gap-2">
    <button @click="increment">{{ count }}</button>
    <span>双倍: {{ doubleCount }}</span>
  </div>
</template>

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
<!-- ✅ 推荐：使用 UnoCSS 原子类 -->
<template>
  <div class="flex items-center justify-between p-4 bg-white rounded shadow">
    <h1 class="text-xl font-bold">标题</h1>
    <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      按钮
    </button>
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

# 第三部分：构建与部署

## 构建命令

### 开发环境

```bash
# 启动开发服务器
bun run dev                # Internal（默认）
bun run dev:internal       # Internal
bun run dev:saas          # SaaS
```

### 生产环境

```bash
# 构建所有应用
bun run build

# 构建特定应用
bun run build:internal    # Internal 版本
bun run build:saas        # SaaS 版本

# 构建并分析包大小
ANALYZE=true bun run build:internal
```

### 预览构建产物

```bash
# 预览构建后的应用
bun run preview:internal
bun run preview:saas
```

### 其他环境

```bash
# 测试环境
bun --filter @robot/admin-internal run build:test

# 预发环境
bun --filter @robot/admin-internal run build:staging
```

---

## 部署方式

### 构建产物说明

构建后的产物在 `apps/*/dist/` 目录：

```
apps/robot-admin-internal/dist/
├── index.html
├── assets/
│   ├── index-[hash].js        # 主 bundle（包含所有共享包代码）
│   ├── index-[hash].css
│   └── vendor-[hash].js       # 第三方库
├── images/
└── favicon.ico
```

**关键特性：**

- ✅ 所有 `@robot/*` 包的代码已打包进 `dist/`
- ✅ `dist/` 可以直接部署到任何静态服务器
- ✅ 无需在生产环境安装依赖

---

### 1. Docker 部署（推荐生产环境）

#### Dockerfile

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

#### nginx.conf

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

    # API 代理
    location /api/ {
        proxy_pass http://backend-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

#### 部署命令

```bash
# 1. 构建应用
bun run build:internal

# 2. 构建 Docker 镜像
cd apps/robot-admin-internal
docker build -t robot-admin-internal:latest .

# 3. 运行容器
docker run -d -p 80:80 robot-admin-internal:latest

# 4. 使用 docker-compose
# docker-compose.yml
version: '3'
services:
  admin-internal:
    build: ./apps/robot-admin-internal
    ports:
      - "80:80"
    restart: unless-stopped
```

---

### 2. Vercel 部署

#### 配置文件

```json
// apps/robot-admin-internal/vercel.json
{
  "buildCommand": "cd ../.. && bun run build:internal",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 部署命令

```bash
cd apps/robot-admin-internal

# 首次部署
vercel

# 生产环境部署
vercel --prod
```

---

### 3. Nginx 静态部署

```bash
# 1. 构建
bun run build:internal

# 2. 上传到服务器
scp -r apps/robot-admin-internal/dist/* user@server:/var/www/internal/

# 3. 配置 Nginx
sudo vim /etc/nginx/sites-available/internal

# 使用上面的 nginx.conf 配置

# 4. 启用站点
sudo ln -s /etc/nginx/sites-available/internal /etc/nginx/sites-enabled/

# 5. 测试配置
sudo nginx -t

# 6. 重新加载
sudo systemctl reload nginx
```

---

### 4. OSS + CDN 部署

```bash
# 1. 构建
bun run build:internal

# 2. 上传到阿里云 OSS
cd apps/robot-admin-internal/dist

# 安装 ossutil
# https://help.aliyun.com/document_detail/120075.html

# 上传文件
ossutil cp -r . oss://your-bucket/internal/ \
  --meta="Cache-Control:max-age=31536000"

# 3. 配置 CDN
# - 在阿里云 CDN 控制台配置回源到 OSS
# - 设置缓存规则：HTML 不缓存，assets/ 长期缓存
```

---

## 环境变量管理

### 环境文件结构

```
apps/robot-admin-internal/
├── .env                      # 当前环境（自动生成，不提交）
└── envs/                     # 环境模板（提交到 Git）
    ├── .env                  # 基础配置
    ├── .env.development      # 开发环境
    ├── .env.production       # 生产环境
    ├── .env.test             # 测试环境
    └── .env.staging          # 预发环境
```

### 环境变量示例

```env
# apps/robot-admin-internal/envs/.env.development
VITE_APP_ENV = development
VITE_API_BASE = /api
VITE_APP_TITLE = Robot Admin Internal (Dev)
VITE_ENABLE_MOCK = true
VITE_ENABLE_ANALYTICS = false
```

```env
# apps/robot-admin-internal/envs/.env.production
VITE_APP_ENV = production
VITE_API_BASE = https://api.example.com
VITE_APP_TITLE = Robot Admin Internal
VITE_ENABLE_MOCK = false
VITE_ENABLE_ANALYTICS = true
VITE_SENTRY_DSN = https://xxx@sentry.io/xxx
```

### 使用环境变量

```typescript
// 在代码中使用
const apiBase = import.meta.env.VITE_API_BASE
const appTitle = import.meta.env.VITE_APP_TITLE

// 类型安全
// src/types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'production' | 'test' | 'staging'
  readonly VITE_API_BASE: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_ANALYTICS: string
}
```

### 切换环境

项目使用 `env-manager` 工具自动管理环境切换：

```bash
# 开发环境（自动）
bun run dev

# 生产环境（自动）
bun run build

# 测试环境
bun run build:test

# 预发环境
bun run build:staging
```

---

# 第四部分：扩展与维护

## 扩展新应用

### 使用脚本创建

```bash
# 使用创建脚本（推荐）
bash scripts/phase3-create-app.sh mobile

# 脚本会自动：
# 1. 创建目录结构
# 2. 生成 package.json
# 3. 创建基础配置文件
# 4. 更新根 package.json
```

### 手动创建步骤

#### 1. 复制现有应用

```bash
# 复制 Internal 作为模板
cp -r apps/robot-admin-internal apps/robot-admin-mobile
cd apps/robot-admin-mobile
```

#### 2. 修改 package.json

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
    "@robot/ui": "workspace:*"
    // ... 其他依赖
  }
}
```

#### 3. 修改 vite.config.ts

```typescript
// apps/robot-admin-mobile/vite.config.ts
const MOBILE_PORT = 1990

export default defineConfig(({ mode }) => {
  // ...
  return {
    server: {
      ...serverConfig,
      port: MOBILE_PORT, // 修改端口
    },
    // ...
  }
})
```

#### 4. 更新根 package.json

```json
{
  "scripts": {
    "dev:mobile": "bun --filter @robot/admin-mobile dev",
    "build:mobile": "bun --filter @robot/admin-mobile build"
  }
}
```

#### 5. 安装依赖并启动

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
│   │   ├── UserCard.vue
│   │   └── UserTable.vue
│   ├── composables/
│   │   └── useUser.ts
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
│   ├── UserCard.vue
│   ├── OrderList.vue
│   └── ProductTable.vue
├── composables/             # 所有 hooks 混在一起
└── utils/
```

### 2. 共享包职责划分

| 包名                  | 职责                   | 示例                                    |
| --------------------- | ---------------------- | --------------------------------------- |
| `@robot/shared`       | 纯工具函数，无业务逻辑 | `formatDate()`, `deepClone()`, 类型定义 |
| `@robot/core`         | 核心业务逻辑           | 权限管理、路由守卫、全局状态            |
| `@robot/ui`           | 纯 UI 组件             | Button, Table, Modal, Form              |
| `@robot/business`     | 业务组件               | UserCard, OrderList, ProductDetail      |
| `@robot/integrations` | 第三方集成             | 地图、支付、统计、IM                    |

### 3. 导出规范

**每个包必须有清晰的导出入口：**

```typescript
// packages/ui/src/index.ts
// 组件
export { default as Button } from './components/Button'
export { default as Table } from './components/Table'
export { default as Modal } from './components/Modal'

// Composables
export * from './composables'

// 类型
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
  role: 'admin' | 'user'
}

export interface UserLoginDto {
  username: string
  password: string
}

// 导出
// packages/shared/src/index.ts
export type * from './types/user'
```

**应用中使用：**

```typescript
import type { User, UserLoginDto } from '@robot/shared'

const user: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  role: 'admin',
}
```

### 5. Git 提交规范

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

# 性能优化
git commit -m "perf(admin-saas): 优化首屏加载速度"

# 重构
git commit -m "refactor(core): 重构权限管理模块"
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

**使用 Commitizen 交互式提交：**

```bash
# 在根目录执行
git add .
git cz

# 按提示选择：
# 1. 提交类型（feat/fix/docs...）
# 2. 影响范围（admin-internal/ui...）
# 3. 简短描述
# 4. 详细描述（可选）
```

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
const HeavyComponent = defineAsyncComponent(() =>
  import('@robot/business').then(m => m.HeavyComponent)
)
```

#### 按需导入

```typescript
// ✅ 推荐：按需导入
import { formatDate, debounce } from '@robot/shared'

// ❌ 不推荐：全量导入
import * as shared from '@robot/shared'
const { formatDate, debounce } = shared
```

#### 图片优化

```vue
<template>
  <!-- 使用 WebP 格式 -->
  <picture>
    <source
      srcset="/images/hero.webp"
      type="image/webp"
    />
    <img
      src="/images/hero.jpg"
      alt="Hero"
    />
  </picture>

  <!-- 懒加载 -->
  <img
    v-lazy="product.image"
    alt="Product"
  />
</template>
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

# E2E 测试（应用）
apps/robot-admin-internal/
└── e2e/
    └── user.spec.ts
```

### 8. 文档维护

**每个共享包都应有 README：**

```markdown
# @robot/ui

UI 组件库

## 安装

\`\`\`bash

# 已通过 workspace 自动链接

\`\`\`

## 使用

\`\`\`vue

<script setup>
import { Button, Table } from '@robot/ui'
</script>

<template>
  <Button type="primary">点击</Button>
</template>
\`\`\`

## 组件列表

- Button - 按钮
- Table - 表格
- Modal - 弹窗
  ...
```

---

## 常用命令

### 开发命令

```bash
# 启动开发服务器
bun run dev                # Internal（默认）
bun run dev:internal       # Internal
bun run dev:saas          # SaaS

# 类型检查
bun run type-check        # 所有应用

# 代码检查
bun run lint              # ESLint 检查
bun run lint:fix          # 自动修复

# 代码格式化
bun --filter @robot/admin-internal run format
```

### 构建命令

```bash
# 构建
bun run build             # 所有应用
bun run build:internal    # Internal
bun run build:saas        # SaaS

# 预览
bun run preview:internal
bun run preview:saas
```

### 依赖管理

```bash
# 安装
bun install

# 添加依赖
bun --filter @robot/admin-internal add lodash-es
bun --filter @robot/ui add @vueuse/core

# 升级
bun update vue vite
bun outdated
```

### Git 命令

```bash
# 提交（使用 Commitizen）
git add .
git cz

# 推送
git push origin feature/xxx
```

### 清理命令

```bash
# 清理构建产物
bun run clean

# 清理 node_modules
bun run clean:modules

# 重新安装
bun run fresh
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
  port: 1999
}
```

### 问题 2: 依赖安装失败

```bash
# 清理缓存
rm -rf node_modules
rm bun.lock

# 重新安装
bun install

# 如果还是失败
bun install --force
```

### 问题 3: 类型错误

```bash
# 重新生成类型
bun run type-check

# 重启 IDE 的 TypeScript 服务
# VS Code: Cmd/Ctrl + Shift + P -> TypeScript: Restart TS Server
```

### 问题 4: HMR 不工作

```bash
# 检查 vite.config.ts
server: {
  hmr: true,
  watch: {
    usePolling: true  # WSL 或 Docker 中需要
  }
}

# 重启开发服务器
Ctrl + C
bun run dev:internal
```

### 问题 5: 构建失败

```bash
# 查看详细日志
bun run build:internal 2>&1 | tee build.log

# 常见问题：
# 1. 类型错误 -> 运行 bun run type-check
# 2. 内存不足 -> 增加内存
NODE_OPTIONS=--max-old-space-size=4096 bun run build:internal
```

### 问题 6: 共享包修改不生效

```bash
# 确认依赖声明
cat apps/robot-admin-internal/package.json | grep @robot

# 应该是 workspace:*
"@robot/shared": "workspace:*"

# 重新安装
bun install

# 重启开发服务器
```

### 问题 7: Git 提交失败

```bash
# Commitlint 错误
# 确保提交信息符合规范：
# <type>(<scope>): <subject>

# ESLint 错误
bun run lint:fix

# Prettier 错误
bun --filter @robot/admin-internal run format
```

---

## 总结

Robot Admin Monorepo 通过合理的架构设计和最佳实践，实现了：

- ✅ **代码复用** - 5 个共享包统一管理，避免重复
- ✅ **独立部署** - 每个应用独立构建和部署
- ✅ **类型安全** - TypeScript 全局类型检查
- ✅ **开发效率** - 统一工具链，HMR 热更新
- ✅ **易于扩展** - 新增应用只需几分钟
- ✅ **规范统一** - ESLint、Prettier、Commitizen 保证代码质量

遵循本指南的规范，可以确保项目长期保持健康和可维护性。

---

**文档版本：** 2.0.0  
**最后更新：** 2025-01-08  
**维护者：** ChenY  
**GitHub：** https://github.com/ChenyCHENYU/Robot_Admin
