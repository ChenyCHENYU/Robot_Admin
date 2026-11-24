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
    :class="{
      'business-workbench--stacked': page.layout.stacked,
      'business-workbench--preview': page.isPreview,
    }"
    data-testid="business-workbench"
  >
    <C_Density density="compact">
      <PageHeading
        title="销售订单协同"
        eyebrow="产销业务 / 销售中心"
        description="筛选订单、核对合同差异、维护商品明细，并按币种查看收款测算。"
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
            :type="page.draft.dirty ? 'warning' : 'success'"
            size="small"
            data-testid="draft-status"
            >{{ page.draft.dirty ? '有未保存修改' : '已保存' }}</NTag
          ><NButton
            size="small"
            :disabled="page.draft.saving || page.batch.busy"
            @click="page.draft.restore"
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
            :loading="page.draft.saving"
            :disabled="page.lines.resource.loading.value || page.batch.busy"
            @click="page.draft.save"
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
          ><dt>当前查询</dt>
          <dd
            >{{ page.ledger.rows.length
            }}<small>/ {{ page.ledger.total }} 笔</small></dd
          ></div
        ><div
          ><dt>当前合同</dt
          ><dd class="sales-metrics__reference">{{
            page.draft.header.contractNo
          }}</dd></div
        ><div
          ><dt>当前履约</dt
          ><dd
            >{{ page.draft.header.progress
            }}<small>% · {{ page.draft.currentStatus }}</small></dd
          ></div
        ><div
          ><dt>交付窗口</dt
          ><dd class="sales-metrics__reference">{{
            page.draft.header.delivery
          }}</dd></div
        ></dl
      >

      <C_FormSearch
        class="workbench-search"
        v-model="page.search.query"
        :form-item-list="page.search.fields"
        :config="page.search.config"
      />
      <C_ErrorSummary
        :issues="page.draft.validation.issues.value"
        @navigate="page.draft.validation.reveal"
      />

      <section
        v-if="page.contractReview.visible"
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
              v-if="page.contractReview.preview"
              class="workbench-panel__subtitle"
              >{{ page.contractReview.preview.source.contractNo }} ·
              {{ page.contractReview.preview.source.revision }} ·
              本地合同样例</span
            >
          </div>
          <NButton
            size="tiny"
            @click="dismissContractReview"
            :render-icon="actionIcons.close"
            >关闭比对</NButton
          >
        </header>
        <template v-if="page.contractReview.preview">
          <C_ChangeReview
            :key="page.contractReview.version"
            :before="page.contractReview.preview.before"
            :after="page.contractReview.preview.source.values"
            :fields="CONTRACT_REVIEW_FIELDS"
            before-label="当前草稿"
            after-label="合同参考值"
            selectable
            :disabled="!page.contractReview.canAdopt"
            @apply="confirmContractReview"
          />
          <div class="workbench-contract__footer">
            <span v-if="!page.contractReview.canEdit"
              >仅待下达订单可采纳字段。</span
            >
            <span v-else>采纳后请保存整单。</span>
            <NButton
              v-if="page.contractReview.error"
              size="small"
              @click="page.contractReview.open"
              :render-icon="actionIcons.refresh"
              >刷新比对</NButton
            >
          </div>
          <p
            v-if="page.contractReview.error"
            class="workbench-contract__notice"
            role="alert"
            >{{ page.contractReview.error }}</p
          >
        </template>
        <p
          v-else
          class="workbench-contract__notice"
          >当前订单暂无可比对的合同版本。</p
        >
      </section>

      <div class="workbench-layout">
        <!-- 订单区下限：标题 48 + 工具栏 41 + 表格 120 + 上下边框 2。 -->
        <C_SplitPane
          v-model:size="page.layout.splitSize"
          direction="vertical"
          :min-first-size="211"
          :min-second-size="260"
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
                      >{{ page.ledger.rows.length }} 笔订单</span
                    ></div
                  ></div
                ></header
              >
              <div class="workbench-detail-actions"
                ><C_ActionBar :actions="page.ledger.actions" />
                <NButton
                  v-if="!page.ledger.rows.length"
                  size="small"
                  :render-icon="actionIcons.restore"
                  @click="page.search.clear"
                  >清除订单筛选</NButton
                >
              </div>
              <div class="workbench-master-grid"
                ><MachTable
                  :ref="page.ledger.grid.ref"
                  :row-data="page.ledger.rows"
                  :column-defs="page.ledger.columns"
                  @row-clicked="page.ledger.selectRow"
                  row-key="id"
                  :row-height="30"
                  :header-height="36"
                  column-layout="fit"
                  size="compact"
                  :striped-rows="true"
                  :show-cell-borders="true"
                  :row-style-rules="page.ledger.rowStyles"
                  :theme="themeStore.isDark ? 'dark' : 'light'"
                  :pagination="BUSINESS_PAGINATION"
                  :locale="ORDER_LIST_LOCALE"
                  aria-label="销售订单台账"
                  :enable-column-resize="true"
              /></div>
            </section>
          </template>
          <template #second>
            <section
              class="workbench-document"
              :class="{ 'workbench-document--stacked': page.layout.stacked }"
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
                      ><h2 data-testid="active-order">{{
                        page.draft.header.orderNo
                      }}</h2
                      ><span class="workbench-panel__subtitle">{{
                        page.ledger.activeOutsideQuery
                          ? '当前单据不在查询结果内'
                          : '订单主档'
                      }}</span></div
                    ></div
                  ><NSpace :size="6">
                    <span ref="contractReviewTrigger">
                      <NButton
                        size="tiny"
                        :aria-expanded="page.contractReview.visible"
                        aria-controls="contract-review"
                        @click="showContractReview"
                        :render-icon="actionIcons.compareHorizontal"
                        >比对合同</NButton
                      >
                    </span>
                  </NSpace></header
                >
                <C_Form
                  ref="form"
                  v-model="page.draft.header"
                  :options="page.draft.fields"
                  :config="FORM_CONFIG"
                  :renderers="page.draft.renderers"
                />
              </section>

              <Teleport
                to="body"
                :disabled="!page.layout.fullscreen"
              >
                <section
                  class="workbench-panel workbench-details"
                  :class="{
                    'workbench-details--fullscreen': page.layout.fullscreen,
                    'workbench-details--content':
                      page.layout.tab === 'lines'
                        ? page.layout.shortLines
                        : page.layout.shortPayments,
                  }"
                  aria-label="订单明细"
                  :aria-busy="page.lines.resource.loading.value"
                >
                  <header
                    ><NTabs
                      v-model:value="page.layout.tab"
                      role="tablist"
                      aria-label="订单明细分类"
                      size="small"
                      type="line"
                      ><NTab
                        id="workbench-tab-lines"
                        name="lines"
                        role="tab"
                        aria-controls="workbench-lines-panel"
                        :aria-selected="page.layout.tab === 'lines'"
                        :tabindex="page.layout.tab === 'lines' ? 0 : -1"
                        @keydown="page.layout.onDetailTabKeydown"
                        >商品明细</NTab
                      ><NTab
                        id="workbench-tab-payments"
                        name="payments"
                        role="tab"
                        aria-controls="workbench-payments-panel"
                        :aria-selected="page.layout.tab === 'payments'"
                        :tabindex="page.layout.tab === 'payments' ? 0 : -1"
                        @keydown="page.layout.onDetailTabKeydown"
                        >收款安排</NTab
                      ></NTabs
                    ><NButton
                      size="tiny"
                      @click="page.layout.toggleFullscreen"
                      :render-icon="
                        page.layout.fullscreen
                          ? actionIcons.fullscreenExit
                          : actionIcons.fullscreen
                      "
                      >{{
                        page.layout.fullscreen ? '退出明细全屏' : '明细全屏'
                      }}</NButton
                    ></header
                  >
                  <NAlert
                    v-if="page.lines.resource.error.value"
                    type="error"
                    title="明细加载失败"
                    ><NButton
                      text
                      @click="page.lines.resource.reload"
                      :render-icon="actionIcons.refresh"
                      >重试当前订单</NButton
                    ></NAlert
                  >
                  <div
                    v-show="page.layout.tab === 'lines'"
                    id="workbench-lines-panel"
                    role="tabpanel"
                    aria-labelledby="workbench-tab-lines"
                    class="workbench-lines"
                    data-testid="line-panel"
                  >
                    <div class="workbench-detail-actions"
                      ><NSpace :size="6"
                        ><C_ActionBar :actions="page.lines.actions" />
                        <NButton
                          size="tiny"
                          :disabled="
                            !page.lines.rows.length ||
                            page.lines.resource.loading.value ||
                            page.draft.saving ||
                            page.batch.busy
                          "
                          @click="page.lines.selectAll"
                          :render-icon="
                            actionIcons.checkboxMultipleMarkedOutline
                          "
                          >全选明细</NButton
                        ><NButton
                          size="tiny"
                          :disabled="
                            !page.lines.selectedCount ||
                            page.lines.resource.loading.value ||
                            page.draft.saving ||
                            page.batch.busy
                          "
                          @click="page.batch.open"
                          :render-icon="actionIcons.fileDocumentEditOutline"
                          >批改备注</NButton
                        ></NSpace
                      ><span>{{
                        page.lines.selectedCount
                          ? `已选 ${page.lines.selectedCount} 条`
                          : `${page.lines.rows.length} 条明细`
                      }}</span></div
                    >
                    <div
                      class="workbench-detail-grid"
                      :class="{
                        'workbench-grid--content': page.layout.shortLines,
                      }"
                      ><MachTable
                        :ref="page.lines.grid.ref"
                        :row-data="page.lines.rows"
                        :column-defs="page.lines.columns"
                        row-key="id"
                        :row-height="30"
                        :header-height="36"
                        :dom-layout="
                          page.layout.shortLines ? 'autoHeight' : 'normal'
                        "
                        :max-body-height="330"
                        column-layout="fit"
                        size="compact"
                        :striped-rows="true"
                        :show-cell-borders="true"
                        :theme="themeStore.isDark ? 'dark' : 'light'"
                        row-selection="multiple"
                        :pagination="false"
                        :enable-column-resize="true"
                        :locale="ORDER_LINES_LOCALE"
                        :loading="page.lines.resource.loading.value"
                        :suppress-no-rows-overlay="
                          page.lines.resource.error.value != null
                        "
                        aria-label="当前订单商品明细"
                        @cell-value-changed="page.lines.syncEdit"
                        @cell-editing-started="page.lines.editing = true"
                        @cell-editing-stopped="page.lines.editing = false"
                        @selection-changed="
                          page.lines.selectedCount =
                            page.lines.grid.api.value?.selection.getIds()
                              .length || 0
                        "
                    /></div>
                    <div
                      class="workbench-totals"
                      data-testid="line-totals"
                      ><span
                        v-for="total in page.lines.totals"
                        :key="total.key"
                        >{{ total.key }} · {{ total.count }} 条
                        <b>{{ total.quantity }}</b> 数量
                        <b>{{ total.amount }}</b> 金额</span
                      ><span v-if="page.lines.resource.loading.value"
                        >正在读取明细</span
                      >
                      <span v-else-if="page.lines.resource.error.value"
                        >明细未读取成功</span
                      >
                      <span v-else-if="!page.lines.rows.length"
                        >暂无明细</span
                      ></div
                    >
                  </div>
                  <div
                    v-show="page.layout.tab === 'payments'"
                    id="workbench-payments-panel"
                    role="tabpanel"
                    aria-labelledby="workbench-tab-payments"
                    class="workbench-payment"
                    data-testid="payment-panel"
                  >
                    <p class="workbench-panel-note"
                      >按当前商品明细汇总，仅供收款核对。</p
                    >
                    <div
                      class="workbench-payment-grid"
                      :class="{
                        'workbench-grid--content': page.layout.shortPayments,
                      }"
                      ><MachTable
                        :ref="page.payments.grid.ref"
                        :row-data="page.payments.rows"
                        :column-defs="page.payments.columns"
                        row-key="id"
                        :row-height="30"
                        :header-height="36"
                        :dom-layout="
                          page.layout.shortPayments ? 'autoHeight' : 'normal'
                        "
                        :max-body-height="330"
                        column-layout="fit"
                        size="compact"
                        :striped-rows="true"
                        :show-cell-borders="true"
                        :theme="themeStore.isDark ? 'dark' : 'light'"
                        :pagination="false"
                        :locale="PAYMENT_LOCALE"
                        :loading="page.lines.resource.loading.value"
                        :suppress-no-rows-overlay="
                          page.lines.resource.error.value != null
                        "
                        aria-label="当前订单收款测算" /></div
                  ></div>
                </section>
              </Teleport>
            </section>
          </template>
        </C_SplitPane>
      </div>

      <NModal
        v-model:show="page.batch.visible"
        preset="card"
        title="批改商品备注"
        size="small"
        class="workbench-panel workbench-batch"
        aria-label="明细批改"
        :mask-closable="false"
        :close-on-esc="!page.batch.busy"
        :closable="!page.batch.busy"
      >
        <p class="workbench-batch-context"
          >{{ page.draft.header.orderNo }} · 已选
          {{ page.lines.selectedCount }} 条明细</p
        >
        <div class="workbench-batch-controls"
          ><label
            >备注处理<NSelect
              v-model:value="page.batch.mode"
              :options="BATCH_MODES"
              :disabled="page.batch.busy"
              size="small"
              aria-label="批改备注操作" /></label
          ><NInput
            v-model:value="page.batch.value"
            :disabled="page.batch.mode !== 'set' || page.batch.busy"
            size="small"
            placeholder="统一备注内容"
            aria-label="统一备注内容"
          /><NButton
            size="small"
            :disabled="page.batch.busy"
            @click="page.batch.previewChanges"
            :render-icon="actionIcons.eyeOutline"
            >预览批改</NButton
          ><NButton
            size="small"
            type="primary"
            :disabled="!page.batch.preview.length || page.batch.busy"
            :loading="page.batch.busy"
            @click="page.batch.execute()"
            :render-icon="actionIcons.check"
            >确认执行批改</NButton
          ></div
        >
        <div
          v-if="page.batch.preview.length"
          class="workbench-batch-preview"
          data-testid="batch-preview"
        >
          <NTable
            size="small"
            striped
            :bordered="false"
            aria-label="备注变更预览"
          >
            <thead
              ><tr
                ><th scope="col">商品明细</th><th scope="col">原备注</th
                ><th scope="col">批改后</th></tr
              ></thead
            >
            <tbody>
              <tr
                v-for="item in page.batch.preview"
                :key="item.key"
              >
                <th scope="row"
                  ><strong>{{ item.product }}</strong
                  ><small>{{ item.key }}</small></th
                >
                <td>{{ item.before ?? '未填写' }}</td>
                <td>{{
                  item.after === null
                    ? '清空为未填写'
                    : item.after === ''
                      ? '空文本'
                      : item.after
                }}</td>
              </tr>
            </tbody>
          </NTable>
        </div>
        <C_BatchResult
          :results="page.batch.results"
          title="本次批改结果"
          @retry="page.batch.execute"
        />
        <p
          class="workbench-batch-context"
          role="status"
          >{{ page.draft.notice }}</p
        >
      </NModal>
      <p
        class="workbench-status"
        :class="{ 'workbench-status--hint': page.draft.isDefaultNotice }"
        role="status"
        data-testid="workbench-status"
        >{{ page.draft.notice }}</p
      >

      <NModal
        :show="page.draft.pendingOrder !== null"
        preset="card"
        title="有未保存的修改"
        class="workbench-switch-dialog"
        :mask-closable="false"
        @update:show="!$event && page.draft.cancelSwitch()"
      >
        <p>当前单据有未保存内容，请选择如何切换订单。</p>
        <template #action
          ><NSpace
            justify="end"
            :size="8"
            ><NButton
              size="small"
              @click="page.draft.cancelSwitch"
              :render-icon="actionIcons.close"
              >取消切换</NButton
            ><NButton
              size="small"
              @click="page.draft.discardAndSwitch"
              :render-icon="actionIcons.arrowRight"
              >放弃并切换</NButton
            ><NButton
              size="small"
              type="primary"
              :loading="page.draft.saving"
              @click="page.draft.saveAndSwitch"
              :render-icon="actionIcons.contentSaveOutline"
              >保存并切换</NButton
            ></NSpace
          ></template
        >
      </NModal>
      <C_FormModal
        :editor="page.ledger.editor"
        :options="ORDER_CREATE_FIELDS"
        :config="BUSINESS_FORM"
        :renderers="page.draft.renderers"
        :mask-closable="false"
        create-text="建立订单"
      />
      <C_FormModal
        :editor="page.lines.editor"
        :options="ORDER_LINE_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="加入明细"
      />
      <NModal
        v-model:show="page.inspection.visible"
        v-if="page.inspection.order"
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
          v-if="
            page.draft.dirty &&
            page.inspection.order.header.id === page.draft.header.id
          "
          type="warning"
          :show-icon="false"
          >当前显示包含未保存草稿，请返回工作台保存整单。</NAlert
        >
        <C_Descriptions
          :data="page.inspection.order.header"
          :fields="page.inspection.descriptions"
          :columns="2"
        />
        <NDivider :style="{ margin: '12px 0' }"
          >商品明细 · {{ page.inspection.order.lines.length }} 条</NDivider
        >
        <div class="workbench-content-grid"
          ><MachTable
            v-bind="BUSINESS_CONTENT_GRID"
            :row-data="page.inspection.order.lines"
            :column-defs="page.inspection.lineColumns"
            :locale="ORDER_DETAIL_LOCALE"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></div>
        <template #footer
          ><NButton
            size="small"
            @click="page.inspection.visible = false"
            :render-icon="actionIcons.close"
            >关闭详情</NButton
          ></template
        >
      </NModal>
      <NModal
        :show="!!page.inspection.line"
        @update:show="!$event && (page.inspection.line = null)"
        v-if="page.inspection.line"
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
            page.inspection.line.id
          }}</NDescriptionsItem>
          <NDescriptionsItem label="商品">{{
            page.inspection.line.product
          }}</NDescriptionsItem>
          <NDescriptionsItem label="数量"
            >{{ page.inspection.line.quantity ?? '—' }}
            {{ page.inspection.line.unit }}</NDescriptionsItem
          >
          <NDescriptionsItem label="金额"
            >{{ page.inspection.line.amount ?? '—' }}
            {{ page.inspection.line.currency }}</NDescriptionsItem
          >
          <NDescriptionsItem label="备注">{{
            page.inspection.line.note ?? '—'
          }}</NDescriptionsItem>
        </NDescriptions>
        <template #footer
          ><NButton
            size="small"
            @click="page.inspection.line = null"
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
  import {
    BUSINESS_FORM,
    BUSINESS_PAGINATION,
    BUSINESS_CONTENT_GRID,
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
  } from '../shared/presentation'
  import { ORDER_CREATE_FIELDS, ORDER_LINE_FIELDS } from './operations'
  import { CONTRACT_REVIEW_FIELDS, type ContractField } from './contractReview'
  import { s_themeStore } from '@/stores/theme'
  import {
    FORM_CONFIG,
    BATCH_MODES,
    ORDER_LIST_LOCALE,
    ORDER_LINES_LOCALE,
    ORDER_DETAIL_LOCALE,
    PAYMENT_LOCALE,
  } from './data'
  import { useBusinessWorkbench } from './useBusinessWorkbench'
  import PageHeading from '../components/PageHeading/index.vue'
  defineOptions({ name: 'SalesOrderWorkbench' })
  const DictionaryExperience = defineAsyncComponent(
    () => import('./components/DictionaryExperience/index.vue')
  )
  const themeStore = s_themeStore()
  const dictionaryVisible = ref(false)
  // KeepAlive 失活仍保留组件，主动卸载体验弹窗以归还 Teleport 和局部订阅。
  onDeactivated(() => {
    dictionaryVisible.value = false
  })
  const controller = useBusinessWorkbench()
  const page = proxyRefs(controller)
  const { container, form } = controller

  const contractReviewHeading = ref<HTMLElement | null>(null)
  const contractReviewTrigger = ref<HTMLElement | null>(null)
  /** 打开内联预览后把焦点移到标题，方便键盘与读屏用户继续操作。 */
  const showContractReview = async () => {
    if (!controller.contractReview.visible) controller.contractReview.open()
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
    controller.contractReview.close()
    void focusContractReviewTrigger()
  }
  /** 采纳成功后回到工作台，草稿冲突则留在预览面板。 */
  const confirmContractReview = (keys: ContractField[]) => {
    if (controller.contractReview.adopt(keys)) void focusContractReviewTrigger()
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
