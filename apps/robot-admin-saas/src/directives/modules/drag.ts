/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 08:21:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 09:25:52
 * @FilePath: \Robot_Admin\src\directives\modules\drag.ts
 * @Description: 拖拽指令
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Directive } from 'vue'

export interface DragOptions {
  disabled?: boolean
  handle?: string
  boundary?: boolean | string
  grid?: [number, number]
  axis?: 'x' | 'y' | 'both'
  onStart?: (el: HTMLElement) => void
  onDrag?: (el: HTMLElement, position: Position) => void
  onEnd?: (el: HTMLElement, position: Position) => void
}

export interface Position {
  x: number
  y: number
}

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  boundaryCache?: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
}

interface ElType extends HTMLElement {
  _dragOptions?: DragOptions
  _dragState?: DragState
  _dragHandlers?: {
    mousedown: (e: MouseEvent) => void
    mousemove: (e: MouseEvent) => void
    mouseup: (e: MouseEvent) => void
  }
}

/**
 * * @description 解析指令参数，统一处理各种输入类型
 * ? @param value - 指令绑定值，可以是布尔值、配置对象或undefined
 * ! @return 标准化的拖拽配置对象
 */
function parseOptions(value: boolean | DragOptions | undefined): DragOptions {
  if (!value) return { disabled: true }
  if (typeof value === 'boolean') return { disabled: false }
  return {
    disabled: false,
    boundary: true,
    grid: [1, 1],
    axis: 'both',
    ...value,
  }
}

/**
 * * @description 计算边界限制范围并缓存结果，优化性能
 * ? @param el - 拖拽元素
 * ? @param options - 拖拽配置选项
 * ! @return 边界限制对象，如果无边界限制则返回undefined
 */
function calculateBoundary(el: ElType, options: DragOptions) {
  if (!options.boundary) return undefined

  let container = el.parentElement

  if (typeof options.boundary === 'string') {
    const boundaryEl = document.querySelector(options.boundary) as HTMLElement
    if (boundaryEl) container = boundaryEl
  }

  if (!container) return undefined

  const containerRect = container.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  return {
    minX: 0,
    minY: 0,
    maxX: containerRect.width - elRect.width,
    maxY: containerRect.height - elRect.height,
  }
}

/**
 * * @description 应用位置约束条件，包括轴限制、网格对齐和边界限制
 * ? @param x - 原始X坐标
 * ? @param y - 原始Y坐标
 * ? @param el - 拖拽元素
 * ? @param options - 拖拽配置选项
 * ? @param state - 拖拽状态对象
 * ! @return 约束后的位置坐标
 */
function applyConstraints(
  x: number,
  y: number,
  el: ElType,
  options: DragOptions,
  state: DragState
): Position {
  // 轴限制
  if (options.axis === 'x') y = el.offsetTop
  if (options.axis === 'y') x = el.offsetLeft

  // 网格对齐
  if (options.grid) {
    if (options.grid[0] > 1)
      x = Math.round(x / options.grid[0]) * options.grid[0]
    if (options.grid[1] > 1)
      y = Math.round(y / options.grid[1]) * options.grid[1]
  }

  // 边界限制
  if (state.boundaryCache) {
    const { minX, minY, maxX, maxY } = state.boundaryCache
    x = Math.max(minX, Math.min(maxX, x))
    y = Math.max(minY, Math.min(maxY, y))
  }

  return { x, y }
}

/**
 * * @description 初始化拖拽功能，设置事件监听器和样式
 * ? @param el - 目标拖拽元素
 * ? @param options - 拖拽配置选项
 * ! @return 无返回值
 */
function initDrag(el: ElType, options: DragOptions): void {
  if (options.disabled) return

  // 清理旧的事件监听器
  cleanup(el)

  // 设置样式
  el.style.cursor = 'move'
  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative'
  }

  // 初始化状态
  el._dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  }

  // 确定拖拽触发元素
  const triggerEl = options.handle
    ? (el.querySelector(options.handle) as HTMLElement) || el
    : el

  // 创建事件处理器
  const handlers = {
    mousedown: (e: MouseEvent) => {
      e.preventDefault()

      const state = el._dragState!
      state.isDragging = true
      state.startX = e.clientX
      state.startY = e.clientY
      state.offsetX = e.clientX - el.offsetLeft
      state.offsetY = e.clientY - el.offsetTop

      // 缓存边界计算
      state.boundaryCache = calculateBoundary(el, options)

      // 添加全局事件监听器
      document.addEventListener('mousemove', handlers.mousemove, {
        passive: false,
      })
      document.addEventListener('mouseup', handlers.mouseup, { once: true })

      // 阻止文本选择
      document.body.style.userSelect = 'none'

      options.onStart?.(el)
    },

    mousemove: (e: MouseEvent) => {
      const state = el._dragState!
      if (!state.isDragging) return

      e.preventDefault()

      const rawX = e.clientX - state.offsetX
      const rawY = e.clientY - state.offsetY

      const { x, y } = applyConstraints(rawX, rawY, el, options, state)

      // 批量更新样式
      el.style.left = x + 'px'
      el.style.top = y + 'px'

      options.onDrag?.(el, { x, y })
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mouseup: (e: MouseEvent) => {
      const state = el._dragState!
      if (!state.isDragging) return

      state.isDragging = false

      // 清理事件监听器
      document.removeEventListener('mousemove', handlers.mousemove)

      // 恢复文本选择
      document.body.style.userSelect = ''

      const finalX = parseInt(el.style.left) || 0
      const finalY = parseInt(el.style.top) || 0

      options.onEnd?.(el, { x: finalX, y: finalY })
    },
  }

  // 保存处理器引用
  el._dragHandlers = handlers

  // 绑定mousedown事件
  triggerEl.addEventListener('mousedown', handlers.mousedown, {
    passive: false,
  })
}

/**
 * * @description 清理所有事件监听器和状态数据，防止内存泄漏
 * ? @param el - 需要清理的拖拽元素
 * ! @return 无返回值
 */
function cleanup(el: ElType): void {
  if (el._dragHandlers) {
    // 移除mousedown事件
    const triggerEl = el._dragOptions?.handle
      ? (el.querySelector(el._dragOptions.handle) as HTMLElement) || el
      : el

    triggerEl.removeEventListener('mousedown', el._dragHandlers.mousedown)

    // 移除全局事件（如果存在）
    document.removeEventListener('mousemove', el._dragHandlers.mousemove)
    document.removeEventListener('mouseup', el._dragHandlers.mouseup)

    delete el._dragHandlers
  }

  if (el._dragState) {
    delete el._dragState
  }

  // 恢复样式
  document.body.style.userSelect = ''
}

/**
 * * @description 检查拖拽配置选项是否发生变化，用于优化更新策略
 * ? @param oldOptions - 旧的配置选项
 * ? @param newOptions - 新的配置选项
 * ! @return 配置是否发生变化的布尔值
 */
function optionsChanged(
  oldOptions?: DragOptions,
  newOptions?: DragOptions
): boolean {
  if (!oldOptions || !newOptions) return true

  const keys: (keyof DragOptions)[] = ['disabled', 'handle', 'boundary', 'axis']
  return keys.some(key => {
    if (key === 'grid') {
      return JSON.stringify(oldOptions.grid) !== JSON.stringify(newOptions.grid)
    }
    return oldOptions[key] !== newOptions[key]
  })
}

// 指令定义
const dragDirective: Directive<HTMLElement, boolean | DragOptions | undefined> =
  {
    /**
     * * @description: 指令绑定
     */
    mounted(el: ElType, binding) {
      const options = parseOptions(binding.value)
      el._dragOptions = options
      initDrag(el, options)
    },

    /**
     * * @description: 指令更新
     */
    updated(el: ElType, binding) {
      const newOptions = parseOptions(binding.value)

      // 只有关键配置变化时才重新初始化
      if (optionsChanged(el._dragOptions, newOptions)) {
        el._dragOptions = newOptions
        initDrag(el, newOptions)
      } else {
        // 更新回调函数
        if (el._dragOptions) {
          el._dragOptions.onStart = newOptions.onStart
          el._dragOptions.onDrag = newOptions.onDrag
          el._dragOptions.onEnd = newOptions.onEnd
        }
      }
    },

    /**
     * * @description: 指令卸载
     */
    unmounted(el: ElType) {
      cleanup(el)
      delete el._dragOptions
    },
  }

export default dragDirective
