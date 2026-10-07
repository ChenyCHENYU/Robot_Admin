import {
  NTreeSelect,
  useMessage,
  useDialog,
  NTag,
  NButton,
  NSpace,
  NSwitch,
} from 'naive-ui/es'
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\user-manage\useUserManagement.ts
 * @Description: 页面状态、表单及请求控制，模板只负责展示和事件绑定
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { createUserColumns } from './d_columns'
import {
  PRESET_RULES,
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
  removeMockDirectoryUser,
  upsertMockDirectoryUser,
  validateMockMemberships,
} from '@/api/auth.mock-directory'

import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
import '@robot-admin/naive-ui-components/C_Icon/style.css'
import { C_Tree } from '@robot-admin/naive-ui-components/C_Tree'
import '@robot-admin/naive-ui-components/C_Tree/style.css'
import type { ActionItem } from '@robot-admin/naive-ui-components'
import {
  type UserData,
  type UserFormData,
  type DeptData,
  type DeptTreeOption,
  type SearchForm,
  type ResetPasswordForm,
  type UserType,
  USER_FORM_RULES,
  DEFAULT_USER_FORM_DATA,
  DEFAULT_RESET_PASSWORD_FORM,
  UI_CONFIG,
  COMPONENT_CONFIG,
  getUserListApi,
  getDeptListApi,
  getUserRolesApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  updateUserStatusApi,
  resetUserPasswordApi,
  MOCK_USER_DATA,
  persistMockUsers,
  getRoleNameById,
  getDeptNameById,
  findDeptById,
  convertDeptListToTreeOptions,
  getUserStatusConfig,
  getUserTypeConfig,
} from './data'
import { ref, computed, watch, reactive, onMounted, h } from 'vue'

/** 创建用户管理页面的独立状态与业务行为。 */
export function useUserManagement() {
  const message = useMessage()
  const dialog = useDialog()
  const mockMode = isMockDataMode()
  const userStore = s_userStore()
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
  const showResetPasswordModal = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance<UserFormData> | null>(null)
  const resetPasswordFormRef = ref<FormInstance<ResetPasswordForm> | null>(null)
  const tableRef = ref()
  const deptTreeRef = ref<InstanceType<typeof C_Tree> | null>(null)
  const expandedDeptKeys = ref<string[]>([])
  const selectedDeptKeys = ref<string[]>([])
  const selectedUsers = ref<string[]>([])
  const isAllExpanded = ref(false)
  const currentUser = ref<UserData | null>(null)
  const currentResetUserId = ref<string>('')

  const userList = reactive<UserData[]>([])
  const deptList = reactive<DeptData[]>([])
  const userRoleOptions = ref<{ label: string; value: string }[]>([])

  const formData = reactive<UserFormData>({ ...DEFAULT_USER_FORM_DATA })
  const resetPasswordForm = reactive<ResetPasswordForm>({
    ...DEFAULT_RESET_PASSWORD_FORM,
  })
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

  // 工具栏按钮配置
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增用户',
      icon: COMPONENT_CONFIG.icons.plus,
      type: 'primary',
      onClick: () => handleAddUserModal(),
    },
    {
      key: 'expand',
      label: isAllExpanded.value ? '收起全部' : '展开全部',
      icon: COMPONENT_CONFIG.icons.tree,
      onClick: expandAll,
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: COMPONENT_CONFIG.icons.refresh,
      onClick: refreshData,
    },
  ])

  // 批量操作按钮配置
  const batchActions = computed<ActionItem[]>(() => [
    {
      key: 'toggle',
      label: '批量操作',
      icon: COMPONENT_CONFIG.icons.toggle,
      type: 'warning',
      onClick: () => handleBatchOperation('toggle', batchToggleUsers),
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: COMPONENT_CONFIG.icons.delete,
      type: 'error',
      onClick: () => handleBatchOperation('delete', batchDeleteUsers),
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
    formData.userType === 'external'
      ? userRoleOptions.value.filter(role =>
          ['role_4', 'role_5'].includes(role.value)
        )
      : userRoleOptions.value
  )

  const deptTreeOptions = computed((): DeptTreeOption[] =>
    convertDeptListToTreeOptions(deptList)
  )

  // ==================== 辅助函数 ====================
  const updateUserInList = (userId: string, updates: Partial<UserData>) => {
    // 更新所有相关的数据源
    const updateTargets: UserData[][] = [MOCK_USER_DATA, userList]

    updateTargets.forEach(data => {
      const index = data.findIndex(item => item.id === userId)
      if (index !== -1) {
        data[index] = { ...data[index], ...updates }
      }
    })

    // 更新当前用户详情
    if (currentUser.value?.id === userId) {
      currentUser.value = { ...currentUser.value, ...updates }
    }
    if (mockMode) {
      persistMockUsers()
      const updated = MOCK_USER_DATA.find(user => user.id === userId)
      const directoryUser = updated && getMockDirectoryUser(updated.username)
      if (updated && directoryUser) {
        upsertMockDirectoryUser({
          ...directoryUser,
          enabled: updated.status === 1,
        })
      }
    }
  }

  const getRowClassName = (row: UserData) =>
    row.status === 0 ? 'disabled-row' : ''
  const rowKey = (row: UserData) => row.id

  // ==================== 渲染函数 ====================
  // ==================== 表格操作配置 ====================
  const tableActions = computed(() => ({
    // 使用完全自定义渲染
    render: (row: UserData) => {
      const buttons = [
        // 详情按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            quaternary: true,
            onClick: () => handleViewUser(row),
          },
          () => [
            h(C_Icon, {
              name: COMPONENT_CONFIG.icons.eye,
              size: 14,
              title: '详情',
            }),
          ]
        ),
        // 编辑按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'warning',
            quaternary: true,
            onClick: () => handleEditUser(row),
          },
          () => [
            h(C_Icon, {
              name: COMPONENT_CONFIG.icons.edit,
              size: 14,
              title: '编辑',
            }),
          ]
        ),
        // 删除按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            quaternary: true,
            onClick: () => handleDeleteUser(row.id),
          },
          () => [
            h(C_Icon, {
              name: COMPONENT_CONFIG.icons.delete,
              size: 14,
              title: '删除',
            }),
          ]
        ),
      ]

      // 更多操作下拉菜单
      const moreOptions = [
        {
          key: 'toggle',
          label: row.status === 1 ? '禁用' : '启用',
          icon: () =>
            h(C_Icon, {
              name:
                row.status === 1
                  ? COMPONENT_CONFIG.icons.pause
                  : COMPONENT_CONFIG.icons.play,
              size: 14,
            }),
        },
        {
          key: 'reset',
          label: '重置密码',
          icon: () => h(C_Icon, { name: COMPONENT_CONFIG.icons.key, size: 14 }),
          disabled: row.status === 0,
        },
      ]

      buttons.push(
        h(
          NDropdown,
          {
            options: moreOptions,
            onSelect: (key: string) => {
              if (key === 'toggle') {
                handleToggleUserStatus(row)
              } else if (key === 'reset') {
                handleShowResetPassword(row)
              }
            },
          },
          () =>
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
              },
              () => [
                h(C_Icon, {
                  name: 'mdi:dots-horizontal',
                  size: 14,
                  title: '更多操作',
                }),
              ]
            )
        )
      )

      return h(
        NSpace,
        { size: 2, wrap: false, justify: 'center' },
        () => buttons
      )
    },
  }))

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
      label: '所属部门',
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
      label: '用户状态',
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
  const formOptions = computed<FormOption<UserFormData>[]>(() => [
    {
      prop: 'userType',
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
      disabled: modalMode.value === 'edit' || !!formRef.value?.isSubmitting,
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
      label: '所属部门',
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
      show: formData.userType === 'internal',
    },
    {
      prop: 'companyName',
      rules: USER_FORM_RULES.companyName,
      label: '公司名称',
      type: 'input',
      attrs: { placeholder: '请输入公司名称' },
      show: formData.userType === 'external',
    },
    {
      prop: 'contactPerson',
      rules: USER_FORM_RULES.contactPerson,
      label: '联系人',
      type: 'input',
      attrs: { placeholder: '请输入联系人' },
      show: formData.userType === 'external',
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
      label: '用户状态',
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
  ])
  const formRenderers: Record<string, FormRenderer> = {
    treeSelect: props => h(NTreeSelect, props),
    userStatus: props =>
      h(NSwitch, props, { checked: () => '正常', unchecked: () => '禁用' }),
  }
  const formConfig = computed<FormConfig<UserFormData>>(() => ({
    disabled: !!formRef.value?.isSubmitting,
    layout: 'grid',
    grid: { cols: 2, gutter: 16 },
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    preserveRemovedFields: true,
    onSubmit: handleSaveUser,
  }))
  const resetPasswordOptions: FormOption<ResetPasswordForm>[] = [
    {
      prop: 'newPassword',
      label: '新密码',
      type: 'input',
      placeholder: '请输入新密码',
      attrs: { type: 'password', showPasswordOn: 'click' },
      rules: USER_FORM_RULES.password,
    },
    {
      prop: 'confirmPassword',
      label: '确认密码',
      type: 'input',
      placeholder: '请再次输入新密码',
      attrs: { type: 'password', showPasswordOn: 'click' },
      rules: [PRESET_RULES.required('确认密码')],
      dependsOn: ['newPassword'],
      crossFieldValidator: model =>
        model.confirmPassword !== model.newPassword
          ? '两次密码输入不一致'
          : null,
    },
  ]
  const resetPasswordConfig = computed<FormConfig<ResetPasswordForm>>(() => ({
    disabled: !!resetPasswordFormRef.value?.isSubmitting,
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    onSubmit: handleResetPassword,
  }))
  /** 先同步模型再处理类型联动，避免旧字段覆盖部门和角色的清理。 */
  function updateUserForm(model: UserFormData) {
    const typeChanged = model.userType !== formData.userType
    Object.assign(formData, model)
    if (typeChanged) handleUserTypeChange(model.userType)
  }

  // ==================== 组合式函数 ====================
  const useBatchOperations = () => {
    const handleBatchOperation = (
      operation: 'delete' | 'toggle',
      actionFn: (ids: string[]) => Promise<void> | void
    ) => {
      if (selectedUsers.value.length === 0) {
        message.warning('请先选择用户')
        return
      }

      const config = COMPONENT_CONFIG.batchConfig[operation]
      const content = `${config.content.replace('选中的用户', `选中的 ${selectedUsers.value.length} 个用户`)}`

      dialog[config.type]({
        title: config.title,
        content,
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: async () => {
          try {
            await actionFn(selectedUsers.value)
            message.success(
              `批量${operation === 'delete' ? '删除' : '操作'}成功`
            )
            selectedUsers.value = []
            await loadUsers()
          } catch {
            message.error(`批量${operation === 'delete' ? '删除' : '操作'}失败`)
          }
        },
      })
    }

    const batchDeleteUsers = async (ids: string[]) => {
      await Promise.all(ids.map(deleteUserApi))
      ids.forEach(id => {
        const userIndex = MOCK_USER_DATA.findIndex(user => user.id === id)
        if (userIndex !== -1) {
          if (mockMode)
            removeMockDirectoryUser(MOCK_USER_DATA[userIndex].username)
          MOCK_USER_DATA.splice(userIndex, 1)
        }
      })
      if (mockMode) persistMockUsers()
    }

    const batchToggleUsers = async (ids: string[]) => {
      await Promise.all(
        ids.map(async id => {
          const user = MOCK_USER_DATA.find(item => item.id === id)
          if (user) await updateUserStatusApi(id, user.status === 1 ? 0 : 1)
        })
      )
      ids.forEach(id => {
        const user = MOCK_USER_DATA.find(u => u.id === id)
        if (user) {
          updateUserInList(id, {
            status: user.status === 1 ? 0 : 1,
            updateTime: new Date().toLocaleString(),
          })
        }
      })
    }

    return { handleBatchOperation, batchDeleteUsers, batchToggleUsers }
  }

  const useUserOperations = () => {
    // 提取用户数据构建逻辑，降低复杂度
    const buildUserData = (
      userData: UserFormData,
      existingUser?: UserData
    ): UserData => {
      const baseData = {
        nickname: userData.nickname,
        email: userData.email || undefined,
        phone: userData.phone || undefined,
        userType: userData.userType,
        deptId: userData.deptId || undefined,
        deptName: userData.deptId
          ? getDeptNameById(userData.deptId)
          : undefined,
        roleIds: userData.roleIds,
        roleNames: userData.roleIds.map(id => getRoleNameById(id)),
        status: userData.status,
        remark: userData.remark || undefined,
        companyName: userData.companyName || undefined,
        contactPerson: userData.contactPerson || undefined,
      }

      if (existingUser) {
        return {
          ...existingUser,
          ...baseData,
          updateTime: new Date().toLocaleString(),
        }
      }

      return {
        id: `user_${Date.now()}`,
        username: userData.username,
        createTime: new Date().toLocaleString(),
        ...baseData,
      }
    }

    // 提取验证逻辑
    const validateUserData = (
      userData: UserFormData,
      mode: 'add' | 'edit'
    ): { valid: boolean; error?: string } => {
      if (mode === 'edit' && !userData.id) {
        return { valid: false, error: '用户ID不存在' }
      }

      if (mode === 'add') {
        const existingUser = MOCK_USER_DATA.find(
          user =>
            user.username.toLowerCase() === userData.username.toLowerCase()
        )
        if (
          existingUser ||
          (mockMode && getMockDirectoryUser(userData.username))
        ) {
          return { valid: false, error: '用户名已存在' }
        }
      }

      return { valid: true }
    }

    const handleAddUserData = async (userData: UserFormData): Promise<void> => {
      const validation = validateUserData(userData, 'add')
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const newUser = buildUserData(userData)
      await createUserApi(userData)
      if (mockMode) {
        upsertMockDirectoryUser({
          username: userData.username,
          enabled: userData.status === 1,
          memberships: userData.memberships,
        })
      }
      MOCK_USER_DATA.push(newUser)
      if (mockMode) persistMockUsers()
      message.success('添加成功')
    }

    const handleUpdateUserData = async (
      userData: UserFormData
    ): Promise<void> => {
      const validation = validateUserData(userData, 'edit')
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const userIndex = MOCK_USER_DATA.findIndex(
        user => user.id === userData.id
      )
      if (userIndex === -1) {
        throw new Error('用户不存在')
      }

      const existingUser = MOCK_USER_DATA[userIndex]
      const updatedUser = buildUserData(userData, existingUser)

      await updateUserApi(userData.id!, userData)
      if (mockMode) {
        upsertMockDirectoryUser({
          username: userData.username,
          enabled: userData.status === 1,
          memberships: userData.memberships,
        })
      }
      MOCK_USER_DATA[userIndex] = updatedUser
      if (mockMode) persistMockUsers()

      if (currentUser.value?.id === userData.id) {
        currentUser.value = { ...updatedUser }
      }

      message.success('修改成功')
    }

    return { handleAddUserData, handleUpdateUserData }
  }

  // ==================== 使用组合式函数 ====================
  const { handleBatchOperation, batchDeleteUsers, batchToggleUsers } =
    useBatchOperations()
  const { handleAddUserData, handleUpdateUserData } = useUserOperations()

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

  // ==================== 监听选中状态 ====================
  watch(
    () =>
      (tableRef.value?.getManager?.().selection.getSelected?.() || []).map(
        (row: UserData) => row.id
      ),
    newKeys => {
      selectedUsers.value = newKeys
    }
  )

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
      formData.deptId = 'dept_external'
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
    Object.assign(formData, DEFAULT_USER_FORM_DATA)
    formData.memberships = [
      {
        contextId: userStore.activeContext?.id ?? companyOptions[0].value,
        isPrimary: true,
        roleId: 'auditor',
      },
    ]
    if (deptId) {
      formData.deptId = deptId
      if (deptId === 'dept_external') {
        formData.userType = 'external'
      }
    } else if (selectedDept.value) {
      formData.deptId = selectedDept.value.id
      if (selectedDept.value.id === 'dept_external') {
        formData.userType = 'external'
      }
    }
    showModal.value = true
  }

  const handleEditUser = (user: UserData) => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType,
      deptId: user.deptId,
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
      await updateUserStatusApi(user.id, newStatus)
      updateUserInList(user.id, {
        status: newStatus,
        updateTime: new Date().toLocaleString(),
      })
      message.success(`${statusText}成功`)
    } catch (error) {
      console.error('状态切换失败:', error)
      message.error(`${statusText}失败`)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUserApi(id)
      const userIndex = MOCK_USER_DATA.findIndex(user => user.id === id)
      if (userIndex !== -1) {
        if (mockMode)
          removeMockDirectoryUser(MOCK_USER_DATA[userIndex].username)
        MOCK_USER_DATA.splice(userIndex, 1)
        if (mockMode) persistMockUsers()
      }
      message.success('删除成功')
      await loadUsers()
    } catch {
      message.error('删除失败')
    }
  }

  const handleShowResetPassword = (user: UserData) => {
    if (user.status === 0) {
      message.warning('禁用用户无法重置密码')
      return
    }
    currentResetUserId.value = user.id
    Object.assign(resetPasswordForm, DEFAULT_RESET_PASSWORD_FORM)
    showResetPasswordModal.value = true
  }

  /** 重置当前用户密码，失败交由组件统一反馈。 */
  async function handleResetPassword(): Promise<void> {
    try {
      if (!currentResetUserId.value) throw new Error('未选择需要重置的用户')
      await resetUserPasswordApi(
        currentResetUserId.value,
        resetPasswordForm.newPassword
      )
      message.success('密码重置成功')
    } catch (error) {
      throw error instanceof Error ? error : new Error('密码重置失败')
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
      userRoleOptions.value = response.data.map(role => ({
        label: role.name,
        value: role.id,
      }))
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
    dialog,
    mockMode,
    companyOptions,
    companyRoleOptions,
    getCompanyName,
    getCompanyRoleName,
    getUserMemberships,
    getCompanyOptions,
    setPrimaryMembership,
    removeCompanyMembership,
    addCompanyMembership,
    loading,
    showModal,
    showUserDetail,
    showResetPasswordModal,
    modalMode,
    formRef,
    resetPasswordFormRef,
    tableRef,
    deptTreeRef,
    expandedDeptKeys,
    selectedDeptKeys,
    selectedUsers,
    currentUser,
    userList,
    deptList,
    userRoleOptions,
    formData,
    resetPasswordForm,
    searchForm,
    pagination,
    modalTitle,
    toolbarActions,
    batchActions,
    selectedDept,
    deptIconConfig,
    getRowClassName,
    rowKey,
    tableActions,
    getUserDetailFields,
    getTimeFields,
    formOptions,
    formRenderers,
    formConfig,
    resetPasswordOptions,
    resetPasswordConfig,
    updateUserForm,
    handleDeptSelect,
    handleSearch,
    handlePaginationChange,
    handleCancelModal,
    userColumns,
  }
}
