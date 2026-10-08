/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\demo-employees.mock.ts
 * @Description: 无后端表格演示的隔离内存源；远端模式必须使用真实 API
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DemoEmployee } from './demo-employees.contract'

export const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    id: 1,
    name: '张三',
    age: 28,
    email: 'zhang@example.com',
    department: '技术部',
    role: '前端工程师',
    salary: 15000,
    status: '在职',
    hasChildren: true,
    childData: [
      {
        id: 101,
        project: '管理系统前端',
        progress: '80%',
        status: '进行中',
      },
      {
        id: 102,
        project: '移动应用开发',
        progress: '60%',
        status: '设计中',
      },
      {
        id: 103,
        project: '组件库建设',
        progress: '90%',
        status: '测试中',
      },
    ],
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    email: 'li@example.com',
    department: '产品部',
    role: '产品经理',
    salary: 18000,
    status: '在职',
    hasChildren: true,
    childData: [
      {
        id: 201,
        requirement: '用户需求调研',
        status: '已完成',
        priority: '高',
      },
      {
        id: 202,
        requirement: '竞品分析报告',
        status: '进行中',
        priority: '中',
      },
      {
        id: 203,
        requirement: '原型设计评审',
        status: '待开始',
        priority: '高',
      },
    ],
  },
  {
    id: 3,
    name: '王五',
    age: 26,
    email: 'wang@example.com',
    department: '设计部',
    role: 'UI设计师',
    salary: 12000,
    status: '离职',
    hasChildren: false,
    childData: [],
  },
  {
    id: 4,
    name: '赵六',
    age: 35,
    email: 'zhao@example.com',
    department: '技术部',
    role: '后端工程师',
    salary: 20000,
    status: '在职',
    hasChildren: true,
    childData: [
      {
        id: 401,
        service: 'API接口开发',
        version: 'v2.1',
        status: '已部署',
      },
      {
        id: 402,
        service: '数据库优化',
        version: 'v1.3',
        status: '测试中',
      },
    ],
  },
  {
    id: 5,
    name: '钱七',
    age: 29,
    email: 'qian@example.com',
    department: '运营部',
    role: '运营专员',
    salary: 13000,
    status: '在职',
    hasChildren: false,
    childData: [],
  },
]
