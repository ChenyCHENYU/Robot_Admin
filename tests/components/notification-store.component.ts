/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\components\notification-store.component.ts
 * @Description: 消息共享状态的身份切换、旧响应丢弃、订阅与真实演示适配回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, disposePinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick, reactive } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { s_notificationStore } from '@/stores/notification'
import { createNotificationDemoService } from '@/api/notifications.demo'
import {
  defaultNotificationQuery,
  type NotificationScope,
  type NotificationService,
  type NotificationSnapshot,
  type NotificationDispatchDraft,
  type NotificationGovernance,
  type NotificationPreferences,
  type NotificationRecord,
} from '@/api/notifications.contract'
import { createNotificationService } from '@/api/notifications'
import {
  createNotificationRemoteService,
  type NotificationTransport,
} from '@/api/notifications.remote'
import { deferred } from './d_deferred'

interface Session {
  token: string
  userInfo: { id: string }
  activeContext: { tenantId: string; companyId: string } | null
}
const state = vi.hoisted(() => ({
  session: undefined as unknown as Session,
  factory: undefined as unknown as (
    scope: NotificationScope
  ) => NotificationService,
}))
vi.mock('@/stores/user', () => ({ s_userStore: () => state.session }))
vi.mock('@/config/dataMode', () => ({ isMockDataMode: () => true }))
vi.mock('@/api/notifications', () => ({
  createNotificationService: vi.fn((scope: NotificationScope) =>
    state.factory(scope)
  ),
}))

let pinia: Pinia
beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  state.session = reactive({
    token: 'verified-session-a',
    userInfo: { id: 'account-a' },
    activeContext: { tenantId: 'tenant-a', companyId: 'company-a' },
  })
  state.factory = scope => createNotificationDemoService(scope, { delay: 0 })
})
afterEach(() => {
  disposePinia(pinia)
})

test('重复初始化与布局持有共享同一服务，过滤列表不会污染铃铛预览', async () => {
  const store = s_notificationStore()
  await Promise.all([
    store.initialize(),
    store.initialize(),
    store.initialize(),
  ])
  expect(createNotificationService).toHaveBeenCalledTimes(1)
  const releaseA = store.acquire()
  const releaseB = store.acquire()
  await flushPromises()
  expect(createNotificationService).toHaveBeenCalledTimes(1)
  const originalPreview = store.previewItems.map(item => item.id)
  await store.search({ keyword: '安全登录' })
  expect(store.items).toHaveLength(1)
  expect(store.stats.total).toBe(11)
  expect(store.previewItems.map(item => item.id)).toEqual(originalPreview)
  releaseA()
  releaseA()
  releaseB()
})

test('旧公司慢响应在切换后不能回写，退出立即清理所有收件和治理状态', async () => {
  const oldResult = deferred<NotificationSnapshot>()
  const oldSource = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  const oldSnapshot = await oldSource.query(defaultNotificationQuery())
  state.factory = scope =>
    scope.companyId === 'company-a'
      ? { ...oldSource, query: () => oldResult.promise }
      : createNotificationDemoService(scope, { delay: 0 })
  const store = s_notificationStore()
  const pending = store.initialize().catch(error => error)
  expect(store.loading).toBe(true)
  state.session.activeContext = { tenantId: 'tenant-a', companyId: 'company-b' }
  await nextTick()
  await store.initialize()
  expect(store.scopeKey).toContain('company-b')
  await store.clearMessages()
  expect(store.items).toEqual([])
  oldResult.resolve(oldSnapshot)
  expect((await pending).name).toBe('AbortError')
  expect(store.items).toEqual([])
  expect(store.stats.total).toBe(0)
  state.session.token = ''
  await nextTick()
  expect(store.scopeKey).toBe('')
  expect(store.previewItems).toEqual([])
  expect(store.templates).toEqual([])
  expect(store.connected).toBe(false)
})

test('有凭据但没有已验证用户或公司时拒绝猜测身份，不播种公共演示收件箱', async () => {
  state.session.userInfo.id = ''
  const store = s_notificationStore()
  await store.initialize()
  expect(createNotificationService).not.toHaveBeenCalled()
  expect(store.stats.total).toBe(0)
  await expect(store.refresh()).rejects.toThrow('有效消息会话')
})

test('失败操作保留状态并可重试，办结与已读分别流转，删除末页回到有效页', async () => {
  const store = s_notificationStore()
  await store.initialize()
  const task = store.items.find(item => item.taskStatus === 'pending')!
  store.simulateFailure()
  await expect(store.mutate('read', [task.id])).rejects.toThrow('模拟操作失败')
  expect(store.items.find(item => item.id === task.id)!.readAt).toBeNull()
  await store.mutate('read', [task.id])
  expect(store.items.find(item => item.id === task.id)!.taskStatus).toBe(
    'pending'
  )
  await store.mutate('complete-task', [task.id])
  expect(store.items.find(item => item.id === task.id)!.taskStatus).toBe('done')
  await store.changePage(2, 10)
  const lastPage = store.items.map(item => item.id)
  await store.mutate('delete', lastPage)
  expect(store.query.page).toBe(1)
  expect(store.items).toHaveLength(10)
})

test('显式离线不会假成功，恢复连接补取最新权威快照', async () => {
  const store = s_notificationStore()
  await store.initialize()
  const { id } = store.items[0]
  store.setOnline(false)
  await expect(store.mutate('archive', [id])).rejects.toThrow('离线')
  expect(store.items.some(item => item.id === id)).toBe(true)
  store.setOnline(true)
  await store.refresh()
  expect(store.connected).toBe(true)
  expect(store.error).toBe('')
  await store.mutate('archive', [id])
  expect(store.items.some(item => item.id === id)).toBe(false)
})

test('过期详情返回必须拒绝，不能覆盖新打开消息', async () => {
  const first =
    deferred<
      ReturnType<NotificationService['detail']> extends Promise<infer T>
        ? T
        : never
    >()
  const source = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  state.factory = () => ({
    ...source,
    detail: id => (id === 'first' ? first.promise : source.detail(id)),
  })
  const store = s_notificationStore()
  await store.initialize()
  const pending = store.loadDetail('first').catch(error => error)
  const newest = await store.loadDetail(store.items[0].id)
  first.resolve(newest)
  expect((await pending).name).toBe('AbortError')
  expect(store.detailLoading).toBe(false)
})

test('损坏远端响应保留上次可信快照并展示错误，恢复服务后才替换状态', async () => {
  const source = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  const valid = await source.query(defaultNotificationQuery())
  let response: unknown = valid
  const transport: NotificationTransport = {
    get: async <T>() => ({ code: 0, data: response as T, msg: 'ok' }),
    post: async () => {
      throw new Error('未调用')
    },
    put: async () => {
      throw new Error('未调用')
    },
    delete: async () => {
      throw new Error('未调用')
    },
  }
  state.factory = scope => createNotificationRemoteService(scope, transport)
  const store = s_notificationStore()
  await store.initialize()
  const before = store.items.map(item => item.id)
  response = { ...valid, stats: { ...valid.stats, byCategory: undefined } }
  await expect(store.refresh()).rejects.toThrow('不符合约定')
  expect(store.items.map(item => item.id)).toEqual(before)
  expect(store.stats.unread).toBe(valid.stats.unread)
  expect(store.error).toContain('不符合约定')
  expect(store.connected).toBe(false)
  response = valid
  await store.refresh()
  expect(store.error).toBe('')
  expect(store.mode).toBe('remote')
})

test('明确重置取消此前挂起的单条消息命令，新演示场景不受旧操作污染', async () => {
  const gate = deferred<void>()
  const source = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  state.factory = () => ({
    ...source,
    mutate: async (command, signal) => {
      await gate.promise
      return source.mutate(command, signal)
    },
  })
  const store = s_notificationStore()
  await store.initialize()
  const { id } = store.items.find(item => !item.readAt)!
  const pending = store.mutate('read', [id]).catch(error => error)
  await store.resetDemo()
  gate.resolve()
  expect((await pending).name).toBe('AbortError')
  await store.refresh()
  expect(store.stats.unread).toBe(6)
  expect(store.items.find(item => item.id === id)!.readAt).toBeNull()
})

test('新筛选失败不会把旧列表包装成新页签，查询和结果原子提交', async () => {
  const store = s_notificationStore()
  await store.initialize()
  const ids = store.items.map(item => item.id)
  store.simulateFailure('query')
  await expect(store.search({ status: 'todo' })).rejects.toThrow('模拟加载失败')
  expect(store.query.status).toBe('all')
  expect(store.items.map(item => item.id)).toEqual(ids)
  await store.search({ status: 'todo' })
  expect(store.query.status).toBe('todo')
  expect(store.items.every(item => item.taskStatus === 'pending')).toBe(true)
})

const createDispatchInput = (): NotificationDispatchDraft => ({
  title: '确认写入与同步分离',
  content: '测试消息正文',
  category: 'business',
  priority: 'normal',
  channels: ['inbox'],
  audience: 'self',
  scheduledAt: null,
})
test('草稿保存已确认但刷新失败仍返回实体，提示刷新而不要求重放写入', async () => {
  const backend = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  state.factory = () => backend
  const store = s_notificationStore()
  await store.initialize()
  store.simulateFailure('query')
  const saved = await store.saveDispatch(createDispatchInput())
  expect(saved.id).toBeTruthy()
  expect(store.error).toContain('操作已完成')
  expect((await backend.governance()).dispatches).toHaveLength(1)
  await store.refresh()
  await store.refreshGovernance()
  expect(store.dispatches).toHaveLength(1)
  expect(store.dispatches[0].id).toBe(saved.id)
})

test('HTTP服务已提交但ACK丢失，重试复用逻辑命令幂等键并返回原草稿', async () => {
  const identity = {
    userId: 'account-a',
    tenantId: 'tenant-a',
    companyId: 'company-a',
  }
  const backend = createNotificationDemoService(identity, { delay: 0 })
  const operationIds: string[] = []
  let dropAck = true
  const transport: NotificationTransport = {
    get: async <T>(url: string) => ({
      code: 0,
      data: (url.endsWith('/management')
        ? await backend.governance()
        : {
            ...(await backend.query(defaultNotificationQuery())),
            capabilities: { manage: true, preferences: true, realtime: false },
          }) as T,
      msg: 'ok',
    }),
    put: async <T>(_url: string, data: unknown) => {
      const input = data as NotificationDispatchDraft
      operationIds.push(input.operationId!)
      const result = await backend.saveDispatch(input)
      if (dropAck) {
        dropAck = false
        throw new Error('连接中断，ACK丢失')
      }
      return { code: 0, data: result as T, msg: 'ok' }
    },
    post: async () => {
      throw new Error('未调用')
    },
    delete: async () => {
      throw new Error('未调用')
    },
  }
  state.factory = scope => createNotificationRemoteService(scope, transport)
  const store = s_notificationStore()
  await store.initialize()
  const draft = createDispatchInput()
  await expect(store.saveDispatch(draft)).rejects.toThrow('ACK丢失')
  const retried = await store.saveDispatch(draft)
  expect(operationIds[0]).toBe(operationIds[1])
  expect((await backend.governance()).dispatches).toHaveLength(1)
  expect(store.dispatches[0].id).toBe(retried.id)
  await store.saveDispatch({ ...draft, title: '用户明确编辑后的新意图' })
  expect(operationIds[2]).not.toBe(operationIds[1])
  expect((await backend.governance()).dispatches).toHaveLength(2)
})

test('旧详情与旧治理请求迟到失败不会污染新请求的全局错误', async () => {
  const oldDetail = deferred<NotificationRecord>()
  const oldGovernance = deferred<NotificationGovernance>()
  const backend = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  let governanceCalls = 0
  state.factory = () => ({
    ...backend,
    detail: id =>
      id === 'old-detail' ? oldDetail.promise : backend.detail(id),
    governance: () =>
      ++governanceCalls === 1 ? oldGovernance.promise : backend.governance(),
  })
  const store = s_notificationStore()
  await store.initialize()
  const detail = store.loadDetail('old-detail').catch(error => error)
  await store.loadDetail(store.items[0].id)
  oldDetail.reject(new Error('旧详情网络失败'))
  await detail
  expect(store.error).toBe('')
  const governance = store.refreshGovernance().catch(error => error)
  await store.refreshGovernance()
  oldGovernance.reject(new Error('旧治理网络失败'))
  await governance
  expect(store.error).toBe('')
  expect(store.templates).toHaveLength(2)
})

test('保存偏好后的新读取胜过旧慢响应，能力撤销也会失效在途治理数据', async () => {
  const oldPreferences = deferred<NotificationPreferences>()
  const oldGovernance = deferred<NotificationGovernance>()
  const backend = createNotificationDemoService(
    { userId: 'account-a', tenantId: 'tenant-a', companyId: 'company-a' },
    { delay: 0 }
  )
  const previousPreferences = await backend.getPreferences()
  const previousGovernance = await backend.governance()
  let preferenceCalls = 0
  let holdGovernance = false
  const service: NotificationService = {
    ...backend,
    getPreferences: () =>
      ++preferenceCalls === 1
        ? oldPreferences.promise
        : backend.getPreferences(),
    governance: () =>
      holdGovernance ? oldGovernance.promise : backend.governance(),
  }
  state.factory = () => service
  const store = s_notificationStore()
  await store.initialize()
  const pendingPreferences = store.getPreferences().catch(error => error)
  const nextPreferences = structuredClone(previousPreferences)
  nextPreferences.channels.email = false
  await store.savePreferences(nextPreferences)
  oldPreferences.resolve(previousPreferences)
  expect((await pendingPreferences).name).toBe('AbortError')
  expect(store.preferences.channels.email).toBe(false)
  holdGovernance = true
  const pendingGovernance = store.refreshGovernance()
  service.capabilities.manage = false
  service.capabilities.preferences = false
  await store.refresh()
  expect(store.templates).toEqual([])
  oldGovernance.resolve(previousGovernance)
  await pendingGovernance
  expect(store.templates).toEqual([])
  expect(store.capabilities.manage).toBe(false)
})
