/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\tests\error-reporter.test.ts
 * @Description: 客户端错误上报脱敏测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { afterEach, describe, expect, test } from 'bun:test'
import {
  createErrorReportPayload,
  sanitizeSensitiveText,
} from '../src/utils/errorHandler/reporter'

const originalWindow = globalThis.window

afterEach(() => {
  globalThis.window = originalWindow
})

describe('error reporter', () => {
  test('脱敏凭据和个人信息', () => {
    const sanitized = sanitizeSensitiveText(
      'password=secret token=abc email user@example.com phone 13800138000'
    )

    expect(sanitized).not.toContain('secret')
    expect(sanitized).not.toContain('user@example.com')
    expect(sanitized).not.toContain('13800138000')
  })

  test('移除 URL 查询参数且不携带附加业务数据', () => {
    globalThis.window = {
      location: { origin: 'https://robot.example.com' },
    } as Window & typeof globalThis
    const payload = createErrorReportPayload({
      source: 'script',
      message: 'boom',
      timestamp: 1,
      url: 'https://robot.example.com/admin?token=secret#panel',
      handled: false,
      additionalInfo: { password: 'never-report' },
    })

    expect(payload.url).toBe('https://robot.example.com/admin')
    expect(payload).not.toHaveProperty('additionalInfo')
  })
})
