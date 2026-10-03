/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\tests\build-info.test.ts
 * @Description: 构建身份卡的公开字段与敏感配置边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */

import { describe, expect, test } from 'bun:test'
import { createBuildInfo } from '../src/config/vite/viteBuildInfoPlugin'

describe('构建身份卡', () => {
  test('只输出应用与构建溯源的白名单字段', () => {
    const identity = createBuildInfo(
      {
        appEnv: 'production',
        deploymentProfile: 'demo',
        authMode: 'mock',
        dataMode: 'mock',
        routerMode: 'hash',
        apiBase: 'https://private.example.com/token-secret',
        port: 1988,
        captchaProvider: 'puzzle-captcha',
      },
      {
        branch: 'feat/enterprise-experience-upgrade',
        commitSha: 'a'.repeat(40),
        dirty: false,
        pipelineId: null,
      },
      '2026-10-03T08:00:00.000Z'
    )

    expect(identity.schemaVersion).toBe(1)
    expect(identity.application.id).toBe('robot-admin')
    expect(identity.build.commitShort).toBe('aaaaaaaa')
    expect(identity.build.builtAt).toBe('2026-10-03T08:00:00.000Z')
    const publicJson = JSON.stringify(identity)
    expect(publicJson).not.toContain('token-secret')
    expect(publicJson).not.toContain('apiBase')
    expect(publicJson).not.toContain('captchaProvider')
  })

  test('开发服务没有正式构建时间，不伪造时间戳', () => {
    const identity = createBuildInfo(
      {
        appEnv: 'development',
        deploymentProfile: 'application',
        authMode: 'mock',
        dataMode: 'mock',
        routerMode: 'hash',
        apiBase: '/api',
        port: 1988,
        captchaProvider: 'puzzle-captcha',
      },
      { branch: null, commitSha: null, dirty: null, pipelineId: null },
      null
    )
    expect(identity.build.builtAt).toBeNull()
    expect(identity.build.commitShort).toBeNull()
  })
})
