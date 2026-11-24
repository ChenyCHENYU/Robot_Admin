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
import {
  NDialogProvider,
  NMessageProvider,
  NInput,
  useDialogReactiveList,
} from 'naive-ui'
import {
  C_Form,
  type SubmitEventPayload,
} from '@robot-admin/naive-ui-components/C_Form'
import { useDictionaryManagement } from '@/views/sys-manage/dictionary-manage/useDictionaryManagement'
import { useMenuManagement } from '@/views/sys-manage/menu-manage/useMenuManagement'
import { useRoleManagement } from '@/views/sys-manage/role-manage/useRoleManagement'
import { usePermissionManagement } from '@/views/sys-manage/permission-manage/usePermissionManagement'
import { useUserPasswordReset } from '@/views/sys-manage/user-manage/useUserPasswordReset'
import { useUserManagement } from '@/views/sys-manage/user-manage/useUserManagement'
import { C_Table } from '@robot-admin/naive-ui-components/C_Table'
import { DEFAULT_DICT_FORM_DATA } from '@/views/sys-manage/dictionary-manage/data'
import { DEFAULT_FORM_DATA } from '@/views/sys-manage/menu-manage/data'
import { MOCK_PERMISSION_RESOURCES } from '@/views/sys-manage/permission-manage/data'
import { addDictApi, deleteDictApi } from '@/api/dictionary-manage'
import { addMenuApi, deleteMenuApi, updateMenuApi } from '@/api/menu-manage'
import {
  createRoleApi,
  getRoleUsersPageApi,
  updateRoleApi,
} from '@/api/role-manage'
import type { RoleFormData } from '@/api/role-manage.contract'
import type { ResetPasswordForm, UserData } from '@/api/user-manage.contract'
import {
  getUserListApi,
  resetUserPasswordApi,
  updateUserStatusApi,
} from '@/api/user-manage'
import { deferred } from './d_deferred'
import { createDictionaryPlugin } from '@robot-admin/dictionary/vue'
import dictionaryConfig from '@/config/dictionary'

let activeCompanyId = 'company-a'
vi.mock('@/config/dataMode', () => ({ isMockDataMode: () => true }))
vi.mock('@/stores/user', () => ({
  s_userStore: () => ({
    /** 保留生产 Store 的读取语义，已创建控制器能观察切公司。 */
    get activeContext() {
      return { id: activeCompanyId }
    },
  }),
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
  activeCompanyId = 'company-a'
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
  let dialogs!: ReturnType<typeof useDialogReactiveList>
  const child = defineComponent({
    name: 'BusinessControllerHarness',
    /** 运行原有页面控制器，使用真实表单及 Naive 上下文。 */
    setup() {
      dialogs = useDialogReactiveList()
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
    }),
    { global: { plugins: [createDictionaryPlugin(dictionaryConfig)] } }
  )
  return { controller, wrapper, dialogs }
}

test('菜单与字典保存使用已校验模型，并保留领域归一化与公司上下文', async () => {
  const dictionary = mountController(useDictionaryManagement).controller
  const menu = mountController(useMenuManagement).controller
  await flushPromises()
  dictionary.editor.model.name = '未校验的新输入'
  menu.editor.model.name = '未校验的新输入'

  await dictionary.editor.config.onSubmit?.({
    model: {
      ...DEFAULT_DICT_FORM_DATA,
      name: ' 已校验字典 ',
      typeCode: 'USER_STATUS',
    },
  } as SubmitEventPayload<typeof dictionary.editor.model>)
  await menu.editor.config.onSubmit?.({
    model: { ...DEFAULT_FORM_DATA, name: ' 已校验菜单 ', path: ' /saved ' },
  } as SubmitEventPayload<typeof menu.editor.model>)
  await menu.editor.config.onSubmit?.({
    model: {
      ...DEFAULT_FORM_DATA,
      id: 'menu-a',
      revision: 9,
      name: ' 已校验菜单 ',
      path: ' /saved ',
    },
  } as SubmitEventPayload<typeof menu.editor.model>)

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
  expect(dictionary.editor.model.name).toBe('未校验的新输入')
  expect(menu.editor.model.name).toBe('未校验的新输入')
})

test('角色表单通过真实校验后只提交一次，锁定输入且提交状态不会反向禁用提交入口', async () => {
  const pending = deferred<Awaited<ReturnType<typeof createRoleApi>>>()
  vi.mocked(createRoleApi).mockReturnValueOnce(pending.promise)
  const { controller, wrapper } = mountController(useRoleManagement, role =>
    h(C_Form<RoleFormData>, {
      ref: role.formRef,
      modelValue: role.editor.model,
      options: role.editor.options,
      config: role.editor.config,
      'onUpdate:modelValue': model => Object.assign(role.editor.model, model),
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
  expect(controller.editor.config.disabled).not.toBe(true)
  expect(
    wrapper.findAllComponents(NInput).every(input => input.props('disabled'))
  ).toBe(true)
  await expect(controller.formRef.value!.submit()).resolves.toBe(false)
  pending.resolve(undefined)
  await expect(submitted).resolves.toBe(true)
  expect(createRoleApi).toHaveBeenCalledTimes(1)
  expect(controller.formRef.value!.isSubmitting).toBe(false)
})

test('旧公司打开的菜单和字典确认在切公司后均不能写入', async () => {
  const menu = mountController(useMenuManagement)
  const dictionary = mountController(useDictionaryManagement)
  try {
    await flushPromises()
    menu.controller.handleDeleteMenu({
      ...DEFAULT_FORM_DATA,
      id: 'menu-a',
      name: '菜单甲',
      revision: 2,
    })
    dictionary.controller.commands.remove({
      ...DEFAULT_DICT_FORM_DATA,
      id: 'dict-a',
      name: '字典甲',
      revision: 2,
    })
    expect(menu.dialogs.value).toHaveLength(1)
    expect(dictionary.dialogs.value).toHaveLength(1)
    activeCompanyId = 'company-b'
    const event = new MouseEvent('click')
    await menu.dialogs.value[0].onPositiveClick?.(event)
    await dictionary.dialogs.value[0].onPositiveClick?.(event)
    expect(deleteMenuApi).not.toHaveBeenCalled()
    expect(deleteDictApi).not.toHaveBeenCalled()
  } finally {
    menu.wrapper.unmount()
    dictionary.wrapper.unmount()
  }
})

test('角色内置表格保存拒绝向组件传播，失败不会被误判为保存成功', async () => {
  const { controller } = mountController(useRoleManagement)
  await flushPromises()
  vi.mocked(updateRoleApi).mockRejectedValueOnce(new Error('版本已变化'))
  await expect(
    controller.ledger.saveRow({
      ...controller.editor.model,
      id: 'role-a',
      name: '审核员',
      code: 'auditor',
      createTime: '2026-10-18',
    })
  ).rejects.toThrow('版本已变化')
})

test('角色成员弹窗换人和关闭时终止旧分页，旧结果无法覆盖新列表', async () => {
  const old = deferred<Awaited<ReturnType<typeof getRoleUsersPageApi>>>()
  const latest = deferred<Awaited<ReturnType<typeof getRoleUsersPageApi>>>()
  const hidden = deferred<Awaited<ReturnType<typeof getRoleUsersPageApi>>>()
  vi.mocked(getRoleUsersPageApi)
    .mockReturnValueOnce(old.promise)
    .mockReturnValueOnce(latest.promise)
    .mockReturnValueOnce(hidden.promise)
  const { controller, wrapper } = mountController(useRoleManagement)
  try {
    const { members } = controller
    const previous = members.open({ id: 'role-a', name: '编辑员' })
    const current = members.open({ id: 'role-b', name: '审核员' })
    latest.resolve({
      code: 0,
      msg: '',
      data: { list: [], total: 21, page: 1, pageSize: 20 },
    })
    await current
    old.resolve({
      code: 0,
      msg: '',
      data: { list: [], total: 3, page: 1, pageSize: 20 },
    })
    await previous
    expect(members.role?.id).toBe('role-b')
    expect(members.total).toBe(21)
    expect(controller.inspection.role).toBeNull()

    const paging = members.loadPage(2)
    members.visible = false
    hidden.resolve({
      code: 0,
      msg: '',
      data: { list: [], total: 18, page: 2, pageSize: 20 },
    })
    await paging
    expect(members.role).toBeNull()
    expect(members.total).toBe(21)
  } finally {
    wrapper.unmount()
  }
})

test('密码草稿关闭即清空，切公司后旧目标不能发起密码重置', async () => {
  const { controller, wrapper } = mountController(() =>
    useUserPasswordReset(
      () => activeCompanyId,
      async () => undefined
    )
  )
  try {
    controller.open({
      id: 'user-test',
      status: 1,
      revision: 8,
      membershipRevision: 3,
    })
    Object.assign(controller.panel.model, {
      newPassword: 'unit-example-key',
      confirmPassword: 'unit-example-key',
    })
    activeCompanyId = 'company-b'
    await expect(
      controller.panel.config.onSubmit?.({
        model: { ...controller.panel.model },
      } as SubmitEventPayload<ResetPasswordForm>)
    ).rejects.toThrow('当前公司已切换')
    expect(resetUserPasswordApi).not.toHaveBeenCalled()
    controller.panel.visible = false
    expect(controller.panel.model).toEqual({
      newPassword: '',
      confirmPassword: '',
    })
  } finally {
    wrapper.unmount()
  }
})

test('权限表格编辑打开领域表单并保留记录，点击编辑不会执行原行保存', async () => {
  const { controller } = mountController(usePermissionManagement)
  await flushPromises()
  const permission = { ...MOCK_PERMISSION_RESOURCES[0] }
  const { edit } = controller.resources.tableActions
  expect(typeof edit).toBe('function')
  if (typeof edit === 'function') await edit(permission)
  expect(controller.resourceEditor.visible).toBe(true)
  expect(controller.resourceEditor.mode).toBe('edit')
  expect(controller.resourceEditor.data.id).toBe(permission.id)
  expect(controller.resourceEditor.data.name).toBe(permission.name)
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
      data: users.ledger.rows,
      columns: [{ type: 'selection' }, { key: 'username', title: '账号' }],
      rowKey: users.ledger.rowKey,
      config: {
        selection: { enabled: true },
        pagination: false,
        toolbar: { show: false },
      },
      onSelectionChange: users.ledger.changeSelection,
    })
  )
  await flushPromises()
  controller.userTableRef.value!.selectRow(user.id)
  await nextTick()
  expect(controller.ledger.selected).toEqual([user.id])

  controller.ledger.batchActions[0].onClick?.()
  await nextTick()
  const confirm = [...document.body.querySelectorAll('button')].find(
    button => button.textContent?.trim() === '确认'
  )
  expect(confirm).toBeDefined()
  confirm!.click()
  await flushPromises()
  expect(updateUserStatusApi).toHaveBeenCalledWith(user.id, 0, 3, 'company-a')
  expect(controller.ledger.selected).toEqual([])
  expect(controller.userTableRef.value!.getSelectedRows()).toEqual([])
})
