/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\production-plan\useProductionPlan.ts
 * @Description: 生产计划台账、产线、炉次与下达流程组合
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
  type ModelUpdatedEvent,
} from '@agile-team/mach-table-vue'
import type { SearchConfig } from '@robot-admin/naive-ui-components/C_FormSearch'
import {
  createLocalDataPickerSource,
  type DataPickerSourceInput,
  type DataPickerValue,
} from '@robot-admin/naive-ui-components/C_DataPicker'
import { recordLink, weightCodec } from '../shared/presentation'
import { usePlanOperations } from './operations'
import { usePlanRelease } from './usePlanRelease'

import {
  LINE_TREE,
  PLAN_STATES,
  SHIFT_CAPACITY,
  createProductionPlans,
  createHeatSchedule,
  emptyPlanQuery,
  filterProductionPlans,
  canReorderProductionPlan,
  type PlanQuery,
  type PlanPickerQuery,
  type ProductionPlan,
} from './data'

/** 调度页组合现有树、查询和网格；发布操作只更新本地演示模型。 */
export function useProductionPlan() {
  const rows = ref(createProductionPlans())
  const query = ref<PlanQuery>(emptyPlanQuery())
  const applied = ref<PlanQuery>({ ...query.value })
  const selectedLines = ref<Array<string | number>>(['all'])
  const expandedLines = ref<Array<string | number>>(['all'])
  const currentId = ref('PLAN-1')
  const locatedId = ref<string>()
  const displayedCount = ref<number>()
  const columnMatchIds = shallowRef<ReadonlySet<string>>()
  const selectedIds = ref<string[]>([])
  const tab = ref('heats')
  const notice = ref('先选择计划查看炉次；待下达计划可勾选后批量下达。')
  const table = useMachTable<ProductionPlan>()
  const line = computed(() => String(selectedLines.value[0] ?? 'all'))
  const lineLabel = computed(
    () =>
      LINE_TREE[0].children.find(item => item.id === line.value)?.name ??
      '全部产线'
  )
  const visibleRows = computed(() =>
    filterProductionPlans(rows.value, applied.value, line.value)
  )
  const displayedPlans = computed(() =>
    Math.min(
      displayedCount.value ?? visibleRows.value.length,
      visibleRows.value.length
    )
  )
  const locatedPlan = computed(() =>
    rows.value.find(row => row.id === locatedId.value)
  )
  const ledgerRows = computed(() => {
    const matches = columnMatchIds.value
    return matches
      ? visibleRows.value.filter(row => matches.has(row.id))
      : visibleRows.value
  })
  const current = computed(() => {
    if (locatedPlan.value) return locatedPlan.value
    if (!displayedPlans.value) return undefined
    return (
      ledgerRows.value.find(row => row.id === currentId.value) ??
      ledgerRows.value[0]
    )
  })
  const locatedOutsideLedger = computed(
    () =>
      !!locatedPlan.value &&
      !ledgerRows.value.some(row => row.id === locatedId.value)
  )
  const gridEmpty = computed(() => displayedPlans.value === 0)
  const lineHasPlans = computed(() =>
    rows.value.some(row => line.value === 'all' || row.line === line.value)
  )
  const ledgerLocale = computed(() => ({
    emptyRows: lineHasPlans.value
      ? '没有符合条件的计划'
      : '当前产线暂无排产计划',
    emptyRowsHint: lineHasPlans.value
      ? '清除筛选可恢复台账'
      : '新增计划后可继续编排炉次',
  }))
  const onLedgerModelUpdated = (event: ModelUpdatedEvent<ProductionPlan>) => {
    displayedCount.value = event.rowCount
    if (!event.api.filtering.isPresent()) {
      columnMatchIds.value = undefined
      return
    }
    const matches = new Set<string>()
    event.api.rows.forEachDisplayed(node => {
      if (node.data) matches.add(node.data.id)
    })
    columnMatchIds.value = matches
  }
  watch([currentId, () => visibleRows.value.length], () => {
    if (locatedId.value && locatedId.value !== currentId.value)
      locatedId.value = undefined
    void nextTick(() => {
      const api = table.api.value
      if (!api) return
      let index = -1
      api.rows.forEachDisplayed((node, position) => {
        if (node.data?.id === currentId.value) index = position
      })
      if (index < 0) return
      const pageSize = api.pagination.getPageSize()
      api.pagination.setPage(Math.floor(index / pageSize) + 1)
      api.view.scrollToRow(index % pageSize, 'nearest')
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
  const totalHeats = computed(() =>
    rows.value.reduce((sum, row) => sum + row.heats, 0)
  )
  const resetLedgerSelection = () => {
    locatedId.value = undefined
    selectedIds.value = []
    const api = table.api.value
    api?.selection.clear()
    api?.pagination.setPage(1)
  }
  const applyPlanQuery = (values: PlanQuery): void => {
    applied.value = { ...values }
    resetLedgerSelection()
  }
  const clearLedgerFilters = () => {
    const api = table.api.value
    api?.filtering.setModel(null)
    api?.filtering.setAdvancedModel(null)
    api?.filtering.setQuickText(null)
    query.value = emptyPlanQuery()
    applyPlanQuery(query.value)
    notice.value = `已清除筛选，显示${lineLabel.value}的计划。`
  }
  watch(line, resetLedgerSelection)
  const searchConfig: SearchConfig<PlanQuery> = {
    density: 'compact',
    layout: 'grid',
    columns: 4,
    foldThreshold: 3,
    labelPlacement: 'left',
    fieldMinWidth: 230,
    labelWidth: 94,
    searchOnReset: true,
    onSearch: applyPlanQuery,
  }
  const planPickerInitial = computed<PlanPickerQuery>(() => ({
    line: line.value,
    keyword: '',
    cast: '',
    grade: null,
    status: null,
  }))
  const planPickerSource: DataPickerSourceInput<
    ProductionPlan,
    PlanPickerQuery
  > = {
    rowKey: 'id',
    label: row => row.planNo,
    request: async ({
      filters = planPickerInitial.value,
      page,
      pageSize,
      search,
      signal,
    }) => {
      signal.throwIfAborted()
      const candidates = filterProductionPlans(
        rows.value,
        { ...filters, keyword: search || filters.keyword, shift: null },
        filters.line
      ).filter(row => row.cast.includes(filters.cast.trim()))
      return {
        rows: candidates.slice((page - 1) * pageSize, page * pageSize),
        total: candidates.length,
      }
    },
  }
  const batchPlanSource = computed(() =>
    createLocalDataPickerSource({
      rows: rows.value,
      rowKey: 'id',
      label: row => row.planNo,
      searchText: row => `${row.planNo} ${row.customer}`,
      code: row => row.planNo,
    })
  )
  const batchPlanValue = ref<DataPickerValue | DataPickerValue[] | null>([])
  const batchPlans = computed(() => {
    if (!Array.isArray(batchPlanValue.value)) return []
    const numbers = new Map<DataPickerValue, string>(
      rows.value.map(row => [row.id, row.planNo])
    )
    return batchPlanValue.value
      .map(id => numbers.get(id))
      .filter(number => number !== undefined)
  })
  const locatePlan = ([plan]: ProductionPlan[]): void => {
    if (!plan) return
    locatedId.value = plan.id
    currentId.value = plan.id
    tab.value = 'heats'
    selectedIds.value = []
    table.api.value?.selection.clear()
    notice.value = ledgerRows.value.some(row => row.id === plan.id)
      ? `已定位 ${plan.planNo}，可在下方查看炉次。`
      : `已打开 ${plan.planNo} 的炉次。当前台账筛选隐藏了该计划。`
  }
  const operations = usePlanOperations({
    rows,
    currentId,
    selectedIds,
    notice,
    line,
  })
  const selectPlan = (event: RowClickEvent<ProductionPlan>) => {
    if (!event.rowNode.data) return
    locatedId.value = undefined
    currentId.value = event.rowNode.data.id
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
    { field: 'line', headerName: '产线' },
    { field: 'cast', headerName: '浇次' },
    { field: 'grade', headerName: '钢种' },
    { field: 'section', headerName: '断面 (mm)' },
    { field: 'customer', headerName: '客户', minWidth: 130 },
    {
      field: 'weight',
      headerName: '计划量 (t)',
      width: 136,
      valueFormatter: ({ value }) => weightCodec.format(value),
    },
    { field: 'heats', headerName: '炉数' },
    { field: 'delivery', headerName: '交付日期' },
    {
      field: 'status',
      headerName: '状态',
      status: Object.fromEntries(
        Object.entries(PLAN_STATES).map(([code, state]) => [
          code,
          {
            label: state.label,
            color: state.type === 'default' ? 'neutral' : state.type,
          },
        ])
      ),
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
    const id = current.value?.id
    return [
      {
        when: ({ data }) => data.id === id,
        backgroundColor: 'var(--mach-row-selected-bg)',
      },
      { when: ({ data }) => data.status === 'issued', tone: 'warning' },
    ]
  })
  const heatRows = computed(() =>
    current.value ? createHeatSchedule(current.value) : []
  )
  const detailHeatRows = computed(() =>
    operations.detailPlan.value
      ? createHeatSchedule(operations.detailPlan.value)
      : []
  )
  const heatColumns = defineVueColumns<(typeof heatRows.value)[number]>([
    indexColumn({ headerName: '序号', width: 46 }),
    { field: 'heatNo', headerName: '炉号', minWidth: 140 },
    { field: 'furnace', headerName: '设备', width: 105 },
    { field: 'grade', headerName: '钢种', width: 100 },
    {
      field: 'target',
      headerName: '目标重量 (t)',
      width: 130,
      valueFormatter: ({ value }) => weightCodec.format(value),
    },
    {
      field: 'start',
      headerName: '计划开炉',
      width: 100,
      // 文本继续用于筛选，排序沿用跨日累计分钟。
      comparator: (_left, _right, leftRow, rightRow) =>
        (leftRow.data?.startMinutes ?? 0) - (rightRow.data?.startMinutes ?? 0),
    },
    { field: 'process', headerName: '工艺路线', minWidth: 160 },
    { field: 'status', headerName: '准备状态', width: 100 },
  ])
  const loads = computed(() =>
    SHIFT_CAPACITY.map(resource => {
      const plans = rows.value.filter(row => row.line === resource.line)
      const weight = plans.reduce((sum, row) => sum + row.weight, 0)
      return {
        ...resource,
        weight,
        plans: plans.length,
        rate: Math.round((weight / resource.capacity) * 100),
      }
    })
  )
  const focusLine = (id: string) => {
    selectedLines.value = [id]
    clearLedgerFilters()
    tab.value = 'heats'
  }
  const release = usePlanRelease({ rows, selectedIds, notice })
  const syncSelection = () => {
    selectedIds.value = (table.api.value?.selection.getIds() ?? []).map(String)
  }
  const reorderEnabled = computed(
    () =>
      line.value === 'all' &&
      !Object.values(applied.value).some(Boolean) &&
      !columnMatchIds.value
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
    notice,
    release,
    metrics: proxyRefs({
      pending,
      weight: totalWeight,
      heats: totalHeats,
    }),
    search: proxyRefs({
      query,
      config: searchConfig,
      clear: clearLedgerFilters,
    }),
    picker: proxyRefs({
      initial: planPickerInitial,
      source: planPickerSource,
      batchSource: batchPlanSource,
      batchValue: batchPlanValue,
      batchLabels: batchPlans,
      locate: locatePlan,
    }),
    lines: proxyRefs({
      selected: selectedLines,
      expanded: expandedLines,
      label: lineLabel,
      hasPlans: lineHasPlans,
      capacity: loads,
      focus: focusLine,
    }),
    ledger: proxyRefs({
      allRows: rows,
      rows: visibleRows,
      columns,
      grid: table,
      locale: ledgerLocale,
      selectRow: selectPlan,
      displayedCount: displayedPlans,
      empty: gridEmpty,
      modelUpdated: onLedgerModelUpdated,
      rowStyles,
      selectedIds,
      syncSelection,
      canReorder: reorderEnabled,
      dragPolicy,
      onReorder,
    }),
    heats: proxyRefs({
      plan: current,
      outsideLedger: locatedOutsideLedger,
      tab,
      rows: heatRows,
      columns: heatColumns,
    }),
    editing: proxyRefs({
      editor: operations.editor,
      actions: operations.actions,
      edit: operations.editPlan,
      copy: operations.copyPlan,
    }),
    inspection: proxyRefs({
      plan: operations.detailPlan,
      visible: operations.detailVisible,
      heats: detailHeatRows,
      open: operations.openDetail,
    }),
  }
}
