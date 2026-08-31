/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\tests\route-path.test.ts
 * @Description: 动态路由路径解析回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  collectRoutePaths,
  joinRoutePath,
  toRouteRecordPath,
} from '../src/router/routePath'

describe('动态路由路径', () => {
  test('子路由保留相对 path 供 Vue Router 嵌套解析', () => {
    expect(toRouteRecordPath('analysis', true)).toBe('analysis')
    expect(toRouteRecordPath('/standalone', true)).toBe('/standalone')
  })

  test('菜单和权限使用完整嵌套路径', () => {
    expect(joinRoutePath('/dashboard', 'analysis')).toBe('/dashboard/analysis')
    expect(joinRoutePath('/demo', 'form/form-modal')).toBe(
      '/demo/form/form-modal'
    )
  })

  test('展平三层路由时不丢失父路径', () => {
    expect(
      collectRoutePaths([
        {
          path: '/demo',
          children: [
            {
              path: 'form-manage',
              children: [{ path: 'form-modal' }],
            },
          ],
        },
      ])
    ).toEqual(['/demo', '/demo/form-manage', '/demo/form-manage/form-modal'])
  })
})
