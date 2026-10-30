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
        description="以浇次组织计划，让产能、炉次与交付节奏在同一工作区协同。"
      >
        <NButton
          size="small"
          @click="tab = 'capacity'"
          >查看产能负荷</NButton
        ><NButton
          type="primary"
          size="small"
          @click="release"
          >下达选中计划</NButton
        >
      </PageHeading>
      <dl class="ps-metrics"
        ><div
          ><dt>当班排产</dt><dd>{{ rows.length }}<small>项计划</small></dd></div
        ><div
          ><dt>计划总量</dt><dd>{{ totalWeight }}<small>t</small></dd></div
        ><div
          ><dt>待下达</dt><dd>{{ pending }}<small>项待办</small></dd></div
        ><div
          ><dt>生产资源</dt><dd>3<small>条连铸产线 · 白班</small></dd></div
        ></dl
      >
      <C_FormSearch
        class="ps-search"
        v-model="query"
        :form-item-list="PLAN_FIELDS"
        :config="searchConfig"
      />
      <div class="plan-workspace">
        <aside
          class="ps-panel plan-resources"
          aria-label="产线资源"
          ><header class="ps-panel-heading"
            ><h2>生产资源</h2><span>钢后 · 连铸</span></header
          >
          <C_Tree
            v-model:selected-keys="selectedLines"
            v-model:expanded-keys="expandedLines"
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
          <div class="plan-resource-notes"
            ><span>资源提示</span
            ><p>2 号连铸机负荷较高，关注后续浇次的开浇间隔。</p
            ><NTag
              size="small"
              type="warning"
              :bordered="false"
              >负荷 88%</NTag
            ></div
          >
        </aside>
        <div class="plan-main">
          <section
            class="ps-panel"
            aria-label="排产计划台账"
            ><header class="ps-panel-heading"
              ><h2>排产计划台账</h2
              ><span
                >{{ visibleRows.length }} 项 · 已选
                {{ selectedIds.length }} 项</span
              ></header
            >
            <div class="ps-toolbar"
              ><C_ActionBar
                :actions="actions"
                :config="{ compact: true, size: 'tiny' }"
            /></div>
            <div class="ps-grid plan-main-grid"
              ><MachTable
                v-bind="BUSINESS_GRID"
                :ref="table.ref"
                column-layout="normal"
                :row-data="visibleRows"
                :column-defs="columns"
                @row-clicked="selectPlan"
                :row-style-rules="rowStyles"
                row-selection="multiple"
                :row-drag="reorderEnabled"
                :row-drag-policy="dragPolicy"
                :theme="themeStore.isDark ? 'dark' : 'light'"
                @selection-changed="syncSelection"
                @row-drag-end="onReorder"
            /></div>
            <p class="ps-footnote"
              >点击行联动炉次，蓝色计划号查看详情。淡黄色表示已下达；未筛选时可拖动待下达计划的顺序。</p
            >
          </section>
          <section
            class="ps-panel"
            aria-label="计划协同详情"
            ><header class="ps-panel-heading"
              ><h2>{{ current.planNo }} · 计划协同</h2
              ><span
                >{{ current.grade }} / {{ current.section }} mm</span
              ></header
            >
            <NTabs
              v-model:value="tab"
              type="line"
              size="small"
              class="plan-tabs"
              ><NTab name="heats">炉次编排</NTab
              ><NTab name="capacity">产能负荷</NTab></NTabs
            >
            <div
              v-if="tab === 'heats'"
              class="ps-grid ps-grid--small"
              ><MachTable
                v-bind="BUSINESS_GRID"
                :row-data="heatRows"
                :column-defs="heatColumns"
                :theme="themeStore.isDark ? 'dark' : 'light'"
            /></div>
            <div
              v-else
              class="plan-capacity"
              ><div
                v-for="load in loads"
                :key="load.line"
                ><header
                  ><strong>{{ load.label }}</strong
                  ><span
                    >{{ load.weight.toFixed(1) }} t · {{ load.rate }}%</span
                  ></header
                ><NProgress
                  type="line"
                  :percentage="load.rate"
                  :show-indicator="false"
                  :height="8"
                  :color="load.rate > 85 ? '#e6a23c' : undefined"
                /><p>{{
                  load.rate > 85
                    ? '关注开浇间隔，保留设备换型时间'
                    : '产能处于合理区间，可承接后续计划'
                }}</p></div
              ></div
            >
          </section>
        </div>
      </div>
      <p
        role="status"
        class="ps-status-line"
        >{{ notice }}</p
      >
      <C_FormModal
        :editor="editor"
        :options="PLAN_EDIT_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="保存计划"
      />
      <NDrawer
        v-model:show="detailVisible"
        width="min(680px, 100vw)"
        placement="right"
      >
        <NDrawerContent
          v-if="detailPlan"
          title="生产计划详情"
          closable
        >
          <NDescriptions
            :column="2"
            bordered
            size="small"
          >
            <NDescriptionsItem label="计划号">{{
              detailPlan.planNo
            }}</NDescriptionsItem>
            <NDescriptionsItem label="状态">{{
              PLAN_STATES[detailPlan.status].label
            }}</NDescriptionsItem>
            <NDescriptionsItem label="产线 / 浇次"
              >{{ detailPlan.line }} / {{ detailPlan.cast }}</NDescriptionsItem
            >
            <NDescriptionsItem label="客户">{{
              detailPlan.customer
            }}</NDescriptionsItem>
            <NDescriptionsItem label="钢种 / 断面"
              >{{ detailPlan.grade }} /
              {{ detailPlan.section }}</NDescriptionsItem
            >
            <NDescriptionsItem label="计划量 / 炉数"
              >{{ detailPlan.weight }} t /
              {{ detailPlan.heats }} 炉</NDescriptionsItem
            >
          </NDescriptions>
          <NDivider>炉次编排</NDivider>
          <div class="ps-grid ps-grid--small"
            ><MachTable
              v-bind="BUSINESS_GRID"
              :row-data="detailHeatRows"
              :column-defs="heatColumns"
              :theme="themeStore.isDark ? 'dark' : 'light'"
          /></div>
          <template #footer
            ><NButton
              size="small"
              @click="detailVisible = false"
              >关闭详情</NButton
            ></template
          >
        </NDrawerContent>
      </NDrawer>
    </C_Density>
  </main>
</template>
<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import PageHeading from '../components/c_pageHeading/index.vue'
  import { BUSINESS_GRID, BUSINESS_FORM } from '../shared/presentation'
  import { PLAN_EDIT_FIELDS } from './operations'
  import {
    useProductionPlan,
    PLAN_FIELDS,
    LINE_TREE,
    LINE_TREE_PROPS,
    PLAN_STATES,
  } from './data'
  defineOptions({ name: 'ProductionPlanWorkbench' })
  const themeStore = s_themeStore()
  const {
    rows,
    query,
    searchConfig,
    selectedLines,
    expandedLines,
    visibleRows,
    current,
    pending,
    totalWeight,
    selectedIds,
    columns,
    selectPlan,
    detailPlan,
    detailHeatRows,
    table,
    rowStyles,
    heatRows,
    heatColumns,
    loads,
    tab,
    notice,
    release,
    syncSelection,
    reorderEnabled,
    dragPolicy,
    onReorder,
    editor,
    actions,
    detailVisible,
  } = useProductionPlan()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
