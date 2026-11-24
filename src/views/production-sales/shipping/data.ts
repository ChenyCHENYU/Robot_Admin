/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\data.ts
 * @Description: 发运任务、班次预约、库存及车辆校验契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { actionIcons } from '../shared/actionIcons'
import { defineTableConfig } from '@robot-admin/naive-ui-components/C_Table'
import type {
  FormConfig,
  FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type { SearchFormItem } from '@robot-admin/naive-ui-components/C_FormSearch'
import type {
  ResourceScheduleBooking,
  ResourceScheduleRange,
} from '@robot-admin/naive-ui-components/C_ResourceSchedule'

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
export type ShippingBoardTask = {
  key: string
  title: string
  status: Shipment['status']
  disabled: boolean
  shipment: Shipment
}

const atShiftTime = (hour: number, minute = 0) =>
  Date.UTC(2026, 9, 29, hour - 8, minute)

export const SHIPPING_SHIFT: ResourceScheduleRange = [
  atShiftTime(8),
  atShiftTime(16),
]

/** 未完成配载的预约使用演示班次预排的装车位。 */
export function getShippingBooking(row: Shipment) {
  const time = row.window.match(
    /^(\d{1,2}):(\d{2})\s*[—–-]\s*(\d{1,2}):(\d{2})$/
  )
  if (!time) return []
  const [startHour, startMinute, endHour, endMinute] = time.slice(1).map(Number)
  if (startHour > 23 || endHour > 23 || startMinute > 59 || endMinute > 59)
    return []
  const start = atShiftTime(startHour, startMinute)
  const end = atShiftTime(endHour, endMinute)
  if (end <= start) return []
  return [
    {
      key: row.id,
      label: row.no,
      resourceKey:
        row.vehicle?.gate || (row.destination === '南通港' ? 'A-02' : 'A-01'),
      start,
      end,
      shipment: row,
    } satisfies ResourceScheduleBooking & { shipment: Shipment },
  ]
}
export interface ShippingQuery {
  keyword: string
  destination: string | null
  status: string | null
}
export const INITIAL_QUERY: ShippingQuery = {
  keyword: '',
  destination: null,
  status: null,
}

// 两个演示任务来自独立的库存快照，覆盖部分放行与整批待放行。
export const STOCK_LIMITS = new Map([
  ['SHIP-5', 18600],
  ['SHIP-6', 0],
])
export interface VehicleForm {
  plate: string
  driver: string
  phone: string
  capacity: number | null
  gate: string
  note: string
}
export const SHIPMENT_STATES = {
  waiting: {
    label: '待配载',
    type: 'warning',
    icon: actionIcons.packageVariantClosed,
  },
  loading: { label: '装车中', type: 'info', icon: actionIcons.truckOutline },
  departed: {
    label: '已出厂',
    type: 'success',
    icon: actionIcons.truckCheckOutline,
  },
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
  grid: { cols: 1 },
  labelWidth: 114,
  labelPlacement: 'left',
  showActions: false,
}
export const SHIPMENT_TABLE_CONFIG = defineTableConfig<Shipment>({
  density: 'compact',
  persistKey: 'production-sales:shipping:tasks:v1',
  pagination: { pageSize: 10 },
  toolbar: { show: false },
  display: {
    size: 'small',
    striped: true,
    bordered: true,
    singleLine: false,
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
/** 将质量放行的可配重量分成可追溯批次，整数余数只分配一次。 */
export function createCargoLots(row: Shipment, availableKg = row.weightKg) {
  if (availableKg <= 0) return []
  const count = Math.min(3, availableKg)
  const base = Math.floor(availableKg / count)
  return Array.from({ length: count }, (_, index) => ({
    id: `${row.id}-LOT-${index + 1}`,
    batch: `B261029-${String(Number(row.id.slice(5)) * 3 + index).padStart(3, '0')}`,
    location: `A-${String(index + 1).padStart(2, '0')}`,
    grade: row.grade,
    specification: index === 1 ? '8 × 1500 × 6000' : '10 × 1500 × 6000',
    weightKg: base + (index === 0 ? availableKg % count : 0),
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
export const STAGE_NOTES: Record<string, string> = {
  waiting: '核对库存与车辆，生成装车单',
  loading: '关注装车进度与车辆额定载重',
  departed: '已完成当班出厂确认',
}
export const STOCK_LOCALE = {
  emptyRows: '当前钢种暂无放行库存',
  emptyRowsHint: '请在库存质检放行后再安排配载。',
}
