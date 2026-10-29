<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\src\views\demo\59-business-workbench\index.vue
 * @Description: 订单与多明细协作工作台，使用正式公开组件入口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <C_Density density="compact">
    <main
      ref="container"
      class="business-workbench"
      data-testid="business-workbench"
    >
      <header class="workbench-heading">
        <div class="workbench-heading__identity">
          <span class="workbench-heading__icon"
            ><C_Icon
              aria-hidden="true"
              type="svg"
              :svg-path="WORKBENCH_ICONS.workspace"
              :size="24"
          /></span>
          <div
            ><h1>业务工作台</h1
            ><p>订单、商品与收款协同处理 <span>· 本地演示</span></p></div
          >
        </div>
        <NSpace
          :size="8"
          align="center"
          ><NTag
            :type="dirty ? 'warning' : 'success'"
            size="small"
            data-testid="draft-status"
            >{{ dirty ? '有未保存修改' : '已保存' }}</NTag
          ><NButton
            size="small"
            :disabled="saving || batchBusy"
            @click="restore"
            ><template #icon
              ><C_Icon
                aria-hidden="true"
                type="svg"
                :svg-path="WORKBENCH_ICONS.restore"
                :size="15" /></template
            >恢复当前单据</NButton
          ><NButton
            type="primary"
            size="small"
            :loading="saving"
            :disabled="resource.loading.value || batchBusy"
            @click="save"
            ><template #icon
              ><C_Icon
                aria-hidden="true"
                type="svg"
                :svg-path="WORKBENCH_ICONS.save"
                :size="15" /></template
            >保存整单</NButton
          ></NSpace
        >
      </header>

      <C_FormSearch
        class="workbench-search"
        v-model="query"
        :form-item-list="SEARCH_FIELDS"
        :config="searchConfig"
      />
      <C_ErrorSummary
        :issues="scope.issues.value"
        @navigate="scope.reveal"
      />

      <div class="workbench-layout">
        <C_SplitPane
          v-model:size="splitSize"
          :direction="stacked ? 'vertical' : 'horizontal'"
          :min-first-size="stacked ? 240 : 260"
          :min-second-size="stacked ? 450 : 480"
          aria-label="订单与单据详情"
        >
          <template #first>
            <section
              class="workbench-panel workbench-orders"
              aria-label="订单列表"
            >
              <header
                ><div class="workbench-panel__title"
                  ><span class="workbench-panel__icon"
                    ><C_Icon
                      aria-hidden="true"
                      type="svg"
                      :svg-path="WORKBENCH_ICONS.orders"
                      :size="18" /></span
                  ><div
                    ><h2>订单列表</h2
                    ><span>{{ filteredOrders.length }} 笔本地订单</span></div
                  ></div
                ><span class="workbench-panel__badge">主表</span></header
              >
              <div class="workbench-master-grid"
                ><MachTable
                  :ref="master.ref"
                  :row-data="filteredOrders"
                  :column-defs="masterColumns"
                  row-key="id"
                  :row-height="50"
                  :header-height="36"
                  column-layout="fit"
                  :striped-rows="true"
                  :show-cell-borders="true"
                  :row-style-rules="masterRowStyles"
                  :theme="themeStore.isDark ? 'dark' : 'light'"
                  :pagination="false"
                  :enable-column-resize="true"
              /></div>
              <p class="workbench-panel-note"
                >点击订单编号联动主档与明细。未保存时可保存、放弃或取消切换。</p
              >
            </section>
          </template>
          <template #second>
            <section
              class="workbench-document"
              aria-label="当前订单"
            >
              <section
                class="workbench-panel workbench-header"
                aria-label="订单主档"
              >
                <header
                  ><div class="workbench-panel__title"
                    ><span class="workbench-panel__icon"
                      ><C_Icon
                        aria-hidden="true"
                        type="svg"
                        :svg-path="WORKBENCH_ICONS.document"
                        :size="18" /></span
                    ><div
                      ><h2 data-testid="active-order">{{ header.orderNo }}</h2
                      ><span>订单主档</span></div
                    ></div
                  ><NButton
                    size="tiny"
                    @click="fillMissingExample"
                    >填入缺失样例</NButton
                  ></header
                >
                <C_Form
                  ref="form"
                  v-model="header"
                  :options="HEADER_FIELDS"
                  :config="FORM_CONFIG"
                  :renderers="renderers"
                />
              </section>

              <Teleport
                to="body"
                :disabled="!fullscreen"
              >
                <section
                  class="workbench-panel workbench-details"
                  :class="{ 'workbench-details--fullscreen': fullscreen }"
                  aria-label="订单明细"
                  :aria-busy="resource.loading.value"
                >
                  <header
                    ><NTabs
                      v-model:value="activeTab"
                      role="tablist"
                      aria-label="订单明细分类"
                      size="small"
                      type="line"
                      ><NTab
                        id="workbench-tab-lines"
                        name="lines"
                        role="tab"
                        aria-controls="workbench-lines-panel"
                        :aria-selected="activeTab === 'lines'"
                        :tabindex="activeTab === 'lines' ? 0 : -1"
                        @keydown="onDetailTabKeydown"
                        >商品明细</NTab
                      ><NTab
                        id="workbench-tab-payments"
                        name="payments"
                        role="tab"
                        aria-controls="workbench-payments-panel"
                        :aria-selected="activeTab === 'payments'"
                        :tabindex="activeTab === 'payments' ? 0 : -1"
                        @keydown="onDetailTabKeydown"
                        >收款安排</NTab
                      ></NTabs
                    ><NButton
                      size="tiny"
                      @click="fullscreen = !fullscreen"
                      >{{ fullscreen ? '退出明细全屏' : '明细全屏' }}</NButton
                    ></header
                  >
                  <NAlert
                    v-if="resource.error.value"
                    type="error"
                    title="明细加载失败"
                    ><NButton
                      text
                      @click="resource.reload"
                      >重试当前订单</NButton
                    ></NAlert
                  >
                  <div
                    v-show="activeTab === 'lines'"
                    id="workbench-lines-panel"
                    role="tabpanel"
                    aria-labelledby="workbench-tab-lines"
                    class="workbench-lines"
                    data-testid="line-panel"
                  >
                    <div class="workbench-detail-actions"
                      ><NSpace :size="6"
                        ><NButton
                          size="tiny"
                          @click="selectAllLines"
                          >全选明细</NButton
                        ><NButton
                          size="tiny"
                          @click="emptyLocalLines"
                          >体验空明细</NButton
                        ></NSpace
                      ><span
                        >已选 {{ selectedCount }} 项 · 双击数量或备注编辑</span
                      ></div
                    >
                    <div class="workbench-detail-grid"
                      ><MachTable
                        :ref="detail.ref"
                        :row-data="lines"
                        :column-defs="detailColumns"
                        row-key="id"
                        :row-height="32"
                        :header-height="36"
                        column-layout="fit"
                        :striped-rows="true"
                        :show-cell-borders="true"
                        :theme="themeStore.isDark ? 'dark' : 'light'"
                        row-selection="multiple"
                        :pagination="false"
                        :enable-column-resize="true"
                        @cell-value-changed="syncLineEdit"
                        @cell-editing-started="detailEditing = true"
                        @cell-editing-stopped="detailEditing = false"
                        @selection-changed="
                          selectedCount =
                            detail.api.value?.selection.getIds().length || 0
                        "
                    /></div>
                    <div
                      class="workbench-totals"
                      data-testid="line-totals"
                      ><span
                        v-for="total in totals"
                        :key="total.key"
                        >当前明细 · {{ total.key }}
                        <b>{{ total.quantity }}</b> 数量
                        <b>{{ total.amount }}</b> 金额</span
                      ><span v-if="!lines.length"
                        >暂无明细，空列表不会回退旧订单数据</span
                      ></div
                    >
                  </div>
                  <div
                    v-show="activeTab === 'payments'"
                    id="workbench-payments-panel"
                    role="tabpanel"
                    aria-labelledby="workbench-tab-payments"
                    class="workbench-payment-grid"
                    data-testid="payment-panel"
                    ><MachTable
                      :ref="payments.ref"
                      :row-data="paymentRows"
                      :column-defs="paymentColumns"
                      row-key="id"
                      :row-height="32"
                      :header-height="36"
                      column-layout="fit"
                      :striped-rows="true"
                      :show-cell-borders="true"
                      :theme="themeStore.isDark ? 'dark' : 'light'"
                      :pagination="false"
                  /></div>
                </section>
              </Teleport>
            </section>
          </template>
        </C_SplitPane>
      </div>

      <section
        class="workbench-panel workbench-batch"
        aria-label="明细批改"
      >
        <header
          ><div class="workbench-panel__title"
            ><span class="workbench-panel__icon"
              ><C_Icon
                aria-hidden="true"
                type="svg"
                :svg-path="WORKBENCH_ICONS.batch"
                :size="19" /></span
            ><div
              ><h2>明细批改</h2
              ><span
                >只作用于当前已选明细；失败项保留草稿，重试不再提交成功项</span
              ></div
            ></div
          ></header
        >
        <div class="workbench-batch-controls"
          ><label
            >备注处理<NSelect
              v-model:value="batchMode"
              :options="BATCH_MODES"
              size="small"
              aria-label="批改备注操作" /></label
          ><NInput
            v-model:value="batchValue"
            :disabled="batchMode !== 'set'"
            size="small"
            placeholder="统一备注内容"
            aria-label="统一备注内容"
          /><NButton
            size="small"
            :disabled="batchBusy"
            @click="previewBatch"
            >预览批改</NButton
          ><NButton
            size="small"
            type="primary"
            :disabled="!batchPreview.length || batchBusy"
            :loading="batchBusy"
            @click="executeBatch()"
            >确认执行批改</NButton
          ></div
        >
        <div
          v-if="batchPreview.length"
          class="workbench-batch-preview"
          data-testid="batch-preview"
          ><div
            v-for="item in batchPreview"
            :key="item.key"
            ><strong>{{ item.key }}</strong
            ><span>{{ item.before ?? '未填写' }}</span
            ><span aria-label="变更为">→</span
            ><span>{{
              item.after === null
                ? '清空为未填写'
                : item.after === ''
                  ? '空文本'
                  : item.after
            }}</span></div
          ></div
        >
        <C_BatchResult
          :results="batchResults"
          title="本次批改结果"
          @retry="executeBatch"
        />
      </section>
      <p
        class="workbench-status"
        role="status"
        data-testid="workbench-status"
        >{{ notice }}</p
      >

      <NModal
        :show="pendingOrder !== null"
        preset="card"
        title="有未保存的修改"
        class="workbench-switch-dialog"
        :mask-closable="false"
        @update:show="!$event && (pendingOrder = null)"
      >
        <p>当前单据有未保存内容，请选择如何切换订单。</p>
        <template #action
          ><NSpace
            justify="end"
            :size="8"
            ><NButton
              size="small"
              @click="pendingOrder = null"
              >取消切换</NButton
            ><NButton
              size="small"
              @click="discardAndSwitch"
              >放弃并切换</NButton
            ><NButton
              size="small"
              type="primary"
              :loading="saving"
              @click="saveAndSwitch"
              >保存并切换</NButton
            ></NSpace
          ></template
        >
      </NModal>
    </main>
  </C_Density>
</template>

<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  // 自定义 renderer 通过 h() 使用 Picker，按路由显式引入其样式。
  import { MachTable } from '@agile-team/mach-table-vue'
  import { WORKBENCH_ICONS } from './icons'
  import { s_themeStore } from '@/stores/theme'
  import {
    useBusinessWorkbench,
    SEARCH_FIELDS,
    HEADER_FIELDS,
    FORM_CONFIG,
    BATCH_MODES,
  } from './data'
  defineOptions({ name: 'BusinessWorkbench' })
  const themeStore = s_themeStore()
  const {
    container,
    stacked,
    form,
    master,
    detail,
    payments,
    header,
    lines,
    activeTab,
    detailEditing,
    onDetailTabKeydown,
    fullscreen,
    splitSize,
    pendingOrder,
    saving,
    batchBusy,
    batchMode,
    batchValue,
    batchPreview,
    batchResults,
    query,
    searchConfig,
    renderers,
    resource,
    notice,
    selectedCount,
    totals,
    filteredOrders,
    dirty,
    scope,
    masterColumns,
    masterRowStyles,
    detailColumns,
    paymentColumns,
    paymentRows,
    save,
    saveAndSwitch,
    discardAndSwitch,
    fillMissingExample,
    selectAllLines,
    previewBatch,
    executeBatch,
    emptyLocalLines,
    restore,
    syncLineEdit,
  } = useBusinessWorkbench()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
