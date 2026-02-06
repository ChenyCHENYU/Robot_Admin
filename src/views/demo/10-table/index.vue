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
              @click="table.add()"
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
                v-model:value="table.paginationEnabled.value"
                size="medium"
              >
                <template #checked> 开启 </template>
                <template #unchecked> 关闭 </template>
              </NSwitch>
            </div>

            <div class="elegant-divider"></div>

            <!-- 刷新按钮 -->
            <NButton
              @click="table.refresh()"
              type="info"
              size="medium"
              :loading="table.loading.value"
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
          <template v-if="table.paginationEnabled.value">
            <br />
            <strong>分页功能已启用</strong> - 当前显示第
            {{ table.page.current }} 页，每页 {{ table.page.size }} 条，总共
            {{ table.total.value }} 条记录
          </template>
        </NAlert>

        <!-- 表格组件 -->
        <C_Table
          ref="table.tableRef"
          v-model:data="table.data.value"
          :columns="table.columns.value as any"
          :loading="table.loading.value"
          :edit-mode="editMode"
          :editable="editMode !== 'none'"
          modal-title="编辑员工信息"
          :modal-width="700"
          :actions="table.actions.value"
          :pagination="table.pagination.value"
          @save="table.save as any"
          @cancel="table.handleCancel"
          @pagination-change="table.handlePaginationChange as any"
          @row-delete="table.handleRowDelete as any"
          @view-detail="table.detail.show as any"
        />
      </NSpace>
    </NCard>

    <!-- 详情模态框 -->
    <c_detail
      v-model:visible="table.detail.visible.value"
      :data="table.detail.data.value || {}"
      :config="table.detailConfig as any"
      :title="table.detail.title.value"
      :loading="table.loading.value"
      @close="table.detail.close"
    />
  </div>
</template>

<script setup lang="ts">
  import type { EditMode } from '@/types/modules/table'
  import { useTableCrud } from '@/composables/useTableCrud'
  import { EDIT_MODES, MODE_CONFIG, employeeTableConfig } from './data'

  // ================= 初始化表格 CRUD =================
  const table = useTableCrud(employeeTableConfig)

  // ================= UI 状态管理 =================
  const editMode = ref<EditMode>('modal')

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
