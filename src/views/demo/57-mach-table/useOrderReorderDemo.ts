/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\useOrderReorderDemo.ts
 * @Description: 通过 MachTable ordering 演示保存、冲突与撤销重做
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { GridApi } from '@agile-team/mach-table-vue'
import {
  createRowOrderController,
  type RowOrderIntent,
  type RowOrderSaveContext,
  type RowOrderSaveResult,
  type RowOrderState,
} from '@agile-team/mach-table-vue/ordering'
import { delayWithSignal } from '@/utils/abort'
import { createOrderRows, type OrderRow } from './data'

export type OrderReorderSaveMode = 'success' | 'failure' | 'conflict'
export const ORDER_REORDER_SAVE_OPTIONS: Array<{
  label: string
  value: OrderReorderSaveMode
}> = [
  { label: '保存成功', value: 'success' },
  { label: '模拟保存失败', value: 'failure' },
  { label: '模拟版本冲突', value: 'conflict' },
]
const ORDER_OPERATION_LABELS = { move: '调整', undo: '撤销', redo: '重做' }

/** 本地模拟服务器与一次 ordering 绑定；不调用订单接口或保存用户偏好。 */
export function useOrderReorderDemo(getApi: () => GridApi<OrderRow> | null) {
  const message = useMessage()
  const orderRows = shallowRef(createOrderRows(30))
  const saveMode = ref<OrderReorderSaveMode>('success')
  const clientRevision = ref(1)
  const serverRevision = ref(1)
  const operation = ref<keyof typeof ORDER_OPERATION_LABELS>('move')
  const notice = ref('尚未调整顺序')
  const state = shallowRef<RowOrderState<OrderRow>>({
    status: 'idle',
    error: null,
    revision: 1,
    plan: null,
    canUndo: false,
    canRedo: false,
  })
  let serverRows: readonly OrderRow[] = orderRows.value

  /** 同一个不可变数组同时交给宿主和 API，避免维护第二份业务顺序。 */
  const applyRows = (next: readonly OrderRow[]): void => {
    orderRows.value = [...next]
    getApi()?.rows.setData(orderRows.value)
  }

  /** 模拟服务端以一次 CAS 原子安装 plan.after，撤销/重做走相同保存协议。 */
  const save = async (
    intent: RowOrderIntent,
    context: RowOrderSaveContext<OrderRow>
  ): Promise<RowOrderSaveResult> => {
    operation.value = context.operation
    const outcome = saveMode.value
    await delayWithSignal(450, context.signal)
    if (intent.expectedRevision !== serverRevision.value) {
      return { status: 'conflict', revision: serverRevision.value }
    }
    if (outcome === 'failure') throw new Error('模拟网络保存失败')
    if (outcome === 'conflict') {
      serverRows = [...serverRows.slice(1), ...serverRows.slice(0, 1)]
      return {
        status: 'conflict',
        revision: ++serverRevision.value,
        message: '模拟服务器顺序已变更',
      }
    }
    serverRows = context.plan.after
    return { revision: ++serverRevision.value }
  }

  /** 使用侧只提供数据安装与传输，拖拽判定、历史和失败补偿由包负责。 */
  const createController = () =>
    createRowOrderController<OrderRow>({
      rowKey: 'id',
      getRows: () => orderRows.value,
      applyRows,
      getRevision: () => clientRevision.value,
      save,
      onStateChange: next => {
        notice.value = ''
        state.value = next
        if (next.status === 'saved' && typeof next.revision === 'number')
          clientRevision.value = next.revision
      },
    })
  const ordering = shallowRef(createController())
  const busy = computed(() => state.value.status === 'saving')
  const statusText = computed(() => {
    if (notice.value) return notice.value
    const label = ORDER_OPERATION_LABELS[operation.value]
    const count = state.value.plan?.rowIds.length ?? 0
    const messages = {
      idle: '拖动已选项可批量调整顺序',
      saving: `${label} ${count} 项顺序，正在模拟保存（450ms）…`,
      saved: `已${label} ${count} 项顺序（模拟保存成功）`,
      error: '模拟保存失败，已回滚至调整前顺序。切换“保存成功”后可重试。',
      conflict:
        '模拟版本冲突，本次调整已回滚；请重新加载服务器顺序，再切换“保存成功”。',
    }
    return messages[state.value.status]
  })

  /** 外部换数是新排序作用域，释放旧保存与历史，再安装确认过的数据。 */
  const replaceRows = (
    next: readonly OrderRow[],
    revision: number,
    feedback: string
  ): void => {
    ordering.value.dispose()
    clientRevision.value = revision
    ordering.value = createController()
    applyRows(next)
    state.value = ordering.value.state
    notice.value = feedback
  }
  const reset = (): void => {
    serverRows = createOrderRows(30)
    serverRevision.value = 1
    replaceRows(serverRows, 1, '已恢复初始顺序')
  }
  const reload = (): void =>
    replaceRows(serverRows, serverRevision.value, '已重新加载模拟服务器顺序')
  const cancelPending = (): void => {
    if (!busy.value || !state.value.plan) return
    replaceRows(
      state.value.plan.before,
      clientRevision.value,
      '已取消未完成的模拟保存，保留上次确认顺序'
    )
  }
  const preview = computed(() =>
    orderRows.value
      .slice(0, 3)
      .map(row => row.orderNo)
      .join(' → ')
  )
  const changed = computed(() =>
    orderRows.value.some((row, index) => row.id !== String(index + 1))
  )
  const selectSample = (): void => {
    const api = getApi()
    if (!api) return
    api.selection.clear()
    for (const row of [orderRows.value[0], orderRows.value[2]]) {
      if (row) api.selection.setById(row.id, true, false)
    }
  }
  const restore = async (operation: 'undo' | 'redo'): Promise<void> => {
    try {
      await ordering.value[operation]()
    } catch (error) {
      message.warning(error instanceof Error ? error.message : '顺序操作未完成')
    }
  }
  const refreshState = (): void => {
    state.value = ordering.value.state
  }
  onDeactivated(cancelPending)
  onScopeDispose(() => ordering.value.dispose())
  return proxyRefs({
    rows: orderRows,
    bindings: computed(() => ordering.value.bindings),
    state,
    busy,
    saveMode,
    clientRevision,
    serverRevision,
    statusText,
    preview,
    changed,
    reset,
    reload,
    cancelPending,
    selectSample,
    restore,
    refreshState,
  })
}
