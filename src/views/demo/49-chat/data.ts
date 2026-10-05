/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\49-chat\data.ts
 * @Description: 工程协作会话的本地示例，不接入外部 IM 或 AI 服务
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ChatContact, ChatMessage } from '@robot-admin/naive-ui-components'

/** 生成自带的矢量头像，避免演示依赖远程图片。 */
export function createAvatar(label: string, color: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="20" fill="${color}"/><text x="32" y="39" text-anchor="middle" fill="white" font-family="sans-serif" font-size="24">${label}</text></svg>`)}`
}
export const SELF_AVATAR = createAvatar('我', '#5474d9')
export const DEMO_CONTACTS: ChatContact[] = [
  {
    id: 'ui',
    name: '界面联调',
    avatar: createAvatar('UI', '#507ace'),
    lastMessage: '一起检查主题与交互边界',
  },
  {
    id: 'release',
    name: '版本发布',
    avatar: createAvatar('包', '#408b81'),
    lastMessage: '讨论验证与发布流程',
  },
  {
    id: 'component',
    name: '组件讨论',
    avatar: createAvatar('组', '#9270bc'),
    lastMessage: '配置、事件与复用能力',
  },
]

/** 每次进入页面建立独立的演示会话。 */
export function createMessages(): Record<string, ChatMessage[]> {
  return Object.fromEntries(
    DEMO_CONTACTS.map(contact => [
      contact.id,
      [
        {
          id: `${contact.id}-notice`,
          content: '本地演示会话 · 消息与附件仅保留在当前页面',
          type: 'system',
          sender: 'system',
          timestamp: Date.now(),
        },
        {
          id: `${contact.id}-welcome`,
          content: contact.lastMessage || '',
          type: 'text',
          sender: 'other',
          timestamp: Date.now(),
          username: contact.name,
          avatar: contact.avatar,
        },
      ],
    ])
  )
}
export const STARTERS = [
  '如何验证明暗主题？',
  '组件包如何按需引入？',
  '发布之前需要检查什么？',
]

/** 确定性的脚本回复，用于演示消息交互，不冒充真实 AI。 */
export function getDemoReply(content: string): string {
  if (/主题|明暗/.test(content))
    return '可以切换明暗主题与菜单风格，再检查正文、弹层和图表。这是一条预设的演示回复。'
  if (/组件|按需|配置/.test(content))
    return '项目通过组件库 resolver 引入独立入口和样式，业务侧传入 Props 并处理事件。这是一条预设的演示回复。'
  if (/发布|版本|检查/.test(content))
    return '先运行类型、测试、构建与包契约检查，再核对版本和发布内容。这是一条预设的演示回复。'
  return '已收到你的本地演示消息。这里用预设回复展示对话流程，尚未连接远端聊天服务。'
}
