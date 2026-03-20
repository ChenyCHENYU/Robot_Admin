import { h } from 'vue'
import { NTag, type DataTableColumns } from 'naive-ui/es'

// ==================== 类型定义 ====================
export type ActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'other'

export type ActionResult = 'success' | 'failed'

export interface ActivityRecord {
  id: string
  time: string
  actionType: ActionType
  module: string
  description: string
  ip: string
  result: ActionResult
  detail?: string
}

export interface ActivitySearchForm {
  keyword: string
  actionType: ActionType | null
  result: ActionResult | null
  dateRange: [number, number] | null
}

// ==================== 常量配置 ====================
export const ACTION_TYPE_MAP: Record<
  ActionType,
  { label: string; color: string }
> = {
  login: { label: '登录', color: '#22c55e' },
  logout: { label: '登出', color: '#6b7280' },
  create: { label: '新增', color: '#3b82f6' },
  update: { label: '修改', color: '#f59e0b' },
  delete: { label: '删除', color: '#ef4444' },
  export: { label: '导出', color: '#8b5cf6' },
  import: { label: '导入', color: '#06b6d4' },
  other: { label: '其他', color: '#9ca3af' },
}

export const ACTION_TYPE_OPTIONS = Object.entries(ACTION_TYPE_MAP).map(
  ([value, { label }]) => ({ label, value })
)

export const RESULT_OPTIONS = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
]

// ==================== 表格列配置 ====================
export const createColumns = (): DataTableColumns<ActivityRecord> => [
  { title: '时间', key: 'time', width: 180, sorter: 'default' },
  {
    title: '操作类型',
    key: 'actionType',
    width: 100,
    render: (row: ActivityRecord) => {
      const info = ACTION_TYPE_MAP[row.actionType]
      return h(
        NTag,
        {
          size: 'small',
          round: true,
          bordered: false,
          color: { color: `${info.color}18`, textColor: info.color },
        },
        () => info.label
      )
    },
    filterOptions: ACTION_TYPE_OPTIONS.map(o => ({
      label: o.label,
      value: o.value,
    })),
    filter: (value: string | number | boolean, row: ActivityRecord) =>
      row.actionType === value,
  },
  { title: '功能模块', key: 'module', width: 120 },
  {
    title: '操作描述',
    key: 'description',
    ellipsis: { tooltip: true },
  },
  { title: 'IP 地址', key: 'ip', width: 140 },
  {
    title: '结果',
    key: 'result',
    width: 80,
    render: (row: ActivityRecord) =>
      h(
        NTag,
        {
          type: row.result === 'success' ? 'success' : 'error',
          size: 'small',
          round: true,
        },
        () => (row.result === 'success' ? '成功' : '失败')
      ),
  },
]

// ==================== Mock 数据 ====================
export const MOCK_ACTIVITY_RECORDS: ActivityRecord[] = [
  {
    id: '1',
    time: '2026-03-04 08:15:22',
    actionType: 'login',
    module: '认证',
    description: '用户登录系统',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '2',
    time: '2026-03-04 09:30:15',
    actionType: 'update',
    module: '用户管理',
    description: '修改用户「张三」的角色权限',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '3',
    time: '2026-03-04 10:12:03',
    actionType: 'create',
    module: '菜单管理',
    description: '新增菜单「账户中心」',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '4',
    time: '2026-03-04 10:45:50',
    actionType: 'export',
    module: '用户管理',
    description: '导出用户列表数据（共 256 条）',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '5',
    time: '2026-03-03 19:30:45',
    actionType: 'delete',
    module: '字典管理',
    description: '删除字典项「临时分类」',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '6',
    time: '2026-03-03 14:22:11',
    actionType: 'login',
    module: '认证',
    description: '用户尝试登录（密码错误）',
    ip: '10.0.0.55',
    result: 'failed',
  },
  {
    id: '7',
    time: '2026-03-03 11:05:33',
    actionType: 'update',
    module: '角色管理',
    description: '修改角色「编辑者」的菜单权限',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '8',
    time: '2026-03-02 16:20:18',
    actionType: 'import',
    module: '用户管理',
    description: '批量导入用户数据（成功 50 条）',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '9',
    time: '2026-03-02 09:05:33',
    actionType: 'login',
    module: '认证',
    description: '用户登录系统',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '10',
    time: '2026-03-01 20:18:07',
    actionType: 'logout',
    module: '认证',
    description: '用户主动退出登录',
    ip: '172.16.0.88',
    result: 'success',
  },
  {
    id: '11',
    time: '2026-03-01 15:42:19',
    actionType: 'update',
    module: '系统设置',
    description: '修改系统参数「会话超时时间」为 30 分钟',
    ip: '192.168.1.100',
    result: 'success',
  },
  {
    id: '12',
    time: '2026-02-28 10:33:44',
    actionType: 'delete',
    module: '权限管理',
    description: '删除权限策略「临时访客权限」',
    ip: '192.168.1.100',
    result: 'success',
  },
]
