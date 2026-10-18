/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 后台消息请求错误留给页面展示，普通交互仍使用统一反馈
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import type { RequestClientConfig } from '@robot-admin/request-core/axios'

const state = vi.hoisted(() => ({
  config: null as RequestClientConfig | null,
  error: vi.fn(),
}))
vi.mock('@robot-admin/request-core/axios', () => ({
  createRequestClient: (config: RequestClientConfig) => {
    state.config = config
    return {}
  },
  waitForReLogin: vi.fn(),
}))
vi.mock('@robot-admin/request-core/vue', () => ({
  createRequestPlugin: vi.fn(),
  createTableCrud: vi.fn(),
}))
vi.mock('@/stores/user', () => ({ s_userStore: vi.fn() }))
vi.mock('@/stores/reLogin', () => ({ s_reLoginStore: vi.fn() }))
vi.mock('@/api/auth', () => ({ refreshTokenApi: vi.fn() }))
vi.mock('@/plugins/discrete', () => ({ message: { error: state.error } }))
import '@/plugins/request-core'

test('silent业务错误仍reject，但不会产生全局提示', async () => {
  const response = state.config!.interceptors!.response!
  const silent = {
    data: { code: 500, msg: '消息服务未接入' },
    config: { url: '/notifications/inbox', silent: true },
  }
  await expect(
    response(silent as unknown as Parameters<typeof response>[0])
  ).rejects.toThrow('消息服务未接入')
  expect(state.error).not.toHaveBeenCalled()
  await expect(
    response({ ...silent, config: { url: '/regular' } } as Parameters<
      typeof response
    >[0])
  ).rejects.toThrow()
  expect(state.error).toHaveBeenCalledOnce()
})

test('silent HTTP错误不吞异常，其他请求保留错误反馈', async () => {
  const responseError = state.config!.interceptors!.responseError!
  const error = Object.assign(new Error('HTTP error'), {
    config: { url: '/notifications/inbox', silent: true },
    response: { status: 404 },
  })
  await expect(
    responseError(error as unknown as Parameters<typeof responseError>[0])
  ).rejects.toBe(error)
  expect(state.error).not.toHaveBeenCalled()
  await expect(
    responseError({ ...error, config: { url: '/regular' } } as Parameters<
      typeof responseError
    >[0])
  ).rejects.toBeDefined()
  expect(state.error).toHaveBeenCalledOnce()
})
