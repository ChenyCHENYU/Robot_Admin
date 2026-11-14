<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\docs\core-components.md
 * @Description: 当前组件、搜索、表格与产销组合接入及真实体验入口
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 组件与业务工作区接入

本页对应 RobotAdmin 当前主线；版本见 [README](../README.md#插件生态) 与 [package.json](../package.json)。组件接收公开配置和普通数据，接口、权限、字典作用域与业务事务由项目维护。

| 需要实现什么                 | 起点                      |
| ---------------------------- | ------------------------- |
| 表单、动态校验、紧凑弹窗     | [表单与弹窗](#表单与弹窗) |
| 3/4 列搜索、多选、弹窗内选择 | [搜索与选择](#搜索与选择) |
| 普通列表、宽表、同屏小表     | [两类表格](#两类表格)     |
| 异步列/数据、精准数值、字典  | [数据组合](#数据组合)     |
| 账号之间独立保存列偏好       | [个人偏好](#个人偏好)     |
| 可实际操作的主从与复杂场景   | [产销工作台](#产销工作台) |

## 表单与弹窗

页面提供 `model + options + config`。`C_Form` 负责字段呈现、规则校验、提交锁定、异步反馈及卸载清理，不需要再包一层项目表单。

```vue
<C_Form v-model="model" :options="fields" :config="formConfig" />
```

- 字段、显隐、禁用和规则可随模型或接口配置变化；常用规则、跨字段比较、嵌套路径和动态增删继续使用同一字段协议。
- 异步保存放在 `config.onSubmit` 并返回 Promise；取消信号交给请求层，组件处理重复提交和过期结果。完成后的同步通知再用 `@submit`。
- 应用已提供 `compact` 默认密度。局部 `C_Density` 可统一一个区域，显式字段尺寸和布局间距优先；校验消息按实际内容展开。
- 数字、日期、时间和选项控件沿用各自原始类型与公开属性。数字输入保留精度、上下限和键盘步进，增减按钮按需开启。
- `C_FormModal` 用同一模型、字段和配置。标题与首行保留间距，长内容在弹窗内滚动，标题和操作区保持可见；窄屏收拢布局。
- 业务操作统一带语义图标；新增位于工具栏，编辑/删除跟随对应行，详情弹窗保持只读。

入口：`/#/demo/form-manage/form`、`/#/demo/form-manage/form-modal`、`/#/demo/table-manage/table`。字段、规则、插槽和提交示例见[表单配置](./form-configuration.md)。

## 搜索与选择

### 搜索布局与查询

```ts
const searchConfig = {
  layout: 'grid' as const,
  columns: 3,
  foldThreshold: 3,
  searchOnReset: true,
  onSearch: search,
}
```

```vue
<C_FormSearch v-model="query" :form-item-list="fields" :config="searchConfig" />
```

`search` 是页面查询回调；字段仍是普通搜索配置。`columns` 可选 3 或 4 等列数，窄容器按最小字段宽度收拢；操作区由组件安排在右侧，展开/折叠不会要求页面维护绝对定位。`foldThreshold` 决定折叠时显示的字段数。

搜索草稿和已应用条件分开，提交才更新结果；设置 `searchOnReset: true` 后，重置也走 `onSearch`。固定组织等上下文通过字段策略保留，多选、布尔值、空值和 `0` 不混同。日期/数字范围、条件历史和字段设置使用同一搜索组件。

入口：`/#/demo/form-manage/form-search`。实际查询配置可参考[生产计划](../src/views/production-sales/production-plan/data.ts)和[发运任务](../src/views/production-sales/shipping/data.ts)。

### 选择标签与实体检索

普通远程选项用 `C_Select`，自由文本建议用 `C_AutoComplete`，多列实体目录用 `C_DataPicker`。加载、错误与重试作为受控状态呈现；多选标签和数量摘要留在控件内。

客户、物料等需要分页检索的实体保留查询、已选回显与确认会话，不应把整份目录当小字典缓存。表单选择通过 `createDataPickerField` 接入；销售订单的客户选择采用 `presentation: 'inline'`，在当前编辑弹窗内完成，取消不写值，确认才回填。

查看[销售客户选择](../src/views/production-sales/sales-orders/operations.ts)、[进阶查询](../src/views/production-sales/production-plan/data.ts)；后者保留来源列表查询，确认后定位对应计划与炉次。日期和时间的单独使用、范围与联动约束分别见 `/#/demo/date`、`/#/demo/time`。

## 两类表格

| 用途                         | 入口                               | 输入                                |
| ---------------------------- | ---------------------------------- | ----------------------------------- |
| 常规 CRUD、树、展开行        | `C_Table`                          | `columns/data`，可选 `config/crud`  |
| 宽表、高密度编辑、大数据视口 | MachTable，省略 `preset` 即 `list` | `column-defs/row-data` 或公开数据源 |
| 多张只读明细、小数据块       | MachTable `preset="detail"`        | 列与数据，纯文字表头及有界自动高度  |

```vue
<C_Table :columns="columns" :data="rows" />
<MachTable :column-defs="columnDefs" :row-data="rows" />
<MachTable
  preset="detail"
  :column-defs="detailColumns"
  :row-data="detailRows"
/>
```

代码片段基于本项目的自动导入和异步插件。两种列结构保持原生协议，不用一份通用列 DSL 抹平差异；共有的业务数据、字典和请求状态在项目中组合。

### 默认与覆盖

- 列表默认有序号、分页，普通列和数值列居中；按需关闭 `row-number` 或 `pagination`。C_Table 使用 Naive UI 分页，MachTable 使用内置分页条。
- 自动业务列测量完整表头和有界显示内容，并按基准比例分配剩余空间；序号、选择与操作列保持紧凑。列多时内部横向滚动，表头文字和控件完整显示。
- 手动拖动只改变目标列，不能缩到遮住表头；正文独立省略并可查看完整值。保存宽度不会把自动列的展示规则改成显式定宽规则，也不改写公共列定义。
- 固定右侧操作区保持贴合容器右边界并保留内间距；编辑器完整显示输入，确认/取消操作避让边界。
- 列表可以按工作区高度滚动；明细使用自动高度与上限。短表随内容收起，超限后继续虚拟滚动，分页与横轨保持可达。
- 两种表格保留各自主题与空态。状态语义标签、普通枚举和关键数值分别配置，行着色使用规则，不写死业务状态值。
- 应用为 MachTable 提供 `size: 'compact'`，默认正文行高 30px、表头高 34px；页面可用 `rowHeight/headerHeight` 明确覆盖。`C_Table` 通过应用注入 `density: 'compact'`，收紧单元格留白并使用紧凑控件；实际行高仍随按钮、输入、标签及换行内容展开，不承诺统一 30px。局部密度及显式控件尺寸继续优先。

外观仅在 [MachTable 配置](../src/config/mach-table.ts)和[组件插件](../src/plugins/naive-ui-plugin.ts)统一配置。页面只声明场景及业务差异；显式属性继续优先。

主按钮的文字及继承 `currentColor` 的图标、已选 Checkbox 的勾在明暗主题中默认使用白色前景，由同一个 `NConfigProvider` 配色结果驱动。项目角色配置放在 [component-colors.ts](../src/config/theme/component-colors.ts)；局部区域需要不同前景时，用 `createComponentTheme({ primary: '#ffff00', onSolid: '#112233' })` 的结果配置嵌套 `NConfigProvider`，不会改写外层主题或页面草稿。

### MachTable 场景

入口：「示范组件 → 表格模块 → Mach Table」，`/#/demo/table-manage/mach-table`。

| 页签              | 体验重点                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| 标准 CRUD         | 行操作查看详情，新增/编辑/删除弹窗、规则校验与取消保护                                            |
| 单元格 / 整行编辑 | 草稿、确认/取消、键盘操作、选择与稳定行身份                                                       |
| 数据工作台        | 数据操作与网格能力的组合，配置保留在领域控制器                                                    |
| 树形表格          | 层级数据、展开与选择                                                                              |
| 顺序调整          | 不连续多项一起拖动、边缘滚动、Esc、Alt + ↑/↓、顺序撤销/重做；本地保存失败回滚、版本冲突与重载演练 |
| 导入校验          | 正常/错误/重复编号样例，编辑 JSON 矩阵，规范值与逐行问题预览；确认才提交，类型化导出保留原值      |
| 千万行视口        | 逻辑行定位、宽列横向滚动和固定列；本地源每次生成 200 行，最多缓存 8 块，不创建千万行数组          |

传输和写入均为本地演示。真实服务端性能、触屏与真人读屏仍需实际环境验收；项目当前未演示的服务端分组、Pivot、集成图表等上游能力，请直接查看 [MachTable 文档](https://github.com/ChenyCHENYU/MachTable)。

## 数据组合

### 动态列与异步请求

接口层把返回的列描述映射为 C_Table 或 MachTable 的公开列定义，并返回普通记录。使用稳定行键和准确 `total`，请求携带 `signal`。`remote-workbench` 将列与行作为同一次查询结果提交，切换交付/质量方案后旧响应不能覆盖新表头；两表独立分页、加载和重试。

页面顶部的「异常演练」可复现慢响应、失败、空明细和字典晚到。示例的分页、筛选与排序由本地异步传输实现，接入真实接口时保留相同契约，不能将其视为已连接业务后端。

MachTable `useMachTableQuery` 的显式选择按 `selectionScope` 保留已加载的选中行快照；`selectAllMatching()` 使用查询与排除 ID 表示全选。此时 `selectedRows` 仅包含最近成功页面中未排除的行，翻页替换快照，不累积所有访问过的页面。跨页批量操作和远程导出提交业务查询与 `selectionState`，不能把 `selectedRows` 当作完整结果集；排除 ID 会继续跨页生效。

### 字典、枚举与状态

字典插件已在项目启动时安装，通用接口与默认策略集中在 [dictionary.ts](../src/config/dictionary.ts)。普通远程码无需逐项登记；业务字段映射由项目维护一次。

- 表单和搜索消费普通选项及 `optionsState`，两种表格消费普通 formatter，详情调用 `useDictLabels(record, mapping)`。
- 字典包不依赖组件，组件和网格不识别字典码、实例或注入协议。单元格只同步查标签，不发送请求。
- 共享加载与缓存区分成功空数据、失败、未知原码和旧标签；按需局部重试，身份/公司/语言切换隔离来源。
- `0`、`false`、字符串 `"0"`、前导零编号及多选逐项保留原值。枚举翻译与状态颜色独立配置。

体验：销售订单协同 →「字典联动体验」。完整安装、接口响应与不同使用场景见[字典指南](./dictionaries.md)。

### 数值与跨区域状态

精确数值方法从 `@robot-admin/naive-ui-components/data` 接入；多区域交互从 `/workflows` 接入；网格合计按需使用 MachTable `/business`。`/config` 是配置协议与主题入口，不导出数值方法。

销售页展示原值计算、展示舍入及按币种/单位合计；矩阵结果和时间作为一个值共同校验、提交、撤销。零值与缺测分开。批改预览区分不修改/清空/赋值，成功项不重复发送，失败项独立重试。

## 个人偏好

偏好仅在显式启用保存的表格中持久化；当前发运任务池和 MachTable 演示可体验。

| 表格      | 页面需要配置                                                                | 项目统一完成                                                                                                                                          |
| --------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| C_Table   | `config.persistKey`，例如稳定的 `orders`                                    | [全局 `persistPrefix` getter](../src/plugins/naive-ui-plugin.ts)按身份提供范围                                                                        |
| MachTable | 持久化配置中的逻辑 `key`，setup 时包一次 `useScopedMachTableConfig(config)` | [组合函数](../src/composables/useScopedMachTableConfig.ts)捕获固定保存键，[布局](../src/components/global/C_Layout/index.vue)随身份切换重建缓存所有者 |

用户、租户、公司、表格 ID 独立编码；令牌和显示名不入键。身份缺失时暂停读写，无保存配置的表格不写存储。A 切到 B 时，A 的待保存/排队任务仍写 A 的键；B 使用自己的设置，没有设置则恢复默认，切回 A 恢复 A 的偏好。旧的无作用域键不自动迁移；重置只影响当前范围的对应表格。

表格包不读取用户 Store 或认证服务。其他项目按自己的身份生命周期提供范围；不要把正在使用的 MachTable 实例动态改写成另一账号的保存目标。

同一身份下的动态报表也应把稳定 `reportId` 或列方案 ID 纳入逻辑偏好 `key`，让不同报表各自保存列宽、顺序和显示设置。偏好的 owner/key 只决定偏好读写归属；动态切换偏好键不会自动清除选择或未保存修改。选择属于查询与行身份，dirty 属于编辑草稿及保存事务；报表或主档切换是否保留、确认放弃、显式重置或重建页面，由页面按业务边界处理，不依赖列偏好替代草稿保护。

## 产销工作台

| 工作区   | 关键组合与边界                                                                        | 实现                                                                           |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 计划调度 | 产线树、计划/炉次明细、进阶查询、产能；复制确认后生成独立计划，按整数小单位分摊目标量 | [production-plan](../src/views/production-sales/production-plan/index.vue)     |
| 炉次实绩 | 密集录入、成分限值、工序定位、只读上一炉参考；保存与复核分开，切炉有草稿保护          | [production-actual](../src/views/production-sales/production-actual/index.vue) |
| 销售订单 | 整单草稿、合同差异、客户选择、商品/收款、精确合计、校验摘要导航及批改重试             | [sales-orders](../src/views/production-sales/sales-orders/index.vue)           |
| 发运协同 | C_Table 任务池与 Mach 库存表、车辆表单、分组汇总；重量守恒、超载拦截、装车/出厂确认   | [shipping](../src/views/production-sales/shipping/index.vue)                   |
| 远程协同 | 独立异步主从表、动态列、字典刷新、草稿与删除末页回退；可拖左右及右侧上下分栏          | [remote-workbench](../src/views/production-sales/remote-workbench/index.vue)   |
| 检测矩阵 | 日期/班次合并、双字段编辑、粘贴/撤销、隐藏日期历史；完整快照共用预览/导出/打印        | [production-matrix](../src/views/production-sales/production-matrix/index.vue) |

六页均为本地模拟；详情保持只读，新增/编辑走 `C_FormModal`，操作走 `C_ActionBar`。这些组合复用同一业务模型与提交入口，没有另建通用 CRUD 或编辑状态框架。

公共预览为 `/#/preview/production-sales/<页面路径>`，销售旧预览 `/#/preview/business-workbench` 保留。三表分栏的独立示例在 `/#/demo/split-pane`，受控虚拟树在 `/#/demo/tree`。真实路由页保留元素根，tags 往返保留草稿，身份切换清理旧页面。

接口、服务端权限和并发事务接入见[生产接入基线](./production-readiness.md)；具体表单规则见[表单配置](./form-configuration.md)。早期的 [0.17 接入记录](./core-components-0.17.md)仅作为历史快照。
