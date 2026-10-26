<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\components\c_importValidation\index.vue
 * @Description: 类型化矩阵导入校验与本地确认体验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section
    class="mach-import-validation"
    :data-status="phase"
    :aria-busy="busy"
  >
    <header class="mach-import-heading">
      <div
        ><h3>先校验，再确认导入</h3
        ><p
          >MachTable v{{ version }} ·
          {{ table.ready.value ? 'Grid Ready' : '初始化中' }}</p
        ></div
      >
      <strong class="mach-import-count"
        >本地数据 <output>{{ count }}</output> 行</strong
      >
    </header>
    <NAlert
      type="info"
      :show-icon="false"
      >仅本地体验，不读取文件、不联网、不写订单接口。候选数据先经列解析、列校验和整行规则，再由你确认写入。</NAlert
    >
    <div class="mach-import-controls">
      <div class="mach-import-actions">
        <NButton
          size="small"
          @click="sample('valid')"
          >正常样例</NButton
        >
        <NButton
          size="small"
          @click="sample('invalid')"
          >错误样例</NButton
        >
        <NButton
          size="small"
          @click="sample('duplicate')"
          >重复编号样例</NButton
        >
      </div>
      <NRadioGroup
        v-model:value="mode"
        aria-label="导入模式"
        name="import-mode"
        size="small"
        :disabled="phase === 'committing'"
      >
        <NRadioButton value="replace">替换当前数据</NRadioButton>
        <NRadioButton value="append">追加到当前数据</NRadioButton>
      </NRadioGroup>
    </div>
    <label class="mach-import-input-label"
      >导入 JSON 矩阵
      <small
        >每行依次：编号、订单名称、数量、金额、交付日期、启用；最多 20 行</small
      ></label
    >
    <NInput
      v-model:value="input"
      type="textarea"
      aria-label="导入 JSON 矩阵"
      :input-props="{ 'aria-label': '导入 JSON 矩阵' }"
      :autosize="{ minRows: 4, maxRows: 8 }"
      :maxlength="20000"
      :readonly="phase === 'committing'"
      spellcheck="false"
    />
    <p class="mach-import-hint"
      >编号请保留双引号；数字和 true / false 可直接填写。日期使用
      YYYY-MM-DD。启用的订单金额必须大于 0。</p
    >
    <div class="mach-import-actions">
      <NButton
        type="primary"
        :disabled="!table.ready.value || busy"
        :loading="phase === 'previewing'"
        @click="inspect"
        >校验预览</NButton
      >
      <NButton
        type="success"
        :disabled="!table.ready.value || phase !== 'ready'"
        :loading="phase === 'committing'"
        @click="commit"
        >确认导入</NButton
      >
      <NButton
        :disabled="!table.ready.value"
        @click="reset"
        >重置本地数据</NButton
      >
      <NButton
        :disabled="!table.ready.value || busy"
        @click="showExport"
        >查看类型化导出</NButton
      >
    </div>
    <p
      class="mach-import-status"
      role="status"
      aria-live="polite"
      >{{ status }}</p
    >
    <NAlert
      v-if="error"
      type="error"
      class="mach-import-issues"
      :show-icon="false"
      >{{ error }}</NAlert
    >
    <div
      v-if="preview?.issues.length"
      class="mach-import-issues"
      role="alert"
    >
      <strong
        >发现 {{ preview.issues.length }} 项问题，展示前 20
        项；不合格数据不会写入</strong
      >
      <ul
        ><li
          v-for="(issue, index) in preview.issues.slice(0, 20)"
          :key="index"
          >{{ describeImportIssue(issue) }}</li
        ></ul
      >
    </div>
    <div
      v-if="normalizedRows.length"
      class="mach-import-preview mach-import-scroll"
    >
      <h4>规范值预览 · {{ normalizedRows.length }} 行</h4>
      <table
        ><thead
          ><tr
            ><th>行</th
            ><th
              v-for="label in IMPORT_LABELS"
              :key="label"
              >{{ label }}</th
            ></tr
          ></thead
        >
        <tbody
          ><tr
            v-for="row in normalizedRows"
            :key="row.rowIndex"
            ><td>{{ row.rowIndex + 1 }}</td>
            <td
              v-for="(value, columnIndex) in row.values"
              :key="columnIndex"
              ><span>{{ displayImportValue(value) }}</span
              ><small>{{ importValueType(value) }}</small></td
            >
          </tr></tbody
        >
      </table>
    </div>
    <div class="mach-import-grid">
      <MachTable
        :ref="table.ref"
        :row-data="initialRows"
        :column-defs="IMPORT_COLUMNS"
        :theme="theme"
        row-key="id"
        :pagination="false"
        :persistence="false"
        :row-edit-validator="validateImportRow"
        :default-col-def="{ sortable: false, filter: false }"
        size="compact"
      />
    </div>
    <div
      v-if="exported"
      class="mach-import-export"
    >
      <h4>类型化导出 · 共 {{ exportCount }} 行，最多展示前 20 行</h4>
      <p
        >以下类型来自 exportMatrix 原始值。JSON 会将 Date 展示为 ISO
        文本；表格中的金额格式不改变导出的 number。</p
      >
      <div class="mach-import-type-list"
        ><NTag
          v-for="type in exportTypes"
          :key="type"
          size="small"
          :bordered="false"
          >{{ type }}</NTag
        ></div
      >
      <pre>{{ JSON.stringify(exported, null, 2) }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable, version } from '@agile-team/mach-table-vue'
  import {
    IMPORT_COLUMNS,
    IMPORT_LABELS,
    describeImportIssue,
    displayImportValue,
    importValueType,
    validateImportRow,
  } from './data'
  import { useImportValidation } from './useImportValidation'

  defineOptions({ name: 'MachImportValidation' })
  interface Props {
    theme: 'light' | 'dark'
  }
  defineProps<Props>()
  const {
    table,
    initialRows,
    input,
    mode,
    phase,
    preview,
    error,
    count,
    exported,
    exportCount,
    exportTypes,
    normalizedRows,
    busy,
    status,
    sample,
    inspect,
    commit,
    reset,
    showExport,
  } = useImportValidation()
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
