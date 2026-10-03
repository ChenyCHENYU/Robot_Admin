/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\tests\mock-directory-migration.test.ts
 * @Description: 演示公司改名后旧目录迁移与本地权限保持
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */

import { expect, test } from 'bun:test'
import {
  getMockAuthContexts,
  getMockDirectoryUser,
} from '../src/api/auth.mock-directory'

test('旧公司 ID 迁移后保留用户设置的主公司与角色', () => {
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map<string, string>([
    ['robot-admin:mock-enterprise-directory:v2', '{invalid-json'],
    [
      'robot-admin:mock-enterprise-directory:v1',
      JSON.stringify([
        {
          username: 'CHENY',
          enabled: true,
          memberships: [
            {
              contextId: 'starlab-suzhou',
              isPrimary: true,
              roleId: 'auditor',
            },
            {
              contextId: 'northstar-hangzhou',
              isPrimary: false,
              roleId: 'operations-manager',
            },
          ],
        },
      ]),
    ],
  ])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })

  try {
    const user = getMockDirectoryUser('CHENY')
    expect(user?.memberships).toEqual([
      { contextId: 'jinheng-xian', isPrimary: true, roleId: 'auditor' },
      {
        contextId: 'tianzhi-xian',
        isPrimary: false,
        roleId: 'operations-manager',
      },
    ])
    expect(values.get('robot-admin:mock-enterprise-directory:v2')).toContain(
      'jinheng-xian'
    )
    expect(
      getMockAuthContexts('CHENY').map(context => context.companyName)
    ).toEqual(['江苏金恒（西安）', '西安天智'])
  } finally {
    if (oldStorage)
      Object.defineProperty(globalThis, 'localStorage', oldStorage)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
