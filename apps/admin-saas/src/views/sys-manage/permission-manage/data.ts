import { h } from 'vue'
import { NTag, type FormRules } from 'naive-ui/es'
import type { TableColumn } from '@robot-admin/naive-ui-components'

// ==================== 类型定义 ====================
export type PermissionType = 'module' | 'function' | 'button' | 'api'

export interface PermissionData {
  [key: string]: any
  id: number
  name: string
  code: string
  type: PermissionType
  module: string
  description: string
  resources: string[]
  status: number // 0=禁用, 1=启用
  sort: number
  createTime: number
  updateTime: number
  remark: string
}

export interface PermissionFormData {
  id?: number
  name: string
  code: string
  type: PermissionType
  module: string
  description: string
  resources: string // 表单中用逗号分隔的字符串
  status: number
  sort: number
  remark: string
}

export interface SearchForm {
  keyword: string
  type: PermissionType | null
  module: string | null
  status: number | null
}

// ==================== 常量配置 ====================
export const PERMISSION_TYPE_CONFIG = {
  module: {
    text: '模块权限',
    type: 'info',
    icon: 'material-symbols:dashboard',
    color: '#1890ff',
    description: '系统功能模块访问权限',
  },
  function: {
    text: '功能权限',
    type: 'success',
    icon: 'material-symbols:settings',
    color: '#52c41a',
    description: '具体功能操作权限',
  },
  button: {
    text: '按钮权限',
    type: 'warning',
    icon: 'material-symbols:touch-app',
    color: '#fa8c16',
    description: '页面按钮操作权限',
  },
  api: {
    text: 'API权限',
    type: 'error',
    icon: 'material-symbols:api',
    color: '#f5222d',
    description: '接口访问权限',
  },
}

export const STATUS_CONFIG = {
  1: { text: '启用', type: 'success' },
  0: { text: '禁用', type: 'error' },
}

export const UI_CONFIG = {
  permissionType: [
    { label: '模块权限', value: 'module' },
    { label: '功能权限', value: 'function' },
    { label: '按钮权限', value: 'button' },
    { label: 'API权限', value: 'api' },
  ],
  permissionStatus: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ],
}

export const SYSTEM_MODULES = [
  { label: '系统管理', value: 'system' },
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '权限管理', value: 'permission' },
  { label: '菜单管理', value: 'menu' },
  { label: '字典管理', value: 'dict' },
  { label: '配置管理', value: 'config' },
  { label: '日志管理', value: 'log' },
  { label: '监控管理', value: 'monitor' },
  { label: '文件管理', value: 'file' },
]

// ==================== 表格列配置 ====================
export const getTableColumns = (): TableColumn<PermissionData>[] => [
  {
    key: 'name',
    title: '权限名称',
    width: 120,
    fixed: 'left', // 🆕 固定权限名称列到左侧
    editable: true,
    required: true,
    editType: 'input',
    editProps: {
      placeholder: '请输入权限名称',
      rules: [
        { required: true, message: '请输入权限名称' },
        { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符' },
      ],
    },
  },
  {
    key: 'code',
    title: '权限编码',
    width: 220,
    editable: false,
    render: (row: PermissionData) =>
      h(
        'code',
        {
          class: 'permission-code',
        },
        row.code
      ),
  },
  {
    key: 'type',
    title: '权限类型',
    width: 120,
    editable: true,
    required: true,
    editType: 'select',
    editProps: { options: UI_CONFIG.permissionType },
    render: (row: PermissionData) => {
      const config = PERMISSION_TYPE_CONFIG[row.type as PermissionType]
      if (!config) {
        return h('span', { class: 'permission-type-unknown' }, row.type)
      }
      return h(
        NTag,
        {
          type: config.type as
            | 'default'
            | 'primary'
            | 'info'
            | 'success'
            | 'warning'
            | 'error',
          size: 'small',
          class: 'permission-type-tag',
        },
        {
          default: () => config.text,
          icon: () => h('i', { class: `iconify ${config.icon} type-icon` }),
        }
      )
    },
  },
  {
    key: 'module',
    title: '所属模块',
    width: 120,
    editable: true,
    required: true,
    editType: 'select',
    editProps: { options: SYSTEM_MODULES },
    render: (row: PermissionData) => {
      const moduleName =
        SYSTEM_MODULES.find(m => m.value === row.module)?.label || row.module
      return h('span', { class: 'module-tag' }, moduleName)
    },
  },
  {
    key: 'description',
    title: '描述',
    width: 200,
    editable: true,
    editType: 'textarea',
    editProps: { rows: 2, placeholder: '请输入权限描述' },
    render: (row: PermissionData) => row.description || '-',
  },
  {
    key: 'resources',
    title: '关联资源',
    width: 160,
    render: (row: PermissionData) => {
      if (!row.resources || row.resources.length === 0) return '-'
      return h(
        'div',
        { class: 'resource-list' },
        row.resources.map(resource =>
          h('div', { class: 'resource-item' }, resource)
        )
      )
    },
  },
  {
    key: 'sort',
    title: '排序',
    width: 80,
    editable: true,
    editType: 'number',
    editProps: { min: 0, max: 9999, placeholder: '排序' },
  },
  {
    key: 'status',
    title: '状态',
    width: 80,
    render: (row: PermissionData) => {
      const config = STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG]
      return h(
        NTag,
        {
          type: config.type as
            | 'default'
            | 'primary'
            | 'info'
            | 'success'
            | 'warning'
            | 'error',
          size: 'small',
          class: `permission-status status-${row.status === 1 ? 'active' : 'inactive'}`,
        },
        { default: () => config.text }
      )
    },
  },
  {
    key: 'createTime',
    title: '创建时间',
    width: 160,
    render: (row: PermissionData) => {
      // 如果是时间戳，可以进行格式化
      if (typeof row.createTime === 'number') {
        return new Date(row.createTime).toLocaleString()
      }
      return String(row.createTime)
    },
  },
]

// ==================== 表单校验规则 ====================
export const PERMISSION_FORM_RULES: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 50,
      message: '权限名称长度在 2 到 50 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: ['input', 'blur'] },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_:]*$/,
      message:
        '权限编码格式不正确，必须以字母开头，只能包含字母、数字、下划线和冒号',
      trigger: ['input', 'blur'],
    },
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: ['change', 'blur'] },
  ],
  module: [
    { required: true, message: '请选择所属模块', trigger: ['change', 'blur'] },
  ],
  sort: [
    {
      type: 'number',
      required: true,
      message: '请输入排序值',
      trigger: ['input', 'blur'],
    },
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: '排序值必须在 0-9999 之间',
      trigger: ['input', 'blur'],
    },
  ],
}

// ==================== 默认表单数据 ====================
export const DEFAULT_PERMISSION_FORM_DATA: PermissionFormData = {
  name: '',
  code: '',
  type: 'button',
  module: 'system',
  description: '',
  resources: '',
  status: 1,
  sort: 0,
  remark: '',
}

// ==================== 数据权限配置 ====================
export type DataScopeType =
  | 'all'
  | 'department'
  | 'department_below'
  | 'self'
  | 'custom'

export interface DataPermissionRule {
  id: string
  module: string
  moduleName: string
  scope: DataScopeType
  departmentIds: string[]
  fieldPermissions: FieldPermissionItem[]
  createTime: string
  updateTime: string
}

export interface FieldPermissionItem {
  field: string
  label: string
  visible: boolean
  editable: boolean
  masked: boolean
}

export const DATA_SCOPE_CONFIG: Record<
  DataScopeType,
  { text: string; type: string; icon: string; description: string }
> = {
  all: {
    text: '全部数据',
    type: 'success',
    icon: 'mdi:database',
    description: '可访问系统中所有数据',
  },
  department: {
    text: '本部门',
    type: 'info',
    icon: 'mdi:office-building',
    description: '仅可访问本部门的数据',
  },
  department_below: {
    text: '本部门及下级',
    type: 'warning',
    icon: 'mdi:sitemap',
    description: '可访问本部门及下级部门的数据',
  },
  self: {
    text: '仅本人',
    type: 'error',
    icon: 'mdi:account',
    description: '仅可访问本人创建的数据',
  },
  custom: {
    text: '自定义',
    type: 'default',
    icon: 'mdi:tune',
    description: '自定义选择可访问的部门数据',
  },
}

export const DATA_SCOPE_OPTIONS = Object.entries(DATA_SCOPE_CONFIG).map(
  ([value, config]) => ({
    label: config.text,
    value,
    description: config.description,
  })
)

// ==================== 临时授权 ====================
export interface TempAuthorization {
  id: string
  targetRole: string
  targetRoleName: string
  permissions: string[]
  permissionNames: string[]
  reason: string
  grantedBy: string
  grantedByName: string
  startTime: string
  expireTime: string
  status: 'active' | 'expired' | 'revoked'
  remark: string
}

export const TEMP_AUTH_STATUS_CONFIG = {
  active: {
    text: '生效中',
    type: 'success' as const,
    icon: 'mdi:check-circle',
  },
  expired: {
    text: '已过期',
    type: 'warning' as const,
    icon: 'mdi:clock-alert',
  },
  revoked: { text: '已撤销', type: 'error' as const, icon: 'mdi:close-circle' },
}

// ==================== 权限互斥与继承 ====================
export interface PermissionConstraint {
  id: string
  type: 'mutual_exclusion' | 'inheritance'
  sourceId: string
  sourceName: string
  sourceCode: string
  targetId: string
  targetName: string
  targetCode: string
  description: string
  createTime: string
}

export const CONSTRAINT_TYPE_CONFIG = {
  mutual_exclusion: {
    text: '互斥关系',
    type: 'error' as const,
    icon: 'mdi:swap-horizontal',
    description: '两个权限不能同时授予同一角色',
  },
  inheritance: {
    text: '继承关系',
    type: 'info' as const,
    icon: 'mdi:arrow-down',
    description: '拥有父权限自动继承子权限',
  },
}

// ==================== 审计日志 ====================
export interface AuditLogItem {
  id: string
  operatorName: string
  operatorAvatar?: string
  action: 'grant' | 'revoke' | 'modify' | 'create' | 'delete'
  targetType: 'role' | 'user' | 'menu' | 'permission'
  targetName: string
  detail: string
  timestamp: string
  ip: string
}

export const AUDIT_ACTION_CONFIG = {
  grant: { text: '授权', type: 'success' as const, icon: 'mdi:shield-plus' },
  revoke: { text: '撤销', type: 'error' as const, icon: 'mdi:shield-remove' },
  modify: { text: '修改', type: 'warning' as const, icon: 'mdi:pencil' },
  create: { text: '创建', type: 'info' as const, icon: 'mdi:plus-circle' },
  delete: { text: '删除', type: 'error' as const, icon: 'mdi:delete' },
}

export const AUDIT_TARGET_CONFIG = {
  role: { text: '角色', icon: 'mdi:account-key' },
  user: { text: '用户', icon: 'mdi:account' },
  menu: { text: '菜单', icon: 'mdi:menu' },
  permission: { text: '权限', icon: 'mdi:shield-check' },
}

// ==================== Mock 数据：数据权限 ====================
export const MOCK_DATA_PERMISSIONS: DataPermissionRule[] = [
  {
    id: 'dp_1',
    module: 'user',
    moduleName: '用户管理',
    scope: 'all',
    departmentIds: [],
    fieldPermissions: [
      {
        field: 'username',
        label: '用户名',
        visible: true,
        editable: true,
        masked: false,
      },
      {
        field: 'email',
        label: '邮箱',
        visible: true,
        editable: true,
        masked: false,
      },
      {
        field: 'phone',
        label: '手机号',
        visible: true,
        editable: true,
        masked: true,
      },
      {
        field: 'idCard',
        label: '身份证',
        visible: true,
        editable: false,
        masked: true,
      },
      {
        field: 'salary',
        label: '薪资',
        visible: false,
        editable: false,
        masked: true,
      },
    ],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-03-15 14:30:00',
  },
  {
    id: 'dp_2',
    module: 'role',
    moduleName: '角色管理',
    scope: 'department',
    departmentIds: ['dept_1'],
    fieldPermissions: [
      {
        field: 'roleName',
        label: '角色名',
        visible: true,
        editable: true,
        masked: false,
      },
      {
        field: 'roleCode',
        label: '角色编码',
        visible: true,
        editable: false,
        masked: false,
      },
      {
        field: 'permissions',
        label: '权限列表',
        visible: true,
        editable: true,
        masked: false,
      },
    ],
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-03-10 11:20:00',
  },
  {
    id: 'dp_3',
    module: 'log',
    moduleName: '日志管理',
    scope: 'self',
    departmentIds: [],
    fieldPermissions: [
      {
        field: 'content',
        label: '日志内容',
        visible: true,
        editable: false,
        masked: false,
      },
      {
        field: 'operatorIp',
        label: '操作IP',
        visible: true,
        editable: false,
        masked: true,
      },
    ],
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-02-20 09:15:00',
  },
  {
    id: 'dp_4',
    module: 'order',
    moduleName: '订单管理',
    scope: 'department_below',
    departmentIds: ['dept_1', 'dept_1_1', 'dept_1_2'],
    fieldPermissions: [
      {
        field: 'orderNo',
        label: '订单号',
        visible: true,
        editable: false,
        masked: false,
      },
      {
        field: 'amount',
        label: '金额',
        visible: true,
        editable: true,
        masked: false,
      },
      {
        field: 'customerPhone',
        label: '客户电话',
        visible: true,
        editable: false,
        masked: true,
      },
    ],
    createTime: '2024-02-01 10:00:00',
    updateTime: '2024-03-12 16:00:00',
  },
  {
    id: 'dp_5',
    module: 'file',
    moduleName: '文件管理',
    scope: 'custom',
    departmentIds: ['dept_1', 'dept_2', 'dept_3'],
    fieldPermissions: [
      {
        field: 'fileName',
        label: '文件名',
        visible: true,
        editable: true,
        masked: false,
      },
      {
        field: 'fileSize',
        label: '文件大小',
        visible: true,
        editable: false,
        masked: false,
      },
      {
        field: 'uploadUser',
        label: '上传者',
        visible: true,
        editable: false,
        masked: false,
      },
    ],
    createTime: '2024-02-15 10:00:00',
    updateTime: '2024-03-08 13:45:00',
  },
]

// ==================== Mock 数据：临时授权 ====================
export const MOCK_TEMP_AUTHORIZATIONS: TempAuthorization[] = [
  {
    id: 'ta_1',
    targetRole: 'role_3',
    targetRoleName: '内容编辑员',
    permissions: ['perm_1_1_1', 'perm_1_1_2'],
    permissionNames: ['新增用户', '编辑用户'],
    reason: '系统迁移期间需要临时用户管理权限',
    grantedBy: 'user_1',
    grantedByName: '超级管理员',
    startTime: '2024-03-01 00:00:00',
    expireTime: '2024-03-31 23:59:59',
    status: 'active',
    remark: '系统迁移专用临时授权',
  },
  {
    id: 'ta_2',
    targetRole: 'role_4',
    targetRoleName: '数据分析师',
    permissions: ['perm_2_1_1'],
    permissionNames: ['发布文章'],
    reason: '季度报告发布需要',
    grantedBy: 'user_2',
    grantedByName: '系统管理员1',
    startTime: '2024-02-01 00:00:00',
    expireTime: '2024-02-28 23:59:59',
    status: 'expired',
    remark: '',
  },
  {
    id: 'ta_3',
    targetRole: 'role_5',
    targetRoleName: '测试角色',
    permissions: ['perm_3_1', 'perm_3_2'],
    permissionNames: ['查看报表', '导出数据'],
    reason: '新功能测试需要',
    grantedBy: 'user_1',
    grantedByName: '超级管理员',
    startTime: '2024-01-15 00:00:00',
    expireTime: '2024-01-20 23:59:59',
    status: 'revoked',
    remark: '测试完成，提前撤销',
  },
]

// ==================== Mock 数据：权限约束 ====================
export const MOCK_CONSTRAINTS: PermissionConstraint[] = [
  {
    id: 'con_1',
    type: 'mutual_exclusion',
    sourceId: 'perm_1_1_1',
    sourceName: '新增用户',
    sourceCode: 'system:user:add',
    targetId: 'perm_1_1_3',
    targetName: '删除用户',
    targetCode: 'system:user:delete',
    description: '新增用户和删除用户不能同时授予同一角色（职责分离）',
    createTime: '2024-01-10 10:00:00',
  },
  {
    id: 'con_2',
    type: 'mutual_exclusion',
    sourceId: 'perm_1_2_1',
    sourceName: '新增角色',
    sourceCode: 'system:role:add',
    targetId: 'perm_1_2_3',
    targetName: '删除角色',
    targetCode: 'system:role:delete',
    description: '新增角色和删除角色不能同时授予同一角色（职责分离）',
    createTime: '2024-01-10 10:30:00',
  },
  {
    id: 'con_3',
    type: 'inheritance',
    sourceId: 'perm_1',
    sourceName: '系统管理',
    sourceCode: 'system',
    targetId: 'perm_1_1',
    targetName: '用户管理',
    targetCode: 'system:user',
    description: '拥有系统管理权限自动继承用户管理权限',
    createTime: '2024-01-05 09:00:00',
  },
  {
    id: 'con_4',
    type: 'inheritance',
    sourceId: 'perm_1',
    sourceName: '系统管理',
    sourceCode: 'system',
    targetId: 'perm_1_2',
    targetName: '角色管理',
    targetCode: 'system:role',
    description: '拥有系统管理权限自动继承角色管理权限',
    createTime: '2024-01-05 09:00:00',
  },
]

// ==================== Mock 数据：审计日志 ====================
export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_1',
    operatorName: '超级管理员',
    action: 'grant',
    targetType: 'role',
    targetName: '内容编辑员',
    detail:
      '为角色「内容编辑员」授予「新增用户」「编辑用户」临时权限，有效期至 2024-03-31',
    timestamp: '2024-03-15 14:30:22',
    ip: '192.168.1.100',
  },
  {
    id: 'log_2',
    operatorName: '系统管理员1',
    action: 'modify',
    targetType: 'permission',
    targetName: '导出数据',
    detail: '修改权限「导出数据」的数据范围：全部数据 → 本部门及下级',
    timestamp: '2024-03-14 11:20:15',
    ip: '192.168.1.101',
  },
  {
    id: 'log_3',
    operatorName: '超级管理员',
    action: 'revoke',
    targetType: 'role',
    targetName: '测试角色',
    detail: '撤销角色「测试角色」的「查看报表」「导出数据」临时权限',
    timestamp: '2024-03-13 09:45:30',
    ip: '192.168.1.100',
  },
  {
    id: 'log_4',
    operatorName: '超级管理员',
    action: 'create',
    targetType: 'permission',
    targetName: '文件上传',
    detail: '创建新权限「文件上传」，类型：按钮权限，模块：文件管理',
    timestamp: '2024-03-12 16:10:45',
    ip: '192.168.1.100',
  },
  {
    id: 'log_5',
    operatorName: '系统管理员2',
    action: 'delete',
    targetType: 'permission',
    targetName: '临时测试权限',
    detail: '删除过期的临时测试权限「临时测试权限」',
    timestamp: '2024-03-11 08:30:00',
    ip: '192.168.1.102',
  },
  {
    id: 'log_6',
    operatorName: '超级管理员',
    action: 'grant',
    targetType: 'user',
    targetName: '分析师1',
    detail: '为用户「分析师1」分配角色「数据分析师」',
    timestamp: '2024-03-10 10:00:00',
    ip: '192.168.1.100',
  },
  {
    id: 'log_7',
    operatorName: '超级管理员',
    action: 'modify',
    targetType: 'role',
    targetName: '系统管理员',
    detail: '修改角色「系统管理员」权限：移除「删除用户」权限',
    timestamp: '2024-03-09 15:20:00',
    ip: '192.168.1.100',
  },
  {
    id: 'log_8',
    operatorName: '系统管理员1',
    action: 'modify',
    targetType: 'menu',
    targetName: '数据统计',
    detail: '修改菜单「数据统计」排序值：3 → 2',
    timestamp: '2024-03-08 11:00:00',
    ip: '192.168.1.101',
  },
]
