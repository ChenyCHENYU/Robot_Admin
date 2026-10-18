/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 顶部消息预览的分类、独立状态、生命周期和真实弹层交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useNotificationBell } from '@/components/global/C_NotificationBell/data'
import NotificationBell from '@/components/global/C_NotificationBell/index.vue'
import type {
  NotificationQuery,
  NotificationRecord,
} from '@/api/notifications.contract'

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
        content: '',
        contentType: 'text',
        kind: 'notification',
        topic: 'general',
        category: 'system',
        priority: 'normal',
        readAt: null,
        archivedAt: null,
        createdAt: '2026-10-18T00:00:00Z',
        source: '测试',
        taskStatus: null,
        starred: false,
        revision: 12,
        updatedAt: '2026-10-18T00:00:00Z',
      },
    ] as NotificationRecord[],
    stats: {
      total: 100,
      unread: 78,
      todo: 16,
      byTopic: { general: 64, workflow: 36 },
      byCategory: { system: 78, business: 0, alarm: 0 },
    },
    query: { keyword: '完整页查询', status: 'unread' },
    previewQuery: {
      status: 'all',
      keyword: '',
      page: 1,
      pageSize: 20,
    } as NotificationQuery,
    previewLoading: false,
    previewError: '',
    acquire: vi.fn(() => release),
    refresh: vi.fn(async () => undefined),
    refreshPreview: vi.fn(async () => undefined),
    setPreviewQuery: vi.fn(async (patch: Partial<NotificationQuery>) => {
      Object.assign(store.previewQuery, patch)
    }),
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
      { path: '/', component: {} },
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

test('一条预览仍使用权威78未读，筛选不改完整页查询，卸载只释放自己的生命周期引用', async () => {
  const { bridge, wrapper, router } = setup()
  expect(bridge.store.stats.unread).toBe(78)
  expect(bridge.previewRows.value).toHaveLength(1)
  bridge.selectTopic('workflow')
  await flushPromises()
  expect(bridge.activeTopic.value).toBe('workflow')
  expect(store.query.keyword).toBe('完整页查询')
  await bridge.openInbox('one')
  await flushPromises()
  expect(router.currentRoute.value.query.message).toBe('one')
  expect(store.mutate).not.toHaveBeenCalled()
  wrapper.unmount()
  expect(release).toHaveBeenCalledOnce()
})

test('切换账户关闭预览，不创建额外连接、轮询或重新获取生命周期', async () => {
  const { bridge } = setup()
  bridge.updatePreviewVisibility(true)
  expect(bridge.popoverVisible.value).toBe(true)
  store.scopeKey = 'bob:tenant:company'
  await flushPromises()
  expect(bridge.popoverVisible.value).toBe(false)
  expect(store.acquire).toHaveBeenCalledOnce()
  expect(store.refreshPreview).toHaveBeenCalledOnce()
  expect(store.refresh).not.toHaveBeenCalled()
})

test('预览刷新与筛选失败由Store呈现，不污染页面错误或制造未处理拒绝', async () => {
  const { bridge } = setup()
  store.refreshPreview.mockRejectedValueOnce(new Error('预览失败'))
  store.setPreviewQuery.mockRejectedValueOnce(new Error('筛选失败'))
  bridge.refreshPreview()
  bridge.selectStatus('todo')
  await flushPromises()
  expect(store.error).toBe('')
  expect(store.query).toEqual({ keyword: '完整页查询', status: 'unread' })
  expect(store.mutate).not.toHaveBeenCalled()
})

test('查看全部显式传递all状态，避免继承主页面此前的已读或待办筛选', async () => {
  const { bridge, router } = setup()
  await bridge.openInbox()
  expect(router.currentRoute.value.query).toEqual({ status: 'all' })
})

/** 挂载真实 Naive 弹层，验证用户可见分类和独立状态而非只检查桥接数据。 */
const setupPanel = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: {} },
      { path: '/account/messages', name: 'account-messages', component: {} },
    ],
  })
  const wrapper = mount(NotificationBell, {
    attachTo: document.body,
    global: { plugins: [router] },
  })
  await wrapper.get('button[aria-haspopup="dialog"]').trigger('click')
  await flushPromises()
  const panel = document.querySelector<HTMLElement>(
    '[data-testid="notification-preview"]'
  )!
  return { wrapper, panel, router }
}

/** 按可访问文案触发真实弹层按钮。 */
const clickPanelButton = async (panel: HTMLElement, label: string) => {
  const button = [...panel.querySelectorAll('button')].find(
    element => element.textContent?.trim() === label
  )
  expect(button, `找不到按钮：${label}`).toBeDefined()
  button!.click()
  await flushPromises()
}

test('真实顶部预览展示通用与审批分类、权威未读和待办，以及序号和相互独立的状态', async () => {
  store.previewItems.push({
    ...store.previewItems[0]!,
    id: 'workflow-one',
    title: '出差申请等待审批',
    kind: 'task',
    topic: 'workflow',
    taskStatus: 'pending',
    readAt: '2026-10-18T00:02:00Z',
    workflow: {
      instanceId: 'wf-1',
      processName: '出差审批',
      businessNo: 'TRAVEL-001',
      initiator: '陈宇',
      currentNode: '部门审批',
      relationship: 'assignee',
      status: 'pending',
      history: [],
    },
  })
  const { wrapper, panel } = await setupPanel()
  expect(panel.textContent).toContain('通用消息')
  expect(panel.textContent).toContain('审批流程')
  expect(panel.textContent).not.toContain('系统通知')
  expect(
    panel.querySelector('.notification-preview__metrics')?.textContent
  ).toContain('78')
  expect(
    panel.querySelector('.notification-preview__metrics')?.textContent
  ).toContain('16')
  expect(
    [...panel.querySelectorAll('.notification-preview__number')].map(
      item => item.textContent
    )
  ).toEqual(['01', '02'])
  const workflowRow = panel.querySelectorAll('.notification-preview__item')[1]!
  expect(workflowRow.textContent).toContain('已读')
  expect(workflowRow.textContent).toContain('待办')
  expect(workflowRow.textContent).toContain('审批中')
  expect(workflowRow.textContent).toContain('由我审批')
  expect(store.refreshPreview).toHaveBeenCalledOnce()
  expect(store.mutate).not.toHaveBeenCalled()
  wrapper.unmount()
  expect(release).toHaveBeenCalledOnce()
})

test('顶部组合筛选独立于页面查询，查看全部和详情保留完整筛选', async () => {
  const { panel, router } = await setupPanel()
  const topic = panel.querySelector(
    'nav button:last-child'
  ) as HTMLButtonElement
  topic.click()
  await flushPromises()
  await clickPanelButton(panel, '待办')
  expect(store.setPreviewQuery.mock.calls).toEqual([
    [{ topic: 'workflow' }],
    [{ status: 'todo' }],
  ])
  expect(store.query).toEqual({ keyword: '完整页查询', status: 'unread' })
  await clickPanelButton(panel, '查看筛选下全部')
  expect(router.currentRoute.value.query).toEqual({
    topic: 'workflow',
    status: 'todo',
  })
})

test('预览最多20条，缺少服务端分类统计时不以局部列表伪造数量，明确最近预览边界', async () => {
  store.stats.byTopic = undefined as unknown as typeof store.stats.byTopic
  store.previewItems = Array.from({ length: 23 }, (_, index) => ({
    ...store.previewItems[0]!,
    id: `preview-${index}`,
  }))
  const { panel } = await setupPanel()
  expect(panel.querySelectorAll('.notification-preview__item')).toHaveLength(20)
  expect(
    panel.querySelectorAll('.notification-preview__topic-count')
  ).toHaveLength(0)
  expect(panel.textContent).toContain('最近消息预览')
  expect(panel.textContent).toContain('最多展示最近 20 条')
  expect(
    panel.querySelector('.notification-preview__metrics')?.textContent
  ).toContain('78')
})

test('预览错误可重试，Escape与外部点击关闭弹层，进入详情不提前标为已读', async () => {
  store.previewError = '网络连接失败'
  const { wrapper, panel, router } = await setupPanel()
  expect(document.activeElement).toBe(panel)
  expect(panel.textContent).toContain('网络连接失败')
  await clickPanelButton(panel, '重试')
  expect(store.refreshPreview).toHaveBeenCalledTimes(2)
  panel.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  )
  await flushPromises()
  expect(
    wrapper.get('button[aria-haspopup="dialog"]').attributes('aria-expanded')
  ).toBe('false')
  expect(document.activeElement).toBe(
    wrapper.get('button[aria-haspopup="dialog"]').element
  )
  await wrapper.get('button[aria-haspopup="dialog"]').trigger('click')
  await flushPromises()
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await flushPromises()
  expect(
    wrapper.get('button[aria-haspopup="dialog"]').attributes('aria-expanded')
  ).toBe('false')
  await wrapper.get('button[aria-haspopup="dialog"]').trigger('click')
  await flushPromises()
  ;(
    document.querySelector('.notification-preview__item') as HTMLButtonElement
  ).click()
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({
    message: 'one',
    status: 'all',
  })
  expect(store.mutate).not.toHaveBeenCalled()
})

test('窗口尺寸或页面滚动变化关闭预览，内部列表滚动仍可继续浏览', async () => {
  const { wrapper, panel } = await setupPanel()
  const trigger = wrapper.get('button[aria-haspopup="dialog"]')
  panel
    .querySelector('.notification-preview__list')!
    .dispatchEvent(new Event('scroll'))
  await flushPromises()
  expect(trigger.attributes('aria-expanded')).toBe('true')
  window.dispatchEvent(new Event('resize'))
  await flushPromises()
  expect(trigger.attributes('aria-expanded')).toBe('false')
  await trigger.trigger('click')
  await flushPromises()
  window.dispatchEvent(new Event('scroll'))
  await flushPromises()
  expect(trigger.attributes('aria-expanded')).toBe('false')
})
