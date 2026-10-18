/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 顶部预览的计数、领域所有权、业务详情入口及失败重试截止回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useNotificationBell } from '@/components/global/C_NotificationBell/data'
import { deferred } from './d_deferred'

const state = vi.hoisted(() => ({ store: {} as Record<string, unknown> }))
vi.mock('@/stores/notification', () => ({
  s_notificationStore: () => state.store,
}))
const release = vi.fn()
const makeStore = () =>
  reactive({
    scopeKey: 'alice:tenant:company',
    mode: 'demo',
    revision: 12,
    loading: false,
    error: '',
    previewItems: [
      {
        id: 'one',
        title: '一条预览',
        summary: '',
        category: 'system',
        priority: 'normal',
        readAt: null,
        archivedAt: null,
        createdAt: '2026-10-18T00:00:00Z',
        source: '测试',
      },
    ],
    stats: {
      total: 100,
      unread: 78,
      byCategory: { system: 78, business: 0, alarm: 0 },
    },
    query: { keyword: '完整页查询', status: 'unread' },
    acquire: vi.fn(() => release),
    refresh: vi.fn(async () => undefined),
    mutate: vi.fn(async (): Promise<void> => undefined),
    markAllRead: vi.fn(async () => undefined),
    clearMessages: vi.fn(async () => undefined),
  })
let store: ReturnType<typeof makeStore>
beforeEach(() => {
  store = makeStore()
  state.store = store
  release.mockClear()
})

const setup = () => {
  let bridge!: ReturnType<typeof useNotificationBell>
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/messages', name: 'account-messages', component: {} },
    ],
  })
  const wrapper = mount(
    defineComponent({
      name: 'BellHarness',
      /** 挂载真实桥接组合函数，保留生命周期与路由注入。 */
      setup() {
        bridge = useNotificationBell()
        return () => h('div')
      },
    }),
    { global: { plugins: [router] } }
  )
  return { bridge, wrapper, router }
}

test('一条预览仍显示全局78未读，预览分类不修改完整页查询，卸载只释放自己的引用', async () => {
  const { bridge, wrapper, router } = setup()
  expect(bridge.controller.unreadCount.value).toBe(78)
  expect(bridge.controller.messages.value).toHaveLength(1)
  bridge.controller.switchCategory('business')
  expect(bridge.controller.filteredMessages.value).toEqual([])
  expect(store.query.keyword).toBe('完整页查询')
  bridge.controller.selectMessage(bridge.controller.messages.value[0]!)
  await flushPromises()
  expect(router.currentRoute.value.query.message).toBe('one')
  expect(store.mutate).not.toHaveBeenCalled()
  wrapper.unmount()
  expect(release).toHaveBeenCalledOnce()
})

test('全部已读失败后的重试保留原始截止，不吞掉失败后抵达的消息', async () => {
  const { bridge } = setup()
  store.markAllRead.mockRejectedValueOnce(new Error('模拟失败'))
  await expect(bridge.controller.markAllAsRead('system')).rejects.toThrow(
    '模拟失败'
  )
  store.revision = 18
  await bridge.controller.retry!()
  expect(store.markAllRead.mock.calls).toEqual([
    ['system', 12],
    ['system', 12],
  ])
})

test('切换账户后迟到的失败不能重建旧命令重试', async () => {
  const { bridge } = setup()
  const request = deferred<void>()
  store.mutate.mockImplementationOnce(() => request.promise)
  const operation = bridge.controller
    .markAsRead(['old-user-message'])
    .catch(() => undefined)
  store.scopeKey = 'bob:tenant:company'
  await flushPromises()
  request.reject(new Error('旧请求失败'))
  await operation
  await bridge.controller.retry!()
  expect(store.mutate).toHaveBeenCalledOnce()
  expect(store.refresh).toHaveBeenCalledOnce()
  expect(bridge.controller.pendingIds.value).toEqual([])
})

test('进行中的命令不会让另一个未执行命令伪装成功', async () => {
  const { bridge } = setup()
  const request = deferred<void>()
  store.mutate.mockImplementationOnce(() => request.promise)
  const first = bridge.controller.markAsRead(['first'])
  await expect(bridge.controller.deleteMessages(['second'])).rejects.toThrow(
    '消息操作正在进行'
  )
  expect(store.mutate).toHaveBeenCalledOnce()
  request.resolve()
  await first
})
