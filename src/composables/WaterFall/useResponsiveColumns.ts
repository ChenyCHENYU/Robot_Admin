/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\composables\WaterFall\useResponsiveColumns.ts
 * @Description: 响应式列数计算
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type { WaterFallBreakpoint } from '@/types/modules/waterfall'
import { DEFAULT_BREAKPOINTS } from '@/components/global/C_WaterFall/constants'

/**
 * 响应式列数 — 根据容器宽度 + 断点配置自动计算列数
 * @param containerRef  容器 DOM 引用
 * @param fixedColumns  固定列数（优先级最高）
 * @param breakpoints   自定义断点配置
 */
export function useResponsiveColumns(
  containerRef: Ref<HTMLElement | undefined>,
  fixedColumns?: Ref<number | undefined>,
  breakpoints?: Ref<WaterFallBreakpoint[] | undefined>
) {
  const columns = ref(4)
  const containerWidth = ref(0)

  /** 根据宽度匹配断点 */
  function resolveColumns(width: number): number {
    // 固定列数优先
    if (fixedColumns?.value && fixedColumns.value > 0) return fixedColumns.value

    const bps = breakpoints?.value?.length
      ? breakpoints.value
      : DEFAULT_BREAKPOINTS
    // 断点从大到小排序，取第一个匹配项
    const sorted = [...bps].sort((a, b) => b.minWidth - a.minWidth)
    for (const bp of sorted) {
      if (width >= bp.minWidth) return bp.columns
    }
    return 1
  }

  let resizeObserver: ResizeObserver | null = null

  /** 初始化 ResizeObserver */
  function startObserving() {
    const el = containerRef.value
    if (!el) return

    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        containerWidth.value = width
        columns.value = resolveColumns(width)
      }
    })
    resizeObserver.observe(el)

    // 立即采样
    const rect = el.getBoundingClientRect()
    containerWidth.value = rect.width
    columns.value = resolveColumns(rect.width)
  }

  /** 停止监听 */
  function stopObserving() {
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  onMounted(startObserving)
  onBeforeUnmount(stopObserving)

  // 容器引用变化时重新绑定
  watch(containerRef, () => {
    stopObserving()
    startObserving()
  })

  // fixedColumns / breakpoints 变化时重新计算（不依赖 resize 事件）
  watch([() => fixedColumns?.value, () => breakpoints?.value], () => {
    if (containerWidth.value > 0) {
      columns.value = resolveColumns(containerWidth.value)
    }
  })

  return {
    columns: readonly(columns),
    containerWidth: readonly(containerWidth),
  }
}
