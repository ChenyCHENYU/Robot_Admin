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
          class="mt-4"
        />
      </NCard>

      <!-- 主表格 -->
      <NCard title="主数据表格">
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
              childSelection: { enabled: config.enableChildSelection },
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
  import { C_Table, type ActionItem } from '@robot-admin/naive-ui-components'
  import { useTableCrud } from '@robot-admin/request-core'
  import {
    defaultConfig,
    dataColumns,
    getChildColumns,
    type ChildDataType,
    type TestRecord,
    type DemoConfig,
  } from './data'

  const config = reactive<DemoConfig>({ ...defaultConfig })
  const tableRef = ref()

  // 表格数据管理
  const table = useTableCrud<TestRecord>({
    api: { list: 'employees/expandList' },
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
      onClick: () => table.refresh(),
    },
  ])

  // 工具函数
  const getRowKey = (row: TestRecord): DataTableRowKey => row.id
  const isRowExpandable = (row: TestRecord): boolean => row.hasChildren === true
  const isRowCheckable = (row: TestRecord): boolean => row.status === '在职'

  // 加载子数据
  const loadChildData = async (row: TestRecord): Promise<ChildDataType[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return row.childData || []
    } catch {
      return []
    }
  }

  // 展开内容渲染
  const renderExpandContent = (
    row: TestRecord,
    expandData: unknown[],
    isLoading: boolean
  ): VNodeChild => {
    if (isLoading) {
      return h('div', { class: 'flex justify-center items-center py-4' }, [
        h(NSpin, { size: 'small' }),
        h('span', { class: 'ml-2' }, '加载中...'),
      ])
    }

    if (!expandData?.length) {
      return h('div', { class: 'text-center py-4' }, '暂无数据')
    }

    const childRows = expandData.filter(isChildDataType)
    if (!childRows.length) {
      return h('div', { class: 'text-center py-4' }, '暂无有效数据')
    }

    const childColumns = getChildColumns(childRows[0])

    return h('div', { class: 'p-4' }, [
      h(
        'div',
        { class: 'mb-2 text-sm text-gray-500' },
        `${row.name} 的详细信息 (${childRows.length} 条)`
      ),
      h(C_Table<ChildDataType>, {
        data: childRows,
        columns: childColumns,
        rowKey: 'id',
        config: {
          selection: { enabled: config.enableChildSelection },
          pagination: false,
          display: { scrollX: 400 },
        },
      }),
    ])
  }

  /** 过滤异步展开返回值，阻止无主键记录进入子表格。 */
  function isChildDataType(value: unknown): value is ChildDataType {
    if (typeof value !== 'object' || value === null) return false
    return typeof Reflect.get(value, 'id') === 'number'
  }
</script>

<style lang="scss" scoped>
  .table-expand-demo {
    padding: 20px;
  }
</style>
