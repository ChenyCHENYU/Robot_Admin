import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export type RoleType = 'system' | 'custom' | 'temp'
export type PermissionType = 'menu' | 'button' | 'api'

export interface RoleData {
  id: string
  name: string
  code: string
  type: RoleType
  status: number // 1-正常 0-禁用
  description?: string
  permissionIds?: string[]
  permissionNames?: string[]
  userCount?: number
  sort: number
  createTime: string
  updateTime?: string
  remark?: string
}

export interface RoleFormData {
  id?: string
  name: string
  code: string
  type: RoleType
  status: number
  description: string
  permissionIds: string[]
  sort: number
  remark: string
}

export interface PermissionData {
  id: string
  name: string
  code: string
  type: PermissionType
  parentId?: string | null
  path?: string
  icon?: string
  description?: string
  sort: number
  status: number
  children?: PermissionData[]
}

export interface SearchForm {
  keyword: string
  status: number | null
  type: RoleType | null
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

export interface RoleUserData {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  deptName?: string
  status: number
  createTime: string
}

export interface PermissionTemplate {
  id: string
  name: string
  description: string
  icon: string
  permissions: string[]
}

// ==================== 常量配置 ====================
export const ICONS = {
  search: 'mdi:magnify',
  plus: 'mdi:plus',
  refresh: 'mdi:refresh',
  toggle: 'mdi:toggle-switch',
  delete: 'mdi:delete',
  edit: 'mdi:pencil',
  eye: 'mdi:eye',
  pause: 'mdi:pause',
  play: 'mdi:play',
  permission: 'mdi:shield-account',
  users: 'mdi:account-group',
} as const

export const STATUS_CONFIG = {
  1: { text: '正常', type: 'success' as const, icon: 'mdi:check-circle' },
  0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
} as const

export const ROLE_TYPE_CONFIG = {
  system: { text: '系统', type: 'error' as const, icon: 'mdi:cog' },
  custom: { text: '自定义', type: 'info' as const, icon: 'mdi:account-key' },
  temp: { text: '临时', type: 'warning' as const, icon: 'mdi:clock' },
} as const

export const UI_CONFIG = {
  roleType: [
    { label: '系统角色', value: 'system' },
    { label: '自定义角色', value: 'custom' },
    { label: '临时角色', value: 'temp' },
  ],
  roleStatus: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 },
  ],
  permissionType: [
    { label: '菜单权限', value: 'menu' },
    { label: '按钮权限', value: 'button' },
    { label: 'API权限', value: 'api' },
  ],
} as const

// ==================== 表单验证规则 ====================
export const ROLE_FORM_RULES: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 50,
      message: '角色名称长度在 2 到 50 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 50,
      message: '角色编码长度在 2 到 50 个字符',
      trigger: ['input', 'blur'],
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '角色编码必须以字母开头，只能包含字母、数字和下划线',
      trigger: ['input', 'blur'],
    },
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: ['change', 'blur'] },
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: ['input', 'blur'] },
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: '排序值必须在 0 到 9999 之间',
      trigger: ['input', 'blur'],
    },
  ],
}

// ==================== 默认数据 ====================
export const DEFAULT_ROLE_FORM_DATA: RoleFormData = {
  name: '',
  code: '',
  type: 'custom',
  status: 1,
  description: '',
  permissionIds: [],
  sort: 0,
  remark: '',
}

// ==================== 模拟数据 ====================
export const MOCK_PERMISSION_DATA: PermissionData[] = [
  {
    id: 'perm_1',
    name: '系统管理',
    code: 'system',
    type: 'menu',
    parentId: null,
    path: '/system',
    icon: 'mdi:cog',
    sort: 1,
    status: 1,
    children: [
      {
        id: 'perm_1_1',
        name: '用户管理',
        code: 'system:user',
        type: 'menu',
        parentId: 'perm_1',
        path: '/system/user',
        icon: 'mdi:account',
        sort: 1,
        status: 1,
        children: [
          {
            id: 'perm_1_1_1',
            name: '新增用户',
            code: 'system:user:add',
            type: 'button',
            parentId: 'perm_1_1',
            icon: 'mdi:plus',
            sort: 1,
            status: 1,
          },
          {
            id: 'perm_1_1_2',
            name: '编辑用户',
            code: 'system:user:edit',
            type: 'button',
            parentId: 'perm_1_1',
            icon: 'mdi:pencil',
            sort: 2,
            status: 1,
          },
          {
            id: 'perm_1_1_3',
            name: '删除用户',
            code: 'system:user:delete',
            type: 'button',
            parentId: 'perm_1_1',
            icon: 'mdi:delete',
            sort: 3,
            status: 1,
          },
        ],
      },
      {
        id: 'perm_1_2',
        name: '角色管理',
        code: 'system:role',
        type: 'menu',
        parentId: 'perm_1',
        path: '/system/role',
        icon: 'mdi:account-key',
        sort: 2,
        status: 1,
        children: [
          {
            id: 'perm_1_2_1',
            name: '新增角色',
            code: 'system:role:add',
            type: 'button',
            parentId: 'perm_1_2',
            icon: 'mdi:plus',
            sort: 1,
            status: 1,
          },
          {
            id: 'perm_1_2_2',
            name: '编辑角色',
            code: 'system:role:edit',
            type: 'button',
            parentId: 'perm_1_2',
            icon: 'mdi:pencil',
            sort: 2,
            status: 1,
          },
          {
            id: 'perm_1_2_3',
            name: '删除角色',
            code: 'system:role:delete',
            type: 'button',
            parentId: 'perm_1_2',
            icon: 'mdi:delete',
            sort: 3,
            status: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'perm_2',
    name: '内容管理',
    code: 'content',
    type: 'menu',
    parentId: null,
    path: '/content',
    icon: 'mdi:file-document',
    sort: 2,
    status: 1,
    children: [
      {
        id: 'perm_2_1',
        name: '文章管理',
        code: 'content:article',
        type: 'menu',
        parentId: 'perm_2',
        path: '/content/article',
        icon: 'mdi:file-document-edit',
        sort: 1,
        status: 1,
        children: [
          {
            id: 'perm_2_1_1',
            name: '发布文章',
            code: 'content:article:publish',
            type: 'button',
            parentId: 'perm_2_1',
            icon: 'mdi:publish',
            sort: 1,
            status: 1,
          },
          {
            id: 'perm_2_1_2',
            name: '编辑文章',
            code: 'content:article:edit',
            type: 'button',
            parentId: 'perm_2_1',
            icon: 'mdi:pencil',
            sort: 2,
            status: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'perm_3',
    name: '数据统计',
    code: 'analytics',
    type: 'menu',
    parentId: null,
    path: '/analytics',
    icon: 'mdi:chart-line',
    sort: 3,
    status: 1,
    children: [
      {
        id: 'perm_3_1',
        name: '查看报表',
        code: 'analytics:report:view',
        type: 'button',
        parentId: 'perm_3',
        icon: 'mdi:eye',
        sort: 1,
        status: 1,
      },
      {
        id: 'perm_3_2',
        name: '导出数据',
        code: 'analytics:data:export',
        type: 'button',
        parentId: 'perm_3',
        icon: 'mdi:download',
        sort: 2,
        status: 1,
      },
    ],
  },
]

export const MOCK_ROLE_DATA: RoleData[] = [
  {
    id: 'role_1',
    name: '超级管理员',
    code: 'super_admin',
    type: 'system',
    status: 1,
    description: '系统超级管理员，拥有所有权限',
    permissionIds: [
      'perm_1',
      'perm_1_1',
      'perm_1_1_1',
      'perm_1_1_2',
      'perm_1_1_3',
      'perm_1_2',
      'perm_1_2_1',
      'perm_1_2_2',
      'perm_1_2_3',
      'perm_2',
      'perm_2_1',
      'perm_2_1_1',
      'perm_2_1_2',
      'perm_3',
      'perm_3_1',
      'perm_3_2',
    ],
    permissionNames: [
      '系统管理',
      '用户管理',
      '新增用户',
      '编辑用户',
      '删除用户',
      '角色管理',
      '新增角色',
      '编辑角色',
      '删除角色',
      '内容管理',
      '文章管理',
      '发布文章',
      '编辑文章',
      '数据统计',
      '查看报表',
      '导出数据',
    ],
    userCount: 1,
    sort: 1,
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 14:30:00',
    remark: '系统内置角色，不可删除',
  },
  {
    id: 'role_2',
    name: '系统管理员',
    code: 'admin',
    type: 'system',
    status: 1,
    description: '系统管理员，拥有系统管理权限',
    permissionIds: [
      'perm_1',
      'perm_1_1',
      'perm_1_1_1',
      'perm_1_1_2',
      'perm_1_2',
      'perm_1_2_1',
      'perm_1_2_2',
    ],
    permissionNames: [
      '系统管理',
      '用户管理',
      '新增用户',
      '编辑用户',
      '角色管理',
      '新增角色',
      '编辑角色',
    ],
    userCount: 3,
    sort: 2,
    createTime: '2024-01-02 09:00:00',
    updateTime: '2024-01-10 16:20:00',
    remark: '系统管理员角色',
  },
  {
    id: 'role_3',
    name: '内容编辑员',
    code: 'editor',
    type: 'custom',
    status: 1,
    description: '内容编辑员，负责内容管理',
    permissionIds: ['perm_2', 'perm_2_1', 'perm_2_1_1', 'perm_2_1_2'],
    permissionNames: ['内容管理', '文章管理', '发布文章', '编辑文章'],
    userCount: 8,
    sort: 3,
    createTime: '2024-01-03 09:00:00',
    updateTime: '2024-01-12 11:10:00',
  },
  {
    id: 'role_4',
    name: '数据分析师',
    code: 'analyst',
    type: 'custom',
    status: 1,
    description: '数据分析师，查看统计数据',
    permissionIds: ['perm_3', 'perm_3_1', 'perm_3_2'],
    permissionNames: ['数据统计', '查看报表', '导出数据'],
    userCount: 5,
    sort: 4,
    createTime: '2024-01-04 09:00:00',
    updateTime: '2024-01-08 13:45:00',
  },
  {
    id: 'role_5',
    name: '测试角色',
    code: 'test_role',
    type: 'temp',
    status: 0,
    description: '临时测试角色',
    permissionIds: [],
    permissionNames: [],
    userCount: 0,
    sort: 5,
    createTime: '2024-01-06 09:00:00',
    remark: '测试用角色，已禁用',
  },
]

// 模拟用户数据
export const MOCK_USER_DATA: RoleUserData[] = [
  {
    id: 'user_1',
    username: 'admin',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    deptName: '技术部',
    status: 1,
    createTime: '2024-01-01 09:00:00',
  },
  {
    id: 'user_2',
    username: 'manager1',
    nickname: '系统管理员1',
    email: 'manager1@example.com',
    phone: '13800138001',
    deptName: '管理部',
    status: 1,
    createTime: '2024-01-02 09:00:00',
  },
  {
    id: 'user_3',
    username: 'manager2',
    nickname: '系统管理员2',
    email: 'manager2@example.com',
    phone: '13800138002',
    deptName: '管理部',
    status: 1,
    createTime: '2024-01-02 10:00:00',
  },
  {
    id: 'user_4',
    username: 'manager3',
    nickname: '系统管理员3',
    email: 'manager3@example.com',
    deptName: '管理部',
    status: 1,
    createTime: '2024-01-02 11:00:00',
  },
  {
    id: 'user_5',
    username: 'editor1',
    nickname: '编辑员1',
    email: 'editor1@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 09:00:00',
  },
  {
    id: 'user_6',
    username: 'editor2',
    nickname: '编辑员2',
    email: 'editor2@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 10:00:00',
  },
  {
    id: 'user_7',
    username: 'editor3',
    nickname: '编辑员3',
    email: 'editor3@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 11:00:00',
  },
  {
    id: 'user_8',
    username: 'editor4',
    nickname: '编辑员4',
    email: 'editor4@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 12:00:00',
  },
  {
    id: 'user_9',
    username: 'editor5',
    nickname: '编辑员5',
    email: 'editor5@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 13:00:00',
  },
  {
    id: 'user_10',
    username: 'editor6',
    nickname: '编辑员6',
    email: 'editor6@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 14:00:00',
  },
  {
    id: 'user_11',
    username: 'editor7',
    nickname: '编辑员7',
    email: 'editor7@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 15:00:00',
  },
  {
    id: 'user_12',
    username: 'editor8',
    nickname: '编辑员8',
    email: 'editor8@example.com',
    deptName: '内容部',
    status: 1,
    createTime: '2024-01-03 16:00:00',
  },
  {
    id: 'user_13',
    username: 'analyst1',
    nickname: '分析师1',
    email: 'analyst1@example.com',
    deptName: '数据部',
    status: 1,
    createTime: '2024-01-04 09:00:00',
  },
  {
    id: 'user_14',
    username: 'analyst2',
    nickname: '分析师2',
    email: 'analyst2@example.com',
    deptName: '数据部',
    status: 1,
    createTime: '2024-01-04 10:00:00',
  },
  {
    id: 'user_15',
    username: 'analyst3',
    nickname: '分析师3',
    email: 'analyst3@example.com',
    deptName: '数据部',
    status: 1,
    createTime: '2024-01-04 11:00:00',
  },
  {
    id: 'user_16',
    username: 'analyst4',
    nickname: '分析师4',
    email: 'analyst4@example.com',
    deptName: '数据部',
    status: 1,
    createTime: '2024-01-04 12:00:00',
  },
  {
    id: 'user_17',
    username: 'analyst5',
    nickname: '分析师5',
    email: 'analyst5@example.com',
    deptName: '数据部',
    status: 1,
    createTime: '2024-01-04 13:00:00',
  },
]

// 权限模板数据
export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'admin_template',
    name: '管理员模板',
    description: '包含用户管理、角色管理等核心管理权限，适合系统管理员使用',
    icon: 'mdi:account-key',
    permissions: [
      'perm_1',
      'perm_1_1',
      'perm_1_1_1',
      'perm_1_1_2',
      'perm_1_2',
      'perm_1_2_1',
      'perm_1_2_2',
    ],
  },
  {
    id: 'editor_template',
    name: '编辑员模板',
    description: '包含内容管理相关权限，适合内容编辑人员使用',
    icon: 'mdi:file-document-edit',
    permissions: ['perm_2', 'perm_2_1', 'perm_2_1_1', 'perm_2_1_2'],
  },
  {
    id: 'analyst_template',
    name: '分析师模板',
    description: '包含数据查看和分析权限，适合数据分析人员使用',
    icon: 'mdi:chart-line',
    permissions: ['perm_3', 'perm_3_1', 'perm_3_2'],
  },
  {
    id: 'viewer_template',
    name: '查看员模板',
    description: '只包含基础查看权限，适合临时访问用户使用',
    icon: 'mdi:eye',
    permissions: ['perm_3_1'],
  },
]

// ==================== 工具函数 ====================
export const findPermissionById = (
  permissions: PermissionData[],
  id: string
): PermissionData | null => {
  for (const permission of permissions) {
    if (permission.id === id) return permission
    if (permission.children) {
      const found = findPermissionById(permission.children, id)
      if (found) return found
    }
  }
  return null
}

export const updateRoleInList = (
  roleId: string,
  updates: Partial<RoleData>
) => {
  const targets = [MOCK_ROLE_DATA]
  targets.forEach(data => {
    const index = data.findIndex(item => item.id === roleId)
    if (index !== -1) {
      data[index] = { ...data[index], ...updates }
    }
  })
}

const createMockApi = <T>(data: T, delay = 500): Promise<ApiResponse<T>> =>
  new Promise<ApiResponse<T>>(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data, msg: '成功' })
    }, delay)
  })

const filterRoles = (roles: RoleData[], params: any): RoleData[] => {
  let filtered = [...roles]

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      role =>
        role.name.toLowerCase().includes(keyword) ||
        role.code.toLowerCase().includes(keyword) ||
        (role.description && role.description.toLowerCase().includes(keyword))
    )
  }

  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(role => role.status === params.status)
  }

  if (params.type) {
    filtered = filtered.filter(role => role.type === params.type)
  }

  return filtered
}

const paginateData = <T>(
  data: T[],
  page: number,
  pageSize: number
): PageResult<T> => {
  const total = data.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  return { list, total, page, pageSize }
}

// 角色用户映射关系
const getRoleUserMapping = (): Record<string, string[]> => ({
  role_1: ['user_1'], // 超级管理员
  role_2: ['user_2', 'user_3', 'user_4'], // 系统管理员
  role_3: [
    'user_5',
    'user_6',
    'user_7',
    'user_8',
    'user_9',
    'user_10',
    'user_11',
    'user_12',
  ], // 内容编辑员
  role_4: ['user_13', 'user_14', 'user_15', 'user_16', 'user_17'], // 数据分析师
  role_5: [], // 测试角色
})

const getUsersByRoleId = (roleId: string): RoleUserData[] => {
  const roleUserMapping = getRoleUserMapping()
  const userIds = roleUserMapping[roleId] || []
  return MOCK_USER_DATA.filter(user => userIds.includes(user.id))
}

// ==================== API 方法 ====================
export const getRoleListApi = async (
  params: any
): Promise<ApiResponse<PageResult<RoleData>>> => {
  const filteredRoles = filterRoles(MOCK_ROLE_DATA, params)
  const paginatedData = paginateData(
    filteredRoles,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData)
}

export const getPermissionListApi = async (): Promise<
  ApiResponse<PermissionData[]>
> => createMockApi(MOCK_PERMISSION_DATA, 300)

export const getRoleDetailApi = async (
  id: string
): Promise<ApiResponse<RoleData>> => {
  const role = MOCK_ROLE_DATA.find(r => r.id === id)
  if (!role) {
    return Promise.reject(new Error('角色不存在'))
  }
  return createMockApi(role, 300)
}

export const getRoleUsersApi = async (
  roleId: string
): Promise<ApiResponse<RoleUserData[]>> => {
  const users = getUsersByRoleId(roleId)
  return createMockApi(users, 300)
}
