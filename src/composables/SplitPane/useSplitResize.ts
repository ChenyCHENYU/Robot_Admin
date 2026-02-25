/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\composables\SplitPane\useSplitResize.ts
 * @Description: 分割面板拖拽调整逻辑
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type { CollapseTarget, SplitDirection } from '@/types/modules/split-pane'

interface UseSplitResizeOptions {
  /** 容器引用 */
  containerRef: Ref<HTMLElement | null>
  /** 分割方向 */
  direction: Ref<SplitDirection>
  /** 首面板默认大小（百分比） */
  defaultSize: number
  /** 首面板最小大小（百分比） */
  minSize: number
  /** 首面板最大大小（百分比） */
  maxSize: number
  /** 是否禁用 */
  disabled: Ref<boolean>
  /** 是否可折叠 */
  collapsible: Ref<boolean>
  /** 键盘微调步长（百分比） */
  step: number
  /** resize 回调 */
  onResize?: (firstSize: number, secondSize: number) => void
  /** 折叠回调 */
  onCollapse?: (target: CollapseTarget) => void
  /** 展开回调 */
  onExpand?: (target: CollapseTarget) => void
  /** 拖拽开始回调 */
  onDragStart?: (size: number) => void
  /** 拖拽结束回调 */
  onDragEnd?: (size: number) => void
}

/**
 * 分割面板拖拽调整逻辑
 */
export function useSplitResize(options: UseSplitResizeOptions) {
  const {
    containerRef,
    direction,
    defaultSize,
    minSize,
    maxSize,
    disabled,
    collapsible,
    step,
    onResize,
    onCollapse,
    onExpand,
    onDragStart,
    onDragEnd,
  } = options

  /** 首面板当前大小（百分比） */
  const panelSize = ref(defaultSize)
  /** 是否正在拖拽 */
  const isDragging = ref(false)
  /** 折叠状态 */
  const collapsedTarget = ref<CollapseTarget | null>(null)
  /** 折叠前记住的面板大小 */
  const sizeBeforeCollapse = ref(defaultSize)

  /** 首面板是否折叠 */
  const isFirstCollapsed = computed(() => collapsedTarget.value === 'first')
  /** 第二面板是否折叠 */
  const isSecondCollapsed = computed(() => collapsedTarget.value === 'second')

  /**
   * 将大小限制在 min/max 范围内
   */
  const clampSize = (size: number): number => {
    return Math.min(maxSize, Math.max(minSize, size))
  }

  /**
   * 获取容器在分割方向上的总长度（px）
   */
  const getContainerLength = (): number => {
    const container = containerRef.value
    if (!container) return 0
    return direction.value === 'horizontal'
      ? container.offsetWidth
      : container.offsetHeight
  }

  /**
   * 获取容器在分割方向上的起始坐标
   */
  const getContainerStart = (): number => {
    const container = containerRef.value
    if (!container) return 0
    const rect = container.getBoundingClientRect()
    return direction.value === 'horizontal' ? rect.left : rect.top
  }

  /**
   * 根据鼠标/触摸位置计算面板大小（百分比）
   */
  const calcSizeFromPosition = (clientPos: number): number => {
    const containerLength = getContainerLength()
    if (containerLength === 0) return panelSize.value

    const containerStart = getContainerStart()
    const offset = clientPos - containerStart
    const percentage = (offset / containerLength) * 100

    return clampSize(percentage)
  }

  /**
   * 获取事件的位置坐标
   */
  const getClientPos = (e: MouseEvent | TouchEvent): number => {
    if (e instanceof TouchEvent) {
      return direction.value === 'horizontal'
        ? e.touches[0].clientX
        : e.touches[0].clientY
    }
    return direction.value === 'horizontal' ? e.clientX : e.clientY
  }

  /**
   * 更新面板大小
   */
  const updateSize = (newSize: number) => {
    const clamped = clampSize(newSize)
    panelSize.value = clamped
    onResize?.(clamped, 100 - clamped)
  }

  // ─── 拖拽逻辑 ────────────────────────────────────
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value || disabled.value) return

    e.preventDefault()
    const pos = getClientPos(e)
    const newSize = calcSizeFromPosition(pos)

    // 拖拽过程中取消折叠状态
    if (collapsedTarget.value) {
      collapsedTarget.value = null
    }
    updateSize(newSize)
  }

  const handleMouseUp = () => {
    if (!isDragging.value) return

    isDragging.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    onDragEnd?.(panelSize.value)

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleMouseMove)
    document.removeEventListener('touchend', handleMouseUp)
  }

  const handleMouseDown = (e: MouseEvent | TouchEvent) => {
    if (disabled.value) return

    e.preventDefault()
    // preventDefault 会阻止默认聚焦行为，需手动 focus 以支持键盘控制
    ;(e.currentTarget as HTMLElement)?.focus()
    isDragging.value = true

    document.body.style.cursor =
      direction.value === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'

    onDragStart?.(panelSize.value)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleMouseMove, { passive: false })
    document.addEventListener('touchend', handleMouseUp)
  }

  // ─── 双击折叠 ────────────────────────────────────
  const handleDoubleClick = () => {
    if (disabled.value || !collapsible.value) return
    toggle('first')
  }

  // ─── 折叠 / 展开 ─────────────────────────────────
  const collapse = (target: CollapseTarget = 'first') => {
    if (!collapsible.value || collapsedTarget.value === target) return

    // 记住折叠前的大小
    if (!collapsedTarget.value) {
      sizeBeforeCollapse.value = panelSize.value
    }

    collapsedTarget.value = target

    if (target === 'first') {
      panelSize.value = 0
    } else {
      panelSize.value = 100
    }

    onCollapse?.(target)
    onResize?.(panelSize.value, 100 - panelSize.value)
  }

  const expand = () => {
    if (!collapsedTarget.value) return

    const target = collapsedTarget.value
    collapsedTarget.value = null
    panelSize.value = sizeBeforeCollapse.value

    onExpand?.(target)
    onResize?.(panelSize.value, 100 - panelSize.value)
  }

  const toggle = (target: CollapseTarget = 'first') => {
    if (collapsedTarget.value) {
      expand()
    } else {
      collapse(target)
    }
  }

  // ─── 键盘微调 ────────────────────────────────────
  /**
   * 根据按键获取增量
   */
  const getKeyDelta = (key: string, isHorizontal: boolean): number | null => {
    const keyMap: Record<string, number | null> = {
      ArrowLeft: isHorizontal ? -step : 0,
      ArrowRight: isHorizontal ? step : 0,
      ArrowUp: !isHorizontal ? -step : 0,
      ArrowDown: !isHorizontal ? step : 0,
    }
    return keyMap[key] ?? null
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled.value) return

    // Home / End 直接跳到极值
    if (e.key === 'Home') {
      updateSize(minSize)
      e.preventDefault()
      return
    }
    if (e.key === 'End') {
      updateSize(maxSize)
      e.preventDefault()
      return
    }

    const delta = getKeyDelta(e.key, direction.value === 'horizontal')
    if (delta === null || delta === 0) return

    e.preventDefault()
    if (collapsedTarget.value) collapsedTarget.value = null
    updateSize(panelSize.value + delta)
  }

  // ─── 重置 / 查询 ──────────────────────────────────
  const resetSize = () => {
    collapsedTarget.value = null
    panelSize.value = defaultSize
    onResize?.(defaultSize, 100 - defaultSize)
  }

  const setSize = (size: number) => {
    collapsedTarget.value = null
    updateSize(size)
  }

  const getPanelInfo = () => ({
    first: {
      size: panelSize.value,
      collapsed: isFirstCollapsed.value,
    },
    second: {
      size: 100 - panelSize.value,
      collapsed: isSecondCollapsed.value,
    },
  })

  // 清理
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleMouseMove)
    document.removeEventListener('touchend', handleMouseUp)
  })

  return {
    panelSize,
    isDragging,
    collapsedTarget,
    isFirstCollapsed,
    isSecondCollapsed,
    handleMouseDown,
    handleDoubleClick,
    handleKeyDown,
    collapse,
    expand,
    toggle,
    resetSize,
    setSize,
    getPanelInfo,
  }
}
