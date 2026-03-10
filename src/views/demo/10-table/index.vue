<template>
  <div class="table-demo-page">
    <c_vTitle
      title="表格组件场景示例"
      icon="mdi:table"
      description="支持多种编辑模式、行选择、批量操作、展开行、树形数据、动态行管理等完整企业级功能"
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

      <!-- Tab 2: 行选择 & 批量操作 -->
      <NTabPane
        name="selection"
        tab="行选择与批量操作"
      >
        <NCard>
          <NSpace
            vertical
            :size="16"
          >
            <NAlert
              type="info"
              title="行选择功能"
            >
              勾选行后可执行批量删除、批量修改部门等操作。支持 Shift/Ctrl 多选。
            </NAlert>

            <!-- 批量操作栏 -->
            <NSpace v-if="selectedRows.length">
              <NTag type="info"> 已选 {{ selectedRows.length }} 项 </NTag>
              <NButton
                type="error"
                size="small"
                @click="handleBatchDelete"
              >
                <template #icon>
                  <C_Icon name="mdi:delete" />
                </template>
                批量删除
              </NButton>
              <NButton
                type="warning"
                size="small"
                @click="showBatchDeptModal = true"
              >
                <template #icon>
                  <C_Icon name="mdi:domain" />
                </template>
                批量调部门
              </NButton>
              <NButton
                size="small"
                @click="selectedRows = []"
              >
                清空选择
              </NButton>
            </NSpace>

            <C_Table
              :crud="tableCrud"
              :config="{
                edit: { mode: 'modal', modalTitle: '编辑员工信息' },
                selection: { parentChildLink: false },
              }"
              @selection-change="handleSelectionChange"
            />
          </NSpace>
        </NCard>

        <!-- 批量调部门弹窗 -->
        <NModal
          v-model:show="showBatchDeptModal"
          preset="dialog"
          title="批量调整部门"
          positive-text="确认"
          negative-text="取消"
          @positive-click="handleBatchDepartment"
        >
          <NSpace
            vertical
            :size="12"
          >
            <NText> 将已选的 {{ selectedRows.length }} 名员工调整到： </NText>
            <NSelect
              v-model:value="batchDepartment"
              :options="BATCH_DEPARTMENT_OPTIONS"
              placeholder="请选择目标部门"
            />
          </NSpace>
        </NModal>
      </NTabPane>

      <!-- Tab 3: 展开行 -->
      <NTabPane
        name="expand"
        tab="展开行详情"
      >
        <NCard>
          <NSpace
            vertical
            :size="16"
          >
            <NAlert
              type="success"
              title="展开行功能"
            >
              点击行首的展开箭头，查看该员工的详细信息面板。
            </NAlert>

            <C_Table
              :crud="tableCrud"
              :config="{
                edit: { mode: 'modal' },
                expand: {},
              }"
            >
              <template #expand="{ row }">
                <div class="expand-content">
                  <NGrid
                    :cols="3"
                    :x-gap="16"
                    :y-gap="12"
                  >
                    <NGi>
                      <NStatistic
                        label="邮箱"
                        :value="row.email"
                      />
                    </NGi>
                    <NGi>
                      <NStatistic
                        label="职级"
                        :value="
                          LEVEL_CONFIG[row.level || 'junior']?.text || '-'
                        "
                      />
                    </NGi>
                    <NGi>
                      <NStatistic
                        label="薪资"
                        :value="
                          row.salary ? `¥${row.salary.toLocaleString()}` : '-'
                        "
                      />
                    </NGi>
                    <NGi :span="3">
                      <NText depth="3">
                        {{ row.description || '暂无描述信息' }}
                      </NText>
                    </NGi>
                  </NGrid>
                </div>
              </template>
            </C_Table>
          </NSpace>
        </NCard>
      </NTabPane>

      <!-- Tab 4: 树形数据 -->
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

      <!-- Tab 5: 动态行管理 -->
      <NTabPane
        name="dynamic"
        tab="动态行管理"
      >
        <NCard>
          <NSpace
            vertical
            :size="16"
          >
            <NAlert
              type="info"
              title="动态行管理"
            >
              支持动态添加行、复制行、删除行、上移下移行操作。
            </NAlert>

            <NSpace>
              <NButton
                type="primary"
                @click="handleDynamicAdd"
              >
                <template #icon>
                  <C_Icon name="mdi:plus" />
                </template>
                添加一行
              </NButton>
              <NTag type="info"> 共 {{ dynamicData.length }} 条 </NTag>
            </NSpace>

            <NDataTable
              :columns="dynamicColumns"
              :data="dynamicData"
              :row-key="(row: any) => row.id"
              size="small"
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
    BATCH_DEPARTMENT_OPTIONS,
    ADD_FORM_DEFAULTS,
    TREE_TABLE_DATA,
    createNewEmployee,
  } from './data'

  const message = useMessage()
  const dialog = useDialog()

  // 初始化表格 CRUD
  const tableCrud = useTableCrud(employeeTableConfig)

  // UI 状态
  const activeTab = ref('crud')
  const editMode = ref<EditMode>('modal')
  const showAddModal = ref(false)
  const addFormRef = ref()
  const addFormData = ref<any>({})

  // 行选择状态
  const selectedRows = ref<Employee[]>([])
  const showBatchDeptModal = ref(false)
  const batchDepartment = ref<string | null>(null)

  // 动态行管理数据
  const dynamicData = reactive<Employee[]>([
    createNewEmployee(),
    createNewEmployee(),
    createNewEmployee(),
  ])

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

  // ============ 动态行管理列 ============
  const dynamicColumns = computed(() => [
    { key: 'name', title: '姓名', width: 120 },
    { key: 'age', title: '年龄', width: 80 },
    {
      key: 'department',
      title: '部门',
      width: 100,
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
    { key: 'email', title: '邮箱', width: 200 },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      render: (row: Employee, rowIndex: number) =>
        h(NSpace, { size: 4 }, () => [
          h(
            NButton,
            {
              size: 'tiny',
              type: 'primary',
              onClick: () => handleDynamicCopy(rowIndex),
            },
            () => '复制'
          ),
          h(
            NButton,
            {
              size: 'tiny',
              disabled: rowIndex === 0,
              onClick: () => handleDynamicMove(rowIndex, -1),
            },
            () => '上移'
          ),
          h(
            NButton,
            {
              size: 'tiny',
              disabled: rowIndex === dynamicData.length - 1,
              onClick: () => handleDynamicMove(rowIndex, 1),
            },
            () => '下移'
          ),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'error',
              onClick: () => handleDynamicDelete(rowIndex),
            },
            () => '删除'
          ),
        ]),
    },
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

  // ============ 行选择操作 ============
  const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows
  }

  const handleBatchDelete = () => {
    dialog.warning({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        message.success(`已删除 ${selectedRows.value.length} 条记录`)
        selectedRows.value = []
      },
    })
  }

  const handleBatchDepartment = () => {
    if (!batchDepartment.value) {
      message.warning('请选择目标部门')
      return false
    }
    message.success(`已将 ${selectedRows.value.length} 名员工调至新部门`)
    showBatchDeptModal.value = false
    batchDepartment.value = null
    selectedRows.value = []
  }

  // ============ 动态行管理 ============
  const handleDynamicAdd = () => {
    dynamicData.push(createNewEmployee())
    message.success('已添加一行')
  }

  const handleDynamicCopy = (index: number) => {
    const copy = { ...dynamicData[index], id: Date.now() }
    copy.name = `${copy.name}_副本`
    dynamicData.splice(index + 1, 0, copy)
    message.success('复制成功')
  }

  const handleDynamicMove = (index: number, direction: number) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= dynamicData.length) return
    const temp = dynamicData[index]
    dynamicData[index] = dynamicData[targetIndex]
    dynamicData[targetIndex] = temp
  }

  const handleDynamicDelete = (index: number) => {
    dynamicData.splice(index, 1)
    message.success('已删除')
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
