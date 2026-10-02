/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\external-link.test.ts
 * @Description: 动态菜单外链安全契约测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import { resolveExternalLink } from '../src/utils/d_externalLink'

const origin = 'https://admin.example.com'

describe('动态菜单外链', () => {
  test('允许 HTTPS 外链及站内路径', () => {
    expect(resolveExternalLink('https://docs.example.com/a', origin)).toBe(
      'https://docs.example.com/a'
    )
    expect(resolveExternalLink('/help', origin)).toBe(
      'https://admin.example.com/help'
    )
  })

  test('拒绝脚本、降级、协议相对地址及嵌入凭据', () => {
    for (const input of [
      'javascript:alert(1)',
      'data:text/html,evil',
      'http://docs.example.com',
      '//docs.example.com',
      'https://user:secret@docs.example.com',
      'not a valid url',
    ]) {
      expect(resolveExternalLink(input, origin)).toBeNull()
    }
  })
})
