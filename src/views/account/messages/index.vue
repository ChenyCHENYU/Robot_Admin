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
        ><div class="message-eyebrow">WORKSPACE / COMMUNICATION</div
        ><div class="message-heading"
          ><h1>消息中心</h1
          ><NTag
            :type="store.mode === 'demo' ? 'warning' : 'info'"
            :bordered="false"
            size="small"
            >{{ store.mode === 'demo' ? '演示模式' : '接口模式' }}</NTag
          ></div
        ><p>统一查看通知与待办，跟踪每一次发送与办理。</p></div
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
        @click="selectStat(stat.status)"
        ><span
          class="stat-symbol"
          :class="stat.icon" /><span
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
    <template v-if="section === 'inbox'">
      <NCard
        :bordered="false"
        class="message-inbox"
      >
        <div class="inbox-heading"
          ><NText strong>我的收件箱</NText
          ><NButton
            text
            type="primary"
            :disabled="!store.stats.unread || store.loading || commandLoading"
            @click="markAllRead"
            >全部标为已读</NButton
          ></div
        >
        <NTabs
          :value="store.query.status"
          type="segment"
          size="small"
          class="inbox-status-tabs"
          @update:value="changeStatus"
          ><NTab
            v-for="tab in INBOX_TABS"
            :key="tab.value"
            :name="tab.value"
            >{{ tab.label }}</NTab
          ></NTabs
        >
        <div class="message-filters">
          <NInput
            v-model:value="filters.keyword"
            clearable
            placeholder="搜索标题、摘要、正文"
            aria-label="消息关键词"
            @keyup.enter="search"
            ><template #prefix><span class="i-mdi-magnify" /></template
          ></NInput>
          <NSelect
            v-model:value="filters.category"
            clearable
            placeholder="全部分类"
            :options="CATEGORY_OPTIONS"
            aria-label="消息分类"
          />
          <NInput
            v-model:value="filters.source"
            clearable
            placeholder="消息来源"
            aria-label="消息来源"
            @keyup.enter="search"
          />
          <NSelect
            v-model:value="filters.priority"
            clearable
            placeholder="全部优先级"
            :options="PRIORITY_OPTIONS"
            aria-label="消息优先级"
          />
          <NDatePicker
            v-model:value="filters.dateRange"
            type="daterange"
            clearable
            aria-label="收到日期范围"
          />
          <NSpace :wrap="false"
            ><NButton
              type="primary"
              :loading="store.loading"
              @click="search"
              >查询</NButton
            ><NButton
              :disabled="store.loading"
              @click="resetFilters"
              >重置</NButton
            ></NSpace
          >
        </div>
        <div class="inbox-toolbar"
          ><C_ActionBar
            :actions="actions"
            :config="{ size: 'small', wrap: true }"
          /><span class="selection-summary"
            >{{
              selectedIds.length
                ? `已选 ${selectedIds.length} 条`
                : `共 ${store.total} 条`
            }}<NButton
              v-if="selectedIds.length"
              text
              size="small"
              @click="clearSelection"
              >清空选择</NButton
            ></span
          ></div
        >
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
            display: { scrollX: 1060, bordered: false, size: 'medium' },
          }"
          @pagination-change="changePage"
          @selection-change="selectionChange"
        ></C_Table>
      </NCard>
    </template>
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
    changePage,
    markAllRead,
    clearSelection,
    section,
    demoBusy,
    failureOperation,
    failureOptions,
    statCards,
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
  } = useMessageWorkspace()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
