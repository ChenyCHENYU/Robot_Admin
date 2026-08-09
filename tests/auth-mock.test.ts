/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\tests\auth-mock.test.ts
 * @Description: 认证模式与 Mock 闭环单元测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  createMockLoginResponse,
  createMockRefreshResponse,
} from '../src/api/auth.mock'
import { resolveAuthMode } from '../src/api/auth.contract'

describe('认证模式', () => {
  test('默认及未知配置均安全回退到 mock', () => {
    expect(resolveAuthMode()).toBe('mock')
    expect(resolveAuthMode('staging')).toBe('mock')
    expect(resolveAuthMode('remote')).toBe('remote')
  })
})

describe('认证 Mock 闭环', () => {
  test('登录返回与远端接口一致的完整会话', async () => {
    const response = await createMockLoginResponse({
      username: 'admin',
      password: 'robot-admin',
    })

    expect(response.code).toBe('0')
    expect(response.data.token).toStartWith('mock-access.')
    expect(response.data.refreshToken).toStartWith('mock-refresh.')
    expect(response.data.expiresIn).toBeGreaterThan(0)
    expect(response.data.user.username).toBe('admin')
    expect(response.data.token).not.toContain('robot-admin')
  })

  test('缺少登录凭据时返回明确错误', () => {
    expect(() =>
      createMockLoginResponse({ username: '', password: '' })
    ).toThrow('请输入用户名和密码')
  })

  test('刷新令牌可轮换且拒绝非法令牌', async () => {
    const login = await createMockLoginResponse({
      username: 'admin',
      password: 'robot-admin',
    })
    const refreshed = await createMockRefreshResponse(
      login.data.refreshToken as string
    )

    expect(refreshed.data.token).toStartWith('mock-access.')
    expect(refreshed.data.refreshToken).toStartWith('mock-refresh.')
    expect(refreshed.data.refreshToken).not.toBe(login.data.refreshToken)
    expect(() => createMockRefreshResponse('invalid')).toThrow(
      'Mock refresh token 无效或已过期'
    )
  })
})
