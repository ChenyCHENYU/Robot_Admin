/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\dictionary-manage.ts
 * @Description: 字典远端和演示 CRUD 适配，保留规范化、移动与独立启停语义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ApiResponse } from './management.contract'
import type { DictData, DictFormData } from './dictionary-manage.contract'
import {
  getData,
  postData,
  putData,
  deleteData,
} from '@robot-admin/request-core/axios'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'
import { prepareDictionaryForm, validateDictionaryForm } from './d_dictionary'
import {
  MOCK_DICT_DATA,
  cloneDicts,
  findMockDict,
  removeMockDict,
} from './dictionary-manage.mock'

/** 校验字典写入业务响应，兼容无响应体的成功操作。 */
export const checkDictionaryMutation = (response: unknown): void => {
  // 兼容无响应体的成功操作，同时拒绝 HTTP 成功但业务失败的响应。
  if (!response || typeof response !== 'object' || !('code' in response)) return
  const result = response as { code: unknown; msg?: string; message?: string }
  if (!['0', '200'].includes(String(result.code)))
    throw new Error(result.msg || result.message || '字典操作失败')
}

const validateMockDraft = (draft: DictFormData): void => {
  const error = Object.values(validateDictionaryForm(draft, MOCK_DICT_DATA))[0]
  if (error) throw new Error(error)
}

/** 读取字典树，保留调用方取消信号。 */
export const getDictListApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<DictData[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<DictData[]>>('/sys/dictionaries', { signal })
  }
  await delayWithSignal(300, signal)
  return { code: '0', data: cloneDicts(MOCK_DICT_DATA), msg: '成功' }
}

/** 规范化字典草稿后新增类型或条目。 */
export const addDictApi = async (data: DictFormData): Promise<void> => {
  const draft = prepareDictionaryForm(data)
  if (!isMockDataMode()) {
    checkDictionaryMutation(await postData('/sys/dictionaries', draft))
    return
  }
  await delayWithSignal(300)
  validateMockDraft(draft)
  const id = `dict_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const record: DictData = {
    ...draft,
    id,
    children: draft.type === 'type' ? [] : undefined,
  }
  if (draft.type === 'item') {
    const parent = draft.parentId ? findMockDict(draft.parentId) : null
    if (!parent || parent.type !== 'type') throw new Error('上级字典不存在')
    parent.children = [...(parent.children || []), record]
  } else {
    MOCK_DICT_DATA.push(record)
  }
}

/** 更新字典并保留子项；条目更换上级时实际移动节点。 */
export const updateDictApi = async (data: DictFormData): Promise<void> => {
  const draft = prepareDictionaryForm(data)
  if (!draft.id) throw new Error('更新字典缺少 id')
  if (!isMockDataMode()) {
    checkDictionaryMutation(
      await putData(`/sys/dictionaries/${draft.id}`, draft)
    )
    return
  }
  await delayWithSignal(300)
  const current = findMockDict(draft.id)
  if (!current) throw new Error('字典不存在')
  validateMockDraft(draft)
  if (draft.type === 'item' && current.parentId !== draft.parentId) {
    const parent = findMockDict(draft.parentId!)!
    removeMockDict(current.id)
    parent.children = [...(parent.children || []), current]
  }
  const { children } = current
  Object.assign(current, draft, { children })
}

/** 删除字典类型或条目。 */
export const deleteDictApi = async (id: string): Promise<void> => {
  if (!isMockDataMode()) {
    checkDictionaryMutation(await deleteData(`/sys/dictionaries/${id}`))
    return
  }
  await delayWithSignal(250)
  if (!removeMockDict(id)) throw new Error('字典不存在')
}

/** 独立切换启停状态，拒绝非法状态值。 */
export const toggleDictStatusApi = async (
  id: string,
  status: number
): Promise<void> => {
  if (![0, 1].includes(status)) throw new Error('字典状态无效')
  if (!isMockDataMode()) {
    checkDictionaryMutation(
      await putData(`/sys/dictionaries/${id}/status`, { status })
    )
    return
  }
  await delayWithSignal(200)
  const current = findMockDict(id)
  if (!current) throw new Error('字典不存在')
  current.status = status
}
