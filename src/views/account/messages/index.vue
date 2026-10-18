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
            :type="store.mode === 'demo' ? 'warning' : 'info'"
            :bordered="false"
            size="small"
            >{{ store.mode === 'demo' ? '演示模式' : '接口模式' }}</NTag
          ></div
        ><p
          >聚合通用消息、审批流程与业务待办，让每一项工作都有清晰进展。</p
        ></div
      >
      <NSpace align="center"
        ><span
          class="connection-status"
          :class="{ 'is-online': store.connected }"
          ><i />{{ store.connected ? '已同步' : '连接待恢复' }}</span
        ><NButton
          :loading="store.loading"
          @click="run(() => store.initialize().then(() => store.refresh()))"
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
        v-for="stat in statCards"
        :key="stat.key"
        class="message-stat"
        :class="`message-stat--${stat.key}`"
        @click="selectStat(stat.key)"
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
      v-if="store.error"
      type="error"
      :bordered="false"
      class="message-error"
      ><div class="message-error-content"
        ><span>{{ store.error }}</span
        ><NButton
          size="small"
          :loading="store.loading"
          @click="run(() => store.initialize().then(() => store.refresh()))"
          >重试连接</NButton
        ></div
      ></NAlert
    >
    <NTabs
      v-model:value="section"
      type="line"
      animated
      class="message-sections"
    >
      <NTab name="inbox">收件箱</NTab>
      <NTab
        name="sending"
        :disabled="!store.capabilities.manage"
        >发送与记录</NTab
      >
      <NTab
        name="templates"
        :disabled="!store.capabilities.manage"
        >消息模板</NTab
      >
      <NTab
        name="preferences"
        :disabled="!store.capabilities.preferences"
        >通知偏好</NTab
      >
    </NTabs>
    <div
      v-if="section === 'inbox'"
      class="message-inbox-layout"
    >
      <aside
        class="message-navigation"
        aria-label="收件箱导航"
      >
        <div class="navigation-heading">我的消息<span>收件总数</span></div>
        <button
          v-for="item in topicItems"
          :key="item.key"
          class="inbox-navigation-item"
          :class="{
            'is-active':
              (store.query.topic ?? 'all') === item.key && !activeWorkflowView,
          }"
          :aria-current="
            (store.query.topic ?? 'all') === item.key && !activeWorkflowView
              ? 'page'
              : undefined
          "
          @click="
            navigateInbox({
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
          v-for="item in workflowViews"
          :key="item.key"
          class="inbox-navigation-item"
          :class="{ 'is-active': activeWorkflowView === item.key }"
          :aria-current="activeWorkflowView === item.key ? 'page' : undefined"
          @click="navigateInbox(item.patch)"
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
          v-if="store.stats.overdue"
          class="navigation-overdue"
          ><span
            class="i-mdi-clock-outline"
            aria-hidden="true"
          />{{ store.stats.overdue }} 项待办已超期</div
        >
      </aside>
      <NCard
        :bordered="false"
        class="message-inbox"
      >
        <div class="inbox-heading">
          <div class="inbox-title"
            ><h2>{{ inboxTitle }}</h2
            ><span>共 {{ store.total }} 条消息</span></div
          >
          <NButton
            text
            type="primary"
            :disabled="!store.stats.unread || store.loading || commandLoading"
            @click="markAllRead"
            >全部标为已读</NButton
          >
        </div>
        <NTabs
          :value="store.query.status"
          type="line"
          size="small"
          class="inbox-status-tabs"
          @update:value="changeStatus"
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
            v-model:value="filters.keyword"
            clearable
            placeholder="搜索标题、正文、业务编号"
            :input-props="{ 'aria-label': '消息关键词' }"
            @keyup.enter="search"
          >
            <template #prefix><span class="i-mdi-magnify" /></template>
          </NInput>
          <NSelect
            v-model:value="filters.category"
            clearable
            placeholder="全部消息类型"
            :options="CATEGORY_OPTIONS"
            aria-label="消息分类"
          />
          <NSelect
            v-model:value="filters.priority"
            clearable
            placeholder="全部优先级"
            :options="PRIORITY_OPTIONS"
            aria-label="消息优先级"
          />
          <NSpace :wrap="false">
            <NButton
              type="primary"
              :loading="store.loading"
              @click="search"
              >查询</NButton
            >
            <NButton
              :disabled="store.loading"
              @click="resetFilters"
              >重置</NButton
            >
          </NSpace>
          <NButton
            text
            class="advanced-filter-toggle"
            :aria-expanded="advancedFilters"
            @click="advancedFilters = !advancedFilters"
          >
            <template #icon><span class="i-mdi-tune-variant" /></template
            >{{ advancedFilters ? '收起筛选' : '更多筛选' }}
          </NButton>
        </div>
        <div
          v-if="advancedFilters"
          class="message-advanced-filters"
        >
          <label
            ><span>消息来源</span
            ><NInput
              v-model:value="filters.source"
              clearable
              placeholder="输入来源名称"
              :input-props="{ 'aria-label': '消息来源' }"
              @keyup.enter="search"
          /></label>
          <label
            ><span>办理状态</span
            ><NSelect
              v-model:value="filters.taskStatus"
              clearable
              placeholder="全部办理状态"
              :options="TASK_STATUS_OPTIONS"
              aria-label="办理状态"
          /></label>
          <label
            ><span>审批状态</span
            ><NSelect
              v-model:value="filters.workflowStatus"
              clearable
              placeholder="全部审批状态"
              :options="WORKFLOW_STATUS_OPTIONS"
              aria-label="审批状态"
          /></label>
          <label
            ><span>参与关系</span
            ><NSelect
              v-model:value="filters.relationship"
              clearable
              placeholder="全部参与关系"
              :options="WORKFLOW_RELATION_OPTIONS"
              aria-label="审批参与关系"
          /></label>
          <label class="filter-date"
            ><span>收到日期</span
            ><NDatePicker
              v-model:value="filters.dateRange"
              type="daterange"
              clearable
              aria-label="收到日期范围"
          /></label>
        </div>
        <div class="inbox-toolbar">
          <C_ActionBar
            :actions="actions"
            :config="{ size: 'small', wrap: true }"
          />
          <span class="selection-summary"
            >{{
              selectedIds.length
                ? `已选 ${selectedIds.length} 条`
                : '可勾选消息进行批量操作'
            }}
            <NButton
              v-if="selectedIds.length"
              text
              size="small"
              @click="clearSelection"
              >清空选择</NButton
            >
          </span>
        </div>
        <C_Table
          ref="tableRef"
          :columns="columns"
          :data="store.items"
          :loading="store.loading"
          row-key="id"
          :config="{
            toolbar: { show: false },
            selection: { enabled: true },
            pagination,
            display: { scrollX: 1210, bordered: false, size: 'medium' },
          }"
          @pagination-change="changePage"
          @selection-change="selectionChange"
        />
        <div class="inbox-legend"
          ><span><i class="legend-unread-dot" />未读消息</span
          ><span>阅读状态、待办办理与审批结果分别跟踪</span></div
        >
      </NCard>
    </div>
    <MessageGovernance
      v-else-if="section === 'sending' || section === 'templates'"
      :section="section"
    />
    <NotificationPreferences v-else-if="section === 'preferences'" />
    <NText
      v-if="!store.capabilities.manage && !store.loading"
      depth="3"
      class="capability-note"
      >发送治理由消息服务按当前账户授权开放。</NText
    >
    <NCard
      v-if="store.mode === 'demo'"
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
              :loading="demoBusy"
              @click="
                demoOperation(
                  () => store.simulateIncoming('workflow'),
                  '已生成新的演示审批'
                )
              "
              >生成新审批</NButton
            ><NButton
              :loading="demoBusy"
              @click="
                demoOperation(
                  () => store.simulateIncoming('notification'),
                  '已生成演示通知'
                )
              "
              >生成新通知</NButton
            ><NButton
              :loading="demoBusy"
              @click="
                demoOperation(
                  () => store.simulateIncoming('task'),
                  '已生成演示待办'
                )
              "
              >生成新待办</NButton
            ><NButton @click="toggleOnline">{{
              store.connected ? '模拟离线' : '恢复连接'
            }}</NButton
            ><NSelect
              v-model:value="failureOperation"
              :options="failureOptions"
              aria-label="模拟失败类型"
            /><NButton @click="injectFailure">下一次操作失败</NButton
            ><NButton
              type="error"
              secondary
              :disabled="demoBusy"
              @click="confirmReset"
              >重置本作用域</NButton
            ></div
          ></NCollapseItem
        ></NCollapse
      >
    </NCard>
    <MessageDetail
      :id="detailId"
      @close="detailId = null"
      @action="openBusiness"
    />
  </div>
</template>

<script setup lang="ts">
  import { useMessageWorkspace } from './composables/useMessageWorkspace'
  import MessageDetail from './components/c_messageDetail/index.vue'
  import MessageGovernance from './components/c_messageGovernance/index.vue'
  import NotificationPreferences from './components/c_notificationPreferences/index.vue'

  defineOptions({ name: 'AccountMessages' })
  const {
    store,
    tableRef,
    selectedIds,
    detailId,
    filters,
    commandLoading,
    columns,
    actions,
    pagination,
    run,
    search,
    resetFilters,
    changeStatus,
    navigateInbox,
    changePage,
    markAllRead,
    clearSelection,
    section,
    demoBusy,
    failureOperation,
    failureOptions,
    statCards,
    topicItems,
    workflowViews,
    activeWorkflowView,
    inboxTitle,
    advancedFilters,
    selectStat,
    selectionChange,
    demoOperation,
    toggleOnline,
    injectFailure,
    confirmReset,
    openBusiness,
    CATEGORY_OPTIONS,
    INBOX_TABS,
    PRIORITY_OPTIONS,
    TASK_STATUS_OPTIONS,
    WORKFLOW_STATUS_OPTIONS,
    WORKFLOW_RELATION_OPTIONS,
  } = useMessageWorkspace()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
