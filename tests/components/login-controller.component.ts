/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\components\login-controller.component.ts
 * @Description: 挂载登录提交，验证请求快照、重复点击及失败重试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, type ShallowUnwrapRef } from 'vue'
import { useLoginController } from '@/composables/useLoginController'
import { notification } from '@/plugins/naive-ui-plugin'
import { deferred } from './d_deferred'

vi.mock('@/plugins/naive-ui-plugin', () => ({
  notification: { success: vi.fn(), error: vi.fn() },
}))
const form = {
  username: 'Alice',
  password: 'secret',
  captchaToken: 'verified',
  captchaTimestamp: 123,
}
const createHarness = (
  loginApi: (
    payload: unknown
  ) => Promise<{ code: string | number; message?: string }>,
  success = vi.fn()
) =>
  defineComponent({
    name: 'LoginControllerHarness',
    /** 挂载真实响应式消费方，保持生命周期和模板事件。 */
    setup(_, { expose }) {
      const controller = useLoginController({
        loginApi,
        onLoginSuccess: success,
      })
      controller.loginRef.value = { resetCaptcha: vi.fn() }
      expose(controller)
      return () =>
        h(
          'button',
          {
            'aria-busy': controller.loading.value,
            onClick: () => controller.handleLogin(form),
          },
          '登录'
        )
    },
  })

describe('登录提交', () => {
  test('重复点击只有一个请求，完成后调用成功回调且不泄漏密码', async () => {
    const pending = deferred<{ code: number }>()
    const api = vi.fn(() => pending.promise)
    const success = vi.fn()
    const wrapper = mount(createHarness(api, success))
    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('click')
    expect(api).toHaveBeenCalledTimes(1)
    expect(api).toHaveBeenCalledWith({
      username: 'Alice',
      password: 'secret',
      captcha: { token: 'verified', timestamp: 123, type: 'puzzle-captcha' },
    })
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
    pending.resolve({ code: 0 })
    await flushPromises()
    expect(success).toHaveBeenCalledWith({ code: 0 }, { username: 'Alice' })
    expect(notification.success).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button').attributes('aria-busy')).toBe('false')
  })
  test('业务失败恢复提交状态并重置验证码，下一次可以成功', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({ code: '403', message: '账号停用' })
      .mockResolvedValueOnce({ code: '0' })
    const wrapper = mount(createHarness(api))
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(notification.error).toHaveBeenCalledWith({
      content: '账号停用',
      duration: 3000,
    })
    expect(
      (
        wrapper.vm as unknown as ShallowUnwrapRef<
          ReturnType<typeof useLoginController>
        >
      ).loginRef!.resetCaptcha
    ).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button').attributes('aria-busy')).toBe('false')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(2)
    expect(notification.success).toHaveBeenCalledTimes(1)
  })
})

test('待激活阶段不提示会话成功，认证错误回调只收到受控诊断', async () => {
  const onError = vi.fn()
  const api = vi
    .fn()
    .mockResolvedValueOnce({ code: '0' })
    .mockRejectedValueOnce({
      message: 'raw credential-secret',
      config: {
        data: { password: 'credential-secret' },
        headers: { authorization: 'token-secret' },
      },
      response: { status: 401, data: { code: 40102, message: 'disabled' } },
    })
  const wrapper = mount(
    defineComponent({
      /** 挂载身份验证和错误诊断消费方。 */
      setup() {
        const controller = useLoginController({
          loginApi: api,
          onLoginSuccess: vi.fn(),
          shouldNotifySuccess: () => false,
          resolveErrorMessage: () => '账号或密码错误，请重新验证',
          onError,
        })
        return () =>
          h('button', { onClick: () => controller.handleLogin(form) }, '登录')
      },
    })
  )
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(notification.success).not.toHaveBeenCalled()
  await wrapper.get('button').trigger('click')
  await flushPromises()
  const error = onError.mock.calls[0][0]
  expect(error).toBeInstanceOf(Error)
  expect(error.message).toBe('账号或密码错误，请重新验证')
  expect(error.status).toBe(401)
  expect(error.code).toBe(40102)
  expect(error.config).toBeUndefined()
  expect(JSON.stringify(error)).not.toContain('secret')
  expect(notification.error).toHaveBeenCalledWith({
    content: '账号或密码错误，请重新验证',
    duration: 3000,
  })
})
