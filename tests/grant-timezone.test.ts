/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\tests\grant-timezone.test.ts
 * @Description: 临时授权UTC契约在用户不同时区下保持同一生效窗口
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { expect, test } from 'bun:test'
import {
  parseGrantDateTime,
  formatGrantDateTime,
  toTemporaryRoleGrant,
} from '../src/api/d_governance'

test('UTC日期严格解析，拒绝offset/T格式及非法日期自动归一化', () => {
  expect(parseGrantDateTime('2030-01-01 10:00:00')).toBe(
    Date.parse('2030-01-01T10:00:00Z')
  )
  expect(formatGrantDateTime(Date.parse('2030-01-01T10:00:00Z'))).toBe(
    '2030-01-01 10:00:00'
  )
  for (const value of [
    '2030-01-01T10:00:00',
    '2030-01-01T10:00:00Z',
    '2030-02-30 10:00:00',
    '2030-13-01 10:00:00',
    '2030-01-01 24:00:00',
    '',
  ])
    expect(() => parseGrantDateTime(value)).toThrow('授权有效期')
  expect(() => formatGrantDateTime(NaN)).toThrow('授权有效期')
})

test('精确开始时刻生效、截止时刻过期，撤销优先于时间窗口', () => {
  const row = {
    id: 'grant',
    userId: 'user',
    roleId: 'role',
    reason: '临时值班',
    revision: 0,
    statusFlag: 1,
    effectFrom: '2030-01-01 10:00:00',
    effectTo: '2030-01-01 11:00:00',
  }
  const from = parseGrantDateTime(row.effectFrom),
    to = parseGrantDateTime(row.effectTo)
  expect(toTemporaryRoleGrant(row, from - 1).status).toBe('pending')
  expect(toTemporaryRoleGrant(row, from).status).toBe('active')
  expect(toTemporaryRoleGrant(row, to - 1).status).toBe('active')
  expect(toTemporaryRoleGrant(row, to).status).toBe('expired')
  expect(toTemporaryRoleGrant({ ...row, statusFlag: 0 }, from).status).toBe(
    'revoked'
  )
  expect(() =>
    toTemporaryRoleGrant({ ...row, effectTo: row.effectFrom }, from)
  ).toThrow('必须晚于')
})

test('东京与纽约浏览器时区的序列化和窗口相同，展示各自本地时间', () => {
  const source = `import { formatGrantDateTime, parseGrantDateTime, formatLocalGrantDateTime } from './src/api/d_governance.ts';
    const time=Date.parse('2030-01-01T10:00:00Z');
    process.stdout.write(JSON.stringify({ encoded:formatGrantDateTime(time), parsed:parseGrantDateTime('2030-01-01 10:00:00'), displayed:formatLocalGrantDateTime(time) }));`
  const run = (timezone: string) => {
    const result = Bun.spawnSync([process.execPath, '-e', source], {
      cwd: process.cwd(),
      env: { ...process.env, TZ: timezone },
    })
    expect(result.exitCode).toBe(0)
    return JSON.parse(new TextDecoder().decode(result.stdout))
  }
  const tokyo = run('Asia/Tokyo'),
    newYork = run('America/New_York')
  expect(tokyo.encoded).toBe('2030-01-01 10:00:00')
  expect(newYork.encoded).toBe(tokyo.encoded)
  expect(newYork.parsed).toBe(tokyo.parsed)
  expect(tokyo.displayed).toBe('2030-01-01 19:00:00')
  expect(newYork.displayed).toBe('2030-01-01 05:00:00')
})
