/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 实际消息工作台页签文案与治理切换回归，防止空 Pane 覆盖标签
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import MessagesPage from '@/views/account/messages/index.vue'
import { parseMessageRouteQuery } from '@/views/account/messages/composables/useMessageRoute'
import { getMessageRowNumber } from '@/views/account/messages/composables/useMessageColumns'

const state = vi.hoisted(() => ({ store: {} as Record<string, unknown> }))
vi.mock('@/stores/notification', () => ({
  s_notificationStore: () => state.store,
}))
vi.mock('@/stores/permission', () => ({
  s_permissionStore: () => ({ hasRoutePermission: () => true }),
}))

let wrapper: ReturnType<typeof mount> | undefined
const TableStub = defineComponent({
  name: 'MessageTableStub',
  /** 保留真实表格公开的清空选择协议。 */
  setup(_props, { expose }) {
    expose({ clearSelection: vi.fn() })
    return () => h('div')
  },
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

test('顶部筛选链接只接收登记的单值枚举，跨页序号连续', () => {
  expect(
    parseMessageRouteQuery({
      topic: 'workflow',
      status: 'todo',
      relationship: 'assignee',
    })
  ).toMatchObject({
    topic: 'workflow',
    status: 'todo',
    relationship: 'assignee',
  })
  expect(
    parseMessageRouteQuery({
      topic: ['workflow', 'general'],
      status: 'unknown',
      relationship: 'admin',
    })
  ).toBeNull()
  expect(getMessageRowNumber({ page: 2, pageSize: 10 }, 0)).toBe(11)
  expect(getMessageRowNumber({ page: 3, pageSize: 20 }, 4)).toBe(45)
})

test('实际页面呈现四个治理入口与七个独立收件状态，点击发送入口切换治理内容', async () => {
  state.store = reactive({
    mode: 'demo',
    scopeKey: 'mock:tenant:company',
    connected: true,
    loading: false,
    error: '',
    capabilities: { manage: true, preferences: true, realtime: true },
    query: { status: 'all', keyword: '', page: 1, pageSize: 10 },
    items: [],
    previewItems: [],
    total: 0,
    revision: 1,
    stats: {
      total: 0,
      unread: 0,
      todo: 0,
      done: 0,
      read: 0,
      archived: 0,
      starred: 0,
      byCategory: { system: 0, business: 0, alarm: 0 },
    },
    acquire: vi.fn(() => vi.fn()),
    initialize: vi.fn(async () => undefined),
    refresh: vi.fn(async () => undefined),
    refreshGovernance: vi.fn(async () => undefined),
    search: vi.fn(async (patch: Record<string, unknown>) => {
      Object.assign(state.store.query as object, patch)
    }),
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/messages', name: 'account-messages', component: {} },
    ],
  })
  await router.push('/account/messages')
  const GovernanceStub = defineComponent({
    name: 'MessageGovernance',
    props: { section: String },
    /** 仅替换治理正文，保留真实页面、控制器和 Naive 页签。 */
    setup(props) {
      return () =>
        h('div', { 'data-testid': 'governance-section' }, props.section)
    },
  })
  wrapper = mount(
    defineComponent({
      name: 'MessageWorkspaceHarness',
      /** 提供与应用一致的消息和对话框上下文。 */
      setup() {
        return () =>
          h(
            NMessageProvider,
            {},
            {
              default: () =>
                h(NDialogProvider, {}, { default: () => h(MessagesPage) }),
            }
          )
      },
    }),
    {
      attachTo: document.body,
      global: {
        plugins: [router],
        stubs: {
          MessageGovernance: GovernanceStub,
          NotificationPreferences: true,
          MessageDetail: true,
          C_Table: TableStub,
          C_ActionBar: true,
        },
      },
    }
  )
  await flushPromises()
  const topTabs = wrapper.findAll('.message-sections .n-tabs-tab[data-name]')
  expect(topTabs.map(tab => tab.text())).toEqual([
    '收件箱',
    '发送与记录',
    '消息模板',
    '通知偏好',
  ])
  expect(topTabs.every(tab => tab.isVisible())).toBe(true)
  const statusTabs = wrapper.findAll(
    '.inbox-status-tabs .n-tabs-tab[data-name]'
  )
  expect(statusTabs.map(tab => tab.text())).toEqual([
    '全部',
    '未读',
    '已读',
    '待办',
    '已办',
    '星标',
    '归档',
  ])
  expect(statusTabs.every(tab => tab.isVisible())).toBe(true)
  const sidebar = wrapper.get('[aria-label="收件箱导航"]')
  expect(sidebar.text()).toContain('通用消息')
  expect(sidebar.text()).toContain('审批流程')
  expect(sidebar.text()).toContain('我已审批')
  await sidebar
    .findAll('button')
    .find(item => item.text() === '抄送给我')!
    .trigger('click')
  await flushPromises()
  expect(state.store.search).toHaveBeenCalledWith(
    expect.objectContaining({
      topic: 'workflow',
      relationship: 'cc',
      status: 'all',
      page: 1,
    })
  )
  expect(wrapper.get('.inbox-title h2').text()).toBe('抄送给我')
  expect(router.currentRoute.value.query).toMatchObject({
    topic: 'workflow',
    relationship: 'cc',
    status: 'all',
  })
  await topTabs[1]!.trigger('click')
  await flushPromises()
  expect(wrapper.get('[data-testid="governance-section"]').text()).toBe(
    'sending'
  )
  expect(wrapper.find('.message-inbox').exists()).toBe(false)
})
