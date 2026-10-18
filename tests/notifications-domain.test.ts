/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\notifications-domain.test.ts
 * @Description: 企业消息演示领域的权威统计、并发、持久化与治理闭环回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, spyOn, test } from 'bun:test'
import { createNotificationDemoService } from '../src/api/notifications.demo'
import {
  createNotificationRemoteService,
  type NotificationTransport,
} from '../src/api/notifications.remote'
import {
  defaultNotificationQuery,
  notificationScopeKey,
  type NotificationDispatchDraft,
  type NotificationScope,
} from '../src/api/notifications.contract'
import {
  notificationDemoStorageKey,
  type NotificationStorage,
} from '../src/api/notifications.demo.storage'
import { createNotificationDemoDocument } from '../src/api/notifications.demo.seed'
import { createNotificationId } from '../src/api/notifications.id'

const scope: NotificationScope = {
  userId: 'user-a',
  tenantId: 'tenant-a',
  companyId: 'company-a',
}
const clock = new Date('2026-10-18T10:00:00Z')
const createStorage = (): NotificationStorage => {
  const map = new Map<string, string>()
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: key => {
      map.delete(key)
    },
  }
}
const setup = (storage = createStorage(), identity = scope) =>
  createNotificationDemoService(identity, {
    storage,
    now: () => clock,
    delay: 0,
  })
const all = defaultNotificationQuery()
const draft = (): NotificationDispatchDraft => ({
  title: '企业消息闭环',
  content: '当前账户的明确模拟内容',
  category: 'business',
  priority: 'high',
  channels: ['inbox', 'email'],
  audience: 'company',
  scheduledAt: null,
})

test('分页列表和预览共用全量权威统计，搜索不缩小角标', async () => {
  const service = setup()
  const page = await service.query({ ...all, pageSize: 1 })
  expect(page.items).toHaveLength(1)
  expect(page.stats.total).toBe(21)
  expect(page.stats.unread).toBe(9)
  expect(page.previewItems).toHaveLength(20)
  const filtered = await service.query({ ...all, keyword: '安全登录' })
  expect(filtered.total).toBe(1)
  expect(filtered.stats).toEqual(page.stats)
  expect(filtered.previewItems).toEqual(page.previewItems)
  service.dispose()
})

test('已读不等于办结；同范围实例在最新快照上串行写入且重载不复活', async () => {
  const storage = createStorage()
  const a = setup(storage)
  const b = setup(storage)
  const item = (await a.query(all)).items.find(
    record => record.taskStatus === 'pending' && !record.workflow
  )!
  await Promise.all([
    a.mutate({ type: 'read', ids: [item.id], operationId: 'read-1' }),
    b.mutate({ type: 'star', ids: [item.id], operationId: 'star-1' }),
  ])
  const updated = await b.detail(item.id)
  expect(updated.readAt).toBeTruthy()
  expect(updated.starred).toBe(true)
  expect(updated.taskStatus).toBe('pending')
  await a.mutate({
    type: 'complete-task',
    ids: [item.id],
    operationId: 'complete-1',
  })
  expect((await setup(storage).detail(item.id)).taskStatus).toBe('done')
  await b.mutate({ type: 'delete', ids: [item.id], operationId: 'delete-1' })
  await expect(setup(storage).detail(item.id)).rejects.toThrow('不存在')
  a.dispose()
  b.dispose()
})

test('用户、租户、公司分别隔离，scope编码不会产生碰撞', async () => {
  const storage = createStorage()
  const a = setup(storage)
  await a.clearMessages({ throughRevision: 1, operationId: 'clear' })
  expect((await a.query(all)).stats.total).toBe(0)
  const isolated = await Promise.all(
    [
      { ...scope, userId: 'user-b' },
      { ...scope, tenantId: 'tenant-b' },
      { ...scope, companyId: 'company-b' },
    ].map(identity => setup(storage, identity).query(all))
  )
  expect(isolated.map(item => item.stats.total)).toEqual([21, 21, 21])
  expect(
    notificationScopeKey({ ...scope, userId: 'a:b', tenantId: 'c' })
  ).not.toBe(notificationScopeKey({ ...scope, userId: 'a', tenantId: 'b:c' }))
  expect((await setup(storage).query(all)).stats.total).toBe(0)
})

test('全部已读与清空保留截止后新消息和归档记录，幂等重试不会吞新消息', async () => {
  const service = setup()
  const initial = await service.query(all)
  await service.simulateIncoming!()
  await service.markAllRead({
    throughRevision: initial.revision,
    operationId: 'batch-read',
  })
  expect((await service.query(all)).stats.unread).toBe(1)
  await service.simulateIncoming!()
  await service.markAllRead({
    throughRevision: initial.revision,
    operationId: 'batch-read',
  })
  expect((await service.query(all)).stats.unread).toBe(2)
  await service.clearMessages({
    throughRevision: initial.revision,
    operationId: 'batch-clear',
  })
  const after = await service.query(all)
  expect(after.stats.total).toBe(2)
  expect(after.stats.archived).toBe(1)
})

test('可控失败不回滚任何后来成功操作，新消息和阅读状态都保留', async () => {
  const service = setup()
  const { id } = (await service.query(all)).items[0]
  service.simulateFailure!('mutation')
  await expect(
    service.mutate({ type: 'read', ids: [id], operationId: 'failure' })
  ).rejects.toThrow('模拟操作失败')
  await service.mutate({ type: 'read', ids: [id], operationId: 'retry' })
  await service.simulateIncoming!()
  expect((await service.detail(id)).readAt).toBeTruthy()
  expect((await service.query(all)).stats.total).toBe(22)
  service.setOnline!(false)
  await expect(
    service.mutate({ type: 'delete', ids: [id], operationId: 'offline' })
  ).rejects.toThrow('离线')
  service.setOnline!(true)
  expect((await service.detail(id)).readAt).toBeTruthy()
})

test('跨实例订阅、取消订阅和重置清晰，清空后刷新不会恢复种子', async () => {
  const storage = createStorage()
  const a = setup(storage)
  const b = setup(storage)
  let notifications = 0
  const stop = b.subscribe(() => {
    notifications++
  })
  await a.clearMessages({ throughRevision: 1, operationId: 'clear' })
  expect(notifications).toBe(1)
  expect((await b.query(all)).stats.total).toBe(0)
  expect((await setup(storage).query(all)).stats.total).toBe(0)
  stop()
  await a.resetDemo!()
  expect(notifications).toBe(1)
  expect((await b.query(all)).stats.total).toBe(21)
})

test('重置保留单调收件版本，重置前的旧批量命令不能清掉新场景数据', async () => {
  const service = setup()
  await service.simulateIncoming!()
  const { revision } = await service.query(all)
  await service.resetDemo!()
  expect((await service.query(all)).revision).toBeGreaterThan(revision)
  await service.clearMessages({
    throughRevision: revision,
    operationId: 'old-clear-after-reset',
  })
  expect((await service.query(all)).stats.total).toBe(21)
  await service.markAllRead({
    throughRevision: revision,
    operationId: 'old-read-after-reset',
  })
  expect((await service.query(all)).stats.unread).toBe(9)
})

test('模板编辑采用版本控制，发送快照不受调用后草稿修改影响', async () => {
  const service = setup()
  const { templates } = await service.governance()
  const template = await service.saveTemplate({
    ...templates[0],
    title: '修改后的标题',
  })
  await expect(
    service.saveTemplate({ ...templates[0], title: '过期覆盖' })
  ).rejects.toThrow('其他操作修改')
  const input = { ...draft(), templateId: template.id }
  const pending = service.saveDispatch(input)
  input.title = '不应渗入请求'
  const dispatch = await pending
  expect(dispatch.title).toBe('企业消息闭环')
  await expect(
    service.deleteTemplate(template.id, template.revision)
  ).rejects.toThrow('关联任务')
  await service.sendDispatch(dispatch.id, dispatch.revision, 'send-1')
  await service.sendDispatch(dispatch.id, dispatch.revision, 'send-1')
  expect(
    (await service.query(all)).previewItems.filter(
      item => item.dispatchId === dispatch.id
    )
  ).toHaveLength(1)
  expect((await service.governance()).deliveries).toHaveLength(2)
})

test('投递失败可重试，撤回移除站内副本并保留不可追回的外部投递审计', async () => {
  const service = setup()
  const dispatch = await service.saveDispatch(draft())
  service.simulateFailure!('delivery')
  await service.sendDispatch(dispatch.id, dispatch.revision, 'send')
  const governance = await service.governance()
  const failed = governance.deliveries.find(item => item.status === 'failed')!
  expect(failed.channel).toBe('inbox')
  expect((await service.query(all)).stats.total).toBe(21)
  await service.retryDelivery(failed.id)
  expect((await service.query(all)).stats.total).toBe(22)
  const sent = (await service.governance()).dispatches[0]
  await service.withdrawDispatch(sent.id, sent.revision)
  const withdrawn = await service.governance()
  expect((await service.query(all)).stats.total).toBe(21)
  expect(
    withdrawn.deliveries.find(item => item.channel === 'email')!.status
  ).toBe('delivered')
  expect(
    withdrawn.deliveries.find(item => item.channel === 'inbox')!.status
  ).toBe('withdrawn')
  expect(
    withdrawn.audit.some(item => item.action === 'withdraw-dispatch')
  ).toBe(true)
})

test('关闭通道与免打扰实际影响模拟投递，恢复偏好后可重试', async () => {
  const service = setup()
  const preferences = await service.getPreferences()
  preferences.channels.inbox = false
  preferences.quietHours = { enabled: true, start: '00:00', end: '23:59' }
  await service.savePreferences(preferences)
  const dispatch = await service.saveDispatch(draft())
  await service.sendDispatch(dispatch.id, dispatch.revision, 'send')
  const pending = (await service.governance()).deliveries
  expect(pending.every(item => item.status === 'pending')).toBe(true)
  await expect(service.retryDelivery(pending[0].id)).rejects.toThrow()
  preferences.channels.inbox = true
  preferences.quietHours.enabled = false
  await service.savePreferences(preferences)
  await Promise.all(pending.map(delivery => service.retryDelivery(delivery.id)))
  expect(
    (await service.governance()).deliveries.every(
      item => item.status === 'delivered'
    )
  ).toBe(true)
  expect((await service.query(all)).stats.total).toBe(22)
})

test('定时发送仅在页面运行推进，撤回定时任务不会投递', async () => {
  let now = new Date(clock)
  const service = createNotificationDemoService(scope, {
    storage: createStorage(),
    now: () => now,
    delay: 0,
  })
  const scheduledAt = new Date(clock.getTime() + 60_000).toISOString()
  const first = await service.saveDispatch({ ...draft(), scheduledAt })
  const second = await service.saveDispatch({ ...draft(), scheduledAt })
  await service.sendDispatch(first.id, first.revision, 'first')
  await service.sendDispatch(second.id, second.revision, 'second')
  const secondScheduled = (await service.governance()).dispatches.find(
    item => item.id === second.id
  )!
  await service.withdrawDispatch(second.id, secondScheduled.revision)
  expect((await service.query(all)).stats.total).toBe(21)
  now = new Date(clock.getTime() + 120_000)
  expect((await service.query(all)).stats.total).toBe(22)
  const state = await service.governance()
  expect(state.dispatches.find(item => item.id === first.id)!.status).toBe(
    'sent'
  )
  expect(state.dispatches.find(item => item.id === second.id)!.status).toBe(
    'withdrawn'
  )
})

test('损坏存储显示恢复要求而不悄悄播种，明确重置才能恢复', async () => {
  const storage = createStorage()
  storage.setItem(
    notificationDemoStorageKey(notificationScopeKey(scope)),
    '{invalid'
  )
  const service = setup(storage)
  await expect(service.query(all)).rejects.toThrow('重置演示')
  await service.resetDemo!()
  expect((await service.query(all)).stats.total).toBe(21)
})

test('远端服务缺失绝不回退演示；身份作用域不以body参数充当授权', async () => {
  const calls: Array<{ url: string; data?: unknown; config?: unknown }> = []
  const transport: NotificationTransport = {
    get: async (url, config) => {
      calls.push({ url, config })
      throw new Error('消息服务未部署')
    },
    post: async (url, data, config) => {
      calls.push({ url, data, config })
      return { code: 0, data: undefined as never, msg: 'ok' }
    },
    put: async () => {
      throw new Error('未调用')
    },
    delete: async () => {
      throw new Error('未调用')
    },
  }
  const remote = createNotificationRemoteService(scope, transport)
  await expect(remote.query(all)).rejects.toThrow('未部署')
  expect(remote.mode).toBe('remote')
  expect(remote.capabilities.manage).toBe(false)
  expect(calls[0].config).toMatchObject({ silent: true, cache: false })
  await remote.markAllRead({
    throughRevision: 12,
    operationId: 'server-operation',
  })
  expect(calls[1].data).toEqual({
    throughRevision: 12,
    operationId: 'server-operation',
  })
  expect(JSON.stringify(calls)).not.toContain('user-a')
})

test('分类角标是未读数，正文可检索，时间端点按真实时区精确包含', async () => {
  const storage = createStorage()
  const document = createNotificationDemoDocument(
    notificationScopeKey(scope),
    clock
  )
  const start = '2026-10-17T16:00:00.000Z'
  const end = '2026-10-18T15:59:59.999Z'
  document.items = document.items.slice(0, 3).map((item, index) => ({
    ...item,
    content: '仅正文中的独有工单号OAMS-123',
    createdAt: [start, end, '2026-10-17T15:59:59.999Z'][index],
    readAt: index === 1 ? end : null,
  }))
  storage.setItem(
    notificationDemoStorageKey(notificationScopeKey(scope)),
    JSON.stringify(document)
  )
  const service = setup(storage)
  const result = await service.query({
    ...all,
    keyword: 'OAMS-123',
    dateFrom: '2026-10-18T00:00:00.000+08:00',
    dateTo: '2026-10-18T23:59:59.999+08:00',
  })
  expect(result.total).toBe(2)
  expect(result.items.map(item => item.createdAt)).toEqual([end, start])
  expect(result.stats.byCategory).toEqual({ system: 1, business: 0, alarm: 1 })
  expect(
    Object.values(result.stats.byCategory).reduce(
      (sum, count) => sum + count,
      0
    )
  ).toBe(result.stats.unread)
})

test('远端缺分类统计、非法计数或重复id均拒绝，损坏详情不会进入UI', async () => {
  const snapshot = await setup().query(all)
  let payload: unknown = snapshot
  const transport: NotificationTransport = {
    get: async <T>() => ({ code: 0, data: payload as T, msg: 'ok' }),
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
  const service = createNotificationRemoteService(scope, transport)
  const missing = structuredClone(snapshot) as unknown as {
    stats: { byCategory?: unknown }
  }
  delete missing.stats.byCategory
  const cases = [
    missing,
    { ...snapshot, total: -1 },
    { ...snapshot, stats: { ...snapshot.stats, unread: 1.5 } },
    { ...snapshot, revision: Infinity },
    { ...snapshot, items: [snapshot.items[0], snapshot.items[0]] },
  ]
  await Promise.all(
    cases.map(async invalid => {
      payload = invalid
      await expect(service.query(all)).rejects.toThrow('不符合约定')
    })
  )
  payload = { ...snapshot.items[0], readAt: '不是日期' }
  await expect(service.detail(snapshot.items[0].id)).rejects.toThrow(
    '不符合约定'
  )
  payload = { ...snapshot.items[0], id: ' empty-id ' }
  await expect(service.detail(snapshot.items[0].id)).rejects.toThrow(
    '不符合约定'
  )
  payload = snapshot
  expect((await service.query(all)).stats).toEqual(snapshot.stats)
})

test('HTTP 内网没有randomUUID也能在固定时间生成不冲突的幂等标识', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    crypto,
    'randomUUID'
  )
  const original = crypto.randomUUID
  const clockSpy = spyOn(Date, 'now').mockReturnValue(12345678)
  try {
    Object.defineProperty(crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    })
    const identifiers = Array.from({ length: 200 }, createNotificationId)
    expect(new Set(identifiers).size).toBe(200)
  } finally {
    clockSpy.mockRestore()
    if (originalDescriptor)
      Object.defineProperty(crypto, 'randomUUID', originalDescriptor)
    else
      Object.defineProperty(crypto, 'randomUUID', {
        configurable: true,
        value: original,
      })
  }
})

test('治理和偏好远端坏响应不会伪装成空集合或成功保存实体', async () => {
  let payload: unknown = {
    templates: undefined,
    dispatches: [],
    deliveries: [],
    audit: [],
  }
  const reply = async <T>() => ({ code: 0, data: payload as T, msg: 'ok' })
  const transport: NotificationTransport = {
    get: reply,
    post: reply,
    put: reply,
    delete: reply,
  }
  const service = createNotificationRemoteService(scope, transport)
  await expect(service.governance()).rejects.toThrow('不符合约定')
  payload = {
    categories: { system: true, business: true, alarm: true },
    channels: { inbox: true, email: true, sms: false, wecom: true },
    quietHours: { enabled: true, start: '26:00', end: '08:00' },
  }
  await expect(service.getPreferences()).rejects.toThrow('不符合约定')
  payload = { ...draft(), status: 'draft', id: '', revision: 1 }
  await expect(service.saveDispatch(draft())).rejects.toThrow('不符合约定')
  const backend = setup()
  const template = (await backend.governance()).templates[0]
  payload = { ...template, channels: ['unknown'] }
  await expect(service.saveTemplate(template)).rejects.toThrow('不符合约定')
  payload = await backend.governance()
  expect((await service.governance()).templates).toHaveLength(2)
})

test('创建幂等确认持久化返回同一实体，复用旧幂等键修改内容会拒绝', async () => {
  const storage = createStorage()
  const service = setup(storage)
  const input = { ...draft(), operationId: 'stable-create' }
  const first = await service.saveDispatch(input)
  const retried = await setup(storage).saveDispatch(input)
  expect(retried.id).toBe(first.id)
  expect((await service.governance()).dispatches).toHaveLength(1)
  await expect(
    service.saveDispatch({ ...input, title: '复用旧键的不同内容' })
  ).rejects.toThrow('原始内容不一致')
  expect((await service.governance()).dispatches[0].title).toBe(input.title)
})

test('演示幂等结果仅保留最近32次确认，损坏治理或偏好快照要求明确重置', async () => {
  const storage = createStorage()
  const service = setup(storage)
  await Promise.all(
    Array.from({ length: 40 }, (_, index) =>
      service.saveDispatch({
        ...draft(),
        title: `有界草稿${index}`,
        operationId: `bounded-${index}`,
      })
    )
  )
  const key = notificationDemoStorageKey(notificationScopeKey(scope))
  const document = JSON.parse(storage.getItem(key)!)
  expect(Object.keys(document.results)).toHaveLength(32)
  document.templates[0].enabled = '错误的布尔值'
  storage.setItem(key, JSON.stringify(document))
  await expect(service.governance()).rejects.toThrow('重置演示')
  await service.resetDemo!()
  expect((await service.governance()).templates).toHaveLength(2)
})
