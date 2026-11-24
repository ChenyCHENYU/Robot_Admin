<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\index.vue
 * @Description: 远程订单协同：独立分页主从、字段方案与可恢复的本地异步接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    ref="container"
    class="ps-page remote-page"
    :class="{
      'remote-page--stacked': view.layout.stacked,
      'remote-page--preview': view.isPreview,
    }"
    data-testid="remote-workbench"
  >
    <PageHeading
      title="远程订单协同"
      eyebrow="产销业务 / 销售中心"
      description="按订单核对交付明细，切换质量追溯字段，独立维护单据草稿。"
      badge="本地异步示例"
    >
      <NPopover
        trigger="click"
        placement="bottom-end"
        :width="320"
      >
        <template #trigger
          ><NButton
            size="small"
            :render-icon="actionIcons.alertCircleOutline"
            >异常演练</NButton
          ></template
        >
        <section
          class="remote-exercises"
          aria-label="异常演练"
        >
          <strong>本地接口演练</strong
          ><p>只影响本页下一次指定查询，无真实业务写入。</p>
          <NButton
            size="small"
            :render-icon="actionIcons.history"
            @click="view.exercises.run('slow')"
            :disabled="!view.editor.order"
            >慢速明细后切换订单</NButton
          >
          <NButton
            size="small"
            :render-icon="actionIcons.alertCircleOutline"
            @click="view.exercises.run('orders')"
            :disabled="view.ledger.query.loading.value"
            >订单查询失败一次</NButton
          >
          <NButton
            size="small"
            :render-icon="actionIcons.alertCircleOutline"
            @click="view.exercises.run('details')"
            :disabled="!view.editor.order || view.details.query.loading.value"
            >明细查询失败一次</NButton
          >
          <NButton
            size="small"
            :render-icon="actionIcons.inboxOutline"
            @click="view.exercises.run('empty')"
            :disabled="!view.editor.order || view.details.query.loading.value"
            >返回空明细</NButton
          >
          <NButton
            size="small"
            :render-icon="actionIcons.bookOpenVariantOutline"
            @click="view.exercises.run('dictionary')"
            :disabled="view.dictionary.status.loading.value"
            >状态字典失败一次</NButton
          >
        </section>
      </NPopover>
    </PageHeading>
    <C_FormSearch
      class="ps-search"
      v-model="view.search.model"
      :form-item-list="view.search.fields"
      :config="view.search.config"
      :loading="view.ledger.query.loading.value"
    />
    <div
      v-if="
        view.dictionary.status.loading.value ||
        view.dictionary.urgent.loading.value ||
        view.dictionary.status.error.value
      "
      class="remote-dictionary"
      role="status"
      aria-live="polite"
    >
      <span v-if="view.dictionary.status.error.value"
        >状态字典暂不可用，保留已有翻译和原始值。</span
      ><span v-else>字典同步中 · 订单和明细可正常查看，翻译稍后自动补齐。</span>
      <NButton
        v-if="view.dictionary.status.error.value"
        text
        size="small"
        :render-icon="actionIcons.refresh"
        :loading="view.dictionary.status.loading.value"
        @click="view.dictionary.retry"
        >重载字典</NButton
      >
    </div>
    <div class="remote-workspace">
      <C_SplitPane
        class="remote-main-split"
        :direction="view.layout.stacked ? 'vertical' : 'horizontal'"
        :default-size="40"
        :min-first-size="view.layout.stacked ? 240 : 360"
        :min-second-size="view.layout.stacked ? 500 : 520"
        :gutter-size="10"
        aria-label="订单列表与单据协同分栏"
      >
        <template #first>
          <section
            class="ps-panel remote-orders"
            aria-label="远程订单列表"
          >
            <header class="ps-panel-heading"
              ><h2>订单台账</h2
              ><span>{{ view.ledger.query.total.value }} 笔订单</span></header
            >
            <div class="ps-toolbar"
              ><span>点击行联动明细，点击蓝色单号查看详情</span
              ><NButton
                size="small"
                :render-icon="actionIcons.refresh"
                :loading="view.ledger.query.loading.value"
                @click="view.ledger.query.retry"
                >{{
                  view.ledger.query.error.value ? '重试订单' : '刷新订单'
                }}</NButton
              ></div
            >
            <div class="ps-grid remote-order-grid">
              <MachTable
                :ref="view.ledger.grid.ref"
                v-bind="{ ...GRID_CONFIG, ...view.ledger.query.bindings.value }"
                :column-defs="view.ledger.columns"
                :row-style-rules="view.ledger.rowStyles"
                @row-clicked="view.ledger.select"
              />
            </div>
          </section>
        </template>
        <template #second>
          <C_SplitPane
            class="remote-detail-stack"
            direction="vertical"
            :default-size="36"
            :min-first-size="220"
            :min-second-size="260"
            :gutter-size="10"
            aria-label="订单主档与商品明细分栏"
          >
            <template #first>
              <section
                class="ps-panel remote-document"
                aria-label="当前订单草稿"
              >
                <header class="ps-panel-heading"
                  ><h2 data-testid="remote-active-order">{{
                    view.editor.order?.orderNo ?? '选择一笔订单'
                  }}</h2
                  ><NTag
                    v-if="view.editor.order"
                    :type="view.editor.dirty ? 'warning' : 'success'"
                    size="small"
                    :bordered="false"
                    >{{ view.editor.dirty ? '未保存' : '已保存' }}</NTag
                  ></header
                >
                <template v-if="view.editor.order">
                  <div class="remote-document-body">
                    <p
                      v-if="view.ledger.currentOutsidePage"
                      class="remote-current-note"
                      role="status"
                      >当前单据不在本页查询结果中，仍保留右侧协同与草稿。</p
                    >
                    <div class="remote-document-context"
                      ><strong>{{ view.editor.order.customer }}</strong
                      ><span>交付日期 {{ view.editor.order.delivery }}</span
                      ><span
                        >订货量
                        {{ view.editor.order.weight.toFixed(3) }} t</span
                      ></div
                    >
                    <div class="remote-form"
                      ><C_Form
                        ref="form"
                        v-model="view.editor.draft"
                        :options="view.editor.fields"
                        :config="view.editor.config"
                    /></div>
                  </div>
                  <div class="remote-document-actions"
                    ><NButton
                      size="small"
                      :render-icon="actionIcons.restore"
                      :disabled="!view.editor.dirty || view.editor.busy"
                      @click="view.editor.restore"
                      >恢复草稿</NButton
                    ><NButton
                      size="small"
                      type="primary"
                      :render-icon="actionIcons.contentSaveOutline"
                      :disabled="!view.editor.dirty || view.editor.busy"
                      :loading="view.editor.saving"
                      @click="view.editor.save"
                      >保存当前订单</NButton
                    ></div
                  >
                </template>
                <div
                  v-else
                  class="remote-document-body remote-await"
                  >{{
                    view.ledger.query.loading.value
                      ? '正在查询订单…'
                      : '从左侧订单台账选择一笔订单'
                  }}</div
                >
              </section>
            </template>
            <template #second>
              <section
                class="ps-panel remote-lines"
                aria-label="远程商品明细"
              >
                <header class="ps-panel-heading"
                  ><h2>商品明细</h2
                  ><span
                    >{{ view.details.query.total.value }} 项 · 已选
                    {{ view.details.query.selectedKeys.value.length }} 项</span
                  ></header
                >
                <div class="ps-toolbar remote-detail-toolbar"
                  ><NSelect
                    v-model:value="view.details.variant"
                    :options="VARIANTS"
                    size="small"
                    :disabled="!view.editor.order"
                    aria-label="明细字段方案"
                  /><span>{{
                    view.details.acceptedVariant === 'quality'
                      ? '质量追溯字段'
                      : '交付明细字段'
                  }}</span
                  ><NButton
                    size="small"
                    :render-icon="actionIcons.refresh"
                    :loading="view.details.query.loading.value"
                    :disabled="!view.editor.order"
                    @click="view.details.query.retry"
                    >{{
                      view.details.query.error.value ? '重试明细' : '刷新明细'
                    }}</NButton
                  ></div
                >
                <div class="ps-grid remote-detail-grid"
                  ><MachTable
                    :ref="view.details.grid.ref"
                    v-bind="{
                      ...GRID_CONFIG,
                      ...view.details.query.bindings.value,
                    }"
                    :column-defs="view.details.columns"
                    row-selection="multiple"
                /></div>
              </section>
            </template>
          </C_SplitPane>
        </template>
      </C_SplitPane>
    </div>
    <NModal
      v-model:show="view.inspection.visible"
      preset="card"
      class="remote-order-modal ps-detail-modal"
      title="销售订单详情"
      :style="{ width: 'min(720px, calc(100vw - 32px))' }"
      v-bind="BUSINESS_DETAIL_DIALOG"
    >
      <NDescriptions
        v-if="view.inspection.record"
        v-bind="BUSINESS_DETAIL"
        :column="2"
      >
        <NDescriptionsItem label="订单编号">{{
          view.inspection.record.orderNo
        }}</NDescriptionsItem
        ><NDescriptionsItem label="计划状态">{{
          view.inspection.labels.status
        }}</NDescriptionsItem>
        <NDescriptionsItem label="订货客户">{{
          view.inspection.record.customer
        }}</NDescriptionsItem
        ><NDescriptionsItem label="业务人员">{{
          view.inspection.record.owner
        }}</NDescriptionsItem>
        <NDescriptionsItem label="交付日期">{{
          view.inspection.record.delivery
        }}</NDescriptionsItem
        ><NDescriptionsItem label="交付要求">{{
          view.inspection.labels.urgent
        }}</NDescriptionsItem>
        <NDescriptionsItem label="订货量 (t)">{{
          view.inspection.record.weight.toFixed(3)
        }}</NDescriptionsItem
        ><NDescriptionsItem label="订单备注">{{
          view.inspection.record.note || '—'
        }}</NDescriptionsItem>
      </NDescriptions>
      <template #footer
        ><NButton
          size="small"
          :render-icon="actionIcons.close"
          @click="view.inspection.visible = false"
          >关闭详情</NButton
        ></template
      >
    </NModal>
  </main>
</template>
<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import {
    actionIcons,
    GRID_CONFIG,
    VARIANTS,
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
  } from './data'
  import { useRemoteWorkbench } from './useRemoteWorkbench'
  import PageHeading from '../components/PageHeading/index.vue'
  defineOptions({ name: 'RemoteOrderWorkbench' })
  const controller = useRemoteWorkbench()
  const view = proxyRefs(controller)
  const { container, form } = controller
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
