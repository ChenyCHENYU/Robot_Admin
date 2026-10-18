/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息详情迟到响应、重复命令和认证附件下载的实际挂载回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import type { NotificationRecord } from '@/api/notifications.contract'
import { useMessageDetail } from '@/views/account/messages/components/c_messageDetail/useMessageDetail'
import { deferred } from './d_deferred'

const state = vi.hoisted(() => ({
  store: {} as Record<string, unknown>,
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  download: vi.fn(),
}))
vi.mock('@/stores/notification', () => ({
  s_notificationStore: () => state.store,
}))
vi.mock('@/api/notifications.attachments', () => ({
  downloadNotificationAttachment: state.download,
}))
vi.mock('naive-ui', async importOriginal => ({
  ...(await importOriginal<typeof import('naive-ui')>()),
  useMessage: () => ({
    success: state.success,
    error: state.error,
    warning: state.warning,
  }),
  useDialog: () => ({ warning: vi.fn() }),
}))

/** 构造已读记录，避免测试自身引入无关自动已读请求。 */
const record = (id: string): NotificationRecord => ({
  id,
  title: id,
  summary: '',
  content: '正文',
  contentType: 'text',
  kind: 'notification',
  category: 'system',
  source: '测试',
  priority: 'normal',
  createdAt: '2026-10-18T00:00:00Z',
  updatedAt: '2026-10-18T00:00:00Z',
  readAt: '2026-10-18T00:00:00Z',
  archivedAt: null,
  starred: false,
  taskStatus: null,
  revision: 1,
  receivedRevision: 1,
})

const makeStore = () =>
  reactive({
    scopeKey: 'alice:tenant:company',
    mode: 'demo',
    loadDetail: vi.fn(async (id: string) => record(id)),
    mutate: vi.fn(async (): Promise<void> => undefined),
  })
let store: ReturnType<typeof makeStore>
const wrappers: ReturnType<typeof mount>[] = []
beforeEach(() => {
  store = makeStore()
  state.store = store
  state.success.mockClear()
  state.error.mockClear()
  state.download.mockReset()
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
})

/** 用真实 Vue 生命周期挂载控制器，验证 watch 与异步代次交互。 */
const setup = (id = 'first') => {
  let view!: ReturnType<typeof useMessageDetail>
  const Harness = defineComponent({
    name: 'MessageDetailHarness',
    props: { id: { type: String, required: true } },
    /** 挂载真实控制器并呈现当前详情。 */
    setup(props) {
      view = useMessageDetail(props)
      return () => h('div', view.detail.value?.title)
    },
  })
  const wrapper = mount(Harness, { props: { id } })
  wrappers.push(wrapper)
  return { view, wrapper }
}

test('先打开的慢详情不能覆盖后来打开的消息', async () => {
  const first = deferred<NotificationRecord>()
  store.loadDetail.mockImplementation(id =>
    id === 'first' ? first.promise : Promise.resolve(record(id))
  )
  const { view, wrapper } = setup()
  await wrapper.setProps({ id: 'second' })
  await flushPromises()
  expect(view.detail.value?.id).toBe('second')
  first.resolve(record('first'))
  await flushPromises()
  expect(view.detail.value?.id).toBe('second')
  expect(wrapper.text()).toBe('second')
})

test('详情状态命令在请求未完成时阻止二次提交', async () => {
  const pending = deferred<void>()
  store.mutate.mockImplementation(() => pending.promise)
  const { view } = setup()
  await flushPromises()
  const first = view.change('star')
  await view.change('star')
  expect(store.mutate).toHaveBeenCalledTimes(1)
  expect(view.busy.value).toBe(true)
  pending.resolve()
  await first
  expect(view.busy.value).toBe(false)
  expect(state.success).toHaveBeenCalledTimes(1)
})

test('接口附件忽略消息自带URL，身份切换取消下载并不触发旧身份浏览器下载', async () => {
  store.mode = 'remote'
  const pending = deferred<Blob>()
  state.download.mockReturnValue(pending.promise)
  const createUrl = vi
    .spyOn(URL, 'createObjectURL')
    .mockReturnValue('blob:test')
  const { view } = setup()
  await flushPromises()
  const download = view.downloadAttachment({
    id: 'file-a',
    name: '说明.txt',
    url: 'javascript:alert(1)',
  })
  expect(state.download).toHaveBeenCalledWith(
    'first',
    'file-a',
    expect.any(AbortSignal)
  )
  const signal = state.download.mock.calls[0]![2] as AbortSignal
  store.scopeKey = 'bob:tenant:company'
  await flushPromises()
  expect(signal.aborted).toBe(true)
  pending.resolve(new Blob(['附件']))
  await download
  expect(createUrl).not.toHaveBeenCalled()
  expect(state.error).not.toHaveBeenCalled()
  createUrl.mockRestore()
})

test('消息变成已读不自动办理待办，阅读与完成命令保持独立', async () => {
  const task = {
    ...record('task'),
    kind: 'task' as const,
    readAt: null,
    taskStatus: 'pending' as const,
  }
  store.loadDetail
    .mockResolvedValueOnce(task)
    .mockResolvedValue({ ...task, readAt: '2026-10-18T01:00:00Z' })
  const { view } = setup('task')
  await flushPromises()
  expect(store.mutate).toHaveBeenCalledWith('read', ['task'])
  expect(store.mutate).toHaveBeenCalledTimes(1)
  expect(view.detail.value?.taskStatus).toBe('pending')
})

test('正文加载成功但已读写入失败时保留内容，局部重试可恢复阅读状态', async () => {
  store.loadDetail
    .mockResolvedValueOnce({ ...record('first'), readAt: null })
    .mockResolvedValue(record('first'))
  store.mutate.mockRejectedValueOnce(new Error('模拟离线'))
  const { view, wrapper } = setup()
  await flushPromises()
  expect(wrapper.text()).toBe('first')
  expect(view.detail.value?.content).toBe('正文')
  expect(view.error.value).toBe('')
  expect(view.readError.value).toBe('模拟离线')
  await view.retryRead()
  expect(view.readError.value).toBe('')
  expect(view.detail.value?.readAt).not.toBeNull()
  expect(store.mutate).toHaveBeenCalledTimes(2)
})
