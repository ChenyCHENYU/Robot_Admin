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
        ><span class="eyebrow">TEAM MESSAGES</span><h1>工程协作台</h1
        ><p>让讨论有上下文，让消息有回应。</p></div
      ><div class="conversation-mode"
        ><button
          type="button"
          :class="{ active: conversation.mode === 'team' }"
          :aria-pressed="conversation.mode === 'team'"
          @click="conversation.mode = 'team'"
          >协作会话</button
        ><button
          type="button"
          :class="{ active: conversation.mode === 'assistant' }"
          :aria-pressed="conversation.mode === 'assistant'"
          @click="conversation.mode = 'assistant'"
          >脚本助手</button
        ></div
      ></header
    >
    <div class="conversation-layout">
      <section class="conversation-panel">
        <div class="conversation-status"
          ><span><i />本地演示会话</span
          ><span>{{
            conversation.mode === 'team'
              ? '按会话独立保存消息'
              : '预设规则回复，未接入 AI 服务'
          }}</span></div
        >
        <div class="conversation-canvas"
          ><C_Chat
            :key="conversation.mode"
            :contacts="
              conversation.mode === 'team' ? conversation.contacts : []
            "
            :messages="conversation.currentMessages"
            :current-contact-id="conversation.currentContactId"
            :show-contacts="conversation.mode === 'team'"
            :title="
              conversation.mode === 'assistant'
                ? '脚本助手 · 交互预览'
                : '工程协作'
            "
            :self-avatar="SELF_AVATAR"
            self-name="我"
            placeholder="输入消息，Enter 发送"
            @send="conversation.send"
            @select-contact="conversation.currentContactId = $event"
            @file-upload="fileInput?.click()"
            @file-click="attachments.download"
            @image-preview="previewImage = $event"
            @source-click="openSource"
            @emoji-click="message.info('可以在输入框使用系统表情键盘')"
          >
            <template
              v-if="conversation.mode === 'assistant'"
              #message="{ message: reply }"
            >
              <div v-if="reply.sources?.length">
                <NText depth="3">规则回复</NText>
                <div>{{ reply.content }}</div>
              </div>
            </template>
          </C_Chat></div
        >
      </section>
      <aside class="conversation-context"
        ><span class="eyebrow">当前会话</span
        ><div class="conversation-identity"
          ><img
            :src="
              conversation.mode === 'team'
                ? conversation.currentContact?.avatar
                : SELF_AVATAR
            "
            alt="会话头像"
          /><span>当前页面内的演示会话</span></div
        ><h2>{{
          conversation.mode === 'team'
            ? conversation.currentContact?.name
            : '脚本助手'
        }}</h2
        ><p>围绕一个主题交流，消息与附件按会话独立保留。</p>
        <dl
          ><div
            ><dt>当前消息</dt
            ><dd>{{
              conversation.currentMessages.filter(
                item => item.type !== 'system'
              ).length
            }}</dd></div
          ><div
            ><dt>本地附件</dt><dd>{{ attachments.count }}</dd></div
          ></dl
        >
        <label class="reply-toggle"
          ><span>演示自动回复</span
          ><NSwitch
            v-model:value="conversation.autoReply"
            size="small"
        /></label>
        <NButton
          class="conversation-attach"
          size="small"
          block
          @click="fileInput?.click()"
          ><template #icon><span class="i-mdi-paperclip" /></template
          >添加本地附件</NButton
        ><div class="conversation-starters"
          ><span class="eyebrow">试着聊一聊</span
          ><button
            v-for="starter in STARTERS"
            :key="starter"
            type="button"
            @click="conversation.send(starter)"
            ><span>{{ starter }}</span
            ><span class="i-mdi:arrow-top-right" /></button
        ></div>
        <div class="conversation-events"
          ><span class="eyebrow">本次交互</span
          ><p v-if="!conversation.events.length">发送第一条消息，开始体验。</p
          ><ul v-else
            ><li
              v-for="(event, index) in conversation.events.slice(-4).reverse()"
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
      @change="attachments.add"
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
    <NModal
      v-model:show="showSource"
      preset="card"
      :title="ASSISTANT_SOURCE.label"
      class="conversation-source-dialog"
    >
      <ul>
        <li
          v-for="check in ASSISTANT_CHECKS"
          :key="check"
          >{{ check }}</li
        >
      </ul>
    </NModal>
  </div>
</template>
<script setup lang="ts">
  import type { ChatSource } from '@robot-admin/naive-ui-components/C_Chat'
  import {
    ASSISTANT_CHECKS,
    ASSISTANT_SOURCE,
    SELF_AVATAR,
    STARTERS,
  } from './data'
  import { useChatConversation } from './useChatConversation'

  defineOptions({ name: 'Demo49Chat' })
  const message = useMessage()
  const { conversation, attachments } = useChatConversation()
  const fileInput = ref<HTMLInputElement>()
  const previewImage = ref('')
  const showSource = ref(false)

  const openSource = (source: ChatSource) => {
    if (source.id === ASSISTANT_SOURCE.id) showSource.value = true
  }
  onDeactivated(() => {
    showSource.value = false
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
