/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\user-manage\useUserManagement.ts
 * @Description: 页面状态、表单及请求控制，模板只负责展示和事件绑定
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { NTreeSelect } from 'naive-ui/es'

import type {
  UserData,
  UserFormData,
  DeptData,
  DeptTreeOption,
  SearchForm,
  UserType,
  RoleData,
} from '@/api/user-manage.contract'
import {
  getUserListApi,
  getDeptListApi,
  getUserRolesApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  updateUserStatusApi,
} from '@/api/user-manage'
import { createUserActions, createUserColumns } from './d_columns'
import { createUserRoleOptions } from './d_roleOptions'
import { useUserPasswordReset } from './useUserPasswordReset'
import {
  type FormInstance,
  type FormOption,
  type FormConfig,
  type FormRenderer,
  type SubmitEventPayload,
} from '@robot-admin/naive-ui-components/C_Form'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { isMockDataMode } from '@/config/dataMode'
import { s_userStore } from '@/stores/user'
import {
  getMockCompanies,
  getMockCompanyRoles,
  getMockDirectoryUser,
  validateMockMemberships,
} from '@/api/auth.mock-directory'

import type { TreeExpose } from '@robot-admin/naive-ui-components/C_Tree'
import '@robot-admin/naive-ui-components/C_Tree/style.css'
import type { ActionItem } from '@robot-admin/naive-ui-components'
import type { TableInstance } from '@robot-admin/naive-ui-components/C_Table'
import {
  USER_FORM_RULES,
  DEFAULT_USER_FORM_DATA,
  UI_CONFIG,
  COMPONENT_CONFIG,
  findDeptById,
  findDeptByType,
  getUserTypeConfig,
  getUserStatusConfig,
  convertDeptListToTreeOptions,
} from './data'

/** 创建用户管理页面的独立状态与业务行为。 */
export function useUserManagement() {
  const message = useMessage()
  const dialog = useDialog()
  const mockMode = isMockDataMode()
  const userStore = s_userStore()
  const passwordReset = useUserPasswordReset(
    () => userStore.activeContext?.id,
    () => loadUsers()
  )
  const companyOptions = getMockCompanies().map(company => ({
    label: `${company.tenantName} · ${company.companyName}`,
    value: company.id,
  }))
  const companyRoleOptions = getMockCompanyRoles().map(role => ({
    label: role.name,
    value: role.id,
  }))
  const getCompanyName = (contextId: string) =>
    companyOptions.find(item => item.value === contextId)?.label ?? contextId
  const getCompanyRoleName = (roleId: string) =>
    companyRoleOptions.find(item => item.value === roleId)?.label ?? roleId
  const getUserMemberships = (username: string) =>
    getMockDirectoryUser(username)?.memberships ?? []
  const getCompanyOptions = (currentId: string) =>
    companyOptions.filter(
      option =>
        option.value === currentId ||
        !formData.memberships.some(item => item.contextId === option.value)
    )
  const setPrimaryMembership = (index: number) =>
    formData.memberships.forEach((item, itemIndex) => {
      item.isPrimary = itemIndex === index
    })
  const removeCompanyMembership = (index: number) => {
    const wasPrimary = formData.memberships[index]?.isPrimary
    formData.memberships.splice(index, 1)
    if (wasPrimary && formData.memberships.length) setPrimaryMembership(0)
  }
  const addCompanyMembership = () => {
    const available = companyOptions.find(
      option =>
        !formData.memberships.some(item => item.contextId === option.value)
    )
    if (!available) return
    formData.memberships.push({
      contextId: available.value,
      isPrimary: !formData.memberships.length,
      roleId: 'auditor',
    })
  }

  // ==================== 响应式数据 ====================
  const { loading, run: runLatestUserRequest } = useLatestRequest()
  const showModal = ref(false)
  const showUserDetail = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance<UserFormData> | null>(null)
  const userTableRef = ref<TableInstance<UserData> | null>(null)
  const deptTreeRef = ref<TreeExpose<DeptData> | null>(null)
  const expandedDeptKeys = ref<string[]>([])
  const selectedDeptKeys = ref<string[]>([])
  const selectedUsers = ref<string[]>([])
  const isAllExpanded = ref(false)
  const currentUser = ref<UserData | null>(null)

  const userList = reactive<UserData[]>([])
  const deptList = reactive<DeptData[]>([])
  const userRoles = ref<RoleData[]>([])
  const userRoleOptions = computed(() => createUserRoleOptions(userRoles.value))

  const formData = reactive<UserFormData>({ ...DEFAULT_USER_FORM_DATA })
  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    roleId: null,
    deptId: null,
    userType: null,
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
    modalMode.value === 'add' ? '新增用户' : '编辑用户'
  )

  // 展开按钮的文案由部门树状态决定；通用操作沿用语义预设。
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增用户',
      onClick: () => handleAddUserModal(),
    },
    {
      key: 'expand',
      label: isAllExpanded.value ? '收起全部' : '展开全部',
      icon: COMPONENT_CONFIG.icons.tree,
      onClick: expandAll,
    },
    { key: 'refresh', onClick: refreshData },
  ])

  // 批量操作按钮配置
  const batchActions = computed<ActionItem[]>(() => [
    {
      key: 'toggle',
      label: '批量操作',
      icon: COMPONENT_CONFIG.icons.toggle,
      type: 'warning',
      onClick: () => handleBatchOperation('toggle'),
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: COMPONENT_CONFIG.icons.delete,
      onClick: () => handleBatchOperation('delete'),
    },
  ])

  const selectedDept = computed(() => {
    if (!selectedDeptKeys.value.length) return null
    return findDeptById(deptList, selectedDeptKeys.value[0])
  })

  const deptIconConfig = computed(() => ({
    typeMap: { dept: 'mdi:office-building', external: 'mdi:account-group' },
    colorMap: { dept: '#1890ff', external: '#52c41a' },
  }))

  const filteredRoleOptions = computed(() =>
    createUserRoleOptions(userRoles.value, formData.userType)
  )

  const deptTreeOptions = computed((): DeptTreeOption[] =>
    convertDeptListToTreeOptions(deptList)
  )

  // ==================== 辅助函数 ====================
  const getRowClassName = (row: UserData) =>
    row.status === 0 ? 'disabled-row' : ''
  const rowKey = (row: UserData) => row.id

  // ==================== 渲染函数 ====================
  // ==================== 表格操作配置 ====================
  const tableActions = createUserActions({
    view: row => handleViewUser(row),
    edit: row => handleEditUser(row),
    delete: row => handleDeleteUser(row.id),
    toggle: row => handleToggleUserStatus(row),
    reset: row => passwordReset.open(row),
  })

  // ==================== 表格列配置 ====================
  // ==================== 用户详情字段配置 ====================
  const getUserDetailFields = (user: UserData) => [
    {
      key: 'username',
      label: '用户名',
      value: user.username,
      component: 'div',
      props: { class: { 'disabled-text': user.status === 0 } },
    },
    {
      key: 'nickname',
      label: '昵称',
      value: user.nickname,
      component: 'div',
      props: { class: { 'disabled-text': user.status === 0 } },
    },
    {
      key: 'userType',
      label: '用户类型',
      value: getUserTypeConfig(user.userType).text,
      component: NTag,
      props: {
        type: getUserTypeConfig(user.userType).type,
        size: 'small',
        class: { 'disabled-tag': user.status === 0 },
      },
    },
    {
      key: 'email',
      label: '邮箱',
      value: user.email || '-',
      component: 'div',
      props: { class: { 'disabled-text': user.status === 0 } },
    },
    {
      key: 'phone',
      label: '手机号',
      value: user.phone || '-',
      component: 'div',
      props: { class: { 'disabled-text': user.status === 0 } },
    },
    {
      key: 'deptName',
      label: '公司主部门',
      help: '仅维护当前公司成员的主部门，其他公司独立保存',
      value: user.deptName || '-',
      component: NTag,
      props: {
        type: 'info',
        size: 'small',
        class: { 'disabled-tag': user.status === 0 },
      },
    },
    ...(user.userType === 'external'
      ? [
          {
            key: 'companyName',
            label: '公司名称',
            value: user.companyName || '-',
            component: 'div',
            props: { class: { 'disabled-text': user.status === 0 } },
          },
          {
            key: 'contactPerson',
            label: '联系人',
            value: user.contactPerson || '-',
            component: 'div',
            props: { class: { 'disabled-text': user.status === 0 } },
          },
        ]
      : []),
    {
      key: 'status',
      label: '本公司成员状态',
      value: getUserStatusConfig(user.status).text,
      component: NTag,
      props: { type: getUserStatusConfig(user.status).type, size: 'small' },
    },
  ]

  const getTimeFields = (user: UserData) => [
    { key: 'createTime', label: '创建时间', value: user.createTime },
    ...(user.updateTime
      ? [{ key: 'updateTime', label: '更新时间', value: user.updateTime }]
      : []),
    ...(user.lastLoginTime
      ? [{ key: 'lastLoginTime', label: '最后登录', value: user.lastLoginTime }]
      : []),
  ]

  // ==================== 表单字段配置 ====================
  const formOptions = computed<FormOption<UserFormData>[]>(() => {
    const options: FormOption<UserFormData>[] = [
      {
        prop: 'userType',
        show: mockMode,
        rules: USER_FORM_RULES.userType,
        label: '用户类型',
        type: 'select',
        children: UI_CONFIG.userType,
        placeholder: '请选择用户类型',
      },
      {
        prop: 'username',
        rules: USER_FORM_RULES.username,
        label: '用户名',
        type: 'input',
        disabled: modalMode.value === 'edit',
        help:
          modalMode.value === 'edit'
            ? '用户名作为登录凭证，创建后不可修改'
            : undefined,
        attrs: {
          placeholder: '请输入用户名',
        },
      },
      {
        prop: 'nickname',
        rules: USER_FORM_RULES.nickname,
        label: '昵称',
        type: 'input',
        attrs: { placeholder: '请输入昵称' },
      },
      {
        prop: 'email',
        rules: USER_FORM_RULES.email,
        label: '邮箱',
        type: 'input',
        attrs: { placeholder: '请输入邮箱' },
      },
      {
        prop: 'phone',
        rules: USER_FORM_RULES.phone,
        label: '手机号',
        type: 'input',
        attrs: { placeholder: '请输入手机号' },
      },
      {
        prop: 'deptId',
        rules: USER_FORM_RULES.deptId,
        label: '公司主部门',
        help: '仅维护当前公司成员的主部门，其他公司独立保存',
        type: 'treeSelect',
        attrs: {
          options: deptTreeOptions.value,
          placeholder: '请选择部门',
          clearable: true,
          checkStrategy: 'child',
          keyField: 'id',
          labelField: 'name',
          childrenField: 'children',
        },
        show: !mockMode || formData.userType === 'internal',
      },
      {
        prop: 'companyName',
        rules: USER_FORM_RULES.companyName,
        label: '公司名称',
        type: 'input',
        attrs: { placeholder: '请输入公司名称' },
        show: mockMode && formData.userType === 'external',
      },
      {
        prop: 'contactPerson',
        rules: USER_FORM_RULES.contactPerson,
        label: '联系人',
        type: 'input',
        attrs: { placeholder: '请输入联系人' },
        show: mockMode && formData.userType === 'external',
      },
      {
        prop: 'roleIds',
        rules: USER_FORM_RULES.roleIds,
        label: '用户角色',
        type: 'select',
        children: filteredRoleOptions.value,
        placeholder: '请选择角色',
        attrs: {
          multiple: true,
          clearable: true,
        },
      },
      {
        prop: 'password',
        rules: USER_FORM_RULES.password,
        label: '初始密码',
        type: 'input',
        attrs: {
          type: 'password',
          placeholder: '请输入初始密码',
          showPasswordOn: 'click',
        },
        show: modalMode.value === 'add',
      },
      {
        prop: 'status',
        rules: USER_FORM_RULES.status,
        label: '本公司成员状态',
        type: 'userStatus',
        attrs: {
          checkedValue: 1,
          uncheckedValue: 0,
        },
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'textarea',
        placeholder: '请输入备注信息',
        attrs: { rows: 3 },
        layout: { span: 2 },
      },
    ]
    return options.map(option => ({
      ...option,
      disabled: !!formRef.value?.isSubmitting || option.disabled,
    }))
  })
  const formRenderers: Record<string, FormRenderer> = {
    treeSelect: props => h(NTreeSelect, props),
    userStatus: props =>
      h(NSwitch, props, { checked: () => '正常', unchecked: () => '禁用' }),
  }
  const formConfig = computed<FormConfig<UserFormData>>(() => ({
    layout: 'grid',
    grid: { cols: 2, gutter: 16 },
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    preserveRemovedFields: true,
    onSubmit: handleSaveUser,
  }))
  /** 先同步模型再处理类型联动，避免旧字段覆盖部门和角色的清理。 */
  function updateUserForm(model: UserFormData) {
    const typeChanged = model.userType !== formData.userType
    Object.assign(formData, model)
    if (typeChanged) handleUserTypeChange(model.userType)
  }

  let batchRunning = false
  /** 确认框使用当前公司及选中行的快照，整批结束后读取实际结果。 */
  const handleBatchOperation = (operation: 'delete' | 'toggle') => {
    if (batchRunning) return
    const ids = new Set(selectedUsers.value)
    if (!ids.size) {
      message.warning('请先选择用户')
      return
    }
    const targets = userList
      .filter(row => ids.has(row.id))
      .map(({ id, status, membershipRevision }) => ({
        id,
        status,
        membershipRevision,
      }))
    if (targets.length !== ids.size) {
      message.warning('选中的用户已不在当前列表，请重新选择')
      return
    }
    const contextId = userStore.activeContext?.id
    const { token } = userStore
    const isCurrent = () =>
      userStore.activeContext?.id === contextId && userStore.token === token
    const deleting = operation === 'delete'
    const config = COMPONENT_CONFIG.batchConfig[operation]
    dialog[config.type]({
      title: config.title,
      content: config.content.replace(
        '选中的用户',
        `选中的 ${targets.length} 个用户`
      ),
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (batchRunning) return false
        if (!isCurrent()) return
        batchRunning = true
        try {
          const results = await Promise.allSettled(
            targets.map(async row =>
              deleting
                ? deleteUserApi(row.id, row.membershipRevision, contextId)
                : updateUserStatusApi(
                    row.id,
                    row.status === 1 ? 0 : 1,
                    row.membershipRevision,
                    contextId
                  )
            )
          )
          if (!isCurrent()) return
          const failed = results.filter(result => result.status === 'rejected')
          if (failed.length !== results.length) {
            userTableRef.value?.clearSelection()
            selectedUsers.value = []
          }
          if (failed.length) {
            const [{ reason }] = failed
            const summary = `批量${deleting ? '删除' : '操作'}成功 ${results.length - failed.length} 项，失败 ${failed.length} 项`
            message.error(
              reason instanceof Error
                ? `${summary}，${reason.message}`
                : summary
            )
          } else {
            message.success(`批量${deleting ? '删除' : '操作'}成功`)
          }
          await loadUsers()
        } finally {
          batchRunning = false
        }
      },
    })
  }
  const handleAddUserData = async (draft: UserFormData) => {
    await createUserApi({ ...draft, contextId: userStore.activeContext?.id })
    message.success('添加成功')
  }
  const handleUpdateUserData = async (draft: UserFormData) => {
    if (!draft.id) throw new Error('用户ID不存在')
    await updateUserApi(draft.id, {
      ...draft,
      contextId: userStore.activeContext?.id,
    })
    message.success('修改成功')
  }

  // ==================== 事件处理函数 ====================
  const handleDeptSelect = (_node: unknown, keys: (string | number)[]) => {
    selectedDeptKeys.value = keys.map(k => String(k))
    searchForm.deptId = keys.length > 0 ? String(keys[0]) : null
    handleSearch()
  }

  const handleSearch = () => {
    pagination.page = 1
    loadUsers()
  }

  const handlePaginationChange = async (page: number, pageSize: number) => {
    pagination.page = page
    pagination.pageSize = pageSize
    await loadUsers()
  }

  /** 通过组件公开事件接收选中键，批量操作使用独立快照。 */
  const handleSelectionChange = (keys: (string | number)[]) => {
    selectedUsers.value = keys.map(String)
  }

  const expandAll = () => {
    if (isAllExpanded.value) {
      deptTreeRef.value?.collapseAll()
      isAllExpanded.value = false
    } else {
      deptTreeRef.value?.expandAll()
      isAllExpanded.value = true
    }
  }

  const refreshData = async () => {
    await Promise.all([loadUsers(), loadDepts(), loadUserRoles()])
    message.success('刷新成功')
  }

  const handleUserTypeChange = (type: UserType) => {
    if (type === 'external') {
      formData.deptId = findDeptByType(deptList, 'external')?.id ?? null
    } else if (type === 'internal') {
      formData.companyName = ''
      formData.contactPerson = ''
      formData.deptId = null
    }
    formData.roleIds = []
  }

  const handleAddUserModal = (deptId?: string) => {
    modalMode.value = 'add'
    delete formData.id
    delete formData.revision
    delete formData.membershipRevision
    Object.assign(formData, DEFAULT_USER_FORM_DATA)
    formData.memberships = [
      {
        contextId: userStore.activeContext?.id ?? companyOptions[0].value,
        isPrimary: true,
        roleId: 'auditor',
      },
    ]
    const department = deptId
      ? findDeptById(deptList, deptId)
      : selectedDept.value
    formData.deptId = deptId ?? department?.id ?? null
    if (department?.type === 'external') formData.userType = 'external'
    showModal.value = true
  }

  const handleEditUser = (user: UserData) => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: user.id,
      revision: user.revision,
      membershipRevision: user.membershipRevision,
      username: user.username,
      nickname: user.nickname,
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType ?? 'internal',
      deptId: user.deptId ?? null,
      roleIds: user.roleIds || [],
      status: user.status,
      remark: user.remark || '',
      companyName: user.companyName || '',
      contactPerson: user.contactPerson || '',
      memberships: getUserMemberships(user.username).map(item => ({ ...item })),
    })
    showModal.value = true
  }

  const handleViewUser = (user: UserData) => {
    currentUser.value = user
    showUserDetail.value = true
  }

  const handleToggleUserStatus = async (user: UserData) => {
    const newStatus = user.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'

    try {
      await updateUserStatusApi(
        user.id,
        newStatus,
        user.membershipRevision,
        userStore.activeContext?.id
      )
      await loadUsers()
      message.success(`${statusText}成功`)
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : `${statusText}失败`
      )
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const row = userList.find(user => user.id === id)
      if (!row) throw new Error('用户快照已失效，请刷新后重试')
      await deleteUserApi(
        id,
        row.membershipRevision,
        userStore.activeContext?.id
      )
      message.success('删除成功')
      await loadUsers()
    } catch {
      message.error('删除失败')
    }
  }

  /** 提交用户快照，校验企业归属并刷新用户列表。 */
  async function handleSaveUser({
    model,
  }: SubmitEventPayload<UserFormData>): Promise<void> {
    try {
      if (mockMode) validateMockMemberships(model.memberships)
      await (modalMode.value === 'add'
        ? handleAddUserData(model)
        : handleUpdateUserData(model))

      await loadUsers()
      if (currentUser.value?.id === model.id) {
        const updated = userList.find(user => user.id === model.id)
        if (updated) currentUser.value = { ...updated }
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('保存失败')
    }
  }

  const handleCancelModal = () => {
    showModal.value = false
    delete formData.id
    Object.assign(formData, DEFAULT_USER_FORM_DATA)
    formData.memberships = []
  }

  // ==================== 数据加载 ====================
  const loadUsers = async () => {
    try {
      const params = {
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize,
        contextId: mockMode ? userStore.activeContext?.id : undefined,
      }
      const response = await runLatestUserRequest(signal =>
        getUserListApi(params, signal)
      )
      if (!response) return
      userList.length = 0
      userList.push(...response.data.list)
      pagination.itemCount = response.data.total
    } catch {
      message.error('加载用户列表失败')
    }
  }

  const loadDepts = async () => {
    try {
      const response = await getDeptListApi()
      deptList.length = 0
      deptList.push(...response.data)
    } catch {
      message.error('加载部门列表失败')
    }
  }

  const loadUserRoles = async () => {
    try {
      const response = await getUserRolesApi()
      userRoles.value = response.data
    } catch {
      message.error('加载角色列表失败')
    }
  }

  // 生命周期
  onMounted(async () => {
    await Promise.all([loadUsers(), loadDepts(), loadUserRoles()])
  })

  const userColumns = createUserColumns()

  return {
    mockMode,
    formRef,
    resetPasswordFormRef: passwordReset.form,
    userTableRef,
    deptTreeRef,
    passwordReset: passwordReset.panel,
    userRoleOptions,
    membership: {
      companyOptions,
      companyRoleOptions,
      getCompanyName,
      getCompanyRoleName,
      getUserMemberships,
      getCompanyOptions,
      setPrimaryMembership,
      removeCompanyMembership,
      addCompanyMembership,
    },
    ledger: proxyRefs({
      loading,
      selected: selectedUsers,
      rows: userList,
      searchModel: searchForm,
      pagination,
      toolbar: toolbarActions,
      batchActions,
      rowClass: getRowClassName,
      rowKey,
      actions: tableActions,
      search: handleSearch,
      changePage: handlePaginationChange,
      changeSelection: handleSelectionChange,
      columns: userColumns,
    }),
    departments: proxyRefs({
      rows: deptList,
      expanded: expandedDeptKeys,
      selected: selectedDeptKeys,
      current: selectedDept,
      iconConfig: deptIconConfig,
      select: handleDeptSelect,
    }),
    editor: proxyRefs({
      visible: showModal,
      mode: modalMode,
      model: formData,
      title: modalTitle,
      options: formOptions,
      renderers: formRenderers,
      config: formConfig,
      update: updateUserForm,
      cancel: handleCancelModal,
    }),
    inspection: proxyRefs({
      visible: showUserDetail,
      user: currentUser,
      fields: getUserDetailFields,
      getTimeFields,
    }),
  }
}
