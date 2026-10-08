/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\tests\latest-request.test.ts
 * @Description: 最近请求生命周期与取消行为测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import { effectScope } from 'vue'
import { useLatestRequest } from '../src/composables/useLatestRequest'
import {
  createAbortError,
  delayWithSignal,
  withRequestTimeout,
} from '../src/utils/abort'

describe('latest request lifecycle', () => {
  test('新请求会取消旧请求且只返回最新结果', async () => {
    const scope = effectScope()
    const controller = scope.run(() => useLatestRequest())
    if (!controller) throw new Error('请求控制器初始化失败')

    const first = controller.run<number>(
      signal =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(createAbortError()), {
            once: true,
          })
        })
    )
    const second = controller.run(async () => 2)

    expect(await first).toBeUndefined()
    expect(await second).toBe(2)
    expect(controller.loading.value).toBe(false)
    scope.stop()
  })

  test('可取消延迟在 signal 中止后立即拒绝', async () => {
    const controller = new AbortController()
    const pending = delayWithSignal(1_000, controller.signal)
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })

  test('超时作为可重试失败，调用方取消和新任务取消不污染页面失败态', async () => {
    const scope = effectScope()
    const latest = scope.run(() => useLatestRequest())!
    try {
      await expect(
        latest.run(signal =>
          withRequestTimeout(inner => delayWithSignal(1000, inner), signal, 5)
        )
      ).rejects.toMatchObject({ name: 'TimeoutError' })
      expect(latest.loading.value).toBe(false)
      const pending = latest.run(signal =>
        withRequestTimeout(inner => delayWithSignal(1000, inner), signal, 500)
      )
      latest.cancel()
      expect(await pending).toBeUndefined()
      expect(
        await latest.run(signal =>
          withRequestTimeout(async () => '新结果', signal, 500)
        )
      ).toBe('新结果')
      const cancelled = new AbortController()
      cancelled.abort()
      let called = false
      await expect(
        withRequestTimeout(
          async () => {
            called = true
          },
          cancelled.signal,
          5
        )
      ).rejects.toMatchObject({ name: 'AbortError' })
      expect(called).toBe(false)
    } finally {
      scope.stop()
    }
  })
})
