/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\operations.ts
 * @Description: 发运任务编制弹窗与按状态开放的操作栏
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Ref } from 'vue'
import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
import type { Shipment } from './data'

export const SHIPMENT_EDIT_FIELDS: FormOption<Shipment>[] = [
  { prop: 'no', label: '发运单号', type: 'input', readonly: true },
  {
    prop: 'customer',
    label: '客户',
    type: 'input',
    rules: [{ required: true, message: '请填写客户' }],
  },
  {
    prop: 'grade',
    label: '钢种',
    type: 'select',
    children: ['Q355B', 'Q235B', 'HRB400E'].map(value => ({
      value,
      label: value,
    })),
    rules: [{ required: true, message: '请选择钢种' }],
  },
  {
    prop: 'destination',
    label: '目的地',
    type: 'select',
    children: ['南京港', '无锡库', '南通港'].map(value => ({
      value,
      label: value,
    })),
    rules: [{ required: true, message: '请选择目的地' }],
  },
  {
    prop: 'weightKg',
    label: '计划量 (kg)',
    type: 'inputNumber',
    attrs: { min: 1, precision: 0, showButton: false },
    rules: [
      {
        type: 'integer',
        required: true,
        min: 1,
        message: '请填写正整数公斤数',
      },
    ],
  },
  {
    prop: 'window',
    label: '装车窗口',
    type: 'input',
    placeholder: '09:00 — 10:00',
    rules: [{ required: true, message: '请填写装车窗口' }],
  },
]

/** 任务编制与车辆安排共用当前任务；已开始装车的任务禁止重写计划。 */
export function useShipmentOperations(context: {
  rows: Ref<Shipment[]>
  currentId: Ref<string>
  notice: Ref<string>
  activate: (id: string) => void
  vehicleDirty: () => boolean
}) {
  const { rows, currentId, notice, activate, vehicleDirty } = context
  const dialog = useDialog()
  const detailVisible = ref(false)
  const current = computed(
    () => rows.value.find(row => row.id === currentId.value) ?? rows.value[0]
  )
  let sequence = rows.value.length
  const { editor } = useNaiveTableCrud<Shipment>({
    query: async () => ({ items: rows.value, total: rows.value.length }),
    autoLoad: false,
    refreshAfterMutation: false,
    editor: {
      createTitle: '新增发运任务',
      editTitle: row => `编辑发运任务 · ${row.no}`,
    },
    createNewRow: () => {
      const number = ++sequence
      return {
        id: `SHIP-${number}`,
        no: `DN-261029-${String(number).padStart(3, '0')}`,
        customer: '',
        grade: 'Q355B',
        destination: '南京港',
        weightKg: 22800,
        window: '15:00 — 16:00',
        plate: '',
        status: 'waiting',
      }
    },
    mutations: {
      create: async row => {
        rows.value = [...rows.value, { ...row, status: 'waiting', plate: '' }]
        activate(row.id)
        notice.value = `${row.no} 已建立，接下来核对库存与车辆。`
      },
      update: async row => {
        if (rows.value.find(item => item.id === row.id)?.status !== 'waiting')
          throw new Error('任务已开始装车，不能变更计划')
        rows.value = rows.value.map(item =>
          item.id === row.id ? { ...row, status: 'waiting' } : item
        )
        activate(row.id)
        notice.value = `${row.no} 已更新，库存勾选已清空，请重新核对配载。`
      },
    },
  })
  const open = (mode: 'create' | 'edit') => {
    if (vehicleDirty()) {
      notice.value = '当前车辆安排有未保存修改，请先生成装车单或恢复车辆安排。'
      return
    }
    if (mode === 'create') editor.openCreate()
    else if (current.value.status === 'waiting') editor.openEdit(current.value)
  }
  const remove = () => {
    const target = current.value
    if (target.status !== 'waiting' || vehicleDirty()) return
    dialog.warning({
      title: '删除待配载任务',
      content: `确认删除 ${target.no}？已开始装车和已出厂任务保留追溯记录。`,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: () => {
        if (rows.value.find(row => row.id === target.id)?.status !== 'waiting')
          return
        rows.value = rows.value.filter(row => row.id !== target.id)
        activate(rows.value[0].id)
        notice.value = `${target.no} 已删除（本地演示）。`
      },
    })
  }
  const actions = computed<ActionItem[]>(() => [
    { key: 'create', label: '新增发运任务', onClick: () => open('create') },
    {
      key: 'edit',
      label: '编辑当前任务',
      disabled: current.value.status !== 'waiting',
      onClick: () => open('edit'),
    },
    {
      key: 'detail',
      label: '发运单详情',
      onClick: () => {
        detailVisible.value = true
      },
    },
    {
      key: 'delete',
      label: '删除当前任务',
      disabled: current.value.status !== 'waiting' || vehicleDirty(),
      onClick: remove,
    },
  ])
  return { taskEditor: editor, taskActions: actions, detailVisible }
}
