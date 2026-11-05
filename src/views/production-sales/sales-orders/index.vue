<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\index.vue
 * @Description: 订单与多明细协作工作台，使用正式公开组件入口
 * 路由模板只保留一个元素根，避免开发态根注释参与 Fragment 与过渡缓存。
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    ref="container"
    class="business-workbench"
    data-testid="business-workbench"
  >
    <C_Density density="compact">
      <PageHeading
        title="销售订单协同"
        eyebrow="产销业务 / 销售中心"
        description="订单履约、主档维护、商品明细与收款安排，在同一工作区闭环。"
      >
        <NSpace
          :size="8"
          align="center"
          ><NButton
            size="small"
            @click="dictionaryVisible = true"
            :render-icon="actionIcons.bookOpenVariantOutline"
            >字典联动体验</NButton
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
      </PageHeading>
      <dl class="sales-metrics"
        ><div
          ><dt>订单台账</dt
          ><dd>{{ filteredOrders.length }}<small>笔订单</small></dd></div
        ><div
          ><dt>当前合同</dt
          ><dd class="sales-metrics__reference">{{
            header.contractNo
          }}</dd></div
        ><div
          ><dt>履约进度</dt><dd>{{ header.progress }}<small>%</small></dd></div
        ><div
          ><dt>交付窗口</dt
          ><dd class="sales-metrics__reference">{{ header.delivery }}</dd></div
        ></dl
      >

      <C_FormSearch
        class="workbench-search"
        v-model="query"
        :form-item-list="searchFields"
        :config="searchConfig"
        @reset="applyOrderQuery"
      />
      <C_ErrorSummary
        :issues="scope.issues.value"
        @navigate="scope.reveal"
      />

      <section
        v-if="contractReviewVisible"
        id="contract-review"
        class="workbench-panel workbench-contract"
        aria-labelledby="contract-review-title"
        @keydown.esc.stop="dismissContractReview"
      >
        <header>
          <div>
            <h2
              id="contract-review-title"
              ref="contractReviewHeading"
              tabindex="-1"
              >合同版本比对</h2
            >
            <span
              v-if="contractReview"
              class="workbench-panel__subtitle"
              >{{ contractReview.source.contractNo }} ·
              {{ contractReview.source.revision }} · 本地合同样例</span
            >
          </div>
          <NButton
            size="tiny"
            @click="dismissContractReview"
            :render-icon="actionIcons.close"
            >关闭比对</NButton
          >
        </header>
        <template v-if="contractReview">
          <div class="workbench-contract__table">
            <NTable
              size="small"
              :bordered="false"
              :bottom-bordered="false"
              striped
            >
              <thead>
                <tr>
                  <th scope="col">字段</th>
                  <th scope="col">当前草稿</th>
                  <th scope="col">合同参考值</th>
                  <th scope="col">差异</th>
                  <th scope="col">采纳</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in contractReview.rows"
                  :key="row.key"
                >
                  <th scope="row">{{ row.label }}</th>
                  <td>{{ formatContractValue(row.current) }}</td>
                  <td>{{ formatContractValue(row.reference) }}</td>
                  <td
                    ><NTag
                      size="small"
                      :bordered="false"
                      :type="CONTRACT_FIELD_STATUS[row.status].type"
                      >{{ CONTRACT_FIELD_STATUS[row.status].label }}</NTag
                    ></td
                  >
                  <td
                    ><NCheckbox
                      v-if="row.status !== 'same'"
                      :aria-label="`采纳${row.label}`"
                      :checked="contractFields.includes(row.key)"
                      :disabled="!canAdoptContractFields"
                      @update:checked="selectContractField(row.key, $event)"
                    /><span v-else>—</span></td
                  >
                </tr>
              </tbody>
            </NTable>
          </div>
          <div class="workbench-contract__footer">
            <span v-if="!canEditContract">仅待下达订单可采纳字段。</span>
            <span v-else
              >已选 {{ contractFields.length }} 项 · 采纳后请保存整单。</span
            >
            <NButton
              v-if="contractReviewError"
              size="small"
              @click="openContractReview"
              :render-icon="actionIcons.refresh"
              >刷新比对</NButton
            >
            <NButton
              size="small"
              type="primary"
              :disabled="!canAdoptContractFields || !contractFields.length"
              @click="confirmContractReview"
              :render-icon="actionIcons.check"
              >采纳所选字段</NButton
            >
          </div>
          <p
            v-if="contractReviewError"
            class="workbench-contract__notice"
            role="alert"
            >{{ contractReviewError }}</p
          >
        </template>
        <p
          v-else
          class="workbench-contract__notice"
          >当前订单暂无可比对的合同版本。</p
        >
      </section>

      <div class="workbench-layout">
        <C_SplitPane
          v-model:size="splitSize"
          direction="vertical"
          :min-first-size="240"
          :min-second-size="370"
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
                    ><span class="workbench-panel__subtitle"
                      >{{ filteredOrders.length }} 笔本地订单</span
                    ></div
                  ></div
                ><span class="workbench-panel__badge">主表</span></header
              >
              <div class="workbench-detail-actions"
                ><C_ActionBar :actions="orderActions"
              /></div>
              <div class="workbench-master-grid"
                ><MachTable
                  :ref="master.ref"
                  :row-data="filteredOrders"
                  :column-defs="masterColumns"
                  @row-clicked="selectOrder"
                  row-key="id"
                  :row-height="30"
                  :header-height="36"
                  column-layout="fit"
                  size="compact"
                  :striped-rows="true"
                  :show-cell-borders="true"
                  :row-style-rules="masterRowStyles"
                  :theme="themeStore.isDark ? 'dark' : 'light'"
                  :pagination="BUSINESS_PAGINATION"
                  :enable-column-resize="true"
              /></div>
              <p class="workbench-panel-note"
                >点击行联动主档与明细，蓝色单号查看详情。未保存时可保存、放弃或取消切换。</p
              >
            </section>
          </template>
          <template #second>
            <section
              class="workbench-document"
              :class="{ 'workbench-document--stacked': stacked }"
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
                      ><span class="workbench-panel__subtitle"
                        >订单主档</span
                      ></div
                    ></div
                  ><NSpace :size="6">
                    <span ref="contractReviewTrigger">
                      <NButton
                        size="tiny"
                        :aria-expanded="contractReviewVisible"
                        aria-controls="contract-review"
                        @click="showContractReview"
                        :render-icon="actionIcons.compareHorizontal"
                        >比对合同</NButton
                      >
                    </span>
                    <NButton
                      size="tiny"
                      @click="fillMissingExample"
                      :render-icon="actionIcons.fileDocumentEditOutline"
                      >填入缺失样例</NButton
                    >
                  </NSpace></header
                >
                <C_Form
                  ref="form"
                  v-model="header"
                  :options="headerFields"
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
                      @click="toggleDetailFullscreen"
                      :render-icon="
                        fullscreen
                          ? actionIcons.fullscreenExit
                          : actionIcons.fullscreen
                      "
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
                      :render-icon="actionIcons.refresh"
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
                        ><C_ActionBar :actions="lineActions" />
                        <NButton
                          size="tiny"
                          @click="selectAllLines"
                          :render-icon="
                            actionIcons.checkboxMultipleMarkedOutline
                          "
                          >全选明细</NButton
                        ><NButton
                          size="tiny"
                          @click="emptyLocalLines"
                          :render-icon="actionIcons.inboxOutline"
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
                        :row-height="30"
                        :header-height="36"
                        column-layout="fit"
                        size="compact"
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
                      :row-height="30"
                      :header-height="36"
                      column-layout="fit"
                      size="compact"
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
              ><span class="workbench-panel__subtitle"
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
            :render-icon="actionIcons.eyeOutline"
            >预览批改</NButton
          ><NButton
            size="small"
            type="primary"
            :disabled="!batchPreview.length || batchBusy"
            :loading="batchBusy"
            @click="executeBatch()"
            :render-icon="actionIcons.check"
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
        @update:show="!$event && cancelSwitch()"
      >
        <p>当前单据有未保存内容，请选择如何切换订单。</p>
        <template #action
          ><NSpace
            justify="end"
            :size="8"
            ><NButton
              size="small"
              @click="cancelSwitch"
              :render-icon="actionIcons.close"
              >取消切换</NButton
            ><NButton
              size="small"
              @click="discardAndSwitch"
              :render-icon="actionIcons.arrowRight"
              >放弃并切换</NButton
            ><NButton
              size="small"
              type="primary"
              :loading="saving"
              @click="saveAndSwitch"
              :render-icon="actionIcons.contentSaveOutline"
              >保存并切换</NButton
            ></NSpace
          ></template
        >
      </NModal>
      <C_FormModal
        :editor="orderEditor"
        :options="ORDER_CREATE_FIELDS"
        :config="BUSINESS_FORM"
        :renderers="renderers"
        :mask-closable="false"
        create-text="建立订单"
      />
      <C_FormModal
        :editor="lineEditor"
        :options="ORDER_LINE_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="加入明细"
      />
      <NModal
        v-model:show="detailVisible"
        v-if="detailOrder"
        preset="card"
        title="销售订单详情"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(1120px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NAlert
          v-if="dirty && detailOrder.header.id === header.id"
          type="warning"
          :show-icon="false"
          >当前显示包含未保存草稿，请返回工作台保存整单。</NAlert
        >
        <NDescriptions
          v-bind="BUSINESS_DETAIL"
          :column="2"
        >
          <NDescriptionsItem label="订单号">{{
            detailOrder.header.orderNo
          }}</NDescriptionsItem
          ><NDescriptionsItem label="合同号">{{
            detailOrder.header.contractNo
          }}</NDescriptionsItem>
          <NDescriptionsItem label="客户">{{
            CUSTOMERS.find(row => row.id === detailOrder?.header.customer)
              ?.name || '未选择'
          }}</NDescriptionsItem
          ><NDescriptionsItem label="业务人员">{{
            detailOrder.header.owner
          }}</NDescriptionsItem>
          <NDescriptionsItem label="钢种 / 规格"
            >{{ detailOrder.header.grade }} /
            {{ detailOrder.header.section }}</NDescriptionsItem
          ><NDescriptionsItem label="交付日期">{{
            detailOrder.header.delivery
          }}</NDescriptionsItem>
          <NDescriptionsItem label="合同量"
            >{{ detailOrder.header.targetWeight }} t</NDescriptionsItem
          ><NDescriptionsItem label="状态">{{
            detailLabels.status
          }}</NDescriptionsItem>
        </NDescriptions>
        <NDivider :style="{ margin: '12px 0' }"
          >商品明细 · {{ detailOrder.lines.length }} 条</NDivider
        >
        <div class="workbench-content-grid"
          ><MachTable
            v-bind="contentGridOptions(detailOrder.lines.length)"
            :row-data="detailOrder.lines"
            :column-defs="readonlyDetailColumns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></div>
        <template #footer
          ><NButton
            size="small"
            @click="detailVisible = false"
            :render-icon="actionIcons.close"
            >关闭详情</NButton
          ></template
        >
      </NModal>
      <NModal
        :show="!!lineDetail"
        @update:show="!$event && (lineDetail = null)"
        v-if="lineDetail"
        preset="card"
        title="商品明细详情"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(600px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NDescriptions
          v-bind="BUSINESS_DETAIL"
          :column="1"
        >
          <NDescriptionsItem label="明细编号">{{
            lineDetail.id
          }}</NDescriptionsItem>
          <NDescriptionsItem label="商品">{{
            lineDetail.product
          }}</NDescriptionsItem>
          <NDescriptionsItem label="数量"
            >{{ lineDetail.quantity ?? '—' }}
            {{ lineDetail.unit }}</NDescriptionsItem
          >
          <NDescriptionsItem label="金额"
            >{{ lineDetail.amount ?? '—' }}
            {{ lineDetail.currency }}</NDescriptionsItem
          >
          <NDescriptionsItem label="备注">{{
            lineDetail.note ?? '—'
          }}</NDescriptionsItem>
        </NDescriptions>
        <template #footer
          ><NButton
            size="small"
            @click="lineDetail = null"
            :render-icon="actionIcons.close"
            >关闭详情</NButton
          ></template
        >
      </NModal>
      <DictionaryExperience
        v-if="dictionaryVisible"
        @close="dictionaryVisible = false"
      />
    </C_Density>
  </main>
</template>

<script setup lang="ts">
  import { actionIcons } from '../shared/actionIcons'
  import '@agile-team/mach-table-vue/styles.css'
  // 自定义 renderer 通过 h() 使用 Picker，按路由显式引入其样式。
  import { MachTable } from '@agile-team/mach-table-vue'
  import { WORKBENCH_ICONS } from './icons'
  import PageHeading from '../components/c_pageHeading/index.vue'
  import {
    BUSINESS_FORM,
    BUSINESS_PAGINATION,
    contentGridOptions,
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
  } from '../shared/presentation'
  import { ORDER_CREATE_FIELDS, ORDER_LINE_FIELDS } from './operations'
  import { CONTRACT_FIELD_STATUS, formatContractValue } from './contractReview'
  import { s_themeStore } from '@/stores/theme'
  import {
    useBusinessWorkbench,
    FORM_CONFIG,
    CUSTOMERS,
    BATCH_MODES,
  } from './data'
  defineOptions({ name: 'SalesOrderWorkbench' })
  const DictionaryExperience = defineAsyncComponent(
    () => import('../components/c_dictionaryExperience/index.vue')
  )
  const themeStore = s_themeStore()
  const dictionaryVisible = ref(false)
  // KeepAlive 失活仍保留组件，主动卸载体验弹窗以归还 Teleport 和局部订阅。
  onDeactivated(() => {
    dictionaryVisible.value = false
  })
  const {
    searchFields,
    headerFields,
    detailLabels,
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
    toggleDetailFullscreen,
    splitSize,
    pendingOrder,
    saving,
    batchBusy,
    batchMode,
    batchValue,
    batchPreview,
    batchResults,
    contractReviewVisible,
    contractReview,
    contractFields,
    contractReviewError,
    canEditContract,
    canAdoptContractFields,
    openContractReview,
    closeContractReview,
    selectContractField,
    adoptContractFields,
    query,
    searchConfig,
    applyOrderQuery,
    renderers,
    resource,
    notice,
    selectedCount,
    totals,
    filteredOrders,
    dirty,
    scope,
    masterColumns,
    selectOrder,
    cancelSwitch,
    detailOrder,
    lineDetail,
    masterRowStyles,
    detailColumns,
    readonlyDetailColumns,
    orderEditor,
    lineEditor,
    orderActions,
    lineActions,
    detailVisible,
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

  const contractReviewHeading = ref<HTMLElement | null>(null)
  const contractReviewTrigger = ref<HTMLElement | null>(null)
  /** 打开内联预览后把焦点移到标题，方便键盘与读屏用户继续操作。 */
  const showContractReview = async () => {
    if (!contractReviewVisible.value) openContractReview()
    await nextTick()
    contractReviewHeading.value?.focus()
  }
  /** 内联预览退出时回到原入口。 */
  const focusContractReviewTrigger = async () => {
    await nextTick()
    contractReviewTrigger.value?.querySelector('button')?.focus()
  }
  /** 主动关闭预览后归还焦点。 */
  const dismissContractReview = () => {
    closeContractReview()
    void focusContractReviewTrigger()
  }
  /** 采纳成功后回到工作台，草稿冲突则留在预览面板。 */
  const confirmContractReview = () => {
    if (adoptContractFields()) void focusContractReviewTrigger()
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
