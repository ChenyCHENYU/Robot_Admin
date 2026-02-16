/*
 * @Description: 搜索表单状态管理 composable
 * 职责：字段初始化、折叠展开、搜索/重置逻辑、参数校验
 * 内部组合 useSearchHistory，外部只需创建一个 composable
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { FormInst } from 'naive-ui/es'
import type {
  SearchFormItem,
  SearchFormParams,
  SearchConfig,
} from '@/types/modules/search'
import { useSearchHistory, type SearchHistoryOptions } from './useSearchHistory'

/** useSearchState 入参 */
export interface SearchStateOptions {
  /** 组件 props 的 formItemList */
  formItemList: SearchFormItem[]
  /** 组件 props 的 formParams */
  formParams: SearchFormParams
  /** 统一配置 */
  config?: SearchConfig
  /** 历史功能配置（可选） */
  historyOptions?: SearchHistoryOptions
}

/**
 * 搜索表单状态引擎
 */
export function useSearchState(
  emits: {
    (e: 'search', params: SearchFormParams): void
    (e: 'reset'): void
    (e: 'change-params', params: SearchFormParams): void
  },
  options: SearchStateOptions
) {
  const { config = {} } = options

  const foldThreshold = config.foldThreshold ?? 7
  const requireValue = config.requireValue ?? true

  // ======================== 响应式状态 ========================

  const message = useMessage()
  const formRef = ref<FormInst | null>(null)
  const fields = ref<SearchFormItem[]>([...options.formItemList])
  const formParams = ref<SearchFormParams>({ ...options.formParams })
  const expanded = ref(false)
  const searching = ref(false)

  // ======================== 内部组合：搜索历史 ========================

  const history = useSearchHistory(fields, formParams, {
    ...options.historyOptions,
    maxItems: options.historyOptions?.maxItems ?? config.historyMaxItems,
  })

  // ======================== 计算属性 ========================

  /** 过滤出可见字段（show !== false） */
  const visibleFields = computed(() =>
    fields.value.filter(item => item.show !== false)
  )

  /** 是否需要展开/收起按钮 */
  const hasExpandButton = computed(() => fields.value.length > foldThreshold)

  // ======================== 工具函数 ========================

  /** 检查值是否为空 */
  const isEmpty = (value: unknown): boolean =>
    value === undefined ||
    value === '' ||
    value === null ||
    (Array.isArray(value) && value.length === 0)

  // ======================== 初始化 ========================

  /** 初始化字段默认值（焦点状态、折叠显隐、select 默认值） */
  const initialize = () => {
    fields.value.forEach((item, index) => {
      item.isFocus = false

      // 超过阈值的字段默认隐藏
      if (index >= foldThreshold && item.show === undefined) {
        item.show = false
      }

      // select 字段默认占位与空值
      if (item.type === 'select') {
        if (!item.placeholder) item.placeholder = '请选择'
        if (formParams.value[item.prop] === undefined) {
          formParams.value[item.prop] = null
        }
      }
    })
  }

  // ======================== 核心操作 ========================

  /** 搜索 */
  const searchFn = () => {
    if (requireValue) {
      const hasValidParams = Object.entries(formParams.value)
        .filter(([key]) => key !== 'pageNum' && key !== 'pageSize')
        .some(([, value]) => !isEmpty(value))

      if (!hasValidParams) {
        message.warning('请输入搜索内容，或选择筛选条件')
        return
      }
    }

    history.saveCurrentInputs()
    emits('search', formParams.value)
  }

  /** 重置 */
  const resetFn = () => {
    formRef.value?.restoreValidation()

    Object.keys(formParams.value).forEach(key => {
      if (key !== 'pageNum' && key !== 'pageSize') {
        formParams.value[key] = null
      }
    })

    emits('change-params', formParams.value)
    emits('reset')
  }

  /** 展开/收起 */
  const toggleFold = () => {
    expanded.value = !expanded.value
    fields.value.forEach((item, index) => {
      if (index >= foldThreshold) item.show = expanded.value
    })
  }

  // ======================== 响应 props 变化 ========================

  /** 监听外部 formItemList 变化 */
  const syncFromProps = (
    newItems: SearchFormItem[],
    newParams: SearchFormParams
  ) => {
    fields.value = [...newItems]
    formParams.value = { ...newParams }
    initialize()
  }

  // ======================== 生命周期 ========================

  onMounted(() => {
    initialize()
    history.restoreFromStorage()
  })

  return {
    formRef,
    fields,
    formParams,
    expanded,
    searching,

    visibleFields,
    hasExpandButton,

    history,

    searchFn,
    resetFn,
    toggleFold,
    syncFromProps,
  }
}
