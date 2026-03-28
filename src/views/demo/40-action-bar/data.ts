import type {
  TableColumn,
  ActionDropdownItem,
} from '@robot-admin/naive-ui-components'

// 表格列定义
export const columns: TableColumn[] = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '姓名', key: 'name' },
  { title: '部门', key: 'department' },
  { title: '职位', key: 'role' },
  { title: '状态', key: 'status' },
]

// 表格模拟数据
export interface EmployeeRow {
  id: number
  name: string
  department: string
  role: string
  status: string
}

export const MOCK_TABLE_DATA: EmployeeRow[] = [
  {
    id: 1,
    name: '张三',
    department: '技术部',
    role: '前端工程师',
    status: '在职',
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    role: '产品经理',
    status: '在职',
  },
  {
    id: 3,
    name: '王五',
    department: '设计部',
    role: 'UI设计师',
    status: '在职',
  },
]

// 日志条目类型
export interface LogItem {
  time: string
  message: string
  type: string
}

// 自定义配置初始值
export const DEFAULT_CUSTOM_CONFIG = {
  align: 'left' as 'left' | 'center' | 'right' | 'space-between',
  size: 'small' as 'tiny' | 'small' | 'medium' | 'large',
  showDivider: false,
  compact: false,
  wrap: false,
}

// 场景六：「更多」下拉子选项配置（无回调，通过 @dropdown-click 统一分发）
export const MORE_DROPDOWN_ITEMS: ActionDropdownItem[] = [
  { key: 'export-excel', label: '导出Excel', icon: 'mdi:file-excel' },
  { key: 'export-pdf', label: '导出PDF', icon: 'mdi:file-pdf' },
  { key: 'print', label: '打印', icon: 'mdi:printer' },
]

// 场景六：「设置」下拉子选项配置
export const SETTINGS_DROPDOWN_ITEMS: ActionDropdownItem[] = [
  { key: 'column', label: '列设置', icon: 'mdi:table-column' },
  { key: 'filter', label: '筛选', icon: 'mdi:filter' },
]
