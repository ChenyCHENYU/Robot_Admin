/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\tests\auth-mock.test.ts
 * @Description: 认证模式与 Mock 闭环单元测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  activateMockAuthContext,
  createMockLoginResponse,
  createMockRefreshResponse,
  getMockAuthContexts,
  isMockRouteAllowed,
  switchMockAuthContext,
} from '../src/api/auth.mock'
import {
  getPrimaryAuthContext,
  resolveAuthMode,
} from '../src/api/auth.contract'
import { validateMockMemberships } from '../src/api/auth.mock-directory'

describe('认证模式', () => {
  test('非生产环境缺省回退到 mock', () => {
    expect(resolveAuthMode()).toBe('mock')
    expect(resolveAuthMode('staging')).toBe('mock')
    expect(resolveAuthMode('remote')).toBe('remote')
  })

  test('生产环境缺省走远端且拒绝 mock', () => {
    expect(resolveAuthMode(undefined, 'production')).toBe('remote')
    expect(() => resolveAuthMode('mock', 'production')).toThrow('禁止')
  })

  test('公开演示生产配置允许显式 Mock', () => {
    expect(resolveAuthMode('mock', 'production', 'demo')).toBe('mock')
    expect(resolveAuthMode(undefined, 'production', 'demo')).toBe('mock')
  })
})

describe('认证 Mock 闭环', () => {
  test('身份验证阶段仅返回选择凭据，不提前签发访问令牌', async () => {
    const response = await createMockLoginResponse({
      username: 'admin',
      password: 'robot-admin',
    })

    expect(response.code).toBe('0')
    expect(response.data.token).toBe('')
    expect(response.data.refreshToken).toBe('')
    expect(response.data.loginTicket).toStartWith('mock-ticket.')
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
    const session = activateMockAuthContext({
      loginTicket: login.data.loginTicket as string,
      contextId: 'jinheng-nanjing',
    })
    const refreshed = await createMockRefreshResponse(
      session.data.refreshToken as string
    )

    expect(refreshed.data.token).toStartWith('mock-access.')
    expect(refreshed.data.refreshToken).toStartWith('mock-refresh.')
    expect(refreshed.data.refreshToken).not.toBe(session.data.refreshToken)
    expect(() => createMockRefreshResponse('invalid')).toThrow(
      'Mock refresh token 无效或已过期'
    )
  })

  test('演示账号获得跨租户公司清单，只有激活后才得到上下文令牌', () => {
    const identity = createMockLoginResponse({
      username: 'CHENY',
      password: '123456',
    })
    expect(identity.data.availableContexts).toHaveLength(3)
    expect(
      getPrimaryAuthContext(identity.data.availableContexts ?? []).id
    ).toBe('jinheng-nanjing')
    expect(identity.data.activeContext).toBeUndefined()

    const session = activateMockAuthContext({
      loginTicket: identity.data.loginTicket as string,
      contextId: 'jinheng-xian',
    })
    expect(session.data.token).toStartWith('mock-access.jinheng-xian.')
    expect(session.data.activeContext?.roles[0].id).toBe('operations-manager')
    expect(() =>
      activateMockAuthContext({
        loginTicket: identity.data.loginTicket as string,
        contextId: 'jinheng-nanjing',
      })
    ).toThrow('已过期')
  })

  test('无成员关系与越权公司不能激活，切换只允许本人公司', () => {
    expect(getMockAuthContexts('NOACCESS')).toEqual([])
    const identity = createMockLoginResponse({
      username: 'STAFF',
      password: 'demo',
    })
    expect(identity.data.availableContexts).toHaveLength(1)
    expect(() =>
      activateMockAuthContext({
        loginTicket: identity.data.loginTicket as string,
        contextId: 'jinheng-nanjing',
      })
    ).toThrow('无权进入')

    const session = activateMockAuthContext({
      loginTicket: identity.data.loginTicket as string,
      contextId: 'tianzhi-xian',
    })
    expect(() =>
      switchMockAuthContext(
        'STAFF',
        session.data.refreshToken as string,
        'jinheng-nanjing'
      )
    ).toThrow('无权进入')
  })

  test('主公司必须唯一，公司归属不可重复', () => {
    const contexts = getMockAuthContexts('CHENY')
    expect(() => getPrimaryAuthContext([])).toThrow('未关联公司')
    expect(() =>
      getPrimaryAuthContext(
        contexts.map(item => ({ ...item, isPrimary: false }))
      )
    ).toThrow('主公司配置异常')
    expect(() =>
      getPrimaryAuthContext(
        contexts.map(item => ({ ...item, isPrimary: true }))
      )
    ).toThrow('主公司配置异常')
    expect(() =>
      validateMockMemberships([
        {
          contextId: 'jinheng-nanjing',
          isPrimary: true,
          roleId: 'platform-admin',
        },
        { contextId: 'jinheng-nanjing', isPrimary: false, roleId: 'auditor' },
      ])
    ).toThrow('不可重复')
  })

  test('角色菜单与刷新令牌保持当前公司边界', () => {
    const contexts = getMockAuthContexts('CHENY')
    expect(isMockRouteAllowed(contexts[0], '/sys-manage')).toBe(true)
    expect(isMockRouteAllowed(contexts[1], '/sys-manage')).toBe(false)
    expect(isMockRouteAllowed(contexts[2], '/demo')).toBe(false)
    expect(isMockRouteAllowed(contexts[2], '/dashboard')).toBe(true)
    expect(isMockRouteAllowed(null, '/sys-manage')).toBe(false)

    const switched = switchMockAuthContext(
      'CHENY',
      'mock-refresh.jinheng-nanjing.test',
      'tianzhi-xian'
    )
    const refreshed = createMockRefreshResponse(
      switched.data.refreshToken as string
    )
    expect(refreshed.data.token).toStartWith('mock-access.tianzhi-xian.')
  })
})
