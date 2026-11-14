/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\tests\table-preferences.test.ts
 * @Description: 表格偏好身份范围的稳定编码、零值与无身份边界回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { buildTablePreferenceScope } from '../src/utils/d_tablePreferences'

const identity = { userId: 'A', tenantId: 'tenant', companyId: 'company' }

test('仅稳定身份 ID 参与范围，数值零有效并与接口字符串形式一致', () => {
  expect(
    buildTablePreferenceScope({ userId: 0, tenantId: 0, companyId: 0 })
  ).toBe(
    buildTablePreferenceScope({ userId: '0', tenantId: '0', companyId: '0' })
  )
  expect(
    JSON.parse(buildTablePreferenceScope({ ...identity, userId: ' A ' })!)
  ).toEqual(['robot-admin:table-preferences:v1', 'tenant', 'company', ' A '])
  expect(buildTablePreferenceScope({ ...identity, userId: ' A ' })).not.toBe(
    buildTablePreferenceScope(identity)
  )
})

test('任一身份缺失或非法时不创建共享匿名范围', () => {
  for (const value of [undefined, null, '', '  ', NaN, Infinity, false, {}]) {
    for (const field of ['userId', 'tenantId', 'companyId'] as const) {
      expect(buildTablePreferenceScope({ ...identity, [field]: value })).toBe(
        undefined
      )
    }
  }
})

test('账号、公司、租户独立，JSON 编码不会发生冒号拼接碰撞', () => {
  const original = buildTablePreferenceScope(identity)
  for (const field of ['userId', 'tenantId', 'companyId'] as const) {
    expect(
      buildTablePreferenceScope({ ...identity, [field]: 'other' })
    ).not.toBe(original)
  }
  expect(
    buildTablePreferenceScope({ ...identity, tenantId: 'a:b', companyId: 'c' })
  ).not.toBe(
    buildTablePreferenceScope({ ...identity, tenantId: 'a', companyId: 'b:c' })
  )
})
