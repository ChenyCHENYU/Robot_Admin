<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 10-table 页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="table-demo-page">
    <c_vTitle
      title="表格组件场景示例"
      icon="mdi:table"
      description="支持多种编辑模式、树形数据等完整企业级功能"
    />

    <NCard
      class="density-panel"
      size="small"
    >
      <NSpace
        align="center"
        justify="space-between"
      >
        <span>界面密度 · 表格、分页、行内编辑与弹窗表单同步调整</span>
        <NRadioGroup
          v-model:value="density"
          name="tableDensity"
        >
          <NRadioButton
            v-for="item in DENSITY_OPTIONS"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </NRadioButton>
        </NRadioGroup>
      </NSpace>
    </NCard>

    <NTabs
      v-model:value="activeTab"
      type="line"
      animated
    >
      <!-- Tab 1: CRUD 编辑模式 -->
      <NTabPane
        name="crud"
        tab="CRUD 编辑"
      >
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
                <div class="mode-selection">
                  <NRadioGroup v-model:value="editMode">
                    <NRadioButton
                      v-for="mode in EDIT_MODES"
                      :key="mode.value"
                      :value="mode.value"
                    >
                      <template #icon>
                        <C_Icon
                          :name="mode.icon"
                          aria-hidden="true"
                        />
                      </template>
                      {{ mode.label }}
                    </NRadioButton>
                  </NRadioGroup>
                </div>

                <div class="elegant-divider"></div>

                <NButton
                  @click="handleAddEmployee"
                  type="primary"
                  :disabled="editMode === 'none'"
                  class="action-button"
                  :size="controlSize"
                >
                  <template #icon>
                    <C_Icon
                      name="mdi:plus-circle"
                      aria-hidden="true"
                    />
                  </template>
                  新增员工
                </NButton>

                <div class="elegant-divider"></div>

                <div class="pagination-status">
                  <span class="status-label">分页状态：</span>
                  <NSwitch
                    v-model:value="tableCrud.paginationEnabled.value"
                    :size="controlSize"
                  >
                    <template #checked> 开启 </template>
                    <template #unchecked> 关闭 </template>
                  </NSwitch>
                </div>

                <div class="elegant-divider"></div>

                <NButton
                  @click="tableCrud.refresh()"
                  type="info"
                  :size="controlSize"
                  :loading="tableCrud.loading.value"
                >
                  <template #icon>
                    <C_Icon
                      name="mdi:refresh"
                      aria-hidden="true"
                    />
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
              <template v-if="tableCrud.paginationEnabled.value">
                <br />
                <strong>分页功能已启用</strong> - 当前显示第
                {{ tableCrud.page.current }} 页，每页
                {{ tableCrud.page.size }} 条，总共
                {{ tableCrud.total.value }} 条记录
              </template>
            </NAlert>

            <!-- 表格组件 -->
            <C_Table
              :crud="tableCrud"
              :config="tableConfig"
            />
          </NSpace>
        </NCard>
      </NTabPane>

      <NTabPane
        name="export"
        tab="按范围导出"
      >
        <NCard data-testid="table-export-scope-demo">
          <NSpace
            vertical
            :size="16"
          >
            <NAlert
              type="info"
              title="筛选、翻页勾选，再对比三个 CSV"
            >
              选择一个部门，依次勾选不同页的记录。导出菜单可分别下载当前页、已选行和该部门全部匹配的记录。
            </NAlert>
            <NSpace
              align="center"
              size="medium"
            >
              <NSelect
                v-model:value="exportDepartment"
                aria-label="按部门筛选导出数据"
                placeholder="全部部门"
                :options="DEPARTMENT_OPTIONS"
                :size="controlSize"
                style="width: 180px"
                clearable
              />
              <span role="status">匹配 {{ exportRows.length }} 条记录</span>
            </NSpace>
            <C_Table
              :data="exportRows"
              :columns="EXPORT_DEMO_COLUMNS"
              :config="exportTableConfig"
            />
          </NSpace>
        </NCard>
      </NTabPane>

      <!-- 树形数据 -->
      <NTabPane
        name="tree"
        tab="树形表格"
      >
        <NCard>
          <NSpace
            vertical
            :size="16"
          >
            <NAlert
              type="warning"
              title="树形表格"
            >
              展示部门 → 员工的层级关系。数据包含 children
              字段时自动启用树形模式。
            </NAlert>

            <C_Table
              :columns="TREE_TABLE_COLUMNS"
              :data="TREE_TABLE_DATA"
              :config="{
                density,
                toolbar: { show: false },
                pagination: false,
                display: { striped: true },
                tree: { enabled: true, defaultExpandAll: true },
              }"
            />
          </NSpace>
        </NCard>
      </NTabPane>
    </NTabs>

    <!-- 详情模态框 -->
    <c_detail
      v-model:visible="tableCrud.detail.visible.value"
      :data="tableCrud.detail.data.value || {}"
      :config="tableCrud.detailConfig"
      :title="tableCrud.detail.title.value"
      :loading="tableCrud.loading.value"
      @close="tableCrud.detail.close"
    />

    <!-- 新增员工模态框 -->
    <NModal
      v-model:show="showAddModal"
      preset="card"
      title="新增员工"
      :style="{ width: '600px' }"
      :segmented="{
        content: 'soft',
        footer: 'soft',
      }"
    >
      <C_Form
        v-if="showAddModal"
        v-model="addFormData"
        :options="ADD_EMPLOYEE_FIELDS"
        :config="addFormConfig"
      >
        <template #action="{ submit, submitting }">
          <NSpace justify="end">
            <NButton
              :size="controlSize"
              :disabled="submitting"
              @click="showAddModal = false"
            >
              <template #icon
                ><C_Icon
                  name="mdi:close"
                  aria-hidden="true"
              /></template>
              取消
            </NButton>
            <NButton
              type="primary"
              :size="controlSize"
              :loading="submitting"
              @click="submit"
            >
              <template #icon
                ><C_Icon
                  name="mdi:content-save"
                  aria-hidden="true"
              /></template>
              保存
            </NButton>
          </NSpace>
        </template>
      </C_Form>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo10Table' })
  import {
    resolveComponentDensity,
    type ComponentDensity,
    type EditMode,
    type TableConfig,
  } from '@robot-admin/naive-ui-components/C_Table'
  import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
  import type { FormConfig } from '@robot-admin/naive-ui-components/C_Form'
  import {
    type Employee,
    type AddEmployeeForm,
    EDIT_MODES,
    MODE_CONFIG,
    createEmployeeTableConfig,
    DEPARTMENT_OPTIONS,
    ADD_FORM_DEFAULTS,
    ADD_EMPLOYEE_FIELDS,
    DENSITY_OPTIONS,
  } from './data'
  import {
    EXPORT_DEMO_COLUMNS,
    EXPORT_DEMO_ROWS,
    TREE_TABLE_COLUMNS,
    TREE_TABLE_DATA,
  } from './scenes'

  // 初始化表格 CRUD
  const tableCrud = useNaiveTableCrud(createEmployeeTableConfig())

  // UI 状态
  const activeTab = ref('crud')
  const density = ref<ComponentDensity>('compact')
  const controlSize = computed(
    () => resolveComponentDensity(density.value).size
  )
  const editMode = ref<EditMode>('modal')
  const showAddModal = ref(false)
  const addFormData = ref<AddEmployeeForm>({ ...ADD_FORM_DEFAULTS })

  // 当前模式配置
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])

  const tableConfig = computed<TableConfig<Employee>>(() => ({
    density: density.value,
    // 常见模式只需一个字符串；定制弹窗时再传完整对象。
    edit:
      editMode.value === 'modal'
        ? { mode: 'modal', modalTitle: '编辑员工信息', modalWidth: 700 }
        : editMode.value,
  }))

  const exportDepartment = ref<Employee['department'] | null>(null)
  const exportRows = computed(() =>
    exportDepartment.value
      ? EXPORT_DEMO_ROWS.filter(
          row => row.department === exportDepartment.value
        )
      : EXPORT_DEMO_ROWS
  )
  const exportTableConfig = computed<
    TableConfig<(typeof EXPORT_DEMO_ROWS)[number]>
  >(() => ({
    density: density.value,
    selection: true,
    crossPageSelection: true,
    pagination: { pageSize: 5, showSizePicker: false },
    export: {
      scopes: ['page', 'selected', 'matching'],
      filename: '员工导出演示',
      format: 'csv',
    },
  }))

  const addFormConfig = computed<FormConfig<AddEmployeeForm>>(() => ({
    density: density.value,
    labelPlacement: 'left',
    labelWidth: 80,
    onSubmit: async ({ model }) => {
      const { age, joinDate } = model
      if (age === null || joinDate === null)
        throw new Error('年龄和入职日期不能为空')
      await tableCrud.create({ ...model, id: Date.now(), age, joinDate })
      showAddModal.value = false
    },
  }))

  // ============ CRUD 操作 ============
  const handleAddEmployee = (): void => {
    addFormData.value = { ...ADD_FORM_DEFAULTS, joinDate: Date.now() }
    showAddModal.value = true
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
