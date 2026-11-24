/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\useRemoteOrderDraft.ts
 * @Description: 当前远程订单身份、原始草稿及保存生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormInstance } from '@robot-admin/naive-ui-components/C_Form'
import { isAbortError } from '@/utils/abort'
import type { createRemoteOrderDemoApi, OrderDraft, RemoteOrder } from './api'

interface OrderDraftOptions {
  saveOrder: ReturnType<typeof createRemoteOrderDemoApi>['saveOrderDraftApi']
  canSave: () => boolean
  onSaved: (row: RemoteOrder) => void
}

const toDraft = (row?: RemoteOrder | null): OrderDraft => ({
  owner: row?.owner ?? '',
  urgent: row?.urgent ?? false,
  note: row?.note ?? '',
})

const sameDraft = (draft: OrderDraft, snapshot: OrderDraft) =>
  draft.owner === snapshot.owner &&
  draft.urgent === snapshot.urgent &&
  draft.note === snapshot.note

/** 保存整个验证后的草稿快照，更新台账只通过成功结果的业务键回写。 */
export function useRemoteOrderDraft({
  saveOrder,
  canSave,
  onSaved,
}: OrderDraftOptions) {
  const message = useMessage()
  const order = shallowRef<RemoteOrder | null>(null)
  const model = ref<OrderDraft>(toDraft())
  const saved = shallowRef<OrderDraft>(toDraft())
  const form = ref<FormInstance<OrderDraft> | null>(null)
  const saving = ref(false)
  const dirty = computed(() => !sameDraft(model.value, saved.value))
  const lifetime = new AbortController()

  const restore = () => {
    model.value = { ...saved.value }
    form.value?.clearValidation()
  }
  const reset = (row: RemoteOrder | null) => {
    order.value = row
    saved.value = toDraft(row)
    restore()
  }
  const refresh = (row: RemoteOrder) => {
    if (row.id !== order.value?.id || dirty.value || saving.value) return
    order.value = row
    saved.value = toDraft(row)
    model.value = { ...saved.value }
  }
  const validate = async () => {
    try {
      await form.value?.validate()
      return true
    } catch {
      return false
    }
  }
  const submitSnapshot = async (id: string, snapshot: OrderDraft) => {
    try {
      const row = await saveOrder(id, snapshot, lifetime.signal)
      if (lifetime.signal.aborted || order.value?.id !== id) return
      order.value = row
      saved.value = toDraft(row)
      onSaved(row)
      message.success('当前订单已保存到本地示例')
    } catch (error) {
      if (!isAbortError(error)) message.error('保存失败，草稿已保留，请重试')
    }
  }
  const save = async () => {
    const current = order.value
    if (!current || !canSave() || !dirty.value) return
    saving.value = true
    const snapshot = { ...model.value }
    try {
      if (!(await validate()) || lifetime.signal.aborted) return
      if (!sameDraft(model.value, snapshot)) {
        message.warning('草稿在校验期间已变更，请重新保存')
        return
      }
      await submitSnapshot(current.id, snapshot)
    } finally {
      saving.value = false
    }
  }
  onScopeDispose(() => lifetime.abort())

  return { order, model, form, saving, dirty, reset, refresh, restore, save }
}
