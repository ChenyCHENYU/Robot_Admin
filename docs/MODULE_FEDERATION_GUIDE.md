# Robot Admin 模块联邦使用指南

> **版本**: v1.0.0 | **更新**: 2025-12-31 | **状态**: ✅ 已验证可用

---

## ��� 简介

Robot Admin 通过 **Module Federation（模块联邦）** 技术，将项目中的核心组件暴露给其他应用使用。这意味着：

- ✅ 其他应用可以**直接使用** Robot Admin 的所有全局组件
- ✅ **无需复制代码**，运行时动态加载
- ✅ **共享依赖**，减少重复打包（vue、pinia、naive-ui 等）
- ✅ **统一更新**，主应用组件升级后，子应用自动生效

---

## ��� 已暴露的组件

| 组件名 | 路径 | 验证状态 | 说明 |
|--------|------|----------|------|
| **Table** | `robotAdmin/Table` | ✅ 已验证 | 数据表格组件，支持分页、排序、筛选等 |
| **Form** | `robotAdmin/Form` | ✅ 已验证 | 动态表单组件，支持多种布局和字段类型 |
| **Icon** | `robotAdmin/Icon` | ✅ 已验证 | 图标组件，基于 Iconify |
| **Tree** | `robotAdmin/Tree` | ⏳ 待验证 | 树形组件 |
| **Editor** | `robotAdmin/Editor` | ⏳ 待验证 | 富文本编辑器 |

**远程入口地址:**
- 开发环境: `http://localhost:4173/assets/remoteEntry.js`
- 生产环境: `https://your-domain.com/assets/remoteEntry.js`

---

## ��� 快速开始

### 1. 启动 Robot Admin (主应用)

```bash
cd /d/project/Robot_Admin

# 构建并预览（必须，dev 模式不支持 Module Federation）
bun run build
bun run preview
# 服务运行在 http://localhost:4173
```

### 2. 创建子应用项目

```bash
# 创建新项目
bun create vite my-sub-app --template vue-ts
cd my-sub-app
bun install

# 安装必要依赖
bun add -D @originjs/vite-plugin-federation
bun add vue-i18n pinia vue-router naive-ui
```

### 3. 配置 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'subApp',
      remotes: {
        // 引用 Robot Admin
        robotAdmin: 'http://localhost:4173/assets/remoteEntry.js'
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.0.0' },
        'vue-router': { singleton: true },
        pinia: { singleton: true },
        'vue-i18n': { singleton: true },
        'naive-ui': { singleton: true }
      }
    })
  ]
})
```

### 4. 创建全局 i18n 支持 (重要!)

创建 `src/global-i18n.ts`:

```typescript
// 提供全局 $t 函数，兼容 Robot Admin 的 i18n
function createGlobalTranslation() {
  const $t: any = function(key: string, defaultValue?: string, namespace: string = 'default'): string {
    const namespaceLang = $t[namespace] || {}
    return namespaceLang[key] || defaultValue || key
  }

  $t.locale = function(locale: Record<string, string>, namespace: string = 'default') {
    $t[namespace] = locale || {}
  }

  return $t
}

if (typeof globalThis !== 'undefined' && !(globalThis as any).$t) {
  (globalThis as any).$t = createGlobalTranslation()
  ;(globalThis as any).$t.locale({}, 'robot_admin')
}

export {}
```

### 5. 创建 DynamicComponent (如果使用 Form 组件)

创建 `src/DynamicComponent.ts`:

```typescript
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'DynamicComponent',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props, { attrs }) {
    return () => {
      const formItems = (attrs as any).formItems || (attrs as any)['form-items'] || []
      if (!formItems.length) {
        return null
      }
      return h('div', { 
        class: 'c-form-default', 
        style: 'width: 100%;'
      }, formItems)
    }
  }
})
```

### 6. 配置 main.ts

```typescript
import './global-i18n' // 必须最先导入

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import DynamicComponent from './DynamicComponent'

const app = createApp(App)
const pinia = createPinia()
const i18n = createI18n({ locale: 'zh-CN', legacy: false, messages: {} })

// 注册 DynamicComponent（Form 组件需要）
app.component('DynamicComponent', DynamicComponent)

app.use(pinia)
app.use(i18n)
app.mount('#app')
```

### 7. 使用远程组件

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NMessageProvider, NDialogProvider, NConfigProvider } from 'naive-ui'

const RemoteTable = ref(null)
const RemoteForm = ref(null)
const RemoteIcon = ref(null)

onMounted(async () => {
  // 动态加载远程组件
  const iconModule = await import('robotAdmin/Icon')
  RemoteIcon.value = iconModule.default || iconModule
  
  const tableModule = await import('robotAdmin/Table')
  RemoteTable.value = tableModule.default || tableModule
  
  const formModule = await import('robotAdmin/Form')
  RemoteForm.value = formModule.default || formModule
})

// 表格数据
const tableData = ref([
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 }
])

const columns = [
  { title: 'ID', key: 'id' },
  { title: '姓名', key: 'name' },
  { title: '年龄', key: 'age' }
]

// 表单配置
const formOptions = ref([
  { type: 'input', prop: 'username', label: '用户名', value: '' },
  { type: 'input', prop: 'email', label: '邮箱', value: '' },
  { type: 'select', prop: 'role', label: '角色', value: 'user', 
    children: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' }
    ]
  }
])
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <div>
          <!-- 图标组件 -->
          <component :is="RemoteIcon" icon="mdi:check-circle" size="48" color="#28a745" />
          
          <!-- 表格组件 -->
          <component :is="RemoteTable" :data="tableData" :columns="columns" />
          
          <!-- 表单组件 -->
          <component :is="RemoteForm" :options="formOptions" @submit="handleSubmit" />
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
```

---

## ��� 子应用最小化配置

### 可以删除/不需要的内容

创建新子应用时，以下内容**可以直接复用主应用的，无需自己实现**：

#### 1. 组件库代码 (全部删除)
```
❌ 不需要：
src/components/global/C_Table/
src/components/global/C_Form/
src/components/global/C_Tree/
src/components/global/C_Icon/
src/components/global/C_Editor/
... 所有全局组件都不需要
```

#### 2. 组件依赖 (无需安装)
```bash
❌ 不需要安装：
@antv/g6
@antv/x6
echarts
@wangeditor/editor
... 等组件内部依赖
```

#### 3. 复杂的配置文件
```
❌ 不需要：
src/config/theme.ts (主题配置)
src/utils/v_verify.ts (表单验证工具)
src/directives/ (自定义指令)
... 组件相关的工具函数
```

### 必须保留的内容

#### 1. 全局 i18n 支持 ✅ 必需
```typescript
// src/global-i18n.ts
// 提供 globalThis.$t 函数
```

#### 2. DynamicComponent ✅ 使用 Form 时必需
```typescript
// src/DynamicComponent.ts
// Form 组件内部渲染依赖
```

#### 3. Naive UI Providers ✅ 必需
```vue
<n-config-provider>
  <n-message-provider>
    <n-dialog-provider>
      <!-- 应用内容 -->
    </n-dialog-provider>
  </n-message-provider>
</n-config-provider>
```

#### 4. 共享依赖 ✅ 需要安装
```json
{
  "dependencies": {
    "vue": "^3.0.0",
    "pinia": "^2.0.0",
    "vue-router": "^4.0.0",
    "vue-i18n": "^9.0.0",
    "naive-ui": "^2.0.0"
  }
}
```

---

## ⚠️ 常见问题

### Q1: 表单字段不显示
**原因**: 缺少 `DynamicComponent` 或 `global-i18n.ts`

**解决**:
1. 创建 `src/global-i18n.ts` 并在 `main.ts` 第一行导入
2. 创建 `src/DynamicComponent.ts` 并注册到全局
3. 确保包裹了 Naive UI 的 Provider 组件

### Q2: 组件加载失败
**原因**: Robot Admin 主应用未启动或端口错误

**解决**:
```bash
# 检查主应用是否运行
curl http://localhost:4173/assets/remoteEntry.js

# 如果返回 404，重新构建主应用
cd /d/project/Robot_Admin
bun run build && bun run preview
```

### Q3: 样式丢失
**原因**: Naive UI 主题未配置

**解决**: 确保使用了 `NConfigProvider` 包裹应用

### Q4: $t is not defined 错误
**原因**: 未导入 `global-i18n.ts`

**解决**: 在 `main.ts` 第一行添加：
```typescript
import './global-i18n'
```

---

## ��� 验证清单

### Robot Admin (主应用)
- [x] vite.config.ts 配置 Module Federation
- [x] 暴露 5 个核心组件
- [x] bun run build 成功
- [x] remoteEntry.js 生成 (http://localhost:4173/assets/remoteEntry.js)
- [x] bun run preview 服务运行

### 子应用
- [x] 安装 @originjs/vite-plugin-federation
- [x] 配置 remotes 指向主应用
- [x] 创建 global-i18n.ts
- [x] 创建 DynamicComponent.ts (如使用 Form)
- [x] main.ts 配置 Provider 和注册组件
- [x] 成功加载 Icon 组件 ✅
- [x] 成功加载 Table 组件 ✅
- [x] 成功加载 Form 组件 ✅
- [ ] 成功加载 Tree 组件 ⏳
- [ ] 成功加载 Editor 组件 ⏳

---

## ��� 最佳实践

### 1. 组件按需加载
```typescript
// ❌ 不推荐：一次性加载所有
import Table from 'robotAdmin/Table'
import Form from 'robotAdmin/Form'

// ✅ 推荐：按需动态加载
const loadComponent = async (name: string) => {
  const module = await import(`robotAdmin/${name}`)
  return module.default || module
}
```

### 2. 错误处理
```typescript
try {
  const tableModule = await import('robotAdmin/Table')
  RemoteTable.value = tableModule.default
} catch (error) {
  console.error('加载 Table 组件失败:', error)
  // 显示降级 UI
}
```

### 3. 开发模式
```bash
# 主应用：必须使用 build + preview
cd /d/project/Robot_Admin
bun run build && bun run preview

# 子应用：可以使用 dev 模式
cd my-sub-app
bun run dev
```

---

## ��� 参考资源

- **测试项目**: `D:/project/test-mf-consumer`
- **主应用配置**: `D:/project/Robot_Admin/vite.config.ts`
- **Module Federation 文档**: https://github.com/originjs/vite-plugin-federation

---

**✨ 现在你可以开始创建自己的子应用了！**
