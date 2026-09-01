/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\tests\vite-env.test.ts
 * @Description: 构建环境安全校验测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import { validateViteEnv } from '../src/config/vite/viteEnvConfig'

describe('Vite 环境校验', () => {
  test('开发环境使用安全默认值', () => {
    const result = validateViteEnv(
      { VITE_APP_ENV: 'development', VITE_API_BASE: '/api' },
      'development'
    )

    expect(result.authMode).toBe('mock')
    expect(result.dataMode).toBe('mock')
    expect(result.routerMode).toBe('hash')
    expect(result.port).toBe(1988)
  })

  test('生产环境拒绝 Mock 认证和 Mock API', () => {
    expect(() =>
      validateViteEnv(
        {
          VITE_APP_ENV: 'production',
          VITE_AUTH_MODE: 'mock',
          VITE_DATA_MODE: 'mock',
          VITE_API_BASE: 'https://apifoxmock.com/example',
        },
        'production'
      )
    ).toThrow('Mock')
  })

  test('生产环境拒绝 Mock 业务数据', () => {
    expect(() =>
      validateViteEnv(
        {
          VITE_APP_ENV: 'production',
          VITE_AUTH_MODE: 'remote',
          VITE_DATA_MODE: 'mock',
          VITE_API_BASE: '/api',
        },
        'production'
      )
    ).toThrow('Mock 业务数据')
  })

  test('拒绝无法识别的业务数据模式', () => {
    expect(() =>
      validateViteEnv(
        {
          VITE_APP_ENV: 'development',
          VITE_DATA_MODE: 'preview',
          VITE_API_BASE: '/api',
        },
        'development'
      )
    ).toThrow('VITE_DATA_MODE 不受支持')
  })

  test('错误上报仅接受同源绝对路径', () => {
    expect(() =>
      validateViteEnv(
        {
          VITE_APP_ENV: 'development',
          VITE_API_BASE: '/api',
          VITE_ERROR_REPORT_ENDPOINT: 'https://example.com/errors',
        },
        'development'
      )
    ).toThrow('同源绝对路径')
  })

  test('启用自动翻译时要求服务端凭据', () => {
    expect(() =>
      validateViteEnv(
        {
          VITE_APP_ENV: 'development',
          VITE_API_BASE: '/api',
          VITE_I18N_ENABLED: 'true',
        },
        'development'
      )
    ).toThrow('有道 API 凭据')
  })
})
