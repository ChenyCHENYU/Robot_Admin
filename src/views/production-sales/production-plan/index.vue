<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-plan\index.vue
 * @Description: 生产计划调度 — 产线树、排产台账、炉次明细与产能协同
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    class="ps-page plan-page"
    data-testid="production-plan"
  >
    <C_Density density="compact">
      <PageHeading
        title="生产计划调度"
        eyebrow="产销业务 / 生产中心"
        description="按产线编排炉次，核对班次负荷后批量下达。"
      >
        <NButton
          size="small"
          @click="view.heats.tab = 'capacity'"
          :render-icon="actionIcons.chartBar"
          >查看产能负荷</NButton
        ><NButton
          type="primary"
          size="small"
          :disabled="view.release.readyCount === 0"
          @click="view.release.confirm"
          :render-icon="actionIcons.sendOutline"
          >下达选中计划</NButton
        >
      </PageHeading>
      <dl class="ps-metrics"
        ><div
          ><dt>当班排产</dt
          ><dd>{{ view.ledger.allRows.length }}<small>项计划</small></dd></div
        ><div
          ><dt>计划总量</dt
          ><dd>{{ view.metrics.weight }}<small>t</small></dd></div
        ><div
          ><dt>待下达</dt
          ><dd>{{ view.metrics.pending }}<small>项待办</small></dd></div
        ><div
          ><dt>当班炉次</dt
          ><dd>{{ view.metrics.heats }}<small>炉</small></dd></div
        ></dl
      >
      <C_FormSearch
        class="ps-search"
        v-model="view.search.query"
        :form-item-list="PLAN_FIELDS"
        :config="view.search.config"
      >
        <template #actions>
          <C_DataPicker
            :source="view.picker.source"
            :columns="PLAN_PICKER_COLUMNS"
            :initial-values="view.picker.initial"
            :page-size="6"
            require-selection
            title="进阶查询 · 定位计划"
            @select="view.picker.locate"
          >
            <template #trigger="{ open, disabled }">
              <NButton
                size="small"
                :disabled="disabled"
                @click="open"
                :render-icon="actionIcons.filterOutline"
                >进阶查询</NButton
              >
            </template>
            <template #query="{ initialValues, submit }">
              <C_FormSearch
                class="plan-picker-query"
                :model-value="initialValues ?? view.picker.initial"
                :form-item-list="PLAN_PICKER_FIELDS"
                :config="PLAN_PICKER_SEARCH"
                :bordered="false"
                @search="submit"
              />
            </template>
          </C_DataPicker>
        </template>
      </C_FormSearch>
      <section
        class="ps-panel plan-picker-tools"
        aria-label="生产计划选择"
      >
        <C_DataPicker
          :source="view.picker.source"
          :columns="PLAN_PICKER_COLUMNS"
          :initial-values="view.picker.initial"
          :page-size="6"
          :popup="{ width: 560, maxHeight: 280 }"
          placeholder="输入计划号或客户，快速定位"
          title="快捷计划定位"
          presentation="popover"
          commit-on-select
          @select="view.picker.locate"
        />
        <C_DataPicker
          v-model="view.picker.batchValue"
          :source="view.picker.batchSource"
          :columns="PLAN_PICKER_COLUMNS"
          :max-selection="20"
          title="批量核对计划编号"
          multiple
          batch-paste
        >
          <template #trigger="{ open, disabled }">
            <NButton
              size="small"
              :disabled="disabled"
              :render-icon="actionIcons.clipboardListOutline"
              @click="open"
              >批量核对计划</NButton
            >
          </template>
        </C_DataPicker>
        <span
          class="ps-footnote"
          role="status"
          >{{
            view.picker.batchLabels.length
              ? `已核对 ${view.picker.batchLabels.length} 项 · ${view.picker.batchLabels.join('、')}`
              : view.ledger.allRows.length
                ? `可复制计划号 ${view.ledger.allRows[0].planNo}，在批量选择中按行粘贴。`
                : '可在批量选择中按行粘贴计划号。'
          }}</span
        >
      </section>
      <div class="plan-workspace">
        <aside
          class="ps-panel plan-resources"
          aria-label="产线资源"
          ><header class="ps-panel-heading"
            ><h2>生产资源</h2><span>钢后 · 连铸</span></header
          >
          <C_Tree
            v-model:selected-keys="view.lines.selected"
            v-model:expanded-keys="view.lines.expanded"
            :data="LINE_TREE"
            :tree-props="LINE_TREE_PROPS"
            :show-toolbar="false"
            :addable="false"
            :refreshable="false"
            :actions="[]"
            density="compact"
          />
          <div class="plan-shift"
            ><span class="plan-live-dot"></span><strong>白班调度</strong
            ><p>2026-10-29 · 08:00 — 20:00</p
            ><div><span>调度员</span><b>陈雨</b></div
            ><div><span>计划窗口</span><b>未来 24 小时</b></div></div
          >
        </aside>
        <div class="plan-main">
          <section
            class="ps-panel"
            aria-label="排产计划台账"
            ><header class="ps-panel-heading"
              ><h2>排产计划台账</h2
              ><span
                >{{ view.ledger.displayedCount }} 项 · 已选
                {{ view.ledger.selectedIds.length }} 项</span
              ></header
            >
            <div class="ps-toolbar plan-ledger-toolbar">
              <C_ActionBar :actions="view.editing.actions" />
              <span class="plan-scope">
                {{ view.lines.label }}
                <template v-if="view.release.readyCount">
                  · {{ view.release.readyCount }} 项可下达</template
                >
              </span>
            </div>
            <div
              class="ps-grid plan-main-grid"
              :class="{
                'plan-main-grid--short':
                  view.ledger.displayedCount > 0 &&
                  view.ledger.displayedCount <= 3,
                'plan-main-grid--empty': view.ledger.empty,
              }"
              ><MachTable
                v-bind="BUSINESS_GRID"
                :pagination="BUSINESS_PAGINATION"
                :ref="view.ledger.grid.ref"
                column-layout="normal"
                :dom-layout="
                  view.ledger.displayedCount > 0 &&
                  view.ledger.displayedCount <= 3
                    ? 'autoHeight'
                    : 'normal'
                "
                :row-data="view.ledger.rows"
                :column-defs="view.ledger.columns"
                :locale="view.ledger.locale"
                @row-clicked="view.ledger.selectRow"
                @model-updated="view.ledger.modelUpdated"
                :row-style-rules="view.ledger.rowStyles"
                row-selection="multiple"
                :row-drag="view.ledger.canReorder"
                :row-drag-policy="view.ledger.dragPolicy"
                :theme="themeStore.isDark ? 'dark' : 'light'"
                @selection-changed="view.ledger.syncSelection"
                @row-drag-end="view.ledger.onReorder"
            /></div>
            <div
              v-if="view.ledger.empty && view.lines.hasPlans"
              class="plan-empty-action"
            >
              <NButton
                size="small"
                secondary
                :render-icon="actionIcons.restore"
                @click="view.search.clear"
                >清除台账筛选</NButton
              >
            </div>
            <p
              v-if="!view.ledger.empty"
              class="ps-footnote"
              >点击行联动炉次，蓝色计划号查看详情。淡黄色表示已下达；未筛选时可拖动待下达计划的顺序。</p
            >
          </section>
          <section
            class="ps-panel"
            aria-label="计划协同详情"
            ><header class="ps-panel-heading"
              ><h2>{{
                view.heats.plan
                  ? `${view.heats.plan.planNo} · 计划协同`
                  : '计划协同'
              }}</h2
              ><span v-if="view.heats.plan"
                >{{ view.heats.plan.grade }} /
                {{ view.heats.plan.section }} mm</span
              ></header
            >
            <NTabs
              v-model:value="view.heats.tab"
              type="line"
              size="small"
              class="plan-tabs"
              ><NTab name="heats">炉次编排</NTab
              ><NTab name="capacity">产能负荷</NTab></NTabs
            >
            <div
              v-if="view.heats.tab === 'heats' && view.heats.plan"
              class="plan-heat-context"
            >
              <div class="plan-heat-meta">
                <NTag
                  size="small"
                  :bordered="false"
                  :type="PLAN_STATES[view.heats.plan.status].type"
                >
                  {{ PLAN_STATES[view.heats.plan.status].label }}
                </NTag>
                <span>{{ view.heats.plan.cast }} 浇次</span>
                <span>{{ view.heats.plan.customer }}</span>
                <span
                  >{{ view.heats.plan.heats }} 炉 /
                  {{ formatWeight(view.heats.plan.weight) }} t</span
                >
                <span
                  v-if="view.heats.outsideLedger"
                  class="plan-located"
                  >已定位 · 台账未显示</span
                >
              </div>
              <NButton
                size="small"
                text
                :render-icon="actionIcons.eyeOutline"
                @click="view.inspection.open(view.heats.plan)"
                >查看计划详情</NButton
              >
            </div>
            <div
              v-if="view.heats.tab === 'heats' && view.heats.plan"
              class="ps-grid"
              ><MachTable
                v-bind="BUSINESS_CONTENT_GRID"
                :row-data="view.heats.rows"
                :column-defs="view.heats.columns"
                :theme="themeStore.isDark ? 'dark' : 'light'"
            /></div>
            <NEmpty
              v-else-if="view.heats.tab === 'heats'"
              class="plan-detail-empty"
              size="small"
              description="暂无可关联的炉次编排"
            />
            <div
              v-else
              class="plan-capacity"
              ><div
                v-for="load in view.lines.capacity"
                :key="load.line"
                ><header
                  ><strong>{{ load.label }}</strong
                  ><span>{{ load.plans }} 项计划</span></header
                ><NProgress
                  type="line"
                  :percentage="Math.min(load.rate, 100)"
                  :show-indicator="false"
                  :height="8"
                  :status="
                    load.rate > 100
                      ? 'error'
                      : load.rate > 85
                        ? 'warning'
                        : 'default'
                  "
                /><div class="plan-capacity-amount">
                  <span
                    >{{ formatWeight(load.weight) }} /
                    {{ formatWeight(load.capacity) }} t</span
                  >
                  <strong>{{ load.rate }}%</strong>
                </div>
                <footer>
                  <span>{{
                    load.rate > 100
                      ? '已超班次产能'
                      : load.rate > 85
                        ? '接近班次产能'
                        : '仍有排产余量'
                  }}</span>
                  <NButton
                    size="small"
                    text
                    :render-icon="actionIcons.arrowRight"
                    @click="view.lines.focus(load.line)"
                    >查看产线计划</NButton
                  >
                </footer>
              </div></div
            >
          </section>
        </div>
      </div>
      <p
        role="status"
        class="ps-status-line"
        >{{ view.notice }}</p
      >
      <C_FormModal
        :editor="view.editing.editor"
        :options="PLAN_EDIT_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="保存计划"
      />
      <NModal
        v-model:show="view.inspection.visible"
        v-if="view.inspection.plan"
        preset="card"
        title="生产计划详情"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(1060px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NDescriptions
          v-bind="BUSINESS_DETAIL"
          :column="2"
        >
          <NDescriptionsItem label="计划号">{{
            view.inspection.plan.planNo
          }}</NDescriptionsItem>
          <NDescriptionsItem label="状态">{{
            PLAN_STATES[view.inspection.plan.status].label
          }}</NDescriptionsItem>
          <NDescriptionsItem label="产线 / 浇次"
            >{{ view.inspection.plan.line }} /
            {{ view.inspection.plan.cast }}</NDescriptionsItem
          >
          <NDescriptionsItem label="客户">{{
            view.inspection.plan.customer
          }}</NDescriptionsItem>
          <NDescriptionsItem label="钢种 / 断面"
            >{{ view.inspection.plan.grade }} /
            {{ view.inspection.plan.section }}</NDescriptionsItem
          >
          <NDescriptionsItem label="计划量 / 炉数"
            >{{ view.inspection.plan.weight }} t /
            {{ view.inspection.plan.heats }} 炉</NDescriptionsItem
          >
        </NDescriptions>
        <NDivider :style="{ margin: '12px 0' }">炉次编排</NDivider>
        <div class="ps-grid"
          ><MachTable
            v-bind="BUSINESS_CONTENT_GRID"
            :row-data="view.inspection.heats"
            :column-defs="view.heats.columns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></div>
        <template #footer
          ><NButton
            size="small"
            @click="view.inspection.visible = false"
            :render-icon="actionIcons.close"
            >关闭详情</NButton
          ></template
        >
      </NModal>
    </C_Density>
  </main>
</template>
<script setup lang="ts">
  import { actionIcons } from '../shared/actionIcons'
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import {
    BUSINESS_GRID,
    BUSINESS_PAGINATION,
    BUSINESS_CONTENT_GRID,
    BUSINESS_FORM,
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
    weightCodec,
  } from '../shared/presentation'
  import { PLAN_EDIT_FIELDS } from './operations'
  import '@robot-admin/naive-ui-components/C_DataPicker/style.css'
  import {
    PLAN_FIELDS,
    PLAN_PICKER_COLUMNS,
    PLAN_PICKER_FIELDS,
    PLAN_PICKER_SEARCH,
    LINE_TREE,
    LINE_TREE_PROPS,
    PLAN_STATES,
  } from './data'
  import { useProductionPlan } from './useProductionPlan'
  import PageHeading from '../components/PageHeading/index.vue'
  defineOptions({ name: 'ProductionPlanWorkbench' })
  const themeStore = s_themeStore()
  const formatWeight = weightCodec.format
  const view = proxyRefs(useProductionPlan())
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
