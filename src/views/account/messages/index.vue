<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\account\messages\index.vue
 * @Description: 企业消息工作台，完整收件与发送治理共享同一领域状态
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="enterprise-messages"
    data-testid="enterprise-message-center"
  >
    <header class="message-page-header">
      <div
        ><div class="message-eyebrow">个人工作台 · 消息与审批</div
        ><div class="message-heading"
          ><h1>消息中心</h1
          ><NTag
            :type="view.store.mode === 'demo' ? 'warning' : 'info'"
            :bordered="false"
            size="small"
            >{{ view.store.mode === 'demo' ? '演示模式' : '接口模式' }}</NTag
          ></div
        ><p
          >聚合通用消息、审批流程与业务待办，让每一项工作都有清晰进展。</p
        ></div
      >
      <NSpace align="center"
        ><span
          class="connection-status"
          :class="{ 'is-online': view.store.connected }"
          ><i />{{ view.store.connected ? '已同步' : '连接待恢复' }}</span
        ><NButton
          :loading="view.store.loading"
          @click="view.connection.refresh"
          ><template #icon><span class="i-mdi-refresh" /></template
          >刷新</NButton
        ></NSpace
      >
    </header>
    <section
      class="message-stats"
      aria-label="消息概览"
    >
      <button
        v-for="stat in view.navigation.statCards"
        :key="stat.key"
        class="message-stat"
        :class="`message-stat--${stat.key}`"
        @click="view.navigation.selectStat(stat.key)"
        ><span class="stat-symbol"
          ><span
            :class="stat.icon"
            aria-hidden="true" /></span
        ><span
          ><span class="stat-label">{{ stat.label }}</span
          ><strong>{{ stat.value }}</strong></span
        ><span class="i-mdi-arrow-top-right stat-arrow"
      /></button>
    </section>
    <NAlert
      v-if="view.store.error"
      type="error"
      :bordered="false"
      class="message-error"
      ><div class="message-error-content"
        ><span>{{ view.store.error }}</span
        ><NButton
          size="small"
          :loading="view.store.loading"
          @click="view.connection.refresh"
          >重试连接</NButton
        ></div
      ></NAlert
    >
    <NTabs
      v-model:value="view.section"
      type="line"
      animated
      class="message-sections"
    >
      <NTab name="inbox">收件箱</NTab>
      <NTab
        name="sending"
        :disabled="!view.store.capabilities.manage"
        >发送与记录</NTab
      >
      <NTab
        name="templates"
        :disabled="!view.store.capabilities.manage"
        >消息模板</NTab
      >
      <NTab
        name="preferences"
        :disabled="!view.store.capabilities.preferences"
        >通知偏好</NTab
      >
    </NTabs>
    <div
      v-if="view.section === 'inbox'"
      class="message-inbox-layout"
    >
      <aside
        class="message-navigation"
        aria-label="收件箱导航"
      >
        <div class="navigation-heading">我的消息<span>收件总数</span></div>
        <button
          v-for="item in view.navigation.topicItems"
          :key="item.key"
          class="inbox-navigation-item"
          :class="{
            'is-active':
              (view.store.query.topic ?? 'all') === item.key &&
              !view.navigation.activeWorkflowView,
          }"
          :aria-current="
            (view.store.query.topic ?? 'all') === item.key &&
            !view.navigation.activeWorkflowView
              ? 'page'
              : undefined
          "
          @click="
            view.navigation.select({
              topic:
                item.key === 'all'
                  ? undefined
                  : (item.key as 'general' | 'workflow'),
            })
          "
        >
          <span
            :class="item.icon"
            aria-hidden="true"
          /><span>{{ item.label }}</span
          ><small>{{ item.count }}</small>
        </button>
        <div class="navigation-heading navigation-heading--workflow"
          >审批工作台</div
        >
        <button
          v-for="item in view.navigation.workflowViews"
          :key="item.key"
          class="inbox-navigation-item"
          :class="{
            'is-active': view.navigation.activeWorkflowView === item.key,
          }"
          :aria-current="
            view.navigation.activeWorkflowView === item.key ? 'page' : undefined
          "
          @click="view.navigation.select(item.patch)"
        >
          <span
            :class="item.icon"
            aria-hidden="true"
          /><span>{{ item.label }}</span>
        </button>
        <div class="navigation-note"
          ><span
            class="i-mdi-information"
            aria-hidden="true"
          />
          <p>阅读与办理分别记录。<br />已读的事项也可能仍待处理。</p>
        </div>
        <div
          v-if="view.store.stats.overdue"
          class="navigation-overdue"
          ><span
            class="i-mdi-clock-outline"
            aria-hidden="true"
          />{{ view.store.stats.overdue }} 项待办已超期</div
        >
      </aside>
      <NCard
        :bordered="false"
        class="message-inbox"
      >
        <div class="inbox-heading">
          <div class="inbox-title"
            ><h2>{{ view.navigation.inboxTitle }}</h2
            ><span>共 {{ view.store.total }} 条消息</span></div
          >
          <NSpace
            align="center"
            size="small"
          >
            <NRadioGroup
              :value="inboxLayout"
              size="small"
              aria-label="消息列表视图"
              @update:value="setInboxLayout"
            >
              <NRadioButton value="table">批量处理</NRadioButton>
              <NRadioButton value="compact">消息速览</NRadioButton>
            </NRadioGroup>
            <NButton
              text
              type="primary"
              :disabled="
                !view.store.stats.unread ||
                view.store.loading ||
                view.list.commandLoading
              "
              @click="view.list.markAllRead"
              >全部标为已读</NButton
            >
          </NSpace>
        </div>
        <NTabs
          v-if="inboxLayout === 'table'"
          :value="view.store.query.status"
          type="line"
          size="small"
          class="inbox-status-tabs"
          @update:value="view.navigation.changeStatus"
        >
          <NTab
            v-for="tab in INBOX_TABS"
            :key="tab.value"
            :name="tab.value"
            >{{ tab.label }}</NTab
          >
        </NTabs>
        <div class="message-filters">
          <NInput
            v-model:value="view.list.filters.keyword"
            clearable
            placeholder="搜索标题、正文、业务编号"
            :input-props="{ 'aria-label': '消息关键词' }"
            @keyup.enter="view.list.search"
          >
            <template #prefix><span class="i-mdi-magnify" /></template>
          </NInput>
          <NSelect
            v-model:value="view.list.filters.category"
            clearable
            placeholder="全部消息类型"
            :options="CATEGORY_OPTIONS"
            aria-label="消息分类"
          />
          <NSelect
            v-model:value="view.list.filters.priority"
            clearable
            placeholder="全部优先级"
            :options="PRIORITY_OPTIONS"
            aria-label="消息优先级"
          />
          <NSpace :wrap="false">
            <NButton
              type="primary"
              :loading="view.store.loading"
              @click="view.list.search"
              >查询</NButton
            >
            <NButton
              :disabled="view.store.loading"
              @click="view.list.resetFilters"
              >重置</NButton
            >
          </NSpace>
          <NButton
            text
            class="advanced-filter-toggle"
            :aria-expanded="view.navigation.advancedFilters"
            @click="
              view.navigation.advancedFilters = !view.navigation.advancedFilters
            "
          >
            <template #icon><span class="i-mdi-tune-variant" /></template
            >{{ view.navigation.advancedFilters ? '收起筛选' : '更多筛选' }}
          </NButton>
        </div>
        <div
          v-if="view.navigation.advancedFilters"
          class="message-advanced-filters"
        >
          <label
            ><span>消息来源</span
            ><NInput
              v-model:value="view.list.filters.source"
              clearable
              placeholder="输入来源名称"
              :input-props="{ 'aria-label': '消息来源' }"
              @keyup.enter="view.list.search"
          /></label>
          <label
            ><span>办理状态</span
            ><NSelect
              v-model:value="view.list.filters.taskStatus"
              clearable
              placeholder="全部办理状态"
              :options="TASK_STATUS_OPTIONS"
              aria-label="办理状态"
          /></label>
          <label
            ><span>审批状态</span
            ><NSelect
              v-model:value="view.list.filters.workflowStatus"
              clearable
              placeholder="全部审批状态"
              :options="WORKFLOW_STATUS_OPTIONS"
              aria-label="审批状态"
          /></label>
          <label
            ><span>参与关系</span
            ><NSelect
              v-model:value="view.list.filters.relationship"
              clearable
              placeholder="全部参与关系"
              :options="WORKFLOW_RELATION_OPTIONS"
              aria-label="审批参与关系"
          /></label>
          <label class="filter-date"
            ><span>收到日期</span
            ><NDatePicker
              v-model:value="view.list.filters.dateRange"
              type="daterange"
              clearable
              aria-label="收到日期范围"
          /></label>
        </div>
        <div
          v-if="inboxLayout === 'table'"
          class="inbox-toolbar"
        >
          <C_ActionBar
            :actions="view.list.actions"
            :config="{ size: 'small', wrap: true }"
          />
          <span class="selection-summary"
            >{{
              view.list.selectedIds.length
                ? `已选 ${view.list.selectedIds.length} 条`
                : '可勾选消息进行批量操作'
            }}
            <NButton
              v-if="view.list.selectedIds.length"
              text
              size="small"
              @click="view.list.clearSelection"
              >清空选择</NButton
            >
          </span>
        </div>
        <C_Table
          v-if="inboxLayout === 'table'"
          ref="tableRef"
          :columns="view.list.columns"
          :data="view.store.items"
          :loading="view.store.loading"
          row-key="id"
          :row-number="false"
          :config="{
            toolbar: { show: false },
            selection: { enabled: true },
            pagination: view.list.pagination,
            display: { scrollX: 1210, bordered: false, size: 'medium' },
          }"
          @pagination-change="view.list.changePage"
          @selection-change="view.list.selectionChange"
        />
        <C_NotificationInbox
          v-else
          :views="compactViews"
          :active-view="view.store.query.status"
          :items="view.store.loading ? [] : compactItems"
          :selected-id="view.reader.id ?? undefined"
          :loading="view.store.loading"
          :error="view.store.error"
          :start-index="
            (view.list.pagination.page - 1) * view.list.pagination.pageSize
          "
          :actions="compactActions"
          :badges="compactBadges"
          @update:active-view="view.navigation.changeStatus"
          @select="view.reader.open($event.id)"
          @action="handleCompactAction"
          @retry="view.connection.retry"
        >
          <template #footer>
            <NPagination
              :page="view.list.pagination.page"
              :page-size="view.list.pagination.pageSize"
              :item-count="view.list.pagination.total"
              :page-sizes="view.list.pagination.pageSizes"
              :disabled="view.store.loading"
              size="small"
              show-size-picker
              @update:page="
                view.list.changePage($event, view.list.pagination.pageSize)
              "
              @update:page-size="view.list.changePage(1, $event)"
            />
          </template>
        </C_NotificationInbox>
        <div class="inbox-legend"
          ><span><i class="legend-unread-dot" />未读消息</span
          ><span>阅读状态、待办办理与审批结果分别跟踪</span></div
        >
      </NCard>
    </div>
    <MessageGovernance
      v-else-if="view.section === 'sending' || view.section === 'templates'"
      :section="view.section"
    />
    <NotificationPreferences v-else-if="view.section === 'preferences'" />
    <NText
      v-if="!view.store.capabilities.manage && !view.store.loading"
      depth="3"
      class="capability-note"
      >发送治理由消息服务按当前账户授权开放。</NText
    >
    <NCard
      v-if="view.store.mode === 'demo'"
      :bordered="false"
      class="demo-controls-card"
    >
      <NCollapse
        ><NCollapseItem
          name="demo"
          title="演示控制"
          ><p class="demo-description"
            >本区域仅在演示模式可见。数据按当前用户与公司保存在此浏览器，可验证离线、失败恢复和新消息同步。</p
          ><div class="demo-controls"
            ><NButton
              :loading="view.demo.busy"
              @click="view.demo.simulateIncoming('workflow')"
              >生成新审批</NButton
            ><NButton
              :loading="view.demo.busy"
              @click="view.demo.simulateIncoming('notification')"
              >生成新通知</NButton
            ><NButton
              :loading="view.demo.busy"
              @click="view.demo.simulateIncoming('task')"
              >生成新待办</NButton
            ><NButton @click="view.demo.toggleOnline">{{
              view.store.connected ? '模拟离线' : '恢复连接'
            }}</NButton
            ><NSelect
              v-model:value="view.demo.failureOperation"
              :options="view.demo.failureOptions"
              aria-label="模拟失败类型"
            /><NButton @click="view.demo.injectFailure">下一次操作失败</NButton
            ><NButton
              type="error"
              secondary
              :disabled="view.demo.busy"
              @click="view.demo.confirmReset"
              >重置本作用域</NButton
            ></div
          ></NCollapseItem
        ></NCollapse
      >
    </NCard>
    <MessageDetail
      :id="view.reader.id"
      @close="view.reader.close"
      @action="view.reader.openBusiness"
    />
  </div>
</template>

<script setup lang="ts">
  import type { NotificationMutation } from '@/api/notifications.contract'
  import type {
    NotificationInboxAction,
    NotificationInboxBadge,
  } from '@robot-admin/naive-ui-components/C_NotificationInbox'
  import {
    getNotificationTaskLabel,
    getNotificationWorkflowLabel,
  } from '@/utils/d_notificationPresentation'
  import {
    CATEGORY_OPTIONS,
    INBOX_TABS,
    PRIORITY_OPTIONS,
    TASK_STATUS_OPTIONS,
    WORKFLOW_RELATION_OPTIONS,
    WORKFLOW_STATUS_OPTIONS,
  } from './data'
  import { useMessageWorkspace } from './composables/useMessageWorkspace'
  import MessageDetail from './components/MessageDetail/index.vue'
  import MessageGovernance from './components/MessageGovernance/index.vue'
  import NotificationPreferences from './components/NotificationPreferences/index.vue'

  defineOptions({ name: 'AccountMessages' })
  const controller = useMessageWorkspace()
  const view = proxyRefs(controller)
  const { tableRef } = controller

  const inboxLayout = ref<'table' | 'compact'>('table')
  const compactViews = INBOX_TABS.map(({ value, label }) => ({
    key: value,
    label,
  }))
  const compactItems = computed(() =>
    controller.store.items.map(item => ({
      ...item,
      timestamp: item.createdAt,
      status: item.archivedAt
        ? ('archived' as const)
        : item.readAt
          ? ('read' as const)
          : ('unread' as const),
    }))
  )
  type CompactItem = (typeof compactItems.value)[number]
  const compactBadges = (item: CompactItem): NotificationInboxBadge[] => {
    if (item.workflow)
      return [
        {
          label: getNotificationWorkflowLabel(item.workflow.status),
          type: item.workflow.status === 'pending' ? 'warning' : 'info',
        },
      ]
    if (item.taskStatus)
      return [{ label: getNotificationTaskLabel(item.taskStatus) }]
    return []
  }
  const compactActions = (
    item: CompactItem
  ): NotificationInboxAction<NotificationMutation>[] => [
    {
      key: item.starred ? 'unstar' : 'star',
      label: item.starred ? '取消星标' : '加星标',
      disabled: controller.list.commandLoading,
    },
    {
      key: item.readAt ? 'unread' : 'read',
      label: item.readAt ? '标为未读' : '标为已读',
      disabled: controller.list.commandLoading,
    },
  ]
  const handleCompactAction = (
    action: NotificationMutation,
    item: CompactItem
  ) => controller.list.mutate(action, [item.id])
  const setInboxLayout = (layout: 'table' | 'compact') => {
    controller.list.clearSelection()
    inboxLayout.value = layout
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
