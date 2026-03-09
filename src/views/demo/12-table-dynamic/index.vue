<template>
  <div class="table-dynamic-demo">
    <c_vTitle
      title="动态表格场景示例"
      icon="mdi:table-sync"
      description="支持动态增删行、行内编辑、拖拽排序、打印水印等高级功能"
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
          :data="tableData"
          :columns="dynamicTableColumns"
          :loading="loading"
          :config="{ ...tableConfig, actions: tableActions }"
          @row-add="handleRowAdd"
          @row-delete="handleRowDelete"
          @save="handleSave"
          @view-detail="handleViewDetail"
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

<style lang="scss" scoped>
  .table-dynamic-demo {
    padding: 20px;
  }
  .log-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .log-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 4px;
    background: var(--n-color-modal);
  }
  .log-message {
    flex: 1;
  }
  .log-time {
    font-size: 12px;
    color: var(--n-text-color-3);
  }
</style>

<script setup lang="ts">
  import type {
    DataRecord,
    SimpleTableActions,
  } from '@robot-admin/naive-ui-components'
  import { useTableCrud } from '@robot-admin/request-core'
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
  const headerActions = computed(() => [
    { label: '重置数据', onClick: resetData },
    { label: '添加员工', type: 'primary' as const, onClick: addEmployee },
  ])

  const tableRef = ref()
  const selectedEmployee = ref<DynamicEmployee | null>(null)
  const logs = ref<Log[]>([])
  const watermarkStyle = ref('')

  // 表格数据管理
  const table = useTableCrud<DynamicEmployee>({
    api: { list: 'employees/dynamicList' },
    columns: dynamicTableColumns,
  })

  const { data: tableData, loading, refresh } = table

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
    const svgUrl = URL.createObjectURL(
      new Blob([svg], { type: 'image/svg+xml' })
    )
    watermarkStyle.value = `background-image: url("${svgUrl}"); background-repeat: repeat;`
  }

  // 表格操作
  const tableActions = computed(
    (): SimpleTableActions<DataRecord> => ({
      detail: async (row: DataRecord) => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return { data: row }
      },
      edit: async (row: DataRecord) => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return { success: true, data: row }
      },
      delete: async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return { success: true }
      },
    })
  )

  // 表格配置
  const tableConfig = {
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
      onRowChange: (data: DataRecord[]) =>
        console.log('行数据变化:', data.length, '行'),
      defaultRowData: createDefaultEmployee,
    },
    edit: { modalTitle: '编辑员工信息', modalWidth: 700 },
  }

  // 日志管理
  const addLog = (type: Log['type'], message: string) => {
    logs.value.unshift({ type, message, time: new Date().toISOString() })
    if (logs.value.length > 20) logs.value.splice(20)
  }

  // 事件处理
  const handleViewDetail = (data: DataRecord) => {
    const employee = data as DynamicEmployee
    message.info(`查看 ${employee.name} 的详细信息`)
    addLog('select', `查看了 ${employee.name} 的详情`)
  }

  const handleRowAdd = (newRow: DataRecord) => {
    addLog('add', `添加了新员工：${(newRow as DynamicEmployee).name}`)
  }

  const handleRowDelete = (...args: unknown[]) => {
    const [deletedRow] = args as [DataRecord, number]
    const employee = deletedRow as DynamicEmployee
    addLog('delete', `删除了员工：${employee.name}`)
    if (selectedEmployee.value?.id === employee.id)
      selectedEmployee.value = null
  }

  const handleSave = (rowData: DataRecord) => {
    const employee = rowData as DynamicEmployee
    message.success(`保存成功：${employee.name}`)
    addLog('edit', `编辑了员工 ${employee.name} 的信息`)
  }

  const resetData = () => {
    refresh()
    logs.value = []
    selectedEmployee.value = null
    message.success('数据已重置')
  }

  const addEmployee = () => {
    const newEmployee = generateRandomEmployee()
    ;(tableData.value as DynamicEmployee[]).push(newEmployee)
    message.success(`添加员工：${newEmployee.name}`)
    addLog('add', `手动添加了员工：${newEmployee.name}`)
  }

  const clearSelection = () => {
    selectedEmployee.value = null
    tableRef.value?.clearRowSelection()
    message.info('已清空选择')
  }

  onMounted(createWatermark)
</script>
