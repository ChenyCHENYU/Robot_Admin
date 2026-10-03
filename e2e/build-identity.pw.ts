/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\e2e\build-identity.pw.ts
 * @Description: 两种部署产物的构建身份卡浏览器接口契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */

import { expect, test } from '@playwright/test'

test('生产演示和预发应用分别提供准确且脱敏的构建身份卡', async ({
  request,
}) => {
  const targets = [
    {
      url: 'http://127.0.0.1:4173',
      environment: 'production',
      profile: 'demo',
      authMode: 'mock',
    },
    {
      url: 'http://127.0.0.1:4174',
      environment: 'staging',
      profile: 'application',
      authMode: 'remote',
    },
  ] as const

  await Promise.all(
    targets.map(async target => {
      const response = await request.get(`${target.url}/build-info.json`)
      expect(response.ok()).toBe(true)
      expect(response.headers()['content-type']).toContain('application/json')
      const identity = await response.json()
      expect(identity.schemaVersion).toBe(1)
      expect(identity.application.id).toBe('robot-admin')
      expect(identity.build.environment).toBe(target.environment)
      expect(identity.build.deploymentProfile).toBe(target.profile)
      expect(identity.build.authMode).toBe(target.authMode)
      expect(identity.build.builtAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(JSON.stringify(identity)).not.toContain('apiBase')
    })
  )
})
