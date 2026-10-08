/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\user-manage.mock.ts
 * @Description: 演示用户的浏览器持久化、部门及角色选项
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { UserData, DeptData, RoleData } from './user-manage.contract'

// ==================== 模拟数据 ====================
export const MOCK_DEPT_DATA: DeptData[] = [
  {
    id: 'dept_1',
    name: '总公司',
    parentId: null,
    sort: 1,
    status: 1,
    type: 'dept',
    children: [
      {
        id: 'dept_2',
        name: '技术部',
        parentId: 'dept_1',
        sort: 1,
        status: 1,
        type: 'dept',
        children: [
          {
            id: 'dept_3',
            name: '前端组',
            parentId: 'dept_2',
            sort: 1,
            status: 1,
            type: 'dept',
          },
          {
            id: 'dept_4',
            name: '后端组',
            parentId: 'dept_2',
            sort: 2,
            status: 1,
            type: 'dept',
          },
        ],
      },
      {
        id: 'dept_5',
        name: '市场部',
        parentId: 'dept_1',
        sort: 2,
        status: 1,
        type: 'dept',
      },
      {
        id: 'dept_6',
        name: '人事部',
        parentId: 'dept_1',
        sort: 3,
        status: 1,
        type: 'dept',
      },
    ],
  },
  {
    id: 'dept_external',
    name: '外部客户',
    parentId: null,
    sort: 2,
    status: 1,
    type: 'external',
  },
]

export const MOCK_ROLE_DATA: RoleData[] = [
  { id: 'role_1', name: '超级管理员', code: 'admin', status: 1 },
  { id: 'role_2', name: '部门经理', code: 'manager', status: 1 },
  { id: 'role_3', name: '普通员工', code: 'user', status: 1 },
  { id: 'role_4', name: '客户', code: 'customer', status: 1 },
  { id: 'role_5', name: '访客', code: 'guest', status: 1 },
]

export const MOCK_USER_DATA: UserData[] = [
  {
    id: 'user_1',
    username: 'admin',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    userType: 'internal',
    deptId: 'dept_1',
    deptName: '总公司',
    roleIds: ['role_1'],
    roleNames: ['超级管理员'],
    status: 1,
    avatar: '',
    remark: '系统超级管理员',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 14:30:00',
    lastLoginTime: '2024-01-15 09:15:00',
  },
  {
    id: 'user_2',
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138002',
    userType: 'internal',
    deptId: 'dept_3',
    deptName: '前端组',
    roleIds: ['role_3'],
    roleNames: ['普通员工'],
    status: 1,
    remark: '前端开发工程师',
    createTime: '2024-01-02 09:00:00',
    updateTime: '2024-01-10 16:20:00',
    lastLoginTime: '2024-01-15 08:45:00',
  },
  {
    id: 'user_3',
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@example.com',
    phone: '13800138003',
    userType: 'internal',
    deptId: 'dept_4',
    deptName: '后端组',
    roleIds: ['role_2', 'role_3'],
    roleNames: ['部门经理', '普通员工'],
    status: 0,
    remark: '后端开发工程师',
    createTime: '2024-01-03 09:00:00',
    updateTime: '2024-01-12 11:10:00',
    lastLoginTime: '2024-01-14 17:30:00',
  },
  {
    id: 'user_4',
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@example.com',
    phone: '13800138004',
    userType: 'internal',
    deptId: 'dept_5',
    deptName: '市场部',
    roleIds: ['role_3'],
    roleNames: ['普通员工'],
    status: 1,
    remark: '市场专员',
    createTime: '2024-01-04 09:00:00',
    updateTime: '2024-01-08 13:45:00',
    lastLoginTime: '2024-01-13 10:20:00',
  },
  {
    id: 'user_5',
    username: 'customer001',
    nickname: 'ABC公司',
    email: 'contact@abc.com',
    phone: '13800138005',
    userType: 'external',
    deptId: 'dept_external',
    deptName: '外部客户',
    roleIds: ['role_4'],
    roleNames: ['客户'],
    status: 1,
    remark: 'ABC科技有限公司',
    companyName: 'ABC科技有限公司',
    contactPerson: '刘总',
    createTime: '2024-01-05 09:00:00',
    updateTime: '2024-01-12 15:20:00',
    lastLoginTime: '2024-01-14 10:30:00',
  },
]

const MOCK_USERS_KEY = 'robot-admin:mock-users:v1'

/** 演示用户数据只保存在当前浏览器，避免切换公司刷新后回到初始记录。 */
export const persistMockUsers = (): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(MOCK_USER_DATA))
  }
}

if (typeof localStorage !== 'undefined') {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(MOCK_USERS_KEY) || 'null'
    )
    if (
      Array.isArray(stored) &&
      stored.every(
        user =>
          user &&
          typeof user.id === 'string' &&
          typeof user.username === 'string' &&
          typeof user.status === 'number'
      )
    ) {
      MOCK_USER_DATA.splice(0, MOCK_USER_DATA.length, ...(stored as UserData[]))
    }
  } catch {
    // 损坏的演示缓存使用内置样例，不影响真实 API 模式。
  }
}

// ==================== 工具函数 ====================
/**
 * 根据角色ID获取角色名称
 */
export const getRoleNameById = (roleId: string): string =>
  MOCK_ROLE_DATA.find(r => r.id === roleId)?.name || ''

/**
 * 根据部门ID获取部门名称
 */
export const getDeptNameById = (deptId: string): string => {
  const findDeptName = (depts: DeptData[], id: string): string | null => {
    for (const dept of depts) {
      if (dept.id === id) return dept.name
      if (dept.children) {
        const found = findDeptName(dept.children, id)
        if (found) return found
      }
    }
    return null
  }
  return findDeptName(MOCK_DEPT_DATA, deptId) || '未知部门'
}
