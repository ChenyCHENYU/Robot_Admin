<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\49-chat\index.vue
 * @Description: 工程协作台，消息、附件和脚本助手的可交互演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="conversation-workspace">
    <header class="conversation-heading"
      ><div
        ><span class="eyebrow">COMMUNICATION / C_CHAT</span><h1>工程协作台</h1
        ><p>让讨论有上下文，让消息有回应。</p></div
      ><div class="conversation-mode"
        ><button
          type="button"
          :class="{ active: mode === 'team' }"
          :aria-pressed="mode === 'team'"
          @click="mode = 'team'"
          >协作会话</button
        ><button
          type="button"
          :class="{ active: mode === 'assistant' }"
          :aria-pressed="mode === 'assistant'"
          @click="mode = 'assistant'"
          >脚本助手</button
        ></div
      ></header
    >
    <div class="conversation-layout">
      <section class="conversation-panel">
        <div class="conversation-status"
          ><span><i />本地演示会话</span
          ><span>{{
            mode === 'team'
              ? '按会话独立保存消息'
              : '预设规则回复，未接入 AI 服务'
          }}</span></div
        >
        <div class="conversation-canvas"
          ><C_Chat
            :key="mode"
            :contacts="mode === 'team' ? contacts : []"
            :messages="currentMessages"
            :current-contact-id="currentContactId"
            :show-contacts="mode === 'team'"
            :title="mode === 'assistant' ? '脚本助手 · 交互预览' : '工程协作'"
            :self-avatar="SELF_AVATAR"
            self-name="我"
            placeholder="输入消息，Enter 发送"
            @send="send"
            @select-contact="currentContactId = $event"
            @file-upload="fileInput?.click()"
            @file-click="downloadAttachment"
            @image-preview="previewImage = $event"
            @emoji-click="message.info('可以在输入框使用系统表情键盘')"
        /></div>
      </section>
      <aside class="conversation-context"
        ><span class="eyebrow">CONVERSATION CONTEXT</span
        ><h2>{{ mode === 'team' ? currentContact?.name : '脚本助手' }}</h2
        ><p
          >这是可交互的消息组件预览。你可以发送消息、添加本地附件，观察不同会话的状态。</p
        >
        <dl
          ><div
            ><dt>当前消息</dt
            ><dd>{{
              currentMessages.filter(item => item.type !== 'system').length
            }}</dd></div
          ><div
            ><dt>本地附件</dt><dd>{{ attachments.size }}</dd></div
          ></dl
        >
        <label class="reply-toggle"
          ><span>演示自动回复</span
          ><NSwitch
            v-model:value="autoReply"
            size="small"
        /></label>
        <div class="conversation-starters"
          ><span class="eyebrow">试着聊一聊</span
          ><button
            v-for="starter in STARTERS"
            :key="starter"
            type="button"
            @click="send(starter)"
            ><span>{{ starter }}</span
            ><span class="i-mdi:arrow-top-right" /></button
        ></div>
        <div class="conversation-events"
          ><span class="eyebrow">本次交互</span
          ><p v-if="!events.length">发送第一条消息，开始体验。</p
          ><ul v-else
            ><li
              v-for="(event, index) in events.slice(-4).reverse()"
              :key="index"
              ><span class="i-mdi:check-circle-outline" />{{ event }}</li
            ></ul
          ></div
        >
        <p class="conversation-note"
          >附件在本机处理，切换会话不会串消息。刷新页面会重置演示。</p
        >
      </aside>
    </div>
    <input
      ref="fileInput"
      type="file"
      hidden
      @change="addAttachment"
    />
    <NModal
      :show="Boolean(previewImage)"
      @update:show="previewImage = ''"
      ><div class="image-preview"
        ><img
          :src="previewImage"
          alt="消息中的图片"
        /><NButton @click="previewImage = ''">关闭预览</NButton></div
      ></NModal
    >
  </div>
</template>
<script setup lang="ts">
  import type { ChatMessage } from '@robot-admin/naive-ui-components'
  import {
    DEMO_CONTACTS,
    SELF_AVATAR,
    STARTERS,
    createMessages,
    getDemoReply,
  } from './data'
  defineOptions({ name: 'Demo49Chat' })
  const message = useMessage()
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
  const attachments = reactive(new Map<string, File>())
  const fileInput = ref<HTMLInputElement>()
  const previewImage = ref('')
  const urls = new Set<string>()
  const timers = new Set<ReturnType<typeof setTimeout>>()

  /** 接受消息并在所属会话中生成预设回复。 */
  const send = (content: string) => {
    if (!content.trim()) return
    const key = activeKey.value
    messages.value[key].push({
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        type: 'text',
        sender: 'other',
        content: getDemoReply(content),
        timestamp: Date.now(),
        username: contact?.name || '脚本助手',
        avatar: contact?.avatar,
      })
    }, 600)
    timers.add(timer)
  }
  /** 用户自行选择的附件只通过浏览器本地对象参与演示。 */
  const addAttachment = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      message.warning('演示附件限 10 MB')
      return
    }
    const id = crypto.randomUUID()
    attachments.set(id, file)
    const url = URL.createObjectURL(file)
    urls.add(url)
    messages.value[activeKey.value].push({
      id,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      content: url,
      sender: 'self',
      timestamp: Date.now(),
      status: 'sent',
      fileName: file.name,
      fileSize: file.size,
    })
    events.value.push('本地附件已加入当前会话')
  }
  /** 下载当前用户添加的附件，文件不会上传到服务器。 */
  const downloadAttachment = (item: ChatMessage) => {
    const file = attachments.get(item.id)
    if (!file) {
      message.info('附件已失效，请重新添加')
      return
    }
    const link = document.createElement('a')
    link.href = item.content
    link.download = file.name
    link.click()
  }
  /** 停止隐藏或卸载页面上的延迟演示回复。 */
  const cancelReplies = () => {
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  }
  onDeactivated(cancelReplies)
  onUnmounted(() => {
    cancelReplies()
    for (const url of urls) URL.revokeObjectURL(url)
    urls.clear()
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
