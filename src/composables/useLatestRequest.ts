/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\composables\useLatestRequest.ts
 * @Description: 只接收最近一次请求结果的生命周期控制器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { onScopeDispose, readonly, ref } from 'vue'
import { isAbortError } from '../utils/abort'

/**
 * 防止快速搜索、筛选和翻页时，较慢的旧响应覆盖最新页面状态。
 * 新任务会取消旧任务；组件销毁时也会终止仍在进行的请求。
 */
export const useLatestRequest = () => {
  const loading = ref(false)
  let activeController: AbortController | undefined

  const cancel = () => {
    activeController?.abort()
    activeController = undefined
    loading.value = false
  }

  const run = async <T>(
    request: (signal: AbortSignal) => Promise<T>
  ): Promise<T | undefined> => {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    loading.value = true

    try {
      const result = await request(controller.signal)
      return controller.signal.aborted ? undefined : result
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return undefined
      throw error
    } finally {
      if (activeController === controller) {
        activeController = undefined
        loading.value = false
      }
    }
  }

  onScopeDispose(cancel)

  return {
    loading: readonly(loading),
    run,
    cancel,
  }
}
