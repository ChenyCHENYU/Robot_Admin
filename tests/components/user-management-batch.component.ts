/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\components\user-management-batch.component.ts
 * @Description: 人员管理部分成功后按服务端结果更新列表
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  NDialogProvider,
  NMessageProvider,
  useDialogReactiveList,
} from 'naive-ui'
import { expect, test, vi } from 'vitest'
import { useUserManagement } from '@/views/sys-manage/user-manage/useUserManagement'
import { deferred } from './d_deferred'

const api = vi.hoisted(() => ({
  getUserListApi: vi.fn(),
  getDeptListApi: vi.fn(),
  getUserRolesApi: vi.fn(),
  deleteUserApi: vi.fn(),
  updateUserStatusApi: vi.fn(),
  createUserApi: vi.fn(),
  updateUserApi: vi.fn(),
}))

vi.mock('@/api/user-manage', () => api)
vi.mock('@/stores/user', () => ({
  s_userStore: () => ({ token: 'session', activeContext: { id: 'company' } }),
}))

test('一条删除冲突仍等待其他写入，最后重新读取台账', async () => {
  const rows = [
    { id: 'removed', status: 1, membershipRevision: 2 },
    { id: 'conflict', status: 1, membershipRevision: 3 },
  ]
  api.getDeptListApi.mockResolvedValue({ data: [] })
  api.getUserRolesApi.mockResolvedValue({ data: [] })
  api.getUserListApi
    .mockResolvedValueOnce({ data: { list: rows, total: rows.length } })
    .mockResolvedValueOnce({ data: { list: [rows[1]], total: 1 } })
  const deletion = deferred<void>()
  api.deleteUserApi.mockImplementation((id: string) =>
    id === 'removed' ? deletion.promise : Promise.reject(new Error('版本冲突'))
  )
  let view!: ReturnType<typeof useUserManagement>
  let dialogs!: ReturnType<typeof useDialogReactiveList>
  const Page = defineComponent({
    /** 从页面公开操作发起确认，读取真实对话框回调。 */
    setup() {
      view = useUserManagement()
      dialogs = useDialogReactiveList()
      return () => null
    },
  })
  mount(
    defineComponent({
      /** 使用页面的反馈上下文。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(Page))
        ),
    })
  )
  await flushPromises()
  view.ledger.changeSelection(rows.map(row => row.id))
  view.ledger.batchActions.find(action => action.key === 'delete')?.onClick?.()
  const confirmation = dialogs.value.at(-1)!
  const result = confirmation.onPositiveClick?.(new MouseEvent('click'))
  try {
    await flushPromises()
    expect(api.deleteUserApi).toHaveBeenCalledWith('removed', 2, 'company')
    expect(api.deleteUserApi).toHaveBeenCalledWith('conflict', 3, 'company')
    expect(api.getUserListApi).toHaveBeenCalledTimes(1)
  } finally {
    deletion.resolve(undefined)
    await result
  }
  expect(api.getUserListApi).toHaveBeenCalledTimes(2)
  expect(view.ledger.rows).toEqual([rows[1]])
  expect(view.ledger.selected).toEqual([])
})
