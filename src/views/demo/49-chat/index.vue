<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\49-chat\index.vue
 * @Description: 聊天组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="chat-demo">
    <NH1>聊天组件场景示例</NH1>

    <!-- ==================== 功能特性 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:puzzle-outline"
          class="title-icon"
        />
        功能特性
      </h2>
      <div class="feature-grid">
        <div
          v-for="feat in FEATURE_LIST"
          :key="feat.title"
          class="feature-card"
        >
          <div class="feature-card__icon">
            <C_Icon :name="feat.icon" />
          </div>
          <div class="feature-card__body">
            <span class="feature-card__title">{{ feat.title }}</span>
            <span class="feature-card__desc">{{ feat.desc }}</span>
          </div>
          <NTag
            :bordered="false"
            size="small"
            :type="TAG_TYPE_MAP[feat.tag] ?? 'default'"
          >
            {{ feat.tag }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- ==================== 场景切换 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:television-play"
          class="title-icon"
        />
        在线演示
      </h2>
      <p class="section-desc">
        选择不同场景，体验聊天组件在各类业务场景中的表现。
      </p>

      <div class="scene-switcher">
        <div
          v-for="scene in DEMO_SCENES"
          :key="scene.key"
          class="scene-card"
          :class="{ 'is-active': activeScene === scene.key }"
          @click="activeScene = scene.key"
        >
          <C_Icon
            :name="scene.icon"
            class="scene-card__icon"
          />
          <span class="scene-card__title">{{ scene.title }}</span>
          <span class="scene-card__desc">{{ scene.description }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== 聊天组件实例 ==================== -->
    <div class="demo-section demo-section--chat">
      <!-- IM 模式 -->
      <div
        v-if="activeScene === 'im'"
        class="chat-wrapper"
      >
        <C_Chat
          ref="chatRef"
          :contacts="DEMO_CONTACTS"
          :messages="currentMessages"
          :current-contact-id="currentContactId"
          self-avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=cheny"
          self-name="CHENY"
          @send="handleSend"
          @select-contact="handleSelectContact"
          @image-preview="handleImagePreview"
          @file-click="handleFileClick"
          @file-upload="handleFileUpload"
          @emoji-click="handleEmojiClick"
        />
      </div>

      <!-- AI 模式 -->
      <div
        v-else
        class="chat-wrapper"
      >
        <C_Chat
          ref="aiChatRef"
          :messages="aiMessages"
          :show-contacts="false"
          title="AI 助手"
          placeholder="问我任何问题..."
          self-avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=cheny"
          self-name="CHENY"
          @send="handleAiSend"
        />
      </div>
    </div>

    <!-- ==================== 事件日志 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:console"
          class="title-icon"
        />
        事件日志
        <NButton
          quaternary
          size="small"
          style="margin-left: auto"
          @click="eventLogs = []"
        >
          清空
        </NButton>
      </h2>
      <div class="event-log-panel">
        <div
          v-for="(log, idx) in eventLogs.slice(-15)"
          :key="idx"
          class="event-log-item"
        >
          <span class="event-log-time">{{ log.time }}</span>
          <NTag
            :type="log.type"
            size="small"
            :bordered="false"
          >
            {{ log.event }}
          </NTag>
          <span
            v-if="log.detail"
            class="event-log-detail"
          >
            {{ log.detail }}
          </span>
        </div>
        <div
          v-if="!eventLogs.length"
          class="event-log-empty"
        >
          操作后事件将在此处实时显示...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ChatMessage } from '@/components/global/C_Chat/types'
  import {
    DEMO_CONTACTS,
    DEMO_MESSAGES,
    DEMO_SCENES,
    FEATURE_LIST,
    TAG_TYPE_MAP,
    getRandomReply,
  } from './data'
  import './index.scss'

  const message = useMessage()

  // ===== 状态 =====
  const chatRef = ref()
  const aiChatRef = ref()
  const activeScene = ref('im')
  const currentContactId = ref('1')

  // ===== IM 消息管理 =====
  const messagesMap = ref<Record<string, ChatMessage[]>>(
    Object.fromEntries(
      Object.entries(DEMO_MESSAGES).map(([k, v]) => [k, [...v]])
    ) as Record<string, ChatMessage[]>
  )

  const currentMessages = computed(
    () => messagesMap.value[currentContactId.value] ?? []
  )

  // ===== AI 消息 =====
  const aiMessages = ref<ChatMessage[]>([
    {
      id: 'ai-welcome',
      content: '你好！我是 AI 助手，有什么可以帮你的吗？ 😊',
      type: 'text',
      sender: 'other',
      timestamp: Date.now() - 60_000,
      username: 'AI 助手',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    },
  ])

  // ===== 事件日志 =====
  interface EventLog {
    time: string
    event: string
    type: 'default' | 'success' | 'info' | 'warning' | 'error'
    detail?: string
  }
  const eventLogs = ref<EventLog[]>([])

  /** 添加事件日志 */
  function addLog(
    event: string,
    type: EventLog['type'] = 'default',
    detail?: string
  ) {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    eventLogs.value.push({ time, event, type, detail })
  }

  let msgId = 100

  // ===== IM 模式事件 =====
  const handleSend = (content: string) => {
    const id = `msg-${++msgId}`
    const newMsg: ChatMessage = {
      id,
      content,
      type: 'text',
      sender: 'self',
      timestamp: Date.now(),
      status: 'sending',
    }

    if (!messagesMap.value[currentContactId.value]) {
      messagesMap.value[currentContactId.value] = []
    }
    messagesMap.value[currentContactId.value].push(newMsg)
    addLog('send', 'success', `"${content.slice(0, 30)}"`)

    // 模拟发送成功
    setTimeout(() => {
      newMsg.status = 'sent'
    }, 500)

    // 模拟自动回复
    setTimeout(() => {
      const replyId = `msg-${++msgId}`
      const contact = DEMO_CONTACTS.find(c => c.id === currentContactId.value)
      messagesMap.value[currentContactId.value].push({
        id: replyId,
        content: getRandomReply(),
        type: 'text',
        sender: 'other',
        timestamp: Date.now(),
        username: contact?.name || '未知',
        avatar: contact?.avatar,
      })
      addLog('receive', 'info', '收到自动回复')
    }, 1500)
  }

  const handleSelectContact = (id: string) => {
    currentContactId.value = id
    const name = DEMO_CONTACTS.find(c => c.id === id)?.name
    addLog('select-contact', 'info', name)
  }

  const handleImagePreview = (url: string) => {
    addLog('image-preview', 'info', url)
    message.info('图片预览: ' + url)
  }

  const handleFileClick = (msg: ChatMessage) => {
    addLog('file-click', 'info', msg.fileName)
    message.info('文件下载: ' + (msg.fileName || '未知文件'))
  }

  const handleFileUpload = () => {
    addLog('file-upload', 'warning', '打开文件选择器')
    message.info('文件上传功能演示')
  }

  const handleEmojiClick = () => {
    addLog('emoji-click', 'info', '打开表情面板')
    message.info('表情功能演示')
  }

  // ===== AI 模式事件 =====
  const handleAiSend = (content: string) => {
    const id = `ai-msg-${++msgId}`
    aiMessages.value.push({
      id,
      content,
      type: 'text',
      sender: 'self',
      timestamp: Date.now(),
      status: 'sent',
    })
    addLog('ai-send', 'success', `"${content.slice(0, 30)}"`)

    // 模拟 AI 回复
    setTimeout(() => {
      aiMessages.value.push({
        id: `ai-reply-${++msgId}`,
        content: getRandomReply(),
        type: 'text',
        sender: 'other',
        timestamp: Date.now(),
        username: 'AI 助手',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
      })
      addLog('ai-reply', 'info', '收到 AI 回复')
    }, 1200)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
