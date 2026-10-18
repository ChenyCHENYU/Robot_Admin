<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 应用消息工作台预览，分类、阅读与办理状态独立呈现
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="notification-bell"
    data-testid="notification-bell"
    @keydown.esc.stop.prevent="closePreview"
  >
    <button
      ref="triggerRef"
      type="button"
      class="notification-bell__trigger"
      :class="{ 'is-active': popoverVisible }"
      :aria-label="`消息中心，${store.stats.unread} 条未读，${store.stats.todo} 条待办`"
      aria-haspopup="dialog"
      :aria-expanded="popoverVisible"
      :aria-controls="panelId"
      @click="togglePreview"
    >
      <span
        class="i-mdi-bell-outline notification-bell__icon"
        aria-hidden="true"
      />
      <span
        v-if="store.stats.unread"
        class="notification-badge__count"
        aria-hidden="true"
        >{{ store.stats.unread > 99 ? '99+' : store.stats.unread }}</span
      >
    </button>
    <NPopover
      :show="popoverVisible"
      :x="popoverX"
      :y="popoverY"
      trigger="manual"
      placement="bottom-end"
      :show-arrow="false"
      :overlap="false"
      raw
      @clickoutside="handlePreviewOutside"
    >
      <section
        :id="panelId"
        class="notification-preview"
        role="dialog"
        tabindex="-1"
        aria-label="消息中心预览"
        data-testid="notification-preview"
        @keydown.esc.stop.prevent="closePreview"
      >
        <header class="notification-preview__header">
          <div>
            <div class="notification-preview__eyebrow">我的工作消息</div>
            <h2>消息中心</h2>
          </div>
          <div class="notification-preview__actions">
            <NTag
              size="small"
              :bordered="false"
              :type="store.mode === 'demo' ? 'warning' : 'info'"
            >
              {{ store.mode === 'demo' ? '本地演示' : '企业收件箱' }}
            </NTag>
            <NButton
              quaternary
              circle
              size="small"
              aria-label="刷新消息预览"
              :loading="store.previewLoading"
              @click="refreshPreview"
            >
              <template #icon
                ><span
                  class="i-mdi-refresh"
                  aria-hidden="true"
              /></template>
            </NButton>
            <NButton
              quaternary
              circle
              size="small"
              aria-label="关闭消息预览"
              @click="closePreview"
            >
              <template #icon
                ><span
                  class="i-mdi-close"
                  aria-hidden="true"
              /></template>
            </NButton>
          </div>
        </header>

        <div class="notification-preview__metrics">
          <button
            type="button"
            @click="selectStatus('unread')"
          >
            <span
              class="notification-preview__metric-icon is-unread i-mdi-email-outline"
              aria-hidden="true"
            />
            <span
              >未读消息<strong>{{ store.stats.unread }}</strong></span
            >
            <span
              class="i-mdi-arrow-top-right"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            @click="selectStatus('todo')"
          >
            <span
              class="notification-preview__metric-icon is-todo i-mdi-clipboard-check-outline"
              aria-hidden="true"
            />
            <span
              >待处理<strong>{{ store.stats.todo }}</strong></span
            >
            <span
              class="i-mdi-arrow-top-right"
              aria-hidden="true"
            />
          </button>
        </div>

        <nav
          class="notification-preview__topics"
          aria-label="消息业务分类"
          title="分类数字为未归档消息总数，阅读与办理状态单独筛选"
        >
          <button
            v-for="option in notificationTopicOptions"
            :key="option.value"
            type="button"
            :class="{ 'is-selected': activeTopic === option.value }"
            :aria-pressed="activeTopic === option.value"
            @click="selectTopic(option.value)"
          >
            {{ option.label }}
            <span
              v-if="
                option.value !== 'all' &&
                store.stats.byTopic?.[option.value] !== undefined
              "
              class="notification-preview__topic-count"
              >{{ store.stats.byTopic?.[option.value] }}</span
            >
          </button>
        </nav>

        <div class="notification-preview__filter-row">
          <div
            class="notification-preview__statuses"
            role="group"
            aria-label="阅读与办理状态"
          >
            <button
              v-for="option in notificationStatusOptions"
              :key="option.value"
              type="button"
              :class="{ 'is-selected': activeStatus === option.value }"
              :aria-pressed="activeStatus === option.value"
              @click="selectStatus(option.value)"
              >{{ option.label }}</button
            >
          </div>
          <span class="notification-preview__scope">最近消息预览</span>
        </div>

        <NAlert
          v-if="store.previewError"
          class="notification-preview__error"
          type="error"
          :show-icon="false"
        >
          <div class="notification-preview__error-content">
            <span>{{ store.previewError }}</span>
            <NButton
              size="tiny"
              :loading="store.previewLoading"
              @click="refreshPreview"
              >重试</NButton
            >
          </div>
        </NAlert>

        <NSpin
          :show="store.previewLoading"
          size="small"
        >
          <div
            class="notification-preview__list"
            :aria-busy="store.previewLoading"
          >
            <ol
              v-if="previewRows.length"
              aria-label="最近消息"
            >
              <li
                v-for="row in previewRows"
                :key="row.record.id"
              >
                <button
                  type="button"
                  class="notification-preview__item"
                  :class="{ 'is-unread': !row.record.readAt }"
                  @click="openInbox(row.record.id)"
                >
                  <span class="notification-preview__number">{{
                    row.number
                  }}</span>
                  <span
                    class="notification-preview__item-icon"
                    :class="{ 'is-workflow': !!row.record.workflow }"
                  >
                    <span
                      :class="row.icon"
                      aria-hidden="true"
                    />
                  </span>
                  <span class="notification-preview__item-body">
                    <span class="notification-preview__item-heading">
                      <span class="notification-preview__item-title">{{
                        row.record.title
                      }}</span>
                      <span
                        v-if="!row.record.readAt"
                        class="notification-preview__read-dot"
                        aria-label="未读"
                      />
                    </span>
                    <span
                      v-if="row.record.summary"
                      class="notification-preview__summary"
                      >{{ row.record.summary }}</span
                    >
                    <span class="notification-preview__tags">
                      <NTag
                        size="tiny"
                        :bordered="false"
                        :type="row.record.readAt ? 'default' : 'info'"
                        >{{ row.record.readAt ? '已读' : '未读' }}</NTag
                      >
                      <NTag
                        v-if="row.taskLabel"
                        size="tiny"
                        :bordered="false"
                        :type="row.taskTone"
                        >{{ row.taskLabel }}</NTag
                      >
                      <NTag
                        v-if="row.workflowLabel"
                        size="tiny"
                        :bordered="false"
                        :type="row.workflowTone"
                        >{{ row.workflowLabel }}</NTag
                      >
                      <NTag
                        v-if="
                          row.record.priority === 'urgent' ||
                          row.record.priority === 'high'
                        "
                        size="tiny"
                        :bordered="false"
                        :type="row.priorityTone"
                        >{{ row.priorityLabel }}</NTag
                      >
                    </span>
                    <span class="notification-preview__item-meta">
                      <span
                        >{{ row.source
                        }}<template v-if="row.relationshipLabel">
                          · {{ row.relationshipLabel }}</template
                        ></span
                      >
                      <time
                        :datetime="row.record.createdAt"
                        :title="
                          new Date(row.record.createdAt).toLocaleString('zh-CN')
                        "
                        >{{ row.time }}</time
                      >
                    </span>
                  </span>
                  <span
                    class="i-mdi-chevron-right notification-preview__item-arrow"
                    aria-hidden="true"
                  />
                </button>
              </li>
            </ol>
            <div
              v-else
              class="notification-preview__empty"
            >
              <span
                class="i-mdi-inbox-outline"
                aria-hidden="true"
              />
              <strong>{{
                store.previewError
                  ? '预览暂时不可用'
                  : store.previewLoading
                    ? '正在同步消息'
                    : '当前筛选暂无消息'
              }}</strong>
              <span>在完整消息中心查看历史消息与更多筛选</span>
            </div>
          </div>
        </NSpin>

        <footer class="notification-preview__footer">
          <span>最多展示最近 20 条 · {{ filterDescription }}</span>
          <NButton
            text
            type="primary"
            @click="openInbox()"
          >
            查看筛选下全部
            <template #icon
              ><span
                class="i-mdi-arrow-right"
                aria-hidden="true"
            /></template>
          </NButton>
        </footer>
      </section>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import { useNotificationBell } from './data'

  defineOptions({ name: 'NotificationBell' })
  const {
    store,
    panelId,
    triggerRef,
    openInbox,
    popoverVisible,
    popoverX,
    popoverY,
    togglePreview,
    handlePreviewOutside,
    activeTopic,
    activeStatus,
    previewRows,
    filterDescription,
    closePreview,
    refreshPreview,
    selectTopic,
    selectStatus,
    notificationTopicOptions,
    notificationStatusOptions,
  } = useNotificationBell()
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
