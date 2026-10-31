/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\api\dictionary-options.ts
 * @Description: 已有字典接口的只读消费适配，保留停用历史标签并区分失败与合法空字典
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DictionaryOption } from '@robot-admin/dictionary'
import { getDictListApi } from './dictionary-manage'
import type { DictData } from './dictionary-manage.contract'

/** 类型被停用只影响选择，历史数据仍能读到原标签；不改变接口记录。 */
export const toDictionaryOptions = (
  dictionaries: readonly DictData[],
  typeCode: string
): readonly DictionaryOption[] => {
  if (!Array.isArray(dictionaries)) throw new Error('字典列表格式异常')
  const pending = [...dictionaries]
  let type: DictData | undefined
  for (let index = 0; index < pending.length; index++) {
    const item = pending[index]
    if (item.type === 'type' && (item.typeCode || item.code) === typeCode) {
      type = item
      break
    }
    if (item.children) pending.push(...item.children)
  }
  if (!type) throw new Error(`未找到字典类型：${typeCode}`)
  const disabled = type.status !== 1
  return [...(type.children ?? [])]
    .filter(item => item.type === 'item')
    .sort((left, right) => left.sort - right.sort)
    .map(item => {
      const value = item.dictValue ?? item.value
      const label = item.dictLabel ?? item.name
      if (typeof value !== 'string' || typeof label !== 'string')
        throw new Error('字典项缺少有效的存储值或标签')
      return { value, label, disabled: disabled || item.status !== 1 }
    })
}

/** 使用统一请求的静默模式，由使用位置呈现错误与重试，不重复弹全局消息。 */
export const getDictionaryOptionsApi = async (
  typeCode: string,
  signal: AbortSignal
): Promise<readonly DictionaryOption[]> => {
  const response = await getDictListApi(signal, { silent: true })
  if (!['0', '200'].includes(String(response.code)))
    throw new Error('字典暂时不可用，请重试')
  return toDictionaryOptions(response.data, typeCode)
}
