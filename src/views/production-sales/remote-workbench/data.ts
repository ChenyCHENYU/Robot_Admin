/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\data.ts
 * @Description: 远程订单主从、动态字段快照与独立字典的直接组合
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueColumns,
  indexColumn,
  selectionColumn,
  actionsColumn,
  useMachTable,
  type RowClickEvent,
  type RowStyleRule,
} from '@agile-team/mach-table-vue'
import { useMachTableQuery } from '@agile-team/mach-table-vue/workflows'
import type { DialogReactive } from 'naive-ui'
import { useResizeObserver } from '@vueuse/core'
import { routeLocationKey } from 'vue-router'
import { createDictionaryStore } from '@robot-admin/dictionary'
import {
  useDictionary,
  useDictionaryRefresh,
  useDictLabels,
} from '@robot-admin/dictionary/vue'
import type {
  FormConfig,
  FormInstance,
  FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type {
  SearchConfig,
  SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import {
  DEFAULT_FAULTS,
  createRemoteOrderDemoApi,
  readDetailSnapshot,
  toDetailPage,
  toOrderPage,
  type DetailVariant,
  type OrderDraft,
  type OrderSearch,
  type RemoteField,
  type RemoteLine,
  type RemoteOrder,
} from './api'
import {
  BUSINESS_FORM,
  BUSINESS_GRID,
  weightCodec,
  recordLink,
  statusTag,
} from '../shared/presentation'
import { BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import { isAbortError } from '@/utils/abort'

export { BUSINESS_DETAIL, BUSINESS_DETAIL_DIALOG } from '../shared/presentation'
export { actionIcons } from '../shared/actionIcons'

export const GRID_CONFIG = {
  ...BUSINESS_GRID,
  multiSort: true,
  defaultColDef: { sortable: true, filter: false },
}
export const VARIANTS = [
  { value: 'delivery', label: '交付明细' },
  { value: 'quality', label: '质量追溯' },
]
const DRAFT_FIELDS: FormOption<OrderDraft>[] = [
  {
    prop: 'owner',
    label: '业务人员',
    type: 'input',
    rules: [{ required: true, message: '请填写业务人员', trigger: 'blur' }],
    attrs: { maxlength: 30, inputProps: { 'aria-label': '订单业务人员' } },
  },
  {
    prop: 'urgent',
    label: '交付要求',
    type: 'select',
    attrs: { clearable: false, 'aria-label': '订单交付要求' },
  },
  {
    prop: 'note',
    label: '订单备注',
    type: 'input',
    attrs: { maxlength: 200, inputProps: { 'aria-label': '订单备注' } },
  },
]

/** 远程主从只组合公开 query bindings；独立字典通过普通格式化函数消费。 */
export function useRemoteWorkbench() {
  const route = inject(routeLocationKey, undefined)
  const isPreview = computed(() => route?.path.startsWith('/preview/') ?? false)
  const container = ref<HTMLElement | null>(null)
  const stacked = ref(false)
  useResizeObserver(container, entries => {
    const width = entries[0]?.contentRect.width ?? 0
    stacked.value = width > 0 && width < 1040
  })
  const message = useMessage()
  const dialog = useDialog()
  const faults = reactive({ ...DEFAULT_FAULTS })
  const api = createRemoteOrderDemoApi(faults)
  const activeOrder = shallowRef<RemoteOrder | null>(null)
  const activeOrderId = computed(() => activeOrder.value?.id ?? '')
  const query = ref<OrderSearch>({ keyword: '', status: null, urgent: null })
  const appliedQuery = shallowRef<OrderSearch>({ ...query.value })
  const variant = ref<DetailVariant>('delivery')
  const acceptedVariant = ref<DetailVariant>('delivery')
  const detailFields = shallowRef<RemoteField[]>([])
  const draft = ref<OrderDraft>({ owner: '', urgent: false, note: '' })
  const savedDraft = shallowRef<OrderDraft>({ ...draft.value })
  const form = ref<FormInstance<OrderDraft> | null>(null)
  const saving = ref(false)
  const removingId = ref<string | null>(null)
  const busy = computed(() => saving.value || removingId.value !== null)
  const confirming = ref(false)
  let confirmation: DialogReactive | null = null
  const detailVisible = ref(false)
  const detailRecord = shallowRef<RemoteOrder | null>(null)
  const masterGrid = useMachTable<RemoteOrder>()
  const detailGrid = useMachTable<RemoteLine>()
  const saveController = new AbortController()
  const store = createDictionaryStore(
    {},
    {
      load: (name, { signal }) => api.getDictionaryOptionsApi(name, signal),
    }
  )
  const statusSource = store.getDictionary('remote-status')!
  const urgentSource = store.getDictionary('remote-urgent')!
  const status = useDictionary(statusSource)
  const urgent = useDictionary(urgentSource)
  const { labels: detailLabels } = useDictLabels(
    detailRecord,
    {
      status: statusSource,
      urgent: urgentSource,
    },
    { provider: store }
  )
  const dirty = computed(
    () =>
      draft.value.owner !== savedDraft.value.owner ||
      draft.value.urgent !== savedDraft.value.urgent ||
      draft.value.note !== savedDraft.value.note
  )
  const orders = useMachTableQuery<RemoteOrder, OrderSearch>({
    rowKey: 'id',
    query: appliedQuery,
    pageSize: 6,
    pageSizeOptions: [6, 12],
    keepPreviousData: true,
    request: async params => toOrderPage(await api.getOrdersApi(params)),
    errorOverlay: () => '订单查询暂不可用，请点击上方“重试订单”。',
    onSuccess: result => {
      if (!activeOrder.value && result.rows[0]) activateOrder(result.rows[0])
      const refreshed = result.rows.find(
        row => row.id === activeOrder.value?.id
      )
      if (refreshed && !dirty.value && !saving.value) {
        activeOrder.value = refreshed
        draft.value = {
          owner: refreshed.owner,
          urgent: refreshed.urgent,
          note: refreshed.note,
        }
        savedDraft.value = { ...draft.value }
      }
    },
  })
  const details = useMachTableQuery<
    RemoteLine,
    { orderId: string; variant: DetailVariant }
  >({
    rowKey: 'id',
    query: () => ({ orderId: activeOrderId.value, variant: variant.value }),
    immediate: false,
    pageSize: 4,
    pageSizeOptions: [4, 8],
    keepPreviousData: true,
    request: async params => toDetailPage(await api.getOrderLinesApi(params)),
    errorOverlay: () =>
      '明细加载失败，请点击上方“重试明细”；订单列表仍可使用。',
    onSuccess: result => {
      // 只有 query 接受的最新结果才更新字段；旧请求迟到与空页都沿用同一协议。
      const snapshot = readDetailSnapshot(result)
      detailFields.value = snapshot.columns
      acceptedVariant.value = snapshot.variant
    },
  })

  useDictionaryRefresh([statusSource, urgentSource], () => {
    masterGrid.api.value?.view.refreshCells()
    detailGrid.api.value?.view.refreshCells()
  })
  // 外部提交/草稿状态只刷新可见操作单元格，避免每次输入重建列或重查数据。
  watch([busy, dirty], () =>
    masterGrid.api.value?.view.refreshCells({ columns: ['op'] })
  )
  const currentOutsidePage = computed(
    () =>
      activeOrder.value !== null &&
      !orders.loading.value &&
      !orders.rows.value.some(row => row.id === activeOrder.value?.id)
  )
  onScopeDispose(() => {
    saveController.abort()
    confirmation?.destroy()
    confirmation = null
    store.destroy()
  })

  /** 页面只拥有一个确认会话，关闭后才能创建下一次确认。 */
  function afterConfirmation() {
    confirming.value = false
    confirmation = null
  }

  /** 切换立即取消旧明细，清空跨单选择与行数据，再交由 query 自动回到首页。 */
  function activateOrder(row: RemoteOrder) {
    details.abort()
    details.clearSelection()
    details.rows.value = []
    details.total.value = 0
    activeOrder.value = row
    draft.value = { owner: row.owner, urgent: row.urgent, note: row.note }
    savedDraft.value = { ...draft.value }
    form.value?.clearValidation()
  }

  /** 未保存草稿必须明确放弃后才换单；同一时刻只显示一个确认框。 */
  function chooseOrder(row: RemoteOrder) {
    if (row.id === activeOrder.value?.id || busy.value || confirming.value)
      return
    if (!dirty.value) {
      activateOrder(row)
      return
    }
    confirming.value = true
    confirmation = dialog.warning({
      title: '切换订单前确认',
      content: `${activeOrder.value?.orderNo} 有未保存修改，放弃后切换到 ${row.orderNo}？`,
      positiveText: '放弃并切换',
      negativeText: '继续编辑',
      ...BUSINESS_DIALOG_BUTTONS,
      onPositiveClick: () => activateOrder(row),
      onAfterLeave: afterConfirmation,
    })
  }

  /** 订单编号只打开详情，点击其他单元格才联动主从。 */
  function openDetail(row: RemoteOrder) {
    detailRecord.value = { ...row }
    detailVisible.value = true
  }

  /** 查询条件先提交快照；分页和排序沿用 hook 自己的服务端协议。 */
  async function search(values: OrderSearch) {
    appliedQuery.value = { ...values }
    await nextTick()
  }

  /** 恢复当前单据草稿，不影响主从查询或其他订单。 */
  function restoreDraft() {
    draft.value = { ...savedDraft.value }
    form.value?.clearValidation()
  }

  /** 校验由表单就地呈现，不把业务校验错误提升为请求失败。 */
  async function validateDraft() {
    try {
      await form.value?.validate()
      return true
    } catch {
      return false
    }
  }

  /** 本地保存从校验开始锁定，切单不会穿过异步校验写入另一张单据。 */
  async function saveDraft() {
    if (!activeOrder.value || busy.value || !dirty.value) return
    const { id } = activeOrder.value
    saving.value = true
    try {
      if (!(await validateDraft())) return
      const row = await api.saveOrderDraftApi(
        id,
        { ...draft.value },
        saveController.signal
      )
      if (saveController.signal.aborted) return
      activeOrder.value = row
      savedDraft.value = {
        owner: row.owner,
        urgent: row.urgent,
        note: row.note,
      }
      orders.rows.value = orders.rows.value.map(item =>
        item.id === id ? row : item
      )
      message.success('当前订单已保存到本地示例')
    } catch (error) {
      if (!isAbortError(error)) message.error('保存失败，草稿已保留，请重试')
    } finally {
      saving.value = false
    }
  }

  /** 删除当前单据后清空工作区，下一次有效主表响应再选中首项。 */
  function clearOrder() {
    details.abort()
    details.clearSelection()
    details.rows.value = []
    details.total.value = 0
    activeOrder.value = null
    draft.value = { owner: '', urgent: false, note: '' }
    savedDraft.value = { ...draft.value }
  }

  /** 取消不变更数据；只提供待下达订单的本地删除。 */
  function removeOrder(row: RemoteOrder) {
    if (row.status !== 0 || busy.value || confirming.value) return
    if (row.id === activeOrder.value?.id && dirty.value) return
    confirming.value = true
    confirmation = dialog.warning({
      title: '删除订单',
      content: `确认删除 ${row.orderNo}？只删除本地示例数据，此操作不可撤销。`,
      positiveText: '确认删除',
      negativeText: '取消',
      ...BUSINESS_DIALOG_BUTTONS,
      onPositiveClick: () => commitRemove(row),
      onAfterLeave: afterConfirmation,
    })
  }

  /** 成功后仅 reload，页码回退由 query 依据服务器 total 处理。 */
  async function commitRemove(row: RemoteOrder) {
    removingId.value = row.id
    try {
      await api.removeOrderApi(row.id, saveController.signal)
      if (saveController.signal.aborted) return
      orders.rows.value = orders.rows.value.filter(item => item.id !== row.id)
      if (activeOrder.value?.id === row.id) clearOrder()
      if (detailRecord.value?.id === row.id) detailVisible.value = false
      await orders.reload()
      message.success('订单已从本地示例删除')
    } catch (error) {
      if (!isAbortError(error)) message.error('删除失败，请重试')
      return false
    } finally {
      removingId.value = null
    }
  }

  /** 状态与枚举分开呈现；未知值保留原码，字典迟到只重绘可见单元格。 */
  function statusCell(value: unknown) {
    const types = ['info', 'warning', 'success'] as const
    return statusTag(status.label(value), types[Number(value)] ?? 'default')
  }

  /** 后端字段只翻译为普通列配置，稳定 colId 在字段增删和换序后不变。 */
  function dynamicColumn(field: RemoteField) {
    return {
      field: field.key,
      colId: field.key,
      headerName: field.title,
      ...(field.kind === 'number' && {
        valueFormatter: ({ value }: { value: unknown }) =>
          weightCodec.format(typeof value === 'number' ? value : null),
      }),
      ...(field.kind === 'boolean' && {
        valueFormatter: ({ value }: { value: unknown }) => urgent.label(value),
      }),
      ...(field.kind === 'status' && {
        valueFormatter: ({ value }: { value: unknown }) => status.label(value),
        render: (row: RemoteLine) => statusCell(row[field.key]),
      }),
    }
  }

  const orderColumns = defineVueColumns<RemoteOrder>([
    indexColumn({ headerName: '序号', width: 48 }),
    {
      field: 'orderNo',
      headerName: '订单编号',
      render: row => recordLink(row.orderNo, () => openDetail(row)),
    },
    { field: 'customer', headerName: '订货客户', flex: 1 },
    {
      field: 'status',
      headerName: '计划状态',
      valueFormatter: ({ value }) => status.label(value),
      render: row => statusCell(row.status),
    },
    {
      field: 'weight',
      headerName: '订货量 (t)',
      valueFormatter: ({ value }) => weightCodec.format(value),
    },
    { field: 'delivery', headerName: '交付日期' },
    actionsColumn<RemoteOrder>({
      width: 64,
      actions: [
        {
          icon: 'delete',
          label: '删除订单',
          variant: 'danger',
          disabled: ({ data }) =>
            !data ||
            data.status !== 0 ||
            busy.value ||
            (data.id === activeOrder.value?.id && dirty.value),
          onClick: ({ data }) => data && removeOrder(data),
        },
      ],
    }),
  ])
  const detailColumns = computed(() =>
    defineVueColumns<RemoteLine>([
      selectionColumn(),
      indexColumn({ headerName: '序号', width: 48 }),
      ...detailFields.value.map(dynamicColumn),
    ])
  )
  const rowStyles = computed<readonly RowStyleRule<RemoteOrder>[]>(() => [
    {
      when: ({ data }) => data?.id === activeOrder.value?.id,
      tone: 'info',
    },
  ])
  const searchFields = computed<SearchFormItem<OrderSearch>[]>(() => [
    {
      prop: 'keyword',
      label: '订单 / 客户',
      type: 'input',
      attrs: { inputProps: { 'aria-label': '远程订单查询' } },
    },
    {
      prop: 'status',
      label: '计划状态',
      type: 'select',
      list: status.options.value.map(item => ({
        ...item,
        value: Number(item.value),
      })),
      optionsState: {
        loading: status.loading.value,
        error: status.error.value,
        retry: status.reload,
      },
    },
    {
      prop: 'urgent',
      label: '交付要求',
      type: 'select',
      list: urgent.options.value.map(item => ({
        ...item,
        value: Boolean(item.value),
      })),
      optionsState: {
        loading: urgent.loading.value,
        error: urgent.error.value,
        retry: urgent.reload,
      },
    },
  ])
  const searchConfig: SearchConfig<OrderSearch> = {
    density: 'compact',
    layout: 'grid',
    columns: 3,
    labelWidth: 78,
    fieldMinWidth: 240,
    searchOnReset: true,
    onSearch: search,
  }
  const formFields = computed<FormOption<OrderDraft>[]>(() =>
    DRAFT_FIELDS.map(field =>
      field.prop === 'urgent'
        ? {
            ...field,
            children: urgent.options.value.map(item => ({ ...item })),
            optionsState: {
              loading: urgent.loading.value,
              error: urgent.error.value,
              retry: urgent.reload,
            },
          }
        : field
    )
  )
  const formConfig = computed<FormConfig<OrderDraft>>(() => ({
    ...BUSINESS_FORM,
    showActions: false,
    disabled: busy.value,
  }))

  /** 异常演练局部触发，仅影响下一次指定资源请求。 */
  function exercise(
    kind: 'orders' | 'details' | 'empty' | 'dictionary' | 'slow'
  ) {
    if (kind === 'orders') {
      faults.failNextOrders = true
      void orders.reload()
      return
    }
    if (kind === 'dictionary') {
      faults.failNextDictionary = true
      void status.reload().catch(() => undefined)
      return
    }
    if (!activeOrder.value) return
    if (kind === 'slow') {
      faults.slowNextDetail = true
      faults.ignoreCancellation = true
    }
    if (kind === 'details') faults.failNextDetail = true
    if (kind === 'empty') faults.emptyNextDetail = true
    void details.reload({ resetPage: true })
  }

  /** 字典失败局部重试，不重新加载订单或明细。 */
  function retryDictionary() {
    void status.reload().catch(() => undefined)
  }

  const onOrderClicked = (event: RowClickEvent<RemoteOrder>) => {
    if (event.rowNode.data) chooseOrder(event.rowNode.data)
  }
  return {
    isPreview,
    container,
    stacked,
    api,
    faults,
    query,
    orders,
    details,
    masterGrid,
    detailGrid,
    activeOrder,
    currentOutsidePage,
    variant,
    acceptedVariant,
    orderColumns,
    detailColumns,
    rowStyles,
    searchFields,
    searchConfig,
    form,
    draft,
    dirty,
    saving,
    busy,
    formFields,
    formConfig,
    detailVisible,
    detailRecord,
    detailLabels,
    status,
    urgent,
    chooseOrder,
    onOrderClicked,
    openDetail,
    restoreDraft,
    saveDraft,
    removeOrder,
    exercise,
    retryDictionary,
  }
}
