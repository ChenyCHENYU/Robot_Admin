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

            <!-- 新增员工按钮 -->
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
            <NRadio value="male">男</NRadio>
            <NRadio value="female">女</NRadio>
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
            :options="[
              { label: '技术部', value: 'tech' },
              { label: '人事部', value: 'hr' },
              { label: '市场部', value: 'market' },
              { label: '财务部', value: 'finance' },
            ]"
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
            :options="[
              { label: '在职', value: 'active' },
              { label: '离职', value: 'inactive' },
              { label: '试用期', value: 'probation' },
            ]"
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
        <NSpace justify="end">
          <NButton @click="showAddModal = false">取消</NButton>
          <NButton
            type="primary"
            @click="handleAddSubmit"
            :loading="table.loading.value"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { EditMode } from '@/types/modules/table'
  import { useTableCrud } from '@robot-admin/request-core'
  import { EDIT_MODES, MODE_CONFIG, employeeTableConfig } from './data'
  import { PRESET_RULES } from '@robot-admin/form-validate'

  // ================= 初始化表格 CRUD =================
  const table = useTableCrud(employeeTableConfig)

  // ================= UI 状态管理 =================
  const editMode = ref<EditMode>('modal')
  const showAddModal = ref(false) // 新增模态框显示状态
  const addFormRef = ref() // 表单引用
  const addFormData = ref<any>({}) // 表单数据

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])

  // 表单验证规则（使用封装的 PRESET_RULES）
  const addFormRules = {
    name: [PRESET_RULES.required('姓名'), PRESET_RULES.length('姓名', 2, 20)],
    age: [
      PRESET_RULES.required('年龄', ['blur', 'change']),
      { ...PRESET_RULES.range('年龄', 18, 65), trigger: ['blur', 'change'] }, // 修改 trigger
    ],
    gender: [PRESET_RULES.required('性别', 'change')],
    email: [PRESET_RULES.required('邮箱'), PRESET_RULES.email('邮箱')],
    department: [PRESET_RULES.required('部门', 'change')],
    joinDate: [PRESET_RULES.required('入职日期', ['blur', 'change'])],
    status: [PRESET_RULES.required('状态', 'change')],
  }

  // ================= 新增员工处理 =================
  const handleAddEmployee = () => {
    // 初始化表单数据（使用默认值）
    addFormData.value = {
      name: '',
      age: 25,
      gender: 'male',
      email: '',
      department: 'tech',
      joinDate: Date.now(),
      status: 'probation',
      description: '',
    }
    showAddModal.value = true
  }

  // 提交新增表单
  const handleAddSubmit = () => {
    addFormRef.value?.validate(async (errors: any) => {
      if (!errors) {
        try {
          await table.create({
            ...addFormData.value,
            id: Date.now(), // 临时ID
          })
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
