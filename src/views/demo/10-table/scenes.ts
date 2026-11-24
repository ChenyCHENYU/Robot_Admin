/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\10-table\\scenes.ts
 * @Description: 按范围导出和树形表格的独立示例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { defineTableColumns } from '@robot-admin/naive-ui-components/C_Table'
import {
  LEVEL_CONFIG,
  STATUS_TAG_CONFIG,
  formatDepartment,
  generateMockEmployees,
  type Employee,
} from './data'

/** 每个部门至少有三页数据，筛选后仍能比较本页与全部匹配。 */
export const EXPORT_DEMO_ROWS = generateMockEmployees(48).map(row => ({
  id: row.id,
  name: row.name,
  department: row.department,
  departmentName: formatDepartment(row.department),
  email: row.email,
}))

export const EXPORT_DEMO_COLUMNS = defineTableColumns<
  (typeof EXPORT_DEMO_ROWS)[number]
>([
  { type: 'selection' },
  { key: 'id', title: '编号', width: 80 },
  { key: 'name', title: '姓名', minWidth: 100 },
  { key: 'departmentName', title: '部门', minWidth: 110 },
  { key: 'email', title: '邮箱', minWidth: 230 },
])

/** 带子节点的树形数据演示 */
export const TREE_TABLE_DATA: Employee[] = [
  {
    id: 9001,
    name: '技术部',
    age: 0,
    gender: 'male',
    email: 'tech@example.com',
    department: 'tech',
    joinDate: Date.now() - 365 * 86400000,
    status: 'active',
    level: 'lead',
    salary: 0,
    description: '技术部门',
    children: [
      {
        id: 9011,
        name: '前端组长',
        age: 32,
        gender: 'male',
        email: 'frontend-lead@example.com',
        department: 'tech',
        joinDate: Date.now() - 300 * 86400000,
        status: 'active',
        level: 'senior',
        salary: 25000,
      },
      {
        id: 9012,
        name: '后端组长',
        age: 34,
        gender: 'male',
        email: 'backend-lead@example.com',
        department: 'tech',
        joinDate: Date.now() - 350 * 86400000,
        status: 'active',
        level: 'senior',
        salary: 28000,
      },
    ],
  },
  {
    id: 9002,
    name: '市场部',
    age: 0,
    gender: 'female',
    email: 'market@example.com',
    department: 'market',
    joinDate: Date.now() - 200 * 86400000,
    status: 'active',
    level: 'lead',
    salary: 0,
    description: '市场部门',
    children: [
      {
        id: 9021,
        name: '品牌经理',
        age: 29,
        gender: 'female',
        email: 'brand@example.com',
        department: 'market',
        joinDate: Date.now() - 150 * 86400000,
        status: 'active',
        level: 'mid',
        salary: 18000,
      },
    ],
  },
]

export const TREE_TABLE_COLUMNS = defineTableColumns<Employee>([
  { key: 'name', title: '名称', width: 200 },
  {
    key: 'department',
    title: '部门',
    width: 120,
    render: row => formatDepartment(row.department),
  },
  {
    key: 'level',
    title: '职级',
    width: 100,
    render: (row: Employee) => LEVEL_CONFIG[row.level || 'junior']?.text || '-',
  },
  {
    key: 'salary',
    title: '薪资',
    width: 120,
    render: (row: Employee) =>
      row.salary ? `¥${row.salary.toLocaleString()}` : '-',
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row: Employee) =>
      STATUS_TAG_CONFIG[row.status]?.text || row.status,
  },
  { key: 'email', title: '邮箱', width: 200 },
])
