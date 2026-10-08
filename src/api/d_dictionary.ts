/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\d_dictionary.ts
 * @Description: 字典领域规范化、检索、实际生效状态和输入校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DictData, DictFormData } from './dictionary-manage.contract'

/** 自身启停配置与父类型决定的实际生效状态分别表达。 */
export const getDictionaryState = (
  dict: Pick<DictData, 'type' | 'status'>,
  parent?: Pick<DictData, 'status'>
) => {
  const enabled = dict.status === 1
  const parentEnabled = dict.type === 'type' || parent?.status === 1
  let reason = ''
  if (!enabled)
    reason = dict.type === 'type' ? '字典类型已停用' : '字典项已停用'
  else if (!parentEnabled) reason = parent ? '所属类型已停用' : '未选择所属类型'
  return { enabled, effective: enabled && parentEnabled, reason }
}

/** 按树顺序展开字典类型与条目。 */
export const flattenDictionaries = (dicts: DictData[]): DictData[] =>
  dicts.flatMap(dict => [dict, ...flattenDictionaries(dict.children || [])])

/** 按字典 ID 查找节点，不改变原目录。 */
export const findDictionary = (
  dicts: DictData[],
  id?: string | null
): DictData | undefined =>
  flattenDictionaries(dicts).find(dict => dict.id === id)

/** 检索名称、编码和值，保留命中节点的祖先。 */
export const filterDictionaries = (
  dicts: DictData[],
  keyword: string
): DictData[] => {
  const term = keyword.trim().toLocaleLowerCase()
  if (!term) return dicts
  return dicts.flatMap(dict => {
    if (
      [dict.name, dict.code, dict.value, dict.dictLabel].some(value =>
        value?.toLocaleLowerCase().includes(term)
      )
    )
      return [dict]
    const children = filterDictionaries(dict.children || [], term)
    return children.length ? [{ ...dict, children }] : []
  })
}

/** 标签改变不能改写已有英文编码；新字典项未单独填写编码时使用存储值。 */
export const prepareDictionaryForm = (form: DictFormData): DictFormData => {
  const draft = { ...form }
  for (const key of [
    'name',
    'code',
    'typeCode',
    'dictValue',
    'remark',
  ] as const)
    draft[key] = draft[key].trim()
  if (draft.type === 'type') {
    Object.assign(draft, {
      code: draft.typeCode,
      parentId: null,
      value: '',
      dictValue: '',
      dictLabel: '',
    })
  } else {
    Object.assign(draft, {
      dictLabel: draft.name,
      value: draft.dictValue,
      code: draft.code || draft.dictValue,
      typeCode: '',
    })
  }
  return draft
}

type DictErrors = Partial<Record<keyof DictFormData, string>>
const validateType = (draft: DictFormData, dicts: DictData[]): DictErrors => {
  if (!/^[a-zA-Z][\w.:-]*$/.test(draft.typeCode))
    return {
      typeCode: '编码以字母开头，可使用字母、数字和下划线，如 user_status',
    }
  if (
    dicts.some(
      dict =>
        dict.id !== draft.id &&
        dict.code.toLowerCase() === draft.typeCode.toLowerCase()
    )
  )
    return { typeCode: '字典类型编码已存在' }
  return {}
}
const validateItem = (draft: DictFormData, dicts: DictData[]): DictErrors => {
  const errors: DictErrors = {}
  const parent = findDictionary(dicts, draft.parentId)
  const current = findDictionary(dicts, draft.id)
  if (parent?.type !== 'type') return { parentId: '请选择所属字典类型' }
  if (parent.status === 0 && current?.parentId !== parent.id)
    errors.parentId = '请先启用字典类型再新增或移入字典项'
  if (!draft.dictValue) errors.dictValue = '请输入存储值，0 也是有效值'
  const others = (parent.children || []).filter(item => item.id !== draft.id)
  if (others.some(item => (item.dictValue ?? item.value) === draft.dictValue))
    errors.dictValue = '同一类型下的存储值不能重复'
  if (others.some(item => item.code === draft.code))
    errors.code = '同一类型下的字典项编码不能重复'
  return errors
}

/** 规范化后验证类型、排序、归属和同类型唯一性。 */
export const validateDictionaryForm = (
  form: DictFormData,
  dicts: DictData[]
): DictErrors => {
  const draft = prepareDictionaryForm(form)
  const errors: DictErrors = {}
  const current = findDictionary(dicts, draft.id)
  if (!draft.name) errors.name = '请输入显示名称'
  if (draft.name.length > 60) errors.name = '名称不能超过 60 个字符'
  if (current && current.type !== draft.type)
    errors.type = '编辑时不能改变节点类型'
  if (!Number.isInteger(draft.sort) || draft.sort < 0 || draft.sort > 9999)
    errors.sort = '排序须为 0–9999 的整数'
  return {
    ...errors,
    ...(draft.type === 'type'
      ? validateType(draft, dicts)
      : validateItem(draft, dicts)),
  }
}
