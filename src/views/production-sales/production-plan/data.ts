/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-plan\data.ts
 * @Description: 生产计划示例、筛选条件与状态约束
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  SearchConfig,
  SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import type { TreeNativeProps } from '@robot-admin/naive-ui-components/C_Tree'
import { statusTag } from '../shared/presentation'

export interface ProductionPlan {
  id: string
  planNo: string
  line: string
  cast: string
  grade: string
  section: string
  customer: string
  weight: number
  heats: number
  delivery: string
  status: 'draft' | 'issued' | 'running' | 'completed'
}
export interface PlanQuery {
  keyword: string
  grade: string | null
  status: string | null
  shift: string | null
}
export type PlanPickerQuery = Omit<PlanQuery, 'shift'> & {
  line: string
  cast: string
}
export const PLAN_STATES = {
  draft: { label: '待下达', type: 'default' },
  issued: { label: '已下达', type: 'warning' },
  running: { label: '执行中', type: 'info' },
  completed: { label: '已完成', type: 'success' },
} as const
export const LINE_TREE = [
  {
    id: 'all',
    name: '炼钢生产中心',
    children: [
      { id: 'CC1', name: '1# 连铸 · 方坯' },
      { id: 'CC2', name: '2# 连铸 · 板坯' },
      { id: 'CC3', name: '3# 连铸 · 合金' },
    ],
  },
]
export const LINE_TREE_PROPS: TreeNativeProps = {
  keyField: 'id',
  labelField: 'name',
  childrenField: 'children',
  animated: false,
}
export const SHIFT_CAPACITY = [
  { line: 'CC1', label: '1 号连铸机', capacity: 1200 },
  { line: 'CC2', label: '2 号连铸机', capacity: 1470 },
  { line: 'CC3', label: '3 号连铸机', capacity: 1830 },
] as const

/** 恢复台账条件时保留当前产线。 */
export function emptyPlanQuery(): PlanQuery {
  return { keyword: '', grade: null, status: null, shift: null }
}
const PLAN_GRADE_OPTIONS = ['Q235B', 'Q355B', 'HRB400E', 'S304L'].map(
  value => ({ label: value, value })
)
const PLAN_STATUS_OPTIONS = Object.entries(PLAN_STATES).map(
  ([value, item]) => ({ value, label: item.label })
)
export const PLAN_FIELDS: SearchFormItem<PlanQuery>[] = [
  { prop: 'keyword', label: '计划 / 客户', type: 'input' },
  {
    prop: 'grade',
    label: '钢种',
    type: 'select',
    list: PLAN_GRADE_OPTIONS,
  },
  {
    prop: 'status',
    label: '计划状态',
    type: 'select',
    list: PLAN_STATUS_OPTIONS,
  },
  {
    prop: 'shift',
    label: '班次',
    type: 'select',
    list: [
      { label: '白班', value: 'day' },
      { label: '夜班', value: 'night' },
    ],
  },
]
export const PLAN_PICKER_FIELDS: SearchFormItem<PlanPickerQuery>[] = [
  {
    prop: 'line',
    label: '当前产线',
    type: 'select',
    fixed: true,
    attrs: { clearable: false },
    defaultValue: 'all',
    list: [
      { value: 'all', label: '全部产线' },
      ...LINE_TREE[0].children.map(item => ({
        value: item.id,
        label: item.name,
      })),
    ],
  },
  { prop: 'keyword', label: '计划 / 客户', type: 'input' },
  { prop: 'cast', label: '浇次', type: 'input' },
  {
    prop: 'grade',
    label: '钢种',
    type: 'select',
    list: PLAN_GRADE_OPTIONS,
  },
  {
    prop: 'status',
    label: '计划状态',
    type: 'select',
    list: PLAN_STATUS_OPTIONS,
  },
]
export const PLAN_PICKER_COLUMNS = [
  { key: 'planNo', title: '生产计划号', width: 164 },
  { key: 'cast', title: '浇次', width: 76 },
  { key: 'grade', title: '钢种', width: 85 },
  { key: 'customer', title: '客户', minWidth: 110 },
  {
    key: 'status',
    title: '计划状态',
    width: 94,
    render: (row: ProductionPlan) => {
      const { label, type } = PLAN_STATES[row.status]
      return statusTag(label, type)
    },
  },
]
export const PLAN_PICKER_SEARCH = {
  layout: 'grid',
  columns: 3,
  labelPlacement: 'left',
  labelWidth: 88,
  fieldMinWidth: 204,
  requireValue: false,
  searchOnReset: true,
} satisfies SearchConfig<PlanPickerQuery>
/** 每个页面实例拥有独立计划，原始顺序不依赖模块级可变变量。 */
export function createProductionPlans(): ProductionPlan[] {
  return Array.from({ length: 18 }, (_, index) => ({
    id: `PLAN-${index + 1}`,
    planNo: `PP-20261029-${String(index + 1).padStart(3, '0')}`,
    line: `CC${Math.floor(index / 6) + 1}`,
    cast: `J${String(1029 + Math.floor(index / 6))}`,
    grade: ['Q235B', 'Q355B', 'S304L'][Math.floor(index / 6)],
    section: ['150 × 150', '220 × 1600', '200 × 200'][Math.floor(index / 6)],
    customer: ['华东建设', '星海科技', '远川能源', '云帆智造'][index % 4],
    weight: 110 + index * 12.5,
    heats: 2 + (index % 3),
    delivery: `10-${String(29 + (index % 3)).padStart(2, '0')}`,
    status: (
      ['draft', 'issued', 'running', 'completed', 'draft', 'draft'] as const
    )[index % 6],
  }))
}
const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR

/** 跨零点后显示次日时刻，原始排产分钟用于排序。 */
function formatHeatStart(startMinutes: number): string {
  const timeInDay = startMinutes % MINUTES_PER_DAY
  const hours = String(Math.floor(timeInDay / MINUTES_PER_HOUR)).padStart(
    2,
    '0'
  )
  const minutes = String(timeInDay % MINUTES_PER_HOUR).padStart(2, '0')
  const time = `${hours}:${minutes}`
  return startMinutes >= MINUTES_PER_DAY ? `次日 ${time}` : time
}

/** 炉次编号按计划预留 20 个位置，目标量按千分吨分摊并守恒。 */
export function createHeatSchedule(plan: ProductionPlan) {
  const total = Math.round(plan.weight * 1000)
  const base = Math.floor(total / plan.heats)
  const firstStartMinutes = 8 * MINUTES_PER_HOUR + 30
  return Array.from({ length: plan.heats }, (_, index) => {
    const startMinutes = firstStartMinutes + index * MINUTES_PER_HOUR
    return {
      id: `${plan.id}-H${index}`,
      heatNo: `L261029${String(Number(plan.id.slice(5)) * 20 + index).padStart(4, '0')}`,
      sequence: index + 1,
      furnace: `${(index % 2) + 1}# 转炉`,
      grade: plan.grade,
      target: (base + Number(index < total % plan.heats)) / 1000,
      start: formatHeatStart(startMinutes),
      startMinutes,
      process: 'BOF → LF → CC',
      status: index === 0 ? '就绪' : '待开炉',
    }
  })
}
/** 批量下达只改变尚未下达的目标计划，重复执行不回退生产状态。 */
export function releaseProductionPlans(
  rows: readonly ProductionPlan[],
  ids: ReadonlySet<string>
): ProductionPlan[] {
  return rows.map(row =>
    ids.has(row.id) && row.status === 'draft'
      ? { ...row, status: 'issued' }
      : row
  )
}
/** 不跨产线或浇次移动；缺少目标时拒绝放置，避免放宽业务边界。 */
export function canReorderProductionPlan(
  source: ProductionPlan | null | undefined,
  target: ProductionPlan | null | undefined
): boolean | string {
  if (source?.status !== 'draft') return '仅待下达计划允许调整顺序'
  return (
    (source.line === target?.line && source.cast === target.cast) ||
    '只能在同一产线与浇次内调整顺序'
  )
}
/** 以提交快照查询，搜索输入不会提前改动排产结果。 */
export function filterProductionPlans(
  rows: readonly ProductionPlan[],
  query: PlanQuery,
  line: string
): ProductionPlan[] {
  const keyword = query.keyword.trim()
  return rows.filter(row => {
    const matches = [
      line === 'all' || row.line === line,
      !keyword || `${row.planNo}${row.customer}`.includes(keyword),
      query.grade === null || row.grade === query.grade,
      query.status === null || row.status === query.status,
      query.shift === null ||
        (Number(row.id.slice(5)) % 2 === 0 ? 'night' : 'day') === query.shift,
    ]
    return matches.every(Boolean)
  })
}
