/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 15:31:21
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:13:13
 * @FilePath: \Robot_Admin\src\directives\modules\longpress.ts
 * @Description: 长按指令
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Directive } from 'vue'

/**
 * * @description 长按指令配置选项接口
 */
export interface LongPressOptions {
  disabled?: boolean
  duration?: number
  onStart?: (event: Event) => void
  onProgress?: (progress: number, elapsed: number) => void
  onTrigger?: (event: Event) => void
  onCancel?: (event: Event) => void
}

/**
 * * @description 扩展的HTML元素类型，包含长按相关属性
 */
interface ElType extends HTMLElement {
  _longPressTimer?: number
  _longPressOptions?: LongPressOptions
  _longPressStartTime?: number
  _longPressProgressTimer?: number
  _isLongPressing?: boolean
}

/**
 * * @description 解析指令参数，统一处理不同类型的输入
 * ? @param value - 指令绑定值，可以是数字、配置对象或未定义
 * ! @return 标准化的长按配置选项
 */
function parseOptions(
  value: number | LongPressOptions | undefined
): LongPressOptions {
  if (typeof value === 'number') {
    return { duration: value, disabled: false }
  }
  return { duration: 800, disabled: false, ...value }
}

/**
 * * @description 清理长按相关定时器
 * ? @param el - 目标DOM元素
 * ! @return void
 */
function clearTimers(el: ElType): void {
  if (el._longPressTimer) {
    clearTimeout(el._longPressTimer)
    el._longPressTimer = undefined
  }
  if (el._longPressProgressTimer) {
    clearInterval(el._longPressProgressTimer)
    el._longPressProgressTimer = undefined
  }
}

/**
 * * @description 开始长按操作，设置定时器和进度跟踪
 * ? @param el - 目标DOM元素
 * ? @param event - 触发事件对象
 * ! @return void
 */
function startLongPress(el: ElType, event: Event): void {
  const options = el._longPressOptions!

  if (options.disabled || el._isLongPressing) return

  el._isLongPressing = true
  el._longPressStartTime = Date.now()

  options.onStart?.(event)

  const duration = options.duration ?? 800

  // 进度跟踪
  if (options.onProgress) {
    el._longPressProgressTimer = setInterval(() => {
      const elapsed = Date.now() - el._longPressStartTime!
      const progress = Math.min(elapsed / duration, 1)
      options.onProgress!(progress, elapsed)
    }, 16) as unknown as number
  }

  // 长按触发
  el._longPressTimer = setTimeout(() => {
    options.onTrigger?.(event)
    clearTimers(el)
  }, duration) as unknown as number
}

/**
 * * @description 结束长按操作，清理状态和定时器
 * ? @param el - 目标DOM元素
 * ? @param event - 触发事件对象
 * ? @param isCanceled - 是否为取消操作，默认为false
 * ! @return void
 */
function endLongPress(el: ElType, event: Event, isCanceled = false): void {
  if (!el._isLongPressing) return

  const options = el._longPressOptions!
  const elapsed = el._longPressStartTime
    ? Date.now() - el._longPressStartTime
    : 0
  const duration = options.duration ?? 800

  if (isCanceled || elapsed < duration) {
    options.onCancel?.(event)
  }

  clearTimers(el)
  el._isLongPressing = false
}

/**
 * * @description Vue长按指令，支持鼠标和触摸事件的长按检测
 * * @description 提供丰富的回调选项和进度跟踪功能
 */
const longPressDirective: Directive<
  HTMLElement,
  number | LongPressOptions | undefined
> = {
  /**
   * * @description 指令挂载时的处理逻辑
   * ? @param el - 绑定指令的DOM元素
   * ? @param binding - 指令绑定对象，包含值和修饰符
   * ! @return void
   */
  mounted(el: ElType, binding) {
    el._longPressOptions = parseOptions(binding.value)
    el._isLongPressing = false

    const handleStart = (e: Event) => startLongPress(el, e)
    const handleEnd = (e: Event) => endLongPress(el, e)
    const handleCancel = (e: Event) => endLongPress(el, e, true)

    el.addEventListener('mousedown', handleStart)
    el.addEventListener('touchstart', handleStart)
    el.addEventListener('mouseup', handleEnd)
    el.addEventListener('touchend', handleEnd)
    el.addEventListener('mouseleave', handleCancel)
    el.addEventListener('touchcancel', handleCancel)

    // 保存处理器引用
    ;(el as any)._handlers = { handleStart, handleEnd, handleCancel }
  },

  /**
   * * @description 指令更新时的处理逻辑
   * ? @param el - 绑定指令的DOM元素
   * ? @param binding - 指令绑定对象，包含新的值和修饰符
   * ! @return void
   */
  updated(el: ElType, binding) {
    el._longPressOptions = parseOptions(binding.value)
  },

  /**
   * * @description 指令卸载时的清理逻辑
   * ? @param el - 绑定指令的DOM元素
   * ! @return void
   */
  unmounted(el: ElType) {
    const handlers = (el as any)._handlers
    if (handlers) {
      el.removeEventListener('mousedown', handlers.handleStart)
      el.removeEventListener('touchstart', handlers.handleStart)
      el.removeEventListener('mouseup', handlers.handleEnd)
      el.removeEventListener('touchend', handlers.handleEnd)
      el.removeEventListener('mouseleave', handlers.handleCancel)
      el.removeEventListener('touchcancel', handlers.handleCancel)
    }
    clearTimers(el)
  },
}

export default longPressDirective
