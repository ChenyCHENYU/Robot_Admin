/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\useShippingWorkbench.ts
 * @Description: 任务台账、配载控制器、看板与预约视图组合
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import { defineTableColumns } from '@robot-admin/naive-ui-components/C_Table'
import type { SearchConfig } from '@robot-admin/naive-ui-components/C_FormSearch'
import type { TaskBoardMove } from '@robot-admin/naive-ui-components/C_TaskBoard'
import { recordLink, weightCodec } from '../shared/presentation'
import {
  createShipments,
  getShippingBooking,
  INITIAL_QUERY,
  SHIPMENT_STATES,
  SHIPMENT_TABLE_CONFIG,
  SHIPPING_SHIFT,
  type Shipment,
  type ShippingBoardTask,
  type ShippingQuery,
} from './data'
import { useShipmentOperations } from './operations'
import { useShippingAllocation } from './useShippingAllocation'

/** 库存、车辆与任务状态只在本页模型中协同，不产生任何后端写入。 */
export function useShippingWorkbench() {
  const dialog = useDialog()
  const rows = ref(createShipments())
  const currentId = ref('SHIP-1')
  const pagination = reactive({ page: 1, pageSize: 10 })
  /** 分页状态留在页面，新增或切换任务时可以定位到对应页。 */
  const syncTaskPagination = (page: number, pageSize: number) => {
    Object.assign(pagination, { page, pageSize })
  }
  const query = ref<ShippingQuery>({ ...INITIAL_QUERY })
  const applied = ref<ShippingQuery>({ ...query.value })
  const notice = ref('选择任务后推荐配载，核对库存与车辆，再生成装车单。')
  const current = computed(
    () => rows.value.find(row => row.id === currentId.value) ?? rows.value[0]
  )
  const allocation = useShippingAllocation({
    current,
    notice,
    assignVehicle: (id, vehicle) => {
      const target = rows.value.find(row => row.id === id)
      if (target?.status !== 'waiting') return false
      rows.value = rows.value.map(row =>
        row.id === id
          ? { ...row, plate: vehicle.plate, vehicle, status: 'loading' }
          : row
      )
      return true
    },
  })
  const { vehicle, inventory } = allocation
  const boardTasks = computed<ShippingBoardTask[]>(() =>
    rows.value.map(row => ({
      key: row.id,
      title: row.no,
      status: row.status,
      disabled: row.id !== currentId.value || row.status === 'departed',
      shipment: row,
    }))
  )
  const boardColumns = (['waiting', 'loading', 'departed'] as const).map(
    key => ({
      key,
      label: SHIPMENT_STATES[key].label,
    })
  )
  const bookings = computed(() => rows.value.flatMap(getShippingBooking))
  const scheduleResources = computed(() =>
    Array.from(
      new Set(bookings.value.map(booking => booking.resourceKey)),
      key => ({
        key,
        label: `${key} 装车位`,
        workingWindows: [SHIPPING_SHIFT],
      })
    )
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
  const currentOutsideFilter = computed(
    () =>
      current.value &&
      !visibleRows.value.some(row => row.id === current.value.id)
  )
  watch([currentId, () => visibleRows.value.length], () => {
    const index = visibleRows.value.findIndex(row => row.id === currentId.value)
    if (index >= 0)
      pagination.page = Math.floor(index / pagination.pageSize) + 1
  })
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
    searchOnReset: true,
    onSearch: values => {
      applied.value = { ...values }
      pagination.page = 1
    },
  }
  const clearTaskFilters = () => {
    query.value = { ...INITIAL_QUERY }
    applied.value = { ...INITIAL_QUERY }
    pagination.page = 1
  }
  const activate = (id: string) => {
    const row = rows.value.find(item => item.id === id)
    if (!row || vehicle.busy) return
    currentId.value = id
    allocation.restore(row)
  }
  const choose = (id: string) => {
    if (id === currentId.value || vehicle.busy) return
    if (allocation.isDirty()) {
      dialog.warning({
        ...BUSINESS_DIALOG_BUTTONS,
        title: '车辆安排有未保存修改',
        content: '切换任务将放弃当前尚未生成装车单的车辆修改。',
        positiveText: '放弃并切换',
        negativeText: '保留当前任务',
        onPositiveClick: () => activate(id),
      })
    } else activate(id)
  }
  const filterStage = (status: string | null) => {
    query.value.status = status
    applied.value = { ...query.value }
    pagination.page = 1
  }
  const operations = useShipmentOperations({
    rows,
    currentId,
    notice,
    activate,
    vehicleDirty: () => allocation.isDirty() || vehicle.busy,
  })
  const rowProps = (row: Shipment) => ({
    'aria-selected': row.id === currentId.value,
    'data-shipment-id': row.id,
    tabindex: 0,
    onKeydown: (event: KeyboardEvent) => {
      if (
        event.target !== event.currentTarget ||
        !['Enter', ' '].includes(event.key)
      )
        return
      event.preventDefault()
      choose(row.id)
    },
    onClick: () => choose(row.id),
  })
  const isRowActionDisabled = (row: Shipment) =>
    row.status !== 'waiting' || allocation.isDirty() || vehicle.busy
  const taskTableConfig = computed(() => ({
    ...SHIPMENT_TABLE_CONFIG,
    pagination: { page: pagination.page, pageSize: pagination.pageSize },
    actions: {
      inline: [
        {
          key: 'edit',
          type: 'warning' as const,
          disabled: isRowActionDisabled,
          onClick: operations.editShipment,
        },
        {
          key: 'delete',
          disabled: isRowActionDisabled,
          onClick: operations.removeShipment,
        },
      ],
    },
  }))
  const columns = defineTableColumns<Shipment>([
    { type: 'index', title: '序号', width: 48, fixed: 'left' },
    {
      key: 'no',
      title: '发运单号',
      fixed: 'left',
      render: row => recordLink(row.no, () => operations.openDetail(row)),
    },
    { key: 'customer', title: '客户名称', resizable: true },
    { key: 'grade', title: '钢种' },
    {
      key: 'weightKg',
      title: '计划量 (t)',
      render: row => weightCodec.format(row.weightKg / 1000),
    },
    { key: 'destination', title: '目的地' },
    { key: 'window', title: '装车窗口', resizable: true },
    {
      key: 'plate',
      title: '车辆',
      render: row => row.plate || '待安排',
    },
    {
      key: 'status',
      title: '状态',
      status: Object.fromEntries(
        Object.entries(SHIPMENT_STATES).map(([code, state]) => [
          code,
          { label: state.label, color: state.type },
        ])
      ),
    },
    { key: '_actions', title: '操作', fixed: 'right' },
  ])
  const depart = () => {
    if (current.value?.status !== 'loading' || vehicle.busy) return
    const { id } = current.value
    dialog.info({
      ...BUSINESS_DIALOG_BUTTONS,
      title: '确认车辆出厂',
      content: `${current.value.no} · ${current.value.plate}，请确认装车与出厂校核已完成。`,
      positiveText: '确认出厂',
      negativeText: '取消',
      onPositiveClick: () => {
        rows.value = rows.value.map(row =>
          row.id === id && row.status === 'loading'
            ? { ...row, status: 'departed' }
            : row
        )
        notice.value = '发运任务已确认出厂（本地演示）。'
      },
    })
  }
  const canMoveTask = ({ task, to }: TaskBoardMove<ShippingBoardTask>) => {
    if (task.key !== currentId.value || vehicle.busy) return false
    if (task.status === 'loading') return to.status === 'departed'
    return (
      task.status === 'waiting' &&
      to.status === 'loading' &&
      allocation.canAssign()
    )
  }
  const moveTask = (request: TaskBoardMove<ShippingBoardTask>) => {
    if (!canMoveTask(request)) return
    if (request.to.status === 'loading') void vehicle.assign()
    else depart()
  }
  return {
    notice,
    form: allocation.form,
    vehicle,
    inventory,
    depart,
    restoreVehicle: () => {
      if (!vehicle.busy) activate(currentId.value)
    },
    tasks: proxyRefs({
      rowProps,
      allRows: rows,
      current,
      rows: visibleRows,
      outsideFilter: currentOutsideFilter,
      config: taskTableConfig,
      syncPagination: syncTaskPagination,
      stages,
      columns,
      choose,
      actions: operations.taskActions,
      editor: operations.taskEditor,
    }),
    search: proxyRefs({
      query,
      stage: computed(() => applied.value.status),
      config: searchConfig,
      clear: clearTaskFilters,
      filterStage,
    }),
    board: proxyRefs({
      tasks: boardTasks,
      columns: boardColumns,
      canMove: canMoveTask,
      move: moveTask,
    }),
    schedule: proxyRefs({
      bookings,
      resources: scheduleResources,
    }),
    inspection: proxyRefs({
      shipment: operations.detailShipment,
      visible: operations.detailVisible,
    }),
  }
}
