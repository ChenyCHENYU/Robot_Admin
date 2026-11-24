<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\demo\11-table-expand\index.vue
 * @Description: 表格演示配置与展示；数据源遵循项目运行模式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 -->
<template>
  <div class="table-expand-demo">
    <c_vTitle
      title="嵌套表格场景示例"
      icon="mdi:table-arrow-down"
      description="支持父子表格联动选择、展开折叠、动态加载子数据等功能"
    />

    <NSpace
      vertical
      size="large"
    >
      <!-- 功能配置 -->
      <NCard
        title="功能配置"
        size="small"
      >
        <NSpace class="mt-4">
          <NRadioGroup
            v-model:value="config.density"
            name="expandTableDensity"
          >
            <NRadioButton value="compact">紧凑</NRadioButton>
            <NRadioButton value="default">标准</NRadioButton>
            <NRadioButton value="comfortable">舒适</NRadioButton>
          </NRadioGroup>
          <NCheckbox v-model:checked="config.enableSelection">
            启用父表格选择
          </NCheckbox>
          <NCheckbox v-model:checked="config.enableChildSelection">
            启用子表格选择
          </NCheckbox>
          <NRadioGroup
            v-model:value="config.parentChildLinkMode"
            :disabled="!config.enableSelection || !config.enableChildSelection"
          >
            <NSpace>
              <NRadio value="strict">严格模式（子表格全选才选中父行）</NRadio>
              <NRadio value="loose">宽松模式（子表格有选中就选中父行）</NRadio>
            </NSpace>
          </NRadioGroup>
        </NSpace>
      </NCard>

      <!-- 操作工具栏 -->
      <NCard
        title="批量操作"
        size="small"
      >
        <C_ActionBar
          :actions="toolbarActions"
          :config="{ size: controlSize }"
          class="mt-4"
        />
      </NCard>

      <!-- 主表格 -->
      <NCard title="主数据表格">
        <C_Table
          ref="tableRef"
          :columns="mainColumns"
          :data="table.data"
          :loading="table.loading"
          :config="tableConfig"
        />
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo11TableExpand' })
  import type { DataTableRowKey } from 'naive-ui'
  import {
    resolveComponentDensity,
    type ChildSelectionState,
    type TableConfig,
    type TableInstance,
  } from '@robot-admin/naive-ui-components/C_Table'
  import '@robot-admin/naive-ui-components/C_Table/base.css'
  import type { ActionItem } from '@robot-admin/naive-ui-components'
  import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
  import { createDemoEmployeeSource } from '@/api/demo-employees'
  import {
    defaultConfig,
    dataColumns,
    syncChildSelection,
    type ChildDataType,
    type TestRecord,
    type DemoConfig,
  } from './data'
  import ExpandedDetails from './components/ExpandedDetails.vue'

  const config = reactive<DemoConfig>({ ...defaultConfig })
  const controlSize = computed(
    () => resolveComponentDensity(config.density).size
  )
  const tableRef = ref<TableInstance<TestRecord, ChildDataType> | null>(null)
  const expandErrors = reactive(new Map<DataTableRowKey, string>())
  const mainColumns = computed(() =>
    dataColumns.filter(
      column =>
        config.enableSelection ||
        !('type' in column) ||
        column.type !== 'selection'
    )
  )
  const tableConfig = computed<TableConfig<TestRecord, ChildDataType>>(() => ({
    density: config.density,
    expand: {
      enabled: true,
      onLoadData: loadChildData,
      onError: (error, row) => {
        expandErrors.set(
          row.id,
          error instanceof Error ? error.message : '子表加载失败'
        )
      },
      renderContent: renderExpandContent,
      rowExpandable: isRowExpandable,
    },
    selection: {
      enabled: config.enableSelection,
      rowCheckable: isRowCheckable,
      childSelection: { enabled: config.enableChildSelection },
      // 自定义子表同样使用包内联动规则，页面不再复制严格/宽松选择算法。
      parentChildLink: { enabled: true, mode: config.parentChildLinkMode },
    },
    pagination: false,
    display: { scrollX: 600 },
  }))

  // 表格数据管理
  const table = useNaiveTableCrud({
    source: createDemoEmployeeSource('employees/expandList'),
    defaultPaginationEnabled: false,
    columns: dataColumns,
  })

  // 工具栏按钮
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'expand-all',
      label: '全部展开',
      type: 'primary',
      onClick: () => tableRef.value?.expandAll(),
    },
    {
      key: 'collapse-all',
      label: '全部折叠',
      onClick: () => tableRef.value?.collapseAll(),
    },
    {
      key: 'select-all',
      label: '父表格全选',
      type: 'success',
      show: config.enableSelection,
      onClick: () => tableRef.value?.selectAll(),
    },
    {
      key: 'clear-selection',
      label: '父表格清空',
      show: config.enableSelection,
      onClick: () => tableRef.value?.clearSelection(),
    },
    {
      key: 'clear-all',
      label: '清空所有选择',
      type: 'error',
      show: config.enableSelection || config.enableChildSelection,
      onClick: () => tableRef.value?.clearAllSelections(),
    },
    {
      key: 'refresh',
      label: '刷新数据',
      type: 'info',
      loading: table.loading.value,
      onClick: async () => {
        tableRef.value?.collapseAll()
        tableRef.value?.invalidateExpand()
        expandErrors.clear()
        await table.refresh()
      },
    },
  ])

  // 工具函数
  const isRowExpandable = (row: TestRecord): boolean => row.hasChildren === true
  const isRowCheckable = (row: TestRecord): boolean => row.status === '在职'

  // 加载子数据
  const loadChildData = async (row: TestRecord): Promise<ChildDataType[]> => {
    expandErrors.delete(row.id)
    await new Promise(resolve => setTimeout(resolve, 300))
    return row.childData || []
  }

  const renderExpandContent = (
    row: TestRecord,
    rows: ChildDataType[],
    loading: boolean,
    childSelection?: ChildSelectionState
  ) => {
    const selectedKeys = childSelection?.selectedKeys ?? []
    return h(ExpandedDetails, {
      rowId: row.id,
      name: row.name,
      rows,
      loading,
      error: expandErrors.get(row.id),
      selectable: config.enableChildSelection,
      selectedKeys,
      size: controlSize.value,
      onRetry: () => tableRef.value?.retryExpand(row.id),
      onSelectionChange: keys => {
        if (tableRef.value)
          syncChildSelection(tableRef.value, row.id, selectedKeys, keys)
      },
    })
  }

  watch(
    () => [
      config.enableSelection,
      config.enableChildSelection,
      config.parentChildLinkMode,
    ],
    () => tableRef.value?.clearAllSelections()
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
