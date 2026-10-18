/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\notification-lifecycle.test.ts
 * @Description: 企业消息演示命令的作用域取消、提交确认与治理输入边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createNotificationDemoService } from '../src/api/notifications.demo'
import {
  createNotificationRemoteService,
  type NotificationTransport,
} from '../src/api/notifications.remote'
import {
  defaultNotificationQuery,
  type NotificationDispatchDraft,
  type NotificationScope,
  type NotificationTemplateDraft,
  type NotificationSnapshot,
} from '../src/api/notifications.contract'
import type { NotificationStorage } from '../src/api/notifications.demo.storage'

const scope: NotificationScope = {
  userId: 'notification-lifecycle-user',
  tenantId: 'notification-lifecycle-tenant',
  companyId: 'notification-lifecycle-company',
}
const clock = new Date('2026-10-18T10:00:00Z')
const query = defaultNotificationQuery()
const createStorage = (): NotificationStorage => {
  const values = new Map<string, string>()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: key => {
      values.delete(key)
    },
  }
}
const setup = (storage = createStorage(), delay = 0) =>
  createNotificationDemoService(scope, { storage, delay, now: () => clock })
const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(yes => {
    resolve = yes
  })
  return { promise, resolve }
}

test('dispose 在异步延迟期间取消无外部 signal 的模拟消息，旧身份存储不被改写', async () => {
  const storage = createStorage()
  const service = setup(storage, 10)
  const pending = service.simulateIncoming!()
  service.dispose()
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  const reader = setup(storage)
  try {
    expect((await reader.query(query)).stats.total).toBe(21)
  } finally {
    reader.dispose()
  }
})

test('dispose 在 Web Lock 排队后仍阻止提交，即使锁实现不主动响应取消', async () => {
  const storage = createStorage()
  const entered = deferred<void>()
  const release = deferred<void>()
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  Reflect.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      locks: {
        request: async (
          _key: string,
          _options: unknown,
          run: () => Promise<unknown>
        ) => {
          entered.resolve()
          await release.promise
          return run()
        },
      },
    },
  })
  const service = setup(storage)
  try {
    const pending = service.simulateIncoming!()
    await entered.promise
    service.dispose()
    release.resolve()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  } finally {
    release.resolve()
    service.dispose()
    if (descriptor) Reflect.defineProperty(globalThis, 'navigator', descriptor)
    else Reflect.deleteProperty(globalThis, 'navigator')
  }
  const reader = setup(storage)
  try {
    expect((await reader.query(query)).stats.total).toBe(21)
  } finally {
    reader.dispose()
  }
})

test('显式重置会取消此前仍在延迟中的 incoming，新场景不会被旧命令尾随污染', async () => {
  const storage = createStorage()
  const service = setup(storage, 10)
  try {
    const pending = service.simulateIncoming!()
    await service.resetDemo!()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect((await service.query(query)).stats.total).toBe(21)
    // 新一代命令仍然正常工作，重置不会永久关闭服务。
    await service.simulateIncoming!()
    expect((await service.query(query)).stats.total).toBe(22)
  } finally {
    service.dispose()
  }
})

test('订阅者异常不改变已提交命令的确认结果，也不中断后续订阅者', async () => {
  const service = setup()
  const bad = service.subscribe(() => {
    throw new Error('订阅渲染失败')
  })
  let notifications = 0
  const good = service.subscribe(() => {
    notifications++
  })
  try {
    const { id } = (await service.query(query)).items[0]
    const before = notifications
    await expect(
      service.mutate({
        type: 'star',
        ids: [id],
        operationId: 'isolated-subscriber-command',
      })
    ).resolves.toBeUndefined()
    expect((await service.detail(id)).starred).toBe(true)
    expect(notifications).toBe(before + 1)
  } finally {
    bad()
    good()
    service.dispose()
  }
})

const template = (): NotificationTemplateDraft => ({
  name: '生命周期测试模板',
  title: '有效标题',
  content: '有效正文',
  category: 'system',
  priority: 'normal',
  channels: ['inbox'],
  enabled: true,
})
const dispatch = (): NotificationDispatchDraft => ({
  title: '生命周期测试发送',
  content: '有效正文',
  category: 'system',
  priority: 'normal',
  channels: ['inbox'],
  audience: 'self',
  scheduledAt: null,
})

test('非法模板 category、priority、enabled 在写入前拒绝，演示文档仍然可读', async () => {
  const service = setup()
  try {
    const before = await service.governance()
    await Promise.all(
      [
        { ...template(), category: 'unknown' },
        { ...template(), priority: 'critical' },
        { ...template(), enabled: 'true' },
      ].map(async invalid => {
        await expect(
          service.saveTemplate(invalid as unknown as NotificationTemplateDraft)
        ).rejects.toThrow()
      })
    )
    expect((await service.governance()).templates).toEqual(before.templates)
    expect((await service.query(query)).stats.total).toBe(21)
  } finally {
    service.dispose()
  }
})

test('非法发送 category、priority 不会进入草稿或破坏收件箱', async () => {
  const service = setup()
  try {
    await Promise.all(
      [
        { ...dispatch(), category: 'unknown' },
        { ...dispatch(), priority: 'critical' },
      ].map(async invalid => {
        await expect(
          service.saveDispatch(invalid as unknown as NotificationDispatchDraft)
        ).rejects.toThrow()
      })
    )
    expect((await service.governance()).dispatches).toEqual([])
    expect((await service.query(query)).stats.total).toBe(21)
  } finally {
    service.dispose()
  }
})

test('迟到旧查询不能恢复新快照已经撤销的远端治理、偏好与审批能力', async () => {
  const demo = setup()
  const snapshot = await demo.query(query)
  demo.dispose()
  const old = deferred<NotificationSnapshot>()
  let calls = 0
  const latest: NotificationSnapshot = {
    ...snapshot,
    capabilities: {
      manage: false,
      realtime: false,
      preferences: false,
      workflow: false,
    },
  }
  const transport: NotificationTransport = {
    get: async <T>() => ({
      code: 0,
      msg: 'ok',
      data: (++calls === 1 ? await old.promise : latest) as T,
    }),
    post: async () => {
      throw new Error('不应发送命令')
    },
    put: async () => {
      throw new Error('不应发送命令')
    },
    delete: async () => {
      throw new Error('不应发送命令')
    },
  }
  const remote = createNotificationRemoteService(scope, transport)
  try {
    const first = remote.query(query)
    await remote.query(query)
    expect(remote.capabilities.manage).toBe(false)
    old.resolve({
      ...snapshot,
      capabilities: {
        manage: true,
        realtime: false,
        preferences: true,
        workflow: true,
      },
    })
    await first
    expect(remote.capabilities.manage).toBe(false)
    expect(remote.capabilities.preferences).toBe(false)
    expect(remote.capabilities.workflow).toBe(false)
  } finally {
    remote.dispose()
  }
})
