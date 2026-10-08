/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\tests\menu-management.test.ts
 * @Description: 菜单父级约束、检索上下文与页面缓存身份回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { DEFAULT_FORM_DATA } from '../src/views/sys-manage/menu-manage/data'
import { validateMenuDraft } from '../src/api/d_menu'

import { describe, expect, test } from 'bun:test'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { bindCachedRouteComponent } from '../src/utils/d_routeComponent'
import {
  applyMockMenuCachePolicy,
  getMockMenuCachePolicy,
  setMockMenuCachePolicy,
} from '../src/api/menu-cache.mock'
import {
  filterMenus,
  getParentOptions,
} from '../src/views/sys-manage/menu-manage/d_menuTree'
import type { MenuFormData, MenuData } from '../src/api/menu-manage.contract'

const page: MenuData = {
  id: 'page-a',
  name: '用户列表',
  type: 'menu',
  parentId: 'directory-b',
  path: 'users',
  component: '/users/index',
  sort: 1,
  status: 1,
  hidden: 0,
  keepAlive: false,
}
const child: MenuData = {
  id: 'directory-b',
  name: '二级目录',
  type: 'directory',
  parentId: 'directory-a',
  path: 'manage',
  sort: 1,
  status: 1,
  hidden: 0,
  keepAlive: false,
  children: [page],
}
const root: MenuData = {
  id: 'directory-a',
  name: '系统管理',
  type: 'directory',
  parentId: null,
  path: '/sys',
  sort: 1,
  status: 1,
  hidden: 0,
  keepAlive: false,
  children: [child],
}
const draft: MenuFormData = {
  ...page,
  path: page.path!,
  component: page.component!,
  icon: '',
  permission: '',
  remark: '',
}

describe('menu management contracts', () => {
  test('搜索页面路径保留祖先，目录命中保留下级，空白关键词恢复整棵树', () => {
    expect(filterMenus([root], 'users')[0].children?.[0].children?.[0].id).toBe(
      page.id
    )
    expect(
      filterMenus([root], '系统管理')[0].children?.[0].children
    ).toHaveLength(1)
    expect(filterMenus([root], 'not-found')).toHaveLength(0)
    expect(filterMenus([root], '   ')).toEqual([root])
  })
  test('排除自身和后代，目录不能挂到页面，按钮只能属于页面', () => {
    const directoryDraft = {
      ...draft,
      id: root.id,
      type: 'directory' as const,
      parentId: null,
      path: '/sys',
    }
    expect(getParentOptions([root], directoryDraft)).toHaveLength(0)
    expect(
      validateMenuDraft({ ...directoryDraft, parentId: child.id }, [root])
        .parentId
    ).toBeDefined()
    expect(
      validateMenuDraft({ ...directoryDraft, parentId: page.id }, [root])
        .parentId
    ).toBeDefined()
    expect(
      validateMenuDraft(
        { ...draft, id: undefined, type: 'button', parentId: root.id },
        [root]
      ).parentId
    ).toBeDefined()
    expect(
      validateMenuDraft(
        {
          ...draft,
          id: undefined,
          type: 'button',
          parentId: page.id,
          permission: 'sys:user:edit',
        },
        [root]
      ).parentId
    ).toBeUndefined()
  })
  test('拒绝重复路径、非法组件路径和重复权限，不影响编辑自己的值', () => {
    expect(validateMenuDraft(draft, [root])).toEqual({})
    expect(
      validateMenuDraft({ ...draft, id: undefined }, [root]).path
    ).toBeDefined()
    expect(
      validateMenuDraft({ ...draft, component: '../../other' }, [root])
        .component
    ).toBeDefined()
    const button = {
      ...draft,
      id: 'button-a',
      type: 'button' as const,
      parentId: page.id,
      permission: 'sys:user:edit',
    }
    const permissions = [
      {
        id: 'button-a',
        menuId: page.id,
        name: '编辑',
        permission: 'sys:user:edit',
      },
    ]
    expect(validateMenuDraft(button, [root], permissions)).toEqual({})
    expect(
      validateMenuDraft({ ...button, id: 'button-b' }, [root], permissions)
        .permission
    ).toBeDefined()
  })
  test('缓存策略按公司隔离，不修改原始权限路由或丢失其 metadata', () => {
    const contextId = `test-company-${crypto.randomUUID()}`
    const routes = [
      {
        path: '/home',
        name: 'home',
        component: '/home/index',
        meta: { title: '首页', keepAlive: false, affix: true },
      },
    ]
    setMockMenuCachePolicy(contextId, 'home', true)
    expect(applyMockMenuCachePolicy(routes, contextId)[0].meta).toEqual({
      title: '首页',
      keepAlive: true,
      affix: true,
    })
    expect(
      applyMockMenuCachePolicy(routes, `${contextId}-other`)[0].meta?.keepAlive
    ).toBe(false)
    expect(routes[0].meta.keepAlive).toBe(false)
    setMockMenuCachePolicy(contextId, 'home', false)
    expect(getMockMenuCachePolicy(contextId).home).toBe(false)
  })
  test('懒加载失败可重试，缓存组件身份稳定，原页面命名不被覆盖', async () => {
    let calls = 0
    const original = defineComponent({
      name: 'OriginalPage',
      props: ['id'],
      setup:
        (props, { slots }) =>
        () =>
          h('div', [String(props.id), slots.default?.()]),
    })
    const loader = bindCachedRouteComponent('sys-menu-manage', async () => {
      if (++calls === 1) throw new Error('网络中断')
      return { default: original }
    })
    await expect(loader()).rejects.toThrow('网络中断')
    const bound = await loader()
    expect(bound).toBe(await loader())
    expect(bound.name).toBe('sys-menu-manage')
    expect(original.name).toBe('OriginalPage')
    expect(calls).toBe(2)
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(bound, { id: '42' }, { default: () => h('span', 'slot') }),
      })
    )
    expect(html).toContain('42')
    expect(html).toContain('<span>slot</span>')
  })
})

describe('menu CRUD and cache metadata', () => {
  test('路由转换保留页面缓存，目录不会被错误标记为可缓存页面', async () => {
    const { createMenuFromRoute } = await import('../src/api/menu-manage.mock')
    const route = {
      path: '/demo',
      name: 'demo',
      component: '/demo/index',
      meta: { title: '演示', keepAlive: true },
    }
    expect(createMenuFromRoute(route)?.keepAlive).toBe(true)
    expect(
      createMenuFromRoute({ ...route, component: 'layout', children: [route] })
        ?.keepAlive
    ).toBe(false)
  })
  test('更换上级实际移动节点，非法拖拽不会先移除节点，缓存策略不串公司', async () => {
    const api = await import('../src/api/menu-manage')
    const { flattenMenus } = await import('../src/api/d_menu')
    const suffix = crypto.randomUUID()
    const first = {
      ...draft,
      id: undefined,
      name: `test-a-${suffix}`,
      type: 'directory' as const,
      parentId: null,
      path: `/test-a-${suffix}`,
    }
    const second = {
      ...first,
      name: `test-b-${suffix}`,
      path: `/test-b-${suffix}`,
    }
    await api.addMenuApi(first)
    await api.addMenuApi(second)
    let menus = (await api.getMenuListApi()).data
    const firstNode = menus.find(menu => menu.name === first.name)!
    const secondNode = menus.find(menu => menu.name === second.name)!
    try {
      await api.addMenuApi({
        ...draft,
        id: undefined,
        name: `test-page-${suffix}`,
        parentId: firstNode.id,
        keepAlive: false,
      })
      menus = (await api.getMenuListApi()).data
      const targetPage = flattenMenus(menus).find(
        menu => menu.name === `test-page-${suffix}`
      )!
      await expect(
        api.moveMenuApi(firstNode.id, targetPage.id, 'inside')
      ).rejects.toThrow()
      expect(
        (await api.getMenuListApi()).data.some(menu => menu.id === firstNode.id)
      ).toBe(true)
      const contextId = `company-${suffix}`
      await api.updateMenuApi(
        {
          ...draft,
          id: targetPage.id,
          name: targetPage.name,
          parentId: secondNode.id,
          keepAlive: true,
        },
        contextId
      )
      menus = (await api.getMenuListApi(undefined, contextId)).data
      expect(
        menus.find(menu => menu.id === firstNode.id)?.children
      ).toHaveLength(0)
      expect(
        menus.find(menu => menu.id === secondNode.id)?.children?.[0].id
      ).toBe(targetPage.id)
      expect(
        menus.find(menu => menu.id === secondNode.id)?.children?.[0].keepAlive
      ).toBe(true)
      const otherCompany = (
        await api.getMenuListApi(undefined, `${contextId}-other`)
      ).data
      expect(
        otherCompany.find(menu => menu.id === secondNode.id)?.children?.[0]
          .keepAlive
      ).toBe(false)
    } finally {
      await api.deleteMenuApi(firstNode.id)
      await api.deleteMenuApi(secondNode.id)
    }
  })
  test('业务接口拒绝不能误报保存成功，空响应和成功码正常通过', async () => {
    const { checkMenuMutation } = await import('../src/api/menu-manage')
    await expect(
      checkMenuMutation(Promise.resolve({ code: 403, msg: '没有编辑权限' }))
    ).rejects.toThrow('没有编辑权限')
    await checkMenuMutation(Promise.resolve(undefined))
    await checkMenuMutation(Promise.resolve({ code: '200' }))
  })
})

test('菜单保存使用调用时的草稿快照，列表修改不会污染下一次读取', async () => {
  const api = await import('../src/api/menu-manage')
  const suffix = crypto.randomUUID()
  const form = {
    ...DEFAULT_FORM_DATA,
    type: 'directory' as const,
    name: `快照-${suffix}`,
    path: `/snapshot-${suffix}`,
  }
  const expectedName = form.name
  const pending = api.addMenuApi(form)
  form.name = '保存期间继续输入'
  await pending
  const row = (await api.getMenuListApi()).data.find(
    menu => menu.path === form.path
  )!
  try {
    expect(row.name).toBe(expectedName)
    row.name = '未保存的列表编辑'
    expect(
      (await api.getMenuListApi()).data.find(menu => menu.id === row.id)?.name
    ).toBe(expectedName)
  } finally {
    await api.deleteMenuApi(row.id)
  }
})
