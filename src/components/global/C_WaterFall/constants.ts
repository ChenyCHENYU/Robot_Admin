/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_WaterFall\constants.ts
 * @Description: 瀑布流组件常量
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { WaterFallBreakpoint } from '@/types/modules/waterfall'

/** 默认卡片间距（px） */
export const DEFAULT_GAP = 16

/** 默认动画时长（ms） */
export const DEFAULT_ANIMATION_DURATION = 300

/** 默认骨架屏数量 */
export const DEFAULT_SKELETON_COUNT = 8

/** 无限滚动触发阈值 — 距底部多少 px 时触发加载（px） */
export const INFINITE_SCROLL_THRESHOLD = 200

/** 默认响应式断点 */
export const DEFAULT_BREAKPOINTS: WaterFallBreakpoint[] = [
  { minWidth: 1600, columns: 6 },
  { minWidth: 1200, columns: 5 },
  { minWidth: 992, columns: 4 },
  { minWidth: 768, columns: 3 },
  { minWidth: 480, columns: 2 },
  { minWidth: 0, columns: 1 },
]

/** 骨架屏高度随机范围（px） */
export const SKELETON_HEIGHT_RANGE: [number, number] = [180, 360]
