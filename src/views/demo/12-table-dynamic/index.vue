<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\demo\12-table-dynamic\index.vue
 * @Description: 表格演示配置与展示；数据源遵循项目运行模式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 -->
<template>
  <div class="table-dynamic-demo">
    <c_vTitle
      title="动态表格场景示例"
      icon="mdi:table-sync"
      description="支持动态增删行、行内编辑、顺序调整与打印水印，修改仅保存在当前演示中"
    />

    <NCard class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">员工信息管理（例）</h3>
          <C_ActionBar :actions="headerActions" />
        </div>
      </template>

      <div
        ref="tableContainer"
        class="c-table-wrapper relative"
      >
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="dynamicTableColumns"
          :loading="loading"
          row-key="id"
          :config="{ ...tableConfig, actions: tableActions }"
          @row-add="handleRowAdd"
          @row-delete="handleRowDelete"
          @save="handleSave"
          @view-detail="handleViewDetail"
          @row-selection-change="handleRowSelectionChange"
        />

        <!-- 自动铺满水印 -->
        <div
          ref="watermarkLayer"
          class="auto-watermark absolute inset-0 pointer-events-none"
          :style="watermarkStyle"
        ></div>
      </div>

      <NAlert
        v-if="selectedEmployee"
        type="info"
        class="mt-4"
        closable
        @close="clearSelection"
      >
        <strong>已选中：</strong>{{ selectedEmployee.name }} -
        {{ selectedEmployee.department }}
      </NAlert>
    </NCard>

    <NCard title="操作日志">
      <template #header-extra>
        <NButton
          size="small"
          @click="logs = []"
        >
          清空
        </NButton>
      </template>

      <div class="log-list">
        <div
          v-for="log in logs.slice(0, 6)"
          :key="log.time"
          class="log-item"
        >
          <NTag
            :type="getLogTagType(log.type)"
            size="small"
          >
            {{ log.type }}
          </NTag>
          <span class="log-message">{{ log.message }}</span>
          <NTime
            :time="new Date(log.time)"
            type="relative"
            class="log-time"
          />
        </div>
        <NEmpty
          v-if="logs.length === 0"
          description="暂无操作记录"
        />
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo12TableDynamic' })
  import type { DataTableRowKey } from 'naive-ui'
  import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
  import type {
    SimpleTableActions,
    TableConfig,
    TableInstance,
  } from '@robot-admin/naive-ui-components/C_Table'
  import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
  import { createDemoEmployeeSource } from '@/api/demo-employees'
  import { toCrudTableColumns } from '@/utils/d_tableColumns'
  import { delayWithSignal } from '@/utils/abort'
  import {
    type DynamicEmployee,
    type Log,
    dynamicTableColumns,
    getLogTagType,
    createDefaultEmployee,
    generateRandomEmployee,
  } from './data'

  const message = useMessage()

  // 表头操作按钮
  const headerActions = computed<ActionItem[]>(() => [
    {
      key: 'reset',
      label: '重置数据',
      loading: loading.value,
      onClick: resetData,
    },
    {
      key: 'add',
      label: '添加员工',
      disabled: loading.value,
      onClick: addEmployee,
    },
  ])

  const tableRef = ref<TableInstance<DynamicEmployee> | null>(null)
  const selectedEmployeeKey = ref<DataTableRowKey | null>(null)
  const logs = ref<Log[]>([])
  const watermarkStyle = ref('')

  // 表格数据管理
  const source = createDemoEmployeeSource('employees/dynamicList')
  const table = useNaiveTableCrud<DynamicEmployee>({
    // 本页的增删编辑是本地草稿，仅复用查询；真实接口契约的数字 id 不被改写。
    source: 'query' in source ? { query: source.query } : source,
    defaultPaginationEnabled: false,
    columns: toCrudTableColumns(dynamicTableColumns),
  })

  const { data: tableData, loading, refresh } = table
  const selectedEmployee = computed(
    () =>
      tableData.value.find(row => row.id === selectedEmployeeKey.value) ?? null
  )

  // 水印生成
  const createWatermark = () => {
    const text = 'Robot Admin'
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="180" height="100">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
          font-family="Arial" font-size="16" fill="rgba(100,100,100,0.25)"
          transform="rotate(-45 90 50)">${text}</text>
      </svg>
    `
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    watermarkStyle.value = `background-image: url("${svgUrl}"); background-repeat: repeat;`
  }

  // 表格操作
  const tableActions = computed((): SimpleTableActions<DynamicEmployee> => ({
    detail: async (row: DynamicEmployee) => {
      await delayWithSignal(200)
      return { data: row }
    },
    delete: async () => {
      await delayWithSignal(200)
      return { success: true }
    },
  }))

  // 表格配置
  const tableConfig: TableConfig<DynamicEmployee> = {
    pagination: false,
    dynamicRows: {
      enableRadioSelection: true,
      enableAdd: true,
      enableInsert: true,
      enableDelete: true,
      enableCopy: true,
      enableMove: true,
      enablePrint: true,
      printTargetSelector: '.c-table-wrapper',
      printOptions: {
        watermark: {
          text: 'Robot Admin',
          position: 'repeat' as const,
          textSize: 16,
          textColor: 'rgba(100, 100, 100, 0.25)',
          xGap: 200,
          yGap: 120,
          rotate: -45,
        },
      },
      defaultRowData: createDefaultEmployee,
    },
    edit: {
      mode: 'both',
      onSave: () => delayWithSignal(300),
    },
  }

  // 日志管理
  const addLog = (type: Log['type'], message: string) => {
    logs.value.unshift({ type, message, time: new Date().toISOString() })
    if (logs.value.length > 20) logs.value.splice(20)
  }

  // 事件处理
  const handleViewDetail = (data: DynamicEmployee) => {
    const employee = data
    message.info(`查看 ${employee.name} 的详细信息`)
    addLog('select', `查看了 ${employee.name} 的详情`)
  }

  const handleRowAdd = (newRow: DynamicEmployee) => {
    addLog('add', `添加了新员工：${newRow.name}`)
  }

  const handleRowDelete = (employee: DynamicEmployee) => {
    tableData.value = tableData.value.filter(row => row.id !== employee.id)
    addLog('delete', `删除了员工：${employee.name}`)
    if (selectedEmployeeKey.value === employee.id)
      selectedEmployeeKey.value = null
  }

  const handleSave = (rowData: DynamicEmployee) => {
    const employee = rowData
    message.success(`保存成功：${employee.name}`)
    addLog('edit', `编辑了员工 ${employee.name} 的信息`)
  }

  const resetData = async () => {
    await refresh()
    if (table.error.value) return
    logs.value = []
    tableRef.value?.clearRowSelection()
    message.success('数据已重置')
  }

  const addEmployee = () => {
    const newEmployee = generateRandomEmployee()
    tableData.value = [...tableData.value, newEmployee]
    message.success(`添加员工：${newEmployee.name}`)
    addLog('add', `手动添加了员工：${newEmployee.name}`)
  }

  const clearSelection = () => {
    tableRef.value?.clearRowSelection()
    message.info('已清空选择')
  }

  const handleRowSelectionChange = (key: DataTableRowKey | null) => {
    selectedEmployeeKey.value = key
  }

  onMounted(createWatermark)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
