<!-- AI 必读：在本项目中，你的所有推理过程、代码注释和回答都必须使用中文进行交互。 -->

# 🤖 Robot Admin — AI 编码指南

> **本文件面向 AI 编程助手**（Copilot / Cursor / Claude 等）。
> 在对本项目生态进行任何代码生成、修改或建议之前，**必须完整阅读本指南**。
> 最后更新：2026-03-06

## 目录

一、项目全景 · 二、技术栈与工具链 · 三、包管理器与运行命令 · 四、项目结构与目录约定 · 五、编码规范 · 六、Vue SFC 编写规范 · 七、组件库编写规范 · 八、演示页面编写规范 · 九、Store 编写规范 · 十、API 与请求规范 · 十一、路由与权限 · 十二、样式与主题规范 · 十三、TypeScript 规范 · 十四、Git 提交规范 · 十五、ESLint 规则摘要 · 十六、构建与部署 · 十七、生态包速查表 · 十八、常见坑与注意事项 · 十九、新功能开发 Checklist

---

## 一、项目全景

Robot Admin 是一个**企业级后台管理系统**生态，由 4 个关联仓库组成：

| 仓库                     | 简称   | 用途                                     | npm 包名                           |
| ------------------------ | ------ | ---------------------------------------- | ---------------------------------- |
| **Robot_Admin**          | 主项目 | Vue 3 SPA 后台应用                       | —                                  |
| **naive-ui-components**  | 组件库 | 51 个业务组件（基于 Naive UI）           | `@robot-admin/naive-ui-components` |
| **robot-admin-packages** | 包集合 | 7 个独立 npm 包（指令/请求/布局/主题等） | `@robot-admin/*`                   |
| **AgileTeam_Doc**        | 文档库 | VitePress 2.0 团队文档站                 | —                                  |

### 核心信息

- **作者**: ChenYu (`ycyplus@gmail.com`)
- **许可证**: MIT
- **演示站**: https://robotadmin.cn
- **Node 版本要求**: `>=22.x`
- **包管理器**: **Bun** `>=1.x`（**不使用 npm / yarn / pnpm**）

---

## 二、技术栈与工具链

### 核心框架

| 技术       | 版本    | 用途                                            |
| ---------- | ------- | ----------------------------------------------- |
| Vue        | 3.5.13  | 渐进式框架                                      |
| TypeScript | ~5.8.0  | 类型安全                                        |
| Vite       | 7.x     | 构建工具                                        |
| Naive UI   | 2.41.0+ | UI 组件库                                       |
| Pinia      | 3.0.1   | 状态管理                                        |
| Vue Router | 4.5.0   | 路由系统                                        |
| UnoCSS     | 66+     | 原子化 CSS（presetWind3 + attributify + icons） |
| Sass       | 1.87+   | 样式预处理                                      |

### 自有包生态（@robot-admin/\*）

| 包名                               | 版本   | 功能                           |
| ---------------------------------- | ------ | ------------------------------ |
| `@robot-admin/naive-ui-components` | 0.6.10 | 51 个业务组件                  |
| `@robot-admin/layout`              | 2.2.0  | 6 种布局模式 + 设置管理        |
| `@robot-admin/request-core`        | 0.1.3  | Axios + 7 插件 + useTableCrud  |
| `@robot-admin/theme`               | 0.1.1  | 主题切换（Light/Dark/System）  |
| `@robot-admin/directives`          | 1.1.0  | 11 个 Vue 指令                 |
| `@robot-admin/form-validate`       | 2.0.0  | 48+ 验证规则                   |
| `@robot-admin/file-utils`          | 1.0.0  | 文件处理（Excel/ZIP/分片上传） |
| `@robot-admin/git-standards`       | 1.0.3  | Git 工程化标准                 |

### 开发工具链

| 工具                    | 用途                                                   |
| ----------------------- | ------------------------------------------------------ |
| ESLint 10 + Oxlint      | 双重 Lint（Oxlint 用 Rust 编写，极速）                 |
| Prettier 3.8            | 代码格式化                                             |
| Commitizen + Commitlint | Git 提交规范                                           |
| Husky 9 + lint-staged   | Pre-commit 钩子                                        |
| unplugin-auto-import    | Vue/Router/Pinia/VueUse 自动导入                       |
| unplugin-vue-components | 组件自动导入（NaiveUiResolver + RobotNaiveUiResolver） |

---

## 三、包管理器与运行命令

### ⚠️ 强制使用 Bun

```bash
# ✅ 正确
bun install
bun run dev
bun run build
bun run lint

# ❌ 错误 — 不要使用
npm install
yarn install
pnpm install
```

### 主要脚本

| 命令                     | 用途         | 说明                        |
| ------------------------ | ------------ | --------------------------- |
| `bun run dev`            | 标准开发     | 默认端口 1988               |
| `bun run dev:local`      | 本地包调试   | `USE_LOCAL_PACKAGES=true`   |
| `bun run dev:components` | 组件库联调   | `USE_LOCAL_COMPONENTS=true` |
| `bun run dev:devtools`   | Vue DevTools | `VITE_DEVTOOLS=true`        |
| `bun run build`          | 生产构建     | env-manager prod 模式       |
| `bun run build:test`     | 测试构建     | `--mode test`               |
| `bun run build:staging`  | 预发构建     | `--mode staging --profile`  |
| `bun run lint`           | 代码检查     | Oxlint → ESLint 双重检查    |
| `bun run format`         | 代码格式化   | Prettier                    |
| `bun run type-watch`     | 实时 TS 检查 | `vue-tsc --watch`           |
| `bun run analyze`        | 构建分析     | rollup-plugin-visualizer    |
| `bun run cz`             | 规范化提交   | Commitizen 交互式           |

### 组件库脚本（naive-ui-components）

```bash
bun run dev          # watch 模式开发
bun run build        # tsdown + scss + merge-css + gen-exports 全流程
bun run lint         # oxlint + eslint
bun run check:exports # 检测导出命名冲突
```

### 包集合脚本（robot-admin-packages）

```bash
# 在具体包目录下
bun run build        # 构建单个包
bun run changeset    # 创建变更集
bun run version      # 版本号递增
bun run release      # 发布到 npm
```

---

## 四、项目结构与目录约定

### Robot_Admin 主结构

```
Robot_Admin/
├── src/
│   ├── main.ts                    # 应用入口（启动引导流程）
│   ├── App.vue                    # 根组件（NConfigProvider 包裹）
│   │
│   ├── api/                       # API 接口定义
│   │   ├── auth.ts                # 认证接口
│   │   ├── permission-manage.ts   # 权限 CRUD
│   │   └── generated/             # 自动生成的 TS 类型
│   │
│   ├── assets/                    # 静态资源（images/css/data）
│   │
│   ├── components/                # Vue 组件
│   │   ├── global/                # 全局组件（C_ 大写前缀）
│   │   │   ├── C_Header/          # 顶部导航
│   │   │   ├── C_Layout/          # 布局容器
│   │   │   ├── C_Login/           # 登录组件
│   │   │   ├── C_Settings/        # 设置面板
│   │   │   └── ...
│   │   └── local/                 # 局部业务组件（c_ 小写前缀）
│   │       ├── c_detail/          # 详情组件
│   │       ├── c_role/            # 角色组件
│   │       └── ...
│   │
│   ├── composables/               # 组合式函数（业务逻辑解耦）
│   │   ├── useLoginController.ts  # 登录控制器
│   │   ├── useLayoutBridge.ts     # 布局桥接（适配器模式）
│   │   └── useLayoutCache.ts      # 页面缓存管理
│   │
│   ├── config/                    # 配置汇总
│   │   ├── theme/                 # 主题系统（tokens + overrides）
│   │   ├── vite/                  # Vite 配置拆分
│   │   └── keepAliveConfig.ts     # 页面缓存配置
│   │
│   ├── constant/                  # 常量定义
│   │   └── index.ts               # TOKEN/TIME_STAMP/TIMEOUT
│   │
│   ├── hooks/                     # 通用 Hooks
│   │   ├── useCopy/               # 剪贴板复制
│   │   ├── useFormSubmit/         # 表单提交
│   │   └── usePrintWatermark/     # 打印水印
│   │
│   ├── lib/                       # 第三方库集成
│   │   └── version.ts             # 版本信息输出
│   │
│   ├── plugins/                   # Vue 插件（初始化系统）
│   │   ├── loading.ts             # 首屏加载动画
│   │   ├── store.ts               # Pinia + 持久化
│   │   ├── request-core.ts        # Axios 请求核心
│   │   ├── layout.ts              # 布局系统
│   │   ├── naive-ui-plugin.ts     # 全局通知服务
│   │   ├── highlight.ts           # 代码高亮（异步）
│   │   ├── markdown.ts            # Markdown（异步懒加载）
│   │   ├── analytics.ts           # Vercel 分析（仅生产）
│   │   └── index.ts               # 统一导出
│   │
│   ├── router/                    # 路由系统
│   │   ├── index.ts               # createRouter（hash/history 可配）
│   │   ├── permission.ts          # 前置守卫（登录检查+动态路由）
│   │   ├── dynamicRouter.ts       # 后端 JSON → RouteRecordRaw
│   │   ├── publicRouter.ts        # 静态路由（login/404/preview）
│   │   └── previewRouter.ts       # 免登录预览路由
│   │
│   ├── stores/                    # Pinia 状态管理
│   │   ├── user/                  # 用户认证（token/userInfo/logout）
│   │   ├── permission/            # 权限（菜单列表/按钮权限）
│   │   ├── theme/                 # 主题（dark/light/overrides）
│   │   ├── language/              # 国际化（locale/dateLocale）
│   │   ├── settings/              # 布局设置（layoutMode/sidebar）
│   │   └── reLogin/               # 重新登录弹窗
│   │
│   ├── styles/                    # 全局样式
│   │   ├── index.scss             # 主入口
│   │   ├── theme-variables.scss   # CSS 变量
│   │   └── naive-ui-override.scss # Naive UI 样式定制
│   │
│   ├── types/                     # TypeScript 类型
│   │   ├── env.d.ts               # 环境变量声明
│   │   ├── global.d.ts            # 全局类型
│   │   ├── modules/               # 业务模块类型（23+ d.ts）
│   │   ├── auto-imports.d.ts      # 自动生成
│   │   └── components.d.ts        # 自动生成
│   │
│   ├── utils/                     # 工具函数
│   │   ├── d_auth.ts              # Token 管理 + 超时检查（8小时）
│   │   ├── d_route.ts             # 菜单过滤 + KeepAlive 收集
│   │   ├── errorHandler/          # 全局错误处理
│   │   └── unocss/                # UnoCSS 快捷方式 + 图标 Safelist
│   │
│   └── views/                     # 业务页面
│       ├── home/                  # 首页（eager 加载）
│       ├── dashboard/             # 数据大屏（eager 加载）
│       ├── login/                 # 登录页
│       ├── demo/                  # 54 个功能演示
│       │   ├── 01-icon/
│       │   ├── 07-form/
│       │   ├── 10-table/
│       │   ├── 38-upload/
│       │   └── ...
│       ├── sys-manage/            # 系统管理
│       └── error-page/            # 错误页
│
├── envs/                          # 环境变量文件
├── lang/                          # i18n 语言文件
├── scripts/                       # 构建脚本
├── docs/                          # 项目分析文档
├── eslint.config.ts               # ESLint Flat Config
├── commitlint.config.js           # 提交规范
├── unocss.config.ts               # UnoCSS 配置
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
└── package.json                   # 项目依赖
```

### 命名约定总结

| 类型         | 约定                       | 示例                                    |
| ------------ | -------------------------- | --------------------------------------- |
| 全局组件目录 | `C_` + PascalCase          | `C_Header/`, `C_Settings/`              |
| 局部组件目录 | `c_` + snake_case          | `c_detail/`, `c_role/`                  |
| 组件库组件   | `C_` + PascalCase          | `C_Form`, `C_Table`, `C_Upload`         |
| Composable   | `use` + PascalCase         | `useLoginController`, `useLayoutBridge` |
| Hook         | `use` + PascalCase         | `useCopy`, `useFormSubmit`              |
| Store        | `s_` + camelCase + `Store` | `s_userStore`, `s_themeStore`           |
| 工具函数     | `d_` 前缀（domain 工具）   | `d_auth.ts`, `d_route.ts`               |
| Demo 目录    | `数字编号-功能名`          | `01-icon/`, `07-form/`, `10-table/`     |
| 类型文件     | `.d.ts` 后缀               | `form.d.ts`, `table.d.ts`               |
| 样式文件     | `index.scss`               | 与组件同目录                            |

---

## 五、编码规范

### 通用规则

1. **引号**：TypeScript/JavaScript 使用**单引号**，HTML 模板中使用**双引号**
2. **缩进**：2 空格
3. **分号**：不使用尾部分号（Prettier 配置）
4. **最大深度**：嵌套不超过 4 层（ESLint `max-depth: 4`）
5. **圈复杂度**：函数复杂度警告阈值 10（ESLint `complexity: 10`）
6. **JSDoc**：所有函数声明、方法定义、类声明**必须添加 JSDoc 注释**
7. **文件头注释**：每个文件必须包含作者、日期、描述信息

### 文件头注释模板

```typescript
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-06
 * @FilePath: \Robot_Admin\src\xxx\xxx.ts
 * @Description: 文件描述
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
```

### JSDoc 注释风格

本项目使用特殊的 JSDoc 标记约定：

```typescript
/**
 * * @description: 用于描述功能（星号标记 = 功能说明）
 * ? @param {object} data 参数说明（问号标记 = 参数说明）
 * ! @return {Promise<T>} 返回值说明（叹号标记 = 返回值说明）
 */
```

### 导入顺序

```typescript
// 1. 外部样式
import '@robot-admin/layout/style'
import '@robot-admin/naive-ui-components/style.css'
import 'virtual:uno.css'

// 2. Vue 核心
import { ref, computed, watch, onMounted } from 'vue'

// 3. 路由/状态
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// 4. UI 库
import { NCard, NButton, NSpace } from 'naive-ui'

// 5. 自有包
import { postData, getData } from '@robot-admin/request-core'
import { PRESET_RULES } from '@robot-admin/form-validate'

// 6. 项目内部（使用路径别名）
import { s_userStore } from '@/stores/user'
import type { LoginResponse } from '@/api/auth'

// 7. 相对路径
import { layoutOptions, testDataConfig } from './data'
import DefaultLayout from './layouts/DefaultLayout/index.vue'
```

### 路径别名

```typescript
// tsconfig.json 中配置
'@/*'       → 'src/*'
'_views/*'  → 'src/views/*'
```

---

## 六、Vue SFC 编写规范

### script setup 标准结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
  // ① defineOptions（组件名称）
  defineOptions({ name: 'ComponentName' })

  // ② Props 定义（interface + withDefaults）
  interface Props {
    title: string
    size?: 'small' | 'medium' | 'large'
  }
  const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
  })

  // ③ Emits 定义
  const emit = defineEmits<{
    submit: [payload: SubmitPayload]
    'update:modelValue': [value: string]
  }>()

  // ④ 外部导入的响应式状态（Stores / Composables）
  const userStore = s_userStore()
  const route = useRoute()
  const message = useMessage()

  // ⑤ 响应式状态
  const loading = ref(false)
  const formData = ref<FormModel>({})

  // ⑥ 计算属性
  const isValid = computed(() => formData.value.name !== '')

  // ⑦ 方法
  const handleSubmit = async () => {
    loading.value = true
    try {
      await submitApi(formData.value)
      emit('submit', { data: formData.value })
    } finally {
      loading.value = false
    }
  }

  // ⑧ 生命周期
  onMounted(() => {
    // 初始化逻辑
  })

  // ⑨ Watch
  watch(
    () => props.title,
    newVal => {
      // 响应变化
    }
  )

  // ⑩ defineExpose（暴露给父组件的方法/属性）
  defineExpose({
    validate,
    resetFields,
    formData,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
```

### 关键编写规则

1. **`<script setup lang="ts">`** — 永远使用 setup + TypeScript
2. **`defineOptions({ name: 'XXX' })`** — 所有组件必须声明 name（用于 DevTools 和 KeepAlive）
3. **Props 用 interface + withDefaults** — 不用 `defineProps({ ... })` 对象语法
4. **Emits 用泛型语法** — `defineEmits<{ event: [payload: Type] }>()`
5. **样式使用 `@use` 导入** — `<style lang="scss" scoped>` + `@use './index.scss'`
6. **自动导入生效** — `ref`, `computed`, `watch`, `onMounted`, `useRoute`, `useRouter`, `defineStore` 等无需手动导入
7. **Naive UI 组件自动导入** — `NCard`, `NButton`, `NModal` 等无需手动导入
8. **C\_ 组件自动导入** — `C_Form`, `C_Table`, `C_Icon` 等由 RobotNaiveUiResolver 自动解析

---

## 七、组件库编写规范

### 架构原则：薄 UI 壳 + 厚 Composable 引擎

```
┌────────────────────────────────────┐
│  index.vue (薄 UI 壳, ~100 行)      │  ← 模板 + 事件桥接
├────────────────────────────────────┤
│  composables/                      │  ← 业务逻辑引擎
│    useXxxConfig.ts                 │     配置解析 + 默认值
│    useXxxState.ts                  │     状态管理 + CRUD
│    useXxxRenderer.ts               │     VNode 渲染逻辑
├────────────────────────────────────┤
│  types.ts                          │  ← 完整类型定义
├────────────────────────────────────┤
│  index.ts                          │  ← 导出入口
├────────────────────────────────────┤
│  index.scss                        │  ← 组件样式
└────────────────────────────────────┘
```

### 组件目录结构（三种复杂度）

#### 简单组件

```
C_Code/
├── index.ts       # export { default as C_Code } from './index.vue'
├── index.vue      # 组件（50-100 行）
└── index.scss     # 样式（可选）
```

#### 中等复杂组件

```
C_ActionBar/
├── index.ts       # 导出组件 + 类型
├── index.vue      # 组件
├── types.ts       # 类型定义
└── index.scss     # 样式
```

#### 高度复杂组件

```
C_Form/
├── index.ts              # 导出组件 + 类型 + composables
├── index.vue             # 薄 UI 壳（~100 行）
├── types.ts              # 70+ 接口定义
├── composables/          # 逻辑引擎
│   ├── useFormConfig.ts  # 配置解析
│   ├── useFormState.ts   # 状态管理（300+ 行）
│   └── useFormRenderer.ts # VNode 渲染
└── layouts/              # 布局变体
    ├── Default/
    ├── Grid/
    ├── Card/
    ├── Tabs/
    ├── Steps/
    └── Dynamic/
```

### 组件库入口文件 index.ts 规范

```typescript
// 导出组件
export { default as C_Form } from './index.vue'

// 导出类型
export type { FormOption, FormModel, FormInstance, LayoutType } from './types'

// 导出 Composables（供外部扩展使用）
export { useFormState } from './composables/useFormState'
export {
  useFormRenderer,
  registerRenderer,
} from './composables/useFormRenderer'
export type { ComponentMap, FormRenderer } from './composables/useFormRenderer'
```

### 组件 Props 设计原则

**配置收拢模式** — 将多个分散的 Props 收拢为一个 `config` 对象：

```typescript
// ❌ 不推荐：Props 爆炸
<C_Form
  layout="grid"
  :cols="2"
  label-placement="left"
  :show-actions="true"
  :validate-on-change="false"
  ...13个props
/>

// ✅ 推荐：配置收拢
<C_Form
  :options="fields"
  :config="{
    layout: 'grid',
    grid: { cols: 2 },
    labelPlacement: 'left',
    onFieldChange: handleChange,
  }"
/>
```

### 新建组件的固定流程

```bash
# 1. 在组件库中创建目录
mkdir naive-ui-components/src/components/C_YourComponent

# 2. 创建入口文件
# index.ts
export { default as C_YourComponent } from './index.vue'

# 3. 创建组件文件
# index.vue — 遵循上述 SFC 规范

# 4. 构建（自动注册到 exports）
bun run build

# 5. 主项目中直接使用（自动导入）
<C_YourComponent :options="data" />
```

### CSS 变量三层方案

组件样式使用 CSS 变量，支持主题自适应：

```scss
// 组件 SCSS
.c-breadcrumb {
  // 暴露 CSS 变量，方便主项目覆盖
  --c-breadcrumb-icon-size: 16px;
  --c-breadcrumb-gap: 4px;

  display: flex;
  align-items: center;
}
```

全局 CSS 变量回退到 Naive UI：

```scss
:root {
  --c-primary: var(--primary-color, #2080f0);
  --c-success: var(--success-color, #18a058);
  --c-error: var(--error-color, #d03050);
  --c-bg-body: var(--body-color, #ffffff);
  --c-text-1: var(--text-color-1, #262626);
  --c-border: var(--border-color, #e5e7eb);
  --c-radius: var(--border-radius, 6px);
}
```

---

## 八、演示页面编写规范

### 演示页面（Demo View）标准结构

每个 demo 页面遵循以下目录结构：

```
views/demo/XX-feature-name/
├── index.vue           # 页面主文件
├── index.scss          # 页面样式（scoped）
├── data.ts             # 配置数据、常量、mock 数据
└── layouts/            # 布局变体组件（可选）
    ├── DefaultLayout/
    │   └── index.vue
    └── GridLayout/
        └── index.vue
```

### 演示页面 index.vue 标准模板

```vue
<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: XXX 组件 - 演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="xxx-demo">
    <!-- 1. 页面标题 -->
    <NH1>XXX 组件场景示例</NH1>

    <!-- 2. 控制面板（可选） -->
    <NCard
      class="control-panel"
      :bordered="false"
    >
      <!-- 模式切换、配置选项 -->
    </NCard>

    <!-- 3. 主内容区 -->
    <NCard :bordered="false">
      <C_XxxComponent
        :options="options"
        :config="config"
        @submit="handleSubmit"
      />
    </NCard>

    <!-- 4. 状态展示（可选） -->
    <div class="status-section">
      <!-- 实时数据展示 -->
    </div>
  </div>
</template>

<script setup lang="ts">
  // 从 data.ts 导入配置数据
  import { options, config, mockData } from './data'

  const message = useMessage()

  // 响应式状态
  const formData = ref({})

  // 事件处理
  const handleSubmit = (payload: any) => {
    console.log('提交:', payload)
    message.success('操作成功')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
```

### 数据配置文件 data.ts 模式

将所有配置数据、常量、mock 数据抽离到 `data.ts`：

```typescript
// data.ts
import type { FormOption } from '@robot-admin/naive-ui-components'

// 静态配置常量
export const EDIT_MODES = [
  { value: 'modal', label: '弹窗编辑', icon: 'mdi:window-maximize' },
  { value: 'row', label: '行内编辑', icon: 'mdi:table-edit' },
  { value: 'cell', label: '单元格编辑', icon: 'mdi:pencil' },
  { value: 'none', label: '只读模式', icon: 'mdi:eye' },
] as const

// 表单字段配置
export const formOptions: FormOption[] = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    rules: [{ required: true, message: '请输入' }],
  },
  // ...
]

// Mock 数据工厂
export const testDataConfig = {
  getTestData(layout: string) {
    return {
      /* ... */
    }
  },
}
```

### 页面结构四段式

所有 demo 页面遵循**四段式**布局：

1. **页面标题** — `<NH1>XXX 组件场景示例</NH1>` + 简短描述
2. **控制面板** — 布局切换、模式选择、配置开关
3. **主内容区** — 组件展示区域
4. **状态展示** — 实时数据统计、验证状态、预览面板

---

## 九、Store 编写规范

### Setup Store 语法（推荐）

```typescript
import { defineStore } from 'pinia'

export const s_themeStore = defineStore('theme-extended', () => {
  // ============ 状态 ============
  const isDark = ref(false)
  const mode = ref<ThemeMode>('light')

  // ============ 计算属性 ============
  const currentTheme = computed(() => (isDark.value ? darkTheme : lightTheme))

  // ============ Actions ============
  const init = () => {
    /* ... */
  }
  const setMode = async (newMode: ThemeMode) => {
    /* ... */
  }

  return {
    isDark,
    mode,
    currentTheme,
    init,
    setMode,
  }
})
```

### Options Store 语法（简单场景）

```typescript
export const s_userStore = defineStore('user', {
  state: () => ({
    token: readStorage<string>(TOKEN, ''),
    userInfo: readStorage<UserInfo>('userInfo', {}),
  }),

  getters: {
    hasUserInfo: state => Object.keys(state.userInfo).length > 0,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem(TOKEN, JSON.stringify(token))
    },

    async logout(isExpired = false) {
      // 清理逻辑...
    },
  },
})
```

### Store 规范要求

1. **命名**：`s_` 前缀 + 描述 + `Store` 后缀（`s_userStore`, `s_themeStore`）
2. **文件位置**：`src/stores/<domain>/index.ts`
3. **持久化**：使用 `pinia-plugin-persistedstate`（已全局配置）
4. **区块注释**：使用 `// ============ 状态 ============` 分隔不同关注点
5. **类型安全**：State 中的复杂对象必须定义 interface

---

## 十、API 与请求规范

### API 文件编写

```typescript
// src/api/auth.ts
import { postData, getData } from '@robot-admin/request-core'
import type { PostAuthLoginResponse } from './generated'

/**
 * * @description: 用户登录接口
 * ? @param {object} data 登录数据
 * ! @return {Promise<PostAuthLoginResponse>}
 */
export const loginApi = (data: { username: string; password: string }) =>
  postData<PostAuthLoginResponse>('/auth/login', data)

/**
 * * @description: 获取菜单权限列表
 * ! @return {Promise<MenuListResponse>}
 */
export const getAuthMenuListApi = () =>
  getData<MenuListResponse>('/auth/menu-list')
```

### Request Core 集成

```typescript
// src/plugins/request-core.ts
import { createRequestCore } from '@robot-admin/request-core'

export function setupRequestCore(app: App) {
  const requestCore = createRequestCore({
    request: {
      baseURL: VITE_API_BASE,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    },
    interceptors: {
      request: config => {
        // 注入 token
        const { token } = s_userStore()
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
      },
      response: response => {
        // 业务码判断
        const { code, message: msg } = response.data
        const isSuccess =
          code === 200 || code === 0 || code === '200' || code === '0'
        if (!isSuccess) return Promise.reject(new Error(msg))
        return response
      },
      responseError: async error => {
        // 401 → 重新登录弹窗
        if (error.response?.status === 401) {
          reLoginStore.show(userStore.userInfo?.username || '')
          // ... 等待重新登录
        }
        return Promise.reject(error)
      },
    },
  })
}
```

### useTableCrud 表格数据管理

```typescript
import { useTableCrud } from '@robot-admin/request-core'

const table = useTableCrud({
  api: {
    list: '/api/employees',
    create: '/api/employees',
    update: '/api/employees/:id',
    delete: '/api/employees/:id',
    detail: '/api/employees/:id',
  },
  columns: [...],
  pagination: { pageSize: 20 },
})

// 模板中
<C_Table :crud="table" :config="{ edit: { mode: 'modal' } }" />
```

### 表单验证规则

```typescript
import { PRESET_RULES } from '@robot-admin/form-validate'

const rules = {
  name: [PRESET_RULES.required('姓名'), PRESET_RULES.length('姓名', 2, 20)],
  age: [PRESET_RULES.required('年龄'), PRESET_RULES.range('年龄', 18, 65)],
  email: [PRESET_RULES.required('邮箱'), PRESET_RULES.email('邮箱')],
  mobile: [PRESET_RULES.required('手机号'), PRESET_RULES.mobile('手机号')],
}
```

---

## 十一、路由与权限

### 动态路由加载策略

```typescript
// 高频页面：eager 预加载（打包到主 bundle）
const EAGER_MODULES = import.meta.glob('@/views/home/**/*.vue', { eager: true })
const EAGER_DASHBOARD = import.meta.glob('@/views/dashboard/**/*.vue', {
  eager: true,
})

// 其他页面：lazy 按需加载
const LAZY_MODULES = import.meta.glob('@/views/**/!(home|dashboard)*.vue')
```

### 路由守卫流程

```
用户请求页面
  ↓
是预览路由 (/preview/*) → 直接放行
  ↓
未登录 + 需要认证 → 重定向 /login
  ↓
已登录 + 访问 /login → 重定向 /home
  ↓
已登录 + authMenuList 为空 → initDynamicRouter()
  ↓
Token 超时（8小时无活跃） → 重新登录对话框
  ↓
正常渲染页面
```

### 新增页面的路由配置

路由配置通过后端 JSON 动态生成，本地开发使用 `src/assets/data/dynamicRouter.json`：

```json
{
  "path": "/demo/55-new-feature",
  "name": "demo-55-new-feature",
  "component": "/demo/55-new-feature/index",
  "meta": {
    "title": "新功能演示",
    "icon": "mdi:star",
    "keepAlive": true,
    "hidden": false
  }
}
```

---

## 十二、样式与主题规范

### 样式编写优先级

1. **UnoCSS 原子类**（优先使用） — 间距、布局、颜色等
2. **组件 SCSS**（复杂样式） — `<style lang="scss" scoped>` + `@use './index.scss'`
3. **CSS 变量**（主题适应） — `var(--c-primary)`

### UnoCSS 使用示例

```html
<!-- ✅ 使用 UnoCSS 原子类 -->
<div class="flex items-center gap-2 p-4 rounded-lg bg-white dark:bg-gray-800">
  <span class="text-sm text-gray-600">标签</span>
</div>

<!-- ✅ Attributify 模式 -->
<div
  flex
  items-center
  gap-2
  p-4
>
  <span
    text-sm
    text-gray-600
    >标签</span
  >
</div>
```

### 样式隔离

```vue
<style lang="scss" scoped>
  /* 使用 @use 导入独立样式文件 */
  @use './index.scss';
</style>
```

### 主题系统三层架构

```
Layer 1: Design Tokens (src/config/theme/tokens.ts)
  → 定义原始颜色、间距常量
  ↓
Layer 2: @robot-admin/theme (Light/Dark/System)
  → 基础主题模式管理
  ↓
Layer 3: s_themeStore (Naive UI 集成扩展)
  → 合并 themeOverrides → NConfigProvider 注入
```

---

## 十三、TypeScript 规范

### tsconfig 关键配置

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "composite": true,
    "incremental": true,
    "paths": {
      "@/*": ["src/*"],
      "_views/*": ["src/views/*"]
    }
  }
}
```

### 类型定义位置

| 类型       | 位置                          | 示例                      |
| ---------- | ----------------------------- | ------------------------- |
| 环境变量   | `src/types/env.d.ts`          | `ImportMetaEnv`           |
| 全局类型   | `src/types/global.d.ts`       | `AppConfig`               |
| 业务模块   | `src/types/modules/*.d.ts`    | `form.d.ts`, `table.d.ts` |
| 自动生成   | `src/types/auto-imports.d.ts` | unplugin 生成             |
| API 类型   | `src/api/generated/`          | 自动生成的请求/响应类型   |
| 组件库类型 | 组件目录 `types.ts`           | `C_Form/types.ts`         |

### 类型编写规则

```typescript
// ✅ 使用 interface 定义对象类型
interface UserInfo {
  username?: string
  password?: string
  [key: string]: unknown
}

// ✅ 使用 type 定义联合类型
type LayoutType = 'default' | 'inline' | 'grid' | 'card' | 'tabs' | 'steps'
type EditMode = 'modal' | 'row' | 'cell' | 'none'

// ✅ 使用泛型约束
export function useLoginController<
  TResponse extends { code: string; data?: any } = any,
>(options: UseLoginControllerOptions<TResponse>) {
  /* ... */
}

// ✅ 使用 defineProps 类型参数
const props = withDefaults(
  defineProps<{
    items?: BreadcrumbItem[]
    showIcon?: boolean
    iconSize?: number
  }>(),
  {
    showIcon: true,
    iconSize: 16,
  }
)
```

---

## 十四、Git 提交规范

### 提交格式

```
<type>(<scope>): <subject>
```

### Type 类型

| Type       | 说明   | 使用场景                |
| ---------- | ------ | ----------------------- |
| `wip`      | 开发中 | 未完成的功能            |
| `feat`     | 新功能 | 添加新特性              |
| `fix`      | 修复   | 修复 Bug                |
| `docs`     | 文档   | 更新文档                |
| `style`    | 样式   | 代码格式（非 CSS 样式） |
| `refactor` | 重构   | 既非 feat 也非 fix      |
| `perf`     | 性能   | 性能优化                |
| `test`     | 测试   | 添加/修改测试           |
| `chore`    | 杂务   | 构建/辅助工具变动       |
| `revert`   | 回退   | 回滚到某个版本          |
| `build`    | 构建   | 构建流程/依赖变更       |
| `deps`     | 依赖   | 更新依赖版本            |

### Scope 要求

**强制填写 scope**（`scope-empty: [2, 'never']`）

常用 scope 示例：

- `components` — 组件相关
- `views` — 页面相关
- `stores` — 状态管理
- `router` — 路由相关
- `api` — 接口相关
- `styles` — 样式相关
- `config` — 配置相关
- `utils` — 工具函数
- `plugins` — 插件相关
- `types` — 类型定义

### 提交示例

```bash
# ✅ 正确
feat(components): 新增 C_AudioPlayer 音频播放组件
fix(router): 修复动态路由重复注册问题
docs(readme): 更新快速开始指南
perf(build): 优化 manualChunks 分包策略
deps(package): 升级 naive-ui 到 2.42.0

# ❌ 错误
update code                      # 缺少 type 和 scope
feat: 新增功能                    # 缺少 scope
Fix(router): 修复问题             # type 应为小写
```

### 提交流程

```bash
# 使用 Commitizen 交互式提交
bun run cz

# 或手动 git commit（会触发 commitlint 校验）
git add .
git commit -m "feat(views): 新增 55-new-feature 演示页面"
```

### Pre-commit 钩子

Husky + lint-staged 在每次提交前自动执行：

```bash
# 对暂存的 JS/TS/Vue 文件
1. oxlint --max-warnings 0 --deny-warnings   # Rust Lint
2. eslint --fix --no-cache                     # ESLint 修复
3. prettier --write                            # 格式化

# 对 JSON/MD/YAML 文件
1. prettier --write                            # 格式化
```

---

## 十五、ESLint 规则摘要

### 配置概览

```typescript
// eslint.config.ts — Flat Config 格式
export default [
  oxlint.configs['flat/recommended'], // Oxlint Rust 规则
  ...pluginVue.configs['flat/recommended'], // Vue 推荐规则
  ...vueTsEslintConfig(), // TS + Vue 集成
  // 自定义规则覆盖
]
```

### 重要规则

| 规则                                    | 值                   | 说明                                |
| --------------------------------------- | -------------------- | ----------------------------------- |
| `quotes`                                | `'single'`           | 单引号（TS）                        |
| `semi`                                  | `'never'` (Prettier) | 不使用分号                          |
| `max-depth`                             | `4`                  | 最大嵌套深度                        |
| `complexity`                            | `['warn', 10]`       | 圈复杂度警告                        |
| `jsdoc/require-jsdoc`                   | `error`              | JSDoc 强制（function/method/class） |
| `vue/component-name-in-template-casing` | `PascalCase`         | 模板中组件名大驼峰                  |
| `vue/no-unused-components`              | `error`              | 禁止未使用组件                      |

### 忽略文件

```
dist/
node_modules/
src/types/auto-imports.d.ts
src/types/components.d.ts
*.config.*js
```

---

## 十六、构建与部署

### Vite 构建优化

#### 手动分包策略

```typescript
// viteBuildConfig.ts
manualChunks: {
  'vue-vendor':      ['vue', 'vue-router', 'pinia'],
  'ui-vendor':       ['naive-ui'],
  'editor-vendor':   ['@kangc/v-md-editor', 'highlight.js'],
  'office-vendor':   ['xlsx', 'mammoth'],
  'calendar-vendor': ['FullCalendar 全家桶'],
  'spline-vendor':   ['@splinetool/runtime'],
  'graph-vendor':    ['@antv/x6', '@vue-flow/core'],
  'viz-vendor':      ['@visactor/vtable-gantt'],
}
```

#### 依赖预构建

```typescript
// vite.config.ts
optimizeDeps: {
  include: ['naive-ui', 'pinia', '@vueuse/core', 'echarts', ...],
  exclude: ['vue', 'vue-router', 'vue-demi'], // Vue 排除预构建
}
```

> ⚠️ **关键**：Vue 全家桶必须排除预构建，因为 esbuild 拆包会导致 RefImpl 符号断裂。

#### 重页面预加载

```typescript
const HEAVY_PAGE_ROUTES = [
  '/demo/13-calendar', // FullCalendar
  '/demo/16-text-editor', // WangEditor
  '/demo/29-antv-x6-editor', // 流程图编辑器
]
```

#### 生产环境优化

```typescript
// esbuild 移除 console/debugger
esbuild: {
  drop: ['console', 'debugger'],
}
```

### 产物结构

```
dist/
├── js/          # 脚本（hash 命名，1年长期缓存）
├── css/         # 样式
├── images/      # 图片
├── fonts/       # 字体
├── media/       # 音视频
└── assets/      # 其他资源
```

### 组件库构建（naive-ui-components）

构建工具：**Tsdown**（Rolldown 封装，下一代 Rust 打包器）

```bash
bun run build
# 相当于：
# 1. tsdown          → ESM + CJS 双格式
# 2. build:scss      → Dart Sass 编译全局样式
# 3. build:css       → 合并 SFC scoped + 全局 CSS（去重）
# 4. build:exports   → 自动生成 package.json exports 映射
```

产物：

```
dist/
├── index.js          # 全量入口
├── resolver.js       # 自动导入解析器
├── style.css         # 全量样式
├── C_Form.js         # 按需入口
├── C_Form.css        # 按需样式
├── C_Table.js        # ...
└── ...
```

### 环境变量

```env
# 共享
VITE_PORT=1988
VITE_APP_TITLE=AGILE TEAM | ROBOT ADMIN

# 开发环境
VITE_APP_ENV=development
VITE_API_BASE=/api
VITE_I18N_ENABLED=false

# 生产环境
VITE_APP_ENV=production
VITE_API_BASE=https://api.example.com
```

---

## 十七、生态包速查表

### @robot-admin/directives — 11 个指令

| 指令              | 用途         | 参数                      |
| ----------------- | ------------ | ------------------------- |
| `v-copy`          | 复制文本     | 字符串值                  |
| `v-debounce`      | 防抖         | `{fn, delay}` 默认 300ms  |
| `v-throttle`      | 节流         | `{fn, delay}`             |
| `v-drag`          | 拖拽         | —                         |
| `v-longpress`     | 长按         | `{fn, delay}`             |
| `v-permission`    | 权限控制     | `string[]` + AND/OR 模式  |
| `v-watermark`     | 水印         | `{text, color, fontSize}` |
| `v-lazy`          | 图片懒加载   | 图片 URL                  |
| `v-loading`       | 局部 Loading | `boolean`                 |
| `v-tooltip`       | Tooltip      | 文本/配置对象             |
| `v-click-outside` | 外部点击     | 回调函数                  |

### @robot-admin/form-validate — 验证规则

```typescript
import { PRESET_RULES } from '@robot-admin/form-validate'

// 常用规则
PRESET_RULES.required('字段名') // 必填
PRESET_RULES.length('字段名', min, max) // 长度范围
PRESET_RULES.range('字段名', min, max) // 数值范围
PRESET_RULES.email('邮箱') // 邮箱格式
PRESET_RULES.mobile('手机号') // 中国手机号
PRESET_RULES.url('URL') // URL 格式
PRESET_RULES.idCard('身份证') // 中国身份证
PRESET_RULES.ip('IP') // IP 地址
```

### @robot-admin/request-core — 请求方法

```typescript
import { getData, postData, putData, deleteData } from '@robot-admin/request-core'

// CRUD 快捷方法
getData<T>(url, params?)       // GET 请求
postData<T>(url, data?)        // POST 请求
putData<T>(url, data?)         // PUT 请求
deleteData<T>(url, params?)    // DELETE 请求

// 表格 CRUD
import { useTableCrud } from '@robot-admin/request-core'
const table = useTableCrud({ api, columns, pagination })
```

### @robot-admin/layout — 布局模式

| 模式                     | 说明                  |
| ------------------------ | --------------------- |
| `side`                   | 左侧菜单（传统 ERP）  |
| `top`                    | 顶部菜单（内容优先）  |
| `mix`                    | 左侧图标 + 悬浮菜单   |
| `mix-top`                | 左侧图标 + 顶部菜单   |
| `reverse-horizontal-mix` | 顶部横向 + 右侧栏     |
| `card-layout`            | 卡片 hover + 网格抽屉 |

### @robot-admin/file-utils — 文件处理

```typescript
import {
  useExcel,
  useDownload,
  useJSZip,
  useChunkUpload,
} from '@robot-admin/file-utils'

// Excel 导入导出
const { exportExcel, importExcel } = useExcel()

// 通用下载（20+ 格式）
const { download } = useDownload()

// ZIP 压缩导出
const { createZip } = useJSZip()

// 大文件分片上传（并发 + 重试 + SHA 校验）
const { upload } = useChunkUpload()
```

---

## 十八、常见坑与注意事项

### 1. Vue 预构建排除

Vite 7 中 **必须** 将 Vue 全家桶排除预构建，否则 esbuild 会拆包导致 `RefImpl` 符号断裂：

```typescript
optimizeDeps: {
  exclude: ['vue', 'vue-router', 'vue-demi', 'pinia-plugin-persistedstate'],
}
```

### 2. 自动导入范围

以下 API 已配置自动导入，**无需手动 import**：

- Vue: `ref`, `computed`, `watch`, `onMounted`, `nextTick`, `reactive`, `readonly` ...
- Router: `useRoute`, `useRouter`
- Pinia: `defineStore`, `storeToRefs`
- VueUse: `useLocalStorage`, `useClipboard`, `useDebounceFn`
- Naive UI: `NCard`, `NButton`, `NModal`, `NSpace`, `useMessage`, `useDialog` ...
- 自定义: `src/stores/*`, `src/composables/*`, `src/hooks/*` 下的所有导出

### 3. C\_ 组件自动解析优先级

```
RobotNaiveUiResolver（组件库 C_ 组件）
  ↓ 若不匹配
NaiveUiResolver（Naive UI 原生组件）
  ↓ 若不匹配
本地 global/ fallback（主项目 C_ 组件）
  ↓ 若不匹配
本地 local/ fallback（小写 c_ 组件）
```

### 4. 样式导入顺序

```typescript
// main.ts 中的样式导入顺序不可更改
import './assets/css/main.css' // 基础重置
import '@/styles/index.scss' // 全局样式
import '@robot-admin/layout/style' // 布局系统样式
import '@robot-admin/naive-ui-components/style.css' // 组件库样式
import 'virtual:uno.css' // UnoCSS（最高优先级）
```

### 5. Store 命名约定

Store 文件导出必须使用 `s_` 前缀：

```typescript
// ✅ 正确
export const s_userStore = defineStore('user', { ... })
export const s_themeStore = defineStore('theme-extended', () => { ... })

// ❌ 不要使用
export const useUserStore = defineStore(...)  // 不用 "use" 前缀
export const userStore = defineStore(...)      // 缺少 "s_" 前缀
```

### 6. 组件事件桥接

组件库中的复杂组件使用 **config 回调** 替代大量 emit：

```typescript
// ❌ 不推荐：16 个 emit
emit('tab-change', ...)
emit('step-change', ...)
emit('field-add', ...)

// ✅ 推荐：config 回调
<C_Form
  :config="{
    onTabChange: handleTabChange,
    onStepChange: handleStepChange,
    onFieldAdd: handleFieldAdd,
  }"
/>
```

### 7. 应用启动顺序

插件注册顺序很重要，不可随意调整：

```
setupLoading()           # 0. 首屏动画
createApp(App)           # 1. 创建实例
setupGlobalErrorHandler  # 2. 错误处理（必须最先）
setupStore               # 3. Pinia
setupRequestCore         # 4. Request Core
setupLayoutSystem        # 5. 布局
setupNaiveUI             # 6. Naive UI
setupDirectives          # 7. 指令
router.isReady()         # 8. 等待路由
app.mount('#app')        # 9. 挂载
```

---

## 十九、新功能开发 Checklist

### 新增 Demo 页面

- [ ] 创建 `src/views/demo/XX-feature-name/` 目录
- [ ] 创建 `index.vue`（遵循四段式结构）
- [ ] 创建 `index.scss`（scoped 样式）
- [ ] 创建 `data.ts`（配置数据抽离）
- [ ] 在 `dynamicRouter.json` 中添加路由配置
- [ ] 添加文件头注释
- [ ] 添加 JSDoc 注释
- [ ] 使用 `bun run lint` 检查
- [ ] 使用 `bun run cz` 规范化提交

### 新增组件库组件

- [ ] 在 `naive-ui-components/src/components/` 下创建 `C_ComponentName/` 目录
- [ ] 创建 `index.ts`（导出入口）
- [ ] 创建 `index.vue`（薄 UI 壳）
- [ ] 创建 `types.ts`（类型定义）
- [ ] 复杂组件创建 `composables/` 目录
- [ ] 创建 `index.scss`（组件样式，使用 CSS 变量）
- [ ] `bun run build` 构建（自动注册导出）
- [ ] 在主项目中创建 demo 页面验证
- [ ] 使用 `bun run check:exports` 检查冲突

### 新增业务页面

- [ ] 创建 `src/views/module-name/` 目录
- [ ] 创建页面 Vue 文件
- [ ] 在 `src/api/` 下创建对应的 API 文件
- [ ] 在 `src/types/modules/` 下创建类型定义
- [ ] 配置路由（dynamicRouter.json）
- [ ] 如需全局状态，在 `src/stores/` 下创建 Store

### 新增 @robot-admin 包

- [ ] 在 `robot-admin-packages/packages/` 下创建包目录
- [ ] 配置 `package.json`（name: `@robot-admin/xxx`）
- [ ] 使用 TypeScript 编写源码
- [ ] 配置构建脚本
- [ ] 在主项目 `package.json` 中添加依赖
- [ ] 在 `src/plugins/` 中创建初始化插件
- [ ] 使用 Changesets 管理版本

---

> **最后提醒**：本项目追求**高性能、强类型、零冗余**。编写代码时：
>
> 1. 优先使用项目已有的包和工具（`@robot-admin/*`），不要引入功能重复的第三方库
> 2. 遵循薄 UI 壳 + 厚 Composable 引擎的架构模式
> 3. 使用 Bun 作为唯一的包管理器和任务运行器
> 4. 所有文件必须包含文件头注释和 JSDoc
> 5. Git 提交严格遵守 Commitlint 规范
> 6. 不要破坏自动导入机制（unplugin-auto-import + unplugin-vue-components）

---

## 二十、AI 技能调度表（Skills）

本项目配备了 5 个结构化 AI 技能包，位于 `.github/skills/` 目录。
当识别到用户意图匹配下表关键词时，**自动加载对应 SKILL.md 并按其流程执行**。

| 技能         | 目录                       | 触发关键词                                 | 说明                                            |
| ------------ | -------------------------- | ------------------------------------------ | ----------------------------------------------- |
| **原型解析** | `skills/prototype-scan/`   | 原型解析、axure扫描、页面清单、详设文档    | 将 Axure HTML / 详设文档 → page-spec JSON       |
| **接口约定** | `skills/api-contract/`     | 接口约定、生成api、swagger转ts、接口文件   | 从 page-spec / Swagger → TS 类型 + API 函数     |
| **页面生成** | `skills/page-codegen/`     | 生成页面、代码生成、页面骨架、scaffold     | 从 page-spec → index.vue + data.ts + index.scss |
| **路由注册** | `skills/route-sync/`       | 注册路由、添加菜单、路由配置、新增页面路由 | 将新页面注册到 dynamicRouter.json               |
| **规范审计** | `skills/convention-audit/` | 规范检查、代码审查、命名规范、code review  | 10 维度规范合规性审查                           |

### 典型工作流

```
原型/详设文档
  │
  ▼
prototype-scan → page-spec JSON
  │
  ├──▶ api-contract → src/api/ 类型 + 请求函数
  │
  ├──▶ page-codegen → src/views/ 页面三件套
  │
  └──▶ route-sync  → dynamicRouter.json 路由注册

代码完成后
  │
  ▼
convention-audit → 规范审计报告
```

> **使用方式**：直接用自然语言描述需求即可，AI 会自动匹配并执行对应技能。
