<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\production-matrix\index.vue
 * @Description: 酸洗检测矩阵：日期班次、复合结果录入与检测报表
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    class="ps-page matrix-page"
    data-testid="production-matrix"
  >
    <C_Density density="compact">
      <PageHeading
        title="酸洗检测矩阵"
        eyebrow="产销业务 / 质量中心"
        description="按槽位与班次连续记录检测结果，核对内控范围并追溯取样时间。"
        badge="本地业务演示"
      >
        <NTag
          size="small"
          :bordered="false"
          :type="dirty ? 'warning' : 'success'"
          >{{ dirty ? '有未保存记录' : '已保存' }}</NTag
        >
        <NButton
          size="small"
          :disabled="!dirty"
          :render-icon="actionIcons.restore"
          @click="restore"
          >恢复记录</NButton
        >
        <NButton
          size="small"
          type="primary"
          :render-icon="actionIcons.contentSaveOutline"
          @click="save"
          >保存检测</NButton
        >
      </PageHeading>
      <dl class="ps-metrics matrix-metrics">
        <div
          ><dt>检测范围</dt
          ><dd>{{ days }}<small>天 · 每天 3 班</small></dd></div
        >
        <div
          ><dt>已取样</dt
          ><dd
            >{{ statistics.sampled
            }}<small>/ {{ statistics.total }} 项</small></dd
          ></div
        >
        <div
          ><dt>待取样</dt
          ><dd
            >{{ statistics.total - statistics.sampled }}<small>项</small></dd
          ></div
        >
        <div :class="{ 'has-warning': statistics.warning > 0 }"
          ><dt>超出内控</dt
          ><dd>{{ statistics.warning }}<small>项 · 请复核</small></dd></div
        >
      </dl>
      <section
        class="ps-panel matrix-panel"
        aria-label="检测矩阵工作区"
      >
        <header class="ps-panel-heading"
          ><h2
            >槽液检测记录
            <NTag
              size="small"
              :bordered="false"
              type="info"
              >酸洗一线</NTag
            ></h2
          ><span
            >结果 / 取样时间 · {{ slots[0]?.date }} 至
            {{ slots.at(-1)?.date }}</span
          ></header
        >
        <div class="matrix-toolbar">
          <div class="matrix-toolbar__group"
            ><span class="matrix-field-label">检测周期</span
            ><NSelect
              :value="days"
              :options="RANGE_OPTIONS"
              size="small"
              class="matrix-period"
              aria-label="检测周期"
              @update:value="changeDays"
            /><NButton
              size="small"
              :disabled="!canUndo"
              :render-icon="actionIcons.undoVariant"
              @click="undo"
              >撤销</NButton
            ><NButton
              size="small"
              :disabled="!canRedo"
              :render-icon="MATRIX_ICONS.redo"
              @click="redo"
              >重做</NButton
            ></div
          >
          <div class="matrix-toolbar__group"
            ><NButton
              size="small"
              :render-icon="actionIcons.contentCopy"
              @click="copy"
              >复制选区</NButton
            ><NButton
              size="small"
              :render-icon="actionIcons.clipboardListOutline"
              @click="openReport"
              >检测报表</NButton
            ></div
          >
        </div>
        <div
          class="matrix-grid"
          data-testid="matrix-grid"
          ><MachTable
            v-bind="grid"
            :row-data="rows"
            :column-defs="columns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
            grid-aria-label="酸洗槽检测结果与取样时间矩阵"
        /></div>
        <footer class="matrix-help"
          ><div
            ><span class="matrix-legend-dot"></span>正常
            <span class="matrix-legend-dot is-warning"></span>超出内控
            <span class="matrix-legend-dot is-empty"></span>未取样</div
          ><span
            >双击录入 · Tab 切换结果与时间 · Esc 取消 · 粘贴格式：52.50 @
            08:30</span
          ></footer
        >
      </section>
      <NModal
        v-model:show="reportVisible"
        preset="card"
        title="检测报表"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(1120px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        class="matrix-report-modal"
      >
        <p class="matrix-report-context"
          >{{ days }} 天 · {{ report.length }} 条记录 ·
          包含未取样项，数值与取样时间分别列示</p
        >
        <div class="matrix-report-grid"
          ><MachTable
            preset="detail"
            :pagination="{ pageSize: 20 }"
            :row-data="report"
            :column-defs="REPORT_COLUMNS"
            :row-height="30"
            :theme="themeStore.isDark ? 'dark' : 'light'"
            grid-aria-label="检测报表明细"
        /></div>
        <template #footer
          ><NSpace
            justify="end"
            :size="8"
            ><NButton
              size="small"
              :render-icon="actionIcons.close"
              @click="reportVisible = false"
              >关闭</NButton
            ><NButton
              size="small"
              :render-icon="MATRIX_ICONS.print"
              @click="print"
              >打印</NButton
            ><NButton
              size="small"
              :render-icon="MATRIX_ICONS.download"
              @click="exportCsv"
              >导出 CSV</NButton
            ><NButton
              size="small"
              type="primary"
              :loading="exporting"
              :render-icon="MATRIX_ICONS.download"
              @click="exportXlsx"
              >导出 Excel</NButton
            ></NSpace
          ></template
        >
      </NModal>
    </C_Density>
  </main>
</template>
<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable } from '@agile-team/mach-table-vue'
  import PageHeading from '../components/c_pageHeading/index.vue'
  import { actionIcons } from '../shared/actionIcons'
  import { s_themeStore } from '@/stores/theme'
  import {
    RANGE_OPTIONS,
    REPORT_COLUMNS,
    MATRIX_ICONS,
    useProductionMatrix,
  } from './data'
  defineOptions({ name: 'ProductionMatrixWorkbench' })
  const themeStore = s_themeStore()
  const {
    rows,
    days,
    slots,
    columns,
    grid,
    dirty,
    canUndo,
    canRedo,
    statistics,
    report,
    reportVisible,
    exporting,
    changeDays,
    undo,
    redo,
    save,
    restore,
    openReport,
    exportCsv,
    exportXlsx,
    print,
    copy,
  } = useProductionMatrix()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
