/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\useRemoteWorkbench.ts
 * @Description: 远程订单主从、动态字段快照与独立字典的直接组合
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueColumns,
  indexColumn,
  actionsColumn,
  useMachTable,
  type RowClickEvent,
  type RowStyleRule,
} from '@agile-team/mach-table-vue'
import { useMachTableQuery } from '@agile-team/mach-table-vue/workflows'
import type { DialogOptions, DialogReactive } from 'naive-ui'
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
  FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type {
  SearchConfig,
  SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import {
  DEFAULT_FAULTS,
  createRemoteOrderDemoApi,
  toOrderPage,
  type OrderDraft,
  type OrderSearch,
  type RemoteOrder,
} from './api'
import {
  BUSINESS_FORM,
  weightCodec,
  recordLink,
  statusTag,
} from '../shared/presentation'
import { BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import { isAbortError } from '@/utils/abort'
import { DRAFT_FIELDS } from './data'
import { useRemoteOrderDraft } from './useRemoteOrderDraft'
import { useRemoteOrderLines } from './useRemoteOrderLines'

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
  const query = ref<OrderSearch>({ keyword: '', status: null, urgent: null })
  const appliedQuery = shallowRef<OrderSearch>({ ...query.value })
  const removingId = ref<string | null>(null)
  const confirming = ref(false)
  let confirmation: DialogReactive | null = null
  const detailVisible = ref(false)
  const detailRecord = shallowRef<RemoteOrder | null>(null)
  const masterGrid = useMachTable<RemoteOrder>()
  const removeController = new AbortController()
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
  const editing = useRemoteOrderDraft({
    // Lookup at execution time so the simulated service remains the only data owner.
    saveOrder: (...args) => api.saveOrderDraftApi(...args),
    canSave: () => !busy.value && !confirming.value,
    onSaved: row => {
      orders.rows.value = orders.rows.value.map(item =>
        item.id === row.id ? row : item
      )
    },
  })
  const { order: activeOrder, dirty, saving, form } = editing
  const busy = computed(() => saving.value || removingId.value !== null)
  const activeOrderId = computed(() => activeOrder.value?.id ?? '')
  const details = useRemoteOrderLines({
    orderId: activeOrderId,
    request: params => api.getOrderLinesApi(params),
    statusLabel: status.label,
    urgentLabel: urgent.label,
    statusCell,
  })
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
      if (refreshed) editing.refresh(refreshed)
    },
  })
  useDictionaryRefresh([statusSource, urgentSource], () => {
    masterGrid.api.value?.view.refreshCells()
    details.grid.api.value?.view.refreshCells()
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
    removeController.abort()
    confirmation?.destroy()
    confirmation = null
    store.destroy()
  })

  /** 回调必须来自仍有效的确认框，离开页面后迟到的确认不能提交操作。 */
  function confirm(
    options: Pick<
      DialogOptions,
      'title' | 'content' | 'positiveText' | 'negativeText'
    >,
    action: () => void | Promise<false | undefined>
  ) {
    confirming.value = true
    const active = dialog.warning({
      ...BUSINESS_DIALOG_BUTTONS,
      ...options,
      onPositiveClick: () => {
        if (confirmation === active && !removeController.signal.aborted)
          return action()
      },
      onAfterLeave: () => {
        if (confirmation !== active) return
        confirmation = null
        confirming.value = false
      },
    })
    confirmation = active
  }

  /** 切换立即取消旧明细，清空跨单选择与行数据，再交由 query 自动回到首页。 */
  function activateOrder(row: RemoteOrder) {
    details.clearRows()
    editing.reset(row)
  }

  /** 未保存草稿必须明确放弃后才换单；同一时刻只显示一个确认框。 */
  function chooseOrder(row: RemoteOrder) {
    if (row.id === activeOrder.value?.id || busy.value || confirming.value)
      return
    if (!dirty.value) {
      activateOrder(row)
      return
    }
    confirm(
      {
        title: '切换订单前确认',
        content: `${activeOrder.value?.orderNo} 有未保存修改，放弃后切换到 ${row.orderNo}？`,
        positiveText: '放弃并切换',
        negativeText: '继续编辑',
      },
      () => activateOrder(row)
    )
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

  /** 删除当前单据后清空工作区，下一次有效主表响应再选中首项。 */
  function clearOrder() {
    details.clearRows()
    editing.reset(null)
  }

  /** 取消不变更数据；只提供待下达订单的本地删除。 */
  function removeOrder(row: RemoteOrder) {
    if (row.status !== 0 || busy.value || confirming.value) return
    if (row.id === activeOrder.value?.id && dirty.value) return
    confirm(
      {
        title: '删除订单',
        content: `确认删除 ${row.orderNo}？只删除本地示例数据，此操作不可撤销。`,
        positiveText: '确认删除',
        negativeText: '取消',
      },
      () => commitRemove(row)
    )
  }

  /** 成功后仅 reload，页码回退由 query 依据服务器 total 处理。 */
  async function commitRemove(row: RemoteOrder) {
    removingId.value = row.id
    try {
      await api.removeOrderApi(row.id, removeController.signal)
      if (removeController.signal.aborted) return
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

  const orderColumns = defineVueColumns<RemoteOrder>([
    indexColumn({ headerName: '序号', width: 48 }),
    {
      field: 'orderNo',
      headerName: '订单编号',
      render: row => recordLink(row.orderNo, () => openDetail(row)),
    },
    { field: 'customer', headerName: '订货客户' },
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
    void details.query.reload({ resetPage: true })
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
    form,
    layout: proxyRefs({ stacked }),
    ledger: proxyRefs({
      query: orders,
      grid: masterGrid,
      columns: orderColumns,
      rowStyles,
      currentOutsidePage,
      choose: chooseOrder,
      select: onOrderClicked,
      remove: removeOrder,
    }),
    search: proxyRefs({
      model: query,
      fields: searchFields,
      config: searchConfig,
    }),
    details,
    editor: proxyRefs({
      order: activeOrder,
      draft: editing.model,
      dirty,
      busy,
      saving,
      fields: formFields,
      config: formConfig,
      save: editing.save,
      restore: editing.restore,
    }),
    inspection: proxyRefs({
      visible: detailVisible,
      record: detailRecord,
      labels: detailLabels,
      open: openDetail,
    }),
    dictionary: { status, urgent, retry: retryDictionary },
    exercises: { run: exercise, api, faults },
  }
}
