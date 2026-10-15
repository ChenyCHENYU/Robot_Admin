/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\components\management-data.component.ts
 * @Description: 挂载请求消费方，验证远端边界、取消与菜单字典写入快照
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, onBeforeUnmount, ref } from 'vue'
import {
  getData,
  postData,
  putData,
  deleteData,
} from '@robot-admin/request-core/axios'
import {
  getMenuListApi,
  addMenuApi,
  updateMenuApi,
  moveMenuApi,
  deleteMenuApi,
  addButtonPermissionApi,
} from '@/api/menu-manage'
import {
  getDictListApi,
  addDictApi,
  updateDictApi,
  deleteDictApi,
  toggleDictStatusApi,
} from '@/api/dictionary-manage'
import { DEFAULT_MENU_FORM_DATA } from '@/api/d_menu'
import type { DictFormData } from '@/api/dictionary-manage.contract'
import { deferred } from './d_deferred'
import { updateUserApi } from '@/api/user-manage'
import { getRoleUsersPageApi } from '@/api/role-manage'
import {
  createTempAuthorizationApi,
  revokeTempAuthorizationApi,
  getTempAuthorizationsPageApi,
  getPermissionAuditLogsPageApi,
  getGovernanceCapabilitiesApi,
  getDataPermissionRulesApi,
  updateDataPermissionRuleApi,
} from '@/api/permission-governance'
import { DEFAULT_USER_FORM_DATA } from '@/views/sys-manage/user-manage/data'
import {
  updateAccountProfileApi,
  updateAccountSecuritySettingApi,
  getAccountProfileApi,
} from '@/api/account'
import { EMPTY_PROFILE } from '@/views/account/profile/data'

vi.mock('@/config/dataMode', () => ({ isMockDataMode: () => false }))
vi.mock('@robot-admin/request-core/axios', () => ({
  getData: vi.fn(),
  postData: vi.fn(),
  putData: vi.fn(),
  deleteData: vi.fn(),
}))
beforeEach(() => {
  vi.mocked(postData).mockResolvedValue({ code: 0 })
  vi.mocked(putData).mockResolvedValue({ code: 0 })
  vi.mocked(deleteData).mockResolvedValue({ code: 0 })
})
const dictionary: DictFormData = {
  type: 'type',
  name: '用户状态',
  typeCode: 'USER_STATUS',
  dictValue: '',
  dictLabel: '',
  value: '',
  code: '',
  sort: 1,
  status: 1,
  remark: '',
  parentId: null,
}
const createHarness = (
  load: (signal?: AbortSignal) => Promise<{ data: { name: string }[] }>
) =>
  defineComponent({
    name: 'ManagementDataHarness',
    /** 挂载真实响应式消费方，保持生命周期和模板事件。 */
    setup() {
      const names = ref<string[]>([])
      const error = ref('')
      const controller = new AbortController()
      void load(controller.signal)
        .then(result => {
          if (!controller.signal.aborted)
            names.value = result.data.map(row => row.name)
        })
        .catch(reason => {
          if (!controller.signal.aborted) error.value = String(reason)
        })
      onBeforeUnmount(() => controller.abort())
      return () =>
        h('div', [
          h('p', { role: 'alert' }, error.value),
          ...names.value.map(name => h('span', name)),
        ])
    },
  })

test.each([
  [getMenuListApi, '/sys/menus'],
  [getDictListApi, '/sys/dictionaries'],
] as const)(
  '远端列表 %s 原样呈现并携带取消信号，卸载终止消费',
  async (load, path) => {
    vi.mocked(getData).mockResolvedValue({
      code: 0,
      data: [{ name: '真实目录' }],
    })
    const wrapper = mount(createHarness(load))
    await flushPromises()
    expect(wrapper.text()).toContain('真实目录')
    const signal = vi.mocked(getData).mock.calls.at(-1)?.[1]?.signal
    expect(getData).toHaveBeenLastCalledWith(path, { signal })
    expect(signal?.aborted).toBe(false)
    wrapper.unmount()
    expect(signal?.aborted).toBe(true)
  }
)

test.each([getMenuListApi, getDictListApi])(
  '远端加载 %s 失败不静默回填演示目录',
  async load => {
    vi.mocked(getData).mockRejectedValue(new Error('服务不可用'))
    const wrapper = mount(createHarness(load))
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('服务不可用')
    expect(wrapper.findAll('span')).toHaveLength(0)
    expect(getData).toHaveBeenCalledTimes(1)
  }
)

test('远端菜单、按钮与字典提交保留草稿快照及原有接口路径', async () => {
  const pending = deferred<unknown>()
  vi.mocked(postData).mockReturnValueOnce(pending.promise)
  const menu = {
    ...DEFAULT_MENU_FORM_DATA,
    name: '原始菜单',
    path: '/original',
  }
  const save = addMenuApi(menu)
  menu.name = '未保存输入'
  expect(postData).toHaveBeenLastCalledWith(
    '/sys/menus',
    expect.objectContaining({ name: '原始菜单' })
  )
  pending.resolve({ code: 0 })
  await save
  await updateMenuApi({ ...menu, id: 'menu-a', revision: 3 })
  expect(putData).toHaveBeenLastCalledWith(
    '/sys/menus/menu-a',
    expect.objectContaining({ id: 'menu-a' })
  )
  await moveMenuApi('menu-a', 'menu-b', 'before', 4)
  expect(putData).toHaveBeenLastCalledWith('/sys/menus/menu-a/move', {
    targetId: 'menu-b',
    position: 'before',
    revision: 4,
  })
  await deleteMenuApi('menu-a', 5)
  expect(deleteData).toHaveBeenLastCalledWith('/sys/menus/menu-a', {
    params: { expectedRevision: 5 },
  })
  await addButtonPermissionApi({
    menuId: 'menu-a',
    name: '编辑',
    permission: 'sys:edit',
  })
  expect(postData).toHaveBeenLastCalledWith(
    '/sys/menus/menu-a/buttons',
    expect.objectContaining({ permission: 'sys:edit' })
  )
  await addDictApi(dictionary)
  expect(postData).toHaveBeenLastCalledWith(
    '/sys/dictionaries',
    expect.objectContaining({ code: 'USER_STATUS' })
  )
  await updateDictApi({ ...dictionary, id: 'dict-a', revision: 6 })
  expect(putData).toHaveBeenLastCalledWith(
    '/sys/dictionaries/dict-a',
    expect.objectContaining({ id: 'dict-a' })
  )
  await toggleDictStatusApi('dict-a', 0, 7)
  expect(putData).toHaveBeenLastCalledWith('/sys/dictionaries/dict-a/status', {
    status: 0,
    revision: 7,
  })
  await deleteDictApi('dict-a', 8)
  expect(deleteData).toHaveBeenLastCalledWith('/sys/dictionaries/dict-a', {
    params: { expectedRevision: 8 },
  })
})

test('远端业务拒绝必须抛错，非法状态不发送请求', async () => {
  vi.mocked(postData).mockResolvedValue({ code: 403, msg: '禁止保存' })
  await expect(addMenuApi(DEFAULT_MENU_FORM_DATA)).rejects.toThrow('禁止保存')
  await expect(addDictApi(dictionary)).rejects.toThrow('禁止保存')
  await expect(toggleDictStatusApi('dict-a', 2, 7)).rejects.toThrow(
    '字典状态无效'
  )
  expect(putData).not.toHaveBeenCalled()
})

test('缺少客户端资源版本不会发出写请求，也不请求最新版', async () => {
  await expect(deleteMenuApi('menu-a')).rejects.toThrow('资源版本缺失')
  await expect(moveMenuApi('menu-a', 'menu-b', 'before')).rejects.toThrow(
    '资源版本缺失'
  )
  await expect(deleteDictApi('dict-a')).rejects.toThrow('资源版本缺失')
  expect(deleteData).not.toHaveBeenCalled()
  expect(putData).not.toHaveBeenCalled()
  expect(getData).not.toHaveBeenCalled()
})

test('远端成员资料显式清空和账号/成员版本均传入，不发送演示公司数据', async () => {
  await updateUserApi('user-a', {
    ...DEFAULT_USER_FORM_DATA,
    username: 'member-a',
    nickname: '成员A',
    deptId: null,
    email: '',
    phone: '',
    revision: 3,
    membershipRevision: 7,
  })
  expect(putData).toHaveBeenLastCalledWith(
    '/sys/users/user-a',
    expect.objectContaining({
      email: null,
      phone: null,
      departmentId: null,
      revision: 3,
      membershipRevision: 7,
    })
  )
  expect(vi.mocked(putData).mock.calls.at(-1)?.[1]).not.toHaveProperty(
    'memberships'
  )
})

test('临时授权按用户授现有角色，创建和精确撤回发送冻结合同', async () => {
  const request = {
    userId: 'member-a',
    roleId: 'role-a',
    effectFrom: '2030-01-01 10:00:00',
    effectTo: '2030-01-01 11:00:00',
    reason: '临时值班',
  }
  await createTempAuthorizationApi(request)
  expect(postData).toHaveBeenLastCalledWith('/sys/temp-authorizations', request)
  await revokeTempAuthorizationApi('grant-a', 4)
  expect(putData).toHaveBeenLastCalledWith(
    '/sys/temp-authorizations/grant-a/revoke',
    { expectedRevision: 4 }
  )
  await expect(revokeTempAuthorizationApi('grant-a')).rejects.toThrow(
    '资源版本缺失'
  )
})

test('角色成员启停映射与临时/审计分页保留真实total，不在内存假装完整清单', async () => {
  vi.mocked(getData).mockResolvedValueOnce({
    code: 0,
    data: {
      list: [
        {
          id: 'user-a',
          username: 'member-a',
          name: '成员A',
          status: 'disabled',
        },
      ],
      total: 250,
      page: 2,
      pageSize: 20,
    },
  })
  const users = await getRoleUsersPageApi('role-a', { page: 2, pageSize: 20 })
  expect(users.data).toMatchObject({
    total: 250,
    list: [{ nickname: '成员A', status: 0 }],
  })
  expect(getData).toHaveBeenLastCalledWith('/sys/roles/role-a/users/page', {
    params: { page: 2, pageSize: 20 },
    signal: undefined,
  })
  vi.mocked(getData).mockResolvedValueOnce({
    code: 0,
    data: { list: [], total: 500, page: 3, pageSize: 20 },
  })
  expect(
    (await getTempAuthorizationsPageApi({ page: 3, pageSize: 20 })).data.total
  ).toBe(500)
  vi.mocked(getData).mockResolvedValueOnce({
    code: 0,
    data: {
      list: [
        {
          id: 'audit-a',
          actorUserNo: 'actor-a',
          action: 'temp_authorize',
          target: 'grant-a',
          detail: '{}',
          createDateTime: '2030-01-01 10:00:00',
        },
      ],
      total: 1200,
      page: 2,
      pageSize: 20,
    },
  })
  const audits = await getPermissionAuditLogsPageApi({
    page: 2,
    pageSize: 20,
    action: 'temp_authorize',
  })
  expect(audits.data).toMatchObject({
    total: 1200,
    list: [
      {
        actionRaw: 'temp_authorize',
        targetName: 'grant-a',
        operatorName: 'actor-a',
      },
    ],
  })
})

test('本人资料仅发送支持字段，联系方式null/空串清空，省略保留', async () => {
  await updateAccountProfileApi({ nickname: '本人', email: null, phone: '' })
  expect(putData).toHaveBeenLastCalledWith(
    '/account/profile',
    { nickname: '本人', email: null, phone: null },
    { signal: undefined }
  )
  await updateAccountProfileApi({ nickname: '只改昵称' })
  expect(putData).toHaveBeenLastCalledWith(
    '/account/profile',
    { nickname: '只改昵称' },
    { signal: undefined }
  )
  vi.mocked(getData).mockResolvedValue({
    code: 0,
    data: { ...EMPTY_PROFILE, email: null, phone: null },
  })
  expect((await getAccountProfileApi(EMPTY_PROFILE)).data).toMatchObject({
    email: '',
    phone: '',
  })
})

test('Remote头像简介和安全开关未实现时明确拒绝，不发不存在的PUT', async () => {
  await expect(
    updateAccountProfileApi({ bio: '不能假装已保存' })
  ).rejects.toThrow('仅支持昵称')
  await expect(
    updateAccountProfileApi({ avatar: 'https://example.com/avatar.png' })
  ).rejects.toThrow('仅支持昵称')
  await expect(
    updateAccountSecuritySettingApi('two-factor', true)
  ).rejects.toThrow('安全配置只读')
  expect(putData).not.toHaveBeenCalled()
})

test('Remote治理能力保留字段读写均未接入，范围摘要不伪装为字段模型', async () => {
  const capabilities = {
    dataScope: { read: true, write: false },
    fieldPermission: { read: false, write: false },
    constraint: { read: true, write: false },
    audit: { read: true, write: false },
    temporaryRoleGrant: { read: true, write: true, revoke: true },
  }
  vi.mocked(getData).mockResolvedValueOnce({ code: 0, data: capabilities })
  expect((await getGovernanceCapabilitiesApi()).data).toEqual(capabilities)
  expect(getData).toHaveBeenLastCalledWith('/sys/governance-capabilities', {
    signal: undefined,
  })
  vi.mocked(getData).mockResolvedValueOnce({
    code: 0,
    data: [{ module: '*', scope: 'self', customDepartments: [] }],
  })
  const response = await getDataPermissionRulesApi()
  expect(response.data[0]).toMatchObject({
    scope: 'self',
    fieldPermissions: [],
  })
  expect(getData).toHaveBeenLastCalledWith('/sys/data-permissions', {
    signal: undefined,
  })
  await expect(
    updateDataPermissionRuleApi(response.data[0].id, response.data[0])
  ).rejects.toThrow('尚不支持范围或字段规则保存')
  expect(putData).not.toHaveBeenCalled()
  expect(postData).not.toHaveBeenCalled()
})
