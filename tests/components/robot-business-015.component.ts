/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\components\robot-business-015.component.ts
 * @Description: 业务控制器消费新版表单的提交锁、草稿快照与权限编辑回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type VNodeChild } from 'vue'
import { NDialogProvider, NMessageProvider, NInput } from 'naive-ui'
import {
  C_Form,
  type SubmitEventPayload,
} from '@robot-admin/naive-ui-components/C_Form'
import { useDictionaryManagement } from '@/views/sys-manage/dictionary-manage/useDictionaryManagement'
import { useMenuManagement } from '@/views/sys-manage/menu-manage/useMenuManagement'
import { useRoleManagement } from '@/views/sys-manage/role-manage/useRoleManagement'
import { usePermissionManagement } from '@/views/sys-manage/permission-manage/usePermissionManagement'
import { useUserManagement } from '@/views/sys-manage/user-manage/useUserManagement'
import { C_Table } from '@robot-admin/naive-ui-components/C_Table'
import { DEFAULT_DICT_FORM_DATA } from '@/views/sys-manage/dictionary-manage/data'
import { DEFAULT_FORM_DATA } from '@/views/sys-manage/menu-manage/data'
import { MOCK_PERMISSION_RESOURCES } from '@/views/sys-manage/permission-manage/data'
import { addDictApi } from '@/api/dictionary-manage'
import { addMenuApi, updateMenuApi } from '@/api/menu-manage'
import { createRoleApi, updateRoleApi } from '@/api/role-manage'
import type { RoleFormData } from '@/api/role-manage.contract'
import type { UserData } from '@/api/user-manage.contract'
import { getUserListApi, updateUserStatusApi } from '@/api/user-manage'
import { deferred } from './d_deferred'

vi.mock('@/config/dataMode', () => ({ isMockDataMode: () => true }))
vi.mock('@/stores/user', () => ({
  s_userStore: () => ({ activeContext: { id: 'company-a' } }),
}))
vi.mock('@/stores/permission', () => ({
  s_permissionStore: () => ({ requestGeneration: 1 }),
}))
vi.mock('@/router/dynamicRouter', () => ({
  clearExistingRoutes: vi.fn(),
  initDynamicRouter: vi.fn(),
}))
vi.mock('@/utils/d_refreshPermissions', () => ({
  refreshCurrentAuthorization: vi.fn(),
}))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ replace: vi.fn() }),
  useRoute: () => ({ path: '/sys/menu', fullPath: '/sys/menu' }),
}))
vi.mock('@/api/dictionary-manage', () => ({
  getDictListApi: vi.fn().mockResolvedValue({ code: 0, data: [] }),
  addDictApi: vi.fn().mockResolvedValue(undefined),
  updateDictApi: vi.fn(),
  deleteDictApi: vi.fn(),
  toggleDictStatusApi: vi.fn(),
}))
vi.mock('@/api/menu-manage', () => ({
  getMenuListApi: vi.fn().mockResolvedValue({ code: 0, data: [] }),
  getButtonPermissionsApi: vi.fn().mockResolvedValue({ code: 0, data: [] }),
  addMenuApi: vi.fn().mockResolvedValue(undefined),
  updateMenuApi: vi.fn(),
  deleteMenuApi: vi.fn(),
  moveMenuApi: vi.fn(),
  addButtonPermissionApi: vi.fn(),
  updateButtonPermissionApi: vi.fn(),
  deleteButtonPermissionApi: vi.fn(),
}))
vi.mock('@/api/role-manage', () => ({
  getRoleListApi: vi.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
  getPermissionListApi: vi.fn().mockResolvedValue({ data: [] }),
  getRoleUsersPageApi: vi.fn(),
  getRoleDataScopesApi: vi.fn(),
  getRoleTempAuthorizationsApi: vi.fn(),
  createRoleApi: vi.fn().mockResolvedValue(undefined),
  updateRoleApi: vi.fn().mockResolvedValue(undefined),
  deleteRoleApi: vi.fn(),
  updateRoleStatusApi: vi.fn(),
  updateRolePermissionsApi: vi.fn(),
}))
vi.mock('@/api/user-manage', () => ({
  getUserListApi: vi.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
  getDeptListApi: vi.fn().mockResolvedValue({ data: [] }),
  getUserRolesApi: vi.fn().mockResolvedValue({ data: [] }),
  createUserApi: vi.fn(),
  updateUserApi: vi.fn(),
  deleteUserApi: vi.fn(),
  updateUserStatusApi: vi.fn().mockResolvedValue(undefined),
  resetUserPasswordApi: vi.fn(),
}))
vi.mock('@robot-admin/request-core/naive', () => ({
  useNaiveTableCrud: () => ({
    data: ref([]),
    loading: ref(false),
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}))
vi.mock('@/api/permission-governance', () => ({
  getGovernanceCapabilitiesApi: vi.fn().mockResolvedValue({
    data: {
      dataScope: { read: false, write: false },
      fieldPermission: { read: false, write: false },
      constraint: { read: false, write: false },
      audit: { read: false, write: false },
      temporaryRoleGrant: { read: false, write: false, revoke: false },
    },
  }),
  createTempAuthorizationApi: vi.fn(),
  getDataPermissionRulesApi: vi.fn(),
  getPermissionAuditLogsPageApi: vi.fn(),
  getPermissionConstraintsApi: vi.fn(),
  getTempAuthorizationsPageApi: vi.fn(),
  revokeTempAuthorizationApi: vi.fn(),
  updateDataPermissionRuleApi: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(addDictApi).mockResolvedValue(undefined)
  vi.mocked(addMenuApi).mockResolvedValue(undefined)
  vi.mocked(createRoleApi).mockResolvedValue(undefined)
  vi.mocked(updateRoleApi).mockResolvedValue(undefined)
})

/** 在真实 Provider 和组件生命周期中运行页面控制器。 */
function mountController<T>(
  create: () => T,
  render: (controller: T) => VNodeChild = () => h('div')
) {
  let controller!: T
  const child = defineComponent({
    name: 'BusinessControllerHarness',
    /** 运行原有页面控制器，使用真实表单及 Naive 上下文。 */
    setup() {
      controller = create()
      return () => render(controller)
    },
  })
  const wrapper = mount(
    defineComponent({
      name: 'BusinessProviderHarness',
      /** Provider 与应用保持一致。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(child))
        ),
    })
  )
  return { controller, wrapper }
}

test('菜单与字典保存使用已校验模型，并保留领域归一化与公司上下文', async () => {
  const dictionary = mountController(useDictionaryManagement).controller
  const menu = mountController(useMenuManagement).controller
  await flushPromises()
  dictionary.formData.name = '未校验的新输入'
  menu.formData.name = '未校验的新输入'

  await dictionary.formConfig.value.onSubmit?.({
    model: {
      ...DEFAULT_DICT_FORM_DATA,
      name: ' 已校验字典 ',
      typeCode: 'USER_STATUS',
    },
  } as SubmitEventPayload<typeof dictionary.formData>)
  await menu.formConfig.value.onSubmit?.({
    model: { ...DEFAULT_FORM_DATA, name: ' 已校验菜单 ', path: ' /saved ' },
  } as SubmitEventPayload<typeof menu.formData>)
  await menu.formConfig.value.onSubmit?.({
    model: {
      ...DEFAULT_FORM_DATA,
      id: 'menu-a',
      revision: 9,
      name: ' 已校验菜单 ',
      path: ' /saved ',
    },
  } as SubmitEventPayload<typeof menu.formData>)

  expect(addDictApi).toHaveBeenCalledWith(
    expect.objectContaining({ name: '已校验字典', code: 'USER_STATUS' })
  )
  expect(addMenuApi).toHaveBeenCalledWith(
    expect.objectContaining({ name: '已校验菜单', path: '/saved' })
  )
  expect(updateMenuApi).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'menu-a', revision: 9, name: '已校验菜单' }),
    'company-a'
  )
  expect(dictionary.formData.name).toBe('未校验的新输入')
  expect(menu.formData.name).toBe('未校验的新输入')
})

test('角色表单通过真实校验后只提交一次，锁定输入且提交状态不会反向禁用提交入口', async () => {
  const pending = deferred<Awaited<ReturnType<typeof createRoleApi>>>()
  vi.mocked(createRoleApi).mockReturnValueOnce(pending.promise)
  const { controller, wrapper } = mountController(useRoleManagement, role =>
    h(C_Form<RoleFormData>, {
      ref: role.formRef,
      modelValue: role.formData,
      options: role.formOptions.value,
      config: role.formConfig.value,
      'onUpdate:modelValue': model => Object.assign(role.formData, model),
    })
  )
  await flushPromises()
  controller.formRef.value?.setFields({
    name: '业务审核员',
    code: 'business_auditor',
    type: 'custom',
    sort: 1,
  })
  await nextTick()

  const submitted = controller.formRef.value!.submit()
  await flushPromises()
  expect(createRoleApi).toHaveBeenCalledTimes(1)
  expect(controller.formRef.value!.isSubmitting).toBe(true)
  expect(controller.formConfig.value.disabled).not.toBe(true)
  expect(
    wrapper.findAllComponents(NInput).every(input => input.props('disabled'))
  ).toBe(true)
  await expect(controller.formRef.value!.submit()).resolves.toBe(false)
  pending.resolve(undefined)
  await expect(submitted).resolves.toBe(true)
  expect(createRoleApi).toHaveBeenCalledTimes(1)
  expect(controller.formRef.value!.isSubmitting).toBe(false)
})

test('角色内置表格保存拒绝向组件传播，失败不会被误判为保存成功', async () => {
  const { controller } = mountController(useRoleManagement)
  await flushPromises()
  vi.mocked(updateRoleApi).mockRejectedValueOnce(new Error('版本已变化'))
  await expect(
    controller.handleTableSave({
      ...controller.formData,
      id: 'role-a',
      name: '审核员',
      code: 'auditor',
      createTime: '2026-10-18',
    })
  ).rejects.toThrow('版本已变化')
})

test('权限表格编辑打开领域表单并保留记录，点击编辑不会执行原行保存', async () => {
  const { controller } = mountController(usePermissionManagement)
  await flushPromises()
  const permission = { ...MOCK_PERMISSION_RESOURCES[0] }
  const { edit } = controller.tableActions.value
  expect(typeof edit).toBe('function')
  if (typeof edit === 'function') await edit(permission)
  expect(controller.showModal.value).toBe(true)
  expect(controller.modalMode.value).toBe('edit')
  expect(controller.formData.id).toBe(permission.id)
  expect(controller.formData.name).toBe(permission.name)
  expect(permission).toEqual(MOCK_PERMISSION_RESOURCES[0])
})

test('用户批量操作成功后清空表格真实勾选，列表刷新不会恢复旧选择', async () => {
  const user: UserData = {
    id: 'user-a',
    username: 'staff',
    nickname: '员工',
    userType: 'internal',
    status: 1,
    membershipRevision: 3,
    createTime: '2026-10-18',
  }
  vi.mocked(getUserListApi).mockResolvedValue({
    code: 0,
    msg: '成功',
    data: { list: [user], total: 1, page: 1, pageSize: 20 },
  })
  const { controller } = mountController(useUserManagement, users =>
    h(C_Table<UserData>, {
      ref: users.userTableRef,
      data: users.userList,
      columns: [{ type: 'selection' }, { key: 'username', title: '账号' }],
      rowKey: users.rowKey,
      config: {
        selection: { enabled: true },
        pagination: false,
        toolbar: { show: false },
      },
      onSelectionChange: users.handleSelectionChange,
    })
  )
  await flushPromises()
  controller.userTableRef.value!.selectRow(user.id)
  await nextTick()
  expect(controller.selectedUsers.value).toEqual([user.id])

  controller.batchActions.value[0].onClick?.()
  await nextTick()
  const confirm = [...document.body.querySelectorAll('button')].find(
    button => button.textContent?.trim() === '确认'
  )
  expect(confirm).toBeDefined()
  confirm!.click()
  await flushPromises()
  expect(updateUserStatusApi).toHaveBeenCalledWith(user.id, 0, 3, 'company-a')
  expect(controller.selectedUsers.value).toEqual([])
  expect(controller.userTableRef.value!.getSelectedRows()).toEqual([])
})
