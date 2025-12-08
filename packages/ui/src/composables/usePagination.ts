/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-09-02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 09:06:34
 * @FilePath: \Robot_Admin\src\composables\Table\usePagination.ts
 * @Description: 表格分页逻辑 Hook
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Ref, ComputedRef } from 'vue'
import type { PaginationConfig, DataRecord } from '@/types/modules/table'

// ================= 类型定义 =================
export interface UsePaginationOptions<T extends DataRecord = DataRecord> {
  /** 数据源 - 支持函数、Ref 或 ComputedRef */
  data: (() => T[]) | Ref<T[]> | ComputedRef<T[]>
  /** 分页配置 */
  config: Ref<PaginationConfig | null> | ComputedRef<PaginationConfig | null>
  /** 事件触发器 */
  emit?: (event: 'pagination-change', page: number, pageSize: number) => void
}

export interface UsePaginationReturn<T extends DataRecord = DataRecord> {
  // 响应式状态
  currentPage: Ref<number>
  currentPageSize: Ref<number>

  // 计算属性
  paginatedData: ComputedRef<T[]>
  paginationConfig: ComputedRef<any>

  // 方法
  handlePageChange: (page: number) => void
  handlePageSizeChange: (pageSize: number) => void
  resetToFirstPage: () => void
  getTotalPages: () => number
}

// ================= 默认配置 =================
const DEFAULT_PAGINATION_CONFIG = {
  enabled: true,
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
  simple: false,
  size: 'medium' as const,
}

// ================= Hook 实现 =================
/**
 *
 */
export function usePagination<T extends DataRecord = DataRecord>(
  options: UsePaginationOptions<T>
): UsePaginationReturn<T> {
  const { data, config, emit } = options

  // ================= 响应式状态 =================
  const currentPage = ref(1)
  const currentPageSize = ref(10)

  // ================= 数据源统一处理 =================
  const dataSource = computed(() => {
    if (typeof data === 'function') {
      return data() || []
    }
    return unref(data) || []
  })

  // ================= 计算属性 =================

  /**
   * 分页后的数据
   */
  const paginatedData = computed(() => {
    if (!config.value?.enabled) {
      return dataSource.value
    }

    const start = (currentPage.value - 1) * currentPageSize.value
    const end = start + currentPageSize.value
    return dataSource.value.slice(start, end)
  })

  /**
   * 分页配置对象
   */
  const paginationConfig = computed(() => {
    if (!config.value?.enabled) return null

    return {
      page: currentPage.value,
      pageSize: currentPageSize.value,
      itemCount: dataSource.value.length,
      showSizePicker:
        config.value.showSizePicker ?? DEFAULT_PAGINATION_CONFIG.showSizePicker,
      showQuickJumper:
        config.value.showQuickJumper ??
        DEFAULT_PAGINATION_CONFIG.showQuickJumper,
      pageSizes: config.value.pageSizes ?? DEFAULT_PAGINATION_CONFIG.pageSizes,
      simple: config.value.simple ?? DEFAULT_PAGINATION_CONFIG.simple,
      size: config.value.size ?? DEFAULT_PAGINATION_CONFIG.size,
      prefix: (info: any) => `共 ${info.itemCount} 条`,
      suffix: (info: any) => `第 ${info.startIndex + 1}-${info.endIndex} 条`,
      'onUpdate:page': handlePageChange,
      'onUpdate:pageSize': handlePageSizeChange,
    }
  })

  // ================= 事件处理 =================

  /**
   * 页码变化处理
   */
  const handlePageChange = (page: number) => {
    currentPage.value = page
    emit?.('pagination-change', page, currentPageSize.value)
  }

  /**
   * 页面大小变化处理
   */
  const handlePageSizeChange = (pageSize: number) => {
    currentPageSize.value = pageSize
    currentPage.value = 1 // 重置到第一页
    emit?.('pagination-change', 1, pageSize)
  }

  /**
   * 重置到第一页
   */
  const resetToFirstPage = () => {
    if (currentPage.value !== 1) {
      handlePageChange(1)
    }
  }

  /**
   * 获取总页数
   */
  const getTotalPages = () => {
    if (!config.value?.enabled || currentPageSize.value === 0) return 1
    return Math.ceil(dataSource.value.length / currentPageSize.value)
  }

  // ================= 响应式逻辑 =================

  /**
   * 初始化分页配置
   */
  watchEffect(() => {
    if (config.value?.enabled) {
      currentPage.value = config.value.page ?? DEFAULT_PAGINATION_CONFIG.page
      currentPageSize.value =
        config.value.pageSize ?? DEFAULT_PAGINATION_CONFIG.pageSize
    }
  })

  /**
   * 监听数据变化，确保分页状态正确
   */
  watch(
    () => dataSource.value.length,
    newLength => {
      if (config.value?.enabled && currentPage.value > 1) {
        const maxPage = Math.ceil(newLength / currentPageSize.value)
        if (currentPage.value > maxPage) {
          currentPage.value = Math.max(1, maxPage)
        }
      }
    }
  )

  // ================= 返回接口 =================
  return {
    // 响应式状态
    currentPage,
    currentPageSize,

    // 计算属性
    paginatedData,
    paginationConfig,

    // 方法
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    getTotalPages,
  }
}
