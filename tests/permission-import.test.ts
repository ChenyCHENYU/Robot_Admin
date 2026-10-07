/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\permission-import.test.ts
 * @Description: 权限批次导入的模型、状态及唯一性验证
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { parsePermissionImport } from '../src/views/sys-manage/permission-manage/d_permissionImport'

const draft = {
  name: '读取用户',
  code: 'user:read',
  type: 'api',
  module: 'user',
  status: 0,
  sort: 0,
  resources: [' /sys/users ', '/sys/users'],
}

test('导入规范化资源且保留停用状态和排序 0，不接受 ID 等服务器字段', () => {
  const rows = parsePermissionImport(
    [{ ...draft, id: 91, secret: 'ignored' }],
    []
  )
  expect(rows).toEqual([
    { ...draft, description: '', remark: '', resources: ['/sys/users'] },
  ])
  expect(draft.resources).toEqual([' /sys/users ', '/sys/users'])
})

test('拒绝字符串状态、错误资源、未知类型及非法排序', () => {
  for (const patch of [
    { status: '0' },
    { resources: '/sys/users' },
    { resources: [1] },
    { type: 'invalid' },
    { sort: -1 },
    { sort: 0.5 },
    { name: '  ' },
  ])
    expect(() => parsePermissionImport([{ ...draft, ...patch }], [])).toThrow()
})

test('批次内重复和现有编码重复均整批拒绝，不改变既有模型', () => {
  const codes = ['user:read']
  expect(() => parsePermissionImport([draft], codes)).toThrow('重复')
  expect(() =>
    parsePermissionImport([draft, { ...draft, code: ' user:read ' }], [])
  ).toThrow('重复')
  expect(codes).toEqual(['user:read'])
})

test('拒绝空批次、超过限额或非对象记录，允许有效状态 1', () => {
  for (const value of [
    null,
    {},
    [],
    [null],
    Array.from({ length: 201 }, () => draft),
  ])
    expect(() => parsePermissionImport(value, [])).toThrow()
  expect(parsePermissionImport([{ ...draft, status: 1 }], [])[0]?.status).toBe(
    1
  )
})
