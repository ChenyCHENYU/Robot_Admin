/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\operations.ts
 * @Description: 炉次实绩复核、退回补录、撤回复核和本地追溯
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Ref } from 'vue'
import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
import type { TimelineItem } from '@robot-admin/naive-ui-components/C_Timeline'

interface ActualReview {
  id: string
  heatId: string
  heatNo: string
  reviewer: string
  result: 'pass' | 'return' | 'withdraw'
  note: string
  time: string
}
export const REVIEW_FIELDS: FormOption<ActualReview>[] = [
  { prop: 'heatNo', label: '复核炉号', type: 'input', readonly: true },
  {
    prop: 'reviewer',
    label: '复核人员',
    type: 'input',
    rules: [{ required: true, message: '请填写复核人员' }],
  },
  {
    prop: 'result',
    label: '复核结论',
    type: 'select',
    children: [
      { value: 'pass', label: '复核通过' },
      { value: 'return', label: '退回补录' },
    ],
    rules: [{ required: true, message: '请选择结论' }],
  },
  {
    prop: 'note',
    label: '复核意见',
    type: 'textarea',
    attrs: { rows: 3 },
    layout: { span: 2 },
    rules: [
      {
        required: true,
        whitespace: true,
        message: '请填写复核意见，存在成分偏差时说明处置依据',
      },
    ],
  },
]
/** 复核基于已保存快照；通过后锁定实绩，撤回保留追溯。 */
export function useActualReview(context: {
  current: Readonly<Ref<{ id: string; no: string; state: string }>>
  dirty: Readonly<Ref<boolean>>
  notice: Ref<string>
  saving: Ref<boolean>
}) {
  const { current, dirty, notice, saving } = context
  const dialog = useDialog()
  const history = ref<ActualReview[]>([])
  const historyVisible = ref(false)
  let sequence = 0
  const reviewsByHeat = computed(
    () => new Map(history.value.map(row => [row.heatId, row]))
  )
  const latest = computed(() => reviewsByHeat.value.get(current.value.id))
  const locked = computed(
    () => current.value.state === '已归档' || latest.value?.result === 'pass'
  )
  const stateOf = (id: string, initial: string) => {
    const record = reviewsByHeat.value.get(id)
    if (!record || record.result === 'withdraw') return initial
    return record.result === 'pass' ? '已复核' : '退回补录'
  }
  const { editor: reviewEditor } = useNaiveTableCrud<ActualReview>({
    query: async () => ({ items: history.value, total: history.value.length }),
    autoLoad: false,
    refreshAfterMutation: false,
    editor: { createTitle: '炉次实绩复核' },
    createNewRow: () => ({
      id: `REVIEW-${++sequence}`,
      heatId: current.value.id,
      heatNo: current.value.no,
      reviewer: '陈雨',
      result: 'pass',
      note: '',
      time: '',
    }),
    mutations: {
      create: async row => {
        if (
          row.heatId !== current.value.id ||
          dirty.value ||
          locked.value ||
          saving.value
        )
          throw new Error('炉次或实绩已变化，请保存后重新发起复核')
        if (!row.note.trim() || row.result === 'withdraw')
          throw new Error('请补齐有效的复核结论和意见')
        history.value = [
          ...history.value,
          {
            ...row,
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
          },
        ]
        notice.value = `${row.heatNo} ${row.result === 'pass' ? '复核通过，实绩已锁定' : '已退回补录，实绩仍可修改'}（本地演示）。`
      },
    },
  })
  const openReview = () => {
    if (locked.value || saving.value) return
    if (dirty.value) {
      notice.value = '请先保存当前炉次实绩，再发起复核。'
      return
    }
    reviewEditor.openCreate()
  }
  const withdraw = () => {
    const record = latest.value
    if (record?.result !== 'pass') return
    dialog.warning({
      title: '撤回实绩复核',
      content: `${record.heatNo} 将恢复可编辑，原复核记录保留。`,
      positiveText: '确认撤回',
      negativeText: '取消',
      onPositiveClick: () => {
        if (
          latest.value?.id !== record.id ||
          current.value.id !== record.heatId
        )
          return
        history.value = [
          ...history.value,
          {
            ...record,
            id: `REVIEW-${++sequence}`,
            result: 'withdraw',
            note: '撤回复核，重新补充实绩',
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
          },
        ]
        notice.value = `${record.heatNo} 已撤回复核，可以重新补录。`
      },
    })
  }
  const historyItems = computed<TimelineItem[]>(() =>
    history.value
      .filter(row => row.heatId === current.value.id)
      .map(row => ({
        id: row.id,
        title:
          row.result === 'pass'
            ? '实绩复核通过'
            : row.result === 'return'
              ? '实绩退回补录'
              : '实绩复核已撤回',
        time: row.time,
        tags: [{ text: row.reviewer }],
        status: row.result === 'pass' ? 'success' : 'warning',
      }))
  )
  const reviewActions = computed<ActionItem[]>(() => [
    {
      key: 'review',
      label: '实绩复核',
      disabled: locked.value || saving.value,
      onClick: openReview,
    },
    {
      key: 'withdraw',
      label: '撤回复核',
      disabled: latest.value?.result !== 'pass' || saving.value,
      onClick: withdraw,
    },
    {
      key: 'detail',
      label: '复核记录',
      onClick: () => {
        historyVisible.value = true
      },
    },
  ])
  return {
    reviewEditor,
    reviewActions,
    historyVisible,
    historyItems,
    latest,
    locked,
    stateOf,
  }
}
