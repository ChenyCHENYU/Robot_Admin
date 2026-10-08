/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\components\relogin.component.ts
 * @Description: 真实重新登录弹窗与 Pinia 会话，验证同公司恢复和迟到响应隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises, DOMWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, ref } from 'vue'
import { NMessageProvider } from 'naive-ui'
import ReLogin from '@/components/global/C_ReLoginDialog/index.vue'
import { s_userStore } from '@/stores/user'
import { loginApi, activateAuthContextApi } from '@/api/auth'
import {
  onReLoginSuccess,
  onReLoginCancel,
} from '@robot-admin/request-core/axios'
import type { AuthContext, LoginResponse } from '@/api/auth.contract'
import { deferred } from './d_deferred'

vi.mock('@/router', () => ({ default: { replace: vi.fn() } }))
vi.mock('@/router/dynamicRouter', () => ({ clearExistingRoutes: vi.fn() }))
vi.mock('@/plugins/discrete', () => ({
  notification: { warning: vi.fn(), success: vi.fn() },
}))
vi.mock('@/stores/permission', () => ({
  s_permissionStore: () => ({ resetPermissions: vi.fn() }),
}))
vi.mock('@/api/auth', () => ({
  loginApi: vi.fn(),
  activateAuthContextApi: vi.fn(),
}))
vi.mock('@/utils/d_telemetry', () => ({ recordTelemetry: vi.fn() }))
vi.mock('@robot-admin/request-core/axios', () => ({
  onReLoginSuccess: vi.fn(),
  onReLoginCancel: vi.fn(),
}))
const context: AuthContext = {
  id: 'context-a',
  tenantId: 'tenant',
  tenantName: '租户',
  companyId: 'company',
  companyName: '公司 A',
  roles: [{ id: 'reader', name: '只读' }],
  isPrimary: true,
}
const response = (id = context.id): LoginResponse => ({
  code: '0',
  msg: '成功',
  data: {
    token: 'new-token',
    refreshToken: 'new-refresh',
    user: { id: 'alice', username: 'Alice', displayName: 'Alice' },
    activeContext: { ...context, id },
    availableContexts: [{ ...context, id }],
  },
})
beforeEach(() => {
  setActivePinia(createPinia())
  const store = s_userStore()
  store.handleLoginSuccess('expired', 'old-refresh', 3600)
  store.setUserInfo({ id: 'alice', username: 'Alice' })
  store.setAuthContexts([context], context)
})
const open = async () => {
  const wrapper = mount(
    defineComponent({
      name: 'ReLoginHarness',
      /** 挂载真实响应式消费方，保持生命周期和模板事件。 */
      setup() {
        const visible = ref(true)
        return () =>
          h(
            NMessageProvider,
            {},
            {
              default: () =>
                h(ReLogin, {
                  modelValue: visible.value,
                  username: 'Alice',
                  'onUpdate:modelValue': (value: boolean) => {
                    visible.value = value
                  },
                }),
            }
          )
      },
    }),
    { attachTo: document.body }
  )
  await flushPromises()
  const input = new DOMWrapper(
    document.querySelector('input[type="password"]') as HTMLInputElement
  )
  await input.setValue('secret')
  return { wrapper, dialog: wrapper.getComponent(ReLogin), input }
}

test('重新验证身份后只恢复原公司，成功后关闭且通知等待请求', async () => {
  vi.mocked(loginApi).mockResolvedValue({
    code: '0',
    msg: '成功',
    data: { token: '', loginTicket: 'ticket', availableContexts: [context] },
  })
  vi.mocked(activateAuthContextApi).mockResolvedValue(response())
  const { dialog, input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  await flushPromises()
  expect(activateAuthContextApi).toHaveBeenCalledExactlyOnceWith({
    loginTicket: 'ticket',
    contextId: context.id,
  })
  expect(s_userStore().token).toBe('new-token')
  expect(s_userStore().activeContext?.id).toBe(context.id)
  expect(dialog.emitted('success')).toHaveLength(1)
  expect(dialog.emitted('update:modelValue')?.at(-1)).toEqual([false])
  expect(onReLoginSuccess).toHaveBeenCalledTimes(1)
})

test('不同公司响应拒绝恢复，保留旧会话并允许重试', async () => {
  vi.mocked(loginApi)
    .mockResolvedValueOnce({
      code: '0',
      msg: '成功',
      data: { token: '', loginTicket: 'ticket', availableContexts: [context] },
    })
    .mockResolvedValueOnce({
      code: '0',
      msg: '成功',
      data: {
        token: '',
        loginTicket: 'retry-ticket',
        availableContexts: [context],
      },
    })
  vi.mocked(activateAuthContextApi)
    .mockResolvedValueOnce(response('context-other'))
    .mockResolvedValueOnce(response())
  const { dialog, input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  await flushPromises()
  expect(s_userStore().token).toBe('expired')
  expect(s_userStore().activeContext?.id).toBe(context.id)
  expect(dialog.emitted('success')).toBeUndefined()
  expect(document.body.textContent).toContain('公司上下文已变化')
  await input.trigger('keyup', { key: 'Enter' })
  await flushPromises()
  expect(s_userStore().token).toBe('new-token')
})

test('连续回车只启动一个重新登录请求', async () => {
  const pending = deferred<LoginResponse>()
  vi.mocked(loginApi).mockReturnValue(pending.promise)
  const { input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  await input.trigger('keyup', { key: 'Enter' })
  expect(loginApi).toHaveBeenCalledTimes(1)
  pending.resolve(response())
  await flushPromises()
})

test('取消后迟到响应不能重新登录或恢复过期 token', async () => {
  const pending = deferred<LoginResponse>()
  vi.mocked(loginApi).mockReturnValue(pending.promise)
  const { dialog, input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  const cancel = [...document.querySelectorAll('button')].find(
    button => button.textContent?.trim() === '取消'
  )!
  await new DOMWrapper(cancel).trigger('click')
  await flushPromises()
  expect(onReLoginCancel).toHaveBeenCalledTimes(1)
  pending.resolve(response())
  await flushPromises()
  expect(s_userStore().token).toBe('')
  expect(dialog.emitted('success')).toBeUndefined()
  expect(onReLoginSuccess).not.toHaveBeenCalled()
})

test('卸载后迟到失败不能改写其他已建立的会话', async () => {
  const pending = deferred<LoginResponse>()
  vi.mocked(loginApi).mockReturnValue(pending.promise)
  const { wrapper, dialog, input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  wrapper.unmount()
  s_userStore().handleLoginSuccess('other-session', 'other-refresh')
  pending.reject(new Error('迟到失败'))
  await flushPromises()
  expect(s_userStore().token).toBe('other-session')
  expect(dialog.emitted('success')).toBeUndefined()
})

test('身份验证阶段取消后不再激活公司', async () => {
  const pending = deferred<LoginResponse>()
  vi.mocked(loginApi).mockReturnValue(pending.promise)
  const { input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  const cancel = [...document.querySelectorAll('button')].find(
    button => button.textContent?.trim() === '取消'
  )!
  await new DOMWrapper(cancel).trigger('click')
  await flushPromises()
  pending.resolve({
    code: '0',
    msg: '成功',
    data: { token: '', loginTicket: 'ticket', availableContexts: [context] },
  })
  await flushPromises()
  expect(activateAuthContextApi).not.toHaveBeenCalled()
  expect(s_userStore().token).toBe('')
})

test('弹窗仍存在时，新会话也不会被迟到成功覆盖', async () => {
  const pending = deferred<LoginResponse>()
  vi.mocked(loginApi).mockReturnValue(pending.promise)
  const { dialog, input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  s_userStore().handleLoginSuccess('other-session', 'other-refresh')
  pending.resolve(response())
  await flushPromises()
  expect(s_userStore().token).toBe('other-session')
  expect(dialog.emitted('success')).toBeUndefined()
  expect(onReLoginSuccess).not.toHaveBeenCalled()
})

test('Escape 关闭与取消按钮遵循相同的会话清理流程', async () => {
  const pending = deferred<LoginResponse>()
  vi.mocked(loginApi).mockReturnValue(pending.promise)
  const { dialog, input } = await open()
  await input.trigger('keyup', { key: 'Enter' })
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
    })
  )
  await flushPromises()
  expect(onReLoginCancel).toHaveBeenCalledTimes(1)
  expect(dialog.emitted('cancel')).toHaveLength(1)
  pending.resolve(response())
  await flushPromises()
  expect(s_userStore().token).toBe('')
  expect(onReLoginSuccess).not.toHaveBeenCalled()
})
