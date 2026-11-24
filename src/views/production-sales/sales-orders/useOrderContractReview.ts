/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\useOrderContractReview.ts
 * @Description: 销售合同预览、版本校验和字段采纳
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  previewContractReview,
  resolveContractReview,
  type ContractField,
} from './contractReview'
import type { OrderHeader } from './data'

interface OrderContractReviewOptions {
  header: Ref<OrderHeader>
  persistedStatus: () => OrderHeader['status']
  blocked: () => boolean
  notice: Ref<string>
}

/** 采纳仅写入当前草稿，预览期间变更的字段由合同快照校验保护。 */
export function useOrderContractReview({
  header,
  persistedStatus,
  blocked,
  notice,
}: OrderContractReviewOptions) {
  const visible = ref(false)
  const preview = shallowRef<ReturnType<typeof previewContractReview>>(null)
  const version = ref(0)
  const error = ref('')
  const canEdit = computed(
    () => persistedStatus() === 0 && header.value.status === 0
  )
  const canAdopt = computed(() => canEdit.value && !blocked())

  const open = () => {
    preview.value = previewContractReview(header.value)
    version.value++
    error.value = ''
    visible.value = true
  }
  const close = () => {
    visible.value = false
    preview.value = null
    error.value = ''
  }
  const adopt = (keys: ContractField[]) => {
    if (!canAdopt.value || !preview.value) return false
    const patch = resolveContractReview(header.value, preview.value, keys)
    if (!patch) {
      error.value = '草稿已变更，请刷新比对后重新选择字段。'
      return false
    }
    header.value = { ...header.value, ...patch }
    notice.value = `已采纳 ${keys.length} 个字段到订单草稿，请保存整单。`
    close()
    return true
  }

  return proxyRefs({
    visible,
    preview,
    version,
    error,
    canEdit,
    canAdopt,
    open,
    close,
    adopt,
  })
}
