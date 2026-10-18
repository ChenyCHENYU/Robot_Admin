/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\demo\40-action-bar\data.ts
 * @Description: 操作栏演示列、下拉项与默认布局配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import type { ActionDropdownItem } from '@robot-admin/naive-ui-components/C_ActionBar'

// 表格列定义
export const columns: TableColumn<EmployeeRow>[] = [
  { type: 'selection' },
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

// 场景六：「更多」下拉子选项配置，页面为每项绑定可等待的 onClick。
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
