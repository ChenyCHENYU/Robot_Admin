<template>
  <div class="table-demo-page">
    <NH1>表格组件场景示例</NH1>
    <NCard>
      <NSpace
        vertical
        :size="20"
      >
        <!-- 编辑模式切换 -->
        <NCard
          title="编辑模式选择"
          size="small"
          class="controls-section"
        >
          <div class="controls-row">
            <!-- 编辑模式选择组 -->
            <div class="mode-selection">
              <NRadioGroup v-model:value="editMode">
                <NRadioButton
                  v-for="mode in EDIT_MODES"
                  :key="mode.value"
                  :value="mode.value"
                >
                  <template #icon>
                    <C_Icon :name="mode.icon" />
                  </template>
                  {{ mode.label }}
                </NRadioButton>
              </NRadioGroup>
            </div>

            <div class="elegant-divider"></div>

            <!-- 添加新行按钮 -->
            <NButton
              @click="addNewRow"
              type="primary"
              :disabled="editMode === 'none'"
              class="action-button"
              size="medium"
            >
              <template #icon>
                <C_Icon name="mdi:plus" />
              </template>
              添加新行
            </NButton>

            <div class="elegant-divider"></div>

            <!-- 分页状态信息 -->
            <div class="pagination-status">
              <span class="status-label">分页状态：</span>
              <NSwitch
                v-model:value="paginationEnabled"
                size="medium"
              >
                <template #checked> 开启 </template>
                <template #unchecked> 关闭 </template>
              </NSwitch>
            </div>

            <div class="elegant-divider"></div>

            <!-- 刷新按钮 -->
            <NButton
              @click="refresh"
              type="info"
              size="medium"
              :loading="loading"
            >
              <template #icon>
                <C_Icon name="mdi:refresh" />
              </template>
              刷新数据
            </NButton>
          </div>
        </NCard>

        <!-- 当前模式说明 -->
        <NAlert
          :type="currentModeConfig.alertType"
          :title="currentModeConfig.title"
        >
          {{ currentModeConfig.description }}
          <template v-if="paginationEnabled">
            <br />
            <strong>分页功能已启用</strong> - 当前显示第
            {{ currentPage }} 页，每页 {{ defaultPageSize }} 条，总共
            {{ tableData.length }} 条记录
          </template>
        </NAlert>

        <!-- 表格组件 -->
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="tableColumns as any"
          :loading="loading"
          :edit-mode="editMode"
          :editable="editMode !== 'none'"
          modal-title="编辑员工信息"
          :modal-width="700"
          :actions="tableActions as any"
          :pagination="paginationConfig"
          @save="handleSave"
          @cancel="handleCancel"
          @pagination-change="handlePaginationChange"
          @row-delete="handleRowDelete"
          @view-detail="handleViewDetail"
        />
      </NSpace>
    </NCard>

    <!-- 详情模态框 -->
    <c_detail
      v-model:visible="detailModalVisible"
      :data="currentEmployee || {}"
      :config="detailConfig"
      :title="detailModalTitle"
      :loading="loading"
      @close="handleDetailClose"
    />
  </div>
</template>

<script setup lang="ts">
  import type { EditMode, PaginationConfig } from '@/types/modules/table'
  import {
    EDIT_MODES,
    MODE_CONFIG,
    getTableColumns,
    createNewEmployee,
    detailConfig,
    type Employee,
  } from './data'
  import { usePageCrud, toTableApis } from '@/composables/usePageCrud'
  import { createTableActions } from '@/composables/Table/createTableActions'

  // ================= 组合式函数 =================
  const message = useMessage()
  const dialog = useDialog()

  // 使用 usePageCrud 统一管理所有 API 调用
  const crud = usePageCrud<Employee>(
    {
      list: '/employees/list',
      get: '/employees/:id',
      update: '/employees/:id',
      remove: '/employees/:id',
    },
    {
      // 自定义列表结果映射
      mapListResult: res => {
        console.log('🔍 列表 API 返回:', res)
        const data = res.data || res
        const items = data.list || data.items || data.records || data || []
        const total = data.total || data.totalCount || 0
        return { items, total }
      },
      // 自定义响应标准化
      normalize: res => {
        console.log('🔍 normalize 接收原始响应:', res)

        // 标准化响应
        const normalized = {
          data: res.data,
          message: res.message,
          success:
            res.code === 0 ||
            res.code === '0' ||
            res.code === 200 ||
            res.code === '200',
          raw: res,
        }

        console.log('✅ normalize 返回标准化结果:', normalized)
        return normalized
      },
    }
  )

  // 映射数据到表格
  const tableData = computed({
    get: () => crud.items.value,
    set: val => {
      crud.items.value = val
    },
  })
  const { loading, refresh } = crud

  // ================= 响应式状态 =================
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')

  // 分页相关状态
  const paginationEnabled = ref(true)
  const defaultPageSize = ref(10)
  const currentPage = ref(1)

  // 新增行ID追踪
  const pendingNewRowId = ref<number | null>(null)

  // 详情弹框状态
  const detailModalVisible = ref(false)
  const detailModalTitle = ref('')
  const currentEmployee = ref<Employee | null>(null)

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns())

  const paginationConfig = computed((): PaginationConfig | boolean => {
    if (!paginationEnabled.value) return false
    // 只传必要参数，其余使用 C_Table 组件的默认配置
    return {
      enabled: true,
      page: currentPage.value,
      pageSize: defaultPageSize.value,
    }
  })

  // ================= 详情处理函数 =================
  const handleViewDetail = (data: any): void => {
    const employee = data as Employee
    currentEmployee.value = employee
    detailModalTitle.value = `员工详情 - ${employee.name}`
    detailModalVisible.value = true
  }

  // ================= 自定义操作函数  =================
  const handleCopy = (row: any, index: number): void => {
    const employee = row as Employee
    const newRow: Employee = {
      ...employee,
      id: Date.now(),
      name: `${employee.name}_副本`,
    }
    const actualIndex = paginationEnabled.value
      ? (currentPage.value - 1) * defaultPageSize.value + index + 1
      : index + 1
    tableData.value.splice(actualIndex, 0, newRow)
    message.success('复制成功')
  }

  const handleAuthorize = (row: any): void => {
    const employee = row as Employee
    dialog.info({
      title: '员工授权',
      content: `正在为员工 "${employee.name}" 配置系统权限...`,
      positiveText: '确定',
      onPositiveClick: () => {
        message.success('授权配置完成')
      },
    })
  }

  // ================= 简化的表格操作配置 =================
  const tableActions = createTableActions<Employee>({
    apis: toTableApis(crud), // ✨ 一行搞定！自动适配所有 CRUD 方法
    custom: [
      {
        key: 'copy',
        label: '复制',
        icon: 'mdi:content-copy',
        type: 'default',
        onClick: handleCopy,
      },
      {
        key: 'authorize',
        label: '授权',
        icon: 'mdi:shield-key',
        type: 'warning',
        onClick: handleAuthorize,
      },
    ],
  })

  // ================= 事件处理 =================

  const handleRowDelete = (...args: unknown[]): void => {
    const [deletedRow] = args as [Employee, number]
    tableData.value = tableData.value.filter(emp => emp.id !== deletedRow.id)
  }

  const handlePaginationChange = (...args: unknown[]): void => {
    const [page, pageSize] = args as [number, number]
    currentPage.value = page
    if (pageSize !== defaultPageSize.value) {
      defaultPageSize.value = pageSize
    }
    const total = tableData.value.length
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)
    message.info(
      `已切换到第 ${page} 页，显示第 ${start}-${end} 条记录，共 ${total} 条`
    )
  }

  const addNewRow = (): void => {
    const newRow = createNewEmployee()
    if (editMode.value === 'modal') {
      pendingNewRowId.value = newRow.id
      tableData.value.unshift(newRow)
      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
      }
      nextTick(() => {
        tableRef.value?.startEdit(newRow.id)
      })
      message.info('请填写新员工信息后保存')
    } else {
      tableData.value.unshift(newRow)
      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
      }
      nextTick(() => {
        if (['row', 'both'].includes(editMode.value)) {
          tableRef.value?.startEdit(newRow.id)
        }
      })
    }
  }

  const handleSave = async (
    rowData: Record<string, unknown>
  ): Promise<void> => {
    try {
      const employee = rowData as Employee

      if (pendingNewRowId.value && employee.id === pendingNewRowId.value) {
        pendingNewRowId.value = null
        message.success('新员工信息保存成功')
      } else {
        // 注意：这里不再需要手动调用API，因为组件内部会调用tableActions.edit
        message.success('员工信息更新成功')
      }
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
      throw error
    }
  }

  const handleCancel = (): void => {
    if (pendingNewRowId.value) {
      const tempIndex = tableData.value.findIndex(
        item => item.id === pendingNewRowId.value
      )
      if (tempIndex !== -1) {
        tableData.value.splice(tempIndex, 1)
      }
      pendingNewRowId.value = null
      message.info('已取消新增')
    } else {
      message.info('已取消编辑')
    }
  }

  const handleDetailClose = (): void => {
    currentEmployee.value = null
    detailModalTitle.value = ''
  }

  // 初始化加载数据
  onMounted(() => {
    crud.fetch()
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
