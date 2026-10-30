/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-plan\data.ts
 * @Description: 生产计划调度的本地数据、受控查询及状态操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueColumns,
  selectionColumn,
  indexColumn,
  dragColumn,
  actionsColumn,
  type RowClickEvent,
  useMachTable,
  type RowStyleRule,
  type RowDragEndEvent,
  type RowDragPolicy,
} from '@agile-team/mach-table-vue'
import type {
  SearchConfig,
  SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import type { TreeNativeProps } from '@robot-admin/naive-ui-components/C_Tree'
import { recordLink, statusTag, weightCodec } from '../shared/presentation'
import { usePlanOperations } from './operations'

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
interface PlanQuery {
  keyword: string
  grade: string | null
  status: string | null
  shift: string | null
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
export const PLAN_FIELDS: SearchFormItem<PlanQuery>[] = [
  { prop: 'keyword', label: '计划 / 客户', type: 'input' },
  {
    prop: 'grade',
    label: '钢种',
    type: 'select',
    list: ['Q235B', 'Q355B', 'HRB400E', 'S304L'].map(value => ({
      label: value,
      value,
    })),
  },
  {
    prop: 'status',
    label: '计划状态',
    type: 'select',
    list: Object.entries(PLAN_STATES).map(([value, item]) => ({
      value,
      label: item.label,
    })),
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
/** 炉次编号按计划预留 20 个位置，目标量按千分吨分摊并守恒。 */
export function createHeatSchedule(plan: ProductionPlan) {
  const total = Math.round(plan.weight * 1000)
  const base = Math.floor(total / plan.heats)
  return Array.from({ length: plan.heats }, (_, index) => ({
    id: `${plan.id}-H${index}`,
    heatNo: `L261029${String(Number(plan.id.slice(5)) * 20 + index).padStart(4, '0')}`,
    sequence: index + 1,
    furnace: `${(index % 2) + 1}# 转炉`,
    grade: plan.grade,
    target: (base + Number(index < total % plan.heats)) / 1000,
    start: `${8 + index}:30`,
    process: 'BOF → LF → CC',
    status: index === 0 ? '就绪' : '待开炉',
  }))
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
/** 调度页组合现有树、查询和网格；发布操作只更新本地演示模型。 */
export function useProductionPlan() {
  const dialog = useDialog()
  const rows = ref(createProductionPlans())
  const query = ref<PlanQuery>({
    keyword: '',
    grade: null,
    status: null,
    shift: null,
  })
  const applied = ref<PlanQuery>({ ...query.value })
  const selectedLines = ref<Array<string | number>>(['all'])
  const expandedLines = ref<Array<string | number>>(['all'])
  const currentId = ref('PLAN-1')
  const selectedIds = ref<string[]>([])
  const tab = ref('heats')
  const notice = ref('先选择计划查看炉次；待下达计划可勾选后批量下达。')
  const table = useMachTable<ProductionPlan>()
  const current = computed(
    () => rows.value.find(row => row.id === currentId.value) ?? rows.value[0]
  )
  const visibleRows = computed(() =>
    filterProductionPlans(
      rows.value,
      applied.value,
      String(selectedLines.value[0] ?? 'all')
    )
  )
  watch([currentId, () => visibleRows.value.length], () => {
    void nextTick(() => {
      const index = visibleRows.value.findIndex(
        row => row.id === currentId.value
      )
      if (index >= 0) table.api.value?.view.scrollToRow(index, 'nearest')
    })
  })
  const pending = computed(
    () => rows.value.filter(row => row.status === 'draft').length
  )
  const totalWeight = computed(() =>
    weightCodec.format(
      rows.value.reduce((sum, row) => sum + Math.round(row.weight * 1000), 0) /
        1000
    )
  )
  const searchConfig: SearchConfig<PlanQuery> = {
    density: 'compact',
    layout: 'grid',
    columns: 5,
    labelPlacement: 'left',
    fieldMinWidth: 230,
    labelWidth: 94,
    onSearch: values => {
      applied.value = { ...values }
      selectedIds.value = []
      table.api.value?.selection.clear()
    },
  }
  const operations = usePlanOperations({ rows, currentId, selectedIds, notice })
  const selectPlan = (event: RowClickEvent<ProductionPlan>) => {
    if (event.rowNode.data) currentId.value = event.rowNode.data.id
  }
  const columns = defineVueColumns<ProductionPlan>([
    dragColumn(),
    selectionColumn(),
    indexColumn({ headerName: '序号', width: 44 }),
    {
      field: 'planNo',
      headerName: '生产计划号',
      width: 174,
      pinned: 'left',
      render: row => recordLink(row.planNo, () => operations.openDetail(row)),
    },
    { field: 'line', headerName: '产线', width: 104 },
    { field: 'cast', headerName: '浇次', width: 104 },
    { field: 'grade', headerName: '钢种', width: 110 },
    { field: 'section', headerName: '断面 (mm)', width: 150 },
    { field: 'customer', headerName: '客户', minWidth: 130, flex: 1 },
    {
      field: 'weight',
      headerName: '计划量 (t)',
      width: 136,
      align: 'right',
      valueFormatter: ({ value }) => weightCodec.format(value),
    },
    { field: 'heats', headerName: '炉数', width: 104 },
    { field: 'delivery', headerName: '交付日期', width: 128 },
    {
      field: 'status',
      headerName: '状态',
      width: 110,
      render: row =>
        statusTag(PLAN_STATES[row.status].label, PLAN_STATES[row.status].type),
    },
    actionsColumn<ProductionPlan>({
      width: 88,
      actions: [
        {
          icon: 'edit',
          label: '编辑计划',
          variant: 'warning',
          disabled: ({ data }) => data?.status !== 'draft',
          onClick: ({ data }) => data && operations.editPlan(data),
        },
        {
          icon: 'delete',
          label: '删除计划',
          variant: 'danger',
          disabled: ({ data }) => data?.status !== 'draft',
          onClick: ({ data }) => data && operations.removePlan(data),
        },
        {
          icon: 'copy',
          label: '复制编制',
          onClick: ({ data }) => data && operations.copyPlan(data),
        },
      ],
    }),
  ])
  const rowStyles = computed<readonly RowStyleRule<ProductionPlan>[]>(() => {
    const id = currentId.value
    return [
      {
        when: ({ data }) => data.id === id,
        backgroundColor: 'var(--mach-row-selected-bg)',
      },
      { when: ({ data }) => data.status === 'issued', tone: 'warning' },
    ]
  })
  const heatRows = computed(() => createHeatSchedule(current.value))
  const detailHeatRows = computed(() =>
    operations.detailPlan.value
      ? createHeatSchedule(operations.detailPlan.value)
      : []
  )
  const heatColumns = defineVueColumns<(typeof heatRows.value)[number]>([
    indexColumn({ headerName: '序号', width: 46 }),
    { field: 'heatNo', headerName: '炉号', minWidth: 140, flex: 1 },
    { field: 'furnace', headerName: '设备', width: 105 },
    { field: 'grade', headerName: '钢种', width: 100 },
    {
      field: 'target',
      headerName: '目标重量 (t)',
      width: 130,
      align: 'right',
      valueFormatter: ({ value }) => weightCodec.format(value),
    },
    { field: 'start', headerName: '计划开炉', width: 100 },
    { field: 'process', headerName: '工艺路线', minWidth: 160, flex: 1 },
    { field: 'status', headerName: '准备状态', width: 100 },
  ])
  const loads = computed(() =>
    ['CC1', 'CC2', 'CC3'].map((line, index) => ({
      line,
      label: `${index + 1} 号连铸机`,
      weight: rows.value
        .filter(row => row.line === line)
        .reduce((sum, row) => sum + row.weight, 0),
      rate: [76, 88, 64][index],
    }))
  )
  const release = () => {
    const targets = new Set(selectedIds.value)
    const count = rows.value.filter(
      row => targets.has(row.id) && row.status === 'draft'
    ).length
    if (!count) {
      notice.value = '请先勾选待下达计划，已下达及执行中的计划不会重复处理。'
      return
    }
    dialog.info({
      title: '下达生产计划',
      content: `确认下达 ${count} 项待下达计划？下达后锁定编制与顺序，执行前可撤销。`,
      positiveText: '确认下达',
      negativeText: '取消',
      onPositiveClick: () => {
        rows.value = releaseProductionPlans(rows.value, targets)
        notice.value = `已下达 ${count} 项计划，炉次与产线安排保持不变（本地演示）。`
      },
    })
  }
  const syncSelection = () => {
    selectedIds.value = (table.api.value?.selection.getIds() ?? []).map(String)
  }
  const reorderEnabled = computed(
    () =>
      String(selectedLines.value[0] ?? 'all') === 'all' &&
      !Object.values(applied.value).some(Boolean)
  )
  const dragPolicy: RowDragPolicy<ProductionPlan> = {
    canDrag: ({ node }) =>
      node.data?.status === 'draft' || '仅待下达计划允许调整顺序',
    canDrop: ({ node, targetNode }) =>
      canReorderProductionPlan(node.data, targetNode?.data),
  }

  const onReorder = (event: RowDragEndEvent<ProductionPlan>) => {
    if (!event.applied) return
    const next: ProductionPlan[] = []
    event.api.rows.forEach(node => {
      if (node.data) next.push(node.data)
    })
    rows.value = next
    notice.value = `已调整 ${event.rowNode.data?.planNo} 的本地排产顺序。`
  }
  return {
    ...operations,
    selectPlan,
    detailHeatRows,
    rows,
    query,
    searchConfig,
    selectedLines,
    expandedLines,
    visibleRows,
    current,
    pending,
    totalWeight,
    selectedIds,
    columns,
    table,
    rowStyles,
    heatRows,
    heatColumns,
    loads,
    tab,
    notice,
    release,
    syncSelection,
    reorderEnabled,
    dragPolicy,
    onReorder,
  }
}
