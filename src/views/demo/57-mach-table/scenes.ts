/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\scenes.ts
 * @Description: 维护各示例场景、功能边界和状态预览
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { defineTabs } from '@robot-admin/naive-ui-components/C_Tabs'

export const TABLE_SCENARIOS = {
  crud: {
    kind: 'orders',
    label: '标准 CRUD',
    editMode: 'none',
    tip: '默认采用企业后台常见的弹窗编辑；查看、编辑、删除直接展示，低频操作收纳在更多菜单中，行内编辑默认关闭。',
  },
  cell: {
    kind: 'orders',
    label: '单元格编辑',
    editMode: 'cell',
    tip: '双击可编辑单元格；点击另一可编辑单元格会校验并提交上一项，再无缝切换。状态与区域下拉均显示中文。',
  },
  row: {
    kind: 'orders',
    label: '整行编辑',
    editMode: 'row',
    tip: '点击操作列的整行编辑进入事务模式；行内控件可连续操作，仅保存或取消会结束本次整行编辑。',
  },
  workspace: {
    kind: 'orders',
    label: '数据工作台',
    editMode: 'none',
    tip: '集中体验排序、筛选、列拖动、列宽调整、列工作台、状态持久化与 CSV 导出。',
  },
  tree: {
    kind: 'tree',
    label: '树形表格',
    editMode: 'none',
    tip: '区域 → 客户 → 订单三层展开；多选支持父子联动。真实业务还可配置异步子节点加载、取消与失败重试。',
  },
  reorder: {
    kind: 'reorder',
    label: '顺序调整',
    editMode: 'none',
    tip: '勾选多行后，拖动其中一行手柄可批量调整，源顺序保持不变；Alt + ↑ / ↓ 同样可用。支持撤销/重做，保存中锁定顺序操作。450ms 保存、失败与版本冲突均为本地模拟，不写入订单接口。切换场景保留已确认顺序，并取消未完成的模拟保存。',
  },
  import: {
    kind: 'import',
    label: '导入校验',
    editMode: 'none',
    tip: '先预览规范化结果与校验问题，再原子确认导入；数量、日期、布尔值和长编号分别保留正确类型。仅本地模拟。',
  },
  large: {
    kind: 'large',
    label: '千万行视口',
    editMode: 'none',
    tip: '千万行逻辑数据按块生成，通过首行、中间、末行和指定行定位体验有限缓存与横向列虚拟化。仅本地模拟。',
  },
} as const

export type TableScenario = keyof typeof TABLE_SCENARIOS

/** 页面只关心场景数据，C_Tabs 统一负责紧凑呈现与交互。 */
export const TABLE_SCENARIO_TABS = defineTabs(
  (Object.keys(TABLE_SCENARIOS) as TableScenario[]).map(key => ({
    key,
    label: TABLE_SCENARIOS[key].label,
  }))
)

export type TablePreviewState = 'data' | 'loading' | 'empty'

export const TABLE_PREVIEW_OPTIONS = [
  { label: '正常数据', value: 'data' },
  { label: '加载状态', value: 'loading' },
  { label: '空数据状态', value: 'empty' },
]

/** 需要专用列或数据结构的能力分场景展示。 */
export const MACH_SCENE_CAPABILITIES = [
  {
    key: 'editing',
    title: '单元格 / 整行编辑',
    state: '当前页面可体验',
    description: '通过页面上方场景标签切换，支持校验、提交、取消和撤销。',
  },
  {
    key: 'tree',
    title: '树表与懒加载',
    state: '当前页面可体验',
    description:
      '树形场景演示本地三层数据；Core 同时支持可取消、去重和重试的远程子节点加载。',
  },
  {
    key: 'reorder',
    title: '行顺序调整',
    state: '当前页面可体验',
    description:
      '顺序调整场景支持多行拖拽、撤销/重做，以及模拟保存失败回滚和版本冲突。',
  },
  {
    key: 'detail',
    title: '主从详情',
    state: '需要详情渲染器',
    description: '可展开业务详情；与树表互斥，不能作为普通布尔开关混用。',
  },
  {
    key: 'infinite',
    title: '无限滚动与随机块',
    state: '需要数据源',
    description: '支持并发限制、预取、重试、LRU 缓存和已知总量滚动条。',
  },
  {
    key: 'state',
    title: '保存视图与状态持久化',
    state: '当前页面已启用',
    description: '列宽、顺序、排序、筛选和分页按页面身份隔离保存。',
  },
  {
    key: 'io',
    title: 'CSV / XLSX / 打印',
    state: '按需扩展',
    description: 'CSV 和打印由 Core 提供，XLSX 通过独立入口按需加载。',
  },
] as const
