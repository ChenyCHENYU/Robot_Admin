/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\tests\components\auth-feedback.component.ts
 * @Description: 退出路由完成后通知、过期提示与迟到退出隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import { notification } from '@/plugins/discrete'
import { s_userStore } from '@/stores/user'
import { deferred } from './d_deferred'

vi.mock('@/router', () => ({ default: { replace: vi.fn() } }))
vi.mock('@/router/dynamicRouter', () => ({ clearExistingRoutes: vi.fn() }))
vi.mock('@/stores/permission', () => ({
  s_permissionStore: () => ({ resetPermissions: vi.fn() }),
}))
vi.mock('@/plugins/discrete', () => ({
  notification: { success: vi.fn(), warning: vi.fn() },
}))
beforeEach(() => {
  setActivePinia(createPinia())
})
test('退出先清理认证，等登录页就绪后再显示保留用户名的告别', async () => {
  const route = deferred<void>()
  vi.mocked(router.replace).mockReturnValueOnce(route.promise)
  const store = s_userStore()
  store.setToken('old-token')
  store.setUserInfo({ displayName: 'CHENY' })
  const logout = store.logout()
  await flushPromises()
  expect(store.token).toBe('')
  expect(localStorage.getItem('token')).toBeNull()
  expect(notification.success).not.toHaveBeenCalled()
  route.resolve()
  await logout
  expect(notification.success).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '已退出登录',
      content: expect.stringContaining('CHENY，辛苦了'),
      duration: 4500,
    })
  )
})
test('会话到期明确提示重新登录，不显示主动退出的告别', async () => {
  const store = s_userStore()
  store.setToken('expired-token')
  await store.logout(true)
  expect(notification.warning).toHaveBeenCalledWith(
    expect.objectContaining({ title: '登录已到期' })
  )
  expect(notification.success).not.toHaveBeenCalled()
})
test('等待导航期间建立的新会话不收到旧退出的告别', async () => {
  const route = deferred<void>()
  vi.mocked(router.replace).mockReturnValueOnce(route.promise)
  const store = s_userStore()
  const logout = store.logout()
  await flushPromises()
  store.setToken('new-token')
  route.resolve()
  await logout
  expect(store.token).toBe('new-token')
  expect(notification.success).not.toHaveBeenCalled()
})
