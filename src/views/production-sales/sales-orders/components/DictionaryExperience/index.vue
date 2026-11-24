<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \\Robot_Admin\\src\\views\\production-sales\\sales-orders\\components\\DictionaryExperience\\index.vue
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
          >{{ page.organization }}</NTag
        >
        <NButton
          size="small"
          @click="page.switchOrganization"
          :render-icon="actionIcons.swapHorizontal"
          >切换体验工厂</NButton
        >
        <NButton
          size="small"
          :disabled="page.state.loading.value"
          @click="page.simulate('error')"
          :render-icon="actionIcons.alertCircleOutline"
          >模拟加载失败</NButton
        >
        <NButton
          size="small"
          :disabled="page.state.loading.value"
          @click="page.simulate('empty')"
          :render-icon="actionIcons.inboxOutline"
          >体验空字典</NButton
        >
        <NButton
          size="small"
          :loading="page.state.loading.value"
          @click="page.reload"
          :render-icon="actionIcons.refresh"
          >重新加载字典</NButton
        >
        <span data-testid="dictionary-requests"
          >本次仓库请求 {{ page.requests }} 次</span
        >
      </div>
      <p class="dictionary-experience__hint"
        >仓库字典由四处共享，失败时保留已加载标签并提供重试；账户状态使用应用字典接口，停用项保留历史回显。</p
      >
      <NAlert
        v-if="page.state.error.value"
        type="warning"
        :show-icon="false"
        class="dictionary-experience__notice"
        data-testid="dictionary-error"
      >
        仓库选项加载失败，已有标签继续可见。<NButton
          text
          type="primary"
          size="small"
          @click="page.reload"
          :render-icon="actionIcons.refresh"
          >重试仓库字典</NButton
        >
      </NAlert>
      <NAlert
        v-if="page.state.status.value === 'empty'"
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
          v-model="page.form"
          :options="page.formFields"
          :config="{
            layout: 'grid',
            density: 'compact',
            labelPlacement: 'left',
            labelWidth: 88,
            grid: { cols: 2, minItemWidth: 250 },
            showActions: false,
          }"
        />
        <div
          class="dictionary-experience__standalone"
          data-testid="dictionary-standalone-select"
        >
          <span>独立选择</span>
          <C_Select
            v-model="page.form.delivery"
            :options="page.deliveryOptions"
            size="small"
            multiple
            filterable
            clearable
            placeholder="请选择运输方式"
            :input-props="{ 'aria-label': '独立选择运输方式' }"
          />
        </div>
      </div>
      <div
        class="dictionary-experience__selection"
        data-testid="dictionary-selection"
        >{{ page.labels.warehouse }} / {{ page.labels.delivery }} /
        {{ page.labels.urgent }} / {{ page.labels.account }}</div
      >
      <C_FormSearch
        v-model="page.query"
        :form-item-list="page.searchFields"
        :config="page.searchConfig"
        data-testid="dictionary-search"
      />
      <div class="dictionary-experience__tables">
        <section data-testid="dictionary-native-table"
          ><h3>C_Table · 普通枚举文字</h3
          ><C_Table
            :data="page.visibleRows"
            :columns="page.tableColumns"
            :config="TABLE_CONFIG"
        /></section>
        <section data-testid="dictionary-mach-table"
          ><h3>MachTable · 同源异步翻译</h3
          ><MachTable
            :ref="page.table.ref"
            v-bind="BUSINESS_CONTENT_GRID"
            :row-data="page.visibleRows"
            :column-defs="page.columns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></section>
      </div>
      <p
        class="dictionary-experience__hint"
        data-testid="dictionary-model"
        >提交原值：{{ page.modelText }}</p
      >
    </div>
    <template #footer
      ><NButton
        size="small"
        @click="emit('close')"
        :render-icon="actionIcons.close"
        >关闭体验</NButton
      ></template
    >
  </NModal>
</template>
<script setup lang="ts">
  import { actionIcons } from '../../../shared/actionIcons'
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import { BUSINESS_CONTENT_GRID } from '../../../shared/presentation'
  import { TABLE_CONFIG, useDictionaryExperience } from './data'
  defineOptions({ name: 'DictionaryExperience' })
  const emit = defineEmits<{ close: [] }>()
  const themeStore = s_themeStore()
  const page = proxyRefs(useDictionaryExperience())
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
