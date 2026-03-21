# 智慧物流管理系统 - 微前端子应用

基于 Vue 3 + Vite 的物流管理子应用，用于验证微前端通信和集成。

## 功能特性

- ✅ 完整的微前端通信机制
- ✅ 主题同步（亮色/暗色模式）
- ✅ 认证信息同步（Token、用户信息）
- ✅ 双向消息通信
- ✅ 路由跳转联动
- ✅ 公共头部样式复用
- ✅ 四个功能模块演示

## 快速开始

### 1. 安装依赖

```bash
cd sys-mock/logistics
npm install
# 或
bun install
```

### 2. 启动开发服务器

```bash
npm run dev
```

服务将运行在 `http://localhost:3003`

### 3. 独立访问

浏览器打开 `http://localhost:3003`，可以独立运行查看

### 4. 微前端集成

在主应用中访问 `http://localhost:5173/micro-app/logistics`，将在微前端容器中加载

## 微前端通信 API

### 接收主应用数据

```typescript
// 自动接收以下数据：
{
  token: string // 认证令牌
  userInfo: UserInfo // 用户信息
  theme: {
    // 主题信息
    mode: 'light' | 'dark'
    isDark: boolean
  }
}
```

### 向主应用发送消息

```typescript
import { sendMessageToMainApp } from '@/microApp'

// 发送自定义消息
sendMessageToMainApp({
  type: 'CUSTOM_MESSAGE',
  payload: {
    /* 数据 */
  },
})

// 发送数据更新
sendMessageToMainApp({
  type: 'DATA_UPDATE',
  payload: {
    /* 更新数据 */
  },
})
```

### 跳转到主应用

```typescript
import { navigateToMainApp } from '@/microApp'

// 跳转到主应用路由
navigateToMainApp('/home')
```

## 目录结构

```
logistics/
├── src/
│   ├── components/       # 组件
│   │   └── AppHeader.vue # 公共头部
│   ├── views/           # 页面
│   │   ├── Dashboard.vue # 物流仪表盘（含通信测试）
│   │   ├── Orders.vue    # 订单管理
│   │   ├── Warehouse.vue # 仓库管理
│   │   └── Vehicles.vue  # 车辆调度
│   ├── stores/          # 状态管理
│   │   └── app.ts       # 应用状态
│   ├── router/          # 路由配置
│   ├── styles/          # 样式文件
│   ├── microApp.ts      # 微前端通信核心
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 测试功能

在仪表盘页面可以测试以下功能：

1. **查看主应用传递的数据** - Token、用户信息、主题
2. **发送测试消息** - 测试子应用→主应用通信
3. **发送数据更新** - 模拟业务数据更新
4. **跳转到主应用** - 测试路由联动

## 技术栈

- Vue 3.5.13
- TypeScript 5.7
- Vite 7.0.6
- Vue Router 4.5
- Pinia 2.3
- Naive UI 2.40
- @micro-zoe/micro-app 1.0.0-rc.8
