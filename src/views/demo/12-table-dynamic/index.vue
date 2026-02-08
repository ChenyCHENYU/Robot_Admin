<template>
  <div class="p-6 min-h-screen">
    <NH1>动态表格场景示例</NH1>

    <NCard class="shadow-md mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">员工信息管理（例）</h3>
          <NSpace>
            <NButton @click="resetData">重置数据</NButton>
            <NButton
              type="primary"
              @click="addEmployee"
              >添加员工</NButton
            >
          </NSpace>
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
          :actions="tableActions"
          :preset="tablePreset"
          :loading="loading"
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

    <NCard class="shadow-md">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">操作日志</h3>
          <NButton
            size="small"
            @click="logs = []"
            >清空</NButton
          >
        </div>
      </template>

      <div class="space-y-2">
        <div
          v-for="log in logs.slice(0, 6)"
          :key="log.time"
          class="flex items-center gap-3 p-2 rounded bg-gray-50"
        >
          <NTag
            :type="getLogTagType(log.type)"
            size="small"
            >{{ log.type }}</NTag
          >
          <span class="flex-1">{{ log.message }}</span>
          <NTime
            :time="new Date(log.time)"
            type="relative"
            class="text-sm text-gray-5"
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
  import type { DataRecord, SimpleTableActions } from '@/types/modules/table'
  import C_Table from '@/components/global/C_Table/index.vue'
  import {
    type DynamicEmployee,
    type Log,
    dynamicTableColumns,
    getLogTagType,
    createDefaultEmployee,
    generateRandomEmployee,
  } from './data'
  import { useTableCrud } from '@robot-admin/request-core'

  const message = useMessage()

  const tableRef = ref()
  const tableContainer = ref<HTMLElement>()
  const watermarkLayer = ref<HTMLElement>()
  const selectedEmployee = ref<DynamicEmployee | null>(null)
  const logs = ref<Log[]>([])

  // 使用 useTableCrud 管理数据
  const table = useTableCrud<DynamicEmployee>({
    api: {
      list: 'employees/dynamicList',
    },
    columns: dynamicTableColumns,
  })

  const { data: tableData, loading, refresh } = table

  // 自动水印样式
  const watermarkStyle = ref('')

  const createWatermark = () => {
    const text = 'Robot Admin'
    const fontSize = 16
    const color = 'rgba(100, 100, 100, 0.25)'
    const rotate = -45

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    ctx.font = `${fontSize}px Arial`
    const textWidth = ctx.measureText(text).width
    const textHeight = fontSize

    const radians = (rotate * Math.PI) / 180
    const rotatedWidth =
      Math.abs(textWidth * Math.cos(radians)) +
      Math.abs(textHeight * Math.sin(radians))
    const rotatedHeight =
      Math.abs(textWidth * Math.sin(radians)) +
      Math.abs(textHeight * Math.cos(radians))

    const xGap = Math.max(rotatedWidth + 50, 180)
    const yGap = Math.max(rotatedHeight + 30, 100)

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${xGap}" height="${yGap}">
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial"
        font-size="${fontSize}"
        fill="${color}"
        transform="rotate(${rotate} ${xGap / 2} ${yGap / 2})"
      >${text}</text>
    </svg>
  `

    const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
    const svgUrl = URL.createObjectURL(svgBlob)

    watermarkStyle.value = `
    background-image: url("${svgUrl}");
    background-repeat: repeat;
    background-position: 0 0;
  `
  }

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

  const tablePreset = {
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
      onRowChange: (data: DataRecord[]) => {
        console.log('行数据变化:', data.length, '行')
      },
      defaultRowData: createDefaultEmployee,
    },
    edit: {
      enabled: true,
      mode: 'modal' as const,
      showRowActions: true,
      modalTitle: '编辑员工信息',
      modalWidth: 700,
    },
  }

  const addLog = (type: Log['type'], message: string) => {
    logs.value.unshift({
      type,
      message,
      time: new Date().toISOString(),
    })
    if (logs.value.length > 20) logs.value.splice(20)
  }

  const handleViewDetail = (data: DataRecord) => {
    const employee = data as DynamicEmployee
    message.info(`查看 ${employee.name} 的详细信息`)
    addLog('select', `查看了 ${employee.name} 的详情`)
  }

  const handleRowAdd = (newRow: DataRecord): void => {
    const employee = newRow as DynamicEmployee
    addLog('add', `添加了新员工：${employee.name}`)
  }

  const handleRowDelete = (...args: unknown[]): void => {
    const [deletedRow] = args as [DataRecord, number]
    const employee = deletedRow as DynamicEmployee
    addLog('delete', `删除了员工：${employee.name}`)
    if (selectedEmployee.value?.id === employee.id) {
      selectedEmployee.value = null
    }
  }

  const handleSave = (rowData: DataRecord): void => {
    const employee = rowData as DynamicEmployee
    message.success(`保存成功：${employee.name}`)
    addLog('edit', `编辑了员工 ${employee.name} 的信息`)
  }

  const resetData = (): void => {
    refresh() // 直接刷新数据
    logs.value = []
    selectedEmployee.value = null
    message.success('数据已重置')
  }

  const addEmployee = (): void => {
    const newEmployee = generateRandomEmployee()
    // 直接修改 hook 的数据
    ;(tableData.value as DynamicEmployee[]).push(newEmployee)
    message.success(`添加员工：${newEmployee.name}`)
    addLog('add', `手动添加了员工：${newEmployee.name}`)
  }

  const clearSelection = (): void => {
    selectedEmployee.value = null
    tableRef.value?.clearRowSelection()
    message.info('已清空选择')
  }

  onMounted(() => {
    createWatermark()
  })
</script>
