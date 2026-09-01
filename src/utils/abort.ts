/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\utils\abort.ts
 * @Description: 统一的请求取消与可取消延迟工具
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

type ErrorWithCode = Error & { code?: string }

export const createAbortError = (): Error => {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('请求已取消', 'AbortError')
  }
  const error = new Error('请求已取消')
  error.name = 'AbortError'
  return error
}

export const isAbortError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false
  const errorWithCode = error as ErrorWithCode
  return (
    error.name === 'AbortError' ||
    error.name === 'CanceledError' ||
    errorWithCode.code === 'ERR_CANCELED'
  )
}

/** 可被 AbortSignal 立即打断的延迟，供 Mock 与交互测试复用。 */
export const delayWithSignal = (
  delay: number,
  signal?: AbortSignal
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    const timer = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    /** 清理计时器并以标准取消错误结束等待。 */
    function handleAbort() {
      globalThis.clearTimeout(timer)
      reject(createAbortError())
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
