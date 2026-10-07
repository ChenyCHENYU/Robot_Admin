/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\role-manage\useRoleManagement.ts
 * @Description: 页面状态、表单及请求控制，模板只负责展示和事件绑定
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  getRoleListApi,
  getPermissionListApi,
  getRoleUsersApi,
  getRoleDataScopesApi,
  getRoleTempAuthorizationsApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  updateRoleStatusApi,
  updateRolePermissionsApi,
} from '@/api/role-manage'
import { createRoleColumns } from './d_columns'
import type {
  FormInstance,
  FormConfig,
  FormOption,
  SubmitEventPayload,
} from '@robot-admin/naive-ui-components/C_Form'
import { useLatestRequest } from '@/composables/useLatestRequest'
import '@robot-admin/naive-ui-components/C_Icon/style.css'
import type { ActionItem, TableColumn } from '@robot-admin/naive-ui-components'
import {
  type RoleData,
  type RoleFormData,
  type PermissionData,
  type SearchForm,
  type PermissionTemplate,
  type RoleUserData,
  type RoleDataScope,
  type RoleTempAuth,
  type PermissionPreviewItem,
  ROLE_FORM_RULES,
  DEFAULT_ROLE_FORM_DATA,
  UI_CONFIG,
  PERMISSION_TEMPLATES,
  ICONS,
  STATUS_CONFIG,
  ROLE_TYPE_CONFIG,
  findPermissionById,
  extractPermissionPreview,
  compareRolePermissions,
} from './data'
import { ref, computed, watch, reactive, onMounted, h } from 'vue'
import { useMessage, NTag } from 'naive-ui/es'

/** 创建角色管理页面的独立状态与业务行为。 */
export function useRoleManagement() {
  const message = useMessage()

  // ==================== 响应式数据 ====================
  const { loading, run: runLatestRoleRequest } = useLatestRequest()
  const { run: runLatestRoleDetailRequest } = useLatestRequest()
  const {
    loading: roleUsersLoading,
    run: runLatestRoleUsersRequest,
    cancel: cancelRoleUsersRequest,
  } = useLatestRequest()
  const showModal = ref(false)
  const showRoleDetail = ref(false)
  const showPermissionDrawer = ref(false)
  const showPermissionTemplate = ref(false)
  const showRoleUsers = ref(false)
  watch(showRoleUsers, visible => {
    if (!visible) cancelRoleUsersRequest()
  })
  onDeactivated(() => {
    showRoleUsers.value = false
    cancelRoleUsersRequest()
  })
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance<RoleFormData> | null>(null)
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
  const currentDataScopes = ref<RoleDataScope[]>([])
  const currentTempAuths = ref<RoleTempAuth[]>([])

  const formData = reactive<RoleFormData>({ ...DEFAULT_ROLE_FORM_DATA })

  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    type: null,
  })

  // ==================== 权限预览 & 对比状态 ====================
  const detailTab = ref('basic')
  const showCompareModal = ref(false)
  const compareRoleA = ref<string | null>(null)
  const compareRoleB = ref<string | null>(null)
  const compareResult = ref<{
    shared: string[]
    onlyA: string[]
    onlyB: string[]
  } | null>(null)

  /** 当前角色的权限预览数据 */
  const currentPermissionPreview = computed<PermissionPreviewItem[]>(() => {
    if (!currentRole.value?.permissionIds?.length) return []
    return extractPermissionPreview(
      permissionList,
      currentRole.value.permissionIds
    )
  })

  /** 按类型分组的权限预览 */
  const groupedPreview = computed(() => {
    const menus = currentPermissionPreview.value.filter(p => p.type === 'menu')
    const buttons = currentPermissionPreview.value.filter(
      p => p.type === 'button'
    )
    const apis = currentPermissionPreview.value.filter(p => p.type === 'api')
    return { menus, buttons, apis }
  })

  /** 角色选项列表（用于对比选择器） */
  const roleOptions = computed(() =>
    roleList.map(r => ({ label: `${r.name} (${r.code})`, value: r.id }))
  )

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

  const formOptions = computed<FormOption<RoleFormData>[]>(() => [
    {
      prop: 'name',
      label: '角色名称',
      type: 'input',
      placeholder: '请输入角色名称',
      rules: ROLE_FORM_RULES.name,
    },
    {
      prop: 'code',
      label: '角色编码',
      type: 'input',
      placeholder: '请输入角色编码',
      disabled: modalMode.value === 'edit' || !!formRef.value?.isSubmitting,
      rules: ROLE_FORM_RULES.code,
    },
    {
      prop: 'type',
      label: '角色类型',
      type: 'select',
      children: UI_CONFIG.roleType,
      disabled: modalMode.value === 'edit' || !!formRef.value?.isSubmitting,
      rules: ROLE_FORM_RULES.type,
    },
    {
      prop: 'sort',
      label: '排序',
      type: 'inputNumber',
      attrs: { min: 0, max: 9999, style: { width: '100%' } },
      rules: ROLE_FORM_RULES.sort,
    },
    {
      prop: 'status',
      label: '角色状态',
      type: 'switch',
      attrs: { checkedValue: 1, uncheckedValue: 0 },
    },
    {
      prop: 'remark',
      label: '备注',
      type: 'textarea',
      placeholder: '请输入备注信息',
      attrs: { rows: 3 },
      layout: { span: 2 },
    },
  ])
  const formConfig = computed<FormConfig<RoleFormData>>(() => ({
    disabled: !!formRef.value?.isSubmitting,
    layout: 'grid',
    grid: { cols: 2, gutter: 16 },
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    preserveRemovedFields: true,
    onSubmit: handleSaveRole,
  }))

  // ==================== 行键配置 ====================
  const rowKey = (row: RoleData) => row.id

  // ==================== 表格列配置 ====================
  // ==================== 表格操作配置 ====================
  const tableActions = computed(() => ({
    detail: (row: RoleData) => viewRole(row),
    edit: (row: RoleData) => editRole(row),
    delete: async (row: RoleData) => {
      if (row.type === 'system') {
        message.warning('系统角色不能删除')
        return Promise.reject(new Error('系统角色不能删除'))
      }
      await deleteRole(row.id)
    },
    custom: [
      {
        key: 'permission',
        label: '权限',
        icon: 'mdi:shield-account',
        type: 'primary' as const,
        onClick: (row: RoleData) => openPermissionDrawer(row),
      },
      {
        key: 'enable',
        label: '启用',
        icon: 'mdi:play',
        type: 'success' as const,
        onClick: (row: RoleData) => toggleRoleStatus(row),
        show: (row: RoleData) =>
          row.status === 0 &&
          !(row.type === 'system' && row.code === 'super_admin'),
      },
      {
        key: 'disable',
        label: '禁用',
        icon: 'mdi:pause',
        type: 'warning' as const,
        onClick: (row: RoleData) => toggleRoleStatus(row),
        show: (row: RoleData) =>
          row.status === 1 &&
          !(row.type === 'system' && row.code === 'super_admin'),
      },
    ],
  }))

  // ==================== 表格用户列配置 ====================
  const roleUserColumns: TableColumn<RoleUserData>[] = [
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

  // ==================== 工具栏按钮配置 ====================
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增角色',
      icon: ICONS.plus,
      type: 'primary',
      onClick: () => openRoleModal(),
    },
    {
      key: 'compare',
      label: '对比权限',
      icon: 'mdi:compare-horizontal',
      type: 'info',
      onClick: () => {
        compareRoleA.value = null
        compareRoleB.value = null
        compareResult.value = null
        showCompareModal.value = true
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: ICONS.refresh,
      onClick: refreshData,
    },
  ])

  // ==================== 工具函数 ====================
  const getPermissionNameById = (permissionId: string): string =>
    findPermissionById(permissionList, permissionId)?.name || ''

  // ==================== C_Table 事件处理 ====================
  const handleTableSave = async (rowData: RoleData) => {
    try {
      await updateRoleApi(rowData.id, rowData)
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

  const handlePaginationChange = async (page: number, pageSize: number) => {
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
    delete formData.id
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
    delete formData.id
    Object.assign(formData, DEFAULT_ROLE_FORM_DATA)
  }

  const editRole = (role: RoleData) => openRoleModal(role)

  const loadRoleGovernanceDetails = async (roleId: string) => {
    currentDataScopes.value = []
    currentTempAuths.value = []
    try {
      const result = await runLatestRoleDetailRequest(signal =>
        Promise.all([
          getRoleDataScopesApi(roleId, signal),
          getRoleTempAuthorizationsApi(roleId, signal),
        ])
      )
      if (!result || currentRole.value?.id !== roleId) return
      currentDataScopes.value = result[0].data
      currentTempAuths.value = result[1].data
    } catch {
      message.error('角色治理详情加载失败')
    }
  }

  const viewRole = (role: RoleData) => {
    currentRole.value = role
    detailTab.value = 'basic'
    showRoleDetail.value = true
    void loadRoleGovernanceDetails(role.id)
  }

  /** 执行角色权限对比 */
  const handleCompareRoles = () => {
    if (!compareRoleA.value || !compareRoleB.value) {
      message.warning('请选择两个角色进行对比')
      return
    }
    if (compareRoleA.value === compareRoleB.value) {
      message.warning('请选择两个不同的角色')
      return
    }
    const roleA = roleList.find(r => r.id === compareRoleA.value)
    const roleB = roleList.find(r => r.id === compareRoleB.value)
    if (!roleA || !roleB) return
    compareResult.value = compareRolePermissions(roleA, roleB)
  }

  const toggleRoleStatus = async (role: RoleData) => {
    if (role.type === 'system' && role.code === 'super_admin') {
      message.warning('超级管理员角色不能禁用')
      return
    }

    const newStatus = role.status === 1 ? 0 : 1
    const action = newStatus === 1 ? '启用' : '禁用'

    try {
      await updateRoleStatusApi(role.id, newStatus)
      message.success(`${action}成功`)
      await loadRoles()
    } catch {
      message.error(`${action}失败`)
    }
  }

  const deleteRole = async (id: string) => {
    try {
      await deleteRoleApi(id)
      message.success('删除成功')
      await loadRoles()
    } catch {
      message.error('删除失败')
    }
  }

  /** 提交角色快照，保留角色编码唯一性与列表刷新。 */
  async function handleSaveRole({
    model,
  }: SubmitEventPayload<RoleFormData>): Promise<void> {
    try {
      if (modalMode.value === 'add') {
        await createRoleApi(model)
        message.success('添加成功')
      } else {
        await updateRoleApi(model.id!, model)
        message.success('修改成功')
      }

      await loadRoles()
    } catch (error) {
      throw error instanceof Error ? error : new Error('保存失败')
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

    try {
      await updateRolePermissionsApi(
        permissionRole.value.id,
        selectedPermissionIds.value
      )
      message.success('权限分配成功')
      showPermissionDrawer.value = false
      await loadRoles()
    } catch {
      message.error('权限分配失败')
    }
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
    roleUserList.splice(0)
    showRoleUsers.value = true
    try {
      const response = await runLatestRoleUsersRequest(signal =>
        getRoleUsersApi(role.id, signal)
      )
      if (!response) return
      roleUserList.splice(0, roleUserList.length, ...response.data)
    } catch {
      message.error('获取用户列表失败')
    }
  }

  // ==================== 数据加载 ====================
  const loadRoles = async () => {
    try {
      const params = {
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize,
      }
      const response = await runLatestRoleRequest(signal =>
        getRoleListApi(params, signal)
      )
      if (!response) return
      roleList.length = 0
      roleList.push(...response.data.list)
      pagination.itemCount = response.data.total
    } catch {
      message.error('加载角色列表失败')
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

  const { tableColumns } = createRoleColumns(row => handleViewRoleUsers(row))

  return {
    loading,
    roleUsersLoading,
    showModal,
    showRoleDetail,
    showPermissionDrawer,
    showPermissionTemplate,
    showRoleUsers,
    modalMode,
    formRef,
    tableRef,
    selectedPermissionIds,
    selectedTemplate,
    currentRole,
    permissionRole,
    roleList,
    permissionList,
    permissionTemplates,
    roleUserList,
    currentDataScopes,
    currentTempAuths,
    formData,
    searchForm,
    detailTab,
    showCompareModal,
    compareRoleA,
    compareRoleB,
    compareResult,
    groupedPreview,
    roleOptions,
    pagination,
    modalTitle,
    roleDetailFields,
    formOptions,
    formConfig,
    rowKey,
    tableActions,
    roleUserColumns,
    toolbarActions,
    getPermissionNameById,
    handleTableSave,
    handleSearch,
    handlePaginationChange,
    closeRoleModal,
    handleCompareRoles,
    handleSavePermissions,
    applyPermissionTemplate,
    tableColumns,
  }
}
