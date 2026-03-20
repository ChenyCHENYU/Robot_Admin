/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\48-waterfall\data.ts
 * @Description: 瀑布流演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { WaterFallItem } from '@robot-admin/naive-ui-components'

/** 随机高度范围 */
const HEIGHT_RANGE: [number, number] = [300, 800]
const WIDTH = 640

/** 生成演示图片 URL（使用 picsum.photos） */
function createDemoUrl(seed: number, w: number, h: number) {
  return `https://picsum.photos/seed/wf${seed}/${w}/${h}`
}

/** 生成单条数据 */
function createItem(index: number): WaterFallItem {
  const h = Math.round(
    HEIGHT_RANGE[0] + Math.random() * (HEIGHT_RANGE[1] - HEIGHT_RANGE[0])
  )
  return {
    id: `img-${index}`,
    src: createDemoUrl(index, WIDTH, h),
    width: WIDTH,
    height: h,
    title: `Photo #${index + 1}`,
    description: `Random image ${WIDTH}×${h}`,
  }
}

/** 批量生成数据 */
export function generateItems(
  startIndex: number,
  count: number
): WaterFallItem[] {
  return Array.from({ length: count }, (_, i) => createItem(startIndex + i))
}

/** 初始数据（20 张） */
export const INITIAL_ITEMS: WaterFallItem[] = generateItems(0, 20)

/** 每次加载更多的数量 */
export const PAGE_SIZE = 12

/** 最大总数（模拟分页终点） */
export const MAX_TOTAL = 80

/** 列数选项 */
export const COLUMN_OPTIONS = [
  { label: '自动', value: 0 },
  { label: '2 列', value: 2 },
  { label: '3 列', value: 3 },
  { label: '4 列', value: 4 },
  { label: '5 列', value: 5 },
  { label: '6 列', value: 6 },
]

/** 间距选项 */
export const GAP_OPTIONS = [
  { label: '8px', value: 8 },
  { label: '12px', value: 12 },
  { label: '16px', value: 16 },
  { label: '24px', value: 24 },
]
