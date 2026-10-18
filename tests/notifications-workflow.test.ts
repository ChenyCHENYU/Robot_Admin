/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\notifications-workflow.test.ts
 * @Description: 审批与普通待办的主题、关系、权限、版本、幂等及历史快照迁移回归
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
  notificationScopeKey,
  type NotificationWorkflowCommand,
} from '../src/api/notifications.contract'
import { createNotificationDemoDocument } from '../src/api/notifications.demo.seed'
import {
  notificationDemoStorageKey,
  type NotificationStorage,
} from '../src/api/notifications.demo.storage'
import {
  requireNotificationRecord,
  requireNotificationSnapshot,
} from '../src/api/notifications.validation'

const scope = {
  userId: 'workflow-user',
  tenantId: 'workflow-tenant',
  companyId: 'workflow-company',
}
const now = new Date('2026-10-18T10:00:00.000Z')
const query = { ...defaultNotificationQuery(), pageSize: 100 }
const memory = (): NotificationStorage => {
  const data = new Map<string, string>()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: key => {
      data.delete(key)
    },
  }
}
const setup = (storage = memory()) =>
  createNotificationDemoService(scope, { storage, now: () => now, delay: 0 })
const command = (
  recordId = 'demo-workflow-1',
  patch: Partial<NotificationWorkflowCommand> = {}
): NotificationWorkflowCommand => ({
  recordId,
  action: 'approve',
  comment: '审核通过',
  revision: 1,
  operationId: 'workflow-op',
  ...patch,
})

test('分类、主题、阅读、任务与流程关系分别筛选，权威统计不受分页和搜索影响', async () => {
  const service = setup()
  const all = await service.query(query)
  expect(all.stats).toMatchObject({
    total: 21,
    unread: 9,
    todo: 6,
    done: 3,
    byTopic: { general: 13, workflow: 8 },
    workflowPending: 1,
    overdue: 1,
  })
  const inbox = await service.query({
    ...query,
    topic: 'workflow',
    status: 'todo',
  })
  expect(inbox.items.map(item => item.id)).toEqual(['demo-workflow-1'])
  expect(inbox.stats).toEqual(all.stats)
  expect(
    (
      await service.query({
        ...query,
        relationship: 'cc',
        topic: 'workflow',
        status: 'todo',
      })
    ).total
  ).toBe(0)
  expect(
    (
      await service.query({
        ...query,
        workflowStatus: 'returned',
        topic: 'workflow',
      })
    ).items[0]?.id
  ).toBe('demo-workflow-4')
  expect(
    (
      await service.query({
        ...query,
        topic: 'general',
        taskStatus: 'in_progress',
      })
    ).items[0]?.id
  ).toBe('demo-business-task-1')
  expect(
    (await service.query({ ...query, keyword: 'DEMO-CG-202610-001' })).total
  ).toBe(1)
})

test('阅读、收藏和普通待办命令均不能草率办结审批，抄送不允许审批', async () => {
  const service = setup()
  await service.mutate({
    type: 'read',
    ids: ['demo-workflow-1'],
    operationId: 'read-flow',
  })
  const read = await service.detail('demo-workflow-1')
  expect(read.workflow?.status).toBe('pending')
  expect(read.taskStatus).toBe('pending')
  await expect(
    service.mutate({
      type: 'complete-task',
      ids: [read.id],
      operationId: 'generic-flow',
    })
  ).rejects.toThrow('专用审批')
  await expect(
    service.workflowAction!(command('demo-workflow-7', { operationId: 'cc' }))
  ).rejects.toThrow('参与关系')
  await expect(
    service.workflowAction!(
      command('demo-workflow-8', { operationId: 'initiator' })
    )
  ).rejects.toThrow('参与关系')
  expect((await service.query(query)).stats.workflowPending).toBe(1)
})

test('普通待办合法开始、完成和取消，终态重复命令拒绝且幂等重试只记一次审计', async () => {
  const service = setup()
  const start = {
    type: 'start-task' as const,
    ids: ['demo-message-2'],
    operationId: 'start',
  }
  await service.mutate(start)
  await service.mutate(start)
  expect((await service.detail('demo-message-2')).taskStatus).toBe(
    'in_progress'
  )
  await service.mutate({
    type: 'complete-task',
    ids: start.ids,
    operationId: 'complete',
  })
  expect((await service.detail('demo-message-2')).taskStatus).toBe('done')
  await expect(
    service.mutate({
      type: 'start-task',
      ids: start.ids,
      operationId: 'restart',
    })
  ).rejects.toThrow('当前待办状态')
  await service.mutate({
    type: 'cancel-task',
    ids: ['demo-business-task-1'],
    operationId: 'cancel',
  })
  expect((await service.detail('demo-business-task-1')).taskStatus).toBe(
    'cancelled'
  )
  await expect(
    service.mutate({
      type: 'complete-task',
      ids: ['demo-business-task-1'],
      operationId: 'complete-cancelled',
    })
  ).rejects.toThrow('当前待办状态')
  expect(
    (await service.governance()).audit.filter(
      item => item.action === 'start-task'
    )
  ).toHaveLength(1)
})

test('审批必须匹配版本、状态和关系，驳回退回必须意见；失败不改任何状态', async () => {
  const service = setup()
  await Promise.all(
    [
      { revision: 0 },
      { action: 'reject' as const, comment: '  ' },
      { action: 'return' as const, comment: '' },
    ].map(patch =>
      expect(
        service.workflowAction!(command('demo-workflow-1', patch))
      ).rejects.toThrow()
    )
  )
  service.simulateFailure!('workflow')
  await expect(service.workflowAction!(command())).rejects.toThrow(
    '模拟操作失败'
  )
  expect((await service.detail('demo-workflow-1')).workflow?.status).toBe(
    'pending'
  )
  expect((await service.governance()).audit).toEqual([])
  const result = await service.workflowAction!(command())
  expect(result.workflow?.status).toBe('approved')
  expect(result.workflow?.history.at(-1)).toMatchObject({
    action: 'approve',
    actor: scope.userId,
    comment: '审核通过',
  })
  expect((await service.query(query)).stats).toMatchObject({
    workflowPending: 0,
    overdue: 0,
    todo: 5,
  })
  await expect(
    service.workflowAction!(
      command('demo-workflow-1', {
        revision: result.revision,
        operationId: 'double',
      })
    )
  ).rejects.toThrow('参与关系')
})

test('审批幂等结果持久化支持未知确认重试，复用键更换意见拒绝，审计不会重复', async () => {
  const storage = memory()
  const service = setup(storage)
  const first = await service.workflowAction!(command())
  const retried = await setup(storage).workflowAction!(command())
  expect(retried).toEqual(first)
  expect(
    (await service.governance()).audit.filter(
      item => item.action === 'workflow-approve'
    )
  ).toHaveLength(1)
  await expect(
    service.workflowAction!(
      command('demo-workflow-1', { comment: '另一份意见' })
    )
  ).rejects.toThrow('幂等标识')
})

test('流程退回和发起人撤回拥有独立动作记录，抄送从不计入我的待办', async () => {
  const service = setup()
  const returned = await service.workflowAction!(
    command('demo-workflow-1', {
      action: 'return',
      comment: '请补充报价单',
      operationId: 'return',
    })
  )
  expect(returned.workflow).toMatchObject({
    status: 'returned',
    currentNode: '申请人修改',
  })
  const withdrawn = await service.workflowAction!(
    command('demo-workflow-8', {
      action: 'withdraw',
      comment: '',
      operationId: 'withdraw',
    })
  )
  expect(withdrawn.workflow?.status).toBe('withdrawn')
  expect(
    (await service.query({ ...query, status: 'todo', relationship: 'cc' }))
      .items
  ).toEqual([])
})

test('主题批量标读和清空保留另一个主题，旧快照只补新种子一次且不复活删除项', async () => {
  const storage = memory()
  const document = createNotificationDemoDocument(
    notificationScopeKey(scope),
    now
  )
  document.items = document.items.filter(
    item => item.id.startsWith('demo-message-') && item.id !== 'demo-message-2'
  )
  delete document.seedRevision
  document.preferences.channels.email = false
  document.operations = ['old-operation']
  const key = notificationDemoStorageKey(notificationScopeKey(scope))
  storage.setItem(key, JSON.stringify(document))
  const service = setup(storage)
  const upgraded = await service.query(query)
  expect(upgraded.stats.total).toBe(20)
  await expect(service.detail('demo-message-2')).rejects.toThrow('不存在')
  expect((await service.getPreferences()).channels.email).toBe(false)
  expect(JSON.parse(storage.getItem(key)!).operations).toEqual([
    'old-operation',
  ])
  await service.markAllRead({
    topic: 'workflow',
    throughRevision: upgraded.revision,
    operationId: 'read-workflow',
  })
  expect(
    (await service.query({ ...query, topic: 'workflow', status: 'unread' }))
      .total
  ).toBe(0)
  expect(
    (await service.query({ ...query, topic: 'general', status: 'unread' }))
      .total
  ).toBeGreaterThan(0)
  await service.clearMessages({
    topic: 'workflow',
    throughRevision: upgraded.revision,
    operationId: 'clear-workflow',
  })
  expect(
    (await setup(storage).query({ ...query, topic: 'workflow' })).total
  ).toBe(0)
  expect(JSON.parse(storage.getItem(key)!).seedRevision).toBe(2)
  expect(
    (await setup(storage).query({ ...query, topic: 'general' })).total
  ).toBe(12)
})

test('旧远端缺少新统计保持未知，不用预览估算且审批能力默认拒绝', async () => {
  const snapshot = await setup().query(query)
  delete snapshot.stats.byTopic
  delete snapshot.stats.workflowPending
  delete snapshot.stats.overdue
  let payload: unknown = snapshot
  const calls: Array<{ url: string; data?: unknown }> = []
  const transport: NotificationTransport = {
    get: async <T>() => ({ code: 0, data: payload as T, msg: 'ok' }),
    post: async <T>(url: string, data: unknown) => {
      calls.push({ url, data })
      return { code: 0, data: payload as T, msg: 'ok' }
    },
    put: async () => {
      throw new Error('未调用')
    },
    delete: async () => {
      throw new Error('未调用')
    },
  }
  const service = createNotificationRemoteService(scope, transport)
  const result = await service.query(query)
  expect(result.stats.byTopic).toBeUndefined()
  expect(result.stats.workflowPending).toBeUndefined()
  await expect(service.workflowAction!(command())).rejects.toThrow('未授权')
  expect(calls).toEqual([])
  payload = {
    ...snapshot,
    capabilities: {
      manage: true,
      preferences: true,
      realtime: false,
      workflow: true,
    },
  }
  await service.query(query)
  payload = {
    ...(await setup().detail('demo-workflow-1')),
    id: 'unsafe/id',
    revision: 2,
  }
  await service.workflowAction!(
    command('unsafe/id', { operationId: 'remote-op' })
  )
  expect(calls[0]).toEqual({
    url: '/notifications/inbox/unsafe%2Fid/workflow-actions',
    data: {
      action: 'approve',
      comment: '审核通过',
      expectedRevision: 1,
      operationId: 'remote-op',
    },
  })
})

test('畸形流程元数据和伪造统计在进入Store前拒绝，旧general字段仍兼容', async () => {
  const snapshot = await setup().query(query)
  const workflow = await setup().detail('demo-workflow-1')
  expect(() =>
    requireNotificationRecord({
      ...workflow,
      workflow: { ...workflow.workflow, relationship: 'owner' },
    })
  ).toThrow('不符合约定')
  expect(() =>
    requireNotificationRecord({ ...workflow, topic: 'general' })
  ).toThrow('不符合约定')
  expect(() =>
    requireNotificationSnapshot({
      ...snapshot,
      stats: { ...snapshot.stats, byTopic: { general: 21, workflow: 21 } },
    })
  ).toThrow('不符合约定')
  expect(() =>
    requireNotificationSnapshot({
      ...snapshot,
      stats: { ...snapshot.stats, overdue: 100 },
    })
  ).toThrow('不符合约定')
  const old = await setup().detail('demo-message-2')
  delete old.topic
  expect(requireNotificationRecord(old)).toEqual(old)
})

test('连续生成独立待审流程，无需重置旧数据即可反复演示审批和持久化恢复', async () => {
  const storage = memory()
  const service = setup(storage)
  await service.workflowAction!(command())
  expect((await service.query(query)).stats.workflowPending).toBe(0)
  await Promise.all([
    service.simulateIncoming!('workflow'),
    service.simulateIncoming!('workflow'),
  ])
  const generated = (
    await service.query({ ...query, topic: 'workflow', status: 'todo' })
  ).items
  expect(generated).toHaveLength(2)
  expect(new Set(generated.map(item => item.id)).size).toBe(2)
  expect(new Set(generated.map(item => item.workflow!.instanceId)).size).toBe(2)
  expect(new Set(generated.map(item => item.workflow!.businessNo)).size).toBe(2)
  expect(generated.every(item => item.workflow!.history.length === 1)).toBe(
    true
  )
  expect((await service.query(query)).stats.overdue).toBe(0)
  const reader = setup(storage)
  const result = await reader.workflowAction!(
    command(generated[0]!.id, {
      revision: generated[0]!.revision,
      operationId: 'approve-generated',
    })
  )
  expect(result.workflow?.status).toBe('approved')
  expect((await reader.query(query)).stats.workflowPending).toBe(1)
  expect((await reader.detail('demo-workflow-1')).workflow?.status).toBe(
    'approved'
  )
})
