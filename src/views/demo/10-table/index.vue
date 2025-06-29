<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 13:12:03
 * @FilePath: \Robot_Admin\src\views\demo\10-table\index.vue
 * @Description:  表格选择器组件场景示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="table-demo-page">
    <NH1>表格选择器组件场景示例</NH1>
    <NCard>
      <NSpace
        vertical
        :size="20"
      >
        <!-- 编辑模式切换 -->
        <NCard
          title="编辑模式选择"
          size="small"
        >
          <NSpace>
            <NRadioGroup v-model:value="editMode">
              <NRadioButton
                v-for="mode in EDIT_MODES"
                :key="mode.value"
                :value="mode.value"
              >
                <template #icon>
                  <NIcon><i :class="mode.icon" /></NIcon>
                </template>
                {{ mode.label }}
              </NRadioButton>
            </NRadioGroup>

            <NDivider vertical />

            <NButton
              @click="addNewRow"
              type="primary"
              :disabled="editMode === 'none'"
            >
              <template #icon>
                <NIcon><i class="i-mdi:plus" /></NIcon>
              </template>
              添加新行
            </NButton>
          </NSpace>
        </NCard>

        <!-- 当前模式说明 -->
        <NAlert
          :type="currentModeConfig.alertType"
          :title="currentModeConfig.title"
        >
          {{ currentModeConfig.description }}
        </NAlert>

        <!-- 验证规则说明 -->
        <NCard
          v-if="editMode === 'modal'"
          title="验证规则说明"
          size="small"
        >
          <NSpace
            vertical
            :size="8"
          >
            <div class="text-sm text-blue-500 mt-2">
              ✨ 使用 v_verify 验证系统，自动处理表单验证、防抖、加载状态
            </div>
          </NSpace>
        </NCard>

        <!-- 表格组件 -->
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="tableColumns"
          :loading="loading"
          :row-actions="tableRowActions"
          :edit-mode="editMode"
          :editable="editMode !== 'none'"
          modal-title="编辑员工信息"
          :modal-width="700"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn, EditMode, Employee } from '@/types/modules/table'
  import {
    EDIT_MODES,
    MODE_CONFIG,
    initialTableData,
    getTableColumns,
    getTableRowActions,
    createNewEmployee,
  } from './data'

  // ================= 组合式函数 =================
  const message = useMessage()
  const dialog = useDialog()

  // ================= 响应式状态 =================
  const loading = ref(false)
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')
  const tableData = ref<Employee[]>([...initialTableData])

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns() as any)
  const tableRowActions = computed(
    () => getTableRowActions(message, dialog, tableData) as any
  )

  // ================= 业务逻辑 =================
  // 添加新行
  const addNewRow = () => {
    const newRow = createNewEmployee()
    tableData.value.unshift(newRow)

    // 根据编辑模式自动开始编辑
    setTimeout(() => {
      if (['modal', 'row', 'both'].includes(editMode.value)) {
        tableRef.value?.startEdit(newRow.id)
      }
    }, 100)
  }

  // 保存处理
  const handleSave = async (
    rowData: Record<string, any>,
    rowIndex: number,
    columnKey?: string
  ): Promise<void> => {
    console.log('🎯 handleSave被调用:', { rowData, rowIndex, columnKey })
    loading.value = true

    try {
      // 模拟异步保存
      await new Promise(resolve => setTimeout(resolve, 500))

      // 更新数据
      tableData.value[rowIndex] = { ...rowData } as Employee

      const columnTitle = tableColumns.value.find(
        (c: TableColumn<Employee>) => c.key === columnKey
      )?.title

      const msg = columnKey ? `${columnTitle}已更新` : '员工信息保存成功'

      message.success(msg)
    } catch (error) {
      console.error('💥 保存失败:', error)
      message.error('保存失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 取消处理
  const handleCancel = () => {
    message.info('已取消编辑')
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
