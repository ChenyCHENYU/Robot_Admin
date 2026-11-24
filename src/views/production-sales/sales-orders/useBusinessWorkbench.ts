/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\useBusinessWorkbench.ts
 * @Description: 页面组合销售台账、订单草稿、明细和独立业务流程
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import '@robot-admin/naive-ui-components/C_DataPicker/style.css'
import { useResizeObserver } from '@vueuse/core'
import { routeLocationKey } from 'vue-router'
import { createDataPickerField } from '@robot-admin/naive-ui-components/C_DataPicker'
import type { FormInstance } from '@robot-admin/naive-ui-components/C_Form'
import type { SearchConfig } from '@robot-admin/naive-ui-components/C_FormSearch'
import type { DescriptionField } from '@robot-admin/naive-ui-components/C_Descriptions'
import {
  useDictionaries,
  useDictionaryRefresh,
} from '@robot-admin/dictionary/vue'
import {
  useDataResource,
  useValidationScope,
} from '@robot-admin/naive-ui-components/workflows'
import {
  type RowClickEvent,
  useMachTable,
  type RowStyleRule,
} from '@agile-team/mach-table-vue'
import { delayWithSignal } from '@/utils/abort'
import {
  CUSTOMER_COLUMNS,
  FIELD_DICTIONARIES,
  HEADER_FIELDS,
  SEARCH_FIELDS,
  createBusinessOrders,
  customerLabels,
  customerSource,
  decimalFromMillis,
  decimalMillis,
  progressForStatus,
  summarizeBusinessLines,
  type OrderHeader,
  type OrderLine,
  type WorkbenchQuery,
} from './data'
import { formatContractValue } from './contractReview'
import { useOrderContractReview } from './useOrderContractReview'
import { useOrderBatch } from './useOrderBatch'
import { useSalesOperations } from './operations'
import { createSalesColumns } from './d_columns'

const clone = <T>(value: T): T => structuredClone(toRaw(value))

/** 单据工作台只组合公开协议；保存与模拟部分失败仍属于本地业务数据源。 */
export function useBusinessWorkbench() {
  const route = inject(routeLocationKey, undefined)
  const isPreview = computed(() => route?.path.startsWith('/preview/') ?? false)
  const fieldDictionaries = useFieldDictionaries(FIELD_DICTIONARIES)
  const searchFields = fieldDictionaries.search(SEARCH_FIELDS)
  const headerFields = fieldDictionaries.form(HEADER_FIELDS)
  const statusSource = useDictionaries().getDictionary(
    FIELD_DICTIONARIES.status
  )
  if (!statusSource) throw new Error('订单状态字典未配置')
  const orders = ref(createBusinessOrders())
  const activeId = ref('ORDER-1')
  const header = ref(clone(orders.value[0].header))
  const lines = shallowRef<OrderLine[]>([])
  const form = ref<FormInstance<OrderHeader> | null>(null)
  const master = useMachTable<OrderHeader>()
  useDictionaryRefresh([statusSource], () =>
    master.api.value?.view.refreshCells()
  )
  const detail = useMachTable<OrderLine>()
  const payments = useMachTable<{ id: string; stage: string; amount: string }>()
  const activeTab = ref<'lines' | 'payments'>('lines')
  const detailEditing = ref(false)
  // stop() 在无活动编辑器时也返回 false；仅对真正的编辑会话判断提交结果。
  const commitDetailEdit = async (): Promise<boolean> =>
    !detailEditing.value || (await detail.api.value?.editing.stop()) === true
  const onDetailTabKeydown = (event: KeyboardEvent) => {
    const sibling = activeTab.value === 'lines' ? 'payments' : 'lines'
    const keys: Record<string, 'lines' | 'payments'> = {
      ArrowLeft: sibling,
      ArrowRight: sibling,
      Home: 'lines',
      End: 'payments',
    }
    const next = keys[event.key]
    if (!next) return
    event.preventDefault()
    const tabs = (event.currentTarget as HTMLElement).closest(
      '[role="tablist"]'
    )
    activeTab.value = next
    void nextTick(() =>
      tabs
        ?.querySelector<HTMLElement>(`[role="tab"][data-name="${next}"]`)
        ?.focus()
    )
  }
  const container = ref<HTMLElement | null>(null)
  const stacked = ref(false)
  useResizeObserver(container, ([entry]) => {
    if (entry)
      stacked.value =
        entry.contentRect.width > 0 && entry.contentRect.width < 860
  })
  const fullscreen = ref(false)
  /** Teleport 移动前释放按钮焦点，移动后恢复键盘入口且不拉动祖先滚动区。 */
  const toggleDetailFullscreen = (event: MouseEvent): void => {
    const trigger = event.currentTarget as HTMLElement
    trigger.blur()
    fullscreen.value = !fullscreen.value
    void nextTick(() => {
      if (trigger.isConnected && document.activeElement === document.body)
        trigger.focus({ preventScroll: true })
    })
  }
  // 首次进入矮窗口时保留两侧可拖余量；后续尺寸变化仍尊重用户已调整的比例。
  const splitSize = ref(
    typeof window !== 'undefined' &&
      window.matchMedia('(max-height: 900px)').matches
      ? 45
      : 52
  )
  const pendingOrder = ref<string | null>(null)
  let afterOrderSwitch: (() => void) | undefined
  const cancelSwitch = () => {
    pendingOrder.value = null
    afterOrderSwitch = undefined
  }
  const saving = ref(false)
  const initialQuery: WorkbenchQuery = {
    organization: '001',
    keyword: '',
    status: null,
    deliveryRange: null,
  }
  const query = ref(clone(initialQuery))
  const appliedQuery = ref(clone(query.value))
  const selected = computed(() =>
    orders.value.find(order => order.header.id === activeId.value)!
  )
  const scope = useValidationScope()
  const resource = useDataResource({
    key: activeId,
    load: async ({ key, signal }) => {
      await delayWithSignal(100, signal)
      return clone(
        orders.value.find(order => order.header.id === key)?.lines ?? []
      )
    },
  })
  watch(resource.data, value => {
    lines.value = value === undefined ? [] : clone(value)
  })
  const dirty = computed(
    () =>
      resource.data.value !== undefined &&
      JSON.stringify({ header: header.value, lines: lines.value }) !==
        JSON.stringify(selected.value)
  )
  const localDemoNotice = '本地示例 · 所有改动仅保留在当前页面'
  const notice = ref(localDemoNotice)
  const isDefaultNotice = computed(() => notice.value === localDemoNotice)
  const selectedCount = ref(0)
  const selectedKeys = () => detail.api.value?.selection.getIds() ?? []
  const batch = useOrderBatch({
    order: activeId,
    lines,
    notice,
    selectedKeys,
    saving: () => saving.value,
    commitEdit: () => commitDetailEdit(),
    saveLine: (key, patch) => {
      selected.value.lines = selected.value.lines.map(row =>
        row.id === key ? { ...row, ...patch } : row
      )
    },
  })
  const blocked = () => saving.value || batch.busy || resource.loading.value
  const contractReview = useOrderContractReview({
    header,
    persistedStatus: () => selected.value.header.status,
    blocked: () => blocked() || pendingOrder.value !== null,
    notice,
  })
  // 原生 DOM 渲染的操作列按状态刷新，不重建数据列或正在使用的编辑器。
  watch([saving, () => batch.busy, resource.loading], () => {
    void nextTick(() => {
      master.api.value?.view.refreshCells({ columns: ['op'], force: true })
      detail.api.value?.view.refreshCells({ columns: ['op'], force: true })
    })
  })
  const totals = computed(() => summarizeBusinessLines(lines.value))
  const orderCount = computed(() => orders.value.length)
  const currentStatus = computed(() =>
    fieldDictionaries.label('status', header.value.status)
  )
  const filteredOrders = computed(() =>
    orders.value
      .map(order => order.header)
      .filter(row => {
        const customer = customerLabels.get(row.customer ?? '') ?? ''
        const range = appliedQuery.value.deliveryRange
        return (
          (appliedQuery.value.status === null ||
            row.status === appliedQuery.value.status) &&
          (!range || (row.delivery >= range[0] && row.delivery <= range[1])) &&
          `${row.orderNo} ${customer}`.includes(
            appliedQuery.value.keyword.trim()
          )
        )
      })
  )
  watch([activeId, () => filteredOrders.value.length], () => {
    void nextTick(() => {
      const index = filteredOrders.value.findIndex(
        row => row.id === activeId.value
      )
      const api = master.api.value
      if (index < 0 || !api) return
      const pageSize = api.pagination.getPageSize()
      api.pagination.setPage(Math.floor(index / pageSize) + 1)
      api.view.scrollToRow(index % pageSize, 'nearest')
    })
  })
  const applyOrderQuery = async (params: WorkbenchQuery): Promise<void> => {
    appliedQuery.value = clone(params)
    master.api.value?.pagination.setPage(1)
    await nextTick()
  }
  const clearOrderFilters = () => {
    query.value = clone(initialQuery)
    master.api.value?.filtering.setModel(null)
    void applyOrderQuery(query.value)
  }
  const activeOutsideQuery = computed(
    () => !filteredOrders.value.some(row => row.id === activeId.value)
  )
  const searchConfig: SearchConfig<WorkbenchQuery> = {
    density: 'compact',
    layout: 'grid',
    columns: 3,
    fieldMinWidth: 250,
    labelPlacement: 'left',
    labelWidth: 96,
    foldThreshold: 3,
    requireValue: false,
    searchOnReset: true,
    onSearch: applyOrderQuery,
  }
  const renderers = {
    customer: createDataPickerField({
      source: customerSource,
      columns: CUSTOMER_COLUMNS,
      title: '选择订货客户',
      clearable: true,
      mapFields: ({ rows, value }) =>
        value === null ? { region: '' } : rows[0] && { region: rows[0].region },
    }),
  }
  const activate = (id: string) => {
    scope.clear()
    cancelSwitch()
    contractReview.close()
    activeId.value = id
    header.value = clone(selected.value.header)
    selectedCount.value = 0
    batch.close()
    void nextTick(() => {
      form.value?.markAsClean()
      form.value?.clearValidation()
    })
  }
  // 行编辑复用切单保护；保存或放弃后继续打开原先点击的那一行。
  const chooseOrder = async (id: string, after?: () => void) => {
    if (blocked()) return
    if (!(await commitDetailEdit())) return
    if (id === activeId.value) {
      after?.()
      return
    }
    if (dirty.value) {
      pendingOrder.value = id
      afterOrderSwitch = after
    } else {
      activate(id)
      after?.()
    }
  }
  const selectOrder = (event: RowClickEvent<OrderHeader>) => {
    if (event.rowNode.data) void chooseOrder(event.rowNode.data.id)
  }
  // 规则只在当前订单变化时更新，保留稳定行身份；取消切单不误高亮另一个订单。
  const masterRowStyles = computed<readonly RowStyleRule<OrderHeader>[]>(() => {
    const id = activeId.value
    return [
      {
        when: ({ data }) => data.id === id,
        tone: 'info',
        backgroundColor: 'var(--mach-row-selected-bg)',
      },
    ]
  })
  const paymentRows = computed(() => {
    const amounts = new Map<string, bigint>()
    for (const row of lines.value) {
      if (row.amount === null) continue
      amounts.set(
        row.currency,
        (amounts.get(row.currency) ?? 0n) + decimalMillis(row.amount)
      )
    }
    return [...amounts].map(([currency, amount]) => ({
      id: `${activeId.value}-${currency}`,
      stage: currency,
      amount: decimalFromMillis(amount),
    }))
  })
  // 内容少时释放表格高度；加载、错误、空态与局部全屏保留分配的可用视口。
  const shortLines = computed(
    () =>
      !fullscreen.value &&
      !resource.loading.value &&
      resource.error.value === null &&
      lines.value.length > 0 &&
      lines.value.length <= 3
  )
  const shortPayments = computed(
    () =>
      !fullscreen.value &&
      !resource.loading.value &&
      resource.error.value === null &&
      paymentRows.value.length > 0 &&
      paymentRows.value.length <= 3
  )
  const refreshDetailLayout = () => {
    void nextTick(() => {
      detail.api.value?.view.refreshLayout()
      payments.api.value?.view.refreshLayout()
    })
  }
  watch([activeTab, fullscreen], refreshDetailLayout)
  scope.register({
    id: 'header',
    validate: () => form.value?.validate(),
    reveal: issue => {
      const field = issue.target?.field
      return field === 'customer' || field === 'owner'
        ? (form.value?.revealField(field) ?? false)
        : false
    },
  })
  scope.register({
    id: 'lines',
    validate: () =>
      lines.value.flatMap(row => {
        const invalid =
          row.quantity === null || decimalMillis(row.quantity) < 0n
        return invalid
          ? [
              {
                key: `${row.id}:quantity`,
                source: 'lines',
                message: `${row.id}：请填写非负数量（零是有效值）`,
                target: { tab: 'lines', rowKey: row.id, field: 'quantity' },
              },
            ]
          : []
      }),
    reveal: async issue => {
      activeTab.value = 'lines'
      await nextTick()
      detail.api.value?.view.refreshLayout()
      const index = lines.value.findIndex(
        row => row.id === issue.target?.rowKey
      )
      if (index < 0) return false
      detail.api.value?.view.scrollToRow(index, 'middle')
      return (
        detail.api.value?.editing.startCell({
          rowIndex: index,
          colId: issue.target?.field ?? 'quantity',
        }) ?? false
      )
    },
  })
  const syncLineEdit = () => {
    const updated: OrderLine[] = []
    detail.api.value?.rows.forEach(node => {
      if (node.data) updated.push(clone(node.data))
    })
    lines.value = updated
  }
  const save = async (): Promise<boolean> => {
    if (blocked()) return false
    if (!(await commitDetailEdit())) return false
    saving.value = true
    try {
      if (!(await scope.validate())) {
        notice.value = '请点击校验摘要定位并补齐内容'
        return false
      }
      header.value.progress = progressForStatus(header.value)
      selected.value.header = clone(header.value)
      selected.value.lines = clone(lines.value)
      detail.api.value?.editing.markSaved()
      form.value?.markAsClean()
      scope.clear()
      notice.value = '整单保存成功（本地示例）'
      return true
    } finally {
      saving.value = false
    }
  }
  const saveAndSwitch = async () => {
    const target = pendingOrder.value
    if (!target) return
    const after = afterOrderSwitch
    if (await save()) {
      activate(target)
      after?.()
    } else cancelSwitch()
  }
  const discardAndSwitch = () => {
    const after = afterOrderSwitch
    if (pendingOrder.value) {
      activate(pendingOrder.value)
      after?.()
    }
  }
  const selectAllLines = () => {
    detail.api.value?.selection.selectAll()
    selectedCount.value = detail.api.value?.selection.getIds().length ?? 0
  }
  const restore = () => {
    scope.clear()
    contractReview.close()
    batch.reset()
    header.value = clone(selected.value.header)
    form.value?.clearValidation()
    void resource.reload()
  }
  const operations = useSalesOperations({
    orders,
    header,
    lines,
    activeId,
    notice,
    dirty,
    activate,
    requestOrder: chooseOrder,
    blocked,
    commitCell: commitDetailEdit,
    selectedKeys: () => (selectedCount.value ? selectedKeys() : []),
    resetLineState: () => {
      detail.api.value?.selection.clear()
      selectedCount.value = 0
      batch.reset()
      scope.clear()
    },
  })
  const {
    masterColumns,
    detailColumns,
    readonlyDetailColumns,
    paymentColumns,
  } = createSalesColumns(operations, fieldDictionaries, blocked)
  const { labels: detailLabels } = useDictLabels(
    () => operations.detailOrder.value?.header,
    FIELD_DICTIONARIES,
    { enabled: operations.detailVisible }
  )
  const orderDescriptions = [
    { key: 'orderNo', label: '订单号', group: '订货信息', copyable: true },
    { key: 'contractNo', label: '合同号', group: '订货信息', copyable: true },
    {
      key: 'customer',
      label: '客户',
      group: '订货信息',
      format: row => customerLabels.get(row.customer ?? '') ?? '未选择',
    },
    { key: 'owner', label: '业务人员', group: '订货信息' },
    { key: 'region', label: '销售区域', group: '订货信息' },
    {
      key: 'grade',
      label: '钢种 / 规格',
      group: '交付信息',
      format: row => `${row.grade} / ${row.section}`,
    },
    { key: 'delivery', label: '交付日期', group: '交付信息' },
    {
      key: 'targetWeight',
      label: '合同量',
      group: '交付信息',
      format: row => `${formatContractValue(row.targetWeight)} t`,
    },
    {
      key: 'status',
      label: '状态',
      group: '交付信息',
      format: () => detailLabels.value.status,
    },
  ] satisfies DescriptionField<OrderHeader>[]
  return {
    container,
    form,
    isPreview,
    batch,
    contractReview,
    layout: proxyRefs({
      stacked,
      shortLines,
      shortPayments,
      tab: activeTab,
      onDetailTabKeydown,
      fullscreen,
      toggleFullscreen: toggleDetailFullscreen,
      splitSize,
    }),
    ledger: proxyRefs({
      grid: master,
      columns: masterColumns,
      rowStyles: masterRowStyles,
      selectRow: selectOrder,
      rows: filteredOrders,
      total: orderCount,
      activeOutsideQuery,
      editor: operations.orderEditor,
      actions: operations.orderActions,
      openDetail: operations.openDetail,
      copy: operations.copyOrder,
      remove: operations.removeOrder,
    }),
    search: proxyRefs({
      query,
      config: searchConfig,
      fields: searchFields,
      clear: clearOrderFilters,
    }),
    draft: proxyRefs({
      header,
      fields: headerFields,
      activeId,
      renderers,
      currentStatus,
      notice,
      isDefaultNotice,
      dirty,
      saving,
      pendingOrder,
      validation: scope,
      save,
      restore,
      cancelSwitch,
      saveAndSwitch,
      discardAndSwitch,
      chooseOrder,
    }),
    lines: proxyRefs({
      grid: detail,
      rows: lines,
      columns: detailColumns,
      editing: detailEditing,
      resource,
      actions: operations.lineActions,
      editor: operations.lineEditor,
      selectedCount,
      syncEdit: syncLineEdit,
      selectAll: selectAllLines,
      totals,
    }),
    payments: proxyRefs({
      grid: payments,
      columns: paymentColumns,
      rows: paymentRows,
    }),
    inspection: proxyRefs({
      visible: operations.detailVisible,
      order: operations.detailOrder,
      line: operations.lineDetail,
      lineColumns: readonlyDetailColumns,
      descriptions: orderDescriptions,
    }),
  }
}
