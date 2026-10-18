# 核心组件 0.17 接入与演示

Robot_Admin 使用正式的 `@robot-admin/naive-ui-components@0.17.0`，运行时从组件子路径按需导入。旧版 ActionBar 补丁已由上游正式实现替代。

## 验证入口

| 页面     | 能力                                                             | 免登录预览               |
| -------- | ---------------------------------------------------------------- | ------------------------ |
| 表单演示 | 同一密度切换八种布局，字段、操作按钮和布局留白同步，输入草稿保留 | `/#/preview/form`        |
| 搜索表单 | 搜索与结果表共享密度，真实内存筛选，状态 0、重置、历史和折叠     | `/#/preview/form-search` |
| 超级表格 | 弹窗、行、单元格和混合编辑；编辑模式简写、密度同步               | `/#/preview/table`       |
| 树工作台 | 受控选择/勾选、独立搜索、2,100节点虚拟滚动、本地懒加载失败重试   | `/#/preview/tree`        |
| 分割面板 | 订单联动两张明细表、双层受控比例、像素下限、独立滚动与折叠恢复   | `/#/preview/split-pane`  |

以上均可在没有后端时演示。搜索只有点击搜索后才更新结果；Tree 的首次加载失败是可重试的本地演示场景。宽屏三表采用左右加上下嵌套；窄屏改为上下布局，页面可滚动到第三张表，表内仍独立滚动。

## 精简配置

```ts
const density = ref<ComponentDensity>('compact')
const searchConfig = computed(() => ({ density: density.value }))
const tableConfig = computed(() => ({
  density: density.value,
  edit: 'cell' as const,
  selection: true,
}))
```

`default / compact / comfortable` 分别对应原生 `medium / small / large`。显式字段尺寸、表格 `display.size`、布局间距等配置仍优先。切密度保留草稿，切编辑模式丢弃旧模式草稿；组件卸载或数据被替换后，旧任务不应回写新数据。

绑定 CRUD 时，`crud.save` 接管确认后的保存。CRUD 的保存适配器不会被误当作打开编辑器的函数；自定义打开方式放在 `config.actions.edit`。只读和业务权限仍由页面自身配置与服务端契约决定。

Tree 的通用原生选项收拢到 `treeProps`，不为每个 Naive 功能再增加一层配置。分割面板只负责布局与交互，各张表保持自己的查询、分页、选择和行键。

## 本轮校验边界

组件库覆盖逻辑、真实组件挂载、三版 Naive Tree 兼容、消费者声明、ESM/CJS、可选 peer 隔离与体积预算。应用覆盖完整 `verify`、新演示的浏览器交互，以及既有表单、表格、菜单/字典树与生产入口回归。截图同时核对明暗主题、长标题、窄窗口与实际可滚达的末行。

这轮没有迁移 `wl-ui-produce` 的业务代码。组件能力覆盖与 AG Grid、平台协议、公司字典、报表和后端事务的边界，见[组件库调研报告](https://github.com/ChenyCHENYU/naive-ui-components/blob/main/docs/wl-ui-produce-coverage.md)。
