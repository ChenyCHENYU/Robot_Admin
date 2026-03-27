# Module Federation 最佳实践与迭代优化建议

> **适用版本**: @module-federation/vite v1.13.5 + Vite 8.0.2 + Vue 3.5.13  
> **分支**: `module-federation`

---

## 目录

- [架构设计最佳实践](#一-架构设计最佳实践)
- [开发阶段最佳实践](#二-开发阶段最佳实践)
- [构建与部署最佳实践](#三-构建与部署最佳实践)
- [性能优化最佳实践](#四-性能优化最佳实践)
- [常见陷阱与规避策略](#五-常见陷阱与规避策略)
- [迭代优化建议](#六-迭代优化建议)

---

## 一、架构设计最佳实践

### 1.1 Remote/Host 角色划分

**原则：** 将稳定的、被广泛复用的模块放在 Remote 端；将业务变化频繁的页面放在 Host 端。

```
✅ 推荐                              ❌ 不推荐
─────────────────────                ─────────────────────
Remote (robotAdmin):                 Remote:
  - 通用组件 (Table/Form/Icon)         - 业务页面
  - 基础设施 (布局/主题)                - 频繁变化的业务逻辑
  - 工具函数                           - 特定子应用的组件

Host (sub-apps):                     Host:
  - 业务页面                           - 基础 UI 组件
  - 领域逻辑                           - 通用工具函数
```

**Robot Admin 的做法：** 主应用暴露 5 个核心组件（Table / Form / Tree / Icon / Editor），全部从 `@robot-admin/naive-ui-components` npm 包统一导出。这样做的好处：
- 暴露文件仅一行代码，零维护成本
- npm 包版本管理保证一致性
- 子应用也可以直接安装 npm 包作为降级方案

### 1.2 federation/shared/ 共享层设计

```
federation/shared/
├── types.ts             # 跨应用公共类型
├── constants.ts         # 联邦常量注册表
└── utils.ts             # 工具函数
```

**设计要点：**
- 只放**真正需要跨应用共享**的内容，不要把所有类型都堆进来
- 常量注册表是关键：`MF_APP_NAMES`、`MF_EXPOSED_MODULES`、`MF_DEV_PORTS` 让子应用不需要硬编码
- 工具函数如 `buildRemoteEntry()` 根据环境自动切换开发/生产地址

### 1.3 暴露粒度控制

**原则：** 暴露组件而非页面，暴露接口而非实现。

```typescript
// ✅ 好：暴露独立组件
exposes: {
  './Table': './federation/exposes/Table.ts',
  './Form':  './federation/exposes/Form.ts',
}

// ❌ 不好：暴露整个页面
exposes: {
  './UserManagePage': './src/views/sys-manage/user-manage/index.vue',
}

// ❌ 不好：暴露内部实现细节
exposes: {
  './stores/user': './src/stores/user/index.ts',
}
```

---

## 二、开发阶段最佳实践

### 2.1 类型安全

在子应用中创建类型声明文件，避免 `import('robotAdmin/Table')` 报类型错误：

```typescript
// sub-apps/logistics/src/types/federation.d.ts
declare module 'robotAdmin/Table' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}
```

**进阶方案（规划中）：** 使用 `federation({ dts: { generateTypes: true } })` 自动生成远程模块类型。

### 2.2 远程组件按需加载

```typescript
// ✅ 推荐：动态 import + 并行加载
onMounted(async () => {
  const [tableMod, iconMod] = await Promise.all([
    import('robotAdmin/Table'),
    import('robotAdmin/Icon'),
  ])
  RemoteTable.value = tableMod.default
  RemoteIcon.value = iconMod.default
})

// ❌ 不推荐：顶层静态 import（会阻塞页面渲染）
import Table from 'robotAdmin/Table'
```

### 2.3 组件加载状态处理

```vue
<template>
  <n-spin v-if="loading" />
  <n-result v-else-if="error" status="error" title="组件加载失败" />
  <component v-else :is="RemoteTable" :data="data" :columns="columns" />
</template>

<script setup lang="ts">
const RemoteTable = ref(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const mod = await import('robotAdmin/Table')
    RemoteTable.value = mod.default
  } catch (e) {
    error.value = true
    console.error('[MF] Table 加载失败:', e)
  } finally {
    loading.value = false
  }
})
</script>
```

### 2.4 MfRemoteContainer 使用规范

所有远程组件都应包裹在 `MfRemoteContainer` 中，确保 CSS 隔离和主题继承：

```vue
<template>
  <MfRemoteContainer>
    <component :is="RemoteForm" v-bind="formProps" />
  </MfRemoteContainer>
</template>
```

**注意：** 不要嵌套多层 `MfRemoteContainer`，一个容器包裹一组相关的远程组件即可。

### 2.5 开发环境调试技巧

```bash
# 方法 1：一键启动所有应用
bun run dev:all

# 方法 2：分终端启动（方便单独重启）
# 终端 1：主应用
bun dev
# 终端 2：子应用
cd sub-apps/logistics && bun dev

# 方法 3：只开发主应用（不需要子应用时）
bun dev
```

**调试远程加载问题：**
1. 打开浏览器 DevTools → Network 面板
2. 搜索 `remoteEntry.js`，确认 200 状态码
3. 搜索 `__federation_expose_`，查看暴露模块是否正确加载
4. 控制台查看 `[MF Runtime]` 前缀日志

---

## 三、构建与部署最佳实践

### 3.1 构建产物检查

构建后检查关键文件是否存在：

```bash
bun run build

# 检查联邦产物
ls dist/remoteEntry.js       # 联邦入口
ls dist/mf-manifest.json     # 模块清单
ls dist/assets/__federation_* # 联邦 chunk
```

### 3.2 独立部署 vs 完整部署

| 策略 | 适用场景 | 优势 | 劣势 |
|------|----------|------|------|
| **独立部署** | 团队分工明确，各自发版 | 互不阻塞，灰度方便 | 需要 CORS 配置，CDN 管理 |
| **完整部署** | 小团队，统一发版 | 部署简单，无跨域 | 一起构建一起部署 |

**独立部署 Nginx 配置参考：**

```nginx
# 主应用
server {
  listen 80;
  server_name app.example.com;

  location / {
    root /app/dist;
    try_files $uri $uri/ /index.html;
    # 联邦入口允许跨域
    location ~* (remoteEntry\.js|mf-manifest\.json) {
      add_header Access-Control-Allow-Origin *;
      add_header Cache-Control "no-cache";
    }
  }
}

# 子应用
server {
  listen 80;
  server_name logistics.example.com;

  location / {
    root /app/sub-apps/logistics/dist;
    try_files $uri $uri/ /index.html;
  }
}
```

### 3.3 版本管理策略

```bash
# remoteEntry.js 不要加 hash（子应用指向固定 URL）
# 内部 chunk 带 hash（利用浏览器缓存）
dist/
├── remoteEntry.js              # 固定文件名，no-cache
├── mf-manifest.json            # 固定文件名，no-cache
└── assets/
    ├── __federation_expose_Table-abc123.js  # 带 hash，长缓存
    └── __federation_shared_vue-def456.js    # 带 hash，长缓存
```

**关键：** `remoteEntry.js` 和 `mf-manifest.json` 设置 `Cache-Control: no-cache`，确保子应用始终获取最新版本。

---

## 四、性能优化最佳实践

### 4.1 共享依赖预构建

在 `vite.config.ts` 中预构建大型依赖，加速开发启动：

```typescript
optimizeDeps: {
  include: ['naive-ui', 'vue-router', 'pinia', '@vueuse/core', 'echarts/core'],
  // 排除 Vue 核心（避免 Rolldown 预构建拆包导致响应式断裂）
  exclude: ['vue', 'vue-demi', '@vue/shared', '@vue/runtime-core', '@vue/reactivity'],
}
```

### 4.2 远程模块预加载

在路由守卫中预加载即将使用的远程组件：

```typescript
// 路由进入前预加载
router.beforeEach(async (to) => {
  if (to.meta.remoteModules) {
    // 配置在路由 meta 中的远程模块名
    const modules = to.meta.remoteModules as string[]
    await Promise.allSettled(
      modules.map(m => import(`robotAdmin/${m}`))
    )
  }
})
```

### 4.3 Bundle 分析

```bash
# 开启构建报告
ANALYZE=true bun run build
# 在 dist/report.html 查看打包体积分布
```

### 4.4 共享依赖体积控制

保持 `shared` 列表精简：只共享**必须 singleton** 的依赖。工具库如 `lodash`、`dayjs` 不需要共享——让各应用自行打包，不会因版本差异导致问题。

```typescript
// ✅ 必须共享（singleton）
shared: {
  vue: { singleton: true },
  pinia: { singleton: true },
  'naive-ui': { singleton: true },
}

// ❌ 不需要共享
shared: {
  lodash: { singleton: true },      // 无状态，不需要 singleton
  dayjs: { singleton: true },        // 无状态，不需要 singleton
  axios: { singleton: true },         // 各自的实例互不干扰
}
```

---

## 五、常见陷阱与规避策略

### 5.1 Vue 响应式断裂

**症状：** 远程组件中的 `ref`、`reactive` 不响应，或 `watchEffect` 不触发。

**原因：** Host 和 Remote 使用了不同的 Vue 实例。

**解决方案：**
```typescript
// 确保 shared 配置中 vue 系列全部 singleton
shared: {
  vue: { singleton: true },
  'vue-router': { singleton: true },
  pinia: { singleton: true },
}

// Vite optimizeDeps 中排除 Vue 内部模块
optimizeDeps: {
  exclude: ['vue', 'vue-demi', '@vue/shared', '@vue/runtime-core', '@vue/reactivity'],
}
```

### 5.2 Naive UI 样式丢失

**症状：** 远程组件中 Naive UI 组件无样式。

**解决方案：**
1. 确保 `naive-ui` 在 `shared` 中为 `singleton: true`
2. 使用 `MfRemoteContainer` 包裹远程组件
3. 检查 `NConfigProvider` 的 `cls-prefix` 是否一致

### 5.3 开发环境端口冲突

**症状：** `EADDRINUSE` 错误。

**解决方案：** 在 `federation/shared/constants.ts` 中统一管理端口：
```typescript
export const MF_DEV_PORTS = {
  robotAdmin: 1988,
  logistics: 2001,
  // 新增子应用时在这里注册
}
```

### 5.4 循环依赖

**症状：** 控制台报 `Maximum call stack size exceeded`。

**原因：** Remote 暴露模块依赖了 Host 的 shared 模块，而 shared 模块又引用了 Remote。

**解决方案：** 暴露文件保持纯净——仅从 npm 包导出：
```typescript
// ✅ 无循环依赖风险
export { C_Table as default } from '@robot-admin/naive-ui-components'

// ❌ 可能引入循环
export { default } from '@/components/global/C_Table/index.vue'
```

### 5.5 TypeScript 类型缺失

**症状：** `import('robotAdmin/Table')` 报 `Cannot find module` 类型错误。

**解决方案：** 在子应用中创建声明文件 `src/types/federation.d.ts`（参见 README 子应用集成指南）。

---

## 六、迭代优化建议

### 6.1 短期优化（P1）

#### TypeScript dts 自动同步

当前子应用需要手动编写远程模块类型声明。`@module-federation/vite` 支持 dts 功能：

```typescript
federation({
  // ...
  dts: {
    generateTypes: {
      extractRemoteTypes: true,
      compilerInstance: 'vue-tsc',
    },
    consumeTypes: {
      extractRemoteTypes: true,
    },
  },
})
```

**收益：** 子应用自动获取远程组件的 Props 类型提示，开发体验大幅提升。

**注意事项：**
- 需要验证与 Vite 8 Rolldown 的兼容性
- dts 生成依赖 `vue-tsc`，构建时间会增加
- 建议仅在开发环境启用，CI 中生成后上传到 CDN

#### DynamicComponent 暴露

`C_Form` 组件内部依赖 `DynamicComponent` 进行动态渲染。当前子应用需要手动创建这个组件。

**优化方案：** 将 `DynamicComponent` 作为新的暴露模块，子应用只需注册即可：

```typescript
exposes: {
  // ...
  './DynamicComponent': './federation/exposes/DynamicComponent.ts',
}
```

### 6.2 中期优化（P2）

#### 暴露更多模块

当前仅暴露 5 个 UI 组件。可以扩展为：

| 模块 | 暴露路径 | 说明 |
|------|----------|------|
| useCopy | `./hooks/useCopy` | 复制功能 |
| useThemeStore | `./stores/theme` | 主题切换 |
| useUserStore | `./stores/user` | 用户认证信息 |
| setupRequestCore | `./plugins/request-core` | 请求层初始化 |

**注意：** 暴露 Store 需要谨慎——确保 Pinia singleton 共享正常，且考虑 Store 的内部依赖链。

#### 灰度发布

基于 Manifest 实现多版本并行：

```
CDN/
├── v1/
│   ├── remoteEntry.js
│   └── mf-manifest.json
├── v2/
│   ├── remoteEntry.js
│   └── mf-manifest.json
└── latest -> v2/         # 符号链接指向最新版
```

子应用通过环境变量或 A/B 实验切换版本：
```typescript
// 灰度策略
const version = shouldUseNewVersion(userId) ? 'v2' : 'v1'
const entry = `https://cdn.example.com/${version}/remoteEntry.js`
```

#### 性能监控

在 Runtime Plugin 中添加加载耗时埋点：

```typescript
const runtimePlugin = () => ({
  name: 'robot-admin-monitor',
  beforeRequest(args) {
    args.__startTime = performance.now()
    return args
  },
  afterResolve(args) {
    const duration = performance.now() - args.__startTime
    // 上报到监控平台
    reportMetrics('mf_module_load', {
      module: args.id,
      duration,
      success: true,
    })
    return args
  },
  errorLoadRemote(args) {
    reportMetrics('mf_module_load', {
      module: args.id,
      success: false,
      error: args.error?.message,
    })
    return { name: 'MFFallback', render: () => null }
  },
})
```

### 6.3 长期优化（P3）

#### 子应用脚手架

开发 CLI 工具自动生成子应用模板：

```bash
npx create-robot-sub-app my-app
# 自动生成：
# - vite.config.ts (Host 联邦配置)
# - federation.d.ts (远程模块类型)
# - App.vue (Provider + MfRemoteContainer)
# - 示例页面
```

#### 自动化集成测试

在 CI 中同时启动主应用和子应用，验证远程组件加载：

```yaml
# .github/workflows/mf-test.yml
jobs:
  integration:
    steps:
      - run: bun install
      - run: bun run build
      - run: bun run preview &
      - run: cd sub-apps/logistics && bun install && bun dev &
      - run: npx playwright test --config=tests/mf-integration.config.ts
```

#### NestJS 全栈集成

后端提供联邦模块注册 API，实现动态 Remote 发现：

```
GET /api/federation/registry
→ { remotes: [{ name: 'robotAdmin', entry: '...', modules: ['Table', 'Form', ...] }] }
```

---

## 附录：当前架构决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| MF 插件 | `@module-federation/vite` v1.13.5 | 官方团队维护，周下载 19万+，Vite 8 兼容，dev HMR |
| 暴露源 | npm 包统一导出 | 零维护、版本一致、无循环依赖 |
| CSS 隔离 | 三层策略 | 兼顾隔离性和主题继承 |
| 共享策略 | 9 个 singleton | 框架+UI+业务包，确保单例 |
| 子应用结构 | 项目内 sub-apps/ | 开发调试方便，shared 层直接引用 |
| 环境配置 | envs/ 四套文件 | 覆盖全部部署场景 |
| Runtime Plugin | 自定义三钩子 | 兜底防白屏 + 动态 URL + 日志 |
