<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\views\production-sales\components\c_dictionaryExperience\index.vue
 * @Description: 字典加载、局部覆盖和恢复的真实组件组合体验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NModal
    :show="true"
    preset="card"
    title="字典联动体验"
    size="small"
    class="dictionary-experience"
    :style="{ width: 'min(1040px, calc(100vw - 32px))' }"
    :content-style="{ maxHeight: 'calc(100dvh - 180px)', overflow: 'auto' }"
    @update:show="!$event && emit('close')"
  >
    <div data-testid="dictionary-experience">
      <div class="dictionary-experience__actions">
        <NTag
          size="small"
          :bordered="false"
          type="info"
          >{{ organization }}</NTag
        >
        <NButton
          size="small"
          @click="switchOrganization"
          >切换体验工厂</NButton
        >
        <NButton
          size="small"
          :disabled="state.loading.value"
          @click="simulate('error')"
          >模拟加载失败</NButton
        >
        <NButton
          size="small"
          :disabled="state.loading.value"
          @click="simulate('empty')"
          >体验空字典</NButton
        >
        <NButton
          size="small"
          :loading="state.loading.value"
          @click="reload"
          >重新加载字典</NButton
        >
        <span data-testid="dictionary-requests"
          >本次仓库请求 {{ requests }} 次</span
        >
      </div>
      <p class="dictionary-experience__hint"
        >仓库字典由四处共享，失败时保留已加载标签并提供重试；账户状态使用应用字典接口，停用项保留历史回显。</p
      >
      <NAlert
        v-if="state.error.value"
        type="warning"
        :show-icon="false"
        class="dictionary-experience__notice"
        data-testid="dictionary-error"
      >
        仓库选项加载失败，已有标签继续可见。<NButton
          text
          type="primary"
          size="small"
          @click="reload"
          >重试仓库字典</NButton
        >
      </NAlert>
      <NAlert
        v-if="state.status.value === 'empty'"
        type="info"
        :show-icon="false"
        class="dictionary-experience__notice"
        data-testid="dictionary-empty"
        >当前工厂暂无可选仓库，已有编码会保留。可重新加载字典。</NAlert
      >
      <div
        class="dictionary-experience__form"
        data-testid="dictionary-form"
      >
        <C_Form
          v-model="form"
          :options="FORM_FIELDS"
          :config="{
            layout: 'grid',
            density: 'compact',
            labelPlacement: 'left',
            labelWidth: 88,
            grid: { cols: 2, minItemWidth: 250 },
            showActions: false,
          }"
        />
      </div>
      <div
        class="dictionary-experience__selection"
        data-testid="dictionary-selection"
        >{{ labels.warehouse }} / {{ labels.delivery }} /
        {{ labels.urgent }}</div
      >
      <C_FormSearch
        v-model="query"
        :form-item-list="SEARCH_FIELDS"
        :config="searchConfig"
        data-testid="dictionary-search"
      />
      <div class="dictionary-experience__tables">
        <section data-testid="dictionary-native-table"
          ><h3>C_Table · 普通枚举文字</h3
          ><C_Table
            :data="visibleRows"
            :columns="TABLE_COLUMNS"
            :config="TABLE_CONFIG"
            row-key="id"
        /></section>
        <section data-testid="dictionary-mach-table"
          ><h3>MachTable · 同源异步翻译</h3
          ><MachTable
            :ref="table.ref"
            v-bind="contentGridOptions(visibleRows.length)"
            :row-data="visibleRows"
            :column-defs="columns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></section>
      </div>
      <p
        class="dictionary-experience__hint"
        data-testid="dictionary-model"
        >提交原值：{{ modelText }}</p
      >
    </div>
    <template #footer
      ><NButton
        size="small"
        @click="emit('close')"
        >关闭体验</NButton
      ></template
    >
  </NModal>
</template>
<script setup lang="ts">
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import { contentGridOptions } from '../../shared/presentation'
  import {
    FORM_FIELDS,
    SEARCH_FIELDS,
    TABLE_COLUMNS,
    TABLE_CONFIG,
    useDictionaryExperience,
  } from './data'
  defineOptions({ name: 'DictionaryExperience' })
  const emit = defineEmits<{ close: [] }>()
  const themeStore = s_themeStore()
  const {
    state,
    form,
    query,
    visibleRows,
    table,
    columns,
    requests,
    organization,
    searchConfig,
    labels,
    modelText,
    reload,
    simulate,
    switchOrganization,
  } = useDictionaryExperience()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
