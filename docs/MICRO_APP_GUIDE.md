# Robot Admin — 微前端（MicroApp）架构文档

> 本文档基于 `feature/micro-app` 分支实际代码编写，覆盖架构设计、核心模块、本地调试、扩展指南。
> 最后更新：2026-03-22 | micro-app v1.0.0-rc.29 | Vue 3.5 | Vite 7

---

## 目录

1. [架构总览](#一架构总览)
2. [目录结构](#二目录结构)
3. [核心模块详解](#三核心模块详解)
4. [主子应用通信](#四主子应用通信)
5. [本地开发与调试](#五本地开发与调试)
6. [新增子应用指南](#六新增子应用指南)
7. [团队协作模式](#七团队协作模式)
8. [部署方案](#八部署方案)
9. [常见问题](#九常见问题)
10. [扩展路线图](#十扩展路线图)

---

## 一、架构总览

### 1.1 系统拓扑

```
┌─────────────────────────────────────────────────────────┐
│                    Robot Admin（主应用）                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Portal   │  │ C_Header │  │   Micro-App Container │  │
│  │ (门户页)  │  │(系统抽屉)│  │   (微应用容器)        │  │
│  └─────┬────┘  └────┬─────┘  └──────────┬───────────┘  │
│        │            │                    │               │
│        └────────────┼────────────────────┘               │
│                     │ PostMessage / data 绑定             │
├─────────────────────┼───────────────────────────────────┤
│                     ▼                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 智慧物流  │  │ 智能仓储  │  │ 数据分析  │  ...更多     │
│  │ :3003    │  │ :3004    │  │ :3005    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│        子应用（独立部署、技术栈无关）                       │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术选型

| 层面 | 技术 | 版本 |
|------|------|------|
| 微前端框架 | @micro-zoe/micro-app | ^1.0.0-rc.29 |
| 主应用框架 | Vue 3 + Vite 7 | 3.5 / 7.x |
| UI 组件库 | Naive UI | 2.41+ |
| 状态管理 | Pinia + 持久化 | 3.0 |
| 沙箱模式 | iframe 沙箱 | — |

### 1.3 核心设计原则

1. **零改造接入**：子应用不需要暴露 `bootstrap/mount/unmount`，micro-app 自动渲染
2. **类组件开发**：`<micro-app name="app" url="..." />` 像普通 Vue 组件一样使用
3. **门户工作台**：统一的系统入口，三栏布局聚合所有业务系统
4. **主题统一**：主应用 Dark/Light 模式实时同步到所有子应用

---

## 二、目录结构

```
src/
├── config/
│   ├── microApps.ts            # 子应用注册配置表（地址/环境映射）
│   └── systemTitles.ts         # 系统标题映射（标题/副标题）
│
├── components/global/
│   ├── C_Header/               # 顶部导航（含系统菜单抽屉）
│   │   ├── index.vue           # 501 行，NDrawer + 系统菜单 + 门户按钮
│   │   ├── data.ts             # 12 个系统配置 + 9 套 Mock 菜单数据
│   │   └── index.scss          # 抽屉暗色主题 + 星标动画
│   │
│   └── C_Favorites/            # 路由收藏组件
│       ├── index.vue           # 从权限菜单递归查找收藏项
│       ├── data.ts             # FavoriteItem 接口
│       └── index.scss          # 暗色主题 + 金色星标
│
├── views/
│   ├── portal/                 # 系统门户页（登录后首页）
│   │   ├── index.vue           # 696 行，三栏布局
│   │   ├── data.ts             # 10 个系统 + 待办/外联/消息 Mock
│   │   └── index.scss          # 1125 行，CSS 变量驱动
│   │
│   └── micro-app/              # 微应用容器页
│       └── index.vue           # 370 行，PostMessage 通信
│
├── stores/favorites/           # 收藏 Store（持久化）
├── plugins/micro-app.ts        # micro-app 启动插件
├── types/micro-app.d.ts        # 类型声明
├── styles/theme-variables.scss # Portal CSS 变量（Light/Dark）
└── router/
    ├── publicRouter.ts         # /portal + /micro-app/:appId 路由
    └── permission.ts           # /portal 白名单

sys-mock/                       # 子应用 Mock 工程
└── logistics/                  # 智慧物流（示例子应用）
    ├── src/
    │   ├── main.ts             # micro-app 生命周期集成
    │   ├── microApp.ts         # 主应用数据监听
    │   ├── router/index.ts     # 嵌套路由 + 403 页面
    │   ├── stores/app.ts       # 主应用数据 Store
    │   └── views/              # 4 个业务页面
    ├── package.json            # 独立依赖（Vue/Naive UI/Pinia）
    └── vite.config.ts          # 端口 3003 + CORS 配置
```

---

## 三、核心模块详解

### 3.1 子应用配置表 — `microApps.ts`

```typescript
// src/config/microApps.ts
export const MICRO_APPS: Record<string, MicroAppConfig> = {
  logistics: {
    id: 'logistics',
    name: '智慧物流管理系统',
    dev: 'http://localhost:3003',
    test: 'https://logistics-test.example.com',
    prod: 'https://logistics.example.com',
    icon: '🚚',
    description: '物流运输、仓储管理、车辆调度',
  },
  // 添加更多子应用...
}

// 根据环境自动获取地址
getMicroAppUrl('logistics') // 开发环境返回 http://localhost:3003
getMicroAppUrl('logistics', 'production') // 返回 https://logistics.example.com
```

### 3.2 微应用容器 — `micro-app/index.vue`

核心功能：
- 从路由参数 `:appId` 获取子应用 ID
- 通过 `getMicroAppUrl()` 获取子应用地址
- 通过 `appData` computed 向子应用注入数据
- 使用 PostMessage 监听子应用事件
- 主题变化时实时推送到子应用

```vue
<micro-app
  v-if="appUrl"
  :name="appId"
  :url="appUrl"
  :data="appData"
  iframe
  keep-alive
  @mounted="handleMounted"
  @unmount="handleUnmount"
  @error="handleError"
  @datachange="handleDataChange"
/>
```

### 3.3 门户页 — `portal/index.vue`

三栏布局：

| 左栏 | 中栏 | 右栏 |
|------|------|------|
| 用户信息卡片 | 微应用数据推送区 | 天气卡片（wttr.in API） |
| 待办事项列表 | 功能快捷入口（10 系统） | 日历组件 |
| 外部链接入口 | 系统消息中心 | — |

### 3.4 系统菜单抽屉 — `C_Header`

从左侧滑出的 `NDrawer`（宽度 1200px），暗色主题：
- 搜索框实时过滤系统
- 12 个系统卡片，点击展开三级菜单
- 右上角收藏夹按钮（C_Favorites）
- 收藏夹数据持久化到 localStorage

### 3.5 启动流程

```
main.ts bootstrap()
  │
  ├─ setupLoading()              # 首屏动画
  ├─ setupMicroApp()             # micro-app.start() ← 在 createApp 前
  ├─ createApp(App)
  ├─ setupStore(app)             # Pinia + persist
  ├─ setupRequestCore(app)       # Axios
  ├─ setupLayoutSystem(app)      # 布局系统
  ├─ setupNaiveUI(app)
  ├─ setupDirectives(app)
  ├─ router.isReady()
  └─ app.mount('#app')
```

---

## 四、主子应用通信

### 4.1 通信架构

```
主应用 ──── data 属性绑定 ──────→ 子应用
  │                                 │
  │    PostMessage (6 种消息类型)     │
  ←─────────────────────────────────┘
  │
  └──── watch(isDark) ── setData ──→ 子应用主题同步
```

### 4.2 data 属性绑定（主 → 子）

主应用通过 `appData` computed 向子应用注入：

```typescript
const appData = computed(() => ({
  // 用户信息
  user: { token, username, roles },

  // 路由信息
  router: { basePath: `/micro-app/${appId}`, currentPath: route.path },

  // 环境信息
  env: { mode: import.meta.env.MODE, baseUrl, apiUrl },

  // 主题
  theme: { isDark: themeStore.isDark },

  // 工具函数
  utils: { formatTime },

  // 全局方法
  methods: { showMessage, showDialog, navigateTo },
}))
```

### 4.3 PostMessage 消息类型

| 消息类型 | 方向 | 用途 |
|---------|------|------|
| `MICRO_APP_NAVIGATE` | 子→主 | 子应用请求主应用路由跳转 |
| `CUSTOM_MESSAGE` | 子→主 | 自定义业务消息 |
| `DATA_UPDATE` | 子→主 | 子应用推送数据到门户页 |
| `MOUNTED` | 子→主 | 子应用挂载完成通知 |
| `ROUTE_CHANGE` | 子→主 | 子应用路由变化通知 |
| 主题同步 | 主→子 | `microApp.setData()` 推送暗色模式 |

### 4.4 子应用接收数据（logistics 示例）

```typescript
// sys-mock/logistics/src/microApp.ts
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.microApp?.addDataListener((data) => {
    appStore.setMainAppData(data)
    // 主题同步
    if (data.theme?.isDark !== undefined) {
      document.documentElement.classList.toggle('dark', data.theme.isDark)
    }
  })
}
```

---

## 五、本地开发与调试

### 5.1 快速启动

```bash
# 1. 启动主应用
cd Robot_Admin
bun install
bun run dev          # http://localhost:1988

# 2. 启动子应用（新终端）
cd sys-mock/logistics
bun install
bun run dev          # http://localhost:3003
```

### 5.2 多应用同时调试

当有多个子应用时，使用 **并行启动脚本**：

```bash
# 方式一：多终端手动启动
# 终端 1
bun run dev                              # 主应用 :1988

# 终端 2
cd sys-mock/logistics && bun run dev     # 物流 :3003

# 终端 3
cd sys-mock/warehouse && bun run dev     # 仓储 :3004

# 终端 4
cd sys-mock/analytics && bun run dev     # 分析 :3005
```

```bash
# 方式二：使用 concurrently 并行启动（推荐）
# 在根 package.json 中添加：
# "dev:micro": "concurrently \"bun run dev\" \"cd sys-mock/logistics && bun run dev\" \"cd sys-mock/warehouse && bun run dev\""
bun run dev:micro
```

### 5.3 跨端口 CORS 配置

子应用 `vite.config.ts` 必须配置：

```typescript
server: {
  port: 3003,
  headers: {
    'Access-Control-Allow-Origin': '*',  // 允许主应用跨域加载
  },
  cors: true,
}
```

主应用 `viteServerConfig.ts` 已配置 `host: 'localhost'`，确保主子应用同域名。

### 5.4 调试技巧

| 场景 | 方法 |
|------|------|
| 查看子应用数据 | 浏览器控制台：`document.querySelector('micro-app[name=logistics]').getData()` |
| 主应用推送数据 | 控制台：`microApp.setData('logistics', { test: 1 })` |
| 检查 PostMessage | DevTools → Sources → Event Listener Breakpoints → message |
| 子应用独立调试 | 直接访问 `http://localhost:3003`（无沙箱环境） |
| 子应用嵌入调试 | 访问 `http://localhost:1988/micro-app/logistics` |
| 主题同步测试 | 主应用切换 Dark Mode，观察子应用是否跟随 |

### 5.5 自有应用调试（所有应用都是自己写的）

当所有子应用都是自己的项目时：

1. **使用 Bun Workspace**：将子应用放入 `sys-mock/` 并配置 workspace
2. **共享类型定义**：在主应用 `src/types/micro-app.d.ts` 中定义通信接口，子应用引用
3. **统一 TSConfig**：子应用继承主应用的 `tsconfig.json` 基础配置
4. **Source Map 联调**：子应用开启 `sourcemap: true`，主应用 DevTools 可直接跳转

```bash
# 推荐目录结构
Robot_Admin/
├── src/                    # 主应用
├── sys-mock/
│   ├── logistics/          # 自有子应用 A
│   ├── warehouse/          # 自有子应用 B
│   └── shared/             # 共享代码（类型/工具/API）
│       ├── types.ts        # 通信数据接口
│       └── utils.ts        # 共享工具函数
```

### 5.6 与他人协作调试（子应用是别人写的）

当子应用由其他团队开发时：

1. **约定通信协议**：明确 `appData` 结构和 PostMessage 消息格式
2. **Mock 子应用**：在 `sys-mock/` 下创建对方应用的 Mock 版本
3. **联调环境**：使用 `.env.local` 覆盖子应用地址

```bash
# .env.local（不提交 Git）
VITE_MICRO_APP_PARTNER_DEV=http://192.168.1.100:3006
```

```typescript
// microApps.ts 中从环境变量读取
partner: {
  id: 'partner',
  name: '合作方系统',
  dev: import.meta.env.VITE_MICRO_APP_PARTNER_DEV || 'http://localhost:3006',
}
```

4. **接口对接清单**（提供给协作方）：
   - 主应用注入的 `appData` 完整结构和类型定义
   - PostMessage 消息类型和 payload 格式
   - 主题同步：监听 `data.theme.isDark` 变化
   - 路由约束：子应用内部路由需以 `basePath` 为前缀

---

## 六、新增子应用指南

### 6.1 三步接入

**Step 1：注册子应用**

```typescript
// src/config/microApps.ts
export const MICRO_APPS = {
  // ...已有应用
  warehouse: {
    id: 'warehouse',
    name: '智能仓储系统',
    dev: 'http://localhost:3004',
    test: 'https://warehouse-test.example.com',
    prod: 'https://warehouse.example.com',
    icon: '📦',
    description: '仓库管理、库存盘点、出入库',
  },
}
```

**Step 2：更新系统配置**

```typescript
// src/components/global/C_Header/data.ts — systemList 数组添加
{ id: 'warehouse', name: '智能仓储系统', icon: 'ri:archive-line', ... }

// src/config/systemTitles.ts — 标题映射添加
'/micro-app/warehouse': { main: '智能仓储', subtitle: '库存管理 · 出入库' }

// src/views/portal/data.ts — 门户系统列表添加
{ id: 'warehouse', name: '智能仓储', icon: 'ri:archive-line', ... }
```

**Step 3：创建子应用工程**

```bash
# 复制 logistics 模板
cp -r sys-mock/logistics sys-mock/warehouse

# 修改配置
# package.json: name, port 改为 3004
# vite.config.ts: port 改为 3004
# router: 修改路由配置
# views: 替换业务页面

# 启动开发
cd sys-mock/warehouse && bun install && bun run dev
```

### 6.2 子应用最低要求

子应用只需满足：

1. **Web 服务器**：能通过 HTTP 访问（任何技术栈）
2. **CORS 配置**：响应头 `Access-Control-Allow-Origin: *`
3. **入口 HTML**：标准的 `index.html`

不需要：
- ❌ 不需要暴露 `bootstrap/mount/unmount` 生命周期
- ❌ 不需要使用特定的打包工具
- ❌ 不需要安装任何微前端 SDK

### 6.3 可选增强（推荐）

如果需要与主应用深度通信：

```typescript
// 子应用监听主应用数据
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.microApp?.addDataListener((data) => {
    console.log('收到主应用数据:', data)
  })
}

// 子应用向主应用发送消息
window.parent?.postMessage({
  type: 'CUSTOM_MESSAGE',
  payload: { action: 'refreshDashboard' },
}, '*')
```

---

## 七、团队协作模式

### 7.1 独立开发模式

```
             ┌── 主应用团队 ── Robot Admin（门户 + 容器）
             │
项目组 ──────┼── 团队 A ────── 物流子应用（独立仓库/独立部署）
             │
             └── 团队 B ────── 仓储子应用（独立仓库/独立部署）
```

**协作约定**：
1. 主应用团队提供《子应用接入规范》文档（本文 Section 6）
2. 主应用团队提供 `shared/types.ts` 通信接口类型定义
3. 子应用团队独立开发、独立测试、独立部署
4. 联调时使用 `.env.local` 配置对方的开发地址

### 7.2 Monorepo 统一管理模式

```
Robot_Admin/
├── apps/
│   └── admin-internal/    # 主应用
├── sys-mock/
│   ├── logistics/         # 子应用 A
│   └── warehouse/         # 子应用 B
└── packages/
    └── micro-shared/      # 共享包（类型/工具/API）
```

统一命令：

```bash
# 全部启动
bun run dev:micro

# 单独构建子应用
cd sys-mock/logistics && bun run build

# 全部构建
bun run build:all
```

---

## 八、部署方案

### 8.1 独立部署（推荐）

```
主应用: https://admin.example.com
物流:   https://logistics.example.com
仓储:   https://warehouse.example.com
```

子应用 `vite.config.ts` 配置：

```typescript
export default defineConfig({
  base: 'https://logistics.example.com/', // 绝对路径，避免资源 404
  server: {
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
})
```

`.env.example` 中按环境配置子应用地址：

```env
VITE_MICRO_APP_LOGISTICS_PROD=https://logistics.example.com
VITE_MICRO_APP_WAREHOUSE_PROD=https://warehouse.example.com
```

### 8.2 同域部署

```
https://admin.example.com/           # 主应用
https://admin.example.com/logistics/ # 物流子应用
https://admin.example.com/warehouse/ # 仓储子应用
```

子应用 base 配置为子路径：`base: '/logistics/'`

---

## 九、常见问题

### Q1：子应用静态资源 404

**原因**：子应用的 CSS/图片使用了相对路径，被主应用的 URL 解析拦截。
**解决**：子应用 `vite.config.ts` 设置 `base` 为子应用完整 URL。

### Q2：子应用 HMR 热更新不生效

**原因**：micro-app 沙箱拦截了 WebSocket 连接。
**解决**：`micro-app.start({ 'disable-patch-request': false })`，已默认配置。

### Q3：ESLint 报 `<micro-app>` 组件名错误

**原因**：ESLint vue/component-name-in-template-casing 要求 PascalCase。
**解决**：在 `<micro-app>` 标签上方添加 `<!-- eslint-disable-next-line vue/component-name-in-template-casing -->`。

### Q4：子应用全局变量污染主应用

**原因**：with 沙箱对 `var` 声明的全局变量无法拦截。
**解决**：使用 `iframe` 沙箱模式（已配置为默认）。

### Q5：子应用路由跳转不生效

**原因**：iframe 沙箱中 `history` 是隔离的。
**解决**：通过 PostMessage 通知主应用跳转：`{ type: 'MICRO_APP_NAVIGATE', payload: { path } }`。

---

## 十、扩展路线图

### 当前已实现 ✅

- [x] micro-app 主应用启动与配置
- [x] 门户工作台（三栏布局 + 天气/日历/消息）
- [x] 系统菜单抽屉（12 个系统 + 搜索 + 三级菜单）
- [x] 微应用容器（PostMessage + 主题同步 + keep-alive）
- [x] 路由收藏夹（持久化 + 暗色主题）
- [x] 子应用 Mock 工程（logistics 示例）
- [x] 登录后跳转门户页
- [x] 路由守卫适配（白名单 + 动态路由排除）
- [x] CSS 变量主题（Light/Dark 双色）

### Phase 2：通信增强（短期）

- [ ] `microApp.preFetch()` 子应用预加载
- [ ] `microApp.setGlobalData()` 全局数据广播
- [ ] 子应用错误边界捕获 + 降级 UI
- [ ] 共享依赖 externals（Vue / Naive UI / Pinia 去重）

### Phase 3：治理能力（中期）

- [ ] 子应用动态注册/卸载（后端配置驱动）
- [ ] 子应用健康检查（心跳探测 + 超时重试）
- [ ] 子应用版本管理（灰度发布、AB Testing）
- [ ] 统一日志收集（主应用聚合子应用 console）

### Phase 4：规模化（长期）

- [ ] 子应用 CI/CD 独立流水线模板
- [ ] 微前端性能监控 Dashboard
- [ ] 子应用权限 RBAC（按角色分配可见子应用）
- [ ] 多语言同步（主应用 i18n → 子应用）

---

> 方案对比分析详见 [MICRO_APP_BEST_PRACTICES.md](./MICRO_APP_BEST_PRACTICES.md)
