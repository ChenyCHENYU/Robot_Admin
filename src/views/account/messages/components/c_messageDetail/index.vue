<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 独立按需加载的消息详情与业务办理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NDrawer
    :show="!!id"
    width="min(620px, 100vw)"
    placement="right"
    class="message-detail-drawer"
    @update:show="!$event && emit('close')"
  >
    <NDrawerContent
      title="消息详情"
      closable
    >
      <NSpin :show="loading">
        <NResult
          v-if="error"
          status="error"
          title="详情加载失败"
          :description="error"
        >
          <template #footer><NButton @click="load">重新加载</NButton></template>
        </NResult>
        <article
          v-else-if="detail"
          class="message-detail"
        >
          <NAlert
            v-if="readError"
            type="warning"
            class="read-sync-warning"
          >
            正文已加载，已读状态尚未同步：{{ readError }}
            <NButton
              text
              type="primary"
              :loading="readSyncing"
              @click="retryRead"
              >重试同步</NButton
            >
          </NAlert>
          <NSpace
            ><NTag
              :bordered="false"
              size="small"
              >{{ getOptionLabel(CATEGORY_OPTIONS, detail.category) }}</NTag
            ><NTag
              :bordered="false"
              type="info"
              size="small"
              >{{ getMessageState(detail) }}</NTag
            ><NTag
              v-if="detail.starred"
              :bordered="false"
              type="warning"
              size="small"
              >星标</NTag
            ></NSpace
          >
          <h2>{{ detail.title }}</h2>
          <p class="detail-meta"
            >{{ detail.source }} · {{ formatMessageTime(detail.createdAt) }}</p
          >
          <!-- 富文本只允许应用白名单正文标记，外部样式、图片与脚本均移除。 -->
          <div
            v-if="detail.contentType === 'html'"
            class="message-body"
            v-html="sanitizeNotificationHtml(detail.content)"
          />
          <div
            v-else
            class="message-body message-body--text"
            >{{ detail.content }}</div
          >
          <section
            v-if="detail.attachments?.length"
            class="detail-attachments"
          >
            <h3>附件</h3>
            <NList bordered>
              <NListItem
                v-for="attachment in detail.attachments"
                :key="attachment.id"
              >
                {{ attachment.name }}
                <template #suffix
                  ><NButton
                    size="small"
                    :loading="downloadBusy === attachment.id"
                    :disabled="!!downloadBusy && downloadBusy !== attachment.id"
                    @click="downloadAttachment(attachment)"
                    >{{
                      store.mode === 'demo' ? '下载演示凭证' : '下载'
                    }}</NButton
                  ></template
                >
              </NListItem>
            </NList>
            <NText
              v-if="store.mode === 'demo'"
              depth="3"
              >演示附件生成本地文本凭证，不访问外部文件。</NText
            >
          </section>
          <NAlert
            v-if="detail.kind === 'task'"
            :type="detail.taskStatus === 'done' ? 'success' : 'warning'"
            :show-icon="true"
          >
            {{
              detail.taskStatus === 'done'
                ? '此待办已完成。阅读状态与办理状态分别记录。'
                : '此消息需要办理。打开详情仅标记已读，完成办理需单独确认。'
            }}
          </NAlert>
          <div class="detail-actions">
            <NButton
              :disabled="busy"
              @click="change(detail.starred ? 'unstar' : 'star')"
              >{{ detail.starred ? '取消星标' : '添加星标' }}</NButton
            >
            <NButton
              :disabled="busy"
              @click="change(detail.archivedAt ? 'unarchive' : 'archive')"
              >{{ detail.archivedAt ? '移回收件箱' : '归档' }}</NButton
            >
            <NButton
              v-if="detail.target?.type === 'route'"
              type="primary"
              :disabled="busy"
              @click="emit('action', detail)"
              >打开相关业务</NButton
            >
            <NButton
              v-if="detail.kind === 'task' && detail.taskStatus === 'pending'"
              type="primary"
              :loading="busy"
              @click="confirmComplete"
              >确认完成待办</NButton
            >
          </div>
        </article>
        <NEmpty
          v-else-if="!loading"
          description="暂无详情"
        />
      </NSpin>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
  import type { NotificationRecord } from '@/api/notifications.contract'
  import { useMessageDetail } from './useMessageDetail'

  defineOptions({ name: 'AccountMessageDetail' })
  const props = defineProps<{ id: string | null }>()
  const emit = defineEmits<{
    close: []
    action: [record: NotificationRecord]
  }>()
  const {
    store,
    detail,
    loading,
    busy,
    error,
    readError,
    readSyncing,
    retryRead,
    downloadBusy,
    load,
    change,
    confirmComplete,
    downloadAttachment,
    CATEGORY_OPTIONS,
    formatMessageTime,
    getMessageState,
    getOptionLabel,
    sanitizeNotificationHtml,
  } = useMessageDetail(props)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
