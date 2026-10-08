/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\user-api.test.ts
 * @Description: 用户适配器快照、独立变更、公司归属与列表刷新回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { reactive } from 'vue'
import {
  createUserApi,
  updateUserApi,
  updateUserStatusApi,
  deleteUserApi,
  getUserListApi,
} from '../src/api/user-manage'
import {
  MOCK_USER_DATA,
  parseMockUsersCache,
} from '../src/api/user-manage.mock'
import {
  getMockDirectoryUser,
  getMockAuthContexts,
} from '../src/api/auth.mock-directory'
import type { UserFormData } from '../src/api/user-manage.contract'

test('用户 CRUD 不依赖页面，草稿和查询快照隔离，状态与登录公司目录同步', async () => {
  const original = structuredClone(MOCK_USER_DATA)
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const storage = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  })
  try {
    const draft = reactive<UserFormData>({
      username: 'api_test_user',
      nickname: '原始草稿',
      email: '',
      phone: '',
      userType: 'internal',
      deptId: 'dept_1',
      roleIds: ['role_1'],
      password: 'test-only',
      status: 1,
      remark: '',
      companyName: '',
      contactPerson: '',
      memberships: [
        { contextId: 'jinheng-nanjing', isPrimary: true, roleId: 'auditor' },
      ],
    })
    const pending = createUserApi(draft)
    draft.nickname = '尚未保存'
    draft.roleIds.length = 0
    await pending
    const query = {
      keyword: draft.username,
      page: 1,
      pageSize: 20,
      contextId: 'jinheng-nanjing',
    }
    const row = (await getUserListApi(query)).data.list[0]!
    expect(row.nickname).toBe('原始草稿')
    expect(row.roleIds).toEqual(['role_1'])
    expect(getMockAuthContexts(draft.username)).toHaveLength(1)
    row.nickname = '未提交行编辑'
    expect((await getUserListApi(query)).data.list[0]!.nickname).toBe(
      '原始草稿'
    )
    await expect(createUserApi(draft)).rejects.toThrow('用户名已存在')
    await updateUserApi(row.id, { ...draft, id: row.id, nickname: '已保存' })
    await updateUserStatusApi(row.id, 0)
    expect((await getUserListApi(query)).data.list[0]).toMatchObject({
      nickname: '已保存',
      status: 0,
    })
    expect(getMockDirectoryUser(draft.username)?.enabled).toBe(false)
    expect(getMockAuthContexts(draft.username)).toEqual([])
    expect(
      (await getUserListApi({ ...query, contextId: 'tianzhi-xian' })).data.total
    ).toBe(0)
    await deleteUserApi(row.id)
    expect((await getUserListApi(query)).data.total).toBe(0)
    expect(getMockDirectoryUser(draft.username)).toBeNull()
    const controller = new AbortController()
    controller.abort()
    await expect(
      getUserListApi(query, controller.signal)
    ).rejects.toMatchObject({ name: 'AbortError' })
  } finally {
    MOCK_USER_DATA.splice(0, MOCK_USER_DATA.length, ...original)
    if (descriptor)
      Object.defineProperty(globalThis, 'localStorage', descriptor)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
}, 10_000)

test('损坏用户缓存整批拒绝，合法字段与角色数组可恢复', () => {
  const sample = structuredClone(MOCK_USER_DATA[0]!)
  expect(parseMockUsersCache(JSON.stringify([sample]))).toEqual([sample])
  for (const patch of [
    { nickname: undefined },
    { createTime: undefined },
    { userType: 'unknown' },
    { status: true },
    { status: 2 },
    { email: 8 },
    { roleIds: [false] },
    { username: '' },
    { roleNames: '管理员' },
  ]) {
    expect(
      parseMockUsersCache(
        JSON.stringify([
          sample,
          { ...sample, id: 'other', username: 'other', ...patch },
        ])
      )
    ).toBeNull()
  }
  expect(parseMockUsersCache(JSON.stringify([sample, sample]))).toBeNull()
  expect(parseMockUsersCache('broken')).toBeNull()
})

test('缺少公司目录的用户不能静默更新状态，失败保持原数据', async () => {
  const orphan = {
    ...structuredClone(MOCK_USER_DATA[0]!),
    id: 'orphan',
    username: 'orphan_cache_user',
    status: 1,
  }
  MOCK_USER_DATA.push(orphan)
  try {
    await expect(updateUserStatusApi(orphan.id, 0)).rejects.toThrow(
      '用户公司归属缺失'
    )
    expect(orphan.status).toBe(1)
    expect(orphan.updateTime).toBe(MOCK_USER_DATA[0]!.updateTime)
  } finally {
    MOCK_USER_DATA.splice(MOCK_USER_DATA.indexOf(orphan), 1)
  }
})
