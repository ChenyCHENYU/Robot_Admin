/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\user-role-options.test.ts
 * @Description: 任意远端角色 ID 与响应显式类型约束的选项回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createUserRoleOptions } from '../src/views/sys-manage/user-manage/d_roleOptions'
import { MOCK_ROLE_DATA } from '../src/api/user-manage.mock'
import type { RoleData, DeptData } from '../src/api/user-manage.contract'
import {
  findDeptById,
  findDeptByType,
} from '../src/views/sys-manage/user-manage/data'

test('远端角色 ID 不依赖样例，缺少类型约束时保留可用角色', () => {
  const roles: RoleData[] = [
    { id: 'c4fa-uuid', name: '企业客户', code: 'client', status: 1 },
    {
      id: 'real-2',
      name: '审计',
      code: 'review',
      status: 1,
      userTypes: ['external'],
    },
    {
      id: 'real-3',
      name: '内部',
      code: 'staff',
      status: 1,
      userTypes: ['internal'],
    },
    { id: 'real-4', name: '停用', code: 'disabled', status: 0 },
  ]
  expect(
    createUserRoleOptions(roles, 'external').map(option => option.value)
  ).toEqual(['c4fa-uuid', 'real-2'])
  expect(
    createUserRoleOptions(roles, 'internal').map(option => option.value)
  ).toEqual(['c4fa-uuid', 'real-3'])
  expect(
    createUserRoleOptions(MOCK_ROLE_DATA, 'external').map(
      option => option.value
    )
  ).toEqual(['role_4', 'role_5'])
})

test('部门按类型和任意层级的真实 ID 查询，不依赖 dept_external 样例', () => {
  const external: DeptData = {
    id: 'external-uuid',
    name: '客户组织',
    type: 'external',
    sort: 1,
    status: 1,
  }
  const departments: DeptData[] = [
    {
      id: 'org-uuid',
      name: '组织',
      type: 'dept',
      sort: 0,
      status: 1,
      children: [external],
    },
  ]
  expect(findDeptByType(departments, 'external')).toBe(external)
  expect(findDeptById(departments, external.id)).toBe(external)
  expect(findDeptByType(departments, 'other')).toBeNull()
})
