/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\sys-manage\dictionary-manage\useDictionaryCommit.ts
 * @Description: 字典写入完成后的会话校验、缓存失效与刷新反馈
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { useDictionaries } from '@robot-admin/dictionary/vue'

/** 只有当前会话中的写入可以触发字典消费方失效并刷新列表。 */
export function useDictionaryCommit() {
  const dictionaries = useDictionaries()
  const message = useMessage()

  return async (
    write: () => Promise<void>,
    reload: () => Promise<boolean>,
    success: string,
    isCurrent: () => boolean
  ) => {
    if (!isCurrent()) return false
    await write()
    if (!isCurrent()) return false
    dictionaries.invalidate()
    const refreshed = await reload()
    if (!isCurrent()) return false
    if (refreshed) message.success(success)
    else message.warning('操作已成功，列表刷新失败，请重新加载')
    return true
  }
}
