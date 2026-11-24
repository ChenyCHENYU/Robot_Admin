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
      :title="page.workflow ? '审批详情' : '消息详情'"
      closable
    >
      <NSpin :show="page.loading">
        <NResult
          v-if="page.error"
          status="error"
          title="详情加载失败"
          :description="page.error"
        >
          <template #footer
            ><NButton @click="page.load">重新加载</NButton></template
          >
        </NResult>
        <article
          v-else-if="page.detail"
          class="message-detail"
        >
          <NAlert
            v-if="page.readError"
            type="warning"
            class="read-sync-warning"
          >
            正文已加载，已读状态尚未同步：{{ page.readError }}
            <NButton
              text
              type="primary"
              :loading="page.readSyncing"
              @click="page.retryRead"
              >重试同步</NButton
            >
          </NAlert>
          <div class="detail-heading">
            <span
              class="detail-heading-icon"
              :class="page.getNotificationIcon(page.detail)"
              aria-hidden="true"
            />
            <div class="detail-heading-copy">
              <div class="detail-labels"
                ><NTag
                  :bordered="false"
                  :type="page.workflow ? 'info' : 'default'"
                  size="small"
                  >{{
                    page.getNotificationTopicLabel(
                      page.getNotificationTopic(page.detail)
                    )
                  }}</NTag
                ><NTag
                  :bordered="false"
                  size="small"
                  :type="page.detail.readAt ? 'default' : 'info'"
                  >{{ page.detail.readAt ? '已读' : '未读' }}</NTag
                ><NTag
                  v-if="page.detail.starred"
                  :bordered="false"
                  type="warning"
                  size="small"
                  >星标</NTag
                ><NTag
                  v-if="page.detail.archivedAt"
                  :bordered="false"
                  size="small"
                  >已归档</NTag
                ></div
              >
              <h2>{{ page.detail.title }}</h2>
              <p class="detail-meta"
                >{{ page.detail.source }}<span>·</span
                >{{ page.formatMessageTime(page.detail.createdAt) }}</p
              >
            </div>
          </div>
          <div class="detail-summary-strip"
            ><span>消息分类</span
            ><NTag
              :bordered="false"
              size="small"
              >{{
                page.getOptionLabel(page.CATEGORY_OPTIONS, page.detail.category)
              }}</NTag
            ><span class="summary-strip-divider" /><span>优先级</span
            ><NTag
              :bordered="false"
              :type="page.getNotificationPriorityTone(page.detail.priority)"
              size="small"
              >{{
                page.getNotificationPriorityLabel(page.detail.priority)
              }}</NTag
            ></div
          >
          <section
            v-if="page.workflow"
            class="workflow-overview"
            aria-label="流程信息"
          >
            <header class="detail-section-heading"
              ><h3>流程信息</h3
              ><NSpace
                align="center"
                size="small"
              >
                <NButton
                  size="tiny"
                  secondary
                  @click="approvalOpen = true"
                >
                  <template #icon><span class="i-mdi-history" /></template>
                  查看审批实例
                </NButton>
                <NTag
                  :bordered="false"
                  size="small"
                  :type="page.getNotificationWorkflowTone(page.workflow.status)"
                  >{{
                    page.getNotificationWorkflowLabel(page.workflow.status)
                  }}</NTag
                >
              </NSpace></header
            >
            <dl class="workflow-info-grid">
              <div
                ><dt>流程名称</dt><dd>{{ page.workflow.processName }}</dd></div
              >
              <div
                ><dt>业务单号</dt
                ><dd class="workflow-business-no">{{
                  page.workflow.businessNo
                }}</dd></div
              >
              <div
                ><dt>发起人</dt><dd>{{ page.workflow.initiator }}</dd></div
              >
              <div
                ><dt>当前节点</dt><dd>{{ page.workflow.currentNode }}</dd></div
              >
              <div
                ><dt>参与关系</dt
                ><dd>{{
                  page.getNotificationWorkflowRelationLabel(
                    page.workflow.relationship
                  )
                }}</dd></div
              >
              <div v-if="page.workflow.dueAt"
                ><dt>截止时间</dt
                ><dd :class="{ 'is-overdue': page.isOverdue }"
                  >{{ page.formatMessageTime(page.workflow.dueAt)
                  }}<span
                    v-if="page.isOverdue"
                    class="workflow-overdue-badge"
                    >已逾期</span
                  ></dd
                ></div
              >
            </dl>
            <p
              v-if="page.store.mode === 'demo'"
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
            ><h3>{{ page.workflow ? '申请说明' : '消息内容' }}</h3>
            <!-- 富文本只允许应用白名单正文标记，外部样式、图片与脚本均移除。 -->
            <div
              v-if="page.detail.contentType === 'html'"
              class="message-body"
              v-html="page.sanitizeNotificationHtml(page.detail.content)"
            />
            <div
              v-else
              class="message-body message-body--text"
              >{{ page.detail.content }}</div
            >
          </section>
          <section
            v-if="page.detail.attachments?.length"
            class="detail-attachments"
          >
            <h3>附件</h3>
            <NList bordered>
              <NListItem
                v-for="attachment in page.detail.attachments"
                :key="attachment.id"
              >
                {{ attachment.name }}
                <template #suffix
                  ><NButton
                    size="small"
                    :loading="page.downloadBusy === attachment.id"
                    :disabled="
                      !!page.downloadBusy && page.downloadBusy !== attachment.id
                    "
                    @click="page.downloadAttachment(attachment)"
                    >{{
                      page.store.mode === 'demo' ? '下载演示凭证' : '下载'
                    }}</NButton
                  ></template
                >
              </NListItem>
            </NList>
            <NText
              v-if="page.store.mode === 'demo'"
              depth="3"
              >演示附件生成本地文本凭证，不访问外部文件。</NText
            >
          </section>
          <section
            v-if="page.workflow"
            class="workflow-history"
            aria-label="审批时间线"
          >
            <header class="detail-section-heading"
              ><h3>审批动态</h3
              ><span>{{ page.workflow.history.length }} 条记录</span></header
            >
            <ol
              v-if="page.workflow.history.length"
              class="workflow-timeline"
            >
              <li
                v-for="entry in page.workflow.history"
                :key="entry.id"
                :class="`workflow-event--${entry.action}`"
              >
                <span
                  class="workflow-timeline-dot"
                  aria-hidden="true"
                />
                <div class="workflow-event-heading"
                  ><strong>{{ page.historyLabels[entry.action] }}</strong
                  ><time :datetime="entry.at">{{
                    page.formatMessageTime(entry.at)
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
            v-if="page.commandError"
            :type="page.syncRequired ? 'warning' : 'error'"
            class="command-warning"
            role="alert"
          >
            {{ page.commandError
            }}<NButton
              v-if="page.syncRequired"
              text
              type="primary"
              :loading="page.busy"
              @click="page.retryCommandSync"
              >重试同步详情</NButton
            >
          </NAlert>
          <section
            v-if="page.workflow"
            class="workflow-handling"
            aria-label="审批办理"
          >
            <template v-if="page.workflowActions.length">
              <header class="detail-section-heading"
                ><h3>{{
                  page.workflow.relationship === 'initiator'
                    ? '申请操作'
                    : '审批办理'
                }}</h3
                ><span>提交后记录操作历史</span></header
              >
              <label
                class="workflow-comment-label"
                for="workflow-comment"
                >{{
                  page.workflow.relationship === 'initiator'
                    ? '撤回说明'
                    : '审批意见'
                }}<span>{{
                  page.workflow.relationship === 'initiator'
                    ? '选填'
                    : '驳回、退回时必填'
                }}</span></label
              >
              <NInput
                v-model:value="page.workflowComment"
                :input-props="{
                  id: 'workflow-comment',
                  'aria-label':
                    page.workflow.relationship === 'initiator'
                      ? '撤回说明'
                      : '审批意见',
                }"
                type="textarea"
                :maxlength="1000"
                show-count
                :autosize="{ minRows: 3, maxRows: 7 }"
                :disabled="page.busy || page.readSyncing"
                placeholder="填写办理意见，便于后续跟踪与审计"
              />
              <div class="workflow-action-buttons"
                ><NButton
                  v-for="action in page.workflowActions"
                  :key="action"
                  :type="
                    action === 'approve'
                      ? 'primary'
                      : action === 'reject'
                        ? 'error'
                        : 'default'
                  "
                  :secondary="action === 'reject'"
                  :loading="page.busy"
                  :disabled="page.readSyncing"
                  @click="page.confirmWorkflow(action)"
                  >{{ page.WORKFLOW_LABELS[action] }}</NButton
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
                page.workflow.status !== 'pending'
                  ? `流程${page.getNotificationWorkflowLabel(page.workflow.status)}，可查看审批结果与历史记录。`
                  : page.workflow.relationship === 'cc'
                    ? '此消息为抄送通知，可查看流程进度，无需执行审批。'
                    : page.detail.archivedAt
                      ? '此消息已归档，请先移回收件箱后办理。'
                      : page.syncRequired
                        ? '请先同步最新详情，再继续办理。'
                        : '当前消息服务未开放审批办理，可查看流程信息。'
              }}</span></div
            >
          </section>
          <section
            v-else-if="page.detail.kind === 'task'"
            class="task-handling"
            aria-label="待办办理"
          >
            <header class="detail-section-heading"
              ><h3>待办办理</h3
              ><NTag
                size="small"
                :bordered="false"
                :type="page.getNotificationTaskTone(page.detail.taskStatus)"
                >{{
                  page.getNotificationTaskLabel(page.detail.taskStatus)
                }}</NTag
              ></header
            >
            <p>{{ page.taskDescription }}</p>
            <div
              v-if="page.taskActions.length"
              class="workflow-action-buttons"
              ><NButton
                v-for="action in page.taskActions"
                :key="action"
                :type="action === 'complete-task' ? 'primary' : 'default'"
                :loading="page.busy"
                :disabled="page.readSyncing"
                @click="page.confirmTask(action)"
                >{{ page.TASK_LABELS[action] }}</NButton
              ></div
            >
          </section>
          <div class="detail-actions">
            <NButton
              :disabled="page.busy || page.syncRequired"
              @click="page.change(page.detail.starred ? 'unstar' : 'star')"
              >{{ page.detail.starred ? '取消星标' : '添加星标' }}</NButton
            >
            <NButton
              :disabled="page.busy || page.syncRequired"
              @click="
                page.change(page.detail.archivedAt ? 'unarchive' : 'archive')
              "
              >{{ page.detail.archivedAt ? '移回收件箱' : '归档' }}</NButton
            >
            <NButton
              v-if="page.detail.target?.type === 'route'"
              type="primary"
              :disabled="page.busy"
              @click="emit('action', page.detail)"
              >打开相关业务</NButton
            >
          </div>
        </article>
        <NEmpty
          v-else-if="!page.loading"
          description="暂无详情"
        />
      </NSpin>
    </NDrawerContent>
  </NDrawer>
  <C_ApprovalViewer
    v-if="approvalOpen && page.workflow && approvalSource"
    v-model:show="approvalOpen"
    :business-key="page.workflow.businessNo"
    :instance-id="page.workflow.instanceId"
    :source="approvalSource"
  />
</template>

<script setup lang="ts">
  import type { NotificationRecord } from '@/api/notifications.contract'
  import { useMessageDetail } from './useMessageDetail'
  import { createMessageApprovalSource } from './approvalViewerSource'

  defineOptions({ name: 'MessageDetail' })
  const props = defineProps<{ id: string | null }>()
  const emit = defineEmits<{
    close: []
    action: [record: NotificationRecord]
  }>()
  const controller = useMessageDetail(props)
  const page = proxyRefs(controller)
  const approvalOpen = ref(false)
  const approvalSource = computed(() =>
    controller.detail.value && controller.workflow.value
      ? createMessageApprovalSource(
          controller.detail.value,
          controller.workflow.value,
          controller.store.mode === 'demo'
        )
      : undefined
  )
  watch(
    () => props.id,
    () => {
      approvalOpen.value = false
    }
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
