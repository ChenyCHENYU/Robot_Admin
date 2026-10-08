/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\external-link.test.ts
 * @Description: 动态菜单外链安全契约测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  resolveExternalLink,
  resolveIframeSandbox,
} from '../src/utils/d_externalLink'

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

  test('可信跨域文档支持存储，使用精确来源匹配', () => {
    for (const input of [
      'https://www.tzagileteam.com/',
      'https://tzagileteam.com/robot/guide/overview',
    ]) {
      expect(resolveIframeSandbox(input, origin).split(' ')).toContain(
        'allow-same-origin'
      )
    }
    for (const input of [
      'https://www.tzagileteam.com.evil.example/',
      'https://evil.example/?docs=www.tzagileteam.com',
      'https://subdomain.tzagileteam.com/',
      'https://www.tzagileteam.com:444/',
      'https://user@www.tzagileteam.com/',
      '/help',
      'javascript:alert(1)',
      null,
    ]) {
      expect(resolveIframeSandbox(input, origin).split(' ')).not.toContain(
        'allow-same-origin'
      )
    }
  })

  test('同源文档不得组合脚本与原始来源权限', () => {
    const docsOrigin = 'https://www.tzagileteam.com'
    expect(
      resolveIframeSandbox(`${docsOrigin}/robot/guide/overview`, docsOrigin)
    ).toBe('allow-scripts allow-forms allow-popups')
  })
})
