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
