<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 独立按需加载的消息详情与业务办理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NDrawer
    :show="!!id"
    width="min(760px, 100vw)"
    placement="right"
    class="message-detail-drawer"
    @update:show="!$event && emit('close')"
  >
    <NDrawerContent
      :title="workflow ? '审批详情' : '消息详情'"
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
          <div class="detail-heading">
            <span
              class="detail-heading-icon"
              :class="getNotificationIcon(detail)"
              aria-hidden="true"
            />
            <div class="detail-heading-copy">
              <div class="detail-labels"
                ><NTag
                  :bordered="false"
                  :type="workflow ? 'info' : 'default'"
                  size="small"
                  >{{
                    getNotificationTopicLabel(getNotificationTopic(detail))
                  }}</NTag
                ><NTag
                  :bordered="false"
                  size="small"
                  :type="detail.readAt ? 'default' : 'info'"
                  >{{ detail.readAt ? '已读' : '未读' }}</NTag
                ><NTag
                  v-if="detail.starred"
                  :bordered="false"
                  type="warning"
                  size="small"
                  >星标</NTag
                ><NTag
                  v-if="detail.archivedAt"
                  :bordered="false"
                  size="small"
                  >已归档</NTag
                ></div
              >
              <h2>{{ detail.title }}</h2>
              <p class="detail-meta"
                >{{ detail.source }}<span>·</span
                >{{ formatMessageTime(detail.createdAt) }}</p
              >
            </div>
          </div>
          <div class="detail-summary-strip"
            ><span>消息分类</span
            ><NTag
              :bordered="false"
              size="small"
              >{{ getOptionLabel(CATEGORY_OPTIONS, detail.category) }}</NTag
            ><span class="summary-strip-divider" /><span>优先级</span
            ><NTag
              :bordered="false"
              :type="getNotificationPriorityTone(detail.priority)"
              size="small"
              >{{ getNotificationPriorityLabel(detail.priority) }}</NTag
            ></div
          >
          <section
            v-if="workflow"
            class="workflow-overview"
            aria-label="流程信息"
          >
            <header class="detail-section-heading"
              ><h3>流程信息</h3
              ><NTag
                :bordered="false"
                size="small"
                :type="getNotificationWorkflowTone(workflow.status)"
                >{{ getNotificationWorkflowLabel(workflow.status) }}</NTag
              ></header
            >
            <dl class="workflow-info-grid">
              <div
                ><dt>流程名称</dt><dd>{{ workflow.processName }}</dd></div
              >
              <div
                ><dt>业务单号</dt
                ><dd class="workflow-business-no">{{
                  workflow.businessNo
                }}</dd></div
              >
              <div
                ><dt>发起人</dt><dd>{{ workflow.initiator }}</dd></div
              >
              <div
                ><dt>当前节点</dt><dd>{{ workflow.currentNode }}</dd></div
              >
              <div
                ><dt>参与关系</dt
                ><dd>{{
                  getNotificationWorkflowRelationLabel(workflow.relationship)
                }}</dd></div
              >
              <div v-if="workflow.dueAt"
                ><dt>截止时间</dt
                ><dd :class="{ 'is-overdue': isOverdue }"
                  >{{ formatMessageTime(workflow.dueAt)
                  }}<span
                    v-if="isOverdue"
                    class="workflow-overdue-badge"
                    >已逾期</span
                  ></dd
                ></div
              >
            </dl>
            <p
              v-if="store.mode === 'demo'"
              class="workflow-demo-note"
              ><span
                class="i-mdi-code-braces"
                aria-hidden="true"
              />本地审批演示 · 操作会保存到当前账户的演示数据</p
            >
          </section>
          <section
            class="detail-content-section"
            aria-label="消息正文"
            ><h3>{{ workflow ? '申请说明' : '消息内容' }}</h3>
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
          </section>
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
          <section
            v-if="workflow"
            class="workflow-history"
            aria-label="审批时间线"
          >
            <header class="detail-section-heading"
              ><h3>审批动态</h3
              ><span>{{ workflow.history.length }} 条记录</span></header
            >
            <ol
              v-if="workflow.history.length"
              class="workflow-timeline"
            >
              <li
                v-for="entry in workflow.history"
                :key="entry.id"
                :class="`workflow-event--${entry.action}`"
              >
                <span
                  class="workflow-timeline-dot"
                  aria-hidden="true"
                />
                <div class="workflow-event-heading"
                  ><strong>{{ historyLabels[entry.action] }}</strong
                  ><time :datetime="entry.at">{{
                    formatMessageTime(entry.at)
                  }}</time></div
                >
                <p class="workflow-event-meta"
                  >{{ entry.actor }}<span>·</span>{{ entry.node }}</p
                >
                <p
                  v-if="entry.comment"
                  class="workflow-event-comment"
                  >{{ entry.comment }}</p
                >
              </li>
            </ol>
            <NEmpty
              v-else
              size="small"
              description="暂无审批动态"
            />
          </section>
          <NAlert
            v-if="commandError"
            :type="syncRequired ? 'warning' : 'error'"
            class="command-warning"
            role="alert"
          >
            {{ commandError
            }}<NButton
              v-if="syncRequired"
              text
              type="primary"
              :loading="busy"
              @click="retryCommandSync"
              >重试同步详情</NButton
            >
          </NAlert>
          <section
            v-if="workflow"
            class="workflow-handling"
            aria-label="审批办理"
          >
            <template v-if="workflowActions.length">
              <header class="detail-section-heading"
                ><h3>{{
                  workflow.relationship === 'initiator'
                    ? '申请操作'
                    : '审批办理'
                }}</h3
                ><span>提交后记录操作历史</span></header
              >
              <label
                class="workflow-comment-label"
                for="workflow-comment"
                >{{
                  workflow.relationship === 'initiator'
                    ? '撤回说明'
                    : '审批意见'
                }}<span>{{
                  workflow.relationship === 'initiator'
                    ? '选填'
                    : '驳回、退回时必填'
                }}</span></label
              >
              <NInput
                v-model:value="workflowComment"
                :input-props="{
                  id: 'workflow-comment',
                  'aria-label':
                    workflow.relationship === 'initiator'
                      ? '撤回说明'
                      : '审批意见',
                }"
                type="textarea"
                :maxlength="1000"
                show-count
                :autosize="{ minRows: 3, maxRows: 7 }"
                :disabled="busy || readSyncing"
                placeholder="填写办理意见，便于后续跟踪与审计"
              />
              <div class="workflow-action-buttons"
                ><NButton
                  v-for="action in workflowActions"
                  :key="action"
                  :type="
                    action === 'approve'
                      ? 'primary'
                      : action === 'reject'
                        ? 'error'
                        : 'default'
                  "
                  :secondary="action === 'reject'"
                  :loading="busy"
                  :disabled="readSyncing"
                  @click="confirmWorkflow(action)"
                  >{{ WORKFLOW_LABELS[action] }}</NButton
                ></div
              >
            </template>
            <div
              v-else
              class="workflow-readonly-note"
              ><span
                class="i-mdi-eye"
                aria-hidden="true"
              /><span>{{
                workflow.status !== 'pending'
                  ? `流程${getNotificationWorkflowLabel(workflow.status)}，可查看审批结果与历史记录。`
                  : workflow.relationship === 'cc'
                    ? '此消息为抄送通知，可查看流程进度，无需执行审批。'
                    : detail.archivedAt
                      ? '此消息已归档，请先移回收件箱后办理。'
                      : syncRequired
                        ? '请先同步最新详情，再继续办理。'
                        : '当前消息服务未开放审批办理，可查看流程信息。'
              }}</span></div
            >
          </section>
          <section
            v-else-if="detail.kind === 'task'"
            class="task-handling"
            aria-label="待办办理"
          >
            <header class="detail-section-heading"
              ><h3>待办办理</h3
              ><NTag
                size="small"
                :bordered="false"
                :type="getNotificationTaskTone(detail.taskStatus)"
                >{{ getNotificationTaskLabel(detail.taskStatus) }}</NTag
              ></header
            >
            <p>{{ taskDescription }}</p>
            <div
              v-if="taskActions.length"
              class="workflow-action-buttons"
              ><NButton
                v-for="action in taskActions"
                :key="action"
                :type="action === 'complete-task' ? 'primary' : 'default'"
                :loading="busy"
                :disabled="readSyncing"
                @click="confirmTask(action)"
                >{{ TASK_LABELS[action] }}</NButton
              ></div
            >
          </section>
          <div class="detail-actions">
            <NButton
              :disabled="busy || syncRequired"
              @click="change(detail.starred ? 'unstar' : 'star')"
              >{{ detail.starred ? '取消星标' : '添加星标' }}</NButton
            >
            <NButton
              :disabled="busy || syncRequired"
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
    confirmTask,
    confirmWorkflow,
    workflowComment,
    workflowActions,
    taskActions,
    commandError,
    syncRequired,
    retryCommandSync,
    WORKFLOW_LABELS,
    TASK_LABELS,
    downloadAttachment,
    CATEGORY_OPTIONS,
    formatMessageTime,
    getOptionLabel,
    sanitizeNotificationHtml,
    workflow,
    isOverdue,
    taskDescription,
    historyLabels,
    getNotificationIcon,
    getNotificationTopic,
    getNotificationTopicLabel,
    getNotificationTaskLabel,
    getNotificationTaskTone,
    getNotificationWorkflowLabel,
    getNotificationWorkflowTone,
    getNotificationWorkflowRelationLabel,
    getNotificationPriorityLabel,
    getNotificationPriorityTone,
  } = useMessageDetail(props)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
