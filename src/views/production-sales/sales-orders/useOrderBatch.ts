/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\useOrderBatch.ts
 * @Description: 订单明细批改预览、应用及分项重试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  createBatchPatch,
  type BatchOperationResult,
} from '@robot-admin/naive-ui-components/data'
import { delayWithSignal } from '@/utils/abort'
import type { OrderLine } from './data'

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

interface OrderBatchOptions {
  order: Ref<string>
  lines: Ref<OrderLine[]>
  notice: Ref<string>
  selectedKeys: () => string[]
  saving: () => boolean
  commitEdit: () => Promise<boolean>
  saveLine: (key: string, patch: Partial<OrderLine>) => void
}

/** 当前订单内持有一份批改计划，成功项和失败项可按原计划独立追踪。 */
export function useOrderBatch({
  order,
  lines,
  notice,
  selectedKeys,
  saving,
  commitEdit,
  saveLine,
}: OrderBatchOptions) {
  const busy = ref(false)
  const visible = ref(false)
  const mode = ref<BatchMode>('keep')
  const value = ref('统一交期备注')
  const preview = shallowRef<
    Array<{
      key: string
      product: string
      before: string | null
      after: string | null
    }>
  >([])
  const results = shallowRef<BatchOperationResult[]>([])
  let batchPlan: BatchPlan | undefined
  const reset = () => {
    batchPlan = undefined
    preview.value = []
    results.value = []
  }
  const open = () => {
    const ids = selectedKeys()
    if (!ids.length || saving() || busy.value) return
    if (batchPlan) {
      const keys = new Set(ids)
      if (
        keys.size !== batchPlan.keys.length ||
        batchPlan.keys.some(key => !keys.has(key))
      )
        reset()
    }
    visible.value = true
  }
  watch([mode, value], reset)
  const attempts = new Map<string, number>()
  let alive = true
  let batchController: AbortController | undefined
  onScopeDispose(() => {
    alive = false
    batchController?.abort()
  })
  const previewChanges = async () => {
    const orderAtStart = order.value
    if (busy.value || !(await commitEdit()) || orderAtStart !== order.value)
      return
    const keys = selectedKeys()
    results.value = []
    const change =
      mode.value === 'set'
        ? {
            field: 'note' as const,
            operation: 'set' as const,
            value: value.value,
          }
        : { field: 'note' as const, operation: mode.value }
    const patch = createBatchPatch<OrderLine>([change])
    batchPlan = {
      order: order.value,
      keys,
      patch,
      before: new Map(lines.value.map(row => [row.id, row.note])),
    }
    preview.value = lines.value
      .filter(row => keys.includes(row.id))
      .map(row => ({
        key: row.id,
        product: row.product,
        before: row.note,
        after: 'note' in patch ? (patch.note ?? null) : row.note,
      }))
    notice.value = keys.length
      ? '请检查变更预览后执行'
      : '请先选择需要批改的明细'
  }
  const canExecutePlan = (plan: BatchPlan | undefined): plan is BatchPlan =>
    !!plan && plan.order === order.value && !busy.value
  const acceptBatchResults = (updated: BatchOperationResult[]) => {
    const latest = new Map(results.value.map(result => [result.key, result]))
    updated.forEach(result => latest.set(result.key, result))
    results.value = [...latest.values()]
    notice.value = results.value.some(result => result.status !== 'success')
      ? '批改已返回分项结果，失败草稿继续保留'
      : '本次批改已全部保存'
  }
  const recordBatchError = (error: unknown) => {
    if (alive)
      notice.value =
        error instanceof Error ? error.message : '批改失败，草稿保留'
  }
  const execute = async (retry?: (string | number)[]) => {
    const plan = batchPlan
    if (!canExecutePlan(plan)) return
    const { keys, stale } = getBatchSubmission(
      plan,
      lines.value,
      results.value,
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
    busy.value = true
    lines.value = lines.value.map(row =>
      keys.includes(row.id) ? { ...row, ...plan.patch } : row
    )
    try {
      const task = new AbortController()
      batchController = task
      await delayWithSignal(80, task.signal)
      if (!alive || plan.order !== order.value) return
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
        saveLine(key, plan.patch)
        return { key, status: 'success', message: '已保存' }
      })
      acceptBatchResults(results)
    } catch (error) {
      recordBatchError(error)
    } finally {
      batchController = undefined
      if (alive) busy.value = false
    }
  }
  const close = () => {
    visible.value = false
    reset()
  }

  return proxyRefs({
    busy,
    visible,
    mode,
    value,
    preview,
    results,
    open,
    close,
    reset,
    previewChanges,
    execute,
  })
}
