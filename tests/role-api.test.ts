/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\role-api.test.ts
 * @Description: 角色适配器的数据隔离、草稿快照、重复校验与刷新回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { reactive } from 'vue'
import {
  createRoleApi,
  deleteRoleApi,
  getRoleListApi,
  updateRoleApi,
  updateRolePermissionsApi,
} from '../src/api/role-manage'
import { MOCK_ROLE_DATA } from '../src/api/role-manage.mock'
import type { RoleFormData } from '../src/api/role-manage.contract'

test('演示角色 CRUD 独立于页面，草稿与列表不得提前改写共享数据', async () => {
  const original = structuredClone(MOCK_ROLE_DATA)
  try {
    const query = { page: 1, pageSize: 1000, keyword: 'audit_test_role' }
    const draft = reactive<RoleFormData>({
      name: '审查回归角色',
      code: 'audit_test_role',
      type: 'custom',
      status: 1,
      description: '',
      permissionIds: [],
      sort: 0,
      remark: '',
    })
    const pending = createRoleApi(draft)
    draft.name = '未提交的新草稿'
    await pending
    const first = (await getRoleListApi(query)).data.list[0]!
    expect(first.name).toBe('审查回归角色')
    first.name = '未保存列表编辑'
    expect((await getRoleListApi(query)).data.list[0]!.name).toBe(
      '审查回归角色'
    )
    await expect(createRoleApi(draft)).rejects.toThrow('角色编码已存在')
    expect((await getRoleListApi(query)).data.total).toBe(1)
    await updateRoleApi(first.id, { name: '已保存名称', status: 0 })
    await updateRolePermissionsApi(first.id, ['perm_3_1'])
    const updated = (await getRoleListApi(query)).data.list[0]!
    expect(updated.name).toBe('已保存名称')
    expect(updated.status).toBe(0)
    expect(updated.permissionIds).toEqual(['perm_3_1'])
    expect(updated.permissionNames?.length).toBe(1)
    await deleteRoleApi(first.id)
    expect((await getRoleListApi(query)).data.total).toBe(0)
  } finally {
    MOCK_ROLE_DATA.splice(0, MOCK_ROLE_DATA.length, ...original)
  }
}, 10_000)
