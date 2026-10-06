/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\tests\dictionary-management.test.ts
 * @Description: 字典编码保留、重复值约束、移动和请求取消回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import {
  filterDictionaries,
  getDictionaryState,
  findDictionary,
  prepareDictionaryForm,
  validateDictionaryForm,
} from '../src/views/sys-manage/dictionary-manage/d_dictionary'
import type {
  DictData,
  DictFormData,
} from '../src/views/sys-manage/dictionary-manage/data'

const item: DictData = {
  id: 'normal',
  name: '正常',
  dictLabel: '正常',
  type: 'item',
  parentId: 'status',
  code: 'normal',
  value: '1',
  dictValue: '1',
  sort: 1,
  status: 1,
}
const root: DictData = {
  id: 'status',
  name: '用户状态',
  type: 'type',
  code: 'user_status',
  sort: 1,
  status: 1,
  children: [item],
}
const draft: DictFormData = {
  ...item,
  parentId: root.id,
  value: '1',
  remark: '',
  typeCode: '',
  dictLabel: '正常',
  dictValue: '1',
}

describe('dictionary management contracts', () => {
  test('字典项启停配置不被父类型改写，实际生效状态覆盖四种组合', () => {
    for (const status of [0, 1]) {
      for (const parentStatus of [0, 1]) {
        const state = getDictionaryState(
          { type: 'item', status },
          { status: parentStatus }
        )
        expect(state.enabled).toBe(status === 1)
        expect(state.effective).toBe(status === 1 && parentStatus === 1)
      }
    }
    expect(
      getDictionaryState({ type: 'item', status: 1 }, { status: 0 }).reason
    ).toBe('所属类型已停用')
    expect(
      getDictionaryState({ type: 'item', status: 0 }, { status: 1 }).reason
    ).toBe('字典项已停用')
  })
  test('更改标签不会改写英文编码，提交数据不修改输入草稿', () => {
    const changed = { ...draft, name: '可用', dictLabel: '旧标签' }
    const normalized = prepareDictionaryForm(changed)
    expect(normalized.code).toBe('normal')
    expect(normalized.dictLabel).toBe('可用')
    expect(changed.dictLabel).toBe('旧标签')
    expect(normalized.value).toBe('1')
    expect(validateDictionaryForm(normalized, [root])).toEqual({})
  })
  test('存储值 0 有效，未填写独立编码时使用存储值', () => {
    const newItem = {
      ...draft,
      id: undefined,
      name: '停用',
      code: '',
      dictValue: '0',
    }
    expect(prepareDictionaryForm(newItem)).toMatchObject({
      value: '0',
      dictValue: '0',
      code: '0',
    })
    expect(validateDictionaryForm(newItem, [root])).toEqual({})
  })
  test('同一类型拒绝重复存储值或编码，编辑本项保持原值有效', () => {
    expect(
      validateDictionaryForm({ ...draft, id: undefined, code: 'other' }, [root])
        .dictValue
    ).toBeDefined()
    expect(
      validateDictionaryForm({ ...draft, id: undefined, dictValue: '0' }, [
        root,
      ]).code
    ).toBeDefined()
    expect(validateDictionaryForm(draft, [root])).toEqual({})
  })
  test('类型编码忽略大小写校验唯一，停用类型允许编辑已有项但拒绝新增或移入', () => {
    const typeDraft = {
      ...draft,
      id: undefined,
      type: 'type' as const,
      typeCode: 'USER_STATUS',
    }
    expect(validateDictionaryForm(typeDraft, [root]).typeCode).toBeDefined()
    expect(
      validateDictionaryForm({ ...typeDraft, typeCode: '用户状态' }, [root])
        .typeCode
    ).toBeDefined()
    const disabledRoot = { ...root, status: 0 }
    expect(validateDictionaryForm(draft, [disabledRoot])).toEqual({})
    expect(
      validateDictionaryForm(
        { ...draft, id: undefined, code: 'other', dictValue: '0' },
        [disabledRoot]
      ).parentId
    ).toBeDefined()
    expect(
      validateDictionaryForm({ ...draft, parentId: item.id }, [root]).parentId
    ).toBeDefined()
  })
  test('编码和值检索保留父级，匹配类型时保留全部子项', () => {
    expect(filterDictionaries([root], 'normal')[0].children?.[0].id).toBe(
      item.id
    )
    expect(filterDictionaries([root], '1')[0].children?.[0].id).toBe(item.id)
    expect(filterDictionaries([root], 'USER_STATUS')[0].children).toHaveLength(
      1
    )
    expect(filterDictionaries([root], 'unmatched')).toEqual([])
    expect(filterDictionaries([root], '  ')).toEqual([root])
  })
  test('排序必须为整数，类型编辑不能变成字典项', () => {
    expect(
      validateDictionaryForm({ ...draft, sort: 1.5 }, [root]).sort
    ).toBeDefined()
    expect(
      validateDictionaryForm({ ...draft, id: root.id }, [root]).type
    ).toBeDefined()
  })
  test('演示接口正确移动字典项；非法移动不改变目录，保存使用请求时的草稿快照', async () => {
    const api = await import('../src/views/sys-manage/dictionary-manage/data')
    const suffix = crypto.randomUUID().replaceAll('-', '')
    const createType = (name: string, typeCode: string) => ({
      ...api.DEFAULT_DICT_FORM_DATA,
      name,
      typeCode,
    })
    const first = createType(`A-${suffix}`, `a_${suffix}`)
    const second = createType(`B-${suffix}`, `b_${suffix}`)
    await api.addDictApi(first)
    await api.addDictApi(second)
    let dicts = (await api.getDictListApi()).data
    const firstId = dicts.find(dict => dict.code === first.typeCode)!.id
    const secondId = dicts.find(dict => dict.code === second.typeCode)!.id
    try {
      const createdDraft = {
        ...api.DEFAULT_DICT_FORM_DATA,
        type: 'item' as const,
        parentId: firstId,
        name: '可用',
        dictValue: '0',
        code: 'available',
      }
      const pending = api.addDictApi(createdDraft)
      createdDraft.name = '输入已变化'
      await pending
      dicts = (await api.getDictListApi()).data
      const created = findDictionary(dicts, firstId)!.children![0]
      expect(created.name).toBe('可用')
      const moving = {
        ...createdDraft,
        id: created.id,
        name: created.name,
        parentId: secondId,
      }
      await api.updateDictApi(moving)
      dicts = (await api.getDictListApi()).data
      expect(findDictionary(dicts, firstId)!.children).toHaveLength(0)
      expect(findDictionary(dicts, secondId)!.children?.[0]).toMatchObject({
        id: created.id,
        code: 'available',
        parentId: secondId,
      })
      await expect(
        api.updateDictApi({ ...moving, parentId: 'missing' })
      ).rejects.toThrow()
      await expect(
        api.addDictApi({ ...moving, id: undefined })
      ).rejects.toThrow('存储值不能重复')
      dicts = (await api.getDictListApi()).data
      expect(findDictionary(dicts, secondId)!.children).toHaveLength(1)
      await api.toggleDictStatusApi(secondId, 0)
      await expect(
        api.addDictApi({
          ...moving,
          id: undefined,
          dictValue: '1',
          code: 'new',
        })
      ).rejects.toThrow('请先启用字典类型')
    } finally {
      await api.deleteDictApi(firstId)
      await api.deleteDictApi(secondId)
    }
  })
  test('加载取消正常终止，业务拒绝不可误报成功，无响应体的成功可兼容', async () => {
    const api = await import('../src/views/sys-manage/dictionary-manage/data')
    const controller = new AbortController()
    const pending = api.getDictListApi(controller.signal)
    controller.abort()
    await expect(pending).rejects.toThrow()
    expect(() =>
      api.checkDictionaryMutation({ code: 403, msg: '没有编辑权限' })
    ).toThrow('没有编辑权限')
    expect(() => api.checkDictionaryMutation(undefined)).not.toThrow()
    expect(() => api.checkDictionaryMutation({ code: '200' })).not.toThrow()
  })
})
