# Robot Admin 模块联邦实施指南

> **版本**: v3.0.0 | **更新**: 2025-12-26 | **架构**: 独立项目双向模块联邦

---

## ⚠️ 关键配置检查清单

在开始前，请确保以下配置正确：

### 1. Router Mode 配置 (必须)

在 `envs/.env` 文件中配置路由模式，否则生产构建后会白屏:

```env
# router mode (hash | history)
VITE_ROUTER_MODE = hash
```

**说明:**

- `hash` 模式: 推荐，路径带 `#` (如 `http://localhost:4173/#/login`)
- `history` 模式: 需要服务器配置，否则刷新会 404

### 2. Federation 开发模式限制

- **Remote 端 (本项目)**: ❌ 不能用 `bun run dev`，必须 `bun run build`
- **Host 端 (消费方)**: ✅ 可以用 `bun run dev`

---

## 📋 目录

- [一、正确理解](#一正确理解) - ⚠️ 不是 Monorepo！
- [二、架构设计](#二架构设计) - 双向联邦模式
- [三、立即开始](#三立即开始) - 配置和测试
- [四、使用示例](#四使用示例) - 如何使用
- [五、常见问题](#五常见问题) - 问题速查

---

## 一、正确理解

### ⚠️ 重要：这不是 Monorepo！

```
❌ 错误理解：在一个仓库里拆分多个应用
Robot_Admin/
  └── apps/
      ├── host-app/
      ├── remote-components/
      └── remote-business/

✅ 正确理解：多个独立项目互相引用
项目A: Robot_Admin (独立仓库 http://localhost:5173)
项目B: 其他管理系统 (独立仓库 http://other.com)
项目C: 组件库项目 (独立仓库 http://components.com)

运行时通过 Module Federation 互相引用
```

### 🎯 实际场景

```
Robot_Admin (当前项目)
  ├── 作为 Remote：暴露组件给其他项目
  │   └── 暴露 C_Table、C_Form 等 30+ 组件
  │
  └── 作为 Host：消费其他项目的组件/模块
      └── 例如：引用其他项目的数据分析模块

未来的项目B (独立仓库)
  ├── 作为 Host：消费 Robot_Admin 的组件
  └── 作为 Remote：暴露模块给 Robot_Admin
```

---

## 二、架构设计

### 双向模块联邦配置

```typescript
// vite.config.ts - Robot Admin 配置
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    // ...其他插件
    federation({
      name: 'robotAdmin',
      filename: 'remoteEntry.js',

      // 🔵 作为 Remote：暴露给其他项目
      exposes: {
        './Table': './src/components/global/C_Table/index.vue',
        './Form': './src/components/global/C_Form/index.vue',
        './Tree': './src/components/global/C_Tree/index.vue',
        './Icon': './src/components/global/C_Icon/index.vue',
        './Dialog': './src/components/global/C_Dialog/index.vue',
      },

      // 🟢 作为 Host：引用其他项目（未来添加）
      remotes: {
        // 例如：otherApp: 'http://other-app.com/assets/remoteEntry.js'
      },

      // 共享依赖
      shared: ['vue', 'pinia', 'vue-router', '@vueuse/core'],
    }),
  ],

  server: {
    host: '0.0.0.0', // ⚠️ 必须
    cors: true, // ⚠️ 必须
  },

  build: {
    target: 'esnext', // ⚠️ 支持 top-level await
  },
})
```

### 推荐暴露的组件

**第一批：核心组件**

- `./Table` - C_Table
- `./Form` - C_Form
- `./Tree` - C_Tree
- `./Icon` - C_Icon
- `./Dialog` - C_Dialog

**第二批：扩展组件**（可选）

- `./Upload` - C_Upload
- `./Search` - C_Search
- `./Pagination` - C_Pagination

---

## 三、立即开始

### 🚀 开发模式（重要）

**⚠️ originjs 开发模式限制：**

- ✅ **Host 端**：可以使用 `bun run dev` 开发模式
- ❌ **Remote 端**：必须使用 `bun run build` 构建模式
- 💡 **最佳实践**：Remote 端使用 `bun run build --watch` 实现热更新

```bash
# Remote 端（Robot Admin）- 使用 watch 模式
cd D:/project/Robot_Admin
bun run build --watch  # 文件变化时自动重新构建

# Host 端（其他项目）- 使用 dev 模式
cd your-other-project
bun run dev  # 正常开发模式
```

### Step 1: 修改 vite.config.ts

```typescript
// d:/project/Robot_Admin/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// 保留原有导入
import {
  viteConsolePlugin,
  viteAutoImportPlugin,
  viteComponentsPlugin,
  resolveConfig,
  serverConfig,
  buildConfig,
  createI18nPlugin,
  createVuePluginOptions,
} from './src/config/vite'

export default defineConfig({
  plugins: [
    viteConsolePlugin,
    vue(createVuePluginOptions()),
    viteAutoImportPlugin,
    viteComponentsPlugin,
    createI18nPlugin(),

    // 🆕 添加 Module Federation
    federation({
      name: 'robotAdmin',
      filename: 'remoteEntry.js',

      exposes: {
        './Table': './src/components/global/C_Table/index.vue',
        './Form': './src/components/global/C_Form/index.vue',
        './Tree': './src/components/global/C_Tree/index.vue',
        './Icon': './src/components/global/C_Icon/index.vue',
        './Dialog': './src/components/global/C_Dialog/index.vue',
      },

      remotes: {
        // 未来对接其他项目时添加
      },

      shared: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
    }),
  ],

  resolve: resolveConfig,

  server: {
    ...serverConfig,
    host: '0.0.0.0', // ⚠️ 新增：允许外部访问
    cors: true, // ⚠️ 新增：跨域支持
  },

  build: {
    ...buildConfig,
    target: 'esnext', // ⚠️ 新增：支持 top-level await
  },
})
```

### Step 2: 测试验证

```bash
# 启动项目
bun run dev

# 测试 remoteEntry.js（应该返回 JS 文件，不是 404）
curl http://localhost:5173/assets/remoteEntry.js

# 或浏览器访问：
open http://localhost:5173/assets/remoteEntry.js
```

### Step 3: 构建测试

```bash
# 构建
bun run build

# 检查产物
ls -la dist/assets/remoteEntry.js

# 预览
bun run preview
```

---

## 四、使用示例

### 场景1：其他项目引用 Robot Admin 的组件

```typescript
// 其他项目的 vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'otherApp',
      remotes: {
        robotAdmin: 'http://robot-admin.com/assets/remoteEntry.js',
      },
      shared: ['vue', 'pinia', 'vue-router', '@vueuse/core'],
    }),
  ],
  build: {
    target: 'esnext',
  },
})
```

```vue
<!-- 其他项目中使用 -->
<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'

  const RemoteTable = defineAsyncComponent(() => import('robotAdmin/Table'))

  const RemoteForm = defineAsyncComponent(() => import('robotAdmin/Form'))
</script>

<template>
  <div>
    <Suspense>
      <RemoteTable
        :data="[]"
        :columns="[]"
      />
    </Suspense>

    <Suspense>
      <RemoteForm :config="formConfig" />
    </Suspense>
  </div>
</template>
```

### 场景2：Robot Admin 引用其他项目的模块

```typescript
// Robot Admin 的 vite.config.ts 添加 remotes
federation({
  name: 'robotAdmin',
  exposes: { /* 暴露的组件 */ },

  // 🆕 引用其他项目
  remotes: {
    dataAnalysis: 'http://data.com/assets/remoteEntry.js',
    reportSystem: 'http://report.com/assets/remoteEntry.js',
  },

  shared: ['vue', 'pinia', 'vue-router', '@vueuse/core'],
}),
```

```vue
<!-- Robot Admin 中使用 -->
<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'

  const RemoteChart = defineAsyncComponent(() => import('dataAnalysis/Chart'))
</script>

<template>
  <Suspense>
    <RemoteChart :data="chartData" />
  </Suspense>
</template>
```

---

## 五、常见问题

### Q1: remoteEntry.js 404

**现象**：

```
GET http://localhost:5173/remoteEntry.js 404
```

**原因**：originjs 构建后路径是 `/assets/remoteEntry.js`

**解决**：

```typescript
// ✅ 正确
remotes: {
  robotAdmin: 'http://localhost:5173/assets/remoteEntry.js'
}

// ❌ 错误
remotes: {
  robotAdmin: 'http://localhost:5173/remoteEntry.js'
}
```

### Q2: CORS 错误

**现象**：

```
Access to fetch at '...' has been blocked by CORS
```

**解决**：

```typescript
// vite.config.ts
server: {
  host: '0.0.0.0', // 必须
  cors: true,      // 必须
}
```

### Q3: TypeScript 类型错误

**现象**：

```
Cannot find module 'robotAdmin/Table'
```

**解决**：添加类型声明

```typescript
// src/types/remote-modules.d.ts
declare module 'robotAdmin/*' {
  const component: any
  export default component
}
```

### Q4: 样式丢失

**解决**：

```typescript
// vite.config.ts
build: {
  cssCodeSplit: false, // 关键
}
```

---

## 六、部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name robot-admin.yourdomain.com;

    location / {
        root /var/www/robot-admin/dist;
        try_files $uri $uri/ /index.html;

        # ⚠️ 必须：CORS 支持
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type';
    }
}
```

---

## 七、检查清单

### ✅ 配置阶段

- [ ] originjs 插件已安装
- [ ] vite.config.ts 添加 federation 配置
- [ ] exposes 配置5个组件
- [ ] server.host = '0.0.0.0'
- [ ] server.cors = true
- [ ] build.target = 'esnext'

### ✅ 测试阶段

- [ ] bun run dev 启动成功
- [ ] 访问 /assets/remoteEntry.js 返回 JS 文件
- [ ] 无控制台错误

### ✅ 构建阶段

- [ ] bun run build 成功
- [ ] dist/assets/remoteEntry.js 存在
- [ ] bun run preview 正常

---

## 八、快速命令

```bash
# 开发
bun run dev
curl http://localhost:5173/assets/remoteEntry.js

# 构建
bun run build
ls dist/assets/remoteEntry.js

# 预览
bun run preview
```

---

**🎯 现在开始修改 vite.config.ts！**
