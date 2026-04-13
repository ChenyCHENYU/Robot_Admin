# Robot Admin MCP — 使用指南

> MCP（Model Context Protocol）是 AI 工具与项目运行时数据之间的通信协议。
> 简单说：**让 AI 不再靠猜，而是直接查你的项目**。

---

## 一、什么是 MCP，它解决了什么问题

### 没有 MCP 时

```
你：帮我用 C_Form 写一个表单
AI：（根据训练数据猜）用 :options 传字段、:model 绑数据……
你：不对，我们的 C_Form 是用 :config 的，不是这样
AI：好的，不好意思……（下次还会犯）
```

### 有 MCP 后

```
你：帮我用 C_Form 写一个表单
AI：（调用 get_component_api('C_Form')，读到真实 .d.ts 类型声明）
AI：好的，根据类型定义，C_Form 的 Props 是 options + config，
    config.layout 支持 default|grid|card|tabs|steps|dynamic……
    （100% 准确，永远不会猜错）
```

**核心价值：AI 工具从"根据记忆猜 API"变成"实时查当前项目的精确 API"。**

---

## 二、本项目提供的 5 个工具

| 工具名               | 查询内容                                       | 推荐使用时机                      |
| -------------------- | ---------------------------------------------- | --------------------------------- |
| `list_components`    | 列出全部 51+ 个 C\_ 组件名                     | 不确定某个组件是否存在时          |
| `get_component_api`  | 获取指定组件的 Props/Emits/类型定义            | **每次使用 C\_ 组件前必查**       |
| `list_routes`        | 列出所有已注册路由的 path/name/title           | 注册路由或做 `router.push` 跳转前 |
| `list_api_endpoints` | 列出 `src/api/` 所有已有 API 函数              | 写接口前确认函数名是否已存在      |
| `get_preset_rules`   | 获取 `@robot-admin/form-validate` 所有验证规则 | 编写 `FORM_RULES` 前              |

---

## 三、启动方式

### 方式 A：VS Code 自动启动（推荐）

项目已内置 `.vscode/mcp.json` 配置，**安装 GitHub Copilot Chat 扩展后自动生效**，
无需手动启动，打开 Copilot Chat 对话框即可使用。

> 前提：已安装 `github.copilot-chat` 扩展（`extensions.json` 已推荐，克隆项目后 VS Code 会提示安装）

### 方式 B：手动启动（供 Claude Code / Cursor / Windsurf 等工具使用）

```bash
bun run mcp
# 等价于：bun run mcp/server.ts
```

启动后输出 stdio，供 AI 工具通过 MCP 协议通信。

### 不同 AI 工具的接入方式

| 工具               | 配置方式                                              |
| ------------------ | ----------------------------------------------------- |
| **GitHub Copilot** | `.vscode/mcp.json` 自动识别（已配置）                 |
| **Claude Code**    | `claude mcp add robot-admin -- bun run mcp/server.ts` |
| **Cursor**         | Settings → MCP → 添加 stdio server                    |
| **Windsurf**       | `~/.codeium/windsurf/mcp_config.json` 中添加          |

---

## 四、典型使用场景

### 场景 1：新增业务页面（最高频）

```
你：帮我建一个"供应商管理"页面，LIST 模式，字段有名称、编码、联系人、手机、状态

AI 内部执行顺序：
  ① list_components              → 确认 C_Table / C_Form / C_ActionBar 存在
  ② get_component_api('C_Table') → 查 columns / config Props 定义
  ③ get_component_api('C_Form')  → 查 options / config Props 定义
  ④ get_preset_rules             → 查手机号验证规则名称
  ⑤ list_routes                  → 确认 /sys/supplier 没有冲突
  ⑥ list_api_endpoints           → 确认 supplierApi 尚未存在

结果：直接生成完全符合项目规范的 index.vue + data.ts + src/api/supplier.ts
      零猜测，一次成功
```

### 场景 2：路由注册防冲突

```
你：帮我给新页面注册路由

AI：（先调 list_routes）
    当前 /sys 模块下已有：sys-user, sys-role, sys-permission, sys-dept
    你的新路由 name 建议用 sys-supplier，避免与以上冲突
```

### 场景 3：表单验证规则查询

```
你：这个字段是中国身份证号，帮我加验证规则

AI：（调 get_preset_rules，找到 idCard 规则）
    PRESET_RULES.idCard('身份证号')
    不需要自己写正则，项目里已经有了
```

### 场景 4：检查 API 函数是否已存在

```
你：需要调用"获取角色列表"接口

AI：（调 list_api_endpoints）
    src/api/permission-manage.ts 中已有 getRoleListApi，直接使用即可
    不要重复创建
```

---

## 五、数据来源说明

MCP Server 读取的是**本地实时文件**，不依赖网络，不需要构建：

| 工具                 | 读取的文件                                                            |
| -------------------- | --------------------------------------------------------------------- |
| `list_components`    | `node_modules/@robot-admin/naive-ui-components/dist/*.d.ts`           |
| `get_component_api`  | `node_modules/@robot-admin/naive-ui-components/dist/<Component>.d.ts` |
| `list_routes`        | `src/assets/data/dynamicRouter.json`                                  |
| `list_api_endpoints` | `src/api/*.ts`（扫描 `export const` 语句）                            |
| `get_preset_rules`   | `node_modules/@robot-admin/form-validate/dist/index.d.ts`             |

**重要：**

- 组件库更新后（`bun install` 或 `bun run dev:components`），`get_component_api` 会即时反映新版本
- 路由文件变更后，`list_routes` 立刻生效，无需重启 Server
- Server **不修改任何文件**，只读，没有副作用

---

## 六、注意事项

### ✅ 应该这样用

- 让 AI 在生成代码**之前**自动调用相关工具（Copilot Chat 会自动决策）
- 明确告知 AI"使用 MCP 查一下"，可以提高工具调用频率
- 在 AGENTS.md 中已经说明了何时调用哪个工具，大部分情况下 AI 会自动触发

### ❌ 不要这样用

- **不要手动运行 `bun run mcp` 然后等待输出** — MCP 是 stdio 协议，不是交互式 CLI
- **不要在 MCP Server 里加业务逻辑** — Server 应保持纯查询功能，不做修改操作
- **Server 挂了不影响正常开发** — MCP 只是 AI 辅助，不是必要依赖

### 组件库版本更新时

如果 `@robot-admin/naive-ui-components` 升级了新版本，执行 `bun install` 后，
`get_component_api` 查到的就是新版类型，不需要任何额外操作。

---

## 七、扩展 MCP 工具

若需新增工具（如查主题 tokens、查权限点列表），在 `mcp/server.ts` 中：

1. 实现工具函数（纯读取，不修改文件）
2. 在 `ListToolsRequestSchema` handler 中声明工具元数据
3. 在 `CallToolRequestSchema` handler 的 `switch` 中添加 case

参考现有 5 个工具的实现模式即可，结构高度一致。

---

> Server 源码：[mcp/server.ts](./server.ts) · 协议规范：[MCP Spec](https://modelcontextprotocol.io)
