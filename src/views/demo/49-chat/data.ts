/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\49-chat\data.ts
 * @Description: 聊天组件演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ChatContact, ChatMessage } from '@robot-admin/naive-ui-components'

// ================= 联系人列表 =================
export const DEMO_CONTACTS: ChatContact[] = [
  {
    id: '1',
    name: '小助手 Bot',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot1',
    lastMessage: '有什么可以帮您的吗？',
    lastTime: Date.now() - 60_000,
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    lastMessage: '项目进度报告已发送',
    lastTime: Date.now() - 3_600_000,
    online: true,
  },
  {
    id: '3',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    lastMessage: '[图片]',
    lastTime: Date.now() - 86_400_000,
    unread: 1,
  },
  {
    id: '4',
    name: '产品群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=group1',
    lastMessage: '王五: 明天9点开会',
    lastTime: Date.now() - 172_800_000,
    unread: 5,
    online: false,
  },
  {
    id: '5',
    name: 'AI 对话',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    lastMessage: '我是 AI 助手，随时为您服务。',
    lastTime: Date.now() - 300_000,
    online: true,
  },
]

// ================= 模拟消息 =================
const now = Date.now()

export const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      content: '你好！我是智能助手，有什么可以帮您？',
      type: 'text',
      sender: 'other',
      timestamp: now - 300_000,
      username: '小助手 Bot',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot1',
    },
    {
      id: 'm2',
      content: '帮我查一下今天的待办事项',
      type: 'text',
      sender: 'self',
      timestamp: now - 240_000,
      status: 'sent',
    },
    {
      id: 'm3',
      content:
        '好的，您今天有 3 项待办：\n1. ✅ 完成登录页重构\n2. 📋 Review PR #128\n3. 🔧 修复表单验证 Bug',
      type: 'text',
      sender: 'other',
      timestamp: now - 180_000,
      username: '小助手 Bot',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot1',
    },
    {
      id: 'm4',
      content: 'https://picsum.photos/400/300?random=1',
      type: 'image',
      sender: 'other',
      timestamp: now - 120_000,
      username: '小助手 Bot',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot1',
    },
    {
      id: 'm5',
      content: '收到，谢谢！',
      type: 'text',
      sender: 'self',
      timestamp: now - 60_000,
      status: 'sent',
    },
  ],
  '2': [
    {
      id: 'sys1',
      content: '张三 加入了会话',
      type: 'system',
      sender: 'system',
      timestamp: now - 7_200_000,
    },
    {
      id: 'z1',
      content: '项目进度报告已发送，请查收附件。',
      type: 'text',
      sender: 'other',
      timestamp: now - 3_600_000,
      username: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    },
    {
      id: 'z2',
      content: 'Q1 进度报告.pdf',
      type: 'file',
      sender: 'other',
      timestamp: now - 3_500_000,
      username: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      fileName: 'Q1-进度报告.pdf',
      fileSize: 2_456_789,
    },
    {
      id: 'z3',
      content: '好的，我看一下',
      type: 'text',
      sender: 'self',
      timestamp: now - 3_400_000,
      status: 'sent',
    },
  ],
  '3': [
    {
      id: 'l1',
      content: 'https://picsum.photos/400/300?random=2',
      type: 'image',
      sender: 'other',
      timestamp: now - 86_400_000,
      username: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    },
    {
      id: 'l2',
      content: '这个设计稿你看看行不行？',
      type: 'text',
      sender: 'other',
      timestamp: now - 86_300_000,
      username: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    },
  ],
  '5': [
    {
      id: 'ai1',
      content:
        '您好！我是 AI 助手，可以回答技术问题、代码生成、文案撰写等。请问有什么需要帮助的？',
      type: 'text',
      sender: 'other',
      timestamp: now - 600_000,
      username: 'AI 助手',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    },
    {
      id: 'ai2',
      content: '帮我写一个 Vue 3 的 composable，用于管理分页',
      type: 'text',
      sender: 'self',
      timestamp: now - 540_000,
      status: 'sent',
    },
    {
      id: 'ai3',
      content:
        '好的，以下是一个通用的分页 composable：\n\n```typescript\nexport function usePagination(options = {}) {\n  const page = ref(1)\n  const pageSize = ref(options.pageSize ?? 10)\n  const total = ref(0)\n  const pageCount = computed(() =>\n    Math.ceil(total.value / pageSize.value)\n  )\n  return { page, pageSize, total, pageCount }\n}\n```\n\n需要我补充更多功能吗？',
      type: 'text',
      sender: 'other',
      timestamp: now - 480_000,
      username: 'AI 助手',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    },
  ],
}

// ================= AI 自动回复模拟 =================
const AI_REPLIES = [
  '收到您的消息，让我思考一下...',
  '好的，这个问题我来帮您解决。',
  '这是一个很好的问题！',
  '已经为您处理完毕 ✨',
  '需要更多帮助吗？',
  '这个功能正在开发中，敬请期待。',
  '建议您参考官方文档获取更多信息。',
]

export const getRandomReply = () =>
  AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)]

// ================= 演示场景配置 =================
export const DEMO_SCENES = [
  {
    key: 'im',
    icon: 'mdi:chat-processing-outline',
    title: 'IM 即时通讯',
    description: '联系人列表 + 消息气泡完整模式',
  },
  {
    key: 'ai',
    icon: 'mdi:robot-happy-outline',
    title: 'AI 对话',
    description: '无侧栏，专注对话交互',
  },
]

// ================= 功能特性 =================
export const FEATURE_LIST = [
  {
    icon: 'mdi:account-group',
    title: '联系人管理',
    desc: '搜索、在线状态、未读数',
    tag: '核心',
  },
  {
    icon: 'mdi:message-text',
    title: '消息气泡',
    desc: '文本 / 图片 / 文件 / 系统消息',
    tag: '核心',
  },
  {
    icon: 'mdi:send',
    title: '消息发送',
    desc: 'Enter 快捷发送，状态反馈',
    tag: '核心',
  },
  {
    icon: 'mdi:palette-outline',
    title: 'CSS 变量主题',
    desc: '通过变量自定义全部风格',
    tag: '扩展',
  },
  {
    icon: 'mdi:cellphone',
    title: '响应式布局',
    desc: '移动端自适应侧栏折叠',
    tag: '扩展',
  },
  {
    icon: 'mdi:robot',
    title: 'AI 对话模式',
    desc: '关闭侧栏，专注聊天',
    tag: '场景',
  },
]

export const TAG_TYPE_MAP: Record<
  string,
  'default' | 'success' | 'info' | 'warning' | 'error'
> = {
  核心: 'success',
  扩展: 'info',
  场景: 'warning',
}
