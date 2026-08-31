/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 15:45:21
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 15:46:13
 * @FilePath: \Robot_Admin\src\views\demo\18-copy-all\data.ts
 * @Description: 复制文本 useCopy Hooks 演示页面 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableColumns } from 'naive-ui/es/data-table'

// ==================== 常量定义 ====================
export const DEMO_TEXT = '这是一段演示文本，用于测试复制功能。'

export const DEMO_URLS = [
  'https://www.github.com',
  'www.google.com',
  'localhost:3000',
  'https://api.example.com/users',
]

export const JSON_EXAMPLES = [
  {
    label: '用户信息',
    data: {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      roles: ['user', 'admin'],
    },
  },
  {
    label: '配置对象',
    data: {
      theme: 'dark',
      language: 'zh-CN',
      notifications: true,
      features: {
        darkMode: true,
        animations: false,
      },
    },
  },
  {
    label: '数组数据',
    data: [
      { id: 1, name: '商品A', price: 99.99 },
      { id: 2, name: '商品B', price: 149.99 },
      { id: 3, name: '商品C', price: 199.99 },
    ],
  },
]

export const CODE_EXAMPLES = [
  {
    language: 'JavaScript',
    content: `const useCopy = () => {
  const copy = async (text) => {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
  }
  return { copy }
}`,
  },
  {
    language: 'CSS',
    content: `.copy-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}`,
  },
  {
    language: 'Vue',
    content: `<template>
  <NButton @click="handleCopy">
    <template #icon>
      <i class="i-mdi-content-copy" />
    </template>
    复制内容
  </NButton>
</template>`,
  },
]

export const CSV_DATA = [
  { id: 1, name: '张三', age: 25, department: '技术部', salary: 8000 },
  { id: 2, name: '李四', age: 30, department: '产品部', salary: 9000 },
  { id: 3, name: '王五', age: 28, department: '设计部', salary: 7500 },
  { id: 4, name: '赵六', age: 32, department: '运营部', salary: 8500 },
]

export const CSV_COLUMNS: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '姓名', key: 'name', width: 100 },
  { title: '年龄', key: 'age', width: 80 },
  { title: '部门', key: 'department', width: 120 },
  { title: '薪资', key: 'salary', width: 100 },
]

export const CONTACTS = [
  {
    type: 'email',
    label: '邮箱地址',
    value: 'contact@example.com',
    icon: 'i-mdi-email',
  },
  {
    type: 'phone',
    label: '联系电话',
    value: '13800138000',
    icon: 'i-mdi-phone',
  },
  {
    type: 'address',
    label: '公司地址',
    value: '北京市朝阳区某某大厦1008室',
    icon: 'i-mdi-map-marker',
  },
]
