# federation/ — 联邦集成层

> 所有 Module Federation 相关代码的集中管理层，是应用间通信、共享、集成的**唯一契约层**。

## 目录结构

```
federation/
├── index.ts                  # 统一入口
├── bridge/                   # 🌉 应用级联邦通信（Vue Bridge）
│   ├── index.ts              #    统一出口
│   ├── create-provider.ts    #    Provider 封装 — 暴露整个 Vue 应用
│   └── create-consumer.ts    #    Consumer 封装 — 加载远程 Vue 应用
├── runtime/                  # ⚡ 运行时插件
│   └── index.ts              #    错误兜底 + 日志 + 动态 URL
├── exposes/                  # 📤 模块暴露入口
│   ├── Table.ts              #    → @robot-admin/naive-ui-components
│   ├── Form.ts
│   ├── Tree.ts
│   ├── Icon.ts
│   └── Editor.ts
└── shared/                   # 🔗 跨应用共享
    ├── index.ts              #    统一出口
    ├── constants.ts           #    应用名、端口、暴露路径注册表
    ├── types.ts              #    公共类型定义
    └── utils.ts              #    buildRemoteEntry() 等工具
```

## 设计理念

### 为什么要集中管理？

Module Federation 本质上是应用间的**运行时契约**。分散在各处的联邦代码难以维护，也不利于角色转换。
将所有联邦相关代码集中到 `federation/` 下，实现：

1. **一处修改，全局生效** — 改 constants 或 runtime，所有应用自动同步
2. **易于拆分** — 需要独立仓库时，整个 `federation/` 发布为 npm 包即可
3. **职责清晰** — bridge（通信）、exposes（暴露）、runtime（运行时）、shared（共享）各司其职

### 插拔式架构

本目录同时支持两种部署模式：

**Monorepo 模式**（所有应用在同一仓库）：

```typescript
// sub-apps/logistics/vite.config.ts
alias: { '@federation': '../../federation' }
```

**Multi-repo 模式**（各应用独立仓库）：

```bash
# 将 federation/ 发布为 npm 包
npm publish --name @robot-admin/federation

# 独立仓库中安装
bun add @robot-admin/federation
```

### Bridge vs Exposes

|          | Bridge（应用级）                    | Exposes（组件级）   |
| -------- | ----------------------------------- | ------------------- |
| 暴露粒度 | 整个 Vue 应用（含路由、状态、插件） | 独立组件            |
| 使用方式 | 路由挂载                            | `import()` 加载     |
| 适用场景 | 子应用嵌入、跨系统集成              | UI 组件库共享       |
| 示例     | logistics 整个物流模块              | Table / Form / Icon |
