/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\data.ts
 * @Description: 本地单据工作台：统一字段语义、主从资源、校验导航及可重试批改
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import '@robot-admin/naive-ui-components/C_DataPicker/style.css'
import { useResizeObserver } from '@vueuse/core'
import {
  C_DataPicker,
  type DataPickerSource,
} from '@robot-admin/naive-ui-components/C_DataPicker'
import {
  type FormConfig,
  type FormInstance,
  type FormOption,
  type FormRenderer,
} from '@robot-admin/naive-ui-components/C_Form'
import {
  type SearchConfig,
  type SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import { DICTIONARY_PROVIDER_KEY } from '@robot-admin/naive-ui-components/config'
import {
  createBatchPatch,
  createNumberCodec,
  type BatchOperationResult,
  type DictionarySource,
} from '@robot-admin/naive-ui-components/data'
import {
  useDataResource,
  useValidationScope,
} from '@robot-admin/naive-ui-components/workflows'
import {
  defineVueColumns,
  indexColumn,
  selectionColumn,
  useMachTable,
  type RowStyleRule,
} from '@agile-team/mach-table-vue'
import {
  createDictionaryColumn,
  summarizeRows,
  type SummaryNumericStrategy,
} from '@agile-team/mach-table-vue/business'

export interface Customer {
  id: string
  code: string
  name: string
}
export interface OrderHeader {
  id: string
  orderNo: string
  customer: string | null
  status: number
  owner: string
  note: string | null
  contractNo: string
  grade: string
  section: string
  region: string
  delivery: string
  targetWeight: number
  progress: number
}
export interface OrderLine {
  id: string
  product: string
  quantity: string | null
  amount: string | null
  currency: string
  unit: string
  note: string | null
}
interface BusinessOrder {
  header: OrderHeader
  lines: OrderLine[]
}
interface WorkbenchQuery {
  organization: string
  keyword: string
  status: number | null
  enabled: boolean | null
}
type BatchMode = 'keep' | 'set' | 'clear'
interface BatchPlan {
  order: string
  keys: string[]
  patch: Partial<OrderLine>
  before: Map<string, string | null>
}

/** 成功项不重发；预览后又修改的备注不能被旧批改计划覆盖。 */
export function getBatchSubmission(
  plan: BatchPlan,
  lines: readonly OrderLine[],
  results: readonly BatchOperationResult[],
  retry?: readonly (string | number)[]
) {
  const requested = retry
    ? plan.keys.filter(key => retry.includes(key))
    : plan.keys
  const completed = new Set(
    results
      .filter(result => result.status === 'success')
      .map(result => result.key)
  )
  const keys = requested.filter(key => !completed.has(key))
  const notes = new Map(lines.map(row => [row.id, row.note]))
  const stale = keys.some(key => {
    const expected = retry ? plan.patch.note : plan.before.get(key)
    return !notes.has(key) || !Object.is(notes.get(key), expected)
  })
  return { keys, stale }
}

export const CUSTOMERS: Customer[] = [
  { id: 'CU-001', code: '0001', name: '星海科技' },
  { id: 'CU-002', code: '0002', name: '云帆智造' },
  { id: 'CU-003', code: '0003', name: '远川能源' },
]
export const STATUS_OPTIONS = [
  { value: 0, label: '待下达' },
  { value: 1, label: '执行中' },
  { value: 2, label: '已完成' },
]
const statusSource: DictionarySource = { getOptions: () => STATUS_OPTIONS }
const statusLabels = new Map(
  STATUS_OPTIONS.map(option => [option.value, option.label])
)
const customerLabels = new Map(
  CUSTOMERS.map(customer => [customer.id, customer.name])
)
export const moneyCodec = createNumberCodec({
  storage: 'decimal-string',
  fractionDigits: 2,
  useGrouping: true,
})
export const quantityCodec = createNumberCodec({
  storage: 'decimal-string',
  fractionDigits: 3,
})
const exactCodec = createNumberCodec({ storage: 'decimal-string' })
const clone = <T>(value: T): T => structuredClone(toRaw(value))

/** 示例数据使用业务主键；零数量与未填写分别保留 '0' 和 null。 */
export function createBusinessOrders(): BusinessOrder[] {
  return Array.from({ length: 18 }, (_, index) => {
    const customer = CUSTOMERS[index % CUSTOMERS.length]
    const status = index < 3 ? index : (index % 2) + 1
    return {
      header: {
        id: `ORDER-${index + 1}`,
        orderNo: `SO-2026-${String(index + 1).padStart(3, '0')}`,
        customer: customer.id,
        status,
        owner: '陈雨',
        note: null,
        contractNo: `HT-2610-${String(index + 101)}`,
        grade: ['Q355B', 'Q235B', 'HRB400E'][index % 3],
        section: ['10 × 1500 × 6000', '8 × 1500 × 6000', 'Φ 20 × 9000'][
          index % 3
        ],
        region: ['华东', '华南', '华北'][index % 3],
        delivery: `2026-11-${String((index % 12) + 1).padStart(2, '0')}`,
        targetWeight: 128 + index * 12.5,
        progress: status === 2 ? 100 : status === 0 ? 0 : 35 + (index % 5) * 10,
      },
      lines: [
        {
          id: `ORDER-${index + 1}-L01`,
          product: '精整卷材 A',
          quantity: '0',
          amount: '1.005',
          currency: 'CNY',
          unit: 't',
          note: '零数量样例',
        },
        {
          id: `ORDER-${index + 1}-L02`,
          product: '冷轧板材 B',
          quantity: '12.125',
          amount: '12000.675',
          currency: 'CNY',
          unit: 't',
          note: '交期确认中',
        },
        {
          id: `ORDER-${index + 1}-L03`,
          product: '边角料 C',
          quantity: null,
          amount: '25.33',
          currency: 'CNY',
          unit: 't',
          note: null,
        },
      ],
    }
  })
}

/** 将示例的最多三位存储小数交给 BigInt 累加，不经过二进制浮点。 */
export function decimalMillis(value: unknown): bigint {
  const text = exactCodec.parse(value)
  if (text === null) return 0n
  const negative = text.startsWith('-')
  const [whole, fraction = ''] = text.replace(/^-/, '').split('.')
  if (fraction.length > 3)
    throw new RangeError('本示例的数量和金额最多支持三位存储小数')
  const result = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'))
  return negative ? -result : result
}
const decimalFromMillis = (value: bigint): string => {
  const sign = value < 0n ? '-' : ''
  const raw = (value < 0n ? -value : value).toString().padStart(4, '0')
  return `${sign}${raw.slice(0, -3)}.${raw.slice(-3)}`
}
const exactSummary: SummaryNumericStrategy<bigint> = {
  zero: () => 0n,
  add: (total, value) => total + decimalMillis(value),
  // 此示例只声明 sum/count，无比率指标；比率需单独提供领域精度策略。
  divide: () => {
    throw new TypeError('本示例未配置比率指标')
  },
}
/** 当前明细按币种和单位分组合计，scope 仅描述已提供的当前页。 */
export function summarizeBusinessLines(lines: readonly OrderLine[]) {
  return summarizeRows(lines, {
    scope: 'page',
    groupBy: row => `${row.currency}/${row.unit}`,
    numeric: exactSummary,
    metrics: [
      { id: 'amount', kind: 'sum', value: row => row.amount },
      { id: 'quantity', kind: 'sum', value: row => row.quantity },
      { id: 'count', kind: 'count' },
    ],
  }).groups.map(group => ({
    key: group.key,
    count: group.rowCount,
    amount: moneyCodec.format(decimalFromMillis(group.values.amount as bigint)),
    quantity: quantityCodec.format(
      decimalFromMillis(group.values.quantity as bigint)
    ),
  }))
}
/** 本地演示延迟支持中止，不请求任何生产/销售接口。 */
const waitForExample = (
  signal: AbortSignal,
  milliseconds = 100
): Promise<void> =>
  new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      reject(new DOMException('已取消', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, milliseconds)
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
  })
export const customerSource: DataPickerSource<Customer> = {
  rowKey: 'id',
  value: row => row.id,
  label: row => row.name,
  request: async ({ page, pageSize, search, signal }) => {
    await waitForExample(signal)
    const all = CUSTOMERS.filter(row =>
      `${row.code} ${row.name}`.includes(search)
    )
    return {
      rows: clone(all.slice((page - 1) * pageSize, page * pageSize)),
      total: all.length,
    }
  },
  resolve: async (values, signal) => {
    await waitForExample(signal)
    return clone(CUSTOMERS.filter(row => values.includes(row.id)))
  },
}
export const CUSTOMER_COLUMNS = [
  { key: 'code', title: '客户编号', width: 130 },
  { key: 'name', title: '客户名称', minWidth: 180 },
]
export const SEARCH_FIELDS: SearchFormItem<WorkbenchQuery>[] = [
  { type: 'input', prop: 'organization', label: '组织', fixed: true },
  { type: 'input', prop: 'keyword', label: '订单 / 客户' },
  {
    type: 'select',
    prop: 'status',
    label: '计划状态',
    dictionary: 'order-status',
  },
  { type: 'select', prop: 'enabled', label: '归档', show: false, fixed: true },
]
export const HEADER_FIELDS: FormOption<OrderHeader>[] = [
  { type: 'input', prop: 'orderNo', label: '订单编号', readonly: true },
  {
    type: 'customer',
    prop: 'customer',
    label: '订货客户',
    required: true,
    rules: [{ required: true, message: '请选择订货客户' }],
    focusTarget: ({ element }) => element?.querySelector('button') ?? null,
  },
  {
    type: 'select',
    prop: 'status',
    label: '计划状态',
    dictionary: 'order-status',
    required: true,
  },
  {
    type: 'input',
    prop: 'owner',
    label: '业务人员',
    rules: [{ required: true, message: '请输入业务人员' }],
  },
  { type: 'input', prop: 'contractNo', label: '合同编号', readonly: true },
  { type: 'input', prop: 'delivery', label: '交货日期', readonly: true },
  { type: 'input', prop: 'note', label: '订单备注' },
]
export const FORM_CONFIG: FormConfig<OrderHeader> = {
  layout: 'grid',
  density: 'compact',
  labelPlacement: 'left',
  labelWidth: 88,
  grid: { cols: 1, minItemWidth: 250, xGap: 16, yGap: 8 },
  showActions: false,
}
export const BATCH_MODES = [
  { label: '不修改', value: 'keep' },
  { label: '清空备注', value: 'clear' },
  { label: '统一赋值', value: 'set' },
]

/** 单据工作台只组合公开协议；保存与模拟部分失败仍属于本地业务数据源。 */
export function useBusinessWorkbench() {
  provide(DICTIONARY_PROVIDER_KEY, {
    getDictionary: (name: string) =>
      name === 'order-status' ? statusSource : undefined,
  })
  const orders = ref(createBusinessOrders())
  const activeId = ref('ORDER-1')
  const header = ref(clone(orders.value[0].header))
  const lines = shallowRef<OrderLine[]>([])
  const form = ref<FormInstance<OrderHeader> | null>(null)
  const master = useMachTable<BusinessOrder['header']>()
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
    stacked.value = entry.contentRect.width < 860
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
  const splitSize = ref(44)
  const pendingOrder = ref<string | null>(null)
  const saving = ref(false)
  const batchBusy = ref(false)
  const batchMode = ref<BatchMode>('keep')
  const batchValue = ref('统一交期备注')
  const batchPreview = shallowRef<
    Array<{ key: string; before: string | null; after: string | null }>
  >([])
  const batchResults = shallowRef<BatchOperationResult[]>([])
  const query = ref<WorkbenchQuery>({
    organization: '001',
    keyword: '',
    status: null,
    enabled: false,
  })
  const appliedQuery = ref(clone(query.value))
  const localEmpty = shallowRef<string | null>(null)
  const selected = computed(() =>
    orders.value.find(order => order.header.id === activeId.value)!
  )
  const scope = useValidationScope()
  const resource = useDataResource({
    key: activeId,
    source: () =>
      localEmpty.value === activeId.value ? ([] as OrderLine[]) : undefined,
    load: async ({ key, signal }) => {
      await waitForExample(signal)
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
  const notice = ref('本地示例 · 所有改动仅保留在当前页面')
  const selectedCount = ref(0)
  const totals = computed(() => summarizeBusinessLines(lines.value))
  const filteredOrders = computed(() =>
    orders.value
      .map(order => order.header)
      .filter(row => {
        const customer = customerLabels.get(row.customer ?? '') ?? ''
        return (
          (appliedQuery.value.status === null ||
            row.status === appliedQuery.value.status) &&
          `${row.orderNo} ${customer}`.includes(
            appliedQuery.value.keyword.trim()
          )
        )
      })
  )
  const searchConfig: SearchConfig<WorkbenchQuery> = {
    density: 'compact',
    layout: 'grid',
    columns: 4,
    fieldMinWidth: 250,
    labelPlacement: 'left',
    labelWidth: 96,
    foldThreshold: 3,
    requireValue: false,
    onSearch: async params => {
      appliedQuery.value = clone(params)
      await nextTick()
    },
  }
  const renderers: Record<string, FormRenderer> = {
    customer: props =>
      h(C_DataPicker<Customer>, {
        source: customerSource,
        columns: CUSTOMER_COLUMNS,
        title: '选择订货客户',
        modelValue: typeof props.value === 'string' ? props.value : null,
        disabled: props.disabled === true,
        readonly: props.readonly === true,
        'onUpdate:modelValue': value => props['onUpdate:value']?.(value),
      }),
  }
  const activate = (id: string) => {
    scope.clear()
    localEmpty.value = null
    pendingOrder.value = null
    activeId.value = id
    header.value = clone(selected.value.header)
    selectedCount.value = 0
    batchPreview.value = []
    batchResults.value = []
    void nextTick(() => {
      form.value?.markAsClean()
      form.value?.clearValidation()
    })
  }
  const chooseOrder = async (id: string) => {
    if (
      id === activeId.value ||
      saving.value ||
      batchBusy.value ||
      resource.loading.value
    )
      return
    // 先提交活动编辑器，切换判断同时覆盖尚未失焦的单元格草稿。
    if (!(await commitDetailEdit())) return
    if (dirty.value) pendingOrder.value = id
    else activate(id)
  }
  const masterColumns = defineVueColumns<OrderHeader>([
    indexColumn({ headerName: '序号', width: 46 }),
    {
      field: 'orderNo',
      headerName: '销售订单号',
      width: 170,
      pinned: 'left',
      filter: true,
      render: row =>
        h(
          'button',
          {
            type: 'button',
            class: 'workbench-order-link',
            onClick: () => chooseOrder(row.id),
            'aria-label': `打开${row.orderNo}`,
          },
          row.orderNo
        ),
    },
    {
      field: 'customer',
      headerName: '客户名称',
      width: 130,
      filter: true,
      valueFormatter: ({ value }) =>
        customerLabels.get(String(value)) ?? String(value ?? '—'),
    },
    { field: 'contractNo', headerName: '合同编号', width: 130, filter: true },
    { field: 'grade', headerName: '钢种', width: 100, filter: true },
    { field: 'section', headerName: '规格 (mm)', minWidth: 160, flex: 1 },
    { field: 'region', headerName: '区域', width: 80 },
    {
      field: 'targetWeight',
      headerName: '合同量 (t)',
      width: 110,
      align: 'right',
      valueFormatter: ({ value }) => quantityCodec.format(value),
    },
    {
      field: 'status',
      headerName: '状态',
      width: 105,
      ...createDictionaryColumn<OrderHeader>(
        {
          get: value =>
            typeof value === 'number' ? statusLabels.get(value) : undefined,
        },
        {
          options: STATUS_OPTIONS,
          output: { clipboard: 'label', csv: 'label' },
        }
      ),
      render: row =>
        h(
          'span',
          { class: 'workbench-state', 'data-status': row.status },
          statusLabels.get(row.status) ?? String(row.status)
        ),
    },
    {
      field: 'progress',
      headerName: '履约进度',
      width: 145,
      render: row =>
        h(
          'div',
          {
            class: 'sales-progress',
            role: 'progressbar',
            'aria-valuenow': row.progress,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-label': `${row.orderNo}履约进度`,
          },
          [
            h('span', {
              style: { width: `${row.progress}%` },
              class: { 'is-complete': row.progress === 100 },
            }),
            h('small', `${row.progress}%`),
          ]
        ),
    },
    { field: 'delivery', headerName: '交货日期', width: 118 },
  ])
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
  const detailColumns = defineVueColumns<OrderLine>([
    selectionColumn(),
    { field: 'id', headerName: '明细编号', width: 145, pinned: 'left' },
    { field: 'product', headerName: '商品', width: 150 },
    {
      field: 'quantity',
      headerName: '数量 (t)',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      editable: true,
      valueParser: ({ value }) => {
        const parsed = quantityCodec.parse(value)
        if (parsed !== null) decimalMillis(parsed)
        return parsed
      },
      valueFormatter: ({ value }) => quantityCodec.format(value),
      valueSerializer: ({ value }) => value,
    },
    {
      field: 'amount',
      headerName: '金额 (CNY)',
      width: 155,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: ({ value }) => moneyCodec.format(value),
      valueSerializer: ({ value }) => value,
    },
    {
      field: 'note',
      headerName: '备注',
      minWidth: 160,
      flex: 1,
      editable: true,
    },
  ])
  const paymentColumns = defineVueColumns<{
    id: string
    stage: string
    amount: string
  }>([
    { field: 'stage', headerName: '收款阶段', flex: 1 },
    {
      field: 'amount',
      headerName: '金额 (CNY)',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: ({ value }) => moneyCodec.format(value),
    },
  ])
  const paymentRows = computed(() => [
    { id: `${activeId.value}-P1`, stage: '预付款', amount: '0' },
    { id: `${activeId.value}-P2`, stage: '到货付款', amount: '12027.01' },
  ])
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
    if (saving.value || batchBusy.value || resource.loading.value) return false
    if (!(await commitDetailEdit())) return false
    saving.value = true
    try {
      if (!(await scope.validate())) {
        notice.value = '请点击校验摘要定位并补齐内容'
        return false
      }
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
    if (await save()) activate(target)
    else pendingOrder.value = null
  }
  const discardAndSwitch = () => {
    if (pendingOrder.value) activate(pendingOrder.value)
  }
  const fillMissingExample = () => {
    header.value.customer = null
    lines.value = lines.value.map((row, index) =>
      index === 0 ? { ...row, quantity: null } : row
    )
    activeTab.value = 'payments'
  }
  const selectAllLines = () => {
    detail.api.value?.selection.selectAll()
    selectedCount.value = detail.api.value?.selection.getIds().length ?? 0
  }
  let batchPlan: BatchPlan | undefined
  const attempts = new Map<string, number>()
  let alive = true
  let batchController: AbortController | undefined
  onScopeDispose(() => {
    alive = false
    batchController?.abort()
  })
  const previewBatch = async () => {
    if (batchBusy.value) return
    if (!(await commitDetailEdit())) return
    batchResults.value = []
    const keys = detail.api.value?.selection.getIds() ?? []
    const change =
      batchMode.value === 'set'
        ? {
            field: 'note' as const,
            operation: 'set' as const,
            value: batchValue.value,
          }
        : { field: 'note' as const, operation: batchMode.value }
    const patch = createBatchPatch<OrderLine>([change])
    batchPlan = {
      order: activeId.value,
      keys,
      patch,
      before: new Map(lines.value.map(row => [row.id, row.note])),
    }
    batchPreview.value = lines.value
      .filter(row => keys.includes(row.id))
      .map(row => ({
        key: row.id,
        before: row.note,
        after: 'note' in patch ? (patch.note ?? null) : row.note,
      }))
    notice.value = keys.length
      ? '请检查变更预览后执行'
      : '请先选择需要批改的明细'
  }
  const canExecutePlan = (plan: BatchPlan | undefined): plan is BatchPlan =>
    !!plan && plan.order === activeId.value && !batchBusy.value
  const acceptBatchResults = (results: BatchOperationResult[]) => {
    const latest = new Map(
      batchResults.value.map(result => [result.key, result])
    )
    results.forEach(result => latest.set(result.key, result))
    batchResults.value = [...latest.values()]
    notice.value = batchResults.value.some(
      result => result.status !== 'success'
    )
      ? '批改已返回分项结果，失败草稿继续保留'
      : '本次批改已全部保存'
  }
  const recordBatchError = (error: unknown) => {
    if (alive)
      notice.value =
        error instanceof Error ? error.message : '批改失败，草稿保留'
  }
  const executeBatch = async (retry?: (string | number)[]) => {
    const plan = batchPlan
    if (!canExecutePlan(plan)) return
    const { keys, stale } = getBatchSubmission(
      plan,
      lines.value,
      batchResults.value,
      retry
    )
    if (!keys.length || !Object.keys(plan.patch).length) {
      notice.value = '没有需要提交的修改'
      return
    }
    if (stale) {
      notice.value = '预览后备注已修改，请重新预览；较新的草稿已保留'
      return
    }
    batchBusy.value = true
    lines.value = lines.value.map(row =>
      keys.includes(row.id) ? { ...row, ...plan.patch } : row
    )
    try {
      const task = new AbortController()
      batchController = task
      await waitForExample(task.signal, 80)
      if (!alive || plan.order !== activeId.value) return
      const results: BatchOperationResult[] = keys.map(key => {
        const attempt = (attempts.get(key) ?? 0) + 1
        attempts.set(key, attempt)
        if (key.endsWith('L02') && attempt === 1)
          return {
            key,
            status: 'failure',
            message: '模拟网络暂时失败，草稿保留，可重试',
            retryable: true,
          }
        selected.value.lines = selected.value.lines.map(row =>
          row.id === key ? { ...row, ...plan.patch } : row
        )
        return { key, status: 'success', message: '已保存' }
      })
      acceptBatchResults(results)
    } catch (error) {
      recordBatchError(error)
    } finally {
      batchController = undefined
      if (alive) batchBusy.value = false
    }
  }
  const emptyLocalLines = () => {
    localEmpty.value = activeId.value
    notice.value = '当前明细由本地空列表拥有，不回退旧远程结果'
  }
  const restore = () => {
    scope.clear()
    batchPlan = undefined
    batchPreview.value = []
    batchResults.value = []
    header.value = clone(selected.value.header)
    form.value?.clearValidation()
    if (localEmpty.value === activeId.value) localEmpty.value = null
    else void resource.reload()
  }
  return {
    container,
    stacked,
    form,
    master,
    detail,
    payments,
    header,
    lines,
    activeId,
    activeTab,
    detailEditing,
    onDetailTabKeydown,
    fullscreen,
    toggleDetailFullscreen,
    splitSize,
    pendingOrder,
    saving,
    batchBusy,
    batchMode,
    batchValue,
    batchPreview,
    batchResults,
    query,
    searchConfig,
    renderers,
    resource,
    notice,
    selectedCount,
    totals,
    filteredOrders,
    dirty,
    scope,
    masterColumns,
    masterRowStyles,
    detailColumns,
    paymentColumns,
    paymentRows,
    chooseOrder,
    save,
    saveAndSwitch,
    discardAndSwitch,
    fillMissingExample,
    selectAllLines,
    previewBatch,
    executeBatch,
    emptyLocalLines,
    restore,
    syncLineEdit,
    refreshDetailLayout,
  }
}
