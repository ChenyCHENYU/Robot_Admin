<template>
  <div class="demo-container">
    <NH1>动态表格场景示例</NH1>

    <NCard class="table-card">
      <template #header>
        <div class="card-header">
          <h3>员工信息管理（例）</h3>
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
        class="c-table-wrapper"
      >
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="columns"
          :row-actions="rowActions"
          :preset="tablePreset"
          @row-add="handleRowAdd"
          @row-delete="handleRowDelete"
          @save="handleSave"
        />

        <!-- 自动铺满水印 -->
        <div
          ref="watermarkLayer"
          class="auto-watermark"
          :style="watermarkStyle"
        ></div>
      </div>

      <NAlert
        v-if="selectedEmployee"
        type="info"
        class="selected-info"
        closable
        @close="clearSelection"
      >
        <strong>已选中：</strong>{{ selectedEmployee.name }} -
        {{ selectedEmployee.department }}
      </NAlert>
    </NCard>

    <NCard>
      <template #header>
        <div class="card-header">
          <h3>操作日志</h3>
          <NButton
            size="small"
            @click="logs = []"
            >清空</NButton
          >
        </div>
      </template>

      <div class="logs">
        <div
          v-for="log in logs.slice(0, 6)"
          :key="log.time"
          class="log-item"
        >
          <NTag
            :type="getLogTagType(log.type)"
            size="small"
            >{{ log.type }}</NTag
          >
          <span>{{ log.message }}</span>
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
  import type {
    TableColumn,
    DataRecord,
    RowAction,
  } from '@/types/modules/table'

  // ================= 类型定义 =================
  interface Employee extends DataRecord {
    id: string
    name: string
    age: number
    email: string
    department: string
    salary: number
    status: 'active' | 'inactive'
  }

  interface Log {
    type: 'add' | 'delete' | 'edit' | 'select'
    message: string
    time: string
  }

  // ================= 响应式数据 =================
  const message = useMessage()
  const tableRef = ref()
  const tableContainer = ref<HTMLElement>()
  const watermarkLayer = ref<HTMLElement>()
  const selectedEmployee = ref<Employee | null>(null)
  const logs = ref<Log[]>([])

  const initialData: Employee[] = [
    {
      id: '1',
      name: '张三',
      age: 28,
      email: 'zhang@example.com',
      department: '技术部',
      salary: 15000,
      status: 'active',
    },
    {
      id: '2',
      name: '李四',
      age: 32,
      email: 'li@example.com',
      department: '产品部',
      salary: 18000,
      status: 'active',
    },
    {
      id: '3',
      name: '王五',
      age: 26,
      email: 'wang@example.com',
      department: '设计部',
      salary: 12000,
      status: 'inactive',
    },
  ]

  const tableData = ref<Employee[]>([...initialData])

  // ================= 自动水印 =================
  const watermarkStyle = ref('')

  const createWatermark = () => {
    const text = 'Robot Admin'
    const fontSize = 16
    const color = 'rgba(100, 100, 100, 0.25)'
    const rotate = -45

    // 创建 canvas 来测量文字尺寸
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    ctx.font = `${fontSize}px Arial`
    const textWidth = ctx.measureText(text).width
    const textHeight = fontSize

    // 计算旋转后的实际尺寸
    const radians = (rotate * Math.PI) / 180
    const rotatedWidth =
      Math.abs(textWidth * Math.cos(radians)) +
      Math.abs(textHeight * Math.sin(radians))
    const rotatedHeight =
      Math.abs(textWidth * Math.sin(radians)) +
      Math.abs(textHeight * Math.cos(radians))

    // 设置水印间距（稍微大一点避免重叠）
    const xGap = Math.max(rotatedWidth + 50, 180)
    const yGap = Math.max(rotatedHeight + 30, 100)

    // 创建 SVG 水印
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

  // ================= 工具函数 =================
  const getLogTagType = (type: Log['type']) => {
    const typeMap = {
      add: 'success',
      delete: 'error',
      edit: 'warning',
      select: 'info',
    }
    return typeMap[type] || 'default'
  }

  // ================= 表格配置 =================
  const columns: TableColumn<DataRecord>[] = [
    {
      key: 'name',
      title: '姓名',
      width: 100,
      editable: true,
      editType: 'input',
    },
    {
      key: 'age',
      title: '年龄',
      width: 80,
      editable: true,
      editType: 'number',
    },
    {
      key: 'email',
      title: '邮箱',
      width: 200,
      editable: true,
      editType: 'email',
    },
    {
      key: 'department',
      title: '部门',
      width: 100,
      editable: true,
      editType: 'select',
      editProps: {
        options: [
          { label: '技术部', value: '技术部' },
          { label: '产品部', value: '产品部' },
          { label: '设计部', value: '设计部' },
        ],
      },
    },
    {
      key: 'salary',
      title: '薪资',
      width: 100,
      editable: true,
      editType: 'number',
      render: (row: DataRecord) => {
        const employee = row as Employee
        return `¥${employee.salary.toLocaleString()}`
      },
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      editable: true,
      editType: 'select',
      editProps: {
        options: [
          { label: '活跃', value: 'active' },
          { label: '非活跃', value: 'inactive' },
        ],
      },
      render: (row: DataRecord) => {
        const employee = row as Employee
        return employee.status === 'active' ? '🟢 活跃' : '🔴 非活跃'
      },
    },
  ]

  const rowActions: RowAction<DataRecord>[] = [
    {
      label: '详情',
      icon: 'i-mdi:eye',
      type: 'info',
      onClick: (row: DataRecord) => {
        const employee = row as Employee
        message.info(`查看 ${employee.name} 的详细信息`)
        addLog('edit', `查看了 ${employee.name} 的详情`)
      },
    },
  ]

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
        const employees = data as Employee[]
        console.log('行数据变化:', employees.length, '行')
      },
      defaultRowData: (): DataRecord =>
        ({
          id: '',
          name: '新员工',
          age: 25,
          email: '',
          department: '技术部',
          salary: 8000,
          status: 'active',
        }) as Employee,
    },
    edit: {
      enabled: true,
      mode: 'both' as const,
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

  // ================= 事件处理函数 =================
  const handleRowAdd = (newRow: DataRecord) => {
    const employee = newRow as Employee
    message.success(`添加员工：${employee.name}`)
    addLog('add', `添加了新员工：${employee.name}`)
  }

  const handleRowDelete = (deletedRow: DataRecord) => {
    const employee = deletedRow as Employee
    message.success(`删除员工：${employee.name}`)
    addLog('delete', `删除了员工：${employee.name}`)
    if (selectedEmployee.value?.id === employee.id) {
      selectedEmployee.value = null
    }
  }

  const handleSave = (rowData: DataRecord) => {
    const employee = rowData as Employee
    message.success(`保存成功：${employee.name}`)
    addLog('edit', `编辑了员工 ${employee.name} 的信息`)
  }

  const resetData = () => {
    tableData.value = [...initialData]
    logs.value = []
    selectedEmployee.value = null
    message.success('数据已重置')
  }

  const addEmployee = () => {
    const names = ['赵六', '钱七', '孙八', '李九']
    const depts = ['技术部', '产品部', '设计部']

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: names[Math.floor(Math.random() * names.length)],
      age: Math.floor(Math.random() * 20) + 23,
      email: `user${Date.now()}@example.com`,
      department: depts[Math.floor(Math.random() * depts.length)],
      salary: Math.floor(Math.random() * 10000) + 8000,
      status: 'active',
    }

    tableData.value.push(newEmployee)
    message.success(`添加员工：${newEmployee.name}`)
    addLog('add', `手动添加了员工：${newEmployee.name}`)
  }

  const clearSelection = () => {
    selectedEmployee.value = null
    tableRef.value?.clearRowSelection()
    message.info('已清空选择')
  }

  // ================= 生命周期 =================
  onMounted(() => {
    nextTick(() => {
      createWatermark()
    })
  })
</script>

<style scoped lang="scss">
  .demo-container {
    padding: 20px;
    min-height: 100vh;
  }

  .table-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }

  .c-table-wrapper {
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }

  .auto-watermark {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    opacity: 1;
  }

  .selected-info {
    margin-top: 16px;
  }

  .logs {
    max-height: 200px;
    overflow-y: auto;

    .log-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .log-time {
        margin-left: auto;
      }
    }
  }
</style>
