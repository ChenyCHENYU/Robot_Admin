<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\index.vue
 * @Description: 炉次实绩工作台 — 炉次切换、密集表单、成分对标与过程时间线
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    ref="container"
    class="ps-page actual-page"
    data-testid="production-actual"
  >
    <C_Density density="compact">
      <PageHeading
        title="炉次实绩记录"
        eyebrow="产销业务 / 生产中心"
        description="围绕一炉钢，集中记录原料、能源、炉况与成分实测。"
      >
        <NTag
          :type="dirty ? 'warning' : 'success'"
          size="small"
          :bordered="false"
          >{{ dirty ? '有未保存实绩' : '已保存' }}</NTag
        ><NButton
          size="small"
          :disabled="saving || locked"
          @click="restore"
          >恢复记录</NButton
        ><NButton
          type="primary"
          size="small"
          :loading="saving"
          :disabled="locked"
          @click="save"
          >保存实绩</NButton
        >
      </PageHeading>
      <div class="ps-panel ps-toolbar"
        ><C_ActionBar
          :actions="reviewActions"
          :config="{ compact: true, size: 'small' }"
        /><NButton
          size="small"
          :disabled="!previous"
          @click="referenceVisible = true"
          >上一炉参考</NButton
        ></div
      >
      <div class="actual-workspace">
        <aside class="actual-sidebar">
          <section class="ps-panel"
            ><header class="ps-panel-heading"
              ><h2>当班炉次</h2><span>{{ HEATS.length }} 炉</span></header
            ><div class="actual-heat-list"
              ><button
                v-for="(heat, index) in heatList"
                :key="heat.id"
                type="button"
                :class="{ 'is-active': currentId === heat.id }"
                :aria-pressed="currentId === heat.id"
                @click="chooseHeat(heat.id)"
                ><div
                  ><strong
                    ><span class="actual-heat-index">{{ index + 1 }}</span
                    >{{ heat.no }}</strong
                  ><span>{{ heat.time }}</span></div
                ><p>{{ heat.furnace }} · {{ heat.grade }}</p
                ><NTag
                  :type="heat.state === '待复核' ? 'warning' : 'success'"
                  :bordered="false"
                  round
                  size="small"
                  >{{ heat.state }}</NTag
                ></button
              ></div
            ></section
          >
          <div class="ps-panel actual-section-nav"
            ><C_SectionNav
              :items="sections"
              v-model="activeSection"
              aria-label="实绩分区导航"
              @select="navigate"
          /></div>
        </aside>
        <div class="actual-main">
          <section class="actual-context ps-panel"
            ><div
              ><span class="actual-context__label">当前炉次</span
              ><h2>{{ current.no }}</h2
              ><p
                >{{ current.furnace }} · {{ current.grade }} · 连铸 1 号机</p
              ></div
            ><dl
              ><div
                ><dt>出钢量</dt
                ><dd>{{ model.output ?? '—' }}<small>t</small></dd></div
              ><div
                ><dt>出钢温度</dt
                ><dd>{{ model.temperature ?? '—' }}<small>℃</small></dd></div
              ><div
                ><dt>成分偏差</dt
                ><dd
                  :class="{
                    'is-warning': chemicalRows.some(row => row.failed),
                  }"
                  >{{ chemicalRows.filter(row => row.failed).length
                  }}<small>项待复核</small></dd
                ></div
              ></dl
            ></section
          >
          <section
            v-for="(group, index) in ACTUAL_GROUPS"
            :key="group.key"
            :data-section="group.key"
            class="ps-panel actual-form-section"
            :aria-label="group.title"
          >
            <header class="ps-panel-heading"
              ><h2
                ><span class="actual-section-index">0{{ index + 1 }}</span
                >{{ group.title }}</h2
              ><span>{{ group.caption }}</span></header
            >
            <C_Form
              class="ps-form"
              :ref="instance => setForm(index, instance)"
              v-model="model"
              :options="group.fields"
              :config="actualConfig"
            />
            <div
              v-if="group.key === 'chemistry'"
              class="ps-grid actual-chemistry-grid"
              ><MachTable
                v-bind="BUSINESS_GRID"
                :row-data="chemicalRows"
                :column-defs="chemicalColumns"
                :row-style-rules="chemicalStyles"
                :theme="themeStore.isDark ? 'dark' : 'light'"
            /></div>
          </section>
          <section
            class="ps-panel"
            aria-label="工序轨迹"
            ><header class="ps-panel-heading"
              ><h2>工序轨迹</h2><span>当班过程记录</span></header
            ><ol class="actual-timeline"
              ><li
                v-for="(step, index) in PROCESS_STEPS"
                :key="step.title"
                ><span>0{{ index + 1 }}</span
                ><div
                  ><strong>{{ step.title }}</strong
                  ><time>{{ step.time }}</time></div
                ><p>{{ step.note }}</p></li
              ></ol
            ></section
          >
        </div>
      </div>
      <p
        role="status"
        class="ps-status-line"
        >{{ notice }}</p
      >
      <C_FormModal
        :editor="reviewEditor"
        :options="REVIEW_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="提交复核"
      />
      <NModal
        v-model:show="historyVisible"
        preset="card"
        title="炉次复核记录"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(720px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NDescriptions
          v-bind="BUSINESS_DETAIL"
          :column="1"
          ><NDescriptionsItem label="炉号">{{ current.no }}</NDescriptionsItem
          ><NDescriptionsItem label="当前状态">{{
            stateOf(current.id, current.state)
          }}</NDescriptionsItem
          ><NDescriptionsItem
            v-if="latest"
            label="最近意见"
            >{{ latest.note }}</NDescriptionsItem
          ></NDescriptions
        >
        <NDivider :style="{ margin: '12px 0' }">复核追溯</NDivider
        ><C_Timeline
          v-if="historyItems.length"
          :items="historyItems"
          size="small"
        /><NEmpty
          v-else
          description="当前炉次暂无本地复核记录"
        />
        <template #footer
          ><NButton
            size="small"
            @click="historyVisible = false"
            >关闭记录</NButton
          ></template
        >
      </NModal>
      <NModal
        v-model:show="referenceVisible"
        preset="card"
        title="上一炉实绩参考"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(900px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NAlert
          type="info"
          :show-icon="false"
          >参考
          {{ previous?.no }}
          的已保存值；核对后请录入当前炉次的真实测量。</NAlert
        >
        <div class="actual-reference-grid"
          ><MachTable
            v-bind="BUSINESS_GRID"
            :row-data="referenceRows"
            :column-defs="referenceColumns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></div>
        <template #footer
          ><NButton
            size="small"
            @click="referenceVisible = false"
            >关闭参考</NButton
          ></template
        >
      </NModal>
    </C_Density>
  </main>
</template>
<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import PageHeading from '../components/c_pageHeading/index.vue'
  import {
    BUSINESS_GRID,
    BUSINESS_FORM,
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
  } from '../shared/presentation'
  import { REVIEW_FIELDS } from './operations'
  import {
    useProductionActual,
    HEATS,
    ACTUAL_GROUPS,
    PROCESS_STEPS,
  } from './data'
  defineOptions({ name: 'ProductionActualWorkbench' })
  const themeStore = s_themeStore()
  const {
    container,
    model,
    current,
    currentId,
    dirty,
    activeSection,
    sections,
    chemicalRows,
    chemicalColumns,
    chemicalStyles,
    saving,
    notice,
    setForm,
    navigate,
    chooseHeat,
    save,
    restore,
    actualConfig,
    heatList,
    reviewEditor,
    reviewActions,
    historyVisible,
    historyItems,
    latest,
    locked,
    stateOf,
    referenceVisible,
    referenceRows,
    referenceColumns,
    previous,
  } = useProductionActual()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
