/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\composables\WaterFall\useWaterFallLayout.ts
 * @Description: 瀑布流布局算法引擎
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type {
  WaterFallItem,
  WaterFallLayoutItem,
  WaterFallColumn,
} from '@/types/modules/waterfall'
import { DEFAULT_GAP } from '@/components/global/C_WaterFall/constants'

/**
 * 瀑布流布局算法
 *
 * 核心思路：贪心算法 — 每次将新卡片放入当前最短列。
 *
 * @param items           原始数据
 * @param columns         列数
 * @param containerWidth  容器可用宽度
 * @param gap             间距
 */
export function useWaterFallLayout(
  items: Ref<WaterFallItem[]>,
  columns: Readonly<Ref<number>>,
  containerWidth: Readonly<Ref<number>>,
  gap: Ref<number>
) {
  /** 布局结果 */
  const layoutItems = ref<WaterFallLayoutItem[]>([])
  /** 容器总高度 */
  const containerHeight = ref(0)

  /** 图片实际高度缓存（id → realHeight），避免重复计算 */
  const imageHeightCache = new Map<string | number, number>()

  /** 注册实际加载后的高度 */
  function cacheImageHeight(id: string | number, realHeight: number) {
    imageHeightCache.set(id, realHeight)
  }

  /** 执行布局计算 */
  function calculate() {
    const cols = columns.value
    const width = containerWidth.value
    const g = gap.value ?? DEFAULT_GAP

    if (cols <= 0 || width <= 0 || items.value.length === 0) {
      layoutItems.value = []
      containerHeight.value = 0
      return
    }

    // 每列的可用宽度
    const colWidth = (width - (cols - 1) * g) / cols

    // 初始化列高度
    const columnState: WaterFallColumn[] = Array.from(
      { length: cols },
      (_, i) => ({
        index: i,
        height: 0,
      })
    )

    const result: WaterFallLayoutItem[] = []

    for (const item of items.value) {
      // 选择最短列（同高取最左）
      const shortest = columnState.reduce((min, col) =>
        col.height < min.height ? col : min
      )

      // 等比缩放：通过缓存或原始尺寸计算高度
      const cached = imageHeightCache.get(item.id)
      const itemHeight = cached
        ? cached
        : item.width > 0
          ? (item.height / item.width) * colWidth
          : colWidth // 正方形兜底

      const x = shortest.index * (colWidth + g)
      const y = shortest.height

      result.push({
        item,
        columnIndex: shortest.index,
        x,
        y,
        width: colWidth,
        height: itemHeight,
      })

      // 更新列高度
      shortest.height = y + itemHeight + g
    }

    layoutItems.value = result
    containerHeight.value = Math.max(...columnState.map(c => c.height)) - g
  }

  // 任一依赖变化时重新计算（用 length 忧解 push 变更，避免 deep 深度遍历）
  watch(
    [items, () => items.value.length, columns, containerWidth, gap],
    calculate,
    {
      immediate: true,
    }
  )

  return {
    layoutItems: readonly(layoutItems),
    containerHeight: readonly(containerHeight),
    cacheImageHeight,
    relayout: calculate,
  }
}
