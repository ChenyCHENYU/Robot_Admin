# 组件库 0.17.4 API 收敛与消费验收

Robot_Admin 使用 npm 正式发布的 `@robot-admin/naive-ui-components@0.17.4`，版本固定于 package.json 与 bun.lock；常规构建不依赖本地组件源码或临时补丁。

## 公开契约

| 入口                 | 推荐用法与本次修正                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `C_FormSearch`       | 多选使用 `attrs: { multiple: true }` 和数组模型。`list.value` 支持字符串、数字、布尔值；`false`、`0` 与清空分别保留语义，搜索回调收到原始业务值。                                          |
| `C_Table`            | 业务能力统一放在 `config`。`TableProps<Row>` 补齐 config、crud、remote、virtualScrollX 与原生分页类型，CRUD 已提供数据和列时不必重复声明。旧功能属性类型保留兼容声明，不再作为新页面入口。 |
| `TableInstance<Row>` | 选择操作继续使用 `selectRow`、`getSelectedRows` 和 `clearSelection`；它们自动遵循当前模式。高级跨页状态在 `crossPageSelection` 中，嵌套 Ref 仍用 `.value` 读取。                           |
| `C_Tree`             | `ref<TreeExpose>()` 公开的 selectedKeys、expandedKeys、checkedKeys 直接是数组。页面继续用 `v-model:*` 管理受控状态，无需重新包装。独立组合函数的内部状态保留 Ref。                         |
| `useCForm`           | 必须绑定 formRef 后调用 validate；未挂载或卸载后拒绝执行，submit 此时返回 false。挂载前仍支持 setValues、getValues、reset 草稿操作。                                                       |

本次没有新增配置入口、替换架构或修改组件样式。原有默认尺寸、Naive 原生属性透传、按需入口和旧 formParams 入口保留。

## 页面验收步骤

打开「组件演示 → 表单管理 → 表单搜索」中的「多选与布尔条件」：

1. 初始「不可用」回显，列表为李四和王五，已提交参数中的 enabled 是布尔 false。
2. 账号状态同时选择「禁用」「启用」，提交前列表不变；点击搜索后只剩李四，statuses 是数字数组 `[0, 1]`。
3. 将「是否可用」改为「可用」并搜索，列表只剩张三，enabled 是布尔 true。
4. 清空「是否可用」并搜索，保留两个状态对应的两行，enabled 是 null。
5. 重置后多选清空、布尔值恢复 false，列表恢复两行。三种密度切换保持条件。

展开表仍在 `/demo/table-manage/table-expand`：父表选择/展开/序号列为 40/40/50 px，子表选择/序号为 40/50 px；舒适密度下序号标题保持单行，父子表正文留白同步。树组件在 `/preview/tree` 验证受控选择、勾选、懒加载重试及 2100 节点虚拟列表。

## 本地验证

- 组件库 `bun run verify`：306 条核心测试、292 条真实组件回归通过；55 个按需入口、类型声明、ESM/CJS 消费契约与体积预算通过。
- npm latest 是 0.17.4，registry SHA512 与本地验证 tarball 一致。搜索入口 gzip 158.2 KiB（包含 Vue/Naive UI），仍在 165 KiB 预算内。
- Robot_Admin `bun run verify`：247 条项目测试、105 条组件测试、类型与样式边界通过，演示与 application 两套构建通过；10 条既有 ESLint 提示，本轮修改文件零提示。
- 浏览器：密度与资源/展开表回归 11 项通过，包含真实多选与布尔值查询、清空、重置与原有搜索行为。树组件的受控选择、虚拟列表、加载重试和明暗窄屏布局另有 5 项通过，共 16 项。

## 分支范围

组件库 main 已完整包含此次功能分支并发布 v0.17.4。本次应用同步 main/dev 至 GitHub 与 Gitee；`micro-app`、`module-federation` 的现有远端引用仍使用 0.13.0，`monorepo` 使用独立 workspace 布局，记录为后续独立迁移范围，不将单体分支的校验结果套用于它们。

应用正式版本与 CHANGELOG 仍由 Release Please 管理，生产部署和 GitHub Release 分别核验。
