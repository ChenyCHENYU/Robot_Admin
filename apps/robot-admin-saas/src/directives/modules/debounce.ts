/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:20:30
 * @FilePath: \Robot_Admin\src\directives\modules\debounce.ts
 * @Description: 防抖指令
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Directive } from 'vue'

/**
 * * @description 防抖指令配置选项接口
 */
export interface DebounceOptions {
  disabled?: boolean
  delay?: number
  immediate?: boolean
  onExecute?: () => void
  onCancel?: () => void
}

/**
 * * @description 扩展的 HTML 元素类型，包含防抖相关属性
 */
interface ElType extends HTMLElement {
  _debounceTimer?: number
  _debounceOptions?: DebounceOptions
  _pendingExecution?: boolean
}

/**
 * * @description 解析指令参数，统一处理不同类型的输入
 * ? @param value - 指令绑定值，可以是数字、配置对象或未定义
 * ! @return 标准化的防抖配置选项
 */
function parseOptions(
  value: number | DebounceOptions | undefined
): DebounceOptions {
  if (typeof value === 'number') {
    return {
      disabled: false,
      delay: value,
      immediate: false,
    }
  }

  if (!value) {
    return {
      disabled: false,
      delay: 300,
      immediate: false,
    }
  }

  return {
    disabled: false,
    delay: 300,
    immediate: false,
    ...value,
  }
}

/**
 * * @description 防抖处理器，在捕获阶段拦截事件并执行防抖逻辑
 * ? @param el - 目标 DOM 元素
 * ? @param event - 触发的事件对象
 * ! @return void
 */
function debounceHandler(el: ElType, event: Event): void {
  const options = el._debounceOptions!

  // 如果禁用防抖，不拦截
  if (options.disabled) {
    return
  }

  // 如果有pending执行，阻止当前点击
  if (el._pendingExecution) {
    event.preventDefault()
    event.stopImmediatePropagation()

    // 重置定时器
    if (el._debounceTimer) {
      clearTimeout(el._debounceTimer)
      options.onCancel?.()
    }

    // 重新设置定时器
    el._debounceTimer = setTimeout(() => {
      el._pendingExecution = false
      el._debounceTimer = undefined

      if (!options.immediate) {
        options.onExecute?.()
        // 触发延迟执行
        simulateClick(el)
      }
    }, options.delay) as unknown as number

    return
  }

  // 第一次点击处理
  el._pendingExecution = true

  if (options.immediate) {
    // 立即执行模式：允许当前事件继续，但设置冷却期
    options.onExecute?.()

    el._debounceTimer = setTimeout(() => {
      el._pendingExecution = false
      el._debounceTimer = undefined
    }, options.delay) as unknown as number
  } else {
    // 延迟执行模式：阻止当前事件，设置延迟执行
    event.preventDefault()
    event.stopImmediatePropagation()

    el._debounceTimer = setTimeout(() => {
      el._pendingExecution = false
      el._debounceTimer = undefined
      options.onExecute?.()
      // 触发延迟执行
      simulateClick(el)
    }, options.delay) as unknown as number
  }
}

/**
 * * @description 模拟点击事件，避免递归触发防抖处理器
 * ? @param el - 目标 DOM 元素
 * ! @return void
 */
function simulateClick(el: ElType): void {
  // 暂时移除防抖处理器，避免递归
  const handler = (el as any)._debounceHandler
  if (handler) {
    el.removeEventListener('click', handler, true)
  }

  // 创建并派发点击事件
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })

  el.dispatchEvent(clickEvent)

  // 重新添加防抖处理器
  if (handler) {
    // 使用微任务确保事件处理完成
    Promise.resolve().then(() => {
      el.addEventListener('click', handler, true)
    })
  }
}

/**
 * * @description 清理防抖相关资源，包括定时器和状态
 * ? @param el - 目标 DOM 元素
 * ! @return void
 */
function cleanup(el: ElType): void {
  if (el._debounceTimer) {
    clearTimeout(el._debounceTimer)
    el._debounceTimer = undefined
  }

  el._pendingExecution = false
  delete el._debounceOptions
}

/**
 * * @description Vue 防抖指令，用于防止频繁点击
 * * @description 支持立即执行和延迟执行两种模式
 * * @description 在捕获阶段拦截事件，确保在 Vue 事件处理器之前执行
 */
const debounceDirective: Directive<
  HTMLElement,
  number | DebounceOptions | undefined
> = {
  /**
   * * @description 指令挂载时的处理逻辑
   * ? @param el - 绑定指令的 DOM 元素
   * ? @param binding - 指令绑定对象，包含值和修饰符
   * ! @return void
   */
  mounted(el: ElType, binding) {
    const options = parseOptions(binding.value)
    el._debounceOptions = options
    el._pendingExecution = false

    // 在捕获阶段添加事件监听器，确保在Vue的事件处理器之前执行
    const handler = (event: Event) => debounceHandler(el, event)
    el.addEventListener('click', handler, { capture: true })

    // 保存处理器引用以便清理
    ;(el as any)._debounceHandler = handler
  },

  /**
   * * @description 指令更新时的处理逻辑
   * ? @param el - 绑定指令的 DOM 元素
   * ? @param binding - 指令绑定对象，包含新的值和修饰符
   * ! @return void
   */
  updated(el: ElType, binding) {
    const newOptions = parseOptions(binding.value)
    el._debounceOptions = newOptions
  },

  /**
   * * @description 指令卸载时的清理逻辑
   * ? @param el - 绑定指令的 DOM 元素
   * ! @return void
   */
  unmounted(el: ElType) {
    // 移除事件监听器
    const handler = (el as any)._debounceHandler
    if (handler) {
      el.removeEventListener('click', handler, { capture: true })
      delete (el as any)._debounceHandler
    }

    cleanup(el)
  },
}

export default debounceDirective
