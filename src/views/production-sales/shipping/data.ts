/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\data.ts
 * @Description: 发运协同的任务池、库存匹配、车辆校验与本地状态流转
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineTableColumns,
  defineTableConfig,
} from '@robot-admin/naive-ui-components/C_Table'
import type {
  FormConfig,
  FormOption,
  FormInstance,
} from '@robot-admin/naive-ui-components/C_Form'
import type {
  SearchConfig,
  SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import {
  defineVueColumns,
  selectionColumn,
  useMachTable,
} from '@agile-team/mach-table-vue'
import { recordLink, statusTag, weightCodec } from '../shared/presentation'

export interface Shipment {
  id: string
  no: string
  customer: string
  grade: string
  destination: string
  weightKg: number
  window: string
  plate: string
  status: 'waiting' | 'loading' | 'departed'
  vehicle?: VehicleForm
}
interface ShippingQuery {
  keyword: string
  destination: string | null
  status: string | null
}
interface VehicleForm {
  plate: string
  driver: string
  phone: string
  capacity: number | null
  gate: string
  note: string
}
export const SHIPMENT_STATES = {
  waiting: { label: '待配载', type: 'warning' },
  loading: { label: '装车中', type: 'info' },
  departed: { label: '已出厂', type: 'success' },
} as const
export const SHIPPING_FIELDS: SearchFormItem<ShippingQuery>[] = [
  { prop: 'keyword', label: '发运单 / 客户', type: 'input' },
  {
    prop: 'destination',
    label: '目的地',
    type: 'select',
    list: ['南京港', '无锡库', '南通港'].map(value => ({
      label: value,
      value,
    })),
  },
  {
    prop: 'status',
    label: '任务状态',
    type: 'select',
    list: Object.entries(SHIPMENT_STATES).map(([value, item]) => ({
      value,
      label: item.label,
    })),
  },
]
export const VEHICLE_FIELDS: FormOption<VehicleForm>[] = [
  {
    prop: 'plate',
    label: '车牌号',
    type: 'input',
    rules: [{ required: true, message: '请填写车牌号' }],
  },
  {
    prop: 'driver',
    label: '驾驶员',
    type: 'input',
    rules: [{ required: true, message: '请填写驾驶员' }],
  },
  {
    prop: 'phone',
    label: '联系电话',
    type: 'input',
    rules: [
      { required: true, pattern: /^1\d{10}$/, message: '请填写 11 位手机号' },
    ],
  },
  {
    prop: 'capacity',
    label: '额定载重 (t)',
    type: 'inputNumber',
    attrs: { min: 0, max: 60, precision: 3, showButton: false },
    rules: [
      { type: 'number', required: true, min: 0.001, message: '载重必须大于零' },
    ],
  },
  {
    prop: 'gate',
    label: '装车货位',
    type: 'select',
    children: ['A-01', 'A-02', 'B-01'].map(value => ({ value, label: value })),
    rules: [{ required: true, message: '请选择装车货位' }],
  },
  { prop: 'note', label: '调度备注', type: 'input' },
]
export const VEHICLE_CONFIG: FormConfig<VehicleForm> = {
  density: 'compact',
  layout: 'grid',
  grid: { cols: 1, yGap: 8 },
  labelWidth: 114,
  labelPlacement: 'left',
  showActions: false,
}
export const SHIPMENT_TABLE_CONFIG = defineTableConfig<Shipment>({
  density: 'compact',
  pagination: false,
  toolbar: { show: false },
  display: {
    size: 'small',
    striped: true,
    bordered: true,
    singleLine: false,
    scrollX: 1050,
    maxHeight: 330,
  },
})
/** 任务池以公斤保存业务重量，汇总和配载守恒不依赖小数累加。 */
export function createShipments(): Shipment[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `SHIP-${index + 1}`,
    no: `DN-261029-${String(index + 1).padStart(3, '0')}`,
    customer: ['星海科技', '华东建设', '云帆智造', '远川能源'][index % 4],
    grade: ['Q355B', 'Q235B', 'HRB400E'][index % 3],
    destination: ['南京港', '无锡库', '南通港'][index % 3],
    weightKg: 22800 + index * 850,
    window: `${9 + Math.floor(index / 2)}:00 — ${10 + Math.floor(index / 2)}:00`,
    plate: index < 6 ? '' : `苏A·K${3510 + index}`,
    status: index < 6 ? 'waiting' : index < 9 ? 'loading' : 'departed',
  }))
}
/** 将计划重量分成三个可追溯批次，整数余数只分配一次。 */
export function createCargoLots(row: Shipment) {
  const base = Math.floor(row.weightKg / 3)
  return Array.from({ length: 3 }, (_, index) => ({
    id: `${row.id}-LOT-${index + 1}`,
    batch: `B261029-${String(Number(row.id.slice(5)) * 3 + index).padStart(3, '0')}`,
    location: `A-${String(index + 1).padStart(2, '0')}`,
    grade: row.grade,
    specification: index === 1 ? '8 × 1500 × 6000' : '10 × 1500 × 6000',
    weightKg: base + (index === 0 ? row.weightKg % 3 : 0),
    quality: '合格放行',
  }))
}
/** 必须同时满足业务重量守恒和车辆额定载重。 */
export function validateLoad(
  targetKg: number,
  selectedKg: number,
  capacity: number | null
): string | null {
  if (targetKg !== selectedKg)
    return '已选库存重量需与发运计划一致，请先推荐配载或调整勾选。'
  if (
    capacity === null ||
    !Number.isFinite(capacity) ||
    Math.round(capacity * 1000) < selectedKg
  )
    return '当前配载超过车辆额定载重，请调整车辆或载重。'
  return null
}
/** 库存、车辆与任务状态只在本页模型中协同，不产生任何后端写入。 */
export function useShippingWorkbench() {
  const dialog = useDialog()
  const rows = ref(createShipments())
  const currentId = ref('SHIP-1')
  const query = ref<ShippingQuery>({
    keyword: '',
    destination: null,
    status: null,
  })
  const applied = ref<ShippingQuery>({ ...query.value })
  const form = ref<FormInstance<VehicleForm> | null>(null)
  const vehicle = ref<VehicleForm>({
    plate: '苏A·K3510',
    driver: '王建国',
    phone: '13800001234',
    capacity: 32,
    gate: 'A-01',
    note: '',
  })
  const stock = useMachTable<ReturnType<typeof createCargoLots>[number]>()
  const selectedLots = ref<string[]>([])
  const notice = ref('选择任务后推荐配载，核对库存与车辆，再生成装车单。')
  const busy = ref(false)
  const current = computed(
    () => rows.value.find(row => row.id === currentId.value) ?? rows.value[0]
  )
  const lots = computed(() => createCargoLots(current.value))
  const selectedKg = computed(() =>
    lots.value
      .filter(row => selectedLots.value.includes(row.id))
      .reduce((sum, row) => sum + row.weightKg, 0)
  )
  const visibleRows = computed(() =>
    rows.value.filter(
      row =>
        (!applied.value.keyword ||
          `${row.no}${row.customer}${row.plate}`.includes(
            applied.value.keyword.trim()
          )) &&
        (!applied.value.destination ||
          row.destination === applied.value.destination) &&
        (!applied.value.status || row.status === applied.value.status)
    )
  )
  const stages = computed(() =>
    Object.entries(SHIPMENT_STATES).map(([key, item]) => ({
      key,
      ...item,
      count: rows.value.filter(row => row.status === key).length,
    }))
  )
  const searchConfig: SearchConfig<ShippingQuery> = {
    density: 'compact',
    layout: 'grid',
    columns: 4,
    labelPlacement: 'left',
    fieldMinWidth: 230,
    labelWidth: 94,
    onSearch: values => {
      applied.value = { ...values }
    },
  }
  const activate = (id: string) => {
    const row = rows.value.find(item => item.id === id)
    if (!row || busy.value) return
    currentId.value = id
    selectedLots.value = []
    stock.api.value?.selection.clear()
    vehicle.value = row.vehicle
      ? { ...row.vehicle }
      : {
          plate: row.plate || '苏A·K3510',
          driver: '王建国',
          phone: '13800001234',
          capacity: 32,
          gate: 'A-01',
          note: '',
        }
    form.value?.clearValidation()
    void nextTick(() => form.value?.markAsClean())
  }
  const choose = (id: string) => {
    if (id === currentId.value || busy.value) return
    if (form.value?.isDirty) {
      dialog.warning({
        title: '车辆安排有未保存修改',
        content: '切换任务将放弃当前尚未生成装车单的车辆修改。',
        positiveText: '放弃并切换',
        negativeText: '保留当前任务',
        onPositiveClick: () => activate(id),
      })
    } else activate(id)
  }
  const vehicleConfig = computed(() => ({
    ...VEHICLE_CONFIG,
    disabled: current.value.status !== 'waiting',
  }))
  const filterStage = (status: string | null) => {
    query.value.status = status
    applied.value = { ...query.value }
  }
  const columns = defineTableColumns<Shipment>([
    {
      key: 'no',
      title: '发运单号',
      width: 166,
      fixed: 'left',
      render: row => recordLink(row.no, () => choose(row.id)),
    },
    { key: 'customer', title: '客户名称', width: 112 },
    { key: 'grade', title: '钢种', width: 96 },
    {
      key: 'weightKg',
      title: '计划量 (t)',
      width: 100,
      align: 'right',
      render: row => weightCodec.format(row.weightKg / 1000),
    },
    { key: 'destination', title: '目的地', width: 92 },
    { key: 'window', title: '装车窗口', width: 130 },
    {
      key: 'plate',
      title: '车辆',
      width: 112,
      render: row => row.plate || '待安排',
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: row =>
        statusTag(
          SHIPMENT_STATES[row.status].label,
          SHIPMENT_STATES[row.status].type
        ),
    },
  ])
  const lotColumns = defineVueColumns<(typeof lots.value)[number]>([
    selectionColumn(),
    { field: 'batch', headerName: '库存批号', width: 145 },
    { field: 'location', headerName: '库位', width: 90 },
    { field: 'grade', headerName: '钢种', width: 100 },
    { field: 'specification', headerName: '规格 (mm)', minWidth: 170, flex: 1 },
    {
      field: 'weightKg',
      headerName: '可配重量 (t)',
      width: 130,
      align: 'right',
      valueFormatter: ({ value }) => weightCodec.format(Number(value) / 1000),
    },
    {
      field: 'quality',
      headerName: '质量状态',
      width: 120,
      render: row => statusTag(row.quality, 'success'),
    },
  ])
  const syncLots = () => {
    selectedLots.value = (stock.api.value?.selection.getIds() ?? []).map(String)
  }
  const recommend = () => {
    stock.api.value?.selection.selectAll()
    syncLots()
    notice.value = `已匹配 ${lots.value.length} 个可追溯批次，共 ${weightCodec.format(selectedKg.value / 1000)} t。`
  }
  const assign = async () => {
    if (busy.value || current.value.status !== 'waiting') return
    busy.value = true
    try {
      if (!form.value) return
      try {
        await form.value.validate()
      } catch {
        notice.value = '请补齐车辆与驾驶员信息。'
        return
      }
      const error = validateLoad(
        current.value.weightKg,
        selectedKg.value,
        vehicle.value.capacity
      )
      if (error) {
        notice.value = error
        return
      }
      const { id } = current.value
      rows.value = rows.value.map(row =>
        row.id === id
          ? {
              ...row,
              plate: vehicle.value.plate,
              vehicle: { ...vehicle.value },
              status: 'loading',
            }
          : row
      )
      form.value.markAsClean()
      notice.value = `${current.value.no} 已生成装车单，安排至 ${vehicle.value.gate}（本地演示）。`
    } finally {
      busy.value = false
    }
  }
  const depart = () => {
    if (current.value.status !== 'loading' || busy.value) return
    const { id } = current.value
    rows.value = rows.value.map(row =>
      row.id === id ? { ...row, status: 'departed' } : row
    )
    notice.value = `${current.value.no} 已确认出厂（本地演示）。`
  }
  return {
    rows,
    current,
    currentId,
    query,
    searchConfig,
    visibleRows,
    stages,
    form,
    vehicle,
    vehicleConfig,
    stock,
    lots,
    selectedLots,
    selectedKg,
    columns,
    lotColumns,
    busy,
    notice,
    choose,
    filterStage,
    syncLots,
    recommend,
    assign,
    depart,
  }
}

export const STAGE_NOTES: Record<string, string> = {
  waiting: '核对库存与车辆，生成装车单',
  loading: '关注装车进度与车辆额定载重',
  departed: '已完成当班出厂确认',
}
