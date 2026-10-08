/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\demo\12-table-dynamic\data.ts
 * @Description: 表格演示配置与展示；数据源遵循项目运行模式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { TableColumn } from '@robot-admin/naive-ui-components'
import type { TagProps } from 'naive-ui'

import type { DemoEmployee } from '@/api/demo-employees.contract'
export type { DemoEmployee as DynamicEmployee } from '@/api/demo-employees.contract'

// ================= 操作日志类型 =================
export interface Log {
  type: 'add' | 'delete' | 'edit' | 'select'
  message: string
  time: string
}

// ================= 表格列配置 =================
export const dynamicTableColumns: TableColumn<DemoEmployee>[] = [
  {
    key: 'name',
    title: '姓名',
    width: 100,
    editable: true,
    editType: 'input',
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    editable: true,
    editType: 'number',
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    editType: 'email',
  },
  {
    key: 'department',
    title: '部门',
    width: 100,
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '运营部', value: '运营部' },
      ],
    },
  },
  {
    key: 'role',
    title: '角色',
    width: 120,
    editable: true,
    editType: 'input',
  },
  {
    key: 'salary',
    title: '薪资',
    width: 100,
    editable: true,
    editType: 'number',
    render: (row: DemoEmployee) => {
      const employee = row
      return `¥${employee.salary.toLocaleString()}`
    },
  },
  {
    key: 'status',
    title: '状态',
    width: 80,
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '在职', value: '在职' },
        { label: '离职', value: '离职' },
      ],
    },
    render: (row: DemoEmployee) => {
      const employee = row
      return employee.status === '在职' ? '🟢 在职' : '🔴 离职'
    },
  },
]

// ================= 工具函数 =================
export const getLogTagType = (type: Log['type']): TagProps['type'] => {
  const typeMap: Record<Log['type'], TagProps['type']> = {
    add: 'success',
    delete: 'error',
    edit: 'warning',
    select: 'info',
  }
  return typeMap[type] || 'default'
}

// ================= 默认新员工数据生成器 =================
export const createDefaultEmployee = (): DemoEmployee => ({
  id: Date.now(),
  name: '新员工',
  age: 25,
  email: '',
  department: '技术部',
  role: '实习生',
  salary: 8000,
  status: '在职',
  hasChildren: false,
  childData: [],
})

// ================= 随机员工数据生成器 =================
export const generateRandomEmployee = (): DemoEmployee => {
  const names = ['赵六', '钱七', '孙八', '李九', '周十', '吴十一']
  const departments = ['技术部', '产品部', '设计部', '运营部']
  const roles = [
    '前端工程师',
    '后端工程师',
    '产品经理',
    'UI设计师',
    '运营专员',
    '测试工程师',
  ]

  return {
    id: Date.now(),
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 20) + 23,
    email: `user${Date.now()}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    salary: Math.floor(Math.random() * 15000) + 8000,
    status: '在职',
    hasChildren: false,
    childData: [],
  }
}
