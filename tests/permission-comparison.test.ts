/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\permission-comparison.test.ts
 * @Description: 同名权限不能被误判为同一授权，差异按唯一 ID 计算
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  compareRolePermissions,
  getRolePermissionName,
} from '../src/utils/d_permissionComparison'
import type { RoleData } from '../src/api/role-manage.contract'

test('权限比较按 ID 去重，同名不同 ID 保持差异，缺失名称回退到 ID', () => {
  const base = {
    name: '角色',
    code: 'role',
    type: 'custom',
    status: 1,
    sort: 0,
    createTime: '',
  } as const
  const a: RoleData = {
    ...base,
    id: 'a',
    permissionIds: ['a', 'b', 'b'],
    permissionNames: ['读取', '共同权限', '共同权限'],
  }
  const b: RoleData = {
    ...base,
    id: 'b',
    permissionIds: ['c', 'b'],
    permissionNames: ['读取', '改名的共同权限'],
  }
  expect(compareRolePermissions(a, b)).toEqual({
    shared: ['b'],
    onlyA: ['a'],
    onlyB: ['c'],
  })
  expect(getRolePermissionName(a, 'a')).toBe('读取')
  expect(getRolePermissionName(b, 'c')).toBe('读取')
  expect(getRolePermissionName(b, 'missing')).toBe('missing')
  expect(compareRolePermissions({ ...base, id: 'empty' }, b).onlyB).toEqual([
    'c',
    'b',
  ])
})
