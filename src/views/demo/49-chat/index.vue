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
    <c_vTitle
      title="聊天组件场景示例"
      icon="mdi:chat-outline"
      description="支持 IM 模式、AI 模式，包含消息发送、图片预览、文件传输、表情等特性"
    />

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
  </div>
</template>

<script setup lang="ts">
  import type { ChatMessage } from '@robot-admin/naive-ui-components'
  import {
    DEMO_CONTACTS,
    DEMO_MESSAGES,
    DEMO_SCENES,
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
    }, 1500)
  }

  const handleSelectContact = (id: string) => {
    currentContactId.value = id
  }

  const handleImagePreview = (url: string) => {
    message.info('图片预览: ' + url)
  }

  const handleFileClick = (msg: ChatMessage) => {
    message.info('文件下载: ' + (msg.fileName || '未知文件'))
  }

  const handleFileUpload = () => {
    message.info('文件上传功能演示')
  }

  const handleEmojiClick = () => {
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
    }, 1200)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
