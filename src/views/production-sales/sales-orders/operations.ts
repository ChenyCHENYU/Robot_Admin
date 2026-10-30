/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\operations.ts
 * @Description: 销售订单编制与明细弹窗，沿用现有整单草稿和提交边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Ref } from 'vue'
import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
import type { BusinessOrder, OrderHeader, OrderLine } from './data'
import { CUSTOMERS } from './options'

const required = (message: string) => [{ required: true, message }]
/** 明细保持最多三位的精确十进制字符串；零值有效，不经 Number 转换。 */
export const isLineDecimal = (value: unknown): boolean =>
  typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(value)
export const ORDER_CREATE_FIELDS: FormOption<OrderHeader>[] = [
  { prop: 'orderNo', label: '订单编号', type: 'input', readonly: true },
  {
    prop: 'customer',
    label: '订货客户',
    type: 'select',
    children: CUSTOMERS.map(row => ({ value: row.id, label: row.name })),
    rules: required('请选择客户'),
  },
  {
    prop: 'contractNo',
    label: '合同编号',
    type: 'input',
    rules: required('请填写合同编号'),
  },
  {
    prop: 'owner',
    label: '业务人员',
    type: 'input',
    rules: required('请填写业务人员'),
  },
  {
    prop: 'grade',
    label: '钢种',
    type: 'select',
    children: ['Q355B', 'Q235B', 'HRB400E'].map(value => ({
      value,
      label: value,
    })),
    rules: required('请选择钢种'),
  },
  {
    prop: 'section',
    label: '规格 (mm)',
    type: 'input',
    rules: required('请填写规格'),
  },
  {
    prop: 'region',
    label: '区域',
    type: 'select',
    children: ['华东', '华南', '华北'].map(value => ({ value, label: value })),
    rules: required('请选择区域'),
  },
  {
    prop: 'targetWeight',
    label: '合同量 (t)',
    type: 'inputNumber',
    attrs: { min: 0.001, precision: 3, showButton: false },
    rules: [
      {
        type: 'number',
        required: true,
        min: 0.001,
        message: '合同量必须大于零',
      },
    ],
  },
  {
    prop: 'delivery',
    label: '交货日期',
    type: 'input',
    placeholder: 'YYYY-MM-DD',
    rules: [
      {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: '请按 YYYY-MM-DD 填写交期',
      },
    ],
  },
  { prop: 'note', label: '订单备注', type: 'input' },
]
export const ORDER_LINE_FIELDS: FormOption<OrderLine>[] = [
  {
    prop: 'product',
    label: '商品名称',
    type: 'input',
    rules: required('请填写商品名称'),
  },
  {
    prop: 'quantity',
    label: '数量',
    type: 'input',
    placeholder: '非负数，最多三位小数',
    rules: [
      {
        validator: (_: unknown, value: unknown) => isLineDecimal(value),
        message: '请填写非负数量，最多三位小数（零有效）',
      },
    ],
  },
  {
    prop: 'amount',
    label: '金额',
    type: 'input',
    placeholder: '原始金额，最多三位小数',
    rules: [
      {
        validator: (_: unknown, value: unknown) => isLineDecimal(value),
        message: '请填写非负金额，最多三位小数',
      },
    ],
  },
  { prop: 'unit', label: '单位', type: 'input', readonly: true },
  { prop: 'currency', label: '币种', type: 'input', readonly: true },
  { prop: 'note', label: '备注', type: 'input' },
]

/** 弹窗仅写本页草稿；已有订单明细仍由原整单校验和保存入口提交。 */
export function useSalesOperations(context: {
  orders: Ref<BusinessOrder[]>
  header: Ref<OrderHeader>
  lines: Ref<OrderLine[]>
  activeId: Ref<string>
  notice: Ref<string>
  dirty: Readonly<Ref<boolean>>
  blocked: () => boolean
  activate: (id: string) => void
  requestOrder: (id: string, after?: () => void) => Promise<void>
  commitCell: () => Promise<boolean>
  selectedKeys: () => string[]
  resetLineState: () => void
}) {
  const {
    orders,
    header,
    lines,
    activeId,
    notice,
    dirty,
    blocked,
    activate,
    requestOrder,
    commitCell,
    selectedKeys,
    resetLineState,
  } = context
  const dialog = useDialog()
  const detailVisible = ref(false)
  const detailOrder = shallowRef<BusinessOrder | null>(null)
  const lineDetail = shallowRef<OrderLine | null>(null)
  const openDetail = async (row: OrderHeader) => {
    if (row.id === activeId.value && !(await commitCell())) return
    const source = orders.value.find(order => order.header.id === row.id)
    if (!source) return
    detailOrder.value = {
      header: { ...(row.id === activeId.value ? header.value : source.header) },
      lines: (row.id === activeId.value ? lines.value : source.lines).map(
        line => ({ ...line })
      ),
    }
    detailVisible.value = true
  }
  const openLineDetail = async (row: OrderLine) => {
    if (!(await commitCell())) return
    const target = lines.value.find(line => line.id === row.id)
    if (target) lineDetail.value = { ...target }
  }
  const persistedStatus = computed(
    () =>
      orders.value.find(row => row.header.id === activeId.value)?.header.status
  )
  let sequence = orders.value.length
  let lineSequence = 0
  let lineOwner = ''
  let copiedLines: OrderLine[] = []
  const { editor: orderEditor } = useNaiveTableCrud<OrderHeader>({
    query: async () => ({
      items: orders.value.map(row => row.header),
      total: orders.value.length,
    }),
    autoLoad: false,
    refreshAfterMutation: false,
    editor: {
      createTitle: '新增销售订单',
      editTitle: row => `编辑订单 · ${row.orderNo}`,
    },
    createNewRow: () => {
      const number = ++sequence
      return {
        id: `ORDER-${number}`,
        orderNo: `SO-2026-${String(number).padStart(3, '0')}`,
        customer: null,
        status: 0,
        owner: '陈雨',
        note: null,
        contractNo: '',
        grade: 'Q355B',
        section: '',
        region: '华东',
        delivery: '2026-11-01',
        targetWeight: 1,
        progress: 0,
      }
    },
    mutations: {
      update: async row => {
        if (
          persistedStatus.value !== 0 ||
          row.id !== activeId.value ||
          blocked()
        )
          throw new Error('当前订单不允许变更主档')
        header.value = { ...row }
        notice.value = '订单主档已更新到草稿，请保存整单。'
      },
      create: async row => {
        orders.value = [
          ...orders.value,
          {
            header: { ...row, status: 0, progress: 0 },
            lines: copiedLines.map((line, index) => ({
              ...line,
              id: `${row.id}-L${String(index + 1).padStart(2, '0')}`,
            })),
          },
        ]
        activate(row.id)
        notice.value = `${row.orderNo} 已建立，请完善商品明细后保存整单。`
      },
    },
  })
  const openOrder = async (sourceRow?: OrderHeader) => {
    if (blocked() || !(await commitCell())) return
    if (dirty.value) {
      notice.value = '请先保存或恢复当前订单，再新增或复制订单。'
      return
    }
    const source =
      sourceRow && orders.value.find(order => order.header.id === sourceRow.id)
    copiedLines = source
      ? (sourceRow.id === activeId.value ? lines.value : source.lines).map(
          row => ({ ...row })
        )
      : []
    orderEditor.openCreate()
    if (source) {
      const identity = orderEditor.model.value!
      orderEditor.setModel({
        ...(sourceRow.id === activeId.value ? header.value : source.header),
        id: identity.id,
        orderNo: identity.orderNo,
        status: 0,
        progress: 0,
      })
      orderEditor.title.value = `复制订单 · ${source.header.orderNo}`
    }
  }
  const editOrder = async (row: OrderHeader) => {
    if (row.status !== 0 || blocked()) return
    await requestOrder(row.id, () => orderEditor.openEdit(header.value))
  }
  const removeOrder = (row: OrderHeader) => {
    const target = orders.value.find(item => item.header.id === row.id)
    if (!target || target.header.status !== 0 || blocked()) return
    dialog.warning({
      title: '删除草稿订单',
      content: `确认删除 ${target.header.orderNo} 及其商品明细？未保存修改会一起放弃。执行中和已完成的订单不能删除。`,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: () => {
        if (
          orders.value.find(item => item.header.id === target.header.id)?.header
            .status !== 0 ||
          blocked()
        )
          return
        orders.value = orders.value.filter(
          row => row.header.id !== target.header.id
        )
        if (activeId.value === target.header.id)
          activate(orders.value[0].header.id)
        notice.value = `${target.header.orderNo} 已删除（本地示例）。`
      },
    })
  }
  const persistLine = (row: OrderLine, create: boolean) => {
    if (activeId.value !== lineOwner || blocked())
      throw new Error('订单上下文已变化，请重新打开明细')
    if (!isLineDecimal(row.quantity) || !isLineDecimal(row.amount))
      throw new Error('明细数量或金额不合法')
    lines.value = create
      ? [...lines.value, { ...row }]
      : lines.value.map(item => (item.id === row.id ? { ...row } : item))
    resetLineState()
    notice.value = `${create ? '已新增' : '已更新'}商品明细，请保存整单。`
  }
  const { editor: lineEditor } = useNaiveTableCrud<OrderLine>({
    query: async () => ({ items: lines.value, total: lines.value.length }),
    autoLoad: false,
    refreshAfterMutation: false,
    editor: {
      createTitle: '新增商品明细',
      editTitle: row => `编辑明细 · ${row.product}`,
    },
    createNewRow: () => ({
      id: `${activeId.value}-LINE-${++lineSequence}`,
      product: '',
      quantity: '0',
      amount: '0',
      currency: 'CNY',
      unit: 't',
      note: null,
    }),
    mutations: {
      create: async row => persistLine(row, true),
      update: async row => persistLine(row, false),
    },
  })
  const openLine = async (target?: OrderLine) => {
    if (blocked() || !(await commitCell())) return
    lineOwner = activeId.value
    if (!target) lineEditor.openCreate()
    else {
      const row = lines.value.find(item => item.id === target.id)
      if (row) lineEditor.openEdit(row)
    }
  }
  const removeLines = async (targetIds?: string[]) => {
    if (blocked() || !(await commitCell())) return
    const owner = activeId.value
    const ids = targetIds ?? selectedKeys()
    if (!ids.length) return
    dialog.warning({
      title: targetIds ? '删除商品明细' : '删除选中明细',
      content: targetIds
        ? `确认删除 ${ids[0]} · ${lines.value.find(row => row.id === ids[0])?.product ?? ''}？保存整单后生效。`
        : `将从当前草稿移除 ${ids.length} 条明细，保存整单后生效。`,
      positiveText: '删除明细',
      negativeText: '取消',
      onPositiveClick: () => {
        if (activeId.value !== owner || blocked()) return
        lines.value = lines.value.filter(row => !ids.includes(row.id))
        resetLineState()
        notice.value = `已移除 ${ids.length} 条明细，请保存整单。`
      },
    })
  }
  const orderActions = computed<ActionItem[]>(() => [
    {
      key: 'create',
      label: '新增订单',
      disabled: blocked(),
      onClick: () => openOrder(),
    },
  ])
  const lineActions = computed<ActionItem[]>(() => [
    {
      key: 'create',
      label: '新增明细',
      disabled: blocked(),
      onClick: () => openLine(),
    },
    {
      key: 'delete',
      label: '删除选中明细',
      disabled: blocked() || !selectedKeys().length,
      onClick: () => removeLines(),
    },
  ])
  return {
    orderEditor,
    lineEditor,
    orderActions,
    lineActions,
    detailVisible,
    detailOrder,
    lineDetail,
    openDetail,
    openLineDetail,
    editOrder,
    copyOrder: openOrder,
    removeOrder,
    editLine: openLine,
    removeLine: (row: OrderLine) => removeLines([row.id]),
  }
}
