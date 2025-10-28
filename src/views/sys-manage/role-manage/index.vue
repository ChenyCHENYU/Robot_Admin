<template>
  <div class="role-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace>
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索角色名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                :name="ICONS.search"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="searchForm.type"
            placeholder="角色类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleType"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.status"
            placeholder="角色状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleStatus"
            @update:value="handleSearch"
          />
        </NSpace>

        <NSpace>
          <NButton
            type="primary"
            @click="openRoleModal()"
          >
            <template #icon>
              <C_Icon
                :name="ICONS.plus"
                :size="16"
              />
            </template>
            新增角色
          </NButton>
          <NButton @click="refreshData">
            <template #icon>
              <C_Icon
                :name="ICONS.refresh"
                :size="16"
              />
            </template>
            刷新
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <NCard class="content-card">
        <template #header>
          <NSpace
            justify="space-between"
            align="center"
          >
            <NText>
              角色列表
              <NTag
                type="info"
                size="small"
                style="margin-left: 8px"
              >
                共 {{ pagination.itemCount }} 个
              </NTag>
            </NText>
          </NSpace>
        </template>

        <!-- 使用 C_Table 组件 -->
        <C_Table
          ref="tableRef"
          :columns="tableColumns"
          :data="roleList"
          :loading="loading"
          :row-key="rowKey"
          :actions="tableActions"
          :pagination="{
            enabled: true,
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.itemCount,
            remote: true,
          }"
          edit-mode="modal"
          modal-title="编辑角色"
          :modal-width="800"
          size="small"
          striped
          bordered
          single-line
          @save="handleTableSave"
          @pagination-change="handlePaginationChange"
        />
      </NCard>
    </div>

    <!-- 角色详情抽屉 -->
    <NDrawer
      v-model:show="showRoleDetail"
      :width="600"
      placement="right"
    >
      <NDrawerContent
        title="角色详情"
        closable
      >
        <div
          class="role-detail"
          v-if="currentRole"
        >
          <NSpace
            vertical
            :size="24"
          >
            <NCard
              title="基本信息"
              size="small"
            >
              <NDescriptions
                :column="2"
                bordered
              >
                <NDescriptionsItem
                  v-for="field in roleDetailFields"
                  :key="field.key"
                  :label="field.label"
                >
                  <component
                    :is="field.component"
                    v-bind="field.props"
                  >
                    {{ field.value }}
                  </component>
                </NDescriptionsItem>
              </NDescriptions>
            </NCard>

            <NCard
              title="权限信息"
              size="small"
              v-if="currentRole.permissionNames?.length"
            >
              <NSpace>
                <NTag
                  v-for="permission in currentRole.permissionNames"
                  :key="permission"
                  type="primary"
                  size="medium"
                >
                  <template #icon>
                    <C_Icon
                      :name="ICONS.permission"
                      :size="12"
                    />
                  </template>
                  {{ permission }}
                </NTag>
              </NSpace>
            </NCard>
          </NSpace>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 添加/编辑角色弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSaveRole"
      @negative-click="closeRoleModal"
      style="width: 800px"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <NGrid
          :cols="2"
          :x-gap="16"
        >
          <NGi
            v-for="field in formFields"
            :key="field.key"
          >
            <NFormItem
              :label="field.label"
              :path="field.path"
            >
              <component
                :is="field.component"
                v-bind="field.props"
                v-model:value="formData[field.key]"
              />
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </NFormItem>
      </NForm>
    </NModal>

    <!-- 权限分配抽屉 -->
    <c_role
      v-model:show="showPermissionDrawer"
      v-model:selectedIds="selectedPermissionIds"
      :role="permissionRole"
      :permissions="permissionList"
      @save="handleSavePermissions"
      @showTemplate="showPermissionTemplate = true"
    />

    <!-- 权限模板弹窗 -->
    <NModal
      v-model:show="showPermissionTemplate"
      preset="dialog"
      title="选择权限模板"
      positive-text="应用模板"
      negative-text="取消"
      @positive-click="applyPermissionTemplate"
      style="width: 600px"
    >
      <div class="permission-templates">
        <NGrid
          :cols="1"
          :y-gap="12"
        >
          <NGi
            v-for="template in permissionTemplates"
            :key="template.id"
          >
            <NCard
              size="small"
              :class="{ 'template-selected': selectedTemplate === template.id }"
              hoverable
              @click="selectedTemplate = template.id"
            >
              <template #header>
                <NSpace align="center">
                  <NRadio :checked="selectedTemplate === template.id" />
                  <C_Icon
                    :name="template.icon"
                    :size="18"
                  />
                  <NText strong>{{ template.name }}</NText>
                  <NTag
                    size="small"
                    type="info"
                    >{{ template.permissions.length }} 项权限</NTag
                  >
                </NSpace>
              </template>

              <NText depth="3">{{ template.description }}</NText>

              <template #footer>
                <NSpace size="small">
                  <NTag
                    v-for="perm in template.permissions.slice(0, 3)"
                    :key="perm"
                    size="small"
                    type="primary"
                  >
                    {{ getPermissionNameById(perm) }}
                  </NTag>
                  <NTag
                    v-if="template.permissions.length > 3"
                    size="small"
                    type="default"
                  >
                    +{{ template.permissions.length - 3 }}
                  </NTag>
                </NSpace>
              </template>
            </NCard>
          </NGi>
        </NGrid>
      </div>
    </NModal>

    <!-- 角色用户列表弹窗 -->
    <NModal
      v-model:show="showRoleUsers"
      preset="dialog"
      :title="`${currentRole?.name} - 用户列表`"
      positive-text="关闭"
      @positive-click="showRoleUsers = false"
      style="width: 800px"
    >
      <NDataTable
        :columns="roleUserColumns"
        :data="roleUserList"
        :pagination="{ pageSize: 10 }"
        size="small"
        striped
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst, DataTableColumns } from 'naive-ui/es'
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import C_Table from '@/components/global/C_Table/index.vue'
  import {
    type RoleData,
    type RoleFormData,
    type PermissionData,
    type SearchForm,
    type PermissionTemplate,
    type RoleUserData,
    ROLE_FORM_RULES,
    DEFAULT_ROLE_FORM_DATA,
    UI_CONFIG,
    PERMISSION_TEMPLATES,
    ICONS,
    STATUS_CONFIG,
    ROLE_TYPE_CONFIG,
    getRoleListApi,
    getPermissionListApi,
    getRoleUsersApi,
    MOCK_ROLE_DATA,
    MOCK_PERMISSION_DATA,
    findPermissionById,
    updateRoleInList,
  } from './data'

  const message = useMessage()

  // ==================== 响应式数据 ====================
  const loading = ref(false)
  const showModal = ref(false)
  const showRoleDetail = ref(false)
  const showPermissionDrawer = ref(false)
  const showPermissionTemplate = ref(false)
  const showRoleUsers = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const tableRef = ref()
  const selectedPermissionIds = ref<string[]>([])
  const selectedTemplate = ref<string | null>(null)
  const currentRole = ref<RoleData | null>(null)
  const permissionRole = ref<RoleData | null>(null)

  const roleList = reactive<RoleData[]>([])
  const permissionList = reactive<PermissionData[]>([])
  const permissionTemplates = reactive<PermissionTemplate[]>([
    ...PERMISSION_TEMPLATES,
  ])
  const roleUserList = reactive<RoleUserData[]>([])

  const formData = reactive<RoleFormData>({ ...DEFAULT_ROLE_FORM_DATA })
  const formRules = ROLE_FORM_RULES

  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    type: null,
  })

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
  })

  // ==================== 计算属性 ====================
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增角色' : '编辑角色'
  )

  const roleDetailFields = computed(() => {
    if (!currentRole.value) return []
    const role = currentRole.value

    return [
      {
        key: 'name',
        label: '角色名称',
        value: role.name,
        component: 'div',
        props: {},
      },
      {
        key: 'code',
        label: '角色编码',
        value: role.code,
        component: 'div',
        props: {},
      },
      {
        key: 'type',
        label: '角色类型',
        value: ROLE_TYPE_CONFIG[role.type].text,
        component: NTag,
        props: {
          type: ROLE_TYPE_CONFIG[role.type].type,
          size: 'small',
        },
      },
      {
        key: 'status',
        label: '角色状态',
        value: STATUS_CONFIG[role.status as keyof typeof STATUS_CONFIG].text,
        component: NTag,
        props: {
          type: STATUS_CONFIG[role.status as keyof typeof STATUS_CONFIG].type,
          size: 'small',
        },
      },
      {
        key: 'description',
        label: '角色描述',
        value: role.description || '-',
        component: 'div',
        props: {},
      },
      {
        key: 'userCount',
        label: '用户数量',
        value: `${role.userCount || 0} 人`,
        component: 'div',
        props: {},
      },
    ]
  })

  const formFields = computed(() => [
    {
      key: 'name' as keyof RoleFormData,
      label: '角色名称',
      path: 'name',
      component: NInput,
      props: { placeholder: '请输入角色名称' },
    },
    {
      key: 'code' as keyof RoleFormData,
      label: '角色编码',
      path: 'code',
      component: NInput,
      props: {
        placeholder: '请输入角色编码',
        disabled: modalMode.value === 'edit',
      },
    },
    {
      key: 'type' as keyof RoleFormData,
      label: '角色类型',
      path: 'type',
      component: NSelect,
      props: {
        options: UI_CONFIG.roleType,
        placeholder: '请选择角色类型',
        disabled: modalMode.value === 'edit',
      },
    },
    {
      key: 'sort' as keyof RoleFormData,
      label: '排序',
      path: 'sort',
      component: NInputNumber,
      props: {
        placeholder: '请输入排序值',
        min: 0,
        max: 9999,
        style: { width: '100%' },
      },
    },
    {
      key: 'status' as keyof RoleFormData,
      label: '角色状态',
      path: 'status',
      component: NSwitch,
      props: {
        checkedValue: 1,
        uncheckedValue: 0,
      },
    },
  ])

  // ==================== 行键配置 ====================
  const rowKey = (row: any) => row.id

  // ==================== 表格列配置 ====================
  const tableColumns = computed(() => [
    {
      key: 'type',
      title: '角色类型',
      width: 100,
      editable: false,
      render: (row: any) =>
        h(
          NTag,
          {
            type: ROLE_TYPE_CONFIG[row.type as keyof typeof ROLE_TYPE_CONFIG]
              .type,
            size: 'small',
          },
          {
            icon: () =>
              h(C_Icon, {
                name: ROLE_TYPE_CONFIG[
                  row.type as keyof typeof ROLE_TYPE_CONFIG
                ].icon,
                size: 10,
              }),
            default: () =>
              ROLE_TYPE_CONFIG[row.type as keyof typeof ROLE_TYPE_CONFIG].text,
          }
        ),
    },
    {
      key: 'name',
      title: '角色名称',
      width: 120,
      editable: true,
      required: true,
    },
    { key: 'code', title: '角色编码', width: 120, editable: false },
    {
      key: 'description',
      title: '描述',
      width: 180,
      editable: true,
      editType: 'textarea' as const,
    },
    {
      key: 'permissionNames',
      title: '权限',
      width: 200,
      align: 'center' as const,
      editable: false,
      render: (row: any) => {
        if (!row.permissionNames?.length) {
          return h('div', { style: { textAlign: 'center' } }, '-')
        }

        return h('div', { style: { textAlign: 'center' } }, [
          h(
            NTooltip,
            {
              trigger: 'hover',
              placement: 'top',
              style: { maxWidth: '300px' },
            },
            {
              trigger: () =>
                h(NSpace, { size: 4, justify: 'center' }, () => [
                  h(
                    NTag,
                    { size: 'small', type: 'primary' },
                    () => row.permissionNames[0]
                  ),
                  row.permissionNames.length > 1 &&
                    h(
                      NTag,
                      { size: 'small', type: 'default' },
                      () => `+${row.permissionNames.length - 1}`
                    ),
                ]),
              default: () =>
                h('div', { style: { padding: '8px' } }, [
                  h(
                    'div',
                    {
                      style: {
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: '4px',
                      },
                    },
                    `权限列表 (${row.permissionNames.length})`
                  ),
                  h(
                    'div',
                    { style: { maxHeight: '200px', overflowY: 'auto' } },
                    row.permissionNames.map((name: string) =>
                      h(
                        'div',
                        {
                          style: {
                            padding: '2px 0',
                            display: 'flex',
                            alignItems: 'center',
                          },
                        },
                        [
                          h(C_Icon, {
                            name: 'mdi:shield-check',
                            size: 12,
                            style: { marginRight: '6px', color: '#18a058' },
                          }),
                          h('span', name),
                        ]
                      )
                    )
                  ),
                ]),
            }
          ),
        ])
      },
    },
    {
      key: 'userCount',
      title: '用户数',
      width: 80,
      align: 'center' as const,
      editable: false,
      render: (row: any) =>
        row.userCount
          ? h(
              NButton,
              {
                text: true,
                type: 'primary',
                size: 'small',
                onClick: () => handleViewRoleUsers(row),
              },
              () => `${row.userCount} 人`
            )
          : h('span', '0'),
    },
    {
      key: 'sort',
      title: '排序',
      width: 80,
      editable: true,
      editType: 'number' as const,
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      editable: true,
      editType: 'switch' as const,
      render: (row: any) =>
        h(
          NTag,
          {
            type: STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].type,
            size: 'small',
          },
          () => STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].text
        ),
    },
    { key: 'createTime', title: '创建时间', width: 160, editable: false },
  ])

  // ==================== 表格操作配置 ====================
  const tableActions = computed(() => ({
    detail: (row: any) => viewRole(row),
    edit: (row: any) => editRole(row),
    delete: async (row: any) => {
      if (row.type === 'system') {
        message.warning('系统角色不能删除')
        return Promise.reject('系统角色不能删除') // 阻止后续执行
      }
      await deleteRole(row.id)
    },
    custom: [
      {
        key: 'permission',
        label: '权限',
        icon: 'mdi:shield-account',
        type: 'primary' as const,
        onClick: (row: any) => openPermissionDrawer(row),
      },
      {
        key: 'enable',
        label: '启用',
        icon: 'mdi:play',
        type: 'success' as const,
        onClick: (row: any) => toggleRoleStatus(row),
        show: (row: any) =>
          row.status === 0 &&
          !(row.type === 'system' && row.code === 'super_admin'),
      },
      {
        key: 'disable',
        label: '禁用',
        icon: 'mdi:pause',
        type: 'warning' as const,
        onClick: (row: any) => toggleRoleStatus(row),
        show: (row: any) =>
          row.status === 1 &&
          !(row.type === 'system' && row.code === 'super_admin'),
      },
    ],
  }))

  // ==================== 表格用户列配置 ====================
  const roleUserColumns: DataTableColumns<RoleUserData> = [
    { title: '用户名', key: 'username', width: 120 },
    { title: '昵称', key: 'nickname', width: 120 },
    { title: '邮箱', key: 'email', width: 200 },
    { title: '手机号', key: 'phone', width: 120 },
    { title: '部门', key: 'deptName', width: 120 },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (row: RoleUserData) =>
        h(
          NTag,
          { type: row.status === 1 ? 'success' : 'error', size: 'small' },
          { default: () => (row.status === 1 ? '正常' : '禁用') }
        ),
    },
  ]

  // ==================== 工具函数 ====================
  const getPermissionNameById = (permissionId: string): string =>
    findPermissionById(MOCK_PERMISSION_DATA, permissionId)?.name || ''

  // ==================== C_Table 事件处理 ====================
  const handleTableSave = async (rowData: any) => {
    try {
      updateRoleInList(rowData.id, {
        name: rowData.name,
        description: rowData.description || undefined,
        status: rowData.status,
        sort: rowData.sort,
        updateTime: new Date().toLocaleString(),
      })
      message.success('修改成功')
      await loadRoles()
    } catch {
      message.error('保存失败')
    }
  }

  // ==================== 事件处理 ====================
  const handleSearch = () => {
    pagination.page = 1
    loadRoles()
  }

  const handlePaginationChange = async (...args: any[]) => {
    const [page, pageSize] = args
    pagination.page = page
    pagination.pageSize = pageSize
    loadRoles()
  }

  const refreshData = async () => {
    await Promise.all([loadRoles(), loadPermissions()])
    message.success('刷新成功')
  }

  // 角色操作
  const openRoleModal = (role?: RoleData) => {
    modalMode.value = role ? 'edit' : 'add'
    if (role) {
      Object.assign(formData, {
        id: role.id,
        name: role.name,
        code: role.code,
        type: role.type,
        status: role.status,
        description: role.description || '',
        permissionIds: [],
        sort: role.sort,
        remark: role.remark || '',
      })
    } else {
      Object.assign(formData, DEFAULT_ROLE_FORM_DATA)
    }
    showModal.value = true
  }

  const closeRoleModal = () => {
    showModal.value = false
    Object.assign(formData, DEFAULT_ROLE_FORM_DATA)
  }

  const editRole = (role: any) => openRoleModal(role)

  const viewRole = (role: RoleData) => {
    currentRole.value = role
    showRoleDetail.value = true
  }

  const toggleRoleStatus = async (role: RoleData) => {
    if (role.type === 'system' && role.code === 'super_admin') {
      message.warning('超级管理员角色不能禁用')
      return
    }

    const newStatus = role.status === 1 ? 0 : 1
    updateRoleInList(role.id, {
      status: newStatus,
      updateTime: new Date().toLocaleString(),
    })
    message.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
    await loadRoles() // 刷新数据
  }

  const deleteRole = async (id: string) => {
    const roleIndex = MOCK_ROLE_DATA.findIndex(role => role.id === id)
    if (roleIndex !== -1) {
      MOCK_ROLE_DATA.splice(roleIndex, 1)
      await loadRoles()
    }
  }

  const handleSaveRole = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      if (modalMode.value === 'add') {
        const existingRole = MOCK_ROLE_DATA.find(
          role => role.code === formData.code
        )
        if (existingRole) {
          message.error('角色编码已存在')
          return false
        }

        const newRole: RoleData = {
          id: `role_${Date.now()}`,
          name: formData.name,
          code: formData.code,
          type: formData.type,
          status: formData.status,
          description: formData.description || undefined,
          permissionIds: [],
          permissionNames: [],
          userCount: 0,
          sort: formData.sort,
          createTime: new Date().toLocaleString(),
          remark: formData.remark || undefined,
        }
        MOCK_ROLE_DATA.push(newRole)
        message.success('添加成功')
      } else {
        updateRoleInList(formData.id!, {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          sort: formData.sort,
          remark: formData.remark || undefined,
          updateTime: new Date().toLocaleString(),
        })
        message.success('修改成功')
      }

      showModal.value = false
      await loadRoles()
      return true
    } catch {
      return false
    }
  }

  // 权限分配
  const openPermissionDrawer = (role: RoleData) => {
    permissionRole.value = role
    selectedPermissionIds.value = [...(role.permissionIds || [])]
    showPermissionDrawer.value = true
  }

  const handleSavePermissions = async () => {
    if (!permissionRole.value) return

    const permissionNames = selectedPermissionIds.value
      .map(id => getPermissionNameById(id))
      .filter(Boolean)

    updateRoleInList(permissionRole.value.id, {
      permissionIds: [...selectedPermissionIds.value],
      permissionNames,
      updateTime: new Date().toLocaleString(),
    })

    message.success('权限分配成功')
    showPermissionDrawer.value = false
    await loadRoles()
  }

  const applyPermissionTemplate = () => {
    const template = permissionTemplates.find(
      t => t.id === selectedTemplate.value
    )
    if (template) {
      selectedPermissionIds.value = [...template.permissions]
      showPermissionTemplate.value = false
      message.success(`已应用 ${template.name}`)
    }
  }

  // 查看角色用户列表
  const handleViewRoleUsers = async (role: RoleData) => {
    currentRole.value = role
    try {
      const response = await getRoleUsersApi(role.id)
      roleUserList.splice(0, roleUserList.length, ...response.data)
      showRoleUsers.value = true
    } catch {
      message.error('获取用户列表失败')
    }
  }

  // ==================== 数据加载 ====================
  const loadRoles = async () => {
    loading.value = true
    try {
      const params = {
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize,
      }
      const response = await getRoleListApi(params)
      roleList.length = 0
      roleList.push(...response.data.list)
      pagination.itemCount = response.data.total
    } catch {
      message.error('加载角色列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await getPermissionListApi()
      permissionList.length = 0
      permissionList.push(...response.data)
    } catch {
      message.error('加载权限列表失败')
    }
  }

  // 生命周期
  onMounted(async () => {
    await Promise.all([loadRoles(), loadPermissions()])
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
