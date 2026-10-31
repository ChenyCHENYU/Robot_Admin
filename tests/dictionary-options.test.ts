/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\tests\dictionary-options.test.ts
 * @Description: 已有字典接口消费适配的停用回显、类型保真与空错边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { toDictionaryOptions } from '../src/api/dictionary-options'
import { cloneDicts, MOCK_DICT_DATA } from '../src/api/dictionary-manage.mock'

test('字典消费保留停用历史标签和原始字符串编码，不改维护侧树', () => {
  const tree = cloneDicts(MOCK_DICT_DATA)
  const before = structuredClone(tree)
  expect(toDictionaryOptions(tree, 'user_status')).toEqual([
    { value: '1', label: '正常', disabled: false },
    { value: '0', label: '禁用', disabled: true },
  ])
  expect(toDictionaryOptions(tree, 'gender').every(item => item.disabled)).toBe(
    true
  )
  expect(tree).toEqual(before)
})

test('有类型但无选项是合法空字典，类型缺失或响应损坏是失败', () => {
  const tree = cloneDicts(MOCK_DICT_DATA)
  tree[0].children = []
  expect(toDictionaryOptions(tree, 'user_status')).toEqual([])
  expect(() => toDictionaryOptions(tree, 'missing')).toThrow('未找到字典类型')
  expect(() =>
    toDictionaryOptions(null as unknown as typeof tree, 'user_status')
  ).toThrow('格式异常')
})

test('接口别名、前导零和空标签明确保留，不以 truthy 或 Number 改写', () => {
  const tree = cloneDicts(MOCK_DICT_DATA)
  Object.assign(tree[0].children![0], {
    value: '001',
    dictValue: '001',
    dictLabel: '',
  })
  expect(toDictionaryOptions(tree, 'user_status')[0]).toEqual({
    value: '001',
    label: '',
    disabled: false,
  })
  delete tree[0].children![0].dictValue
  delete tree[0].children![0].value
  expect(() => toDictionaryOptions(tree, 'user_status')).toThrow('存储值或标签')
})
