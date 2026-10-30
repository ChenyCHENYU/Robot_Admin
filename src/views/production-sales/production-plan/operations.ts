/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-plan\operations.ts
 * @Description: 计划编制、复制、删除及下达撤销的本地操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Ref } from 'vue'
import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
import type { ProductionPlan } from './data'

export const PLAN_EDIT_FIELDS: FormOption<ProductionPlan>[] = [
  { prop: 'planNo', label: '生产计划号', type: 'input', readonly: true },
  {
    prop: 'line',
    label: '产线',
    type: 'select',
    children: [1, 2, 3].map(i => ({ value: `CC${i}`, label: `${i} 号连铸机` })),
    rules: [{ required: true, message: '请选择产线' }],
  },
  {
    prop: 'cast',
    label: '浇次',
    type: 'input',
    rules: [{ required: true, message: '请填写浇次' }],
  },
  {
    prop: 'grade',
    label: '钢种',
    type: 'select',
    children: ['Q235B', 'Q355B', 'HRB400E', 'S304L'].map(value => ({
      value,
      label: value,
    })),
    rules: [{ required: true, message: '请选择钢种' }],
  },
  {
    prop: 'section',
    label: '断面 (mm)',
    type: 'input',
    rules: [{ required: true, message: '请填写断面' }],
  },
  {
    prop: 'customer',
    label: '客户',
    type: 'input',
    rules: [{ required: true, message: '请填写客户' }],
  },
  {
    prop: 'weight',
    label: '计划量 (t)',
    type: 'inputNumber',
    attrs: { min: 0.001, precision: 3, showButton: false },
    rules: [
      {
        type: 'number',
        required: true,
        min: 0.001,
        message: '计划量必须大于零',
      },
    ],
  },
  {
    prop: 'heats',
    label: '炉数',
    type: 'inputNumber',
    attrs: { min: 1, max: 20, precision: 0, showButton: false },
    rules: [
      {
        type: 'integer',
        required: true,
        min: 1,
        max: 20,
        message: '请填写 1—20 炉',
      },
    ],
  },
  {
    prop: 'delivery',
    label: '交付日期',
    type: 'input',
    placeholder: 'MM-DD，如 10-30',
    rules: [
      {
        required: true,
        pattern: /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        message: '请按 MM-DD 填写交期',
      },
    ],
  },
]

/** 编制弹窗复用包内编辑会话；应用只维护状态约束与本地记录。 */
export function usePlanOperations(context: {
  rows: Ref<ProductionPlan[]>
  currentId: Ref<string>
  selectedIds: Ref<string[]>
  notice: Ref<string>
}) {
  const { rows, currentId, selectedIds, notice } = context
  const dialog = useDialog()
  let sequence = rows.value.length
  const detailVisible = ref(false)
  const detailPlan = shallowRef<ProductionPlan | null>(null)
  const openDetail = (row: ProductionPlan) => {
    detailPlan.value = { ...row }
    detailVisible.value = true
  }
  const editPlan = (row: ProductionPlan) => {
    const target = rows.value.find(item => item.id === row.id)
    if (target?.status === 'draft') editor.openEdit(target)
  }
  const { editor } = useNaiveTableCrud<ProductionPlan>({
    query: async () => ({ items: rows.value, total: rows.value.length }),
    autoLoad: false,
    refreshAfterMutation: false,
    createNewRow: () => {
      const number = ++sequence
      return {
        id: `PLAN-${number}`,
        planNo: `PP-20261029-${String(number).padStart(3, '0')}`,
        line: 'CC1',
        cast: '',
        grade: 'Q355B',
        section: '',
        customer: '',
        weight: 0,
        heats: 1,
        delivery: '10-30',
        status: 'draft',
      }
    },
    editor: {
      createTitle: '新增生产计划',
      editTitle: row => `编辑计划 · ${row.planNo}`,
    },
    mutations: {
      create: async row => {
        rows.value = [...rows.value, { ...row, status: 'draft' }]
        currentId.value = row.id
        notice.value = `${row.planNo} 已保存为待下达计划（本地演示）。`
      },
      update: async row => {
        if (rows.value.find(item => item.id === row.id)?.status !== 'draft')
          throw new Error('仅待下达计划可编辑，请刷新当前状态')
        rows.value = rows.value.map(item =>
          item.id === row.id ? { ...row, status: 'draft' } : item
        )
        notice.value = `${row.planNo} 计划编制已更新。`
      },
    },
  })
  const copy = (row: ProductionPlan) => {
    const source = { ...row }
    editor.openCreate()
    const identity = editor.model.value!
    editor.setModel({
      ...source,
      id: identity.id,
      planNo: identity.planNo,
      status: 'draft',
    })
    editor.title.value = `复制编制 · ${source.planNo}`
  }
  const remove = (target: ProductionPlan) => {
    if (target.status !== 'draft') return
    dialog.warning({
      title: '删除待下达计划',
      content: `确认删除 ${target.planNo}？已下达及执行中的计划不能删除。`,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: () => {
        if (rows.value.find(row => row.id === target.id)?.status !== 'draft')
          return
        rows.value = rows.value.filter(row => row.id !== target.id)
        selectedIds.value = selectedIds.value.filter(id => id !== target.id)
        if (currentId.value === target.id) currentId.value = rows.value[0].id
        notice.value = `${target.planNo} 已删除（本地演示）。`
      },
    })
  }
  const withdraw = () => {
    const ids = selectedIds.value.filter(id =>
      rows.value.some(row => row.id === id && row.status === 'issued')
    )
    if (!ids.length) {
      notice.value = '请勾选已下达且尚未执行的计划。'
      return
    }
    dialog.warning({
      title: '撤销计划下达',
      content: `将 ${ids.length} 项尚未执行的计划退回待下达。执行中的计划保持原状态。`,
      positiveText: '确认撤销',
      negativeText: '取消',
      onPositiveClick: () => {
        rows.value = rows.value.map(row =>
          ids.includes(row.id) && row.status === 'issued'
            ? { ...row, status: 'draft' }
            : row
        )
        notice.value = `已撤销 ${ids.length} 项计划的下达指示（本地演示）。`
      },
    })
  }
  const actions = computed<ActionItem[]>(() => [
    { key: 'create', label: '新增计划', onClick: editor.openCreate },
    {
      key: 'withdraw',
      label: '撤销下达',
      disabled: !selectedIds.value.length,
      onClick: withdraw,
    },
  ])
  return {
    editor,
    actions,
    detailVisible,
    detailPlan,
    openDetail,
    editPlan,
    copyPlan: copy,
    removePlan: remove,
  }
}
