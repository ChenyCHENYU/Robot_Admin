/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 14:11:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:50:42
 * @FilePath: \Robot_Admin\src\directives\modules\throttle.ts
 * @Description: 节流指令
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Directive } from 'vue'

/**
 * * @description 节流指令配置选项接口
 */
export interface ThrottleOptions {
  disabled?: boolean
  delay?: number
  leading?: boolean
  trailing?: boolean
  onExecute?: () => void
  onThrottle?: () => void
}

/**
 * * @description 扩展的 HTML 元素类型，包含节流相关属性
 */
interface ElType extends HTMLElement {
  _throttleTimer?: number
  _throttleOptions?: ThrottleOptions
  _lastExecTime?: number
  _isThrottling?: boolean
  _pendingTrailing?: boolean
}

/**
 * * @description 解析指令参数，统一处理不同类型的输入
 * ? @param value - 指令绑定值，可以是数字、配置对象或未定义
 * ! @return 标准化的节流配置选项
 */
function parseOptions(
  value: number | ThrottleOptions | undefined
): ThrottleOptions {
  if (typeof value === 'number') {
    return {
      disabled: false,
      delay: value,
      leading: true,
      trailing: true,
    }
  }

  if (!value) {
    return {
      disabled: false,
      delay: 300,
      leading: true,
      trailing: true,
    }
  }

  return {
    disabled: false,
    delay: 300,
    leading: true,
    trailing: true,
    ...value,
  }
}

/**
 * * @description 初始化元素的执行时间
 * ? @param el - 目标 DOM 元素
 * ! @return void
 */
function initializeLastExecTime(el: ElType): void {
  if (!el._lastExecTime) {
    el._lastExecTime = 0
  }
}

/**
 * * @description 计算时间信息
 * ? @param el - 目标 DOM 元素
 * ? @param options - 节流配置选项
 * ! @return 包含时间计算结果的对象
 */
function calculateTimeInfo(el: ElType, options: ThrottleOptions) {
  const now = Date.now()
  const timeSinceLastExec = now - el._lastExecTime!
  const delay = options.delay ?? 300
  const shouldExec = timeSinceLastExec >= delay

  return {
    now,
    timeSinceLastExec,
    shouldExec,
    delay,
  }
}

/**
 * * @description 阻止事件执行并触发节流回调
 * ? @param event - 事件对象
 * ? @param options - 节流配置选项
 * ! @return void
 */
function preventEventAndTriggerThrottle(
  event: Event,
  options: ThrottleOptions
): void {
  event.preventDefault()
  event.stopImmediatePropagation()
  options.onThrottle?.()
}

/**
 * * @description 设置延迟执行定时器
 * ? @param el - 目标 DOM 元素
 * ? @param delay - 延迟时间
 * ? @param callback - 回调函数
 * ! @return void
 */
function setDelayedExecution(
  el: ElType,
  delay: number,
  callback: () => void
): void {
  el._throttleTimer = setTimeout(() => {
    el._isThrottling = false
    el._pendingTrailing = false
    el._throttleTimer = undefined
    el._lastExecTime = Date.now()
    callback()
    simulateClick(el)
  }, delay) as unknown as number
}

/**
 * * @description 处理节流期间的后缘执行
 * ? @param el - 目标 DOM 元素
 * ? @param options - 节流配置选项
 * ? @param timeSinceLastExec - 距离上次执行的时间
 * ? @param delay - 节流延迟时间
 * ! @return void
 */
function handleTrailingExecution(
  el: ElType,
  options: ThrottleOptions,
  timeSinceLastExec: number,
  delay: number
): void {
  if (!options.trailing || el._pendingTrailing) {
    return
  }

  el._pendingTrailing = true
  const remainingTime = delay - timeSinceLastExec

  setDelayedExecution(el, remainingTime, () => {
    options.onExecute?.()
  })
}

/**
 * * @description 处理正在节流中的状态
 * ? @param el - 目标 DOM 元素
 * ? @param event - 事件对象
 * ? @param options - 节流配置选项
 * ? @param timeSinceLastExec - 距离上次执行的时间
 * ? @param delay - 节流延迟时间
 * ! @return void
 */
function handleThrottlingState(
  el: ElType,
  event: Event,
  options: ThrottleOptions,
  timeSinceLastExec: number,
  delay: number
): void {
  preventEventAndTriggerThrottle(event, options)
  handleTrailingExecution(el, options, timeSinceLastExec, delay)
}

/**
 * * @description 处理前缘执行逻辑
 * ? @param el - 目标 DOM 元素
 * ? @param options - 节流配置选项
 * ? @param now - 当前时间戳
 * ? @param delay - 节流延迟时间
 * ! @return void
 */
function handleLeadingExecution(
  el: ElType,
  options: ThrottleOptions,
  now: number,
  delay: number
): void {
  el._lastExecTime = now
  el._isThrottling = true
  options.onExecute?.()

  // 设置节流期
  el._throttleTimer = setTimeout(() => {
    el._isThrottling = false
    el._throttleTimer = undefined
  }, delay) as unknown as number
}

/**
 * * @description 处理非前缘执行逻辑
 * ? @param el - 目标 DOM 元素
 * ? @param event - 事件对象
 * ? @param options - 节流配置选项
 * ? @param delay - 节流延迟时间
 * ! @return void
 */
function handleNonLeadingExecution(
  el: ElType,
  event: Event,
  options: ThrottleOptions,
  delay: number
): void {
  preventEventAndTriggerThrottle(event, options)

  el._isThrottling = true
  setDelayedExecution(el, delay, () => {
    options.onExecute?.()
  })
}

/**
 * * @description 处理首次或间隔满足时的执行
 * ? @param el - 目标 DOM 元素
 * ? @param event - 事件对象
 * ? @param options - 节流配置选项
 * ? @param now - 当前时间戳
 * ? @param delay - 节流延迟时间
 * ! @return boolean 是否允许事件继续执行
 */
function handleValidExecution(
  el: ElType,
  event: Event,
  options: ThrottleOptions,
  now: number,
  delay: number
): boolean {
  if (options.leading) {
    handleLeadingExecution(el, options, now, delay)
    return true // 允许事件继续执行
  } else {
    handleNonLeadingExecution(el, event, options, delay)
    return false // 阻止事件执行
  }
}

/**
 * * @description 处理节流期内的执行阻止
 * ? @param el - 目标 DOM 元素
 * ? @param event - 事件对象
 * ? @param options - 节流配置选项
 * ? @param timeSinceLastExec - 距离上次执行的时间
 * ? @param delay - 节流延迟时间
 * ! @return void
 */
function handleBlockedExecution(
  el: ElType,
  event: Event,
  options: ThrottleOptions,
  timeSinceLastExec: number,
  delay: number
): void {
  preventEventAndTriggerThrottle(event, options)

  el._isThrottling = true

  // 清除已有定时器并设置新的节流期结束时间
  if (el._throttleTimer) {
    clearTimeout(el._throttleTimer)
  }

  const remainingTime = delay - timeSinceLastExec
  el._throttleTimer = setTimeout(() => {
    el._isThrottling = false
    el._throttleTimer = undefined
  }, remainingTime) as unknown as number
}

/**
 * * @description 节流处理器主函数，协调各个处理逻辑
 * ? @param el - 目标 DOM 元素
 * ? @param event - 触发的事件对象
 * ! @return void
 */
function throttleHandler(el: ElType, event: Event): void {
  const options = el._throttleOptions!

  // 如果禁用节流，不拦截
  if (options.disabled) {
    return
  }

  initializeLastExecTime(el)
  const { now, timeSinceLastExec, shouldExec, delay } = calculateTimeInfo(
    el,
    options
  )

  // 如果正在节流中
  if (el._isThrottling) {
    handleThrottlingState(el, event, options, timeSinceLastExec, delay)
    return
  }

  // 第一次执行或时间间隔已满足
  if (shouldExec || el._lastExecTime === 0) {
    handleValidExecution(el, event, options, now, delay)
    return
  }

  // 在节流期内，阻止执行
  handleBlockedExecution(el, event, options, timeSinceLastExec, delay)
}

/**
 * * @description 模拟点击事件，避免递归触发节流处理器
 * ? @param el - 目标 DOM 元素
 * ! @return void
 */
function simulateClick(el: ElType): void {
  // 暂时移除节流处理器，避免递归
  const handler = (el as any)._throttleHandler
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

  // 重新添加节流处理器
  if (handler) {
    // 使用微任务确保事件处理完成
    Promise.resolve().then(() => {
      el.addEventListener('click', handler, true)
    })
  }
}

/**
 * * @description 清理节流相关资源，包括定时器和状态
 * ? @param el - 目标 DOM 元素
 * ! @return void
 */
function cleanup(el: ElType): void {
  if (el._throttleTimer) {
    clearTimeout(el._throttleTimer)
    el._throttleTimer = undefined
  }

  el._isThrottling = false
  el._pendingTrailing = false
  el._lastExecTime = undefined
  delete el._throttleOptions
}

/**
 * * @description Vue 节流指令，用于控制函数执行频率
 * * @description 支持 leading 和 trailing 两种执行模式
 * * @description 在捕获阶段拦截事件，确保在 Vue 事件处理器之前执行
 */
const throttleDirective: Directive<
  HTMLElement,
  number | ThrottleOptions | undefined
> = {
  /**
   * * @description 指令挂载时的处理逻辑
   * ? @param el - 绑定指令的 DOM 元素
   * ? @param binding - 指令绑定对象，包含值和修饰符
   * ! @return void
   */
  mounted(el: ElType, binding) {
    const options = parseOptions(binding.value)
    el._throttleOptions = options
    el._isThrottling = false
    el._pendingTrailing = false
    el._lastExecTime = 0

    // 在捕获阶段添加事件监听器，确保在Vue的事件处理器之前执行
    const handler = (event: Event) => throttleHandler(el, event)
    el.addEventListener('click', handler, { capture: true })

    // 保存处理器引用以便清理
    ;(el as any)._throttleHandler = handler
  },

  /**
   * * @description 指令更新时的处理逻辑
   * ? @param el - 绑定指令的 DOM 元素
   * ? @param binding - 指令绑定对象，包含新的值和修饰符
   * ! @return void
   */
  updated(el: ElType, binding) {
    const newOptions = parseOptions(binding.value)
    el._throttleOptions = newOptions
  },

  /**
   * * @description 指令卸载时的清理逻辑
   * ? @param el - 绑定指令的 DOM 元素
   * ! @return void
   */
  unmounted(el: ElType) {
    // 移除事件监听器
    const handler = (el as any)._throttleHandler
    if (handler) {
      el.removeEventListener('click', handler, { capture: true })
      delete (el as any)._throttleHandler
    }

    cleanup(el)
  },
}

export default throttleDirective
