/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\tests\layout-menu.test.ts
 * @Description: 布局菜单边界规范化测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import { toLayoutMenuItems } from '../src/components/global/C_Layout/data'

describe('layout menu normalization', () => {
  test('丢弃无路径节点并递归保留有效子菜单', () => {
    const result = toLayoutMenuItems([
      { name: 'invalid' },
      {
        key: '/system',
        name: 'system',
        children: [{ path: '/system/users', name: 'users' }, { name: 'bad' }],
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]?.path).toBe('/system')
    expect(result[0]?.children?.map(item => item.path)).toEqual([
      '/system/users',
    ])
  })
})
