/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\useShippingAllocation.ts
 * @Description: 车辆草稿、库存重量守恒、表单校验和装车提交
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormInstance } from '@robot-admin/naive-ui-components/C_Form'
import {
  defineVueColumns,
  indexColumn,
  selectionColumn,
  useMachTable,
} from '@agile-team/mach-table-vue'
import { statusTag, weightCodec } from '../shared/presentation'
import {
  createCargoLots,
  STOCK_LIMITS,
  validateLoad,
  VEHICLE_CONFIG,
  type Shipment,
  type VehicleForm,
} from './data'

interface ShippingAllocationOptions {
  current: Readonly<Ref<Shipment | undefined>>
  notice: Ref<string>
  assignVehicle: (id: string, vehicle: VehicleForm) => boolean
}

const defaultVehicle: VehicleForm = {
  plate: '苏A·K3510',
  driver: '王建国',
  phone: '13800001234',
  capacity: 32,
  gate: 'A-01',
  note: '',
}

/** 当前任务的库存选择和车辆草稿属于同一配载流程，生成装车单前集中校验。 */
export function useShippingAllocation({
  current,
  notice,
  assignVehicle,
}: ShippingAllocationOptions) {
  const form = ref<FormInstance<VehicleForm> | null>(null)
  const vehicle = ref<VehicleForm>({ ...defaultVehicle })
  const stock = useMachTable<ReturnType<typeof createCargoLots>[number]>()
  const selectedLots = ref<string[]>([])
  const busy = ref(false)
  let alive = true
  onScopeDispose(() => {
    alive = false
  })
  const lots = computed(() => {
    const task = current.value
    return task ? createCargoLots(task, STOCK_LIMITS.get(task.id)) : []
  })
  const availableKg = computed(() =>
    lots.value.reduce((sum, lot) => sum + lot.weightKg, 0)
  )
  const selectedKg = computed(() =>
    lots.value
      .filter(row => selectedLots.value.includes(row.id))
      .reduce((sum, row) => sum + row.weightKg, 0)
  )
  const missingStockKg = computed(() =>
    Math.max(0, (current.value?.weightKg ?? 0) - availableKg.value)
  )
  const unallocatedKg = computed(() =>
    Math.max(0, (current.value?.weightKg ?? 0) - selectedKg.value)
  )
  const excessAllocationKg = computed(() =>
    Math.max(0, selectedKg.value - (current.value?.weightKg ?? 0))
  )
  const overloaded = computed(
    () =>
      vehicle.value.capacity !== null &&
      Math.round(vehicle.value.capacity * 1000) < selectedKg.value
  )
  const vehicleConfig = computed(() => ({
    ...VEHICLE_CONFIG,
    disabled: current.value?.status !== 'waiting',
  }))
  const lotColumns = defineVueColumns<(typeof lots.value)[number]>([
    selectionColumn(),
    indexColumn({ headerName: '序号', width: 46 }),
    { field: 'batch', headerName: '库存批号' },
    { field: 'location', headerName: '库位' },
    { field: 'grade', headerName: '钢种' },
    { field: 'specification', headerName: '规格 (mm)', minWidth: 170 },
    {
      field: 'weightKg',
      headerName: '可配重量 (t)',
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
    selectedLots.value = stock.api.value?.selection.getIds() ?? []
  }
  const recommend = () => {
    if (!lots.value.length || current.value?.status !== 'waiting') return
    stock.api.value?.selection.selectAll()
    syncLots()
    const total = weightCodec.format(selectedKg.value / 1000)
    notice.value = missingStockKg.value
      ? `已选全部可用库存 ${total} t，仍缺 ${weightCodec.format(missingStockKg.value / 1000)} t。`
      : `已匹配 ${lots.value.length} 个可追溯批次，共 ${total} t。`
  }
  const restore = (row: Shipment) => {
    selectedLots.value = []
    stock.api.value?.selection.clear()
    vehicle.value = row.vehicle
      ? { ...row.vehicle }
      : { ...defaultVehicle, plate: row.plate || defaultVehicle.plate }
    form.value?.clearValidation()
    void nextTick(() => form.value?.markAsClean())
  }
  const matchesLoad = computed(() => {
    const task = current.value
    return (
      !!task &&
      !missingStockKg.value &&
      !validateLoad(task.weightKg, selectedKg.value, vehicle.value.capacity)
    )
  })
  const validateVehicle = async (
    editor: FormInstance<VehicleForm>,
    taskId: string
  ) => {
    try {
      await editor.validate()
      return alive && current.value?.id === taskId && form.value === editor
    } catch {
      if (alive) notice.value = '请补齐车辆与驾驶员信息。'
      return false
    }
  }
  const assign = async () => {
    const task = current.value
    const editor = form.value
    if (
      !editor ||
      busy.value ||
      task?.status !== 'waiting' ||
      missingStockKg.value
    )
      return
    busy.value = true
    try {
      if (!(await validateVehicle(editor, task.id))) return
      const error = validateLoad(
        task.weightKg,
        selectedKg.value,
        vehicle.value.capacity
      )
      if (error) {
        notice.value = error
        return
      }
      if (!assignVehicle(task.id, { ...vehicle.value })) return
      editor.markAsClean()
      notice.value = `${task.no} 已生成装车单，安排至 ${vehicle.value.gate}（本地演示）。`
    } finally {
      busy.value = false
    }
  }
  const isDirty = () => form.value?.isDirty === true
  return {
    form,
    isDirty,
    restore,
    canAssign: () => matchesLoad.value,
    vehicle: proxyRefs({ data: vehicle, config: vehicleConfig, busy, assign }),
    inventory: proxyRefs({
      grid: stock,
      rows: lots,
      columns: lotColumns,
      availableKg,
      missingKg: missingStockKg,
      unallocatedKg,
      excessKg: excessAllocationKg,
      overloaded,
      selected: selectedLots,
      selectedKg,
      sync: syncLots,
      recommend,
    }),
  }
}
