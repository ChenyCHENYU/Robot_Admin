<template>
  <div class="table-demo-page">
    <c_vTitle
      title="表格组件场景示例"
      icon="mdi:table"
      description="支持多种编辑模式、树形数据等完整企业级功能"
    />

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
                        <C_Icon :name="mode.icon" />
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
                  size="medium"
                >
                  <template #icon>
                    <C_Icon name="mdi:plus-circle" />
                  </template>
                  新增员工
                </NButton>

                <div class="elegant-divider"></div>

                <div class="pagination-status">
                  <span class="status-label">分页状态：</span>
                  <NSwitch
                    v-model:value="tableCrud.paginationEnabled.value"
                    size="medium"
                  >
                    <template #checked> 开启 </template>
                    <template #unchecked> 关闭 </template>
                  </NSwitch>
                </div>

                <div class="elegant-divider"></div>

                <NButton
                  @click="tableCrud.refresh()"
                  type="info"
                  size="medium"
                  :loading="tableCrud.loading.value"
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
              :config="{
                edit: {
                  mode: editMode,
                  modalTitle: '编辑员工信息',
                  modalWidth: 700,
                },
              }"
            />
          </NSpace>
        </NCard>
      </NTabPane>

      <!-- Tab 2: 树形数据 -->
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

            <NDataTable
              :columns="treeColumns"
              :data="TREE_TABLE_DATA"
              :row-key="(row: any) => row.id"
              default-expand-all
              size="small"
              striped
            />
          </NSpace>
        </NCard>
      </NTabPane>
    </NTabs>

    <!-- 详情模态框 -->
    <c_detail
      v-model:visible="tableCrud.detail.visible.value"
      :data="tableCrud.detail.data.value || {}"
      :config="tableCrud.detailConfig as any"
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
      <NForm
        ref="addFormRef"
        :model="addFormData"
        :rules="addFormRules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <NFormItem
          label="姓名"
          path="name"
        >
          <NInput
            v-model:value="addFormData.name"
            placeholder="请输入姓名"
          />
        </NFormItem>

        <NFormItem
          label="年龄"
          path="age"
        >
          <NInputNumber
            v-model:value="addFormData.age"
            :min="18"
            :max="65"
            :show-button="false"
            placeholder="请输入年龄"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem
          label="性别"
          path="gender"
        >
          <NRadioGroup v-model:value="addFormData.gender">
            <NRadio
              v-for="item in GENDER_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem
          label="邮箱"
          path="email"
        >
          <NInput
            v-model:value="addFormData.email"
            placeholder="请输入邮箱地址"
          />
        </NFormItem>

        <NFormItem
          label="部门"
          path="department"
        >
          <NSelect
            v-model:value="addFormData.department"
            :options="DEPARTMENT_OPTIONS"
            placeholder="请选择部门"
          />
        </NFormItem>

        <NFormItem
          label="入职日期"
          path="joinDate"
        >
          <NDatePicker
            v-model:value="addFormData.joinDate"
            type="date"
            placeholder="请选择入职日期"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem
          label="状态"
          path="status"
        >
          <NSelect
            v-model:value="addFormData.status"
            :options="STATUS_OPTIONS"
            placeholder="请选择状态"
          />
        </NFormItem>

        <NFormItem
          label="描述"
          path="description"
        >
          <NInput
            v-model:value="addFormData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入员工描述信息（选填）"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <C_ActionBar
          :actions="modalActions"
          :config="{ align: 'right', gap: 12 }"
        />
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { ActionItem, EditMode } from '@robot-admin/naive-ui-components'
  import { useTableCrud } from '@robot-admin/request-core'
  import { PRESET_RULES } from '@robot-admin/form-validate'
  import {
    type Employee,
    EDIT_MODES,
    MODE_CONFIG,
    employeeTableConfig,
    DEPARTMENT_OPTIONS,
    STATUS_OPTIONS,
    GENDER_OPTIONS,
    LEVEL_CONFIG,
    STATUS_TAG_CONFIG,
    ADD_FORM_DEFAULTS,
    TREE_TABLE_DATA,
  } from './data'

  // 初始化表格 CRUD
  const tableCrud = useTableCrud(employeeTableConfig)

  // UI 状态
  const activeTab = ref('crud')
  const editMode = ref<EditMode>('modal')
  const showAddModal = ref(false)
  const addFormRef = ref()
  const addFormData = ref<any>({})

  // 当前模式配置
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])

  // 模态框按钮
  const modalActions = computed<ActionItem[]>(() => [
    {
      key: 'cancel',
      label: '取消',
      onClick: () => {
        showAddModal.value = false
      },
    },
    {
      key: 'save',
      label: '保存',
      type: 'primary',
      loading: tableCrud.loading.value,
      onClick: handleAddSubmit,
    },
  ])

  // 表单验证规则
  const addFormRules = {
    name: [PRESET_RULES.required('姓名'), PRESET_RULES.length('姓名', 2, 20)],
    age: [
      PRESET_RULES.required('年龄', ['blur', 'change']),
      PRESET_RULES.range('年龄', 18, 65),
    ],
    gender: [PRESET_RULES.required('性别', 'change')],
    email: [PRESET_RULES.required('邮箱'), PRESET_RULES.email('邮箱')],
    department: [PRESET_RULES.required('部门', 'change')],
    joinDate: [PRESET_RULES.required('入职日期', ['blur', 'change'])],
    status: [PRESET_RULES.required('状态', 'change')],
  }

  // ============ 树形表格列 ============
  const treeColumns = computed(() => [
    { key: 'name', title: '名称', width: 200 },
    {
      key: 'department',
      title: '部门',
      width: 120,
      render: (row: Employee) => {
        const map: Record<string, string> = {
          tech: '技术部',
          hr: '人事部',
          market: '市场部',
          finance: '财务部',
        }
        return map[row.department] || row.department
      },
    },
    {
      key: 'level',
      title: '职级',
      width: 100,
      render: (row: Employee) =>
        LEVEL_CONFIG[row.level || 'junior']?.text || '-',
    },
    {
      key: 'salary',
      title: '薪资',
      width: 120,
      render: (row: Employee) =>
        row.salary ? `¥${row.salary.toLocaleString()}` : '-',
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (row: Employee) =>
        STATUS_TAG_CONFIG[row.status]?.text || row.status,
    },
    { key: 'email', title: '邮箱', width: 200 },
  ])

  // ============ CRUD 操作 ============
  const handleAddEmployee = () => {
    addFormData.value = { ...ADD_FORM_DEFAULTS, joinDate: Date.now() }
    showAddModal.value = true
  }

  const handleAddSubmit = () => {
    addFormRef.value?.validate(async (errors: any) => {
      if (!errors) {
        try {
          await tableCrud.create({ ...addFormData.value, id: Date.now() })
          showAddModal.value = false
        } catch (error) {
          console.error('新增失败:', error)
        }
      }
    })
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
