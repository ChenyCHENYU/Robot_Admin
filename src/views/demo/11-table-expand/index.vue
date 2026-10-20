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
          :row-key="getRowKey"
          :loading="table.loading"
          :config="tableConfig"
        />
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo11TableExpand' })
  import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
  import type { VNodeChild } from 'vue'
  import {
    resolveComponentDensity,
    type ChildSelectionState,
    type TableConfig,
    type TableInstance,
  } from '@robot-admin/naive-ui-components/C_Table'
  import { C_Loading } from '@robot-admin/naive-ui-components/C_Loading'
  import { C_ActionBar } from '@robot-admin/naive-ui-components/C_ActionBar'
  import '@robot-admin/naive-ui-components/C_Table/base.css'
  import type { ActionItem } from '@robot-admin/naive-ui-components'
  import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
  import { createDemoEmployeeSource } from '@/api/demo-employees'
  import {
    defaultConfig,
    dataColumns,
    getChildColumns,
    syncChildSelection,
    type ChildDataType,
    type TestRecord,
    type DemoConfig,
  } from './data'

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
      // 自定义子表通过公开实例方法桥接，父表仍是唯一的选择状态持有者。
      parentChildLink: { enabled: false },
    },
    pagination: false,
    display: { scrollX: 600 },
  }))

  // 表格数据管理
  const table = useNaiveTableCrud<TestRecord>({
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
  const getRowKey = (row: TestRecord): DataTableRowKey => row.id
  const isRowExpandable = (row: TestRecord): boolean => row.hasChildren === true
  const isRowCheckable = (row: TestRecord): boolean => row.status === '在职'

  // 加载子数据
  const loadChildData = async (row: TestRecord): Promise<ChildDataType[]> => {
    expandErrors.delete(row.id)
    await new Promise(resolve => setTimeout(resolve, 300))
    return row.childData || []
  }

  // 展开内容渲染
  const renderExpandContent = (
    row: TestRecord,
    childRows: ChildDataType[],
    isLoading: boolean,
    childSelection?: ChildSelectionState
  ): VNodeChild => {
    if (isLoading) {
      return h('div', { class: 'flex justify-center items-center py-4' }, [
        h(C_Loading, { size: 32, label: '正在加载子表数据' }),
      ])
    }

    const error = expandErrors.get(row.id)
    if (error) {
      return h('div', { class: 'p-4', role: 'alert' }, [
        h('p', error),
        h(C_ActionBar, {
          actions: [
            {
              key: `retry-${row.id}`,
              label: '重试',
              onClick: () => tableRef.value?.retryExpand(row.id),
            },
          ],
        }),
      ])
    }

    if (!childRows.length) {
      return h('div', { class: 'text-center py-4' }, '暂无数据')
    }

    const childColumns: DataTableColumns<ChildDataType> = [
      ...(config.enableChildSelection
        ? [{ type: 'selection' as const, width: 40 }]
        : []),
      ...getChildColumns(childRows[0]),
    ]

    return h(
      'section',
      { class: 'nested-table-detail', 'aria-label': `${row.name} 的详细信息` },
      [
        h(
          'div',
          { class: 'nested-table-detail__heading' },
          `${row.name} 的详细信息 (${childRows.length} 条)`
        ),
        h(NDataTable, {
          data: childRows,
          columns: childColumns,
          rowKey: (child: ChildDataType) => child.id,
          checkedRowKeys: childSelection?.selectedKeys ?? [],
          scrollX: 400,
          tableLayout: 'fixed',
          pagination: false,
          size: controlSize.value,
          onUpdateCheckedRowKeys: keys => {
            if (!tableRef.value) return
            syncChildSelection(
              tableRef.value,
              row,
              childSelection?.selectedKeys ?? [],
              keys,
              childRows,
              config
            )
          },
        }),
      ]
    )
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
