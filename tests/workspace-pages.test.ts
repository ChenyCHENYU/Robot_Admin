/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\tests\workspace-pages.test.ts
 * @Description: 首页入口与页面统计的菜单可见性边界回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  countWorkspacePages,
  getWorkspacePages,
} from '../src/views/home/d_enterpriseOverview'
import type { MenuOptions } from '../src/types/modules/menu'

test('隐藏与禁用父菜单的子页面不能进入首页快捷入口', () => {
  const menus: MenuOptions[] = [
    {
      meta: { hidden: true },
      children: [{ name: 'hidden-child', path: '/hidden' }],
    },
    {
      disabled: true,
      children: [{ name: 'disabled-child', path: '/disabled' }],
    },
    { path: '/visible', name: 'visible' },
    { path: '/hidden-leaf', meta: { hidden: true } },
    { path: '/disabled-leaf', disabled: true },
  ]
  expect(getWorkspacePages(menus).map(page => page.name)).toEqual(['visible'])
  expect(countWorkspacePages(menus)).toBe(1)
})

test('分组可收集内部子页面，外链、空节点与重复路径不参与统计', () => {
  const menus: MenuOptions[] = [
    {
      type: 'group',
      path: '/system',
      children: [{ name: 'users', path: '/system/users' }],
    },
    { name: 'alias', path: '/system/users' },
    { path: '/external', meta: { link: 'https://example.com' } },
    { type: 'divider', path: '/divider' },
    { type: 'group', path: '/empty-group' },
    { name: 'no-path' },
    { name: 'about', path: '/about', children: [] },
  ]
  expect(getWorkspacePages(menus).map(page => page.name)).toEqual([
    'users',
    'about',
  ])
  expect(countWorkspacePages(menus)).toBe(2)
})
