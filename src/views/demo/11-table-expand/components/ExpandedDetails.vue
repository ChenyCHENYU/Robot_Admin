<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 展开子表的加载状态、错误反馈和内容展示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    v-if="loading"
    class="flex justify-center items-center py-4"
  >
    <C_Loading
      :size="32"
      label="正在加载子表数据"
    />
  </div>
  <div
    v-else-if="error"
    class="p-4"
    role="alert"
  >
    <p>{{ error }}</p>
    <C_ActionBar :actions="retryActions" />
  </div>
  <div
    v-else-if="!rows.length"
    class="text-center py-4"
    >暂无数据</div
  >
  <section
    v-else
    class="nested-table-detail"
    :aria-label="`${name} 的详细信息`"
  >
    <div class="nested-table-detail__heading">
      {{ name }} 的详细信息 ({{ rows.length }} 条)
    </div>
    <NDataTable
      :data="rows"
      :columns="columns"
      :row-key="child => child.id"
      :checked-row-keys="selectedKeys"
      :scroll-x="400"
      table-layout="fixed"
      :pagination="false"
      :size="size"
      :theme-overrides="themeOverrides"
      @update:checked-row-keys="emit('selectionChange', $event)"
    />
  </section>
</template>

<script setup lang="ts">
  import type {
    DataTableColumns,
    DataTableProps,
    DataTableRowKey,
  } from 'naive-ui'
  import { getChildColumns, type ChildDataType } from '../data'

  defineOptions({ name: 'ExpandedDetails' })
  const props = defineProps<{
    rowId: DataTableRowKey
    name: string
    rows: ChildDataType[]
    loading: boolean
    error?: string
    selectable: boolean
    selectedKeys: DataTableRowKey[]
    size: DataTableProps['size']
  }>()
  const emit = defineEmits<{
    retry: []
    selectionChange: [keys: DataTableRowKey[]]
  }>()

  // 原生子表沿用父表的实际留白。
  const themeOverrides: DataTableProps['themeOverrides'] = {
    thPaddingSmall: 'inherit',
    thPaddingMedium: 'inherit',
    thPaddingLarge: 'inherit',
    tdPaddingSmall: 'inherit',
    tdPaddingMedium: 'inherit',
    tdPaddingLarge: 'inherit',
  }
  const columns = computed<DataTableColumns<ChildDataType>>(() => {
    const first = props.rows[0]
    if (!first) return []
    const data = getChildColumns(first)
    return props.selectable ? [{ type: 'selection', width: 40 }, ...data] : data
  })
  const retryActions = computed(() => [
    {
      key: `retry-${props.rowId}`,
      label: '重试',
      icon: 'mdi:reload',
      onClick: () => emit('retry'),
    },
  ])
</script>
