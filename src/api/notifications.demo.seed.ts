/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.demo.seed.ts
 * @Description: 企业消息可复现演示场景与独立状态快照
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationAudit,
  NotificationDelivery,
  NotificationDispatch,
  NotificationPreferences,
  NotificationRecord,
  NotificationTemplate,
} from './notifications.contract'

export interface NotificationDemoDocument {
  schema: 1
  scopeKey: string
  revision: number
  items: NotificationRecord[]
  templates: NotificationTemplate[]
  dispatches: NotificationDispatch[]
  deliveries: NotificationDelivery[]
  audit: NotificationAudit[]
  preferences: NotificationPreferences
  operations: string[]
  results: Record<
    string,
    {
      type: 'template' | 'dispatch'
      signature: string
      entity: NotificationTemplate | NotificationDispatch
    }
  >
}

export const defaultNotificationPreferences = (): NotificationPreferences => ({
  categories: { system: true, business: true, alarm: true },
  channels: { inbox: true, email: true, sms: false, wecom: true },
  quietHours: { enabled: false, start: '22:00', end: '08:00' },
})

const examples = [
  ['本周发布说明已更新', '版本发布', 'system', 'normal', 'notification'],
  ['采购申请待你审批', '采购流程', 'business', 'high', 'task'],
  ['生产接口延迟超过阈值', '监控平台', 'alarm', 'urgent', 'notification'],
  ['合同付款复核', '合同管理', 'business', 'high', 'task'],
  ['安全登录提醒', '账户安全', 'system', 'normal', 'notification'],
  ['月度巡检结果已生成', '运维巡检', 'alarm', 'normal', 'notification'],
  ['报销申请已办结', '费用报销', 'business', 'normal', 'task'],
  ['欢迎使用企业消息中心', '消息中心', 'system', 'low', 'notification'],
  ['项目里程碑待确认', '项目协作', 'business', 'normal', 'task'],
  ['备份任务执行成功', '运维巡检', 'system', 'low', 'notification'],
  ['库存安全水位预警', '库存管理', 'alarm', 'high', 'notification'],
  ['请确认本月值班安排', '团队协作', 'business', 'normal', 'task'],
] as const

const seedTarget = (index: number): NotificationRecord['target'] => {
  if (index === 4) return { type: 'route', path: '/account/security' }
  if (index === 7) return { type: 'route', path: '/account/profile' }
  return undefined
}

export const createNotificationDemoDocument = (
  scopeKey: string,
  now: Date
): NotificationDemoDocument => {
  const items: NotificationRecord[] = examples.map(
    ([title, source, category, priority, kind], index) => {
      const at = new Date(now.getTime() - index * 47 * 60_000).toISOString()
      const done = index === 6
      return {
        id: `demo-message-${index + 1}`,
        title,
        source,
        category,
        priority,
        kind,
        summary:
          kind === 'task'
            ? '这是一项可完整办理的本地演示待办，阅读与办结分别记录。'
            : '本地演示消息：支持检索、已读、收藏、归档与持久化恢复。',
        content: `【演示消息】${title}\n\n消息来源：${source}。\n当前展示的数据仅属于当前账户、租户和公司。操作会保存在当前浏览器，刷新后仍保持。\n\n${kind === 'task' ? '打开详情不会自动办结；请使用“完成待办”验证独立的办理状态。' : '你可以标记已读、收藏或归档，再通过筛选找回它。'}`,
        contentType: 'text',
        createdAt: at,
        updatedAt: at,
        readAt: index > 6 || done ? at : null,
        archivedAt: index === 9 ? at : null,
        starred: index === 3,
        taskStatus: kind === 'task' ? (done ? 'done' : 'pending') : null,
        revision: 1,
        receivedRevision: 1,
        target: seedTarget(index),
        attachments:
          index === 0
            ? [
                {
                  id: 'demo-release-notes',
                  name: '发布说明（演示凭证）.txt',
                  url: '',
                  size: 180,
                },
              ]
            : [],
      }
    }
  )
  const updatedAt = now.toISOString()
  return {
    schema: 1,
    scopeKey,
    revision: 1,
    items,
    dispatches: [],
    deliveries: [],
    audit: [],
    operations: [],
    results: {},
    preferences: defaultNotificationPreferences(),
    templates: [
      {
        id: 'demo-template-system',
        name: '系统公告',
        title: '系统维护通知',
        content: '系统将于指定时间进行维护，请提前保存当前工作。',
        category: 'system',
        priority: 'normal',
        channels: ['inbox', 'email'],
        enabled: true,
        revision: 1,
        updatedAt,
      },
      {
        id: 'demo-template-business',
        name: '业务待办提醒',
        title: '你有新的业务事项待处理',
        content: '请进入消息中心查看详情，按流程要求完成办理。',
        category: 'business',
        priority: 'high',
        channels: ['inbox', 'wecom'],
        enabled: true,
        revision: 1,
        updatedAt,
      },
    ],
  }
}
