/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\waterfall.d.ts
 * @Description: 瀑布流组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// ─── 数据项 ─────────────────────────────────────

/** 瀑布流单项数据 */
export interface WaterFallItem {
  /** 唯一标识 */
  id: string | number
  /** 图片地址 */
  src: string
  /** 图片原始宽度（px） */
  width: number
  /** 图片原始高度（px） */
  height: number
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 附加数据（透传给插槽） */
  [key: string]: any
}

// ─── 布局 ───────────────────────────────────────

/** 布局后的定位项（绝对定位坐标） */
export interface WaterFallLayoutItem {
  /** 对应原始数据 */
  item: WaterFallItem
  /** 列索引 */
  columnIndex: number
  /** left 偏移（px） */
  x: number
  /** top 偏移（px） */
  y: number
  /** 渲染宽度（px） */
  width: number
  /** 渲染高度（px） */
  height: number
}

/** 列状态 */
export interface WaterFallColumn {
  /** 列索引 */
  index: number
  /** 当前列累计高度 */
  height: number
}

// ─── 响应式断点 ─────────────────────────────────

/** 断点配置 */
export interface WaterFallBreakpoint {
  /** 最小宽度（px） */
  minWidth: number
  /** 该断点下的列数 */
  columns: number
}

// ─── 无限滚动 ───────────────────────────────────

/** 无限滚动状态 */
export type InfiniteScrollStatus = 'idle' | 'loading' | 'no-more' | 'error'

// ─── Props / Events / Expose ────────────────────

/** 瀑布流 Props */
export interface WaterFallProps {
  /** 数据列表 */
  items: WaterFallItem[]
  /** 固定列数（设置后忽略响应式） */
  columns?: number
  /** 卡片间距（px） */
  gap?: number
  /** 是否启用图片懒加载 */
  lazy?: boolean
  /** 是否启用无限滚动 */
  infinite?: boolean
  /** 是否显示骨架屏 */
  skeleton?: boolean
  /** 骨架屏数量 */
  skeletonCount?: number
  /** 动画过渡时长（ms） */
  animationDuration?: number
  /** 响应式断点配置 */
  breakpoints?: WaterFallBreakpoint[]
  /** 加载状态 */
  loading?: boolean
  /** 是否还有更多数据 */
  noMore?: boolean
}

/** 瀑布流 Events */
export interface WaterFallEmits {
  /** 触发加载更多 */
  'load-more': []
  /** 卡片点击 */
  'item-click': [item: WaterFallItem, index: number]
  /** 图片加载完成 */
  'image-loaded': [item: WaterFallItem]
  /** 图片加载失败 */
  'image-error': [item: WaterFallItem]
}

/** 瀑布流暴露方法 */
export interface WaterFallExpose {
  /** 强制重新布局 */
  relayout: () => void
  /** 滚动到顶部 */
  scrollToTop: () => void
  /** 获取当前列数 */
  getColumns: () => number
  /** 获取容器总高度 */
  getContainerHeight: () => number
}
