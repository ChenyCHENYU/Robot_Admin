/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\tests\vite-env.test.ts
 * @Description: 构建环境安全校验测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import { validateViteEnv } from '../src/config/vite/viteEnvConfig'
import { normalizeRobotFormCss } from '../src/config/vite/packageCssCompat'

describe('Vite 环境校验', () => {
  test('开发环境使用安全默认值', () => {
    const result = validateViteEnv(
      { VITE_APP_ENV: 'development', VITE_API_BASE: '/api' },
      'development'
    )

    expect(result.authMode).toBe('mock')
    expect(result.routerMode).toBe('hash')
    expect(result.port).toBe(1988)
  })

  test('生产环境拒绝 Mock 认证和 Mock API', () => {
    expect(() =>
      validateViteEnv(
        {
          VITE_APP_ENV: 'production',
          VITE_AUTH_MODE: 'mock',
          VITE_API_BASE: 'https://apifoxmock.com/example',
        },
        'production'
      )
    ).toThrow('Mock')
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

  test('只修正组件库中已知的无效 Steps 选择器', () => {
    const css = [
      '.steps-container:has(.steps-indicator:deep(.n-steps--vertical)) {}',
      '.other:deep(.keep-upstream-selector) {}',
    ].join('\n')

    expect(normalizeRobotFormCss(css)).toBe(
      [
        '.steps-container:has(.steps-indicator .n-steps--vertical) {}',
        '.other:deep(.keep-upstream-selector) {}',
      ].join('\n')
    )
  })
})
