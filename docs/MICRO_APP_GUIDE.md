# 🚀 Robot Admin 微前端架构指南

> **MicroApp + Portal 统一门户 — 企业级微前端解决方案**
>
> 最后更新：2026-03-22

---

## 目录

- [一、架构总览](#一架构总览)
- [二、技术选型与社区对比](#二技术选型与社区对比)
- [三、核心设计哲学](#三核心设计哲学)
- [四、项目结构](#四项目结构)
- [五、快速开始](#五快速开始)
- [六、核心模块详解](#六核心模块详解)
  - [6.1 micro-app 初始化](#61-micro-app-初始化)
  - [6.2 子应用配置注册表](#62-子应用配置注册表)
  - [6.3 统一门户工作台](#63-统一门户工作台)
  - [6.4 微应用容器](#64-微应用容器)
  - [6.5 收藏系统](#65-收藏系统)
  - [6.6 路由设计](#66-路由设计)
  - [6.7 主子应用通信协议](#67-主子应用通信协议)
- [七、子应用开发指南](#七子应用开发指南)
- [八、主题同步机制](#八主题同步机制)
- [九、部署策略](#九部署策略)
- [十、微前端方案对比矩阵](#十微前端方案对比矩阵)
- [十一、演进路线图](#十一演进路线图)
- [十二、常见问题](#十二常见问题)

---

## 一、架构总览

```
┌──────────────────────────────────────────────────────────────────────┐
│                          统一门户 Portal                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ 基础平台│ │Robot   │ │智慧物流│ │大宗采购│ │ 销售   │ │ 仓储   │ │
│  │ 管理系统│ │Admin   │ │管理系统│ │管理系统│ │ 管理   │ │ 管理   │ │
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ │
│      │     ✅已集成    ✅已集成     ⏳待集成    ⏳待集成   ⏳待集成  │
└──────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────┘
       │          │          │          │          │          │
┌──────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────┐
│                      主应用 Robot Admin (dev)                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  @robot-admin/layout · request-core · directives · theme    │    │
│  │  naive-ui-components · form-validate · file-utils           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌──────────┐  ┌─────────────────┐  ┌──────────────────────┐       │
│  │ micro-app│  │  Portal Page    │  │ MicroApp Container   │       │
│  │ 框架核心  │  │  门户工作台     │  │  子应用 iframe 容器  │       │
│  └──────────┘  └─────────────────┘  └──────────────────────┘       │
│  ┌──────────┐  ┌─────────────────┐  ┌──────────────────────┐       │
│  │ Pinia    │  │  Vue Router     │  │ Theme Sync           │       │
│  │ favorites│  │  /portal        │  │ 主题实时同步          │       │
│  │ Store    │  │  /micro-app/:id │  │ postMessage          │       │
│  └──────────┘  └─────────────────┘  └──────────────────────┘       │
└────────────────────────────────────────────────────────────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│  内部路由页面 │  │  iframe 子应用 A │  │  iframe 子应用 B    │
│  /home       │  │  :3003 物流      │  │  :3004 采购（规划） │
│  /demo/*     │  │  独立 Vue 项目   │  │  独立技术栈         │
│  /sys-manage │  │  独立构建部署    │  │  独立构建部署       │
└─────────────┘  └─────────────────┘  └─────────────────────┘
```

### 关键架构决策

| 决策项         | 选择                     | 原因                                              |
| -------------- | ------------------------ | ------------------------------------------------- |
| 微前端框架     | micro-app (iframe 模式)  | 零侵入、完全沙箱隔离、支持任意技术栈              |
| 基座应用       | Robot Admin dev 分支     | 复用 8 个 @robot-admin/* 包，避免重复建设           |
| 子应用隔离     | iframe                   | CSS/JS 完全隔离，不存在样式污染和全局变量冲突      |
| 子应用保活     | keep-alive               | 切换子应用时保留状态，无需重新加载                 |
| 通信机制       | micro-app datachange     | 结构化事件协议 + postMessage 双通道                |
| 门户入口       | 独立 Portal 页面         | 提供统一工作台，聚合待办、收藏、子系统导航         |
| 子应用配置     | 集中式注册表 + 环境映射  | 一处配置，多环境自动适配                           |

---

## 二、技术选型与社区对比

### 为什么选 micro-app + iframe？

在微前端领域，主流方案各有优劣。我们经过对以下方案的深入调研后选择了 **micro-app iframe 模式**：

| 维度               | micro-app (iframe) | qiankun         | Module Federation | single-spa      | wujie            |
| ------------------ | ------------------ | --------------- | ----------------- | --------------- | ---------------- |
| **上手难度**       | ⭐ 极低            | ⭐⭐ 低         | ⭐⭐⭐ 中         | ⭐⭐⭐⭐ 高     | ⭐ 极低          |
| **JS 沙箱**        | ✅ iframe 天然隔离  | ⚠️ Proxy 近似   | ❌ 无隔离          | ❌ 无隔离        | ✅ iframe 隔离   |
| **CSS 隔离**       | ✅ 完全隔离         | ⚠️ Shadow DOM   | ❌ 需手动处理      | ❌ 需手动处理    | ✅ 完全隔离      |
| **技术栈无关**     | ✅ 完全支持         | ⚠️ 改造成本高   | ❌ 仅 Webpack/Vite | ⚠️ 需适配器      | ✅ 完全支持      |
| **子应用改造量**   | 极少               | 中等            | 较大              | 较大            | 极少             |
| **性能**           | 良好               | 良好            | 优秀（共享模块）  | 良好            | 良好             |
| **keep-alive**     | ✅ 原生支持         | ❌ 不支持        | ❌ 不支持          | ❌ 不支持        | ✅ 原生支持      |
| **预加载**         | ✅ 支持             | ✅ 支持          | ✅ 构建时          | ❌ 不支持        | ✅ 支持          |
| **Vite 原生支持**  | ✅ 完美支持         | ⚠️ 需 plugin    | ⚠️ 需适配         | ⚠️ 需适配       | ✅ 完美支持      |
| **维护状态**       | 京东活跃维护       | 蚂蚁体验技术部  | Webpack 官方      | 社区维护        | 腾讯活跃维护     |
| **GitHub Stars**   | 5.5k+              | 15k+            | 内置 Webpack      | 13k+            | 4k+              |

### 选择 micro-app iframe 模式的核心理由

1. **零侵入子应用** — 子应用无需引入任何 SDK，只需配置跨域即可接入
2. **iframe 天然沙箱** — JS/CSS 完全隔离，企业多团队协作零冲突风险
3. **keep-alive 原生支持** — 子应用切换保留状态，用户体验接近原生
4. **技术栈完全无关** — 子应用可以是 Vue/React/Angular/jQuery 任意技术栈
5. **与 Vite 8 完美兼容** — 无需额外 plugin 或 adapter
6. **京东技术团队维护** — 持续迭代，企业级稳定性保障

### 与本项目其他架构分支的关系

```
Robot Admin 多架构矩阵
├── main (单体 SPA)          ← 适合中小项目，一切内聚
├── monorepo (Bun Workspaces) ← 适合多应用共享代码
├── feature/module-federation ← 适合同技术栈的运行时共享
└── feature/micro-app ★       ← 适合异构子系统聚合平台
```

| 场景                         | 推荐分支               |
| ---------------------------- | ---------------------- |
| 单团队、单产品               | main                   |
| 多应用共享 UI 库/工具包       | monorepo               |
| 同技术栈多团队、需运行时共享  | feature/module-federation |
| 异构子系统、多团队独立交付    | **feature/micro-app** ★ |
| 企业集团统一门户              | **feature/micro-app** ★ |

---

## 三、核心设计哲学

### 3.1 "基座复用，增量扩展"

本方案**不是**重新搭建一个微前端项目，而是在 dev 分支（已有完整 @robot-admin/* 包生态）的基础上，**增量添加微前端能力**：

```
dev 分支 (v2.2.0)
├── 8 个 @robot-admin/* 包 ← 完全保留
├── 54 个 Demo 页面 ← 完全保留
├── 路由/权限/主题/布局 ← 完全保留
│
└── + 微前端增量层
    ├── @micro-zoe/micro-app 框架
    ├── Portal 门户工作台
    ├── MicroApp 容器组件
    ├── 子应用配置注册表
    └── 收藏系统 + 主题同步
```

### 3.2 "配置驱动，一处注册"

所有子应用通过 `src/config/microApps.ts` 集中管理，新增子应用只需添加一条配置：

```typescript
export const MICRO_APPS: Record<string, MicroAppConfig> = {
  logistics: {
    id: 'logistics',
    name: '智慧物流管理系统',
    dev: 'http://localhost:3003',
    prod: 'https://logistics.example.com',
  },
  // 💡 新增子应用只需在这里添加一条记录
  procurement: {
    id: 'procurement',
    name: '大宗采购管理系统',
    dev: 'http://localhost:3004',
    prod: 'https://procurement.example.com',
  },
}
```

### 3.3 "门户优先，不直接跳转"

用户首先进入 Portal 门户页面，看到企业全景（所有子系统列表、待办、收藏、消息），再选择进入具体子系统。这种模式适合：

- 企业集团多系统统一入口
- 跨系统的待办/消息聚合
- 用户常用功能快速收藏

---

## 四、项目结构

### 微前端相关文件（增量于 dev 分支）

```
Robot_Admin/
├── src/
│   ├── main.ts                        # 🔧 修改：添加 setupMicroApp() 调用
│   │
│   ├── config/
│   │   └── microApps.ts               # 🆕 子应用配置注册表
│   │
│   ├── plugins/
│   │   ├── index.ts                   # 🔧 修改：导出 micro-app 插件
│   │   └── micro-app.ts              # 🆕 micro-app 框架初始化
│   │
│   ├── stores/
│   │   └── favorites/
│   │       └── index.ts              # 🆕 菜单收藏 Store（持久化）
│   │
│   ├── components/global/
│   │   └── C_Favorites/
│   │       ├── index.vue             # 🆕 收藏网格组件
│   │       └── index.scss            # 🆕 收藏组件样式
│   │
│   ├── views/
│   │   ├── portal/
│   │   │   ├── index.vue             # 🆕 门户工作台页面
│   │   │   ├── data.ts               # 🆕 门户数据配置
│   │   │   └── index.scss            # 🆕 门户样式
│   │   │
│   │   └── micro-app/
│   │       └── index.vue             # 🆕 微应用容器
│   │
│   ├── router/
│   │   └── publicRouter.ts           # 🔧 修改：添加 /portal + /micro-app/:id
│   │
│   └── types/
│       └── micro-app.d.ts            # 🆕 微前端类型声明
│
└── sys-mock/                         # 🆕 模拟子应用（开发调试用）
    └── logistics/
        ├── package.json
        ├── index.html
        ├── vite.config.ts
        ├── tsconfig.json
        └── src/
            ├── main.ts
            ├── App.vue
            ├── microApp.ts           # 子应用通信模块
            ├── router/index.ts
            ├── stores/app.ts
            ├── styles/index.scss
            └── views/
                ├── dashboard/index.vue
                ├── orders/index.vue
                ├── vehicles/index.vue
                └── warehouse/index.vue
```

### 文件修改清单

| 文件 | 变更类型 | 说明 |
| --- | --- | --- |
| `package.json` | 修改 | 添加 `@micro-zoe/micro-app` 依赖 |
| `src/main.ts` | 修改 | 在 Vue 实例创建前调用 `setupMicroApp()` |
| `src/plugins/index.ts` | 修改 | 导出 `micro-app` 插件 |
| `src/router/publicRouter.ts` | 修改 | 添加 `/portal` 和 `/micro-app/:id` 路由 |
| `src/config/microApps.ts` | 新增 | 子应用配置注册表 |
| `src/plugins/micro-app.ts` | 新增 | micro-app 框架初始化插件 |
| `src/stores/favorites/index.ts` | 新增 | 收藏菜单 Pinia Store |
| `src/types/micro-app.d.ts` | 新增 | TypeScript 类型声明 |
| `src/components/global/C_Favorites/` | 新增 | 收藏网格组件 |
| `src/views/portal/` | 新增 | 门户工作台页面 |
| `src/views/micro-app/` | 新增 | 微应用容器页面 |
| `sys-mock/logistics/` | 新增 | 模拟子应用（完整 Vue 3 项目）|

---

## 五、快速开始

### 环境要求

- Node.js >= 22.x
- Bun >= 1.x

### 启动主应用

```bash
# 1. 克隆并切换到微前端分支
git clone https://github.com/ChenyCHENYU/Robot_Admin.git
cd Robot_Admin
git checkout feature/micro-app

# 2. 安装依赖
bun install

# 3. 启动开发服务器（默认端口 1988）
bun run dev
```

### 启动模拟子应用

```bash
# 在另一个终端中
cd sys-mock/logistics

# 安装子应用依赖
bun install

# 启动子应用（端口 3003）
bun run dev
```

### 访问路径

| 页面 | 地址 | 说明 |
| --- | --- | --- |
| 门户工作台 | `http://localhost:1988/portal` | 统一入口，子系统导航 |
| Robot Admin | `http://localhost:1988/home` | 主系统首页 |
| 物流子应用 | `http://localhost:1988/micro-app/logistics` | 通过 iframe 加载 :3003 |
| 子应用独立 | `http://localhost:3003` | 物流系统独立运行 |

---

## 六、核心模块详解

### 6.1 micro-app 初始化

**文件**: `src/plugins/micro-app.ts`

```typescript
import microApp from '@micro-zoe/micro-app'

export function setupMicroApp() {
  microApp.start({
    'disable-memory-router': false,   // 保留子应用路由管理
    'disable-patch-request': false,   // 保留请求自动补全
  })
}
```

**初始化时机**：在 `main.ts` 中，`setupLoading()` 之后、`createApp()` 之前调用。这确保 micro-app 框架在 Vue 实例创建前就已就绪。

```
setupLoading()      # 0. 首屏动画
setupMicroApp()     # 1. 🔥 micro-app 框架启动
const app = createApp(App)  # 2. Vue 实例
...
```

### 6.2 子应用配置注册表

**文件**: `src/config/microApps.ts`

所有子应用的地址、名称、图标集中在此文件管理，支持 4 个环境自动适配：

```typescript
export interface MicroAppConfig {
  id: string        // 唯一标识（路由参数）
  name: string      // 显示名称
  dev: string       // 开发环境地址
  test?: string     // 测试环境
  staging?: string  // 预发布环境
  prod?: string     // 生产环境
  icon?: string     // Iconify 图标名
  description?: string
}
```

**环境自动识别**：`getMicroAppUrl(appId)` 根据 `import.meta.env.MODE` 自动选择对应环境的 URL，开发时无需手动切换。

**添加新子应用**只需 3 步：

```typescript
// 1. 在 MICRO_APPS 中添加配置
export const MICRO_APPS = {
  // ...已有配置
  procurement: {
    id: 'procurement',
    name: '大宗采购管理系统',
    dev: 'http://localhost:3004',
    prod: 'https://procurement.example.com',
  },
}

// 2. 在门户 data.ts 的 systems 数组中添加条目
// 3. 访问 /micro-app/procurement 即可
```

### 6.3 统一门户工作台

**文件**: `src/views/portal/index.vue`

门户页面是微前端的核心入口，采用**四区域布局**：

```
┌──────────────────────────────────────────┐
│           快捷栏（子系统导航卡片）          │
│  [基础平台] [Robot Admin✅] [物流✅] ...   │
├───────────────────┬──────────────────────┤
│   左侧栏          │   右侧内容            │
│ ┌───────────────┐ │ ┌──────────────────┐ │
│ │ 用户卡片      │ │ │ 我的收藏         │ │
│ │ (头像/统计)   │ │ │ (C_Favorites)    │ │
│ ├───────────────┤ │ ├──────────────────┤ │
│ │ 待办事项      │ │ │ 应用中心         │ │
│ │ (任务列表)    │ │ │ (6 个功能模块)   │ │
│ ├───────────────┤ │ ├──────────────────┤ │
│ │ 外部协办      │ │ │ 最新消息         │ │
│ │ (跨部门协作)  │ │ │ (系统通知)       │ │
│ └───────────────┘ │ └──────────────────┘ │
└───────────────────┴──────────────────────┘
```

**路由配置**：`/portal` 路由使用 `full: true`，脱离主布局（不显示侧边栏和顶部导航），提供沉浸式门户体验。

### 6.4 微应用容器

**文件**: `src/views/micro-app/index.vue`

容器组件负责加载和管理子应用的生命周期：

```vue
<micro-app
  :name="appId"         <!-- 路由参数 id -->
  :url="appUrl"          <!-- 从配置自动获取 -->
  :data="appData"        <!-- 传递 token/userInfo/theme -->
  iframe                 <!-- iframe 隔离模式 -->
  keep-alive             <!-- 切换时保留状态 -->
  @mounted="..."         <!-- 加载完成 -->
  @error="..."           <!-- 加载失败 -->
  @datachange="..."      <!-- 子应用通信 -->
/>
```

**三种状态展示**：

| 状态 | UI 展示 | 触发条件 |
| --- | --- | --- |
| 加载中 | `<NSpin>` 全屏旋转 | URL 存在，子应用未 mounted |
| 加载失败 | `<NResult status="error">` + 重试按钮 | URL 不存在或 error 事件 |
| 正常运行 | `<micro-app>` 全屏 iframe | mounted 事件触发 |

### 6.5 收藏系统

**Store**: `src/stores/favorites/index.ts`
**组件**: `src/components/global/C_Favorites/index.vue`

收藏系统允许用户将常用菜单添加到门户页面快速访问：

```typescript
const favoritesStore = s_favoritesStore()

// 添加/移除收藏
favoritesStore.toggle('/demo/10-table')

// 检查是否已收藏
favoritesStore.isFavorite('/demo/10-table') // true/false
```

- 使用 `pinia-plugin-persistedstate` 自动持久化到 localStorage
- 与权限系统联动：只展示用户有权限的菜单收藏

### 6.6 路由设计

微前端路由设计遵循**零侵入原则**，只在 `publicRouter.ts` 中添加两条静态路由：

```typescript
// /portal — 门户工作台（全屏，无布局壳）
{
  path: '/portal',
  name: 'portal',
  meta: { full: true, keepAlive: false },
}

// /micro-app/:id — 微应用容器（全屏，keep-alive）
{
  path: '/micro-app/:id',
  name: 'micro-app',
  meta: { full: true, keepAlive: true },
}
```

**路由参数 `:id`** 即为 `microApps.ts` 中的 `MicroAppConfig.id`，容器组件通过 `route.params.id` 自动查找配置并加载。

### 6.7 主子应用通信协议

采用 **micro-app datachange 事件** 实现双向通信：

#### 主应用 → 子应用（通过 data 属性）

```typescript
// 自动传递给子应用的数据
const appData = computed(() => ({
  token: userStore.token,
  userInfo: userStore.userInfo,
  theme: { mode: themeStore.isDark ? 'dark' : 'light' },
  basePath: route.path,
  timestamp: Date.now(),
}))
```

#### 子应用 → 主应用（通过 datachange 事件）

```typescript
// 子应用发送
window.microApp?.dispatch({
  type: 'NAVIGATE',
  payload: { path: '/portal' },
})

// 主应用接收
const handleDataChange = (e: CustomEvent) => {
  const { type, payload } = e.detail.data
  switch (type) {
    case 'NAVIGATE':     // 路由跳转
    case 'MOUNTED':      // 子应用初始化完成
    case 'ROUTE_CHANGE': // 子应用路由变更
  }
}
```

#### 主题同步（主 → 子）

当用户在主应用切换暗黑模式时，自动通过 `microApp.setData()` 同步给子应用：

```typescript
watch(() => themeStore.isDark, (isDark) => {
  window.microApp?.setData?.(appId, {
    type: 'THEME_CHANGE',
    payload: { mode: isDark ? 'dark' : 'light' },
  })
})
```

---

## 七、子应用开发指南

### 7.1 创建新子应用

以 `sys-mock/logistics` 为参考模板，新建子应用的最小要求：

```bash
mkdir sys-mock/your-app
cd sys-mock/your-app
bun init
bun add vue vue-router pinia
bun add -d vite @vitejs/plugin-vue
```

### 7.2 关键配置：跨域 + 端口

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3004,           // 每个子应用分配独立端口
    cors: true,           // ⚠️ 必须开启跨域
    origin: 'http://localhost:3004',
  },
})
```

### 7.3 子应用通信模块

子应用需要监听主应用传入的数据（token、用户信息、主题模式）：

```typescript
// src/microApp.ts
export function setupMicroApp() {
  if (!window.__MICRO_APP_ENVIRONMENT__) return

  // 监听主应用数据
  window.microApp?.addDataListener((data: any) => {
    if (data.token) appStore.setToken(data.token)
    if (data.userInfo) appStore.setUserInfo(data.userInfo)
    if (data.theme) appStore.setThemeMode(data.theme.mode)
  })

  // 主动发送挂载完成事件
  window.microApp?.dispatch({
    type: 'MOUNTED',
    payload: { name: 'your-app' },
  })
}
```

### 7.4 子应用独立运行

子应用必须能独立运行（不依赖主应用），以便独立开发和调试：

```typescript
// src/main.ts
const app = createApp(App)
app.use(router).use(pinia)

// 微前端环境下初始化通信
if (window.__MICRO_APP_ENVIRONMENT__) {
  setupMicroApp()
}

app.mount('#app')
```

### 7.5 在主应用中注册

```typescript
// src/config/microApps.ts — 添加配置
'your-app': {
  id: 'your-app',
  name: '你的应用名称',
  dev: 'http://localhost:3004',
  prod: 'https://your-app.example.com',
}

// src/views/portal/data.ts — 在 systems 数组中添加
{
  id: 'your-app',
  name: '你的应用名称',
  icon: 'ri:some-icon',
  color: '#00BCD4',
  url: '/micro-app/your-app',
  integrated: true,
}
```

---

## 八、主题同步机制

主题同步是微前端中的常见痛点。本方案实现了**实时双向主题同步**：

```
┌─────────────┐  watch isDark  ┌──────────────┐  addDataListener  ┌───────────┐
│ s_themeStore │ ────────────► │ MicroApp     │ ────────────────► │ 子应用    │
│ (主应用)     │               │ Container    │  THEME_CHANGE     │ appStore  │
│              │               │ setData()    │                   │           │
└─────────────┘               └──────────────┘                   └───────────┘
```

**实现要点**：

1. 主应用通过 `watch(themeStore.isDark)` 监听主题切换
2. 变化时通过 `microApp.setData(appId, { type: 'THEME_CHANGE', ... })` 发送
3. 子应用通过 `addDataListener` 接收，更新本地主题状态
4. 子应用 CSS 使用 CSS 变量，根据主题模式自动切换

---

## 九、部署策略

### 独立部署（推荐）

每个子应用独立部署到不同域名/路径，主应用通过 MICRO_APPS 配置的 prod 地址加载：

```
主应用: https://admin.example.com
物流:   https://logistics.example.com
采购:   https://procurement.example.com
```

**Nginx 配置（子应用）**：

```nginx
server {
    listen 80;
    server_name logistics.example.com;

    # ⚠️ 必须允许跨域
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers '*';

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 同域部署

如果所有应用部署在同一域名下：

```
https://admin.example.com/           ← 主应用
https://admin.example.com/logistics/ ← 物流子应用
https://admin.example.com/procurement/ ← 采购子应用
```

需要子应用配置 `base` 路径：

```typescript
// 子应用 vite.config.ts
export default defineConfig({
  base: '/logistics/',
})
```

---

## 十、微前端方案对比矩阵

### Robot Admin 四种架构分支能力矩阵

| 能力维度             | main (单体) | monorepo | Module Federation | **micro-app** ★ |
| -------------------- | ----------- | -------- | ----------------- | --------------- |
| 独立部署             | ❌          | ✅       | ✅                | ✅              |
| 技术栈无关           | N/A         | ❌       | ❌（需同构）       | ✅              |
| 运行时共享           | N/A         | ❌       | ✅                | ❌              |
| 沙箱隔离             | N/A         | N/A      | ❌                | ✅（iframe）    |
| 子应用 keep-alive    | N/A         | N/A      | ❌                | ✅              |
| 统一门户             | ❌          | ❌       | ❌                | ✅              |
| 子应用零改造         | N/A         | N/A      | ❌                | ✅              |
| 复杂度               | ⭐          | ⭐⭐     | ⭐⭐⭐            | ⭐⭐            |

### 适用场景推荐

- **main** — 10 人以下团队，单产品快速迭代
- **monorepo** — 多应用共享 UI/工具，统一版本管理
- **Module Federation** — 同技术栈，需要运行时共享 Vue/Pinia 实例
- **micro-app** ★ — 企业集团多系统整合，不同团队独立交付，需要统一门户

---

## 十一、演进路线图

```
Phase 1 — 当前 ✅
├── micro-app iframe 基础架构
├── Portal 门户工作台
├── 子应用容器 + keep-alive
├── 主题同步机制
├── 收藏系统
└── sys-mock 物流子应用

Phase 2 — 规划中
├── 子应用预加载（idle 时段）
├── 跨应用通信总线（EventBus 扩展）
├── 统一鉴权网关（主应用 Token 统一下发）
├── 子应用健康检查（心跳检测）
└── 门户自定义布局（拖拽式卡片排列）

Phase 3 — 远期
├── 子应用灰度发布（按用户/比例）
├── 子应用性能监控（加载时间/错误率）
├── 微前端 DevTools（调试面板）
└── 多语言子应用适配
```

---

## 十二、常见问题

### Q1: 子应用加载白屏？

**检查清单**：

1. 子应用是否启动并运行在正确端口？
2. 子应用 Vite 配置是否开启了 `cors: true`？
3. 浏览器控制台是否有跨域报错？
4. `microApps.ts` 中的 URL 是否正确？

### Q2: 子应用路由跳转不生效？

micro-app iframe 模式下，子应用有独立的路由实例。确保：

1. 子应用使用 `createWebHashHistory()` 或正确的 `base`
2. 未设置 `'disable-memory-router': true`

### Q3: 子应用如何获取主应用的登录 Token？

主应用通过 `<micro-app :data="appData">` 自动传递 Token。子应用通过 `addDataListener` 接收：

```typescript
window.microApp?.addDataListener((data) => {
  if (data.token) localStorage.setItem('token', data.token)
})
```

### Q4: 如何接入非 Vue 的子应用？

micro-app iframe 模式不限制技术栈。React/Angular/jQuery 子应用只需：

1. 在 `microApps.ts` 中注册 URL
2. 子应用开启跨域即可

### Q5: 性能影响如何？

- iframe 首次加载有独立的 HTTP 请求开销
- `keep-alive` 模式下切换接近零延迟
- 主应用构建不受子应用影响（子应用独立构建）
- 构建产物分析：portal chunk ~15KB, micro-app container ~8KB

### Q6: 如何调试子应用？

1. **独立调试**：直接访问 `http://localhost:3003`
2. **集成调试**：在主应用中通过 `/micro-app/logistics` 访问，F12 可在 iframe 标签中切换到子应用上下文
3. **通信调试**：在子应用中添加 `console.log` 到 `addDataListener` 回调

---

## 许可证

[MIT License](../LICENSE)

---

> **Robot Admin** — 企业级微前端统一门户解决方案
>
> 作者：ChenYu ([ycyplus@gmail.com](mailto:ycyplus@gmail.com))
>
> 在线演示：[https://robotadmin.cn](https://robotadmin.cn)
