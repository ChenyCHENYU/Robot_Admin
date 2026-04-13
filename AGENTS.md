# Robot Admin — AI Agent 指南

> 适用于：**GitHub Copilot · Claude Code · Cursor · Codex CLI · Windsurf · Cline** 等所有 AI 编码工具
>
> 完整规范 → `.github/copilot-instructions.md`
> 可用 Skills → `.github/skills/`（6 个流程化技能）
> MCP 工具 → `bun run mcp/server.ts`（组件库 / 路由 / API 实时查询）

---

## 强制约束

### 包管理器

```bash
# ✅ 唯一允许
bun install
bun run <script>

# ❌ 禁止使用
npm / yarn / pnpm
```

### 命名规范（违反则不合规）

| 类型         | 约定                       | 正确                 | 错误              |
| ------------ | -------------------------- | -------------------- | ----------------- |
| Store 导出   | `s_` + camelCase + `Store` | `s_userStore`        | `useUserStore`    |
| 全局组件目录 | `C_` + PascalCase          | `C_Header/`          | `header/`         |
| 局部组件目录 | `c_` + camelCase           | `c_detail/`          | `Detail/`         |
| 工具函数文件 | `d_` 前缀                  | `d_auth.ts`          | `auth.ts`         |
| Composable   | `use` + PascalCase         | `useLoginController` | `loginController` |
| API 函数     | 动词 + 资源 + `Api`        | `getUserListApi`     | `getUsers`        |

### 组件必须声明 name

```vue
<script setup lang="ts">
  defineOptions({ name: 'ComponentName' }) // 必须，用于 KeepAlive 和 DevTools
</script>
```

### 样式写法

```vue
<style lang="scss" scoped>
  @use './index.scss';
</style>
```

---

## 自动导入（无需手动 import）

以下 API 在 `.vue` / `.ts` 中**自动可用**，生成代码中不要写 import 语句：

```
Vue:     ref · computed · watch · onMounted · nextTick · reactive · readonly · h
Router:  useRoute · useRouter
Pinia:   defineStore · storeToRefs
VueUse:  useLocalStorage · useClipboard · useDebounceFn
NaiveUI: NCard · NButton · NSpace · NInput · NSelect · NTag · NModal · NDrawer
         NGrid · NGi · NTabs · NTabPane · useMessage · useDialog · useNotification
C_*:     C_Table · C_Form · C_ActionBar · C_Icon · C_Tree … (51+ 个，用 MCP 查询)
Stores:  s_userStore · s_themeStore · s_permissionStore …
```

---

## 项目生态包（优先使用，禁止引入功能重复的第三方包）

| 包                                 | 用途                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| `@robot-admin/naive-ui-components` | 51+ 业务组件（C_Form / C_Table / C_ActionBar…）        |
| `@robot-admin/request-core`        | HTTP 请求（getData / postData / useTableCrud）         |
| `@robot-admin/form-validate`       | 表单验证（PRESET_RULES，48+ 规则）                     |
| `@robot-admin/directives`          | 11 个 Vue 指令（v-copy / v-permission / v-watermark…） |
| `@robot-admin/layout`              | 6 种布局模式                                           |
| `@robot-admin/file-utils`          | Excel / ZIP / 分片上传                                 |
| `@robot-admin/theme`               | 主题切换（Light / Dark / System）                      |

---

## MCP 工具（编写代码前优先查询）

MCP Server 路径：`mcp/server.ts`，配置见 `.vscode/mcp.json`

| 工具                      | 何时调用                                |
| ------------------------- | --------------------------------------- |
| `list_components`         | 不确定哪些 C\_ 组件可用时               |
| `get_component_api(name)` | 使用某个组件前，查其 Props / Emits 定义 |
| `list_routes`             | 注册新路由或做路由跳转前                |
| `list_api_endpoints`      | 引用 API 函数前，确认函数名是否已存在   |
| `get_preset_rules`        | 编写表单验证规则前                      |

---

## 可用 Skills（流程化任务自动触发）

| Skill              | 触发词                                    |
| ------------------ | ----------------------------------------- |
| `page-codegen`     | 生成页面 · 建个页面 · 口述需求 · scaffold |
| `api-contract`     | 接口约定 · 生成 api · swagger 转 ts       |
| `prototype-scan`   | 原型解析 · axure 扫描 · 详设文档          |
| `route-sync`       | 注册路由 · 添加菜单                       |
| `convention-audit` | 规范检查 · 代码审查 · code review         |
| `mock-codegen`     | 生成 mock · mock 数据（可选技能）         |

---

## 文件头注释（所有文件必须包含）

```typescript
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-xx-xx
 * @FilePath: \Robot_Admin\src\xxx\xxx.ts
 * @Description: 文件描述
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
```

---

> 详细规范 → `.github/copilot-instructions.md`
