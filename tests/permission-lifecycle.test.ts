/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\permission-lifecycle.test.ts
 * @Description: 退出登录时在途权限响应失效的回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, mock, test } from 'bun:test'
import { createPinia, defineStore, setActivePinia } from 'pinia'

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => {
    resolve = done
  })
  return { promise, resolve }
}

const menus = deferred<{
  code: number
  data: Array<{ path: string }>
}>()
const buttons = deferred<{ data: Record<string, string[]> }>()
const dataPermissions = deferred<{
  data: Array<{ module: string; scope: 'all' }>
}>()

mock.module('@/api/auth', () => ({
  getAuthMode: () => 'remote',
  getAuthMenuListApi: () => menus.promise,
}))
mock.module('@/api/permission-manage', () => ({
  getAuthButtonListApi: () => buttons.promise,
  getDataPermissionApi: () => dataPermissions.promise,
}))

Object.assign(globalThis, { defineStore })
const { s_permissionStore } = await import('../src/stores/permission/index')

describe('权限请求生命周期', () => {
  test('会话清除后旧菜单和辅助权限响应不能回写', async () => {
    setActivePinia(createPinia())
    const store = s_permissionStore()
    const pendingMenu = store.getAuthMenuList()
    const pendingAuxiliary = store.initializeAuxiliaryPermissions()

    store.resetPermissions()
    menus.resolve({ code: 0, data: [{ path: '/old-account' }] })
    buttons.resolve({ data: { '/old-account': ['delete'] } })
    dataPermissions.resolve({
      data: [{ module: 'old-account', scope: 'all' }],
    })
    await Promise.all([pendingMenu, pendingAuxiliary])

    expect(store.authMenuList).toEqual([])
    expect(store.flatRoutePaths).toEqual([])
    expect(store.authButtonList).toEqual({})
    expect(store.dataPermissions).toEqual([])
  })
})
