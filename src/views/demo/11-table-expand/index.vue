<template>
  <div class="p-6 min-h-screen">
    <NH1>嵌套表格场景示例</NH1>
    <NSpace
      vertical
      size="large"
    >
      <!-- 功能配置 -->
      <NCard
        title="功能配置"
        size="small"
        class="shadow-md"
      >
        <NSpace>
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
        class="shadow-md"
      >
        <C_ActionBar
          :actions="toolbarActions"
          :config="{ size: 'small' }"
        />
      </NCard>

      <!-- 主表格 -->
      <NCard
        title="主数据表格"
        class="shadow-md"
      >
        <C_Table
          ref="tableRef"
          :columns="dataColumns"
          :data="table.data"
          :row-key="getRowKey"
          :loading="table.loading"
          :config="{
            expand: {
              enabled: true,
              onLoadData: loadChildData,
              renderContent: renderExpandContent,
              rowExpandable: isRowExpandable,
            },
            selection: {
              enabled: config.enableSelection,
              rowCheckable: isRowCheckable,
              childSelection: {
                enabled: config.enableChildSelection,
              },
              parentChildLink: {
                enabled: config.enableSelection && config.enableChildSelection,
                mode: config.parentChildLinkMode,
              },
            },
            display: { scrollX: 600 },
          }"
        />
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import { type DataTableRowKey, NSpin } from 'naive-ui/es'
  import type { VNodeChild } from 'vue'
  import C_Table from '@/components/global/C_Table/index.vue'
  import type { ActionItem } from '@/types/modules/action-bar'
  import type {
    DataRecord,
    TableColumn,
    TestRecord,
    DemoConfig,
  } from '@/types/modules/table'
  import {
    defaultConfig,
    dataColumns,
    getChildColumns,
    type ChildDataType,
    type EnhancedTestRecord,
  } from './data'

  import { useTableCrud } from '@robot-admin/request-core'

  const config = reactive<DemoConfig>({ ...defaultConfig })
  const tableRef = ref()

  // 使用 useTableCrud 管理数据
  const table = useTableCrud<TestRecord>({
    api: {
      list: 'employees/expandList',
    },
    columns: dataColumns,
  })

  // 工具栏操作按钮
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
      key: 'clear-all-selections',
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
      onClick: () => table.refresh(),
    },
  ])

  // 工具函数
  const getRowKey = (row: DataRecord): DataTableRowKey => (row as TestRecord).id
  const isRowExpandable = (row: DataRecord): boolean =>
    (row as EnhancedTestRecord).hasChildren
  const isRowCheckable = (row: DataRecord): boolean =>
    (row as TestRecord).status === '在职'

  const loadChildData = async (row: DataRecord): Promise<ChildDataType[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return (row as EnhancedTestRecord).childData || []
    } catch (error) {
      console.error('加载子数据失败:', error)
      return []
    }
  }

  // 展开渲染逻辑
  const renderExpandContent = (
    row: DataRecord,
    expandData: DataRecord[],
    isLoading: boolean
  ): VNodeChild => {
    const testRow = row as EnhancedTestRecord

    if (isLoading) {
      return h('div', { class: 'flex justify-center items-center py-4' }, [
        h(NSpin, { size: 'small' }),
        h('span', { class: 'ml-2' }, '加载中...'),
      ])
    }

    if (!expandData?.length) {
      return h('div', { class: 'text-center py-4 ' }, '暂无数据')
    }

    const childColumns = getChildColumns(
      expandData[0] as unknown as ChildDataType
    )

    return h('div', { class: 'p-4' }, [
      h(
        'div',
        { class: 'mb-2 text-sm text-gray-6' },
        `${testRow.name} 的详细信息 (${expandData.length} 条)`
      ),
      h(C_Table, {
        data: expandData,
        columns: childColumns as TableColumn<DataRecord>[],
        rowKey: (child: DataRecord) => (child as unknown as ChildDataType).id,
        config: {
          selection: { enabled: config.enableChildSelection },
          pagination: false,
          display: { scrollX: 400 },
        },
      }),
    ])
  }
</script>
