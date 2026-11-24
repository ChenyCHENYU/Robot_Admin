/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 本地聊天会话与延迟回复
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  ASSISTANT_DETAILS,
  DEMO_CONTACTS,
  createMessages,
  getDemoReply,
} from './data'
import { useChatAttachments } from './useChatAttachments'

/** 模拟回复留在触发它的会话，附件下载沿用已登记的本地文件。 */
export function useChatConversation() {
  const mode = ref<'team' | 'assistant'>('team')
  const currentContactId = ref('ui')
  const messages = ref(createMessages())
  messages.value.assistant = [
    {
      id: 'assistant-notice',
      type: 'system',
      sender: 'system',
      content: '脚本助手 · 回复由本地预设规则生成',
      timestamp: Date.now(),
    },
  ]
  const activeKey = computed(() =>
    mode.value === 'team' ? currentContactId.value : 'assistant'
  )
  const currentMessages = computed(() => messages.value[activeKey.value] || [])
  const currentContact = computed(() =>
    DEMO_CONTACTS.find(item => item.id === currentContactId.value)
  )
  const contacts = computed(() =>
    DEMO_CONTACTS.map(contact => ({
      ...contact,
      lastMessage:
        messages.value[contact.id]
          ?.filter(item => item.type !== 'system')
          .at(-1)?.content || contact.lastMessage,
    }))
  )
  const autoReply = ref(true)
  const events = ref<string[]>([])
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let messageSequence = 0
  const createId = () => `local-message-${++messageSequence}`
  const attachments = useChatAttachments(createId, item => {
    messages.value[activeKey.value].push(item)
    events.value.push('本地附件已加入当前会话')
  })

  /** 接受消息并在所属会话中生成预设回复。 */
  const send = (content: string) => {
    if (!content.trim()) return
    const key = activeKey.value
    messages.value[key].push({
      id: createId(),
      type: 'text',
      sender: 'self',
      content: content.trim(),
      timestamp: Date.now(),
      status: 'sent',
    })
    events.value.push('消息已加入当前会话')
    if (!autoReply.value) return
    const timer = setTimeout(() => {
      timers.delete(timer)
      const contact = DEMO_CONTACTS.find(item => item.id === key)
      messages.value[key].push({
        id: createId(),
        type: 'text',
        sender: 'other',
        content: getDemoReply(content),
        timestamp: Date.now(),
        username: contact?.name || '脚本助手',
        avatar: contact?.avatar,
        ...(key === 'assistant' ? ASSISTANT_DETAILS : {}),
      })
    }, 600)
    timers.add(timer)
  }
  /** 停止隐藏或卸载页面上的延迟演示回复。 */
  const cancelReplies = () => {
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  }
  onDeactivated(cancelReplies)
  onUnmounted(cancelReplies)

  return {
    conversation: proxyRefs({
      mode,
      contacts,
      currentContact,
      currentContactId,
      currentMessages,
      autoReply,
      events,
      send,
    }),
    attachments,
  }
}
