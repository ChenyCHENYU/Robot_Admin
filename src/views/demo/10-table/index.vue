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
            {{ page.current }} 页，每页 {{ page.size }} 条，总共
            {{ crud.total }} 条记录
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
          @pagination-change="handlePaginationChange as any"
          @row-delete="handleRowDelete as any"
          @view-detail="detailModal.show as any"
        />
      </NSpace>
    </NCard>

    <!-- 详情模态框 -->
    <c_detail
      v-model:visible="detailModal.visible.value"
      :data="detailModal.currentData.value || {}"
      :config="detailConfig"
      :title="detailModal.title.value"
      :loading="loading"
      @close="detailModal.close"
    />
  </div>
</template>

<script setup lang="ts">
  import type { EditMode } from '@/types/modules/table'
  import {
    EDIT_MODES,
    MODE_CONFIG,
    getTableColumns,
    detailConfig,
    createEmployeeCrud,
    createEmployeeTableActions,
    createPaginationConfig,
    createEventHandlers,
    createDetailModal,
    type Employee,
  } from './data'

  // ================= 组合式 API =================
  const message = useMessage()
  const dialog = useDialog()

  // ================= 响应式状态 =================
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')
  const paginationEnabled = ref(true)

  // ================= CRUD 实例 =================
  const crud = createEmployeeCrud()
  const { items: tableData, loading, refresh, page } = crud

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns())
  const paginationConfig = createPaginationConfig({
    enabled: paginationEnabled,
    page,
  })

  // ================= 表格操作配置 =================
  const tableActions = createEmployeeTableActions({
    crud,
    tableData: tableData.value as Employee[],
    currentPage: computed(() => page.current),
    defaultPageSize: computed(() => page.size),
    paginationEnabled,
    message,
    dialog,
  })

  // ================= 事件处理器 =================
  const {
    handleRowDelete,
    handlePaginationChange,
    addNewRow,
    handleSave,
    handleCancel,
  } = createEventHandlers({
    crud,
    tableData: tableData as any,
    page,
    paginationEnabled,
    editMode,
    tableRef,
    message,
  })

  // ================= 详情弹窗 =================
  const detailModal = createDetailModal()

  // ================= 生命周期 =================
  onMounted(() => refresh())
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
