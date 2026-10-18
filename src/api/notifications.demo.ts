/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.demo.ts
 * @Description: 可持久化、隔离、可重试的企业消息演示适配器，不调用真实后端
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  notificationScopeKey,
  type NotificationWorkflowCommand,
  type NotificationMarkAllCommand,
  type NotificationCommand,
  type NotificationRecord,
  type NotificationScope,
  type NotificationService,
} from './notifications.contract'
import {
  createNotificationDemoStorage,
  type NotificationStorage,
} from './notifications.demo.storage'
import {
  addDispatchInboxRecord,
  addNotificationAudit,
  assertNotificationRevision,
  deliverDemoDispatch,
  deliveryBlockReason,
  saveDemoDispatch,
  saveDemoTemplate,
  validateNotificationPreferences,
} from './notifications.demo.governance'
import {
  applyNotificationWorkflowAction,
  resolveNotificationTopic,
} from './notifications.workflow'
import { queryNotificationDocument } from './notifications.demo.query'
import { createNotificationWorkflowDemoRecords } from './notifications.demo.workflow'
import type { NotificationDemoDocument } from './notifications.demo.seed'
import { createAbortError, delayWithSignal } from '@/utils/abort'
import {
  createNotificationId,
  notificationOperationSignature,
} from './notifications.id'

export interface NotificationDemoOptions {
  storage?: NotificationStorage
  now?: () => Date
  delay?: number
}

const messageMutations: Record<
  Exclude<NotificationCommand['type'], 'delete'>,
  (item: NotificationRecord, at: string) => void
> = {
  read: (item, at) => {
    item.readAt ??= at
  },
  unread: item => {
    item.readAt = null
  },
  archive: (item, at) => {
    item.archivedAt ??= at
  },
  unarchive: item => {
    item.archivedAt = null
  },
  star: item => {
    item.starred = true
  },
  unstar: item => {
    item.starred = false
  },
  'start-task': item => {
    item.taskStatus = 'in_progress'
  },
  'cancel-task': item => {
    item.taskStatus = 'cancelled'
  },
  'complete-task': (item, at) => {
    item.taskStatus = 'done'
    item.readAt ??= at
  },
}

const assertTaskMutation = (
  items: NotificationRecord[],
  type: NotificationCommand['type']
) => {
  if (!['start-task', 'complete-task', 'cancel-task'].includes(type)) return
  if (items.some(item => item.kind !== 'task'))
    throw new Error('只能办理待办消息')
  if (items.some(item => resolveNotificationTopic(item) === 'workflow'))
    throw new Error('审批事项必须使用专用审批操作')
  const allowed =
    type === 'start-task' ? ['pending'] : ['pending', 'in_progress']
  if (
    items.some(
      item => !allowed.includes(item.taskStatus ?? '') || item.archivedAt
    )
  )
    throw new Error('当前待办状态不允许此操作，请刷新后重试')
}
const matchesBulkCommand = (
  item: NotificationRecord,
  command: NotificationMarkAllCommand
) => {
  if ((item.receivedRevision ?? item.revision) > command.throughRevision)
    return false
  if (command.category && command.category !== item.category) return false
  return !command.topic || command.topic === resolveNotificationTopic(item)
}
const applyMessageCommand = (
  document: NotificationDemoDocument,
  command: NotificationCommand,
  now: Date
) => {
  const ids = new Set(command.ids)
  if (!ids.size) throw new Error('请先选择消息')
  const items = document.items.filter(item => ids.has(item.id))
  if (items.length !== ids.size)
    throw new Error('部分消息已不存在，请刷新后重试')
  assertTaskMutation(items, command.type)
  const at = now.toISOString()
  for (const item of items) {
    if (command.type !== 'delete') messageMutations[command.type](item, at)
    item.revision = document.revision + 1
    item.updatedAt = at
  }
  if (command.type === 'delete')
    document.items = document.items.filter(item => !ids.has(item.id))
}

/** 创建独立身份作用域的本地演示服务，所有写操作在最新持久化快照上执行。 */
export const createNotificationDemoService = (
  scope: NotificationScope,
  options: NotificationDemoOptions = {}
): NotificationService => {
  const now = options.now ?? (() => new Date())
  const storage = createNotificationDemoStorage(
    notificationScopeKey(scope),
    now,
    options.storage
  )
  let online = true
  let disposed = false
  let epoch = 0
  let lifecycle = new AbortController()
  const failures = new Set<string>()
  const subscriptions = new Set<() => void>()
  const assertActive = (version: number, signal?: AbortSignal) => {
    if (disposed || version !== epoch || signal?.aborted)
      throw createAbortError()
  }
  const check = async (operation: string, signal?: AbortSignal) => {
    const version = epoch
    assertActive(version, signal)
    const local = new AbortController()
    const cancel = () => local.abort()
    const lifetimeSignal = lifecycle.signal
    signal?.addEventListener('abort', cancel, { once: true })
    lifetimeSignal.addEventListener('abort', cancel, { once: true })
    try {
      await delayWithSignal(options.delay ?? 60, local.signal)
    } finally {
      signal?.removeEventListener('abort', cancel)
      lifetimeSignal.removeEventListener('abort', cancel)
    }
    assertActive(version, signal)
    if (!online) throw new Error('当前离线，消息操作尚未提交；恢复连接后可重试')
    if (failures.delete(operation) || failures.delete('*'))
      throw new Error(
        `演示：模拟${operation === 'query' ? '加载' : '操作'}失败，数据未修改，请重试`
      )
    await storage.ensureUpgrade(() => assertActive(version, signal), signal)
    assertActive(version, signal)
    return version
  }
  const command = async <T>(
    operation: string,
    update: (document: NotificationDemoDocument) => T,
    signal?: AbortSignal
  ): Promise<T> => {
    const version = await check(operation, signal)
    return storage.transaction(document => {
      assertActive(version, signal)
      return update(document)
    }, signal)
  }
  const audit = (
    document: NotificationDemoDocument,
    action: string,
    id: string,
    detail?: string
  ) => addNotificationAudit(document, scope, now(), action, id, detail)
  const deduplicate = (
    document: NotificationDemoDocument,
    operationId: string
  ): boolean => {
    if (!operationId) throw new Error('操作幂等标识缺失')
    if (document.operations.includes(operationId)) return true
    document.operations = [...document.operations.slice(-255), operationId]
    return false
  }
  const rememberResult = (
    document: NotificationDemoDocument,
    operationId: string | undefined,
    result: NotificationDemoDocument['results'][string]
  ) => {
    if (!operationId) return
    document.results[operationId] = result
    for (const key of Object.keys(document.results).slice(0, -32))
      delete document.results[key]
  }
  const dueSchedules = async (version: number, signal?: AbortSignal) => {
    const current = storage.read()
    if (
      !current.dispatches.some(
        item =>
          item.status === 'scheduled' &&
          Date.parse(item.scheduledAt ?? '') <= now().getTime()
      )
    )
      return
    await storage.transaction(document => {
      assertActive(version, signal)
      for (const dispatch of document.dispatches) {
        if (
          dispatch.status !== 'scheduled' ||
          Date.parse(dispatch.scheduledAt ?? '') > now().getTime()
        )
          continue
        deliverDemoDispatch(
          document,
          dispatch,
          now(),
          failures.delete('delivery')
        )
        audit(
          document,
          'scheduled-send',
          dispatch.id,
          '页面运行期间推进的本地模拟定时发送'
        )
      }
    }, signal)
  }
  const service: NotificationService = {
    mode: 'demo',
    capabilities: {
      manage: true,
      realtime: true,
      preferences: true,
      workflow: true,
    },
    /** 按筛选查询并返回独立的全量统计和预览。 */
    async query(query, signal) {
      const version = await check('query', signal)
      await dueSchedules(version, signal)
      assertActive(version, signal)
      return queryNotificationDocument(storage.read(), query, now())
    },
    /** 读取当前身份作用域中的消息详情。 */
    async detail(id, signal) {
      await check('detail', signal)
      const item = storage.read().items.find(record => record.id === id)
      if (!item) throw new Error('消息不存在或已删除')
      return structuredClone(item)
    },
    /** 在最新快照执行幂等批量消息命令。 */
    async mutate(input, signal) {
      const snapshot = structuredClone(input)
      await command(
        'mutation',
        document => {
          if (deduplicate(document, snapshot.operationId)) return
          applyMessageCommand(document, snapshot, now())
          audit(document, snapshot.type, snapshot.ids.join(','))
        },
        signal
      )
    },
    /** 审批按角色、当前节点及版本办理，并持久化响应以支持未知确认后的安全重试。 */
    async workflowAction(input: NotificationWorkflowCommand, signal) {
      const snapshot = structuredClone(input)
      return command(
        'workflow',
        document => {
          const signature = notificationOperationSignature('workflow', snapshot)
          document.results ??= {}
          const previous = document.results[snapshot.operationId]
          if (previous) {
            if (
              previous.type !== 'workflow' ||
              previous.signature !== signature
            )
              throw new Error('幂等标识与原始审批内容不一致')
            return previous.entity as NotificationRecord
          }
          const item = document.items.find(
            record => record.id === snapshot.recordId
          )
          if (!item) throw new Error('审批消息不存在或已删除')
          const result = applyNotificationWorkflowAction(
            item,
            snapshot,
            scope.userId,
            now().toISOString(),
            document.revision + 1
          )
          rememberResult(document, snapshot.operationId, {
            type: 'workflow',
            signature,
            entity: result,
          })
          audit(
            document,
            `workflow-${snapshot.action}`,
            item.id,
            `${item.workflow!.businessNo}：${snapshot.comment.trim()}`
          )
          return result
        },
        signal
      )
    },
    /** 标记截止版本内消息，不影响后续到达的新消息。 */
    async markAllRead(input, signal) {
      const snapshot = structuredClone(input)
      await command(
        'mutation',
        document => {
          if (deduplicate(document, snapshot.operationId)) return
          const at = now().toISOString()
          for (const item of document.items) {
            if (
              item.archivedAt ||
              item.readAt ||
              !matchesBulkCommand(item, snapshot)
            )
              continue
            item.readAt = at
            item.updatedAt = at
            item.revision = document.revision + 1
          }
          audit(
            document,
            'mark-all-read',
            snapshot.category ?? 'all',
            `截止收件版本 ${snapshot.throughRevision}`
          )
        },
        signal
      )
    },
    /** 清空截止版本内未归档消息。 */
    async clearMessages(input, signal) {
      const snapshot = structuredClone(input)
      await command(
        'mutation',
        document => {
          if (deduplicate(document, snapshot.operationId)) return
          document.items = document.items.filter(
            item => item.archivedAt || !matchesBulkCommand(item, snapshot)
          )
          audit(
            document,
            'clear-messages',
            snapshot.category ?? 'all',
            `截止收件版本 ${snapshot.throughRevision}`
          )
        },
        signal
      )
    },
    /** 查询模板、发送记录、通道投递和审计。 */
    async governance(signal) {
      const version = await check('governance', signal)
      await dueSchedules(version, signal)
      assertActive(version, signal)
      const document = storage.read()
      return structuredClone({
        templates: document.templates,
        dispatches: document.dispatches,
        deliveries: document.deliveries,
        audit: document.audit,
      })
    },
    /** 保存带乐观并发版本的模板。 */
    async saveTemplate(input, signal) {
      const snapshot = structuredClone(input)
      return command(
        'template',
        document => {
          document.results ??= {}
          const previous = snapshot.operationId
            ? document.results[snapshot.operationId]
            : undefined
          if (previous) {
            if (previous.type !== 'template')
              throw new Error('幂等标识不能跨操作复用')
            if (
              previous.signature !==
              notificationOperationSignature('template', snapshot)
            )
              throw new Error('幂等标识与原始内容不一致')
            return previous.entity as import('./notifications.contract').NotificationTemplate
          }
          const result = saveDemoTemplate(document, snapshot, now())
          rememberResult(document, snapshot.operationId, {
            type: 'template',
            signature: notificationOperationSignature('template', snapshot),
            entity: structuredClone(result),
          })
          audit(document, 'save-template', result.id)
          return result
        },
        signal
      )
    },
    /** 删除未被草稿或定时任务引用的模板。 */
    async deleteTemplate(id, revision, signal) {
      await command(
        'template',
        document => {
          const existing = document.templates.find(item => item.id === id)
          if (!existing) throw new Error('模板不存在')
          assertNotificationRevision(existing.revision, revision)
          if (
            document.dispatches.some(
              item =>
                item.templateId === id &&
                ['draft', 'scheduled'].includes(item.status)
            )
          )
            throw new Error('模板仍被草稿或定时任务使用，请先处理关联任务')
          document.templates = document.templates.filter(item => item.id !== id)
          audit(document, 'delete-template', id)
        },
        signal
      )
    },
    /** 保存发送草稿的独立快照。 */
    async saveDispatch(input, signal) {
      const snapshot = structuredClone(input)
      return command(
        'dispatch',
        document => {
          document.results ??= {}
          const previous = snapshot.operationId
            ? document.results[snapshot.operationId]
            : undefined
          if (previous) {
            if (previous.type !== 'dispatch')
              throw new Error('幂等标识不能跨操作复用')
            if (
              previous.signature !==
              notificationOperationSignature('dispatch', snapshot)
            )
              throw new Error('幂等标识与原始内容不一致')
            return previous.entity as import('./notifications.contract').NotificationDispatch
          }
          const result = saveDemoDispatch(document, snapshot, now())
          rememberResult(document, snapshot.operationId, {
            type: 'dispatch',
            signature: notificationOperationSignature('dispatch', snapshot),
            entity: structuredClone(result),
          })
          audit(document, 'save-dispatch', result.id)
          return result
        },
        signal
      )
    },
    /** 立即发送或登记本地运行期间推进的模拟定时任务。 */
    async sendDispatch(id, revision, operationId, signal) {
      await command(
        'dispatch',
        document => {
          if (deduplicate(document, operationId)) return
          const dispatch = document.dispatches.find(item => item.id === id)
          if (!dispatch) throw new Error('发送记录不存在')
          assertNotificationRevision(dispatch.revision, revision)
          if (dispatch.status !== 'draft') throw new Error('仅草稿可发送')
          if (
            dispatch.templateId &&
            !document.templates.some(
              item => item.id === dispatch.templateId && item.enabled
            )
          )
            throw new Error('关联模板已停用或不存在')
          if (
            dispatch.scheduledAt &&
            Date.parse(dispatch.scheduledAt) > now().getTime()
          ) {
            dispatch.status = 'scheduled'
            dispatch.updatedAt = now().toISOString()
            dispatch.revision++
          } else
            deliverDemoDispatch(
              document,
              dispatch,
              now(),
              failures.delete('delivery')
            )
          audit(
            document,
            'send-dispatch',
            id,
            `演示受众 ${dispatch.audience}；仅当前账户模拟投递`
          )
        },
        signal
      )
    },
    /** 撤回站内副本，保留已送达外部通道的事实。 */
    async withdrawDispatch(id, revision, signal) {
      await command(
        'dispatch',
        document => {
          const dispatch = document.dispatches.find(item => item.id === id)
          if (!dispatch) throw new Error('发送记录不存在')
          assertNotificationRevision(dispatch.revision, revision)
          if (!['scheduled', 'sent'].includes(dispatch.status))
            throw new Error('只有定时或已发送消息可撤回')
          dispatch.status = 'withdrawn'
          dispatch.revision++
          dispatch.updatedAt = now().toISOString()
          document.items = document.items.filter(item => item.dispatchId !== id)
          for (const delivery of document.deliveries.filter(
            item => item.dispatchId === id
          )) {
            if (delivery.channel !== 'inbox' && delivery.status === 'delivered')
              continue
            delivery.status = 'withdrawn'
            delivery.updatedAt = now().toISOString()
          }
          audit(
            document,
            'withdraw-dispatch',
            id,
            '撤回站内收件；已送达外部通道不可追回'
          )
        },
        signal
      )
    },
    /** 在偏好允许时重试失败或等待中的模拟投递。 */
    async retryDelivery(id, signal) {
      await command(
        'delivery-retry',
        document => {
          const delivery = document.deliveries.find(item => item.id === id)
          if (!delivery || !['failed', 'pending'].includes(delivery.status))
            throw new Error('只有失败或等待中的投递可重试')
          const dispatch = document.dispatches.find(
            item => item.id === delivery.dispatchId
          )
          if (!dispatch || dispatch.status === 'withdrawn')
            throw new Error('消息已撤回，不能重新投递')
          const reason = deliveryBlockReason(
            document,
            dispatch,
            delivery.channel,
            now()
          )
          if (reason) throw new Error(reason)
          const failed = failures.delete('delivery')
          delivery.attempts++
          delivery.status = failed ? 'failed' : 'delivered'
          delivery.error = failed ? '演示：模拟通道投递失败，可重试' : null
          delivery.updatedAt = now().toISOString()
          if (!failed && delivery.channel === 'inbox')
            addDispatchInboxRecord(document, dispatch, now())
          audit(document, 'retry-delivery', id)
        },
        signal
      )
    },
    /** 读取当前身份的通知偏好。 */
    async getPreferences(signal) {
      await check('preferences', signal)
      return structuredClone(storage.read().preferences)
    },
    /** 验证并持久化通知偏好。 */
    async savePreferences(input, signal) {
      const snapshot = structuredClone(input)
      await command(
        'preferences',
        document => {
          validateNotificationPreferences(snapshot)
          document.preferences = snapshot
          audit(document, 'save-preferences', scope.userId)
        },
        signal
      )
    },
    /** 订阅同作用域的跨实例与跨标签页存储变化。 */
    subscribe(listener) {
      const stop = storage.subscribe(listener)
      subscriptions.add(stop)
      return () => {
        stop()
        subscriptions.delete(stop)
      }
    },
    /** 切换可控演示连接状态，离线写入必须失败。 */
    setOnline(value) {
      online = value
    },
    /** 主动产生独立的本地消息、普通待办或可办理审批，便于连续演示。 */
    async simulateIncoming(kind = 'notification') {
      await command('incoming', document => {
        const at = now().toISOString()
        const id = createNotificationId()
        if (kind === 'workflow') {
          const record = createNotificationWorkflowDemoRecords(
            now(),
            document.revision + 1
          )[0]!
          const businessNo = `DEMO-CG-${now().toISOString().slice(0, 10).replace(/-/g, '')}-${id.slice(-8)}`
          document.items.unshift({
            ...record,
            id,
            title: '新增采购申请待你审批（演示）',
            createdAt: at,
            updatedAt: at,
            summary: `${businessNo} · 林晓发起 · 部门负责人审批`,
            content: `【新增审批演示】采购申请\n业务单号：${businessNo}\n当前节点：部门负责人审批\n\n此流程仅在当前浏览器模拟，可继续验证同意、驳回和退回。`,
            workflow: {
              ...record.workflow!,
              instanceId: `workflow-${id}`,
              businessNo,
              dueAt: new Date(now().getTime() + 24 * 60 * 60_000).toISOString(),
              history: [
                {
                  id: createNotificationId(),
                  action: 'submit',
                  actor: '林晓',
                  at,
                  node: '发起申请',
                  comment: '新增的本地审批演示',
                },
              ],
            },
          })
          audit(document, 'simulate-workflow', id, businessNo)
          return
        }
        document.items.unshift({
          id,
          title:
            kind === 'task' ? '新业务待办（演示）' : '新业务协作消息（演示）',
          summary: '用于验证实时角标、分页统计及跨标签页同步。',
          content:
            '这是一条由你主动触发的本地模拟消息，没有调用或影响真实业务服务。',
          contentType: 'text',
          kind,
          category: 'business',
          source: '模拟业务事件',
          priority: 'normal',
          createdAt: at,
          updatedAt: at,
          readAt: null,
          archivedAt: null,
          starred: false,
          taskStatus: kind === 'task' ? 'pending' : null,
          revision: document.revision + 1,
          receivedRevision: document.revision + 1,
        })
        audit(document, 'simulate-incoming', id)
      })
    },
    /** 下一次匹配操作失败，避免随机演示行为。 */
    simulateFailure(operation = 'mutation') {
      failures.add(operation)
    },
    /** 用户明确重置后重新播种当前作用域。 */
    async resetDemo() {
      if (disposed) throw createAbortError()
      epoch++
      lifecycle.abort()
      lifecycle = new AbortController()
      const version = epoch
      await storage.reset(() => assertActive(version))
    },
    /** 释放当前服务的所有订阅。 */
    dispose() {
      disposed = true
      epoch++
      lifecycle.abort()
      for (const stop of subscriptions) stop()
      subscriptions.clear()
    },
  }
  return service
}
