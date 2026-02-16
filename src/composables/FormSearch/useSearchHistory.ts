/*
 * @Description: 搜索历史记录管理 composable
 * 职责：localStorage 历史读写、焦点面板显隐、单条删除/全部清空
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { getItem, setItem } from '@/hooks/useStorage/index'
import type { Ref } from 'vue'
import type { SearchFormItem, SearchFormParams } from '@/types/modules/search'

/** useSearchHistory 配置选项 */
export interface SearchHistoryOptions {
  /** localStorage 存储 key；为空则禁用历史功能 */
  storageKey?: string
  /** 每个字段最多保留的历史条数，默认 5 */
  maxItems?: number
}

/**
 * 搜索历史记录管理
 * @param fields     - 响应式字段列表 ref
 * @param formParams - 响应式表单参数 ref
 * @param options    - 历史功能配置
 */
export function useSearchHistory(
  fields: Ref<SearchFormItem[]>,
  formParams: Ref<SearchFormParams>,
  options: SearchHistoryOptions = {}
) {
  const { storageKey, maxItems = 5 } = options
  const enabled = !!storageKey

  // ======================== 内部工具 ========================

  /** 根据 prop 查找字段 */
  const findField = (prop: string) =>
    fields.value.find(item => item.prop === prop)

  /** 将当前 fields 写入 localStorage */
  const persistToStorage = () => {
    if (enabled) setItem(storageKey!, fields.value)
  }

  /** 从 localStorage 恢复字段（含历史记录） */
  const restoreFromStorage = () => {
    if (!enabled) return
    const stored = getItem<SearchFormItem[]>(storageKey!)
    if (!stored) return
    // 仅恢复 hisList，保留组件端的 show/isFocus 等运行时状态
    stored.forEach(storedItem => {
      const field = findField(storedItem.prop)
      if (field && storedItem.hisList) {
        field.hisList = storedItem.hisList
      }
    })
  }

  // ======================== 焦点管理 ========================

  /** 设置所有字段的 isFocus 状态；仅 targetProp 且有 hisList 的打开 */
  const setAllFieldsFocus = (targetProp?: string) => {
    fields.value.forEach(item => {
      item.isFocus = !!(item.hisList && item.prop === targetProp)
    })
  }

  /** 输入框获得焦点时：先恢复存储，再打开对应面板 */
  const handleFocus = (prop: string) => {
    restoreFromStorage()
    setAllFieldsFocus(prop)
  }

  /** 关闭所有历史面板（供 mousedown.prevent 外部调用） */
  const closeAllPanels = () => setAllFieldsFocus()

  // ======================== 历史 CRUD ========================

  /** 选中一条历史记录 → 填入表单并关闭面板 */
  const selectHistoryItem = (value: string, prop: string) => {
    formParams.value[prop] = value
    closeAllPanels()
  }

  /** 删除单条历史记录 */
  const deleteHistoryItem = (prop: string, index: number) => {
    const field = findField(prop)
    if (!field?.hisList) return
    field.hisList.splice(index, 1)
    if (field.hisList.length === 0) field.isFocus = false
    persistToStorage()
  }

  /** 清空某字段的全部历史 */
  const clearAllHistory = (prop: string) => {
    const field = findField(prop)
    if (!field?.hisList) return
    field.hisList = []
    field.isFocus = false
    persistToStorage()
  }

  // ======================== 搜索前保存 ========================

  /** 将历史列表维持在 maxItems 以内（去重 + 头部插入） */
  const pushToHistoryList = (hisList: string[], newValue: string) => {
    const idx = hisList.indexOf(newValue)
    if (idx > -1) hisList.splice(idx, 1)
    hisList.unshift(newValue)
    if (hisList.length > maxItems) hisList.length = maxItems
    return hisList
  }

  /** 搜索触发时，将当前有值的 input 参数写入历史 */
  const saveCurrentInputs = () => {
    if (!enabled) return
    Object.keys(formParams.value).forEach(key => {
      const val = formParams.value[key]
      if (!val) return
      const field = findField(key)
      if (!field?.hisList) return
      const str = String(val).trim()
      if (str) pushToHistoryList(field.hisList, str)
    })
    closeAllPanels()
    persistToStorage()
  }

  return {
    /** 是否启用历史功能 */
    enabled,
    handleFocus,
    closeAllPanels,
    selectHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
    saveCurrentInputs,
    restoreFromStorage,
  }
}
