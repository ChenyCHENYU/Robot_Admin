/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\components\notification-inbox-query.component.ts
 * @Description: 收件分类查询迟到与组织切换隔离测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import type { NotificationQuery } from '@/api/notifications.contract'
import { useMessageInbox } from '@/views/account/messages/composables/useMessageInbox'
import { deferred } from './d_deferred'

let store: {
  scopeKey: string
  query: NotificationQuery
  search: (query: Partial<NotificationQuery>) => Promise<void>
}
vi.mock('@/stores/notification', () => ({ s_notificationStore: () => store }))

test('旧分类、旧公司请求不能改写新收件筛选', async () => {
  const first = deferred<void>()
  const second = deferred<void>()
  const staleScope = deferred<void>()
  const search = vi
    .fn()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)
    .mockReturnValueOnce(staleScope.promise)
  store = reactive({
    scopeKey: 'company-a',
    query: { status: 'all', keyword: '', page: 1, pageSize: 20 },
    search,
  })
  let inbox!: ReturnType<typeof useMessageInbox>
  const child = defineComponent({
    /** 在真实消息和弹层 Provider 下运行收件箱。 */
    setup() {
      inbox = useMessageInbox(() => undefined)
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      /** 模拟页面所需的两个展示上下文。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(child))
        ),
    })
  )
  try {
    const old = inbox.changeView({ category: 'system', keyword: '旧分类' })
    const latest = inbox.changeView({ topic: 'workflow', keyword: '新分类' })
    second.resolve()
    expect(await latest).toBe(true)
    first.resolve()
    expect(await old).toBe(false)
    expect(inbox.list.filters.keyword).toBe('新分类')

    const pending = inbox.changeView({ keyword: '旧公司' })
    store.scopeKey = 'company-b'
    await nextTick()
    staleScope.resolve()
    expect(await pending).toBe(false)
    expect(inbox.list.filters.keyword).not.toBe('旧公司')
  } finally {
    wrapper.unmount()
  }
})
