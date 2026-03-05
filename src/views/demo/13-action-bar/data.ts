/**
 * @Description: 操作按钮组演示页 - 静态数据
 */

import type { TableColumn } from '@/types/modules/table'

// ================= 表格列定义 =================
export const columns: TableColumn[] = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '姓名', key: 'name' },
  { title: '部门', key: 'department' },
  { title: '职位', key: 'role' },
  { title: '状态', key: 'status' },
]

// ================= 表格模拟数据 =================
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

// ================= 日志条目类型 =================
export interface LogItem {
  time: string
  message: string
  type: string
}

// ================= 自定义配置初始值 =================
export const DEFAULT_CUSTOM_CONFIG = {
  align: 'left' as 'left' | 'center' | 'right' | 'space-between',
  size: 'small' as 'tiny' | 'small' | 'medium' | 'large',
  showDivider: false,
  compact: false,
  wrap: false,
}
