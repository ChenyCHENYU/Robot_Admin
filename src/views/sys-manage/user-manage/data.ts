import type { FormRules } from 'naive-ui/es'
import type { DataRecord } from '@/types/modules/table'

// ==================== 类型定义 ====================
export type UserType = 'internal' | 'external' | 'partner' | 'guest'

export interface UserData extends DataRecord {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  userType: UserType
  deptId?: string
  deptName?: string
  roleIds?: string[]
  roleNames?: string[]
  status: number
  avatar?: string
  remark?: string
  createTime: string
  updateTime?: string
  lastLoginTime?: string
  companyName?: string
  contactPerson?: string
}

export interface UserFormData {
  id?: string
  username: string
  nickname: string
  email: string
  phone: string
  userType: UserType
  deptId: string | null
  roleIds: string[]
  password: string
  status: number
  remark: string
  companyName: string
  contactPerson: string
}

export interface DeptData {
  id: string
  name: string
  parentId?: string | null
  sort: number
  status: number
  type: string
  children?: DeptData[]
}

export interface DeptTreeOption {
  id: string
  name: string
  children?: DeptTreeOption[]
}

export interface RoleData {
  id: string
  name: string
  code: string
  status: number
}

export interface SearchForm {
  keyword: string
  status: number | null
  roleId: string | null
  deptId: string | null
  userType: UserType | null
}

export interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

export interface ApiResponse<T = unknown> {
  code: string
  data: T
  msg: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== UI 配置常量 ====================
export const UI_CONFIG = {
  userType: [
    { label: '内部员工', value: 'internal' },
    { label: '外部客户', value: 'external' },
    { label: '合作伙伴', value: 'partner' },
    { label: '访客', value: 'guest' },
  ],
  userStatus: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 },
  ],
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
} as const

// ==================== 组件配置 ====================
export const COMPONENT_CONFIG = {
  icons: {
    search: 'mdi:magnify',
    plus: 'mdi:plus',
    refresh: 'mdi:refresh',
    tree: 'mdi:file-tree',
    toggle: 'mdi:toggle-switch',
    delete: 'mdi:delete',
    edit: 'mdi:pencil',
    eye: 'mdi:eye',
    pause: 'mdi:pause',
    play: 'mdi:play',
    key: 'mdi:key',
    cancel: 'mdi:cancel',
    role: 'mdi:account-key',
    check: 'mdi:check-circle',
    info: 'mdi:information',
  },
  statusConfig: {
    1: { text: '正常', type: 'success' as const, icon: 'mdi:check-circle' },
    0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
  },
  userTypeConfig: {
    internal: { text: '内部', type: 'info' as const, icon: 'mdi:account' },
    external: {
      text: '外部',
      type: 'warning' as const,
      icon: 'mdi:account-group',
    },
    partner: {
      text: '伙伴',
      type: 'success' as const,
      icon: 'mdi:handshake',
    },
    guest: {
      text: '访客',
      type: 'default' as const,
      icon: 'mdi:account-outline',
    },
  },
  defaultAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
  batchConfig: {
    delete: {
      title: '批量删除',
      content: '确认删除选中的用户吗？此操作不可恢复！',
      type: 'error' as const,
    },
    toggle: {
      title: '批量状态操作',
      content: '确认对选中的用户进行状态切换吗？',
      type: 'warning' as const,
    },
  },
} as const

// ==================== 表单验证规则 ====================
const createValidationRule = (
  required: boolean,
  message: string,
  trigger = ['input', 'blur'],
  extraRules: any[] = []
) => [
  ...(required
    ? [{ required: true, message, trigger }]
    : [{ required: false }]),
  ...extraRules,
]

export const USER_FORM_RULES: FormRules = {
  username: createValidationRule(
    true,
    '请输入用户名',
    ['input', 'blur'],
    [
      {
        min: 3,
        max: 20,
        message: '用户名长度在 3 到 20 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  nickname: createValidationRule(true, '请输入昵称'),
  userType: createValidationRule(true, '请选择用户类型', ['change', 'blur']),
  email: createValidationRule(
    false,
    '',
    ['input', 'blur'],
    [
      {
        type: 'email',
        message: '请输入正确的邮箱格式',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  phone: createValidationRule(
    false,
    '',
    ['input', 'blur'],
    [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  password: createValidationRule(
    true,
    '请输入密码',
    ['input', 'blur'],
    [
      {
        min: 6,
        max: 20,
        message: '密码长度在 6 到 20 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
}

export const RESET_PASSWORD_RULES: FormRules = {
  newPassword: createValidationRule(
    true,
    '请输入新密码',
    ['input', 'blur'],
    [
      {
        min: 6,
        max: 20,
        message: '密码长度在 6 到 20 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  confirmPassword: createValidationRule(
    true,
    '请再次输入新密码',
    ['input', 'blur'],
    [
      {
        validator: (rule: any, value: string) => {
          const form = rule.form as ResetPasswordForm
          return value !== form.newPassword
            ? Promise.reject('两次密码输入不一致')
            : Promise.resolve()
        },
        trigger: ['input', 'blur'],
      },
    ]
  ),
}

// ==================== 默认数据 ====================
export const DEFAULT_USER_FORM_DATA: UserFormData = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  userType: 'internal',
  deptId: null,
  roleIds: [],
  password: '123456',
  status: 1,
  remark: '',
  companyName: '',
  contactPerson: '',
}

export const DEFAULT_RESET_PASSWORD_FORM: ResetPasswordForm = {
  newPassword: '',
  confirmPassword: '',
}

// ==================== 模拟数据 ====================
export const MOCK_DEPT_DATA: DeptData[] = [
  {
    id: 'dept_1',
    name: '总公司',
    parentId: null,
    sort: 1,
    status: 1,
    type: 'dept',
    children: [
      {
        id: 'dept_2',
        name: '技术部',
        parentId: 'dept_1',
        sort: 1,
        status: 1,
        type: 'dept',
        children: [
          {
            id: 'dept_3',
            name: '前端组',
            parentId: 'dept_2',
            sort: 1,
            status: 1,
            type: 'dept',
          },
          {
            id: 'dept_4',
            name: '后端组',
            parentId: 'dept_2',
            sort: 2,
            status: 1,
            type: 'dept',
          },
        ],
      },
      {
        id: 'dept_5',
        name: '市场部',
        parentId: 'dept_1',
        sort: 2,
        status: 1,
        type: 'dept',
      },
      {
        id: 'dept_6',
        name: '人事部',
        parentId: 'dept_1',
        sort: 3,
        status: 1,
        type: 'dept',
      },
    ],
  },
  {
    id: 'dept_external',
    name: '外部客户',
    parentId: null,
    sort: 2,
    status: 1,
    type: 'external',
  },
]

export const MOCK_ROLE_DATA: RoleData[] = [
  { id: 'role_1', name: '超级管理员', code: 'admin', status: 1 },
  { id: 'role_2', name: '部门经理', code: 'manager', status: 1 },
  { id: 'role_3', name: '普通员工', code: 'user', status: 1 },
  { id: 'role_4', name: '客户', code: 'customer', status: 1 },
  { id: 'role_5', name: '访客', code: 'guest', status: 1 },
]

export const MOCK_USER_DATA: UserData[] = [
  {
    id: 'user_1',
    username: 'admin',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    userType: 'internal',
    deptId: 'dept_1',
    deptName: '总公司',
    roleIds: ['role_1'],
    roleNames: ['超级管理员'],
    status: 1,
    avatar: '',
    remark: '系统超级管理员',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 14:30:00',
    lastLoginTime: '2024-01-15 09:15:00',
  },
  {
    id: 'user_2',
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138002',
    userType: 'internal',
    deptId: 'dept_3',
    deptName: '前端组',
    roleIds: ['role_3'],
    roleNames: ['普通员工'],
    status: 1,
    remark: '前端开发工程师',
    createTime: '2024-01-02 09:00:00',
    updateTime: '2024-01-10 16:20:00',
    lastLoginTime: '2024-01-15 08:45:00',
  },
  {
    id: 'user_3',
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@example.com',
    phone: '13800138003',
    userType: 'internal',
    deptId: 'dept_4',
    deptName: '后端组',
    roleIds: ['role_2', 'role_3'],
    roleNames: ['部门经理', '普通员工'],
    status: 0,
    remark: '后端开发工程师',
    createTime: '2024-01-03 09:00:00',
    updateTime: '2024-01-12 11:10:00',
    lastLoginTime: '2024-01-14 17:30:00',
  },
  {
    id: 'user_4',
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@example.com',
    phone: '13800138004',
    userType: 'internal',
    deptId: 'dept_5',
    deptName: '市场部',
    roleIds: ['role_3'],
    roleNames: ['普通员工'],
    status: 1,
    remark: '市场专员',
    createTime: '2024-01-04 09:00:00',
    updateTime: '2024-01-08 13:45:00',
    lastLoginTime: '2024-01-13 10:20:00',
  },
  {
    id: 'user_5',
    username: 'customer001',
    nickname: 'ABC公司',
    email: 'contact@abc.com',
    phone: '13800138005',
    userType: 'external',
    deptId: 'dept_external',
    deptName: '外部客户',
    roleIds: ['role_4'],
    roleNames: ['客户'],
    status: 1,
    remark: 'ABC科技有限公司',
    companyName: 'ABC科技有限公司',
    contactPerson: '刘总',
    createTime: '2024-01-05 09:00:00',
    updateTime: '2024-01-12 15:20:00',
    lastLoginTime: '2024-01-14 10:30:00',
  },
]

// ==================== 工具函数 ====================
const createMockApi = <T>(data: T, delay = 500) =>
  new Promise<ApiResponse<T>>(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data, msg: '成功' })
    }, delay)
  })

const filterUsers = (users: UserData[], params: any): UserData[] => {
  let filtered = [...users]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      user =>
        user.username.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword) ||
        (user.email && user.email.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(user => user.status === params.status)
  }

  // 用户类型筛选
  if (params.userType) {
    filtered = filtered.filter(user => user.userType === params.userType)
  }

  // 部门筛选
  if (params.deptId) {
    filtered = filtered.filter(user => user.deptId === params.deptId)
  }

  // 角色筛选
  if (params.roleId) {
    filtered = filtered.filter(
      user => user.roleIds && user.roleIds.includes(params.roleId)
    )
  }

  return filtered
}

const paginateData = <T>(data: T[], page: number, pageSize: number) => {
  const total = data.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  return { list, total, page, pageSize }
}

// ==================== API 方法 ====================
export const getUserListApi = async (
  params: any
): Promise<ApiResponse<PageResult<UserData>>> => {
  const filteredUsers = filterUsers(MOCK_USER_DATA, params)
  const paginatedData = paginateData(
    filteredUsers,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData)
}

export const getDeptListApi = async (): Promise<ApiResponse<DeptData[]>> =>
  createMockApi(MOCK_DEPT_DATA, 300)

export const getUserRolesApi = async (): Promise<ApiResponse<RoleData[]>> =>
  createMockApi(MOCK_ROLE_DATA, 300)

// ==================== 工具函数 ====================
/**
 * 根据角色ID获取角色名称
 */
export const getRoleNameById = (roleId: string): string =>
  MOCK_ROLE_DATA.find(r => r.id === roleId)?.name || ''

/**
 * 根据部门ID获取部门名称
 */
export const getDeptNameById = (deptId: string): string => {
  const findDeptName = (depts: DeptData[], id: string): string | null => {
    for (const dept of depts) {
      if (dept.id === id) return dept.name
      if (dept.children) {
        const found = findDeptName(dept.children, id)
        if (found) return found
      }
    }
    return null
  }
  return findDeptName(MOCK_DEPT_DATA, deptId) || '未知部门'
}

/**
 * 根据部门ID查找部门对象
 */
export const findDeptById = (
  depts: DeptData[],
  id: string
): DeptData | null => {
  for (const dept of depts) {
    if (dept.id === id) return dept
    if (dept.children) {
      const found = findDeptById(dept.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * 将部门列表转换为树形选项
 */
export const convertDeptListToTreeOptions = (
  depts: DeptData[]
): DeptTreeOption[] =>
  depts.map(dept => ({
    id: dept.id,
    name: dept.name,
    children: dept.children
      ? convertDeptListToTreeOptions(dept.children)
      : undefined,
  }))

/**
 * 获取用户状态配置
 */
export const getUserStatusConfig = (status: number) =>
  COMPONENT_CONFIG.statusConfig[
    status as keyof typeof COMPONENT_CONFIG.statusConfig
  ] || COMPONENT_CONFIG.statusConfig[1]

/**
 * 获取用户类型配置
 */
export const getUserTypeConfig = (userType: UserType) =>
  COMPONENT_CONFIG.userTypeConfig[userType] ||
  COMPONENT_CONFIG.userTypeConfig.internal
