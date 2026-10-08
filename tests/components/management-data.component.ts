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
  await updateMenuApi({ ...menu, id: 'menu-a' })
  expect(putData).toHaveBeenLastCalledWith(
    '/sys/menus/menu-a',
    expect.objectContaining({ id: 'menu-a' })
  )
  await moveMenuApi('menu-a', 'menu-b', 'before')
  expect(putData).toHaveBeenLastCalledWith('/sys/menus/menu-a/move', {
    targetId: 'menu-b',
    position: 'before',
  })
  await deleteMenuApi('menu-a')
  expect(deleteData).toHaveBeenLastCalledWith('/sys/menus/menu-a')
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
  await updateDictApi({ ...dictionary, id: 'dict-a' })
  expect(putData).toHaveBeenLastCalledWith(
    '/sys/dictionaries/dict-a',
    expect.objectContaining({ id: 'dict-a' })
  )
  await toggleDictStatusApi('dict-a', 0)
  expect(putData).toHaveBeenLastCalledWith('/sys/dictionaries/dict-a/status', {
    status: 0,
  })
  await deleteDictApi('dict-a')
  expect(deleteData).toHaveBeenLastCalledWith('/sys/dictionaries/dict-a')
})

test('远端业务拒绝必须抛错，非法状态不发送请求', async () => {
  vi.mocked(postData).mockResolvedValue({ code: 403, msg: '禁止保存' })
  await expect(addMenuApi(DEFAULT_MENU_FORM_DATA)).rejects.toThrow('禁止保存')
  await expect(addDictApi(dictionary)).rejects.toThrow('禁止保存')
  await expect(toggleDictStatusApi('dict-a', 2)).rejects.toThrow('字典状态无效')
  expect(putData).not.toHaveBeenCalled()
})
