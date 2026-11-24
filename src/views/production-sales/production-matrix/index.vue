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
    :class="{ 'matrix-page--preview': isPreview }"
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
          :type="view.dirty ? 'warning' : 'success'"
          >{{ view.dirty ? '有未保存记录' : '已保存' }}</NTag
        >
        <NButton
          size="small"
          :disabled="!view.dirty"
          :render-icon="actionIcons.restore"
          @click="view.restore"
          >恢复记录</NButton
        >
        <NButton
          size="small"
          type="primary"
          :render-icon="actionIcons.contentSaveOutline"
          @click="view.save"
          >保存检测</NButton
        >
      </PageHeading>
      <dl class="ps-metrics matrix-metrics">
        <div
          ><dt>检测范围</dt
          ><dd>{{ view.days }}<small>天 · 每天 3 班</small></dd></div
        >
        <div
          ><dt>已取样</dt
          ><dd
            >{{ view.statistics.sampled
            }}<small>/ {{ view.statistics.total }} 项</small></dd
          ></div
        >
        <div
          ><dt>待取样</dt
          ><dd
            >{{ view.statistics.total - view.statistics.sampled
            }}<small>项</small></dd
          ></div
        >
        <div :class="{ 'has-warning': view.statistics.warning > 0 }"
          ><dt>超出内控</dt
          ><dd>{{ view.statistics.warning }}<small>项 · 请复核</small></dd></div
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
            >结果 / 取样时间 · {{ view.slots[0]?.date }} 至
            {{ view.slots.at(-1)?.date }}</span
          ></header
        >
        <div class="matrix-toolbar">
          <div class="matrix-toolbar__group"
            ><span class="matrix-field-label">检测周期</span
            ><NSelect
              :value="view.days"
              :options="RANGE_OPTIONS"
              size="small"
              class="matrix-period"
              aria-label="检测周期"
              @update:value="view.changeDays"
            /><NButton
              size="small"
              :disabled="!view.canUndo"
              :render-icon="actionIcons.undoVariant"
              @click="view.undo"
              >撤销</NButton
            ><NButton
              size="small"
              :disabled="!view.canRedo"
              :render-icon="MATRIX_ICONS.redo"
              @click="view.redo"
              >重做</NButton
            ></div
          >
          <div class="matrix-toolbar__group"
            ><NButton
              size="small"
              :render-icon="actionIcons.contentCopy"
              @click="view.copy"
              >复制选区</NButton
            ><NButton
              size="small"
              :render-icon="actionIcons.clipboardListOutline"
              @click="view.openReport"
              >检测报表</NButton
            ></div
          >
        </div>
        <div
          class="matrix-grid"
          data-testid="matrix-grid"
          ><MachTable
            v-bind="view.grid"
            :row-data="view.rows"
            :column-defs="view.columns"
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
        v-model:show="view.reportVisible"
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
          >{{ view.days }} 天 · {{ view.report.length }} 条记录 ·
          包含未取样项，数值与取样时间分别列示</p
        >
        <div class="matrix-report-grid"
          ><MachTable
            preset="detail"
            :pagination="{ pageSize: 20 }"
            :row-data="view.report"
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
              @click="view.reportVisible = false"
              >关闭</NButton
            ><NButton
              size="small"
              :render-icon="MATRIX_ICONS.print"
              @click="view.print"
              >打印</NButton
            ><NButton
              size="small"
              :render-icon="MATRIX_ICONS.download"
              @click="view.exportCsv"
              >导出 CSV</NButton
            ><NButton
              size="small"
              type="primary"
              :loading="view.exporting"
              :render-icon="MATRIX_ICONS.download"
              @click="view.exportXlsx"
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
  import { actionIcons } from '../shared/actionIcons'
  import { s_themeStore } from '@/stores/theme'
  import {
    RANGE_OPTIONS,
    REPORT_COLUMNS,
    MATRIX_ICONS,
    useProductionMatrix,
  } from './data'
  import PageHeading from '../components/PageHeading/index.vue'
  defineOptions({ name: 'ProductionMatrixWorkbench' })
  const route = useRoute()
  const isPreview = computed(() => route.path.startsWith('/preview/'))
  const themeStore = s_themeStore()
  const view = proxyRefs(useProductionMatrix())
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
