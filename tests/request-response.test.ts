/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\tests\request-response.test.ts
 * @Description: 请求业务响应契约测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  getBusinessErrorMessage,
  getRequestErrorMessage,
} from '../src/utils/d_request'

describe('请求响应契约', () => {
  test('兼容 code 0/200 及无业务码响应', () => {
    expect(getBusinessErrorMessage({ code: 0, data: null })).toBeUndefined()
    expect(getBusinessErrorMessage({ code: '200' })).toBeUndefined()
    expect(getBusinessErrorMessage(new Blob())).toBeUndefined()
  })

  test('同时兼容 message 与 msg 错误字段', () => {
    expect(getBusinessErrorMessage({ code: 500, msg: '服务异常' })).toBe(
      '服务异常'
    )
    expect(getBusinessErrorMessage({ code: 500, message: '参数错误' })).toBe(
      '参数错误'
    )
  })

  test('安全提取网络异常消息', () => {
    expect(
      getRequestErrorMessage({ response: { data: { msg: '登录已过期' } } })
    ).toBe('登录已过期')
    expect(getRequestErrorMessage(new Error('网络断开'))).toBe('网络断开')
  })
})
