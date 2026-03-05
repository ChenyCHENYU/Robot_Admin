<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_Chat\index.vue
 * @Description: C_Chat — 通用聊天组件
 *
 * 支持联系人列表 + 消息气泡 + 输入框，可用于 IM、客服、AI 对话等场景。
 * 通过 CSS 变量可完全自定义主题风格。
 *
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="c-chat">
    <!-- ===== 联系人侧栏 ===== -->
    <aside
      v-if="mergedProps.showContacts && contactList.length"
      class="c-chat__sidebar"
    >
      <div class="c-chat__sidebar-header">
        <C_Icon
          name="mdi:chat-outline"
          :size="20"
        />
        会话
      </div>

      <!-- 搜索框 -->
      <div class="c-chat__search">
        <NInput
          v-model:value="searchKeyword"
          placeholder="搜索联系人"
          clearable
          size="small"
        >
          <template #prefix>
            <C_Icon
              name="mdi:magnify"
              :size="16"
            />
          </template>
        </NInput>
      </div>

      <!-- 联系人列表 -->
      <div class="c-chat__contact-list">
        <div
          v-for="contact in filteredContacts"
          :key="contact.id"
          class="c-chat__contact"
          :class="{ 'is-active': contact.id === currentId }"
          @click="handleSelectContact(contact.id)"
        >
          <div class="c-chat__contact-avatar">
            <img
              v-if="contact.avatar"
              :src="contact.avatar"
              :alt="contact.name"
              class="c-chat__avatar"
            />
            <div
              v-else
              class="c-chat__avatar-fallback"
            >
              {{ contact.name.charAt(0) }}
            </div>
            <span
              v-if="contact.online"
              class="c-chat__online-dot"
            />
          </div>

          <div class="c-chat__contact-info">
            <div class="c-chat__contact-name">
              <span>{{ contact.name }}</span>
              <span
                v-if="contact.lastTime"
                class="c-chat__contact-time"
              >
                {{ formatContactTime(contact.lastTime) }}
              </span>
            </div>
            <div
              v-if="contact.lastMessage"
              class="c-chat__contact-last"
            >
              {{ contact.lastMessage }}
            </div>
          </div>

          <span
            v-if="contact.unread"
            class="c-chat__unread"
          >
            {{ contact.unread > 99 ? '99+' : contact.unread }}
          </span>
        </div>
      </div>
    </aside>

    <!-- ===== 主聊天区域 ===== -->
    <div
      v-if="currentContact || !mergedProps.showContacts"
      class="c-chat__main"
    >
      <!-- 顶栏 -->
      <div class="c-chat__header">
        <slot name="header">
          <span>{{ currentContact?.name || mergedProps.title }}</span>
          <span
            v-if="currentContact?.online"
            class="c-chat__header-status"
          >
            在线
          </span>
        </slot>
      </div>

      <!-- 消息列表 -->
      <div
        ref="messagesRef"
        class="c-chat__messages"
      >
        <!-- 加载更多 -->
        <div
          v-if="mergedProps.loadingHistory"
          class="c-chat__load-more"
        >
          <NSpin size="small" />
        </div>

        <!-- 消息为空 -->
        <div
          v-if="!messageList.length && !mergedProps.loadingHistory"
          class="c-chat__empty"
        >
          暂无消息，发送第一条吧
        </div>

        <!-- 消息列表 -->
        <template
          v-for="(msg, idx) in messageList"
          :key="msg.id"
        >
          <!-- 时间分割 -->
          <div
            v-if="shouldShowTimeDivider(msg, idx)"
            class="c-chat__time-divider"
          >
            {{ formatMessageTime(msg.timestamp) }}
          </div>

          <!-- 消息条目 -->
          <div
            class="c-chat__msg"
            :class="`is-${msg.sender}`"
          >
            <!-- 头像 -->
            <div
              v-if="msg.sender !== 'system'"
              class="c-chat__msg-avatar"
            >
              <img
                v-if="getAvatar(msg)"
                :src="getAvatar(msg)"
                class="c-chat__avatar"
              />
              <div
                v-else
                class="c-chat__avatar-fallback"
              >
                {{ getUsername(msg).charAt(0) }}
              </div>
            </div>

            <!-- 消息体 -->
            <div class="c-chat__msg-body">
              <span
                v-if="msg.sender === 'other' && msg.username"
                class="c-chat__msg-username"
              >
                {{ msg.username }}
              </span>

              <!-- 文本消息 -->
              <div
                v-if="msg.type === 'text' || msg.type === 'system'"
                class="c-chat__bubble"
              >
                {{ msg.content }}
              </div>

              <!-- 图片消息 -->
              <img
                v-else-if="msg.type === 'image'"
                :src="msg.content"
                class="c-chat__msg-image"
                @click="emit('image-preview', msg.content)"
              />

              <!-- 文件消息 -->
              <div
                v-else-if="msg.type === 'file'"
                class="c-chat__msg-file"
                @click="emit('file-click', msg)"
              >
                <C_Icon
                  name="mdi:file-document-outline"
                  :size="28"
                />
                <div class="c-chat__file-info">
                  <span class="c-chat__file-name">{{
                    msg.fileName || '文件'
                  }}</span>
                  <span
                    v-if="msg.fileSize"
                    class="c-chat__file-size"
                  >
                    {{ formatFileSize(msg.fileSize) }}
                  </span>
                </div>
              </div>

              <!-- 时间戳 -->
              <span
                v-if="mergedProps.showTimestamp && msg.sender !== 'system'"
                class="c-chat__msg-time"
              >
                {{ formatTime(msg.timestamp) }}
              </span>

              <!-- 发送状态 -->
              <span
                v-if="msg.sender === 'self' && msg.status"
                class="c-chat__msg-status"
                :class="`is-${msg.status}`"
                @click="msg.status === 'failed' && emit('resend', msg)"
              >
                {{
                  msg.status === 'sending'
                    ? '发送中...'
                    : msg.status === 'failed'
                      ? '发送失败，点击重试'
                      : ''
                }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- 输入区域 -->
      <div class="c-chat__input-area">
        <div class="c-chat__input-actions">
          <slot name="input-actions">
            <NButton
              quaternary
              circle
              size="small"
              @click="emit('emoji-click')"
            >
              <template #icon>
                <C_Icon
                  name="mdi:emoticon-happy-outline"
                  :size="18"
                />
              </template>
            </NButton>
            <NButton
              quaternary
              circle
              size="small"
              @click="emit('file-upload')"
            >
              <template #icon>
                <C_Icon
                  name="mdi:paperclip"
                  :size="18"
                />
              </template>
            </NButton>
          </slot>
        </div>

        <div class="c-chat__input-wrap">
          <NInput
            v-model:value="inputText"
            :placeholder="mergedProps.placeholder"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            @keydown.enter.exact.prevent="handleSend"
          />
        </div>

        <NButton
          v-if="mergedProps.showSendBtn"
          type="primary"
          :disabled="!inputText.trim()"
          class="c-chat__send-btn"
          @click="handleSend"
        >
          <template #icon>
            <C_Icon
              name="mdi:send"
              :size="16"
            />
          </template>
        </NButton>
      </div>
    </div>

    <!-- ===== 未选中联系人空态 ===== -->
    <div
      v-else
      class="c-chat__main c-chat__no-chat"
    >
      <C_Icon
        name="mdi:chat-processing-outline"
        :size="48"
        class="c-chat__no-chat-icon"
      />
      <span>选择一个会话开始聊天</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    DEFAULT_CHAT_PROPS,
    type ChatProps,
    type ChatMessage,
    type ChatContact,
  } from './types'

  // ===== Props & Emits =====
  const props = withDefaults(defineProps<ChatProps>(), {
    contacts: () => [],
    messages: () => [],
    currentContactId: '',
    placeholder: DEFAULT_CHAT_PROPS.placeholder,
    showContacts: DEFAULT_CHAT_PROPS.showContacts,
    showTimestamp: DEFAULT_CHAT_PROPS.showTimestamp,
    showSendBtn: DEFAULT_CHAT_PROPS.showSendBtn,
    loadingHistory: DEFAULT_CHAT_PROPS.loadingHistory,
    title: DEFAULT_CHAT_PROPS.title,
    selfAvatar: '',
    selfName: '',
  })

  const emit = defineEmits<{
    (e: 'send', content: string): void
    (e: 'select-contact', id: string): void
    (e: 'load-more'): void
    (e: 'image-preview', url: string): void
    (e: 'file-click', msg: ChatMessage): void
    (e: 'file-upload'): void
    (e: 'emoji-click'): void
    (e: 'resend', msg: ChatMessage): void
  }>()

  // ===== 合并 Props =====
  const mergedProps = computed(() => ({
    ...DEFAULT_CHAT_PROPS,
    ...props,
  }))

  // ===== 内部状态 =====
  const inputText = ref('')
  const searchKeyword = ref('')
  const messagesRef = ref<HTMLElement | null>(null)

  // ===== 计算属性 =====
  const contactList = computed<ChatContact[]>(() => props.contacts ?? [])
  const messageList = computed<ChatMessage[]>(() => props.messages ?? [])

  const currentId = computed(
    () => props.currentContactId || contactList.value[0]?.id || ''
  )

  const currentContact = computed(() =>
    contactList.value.find(c => c.id === currentId.value)
  )

  const filteredContacts = computed(() => {
    if (!searchKeyword.value) return contactList.value
    const kw = searchKeyword.value.toLowerCase()
    return contactList.value.filter(c => c.name.toLowerCase().includes(kw))
  })

  // ===== 方法 =====
  const handleSelectContact = (id: string) => {
    emit('select-contact', id)
  }

  const handleSend = () => {
    const text = inputText.value.trim()
    if (!text) return
    emit('send', text)
    inputText.value = ''
  }

  /** 自动滚动到底部 */
  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }

  // 消息变化时自动滚动
  watch(
    () => props.messages?.length,
    () => scrollToBottom(),
    { flush: 'post' }
  )

  // ===== 工具函数 =====
  const getAvatar = (msg: ChatMessage) => {
    if (msg.sender === 'self') return props.selfAvatar || msg.avatar
    return msg.avatar
  }

  const getUsername = (msg: ChatMessage) => {
    if (msg.sender === 'self') return props.selfName || msg.username || 'Me'
    return msg.username || '未知'
  }

  const formatTime = (ts: string | number) => {
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const formatMessageTime = (ts: string | number) => {
    const d = new Date(ts)
    const now = new Date()
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    if (isToday) return formatTime(ts)
    return `${d.getMonth() + 1}/${d.getDate()} ${formatTime(ts)}`
  }

  const formatContactTime = (ts: string | number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return '刚刚'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
    if (diff < 86_400_000) return formatTime(ts)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1048576).toFixed(1)}MB`
  }

  /** 是否显示时间分割线（两条消息间超过 5 分钟） */
  const shouldShowTimeDivider = (msg: ChatMessage, idx: number) => {
    if (idx === 0) return true
    const prev = messageList.value[idx - 1]
    const curr = new Date(msg.timestamp).getTime()
    const prevTime = new Date(prev.timestamp).getTime()
    return curr - prevTime > 5 * 60 * 1000
  }

  // ===== 暴露方法 =====
  defineExpose({ scrollToBottom })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
