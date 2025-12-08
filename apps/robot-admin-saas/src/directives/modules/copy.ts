/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 15:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 16:48:10
 * @FilePath: \Robot_Admin\src\directives\modules\copy.ts
 * @Description: 复制指令
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Directive, DirectiveBinding } from 'vue'

// 类型定义
export interface CopyOptions {
  text?: string
  successMessage?: string | false
  errorMessage?: string | false
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
  messageInstance?: any // 添加 message 实例参数
}

export interface CopyBinding extends Omit<DirectiveBinding, 'value'> {
  value?: string | CopyOptions
}

// 扩展 HTMLElement 类型定义
declare global {
  interface HTMLElement {
    _copyHandler?: (event: Event) => Promise<void>
  }
}

/**
 * * @description 复制文本到剪贴板
 * ? @param text - 要复制的文本内容
 * ! @return Promise<void> 复制操作的 Promise
 */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('复制失败')
      }
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * * @description 解析指令参数配置
 * ? @param value - 指令绑定的值，可以是字符串、配置对象或 undefined
 * ! @return 解析后的配置对象
 */
function parseOptions(
  value: string | CopyOptions | undefined
): Required<CopyOptions> {
  // 如果没有传参数，返回默认配置
  if (!value) {
    return {
      text: '',
      successMessage: '复制成功',
      errorMessage: '复制失败',
      onSuccess: () => {},
      onError: () => {},
      disabled: false,
      messageInstance: null,
    }
  }

  // 如果是字符串
  if (typeof value === 'string') {
    return {
      text: value,
      successMessage: '复制成功',
      errorMessage: '复制失败',
      onSuccess: () => {},
      onError: () => {},
      disabled: false,
      messageInstance: null,
    }
  }

  // 如果是对象配置
  return {
    text: value.text || '',
    successMessage: value.successMessage ?? '复制成功',
    errorMessage: value.errorMessage ?? '复制失败',
    onSuccess: value.onSuccess || (() => {}),
    onError: value.onError || (() => {}),
    disabled: value.disabled || false,
    messageInstance: value.messageInstance || null,
  }
}

/**
 * * @description 显示消息提示
 * ? @param message - 要显示的消息内容
 * ? @param type - 消息类型，success 或 error
 * ! @return void
 */
function showMessage(
  message: string,
  type: 'success' | 'error' = 'success'
): void {
  // 简单的消息提示，使用 console 作为降级方案
  // 在实际使用时，会在组件中通过 useMessage() 获取 message 实例
  console.log(`${type === 'success' ? '✅' : '❌'} ${message}`)
}

/**
 * * @description 添加状态样式类名
 * ? @param el - 目标 HTML 元素
 * ? @param className - 要添加的 CSS 类名
 * ? @param duration - 样式持续时间（毫秒）
 * ! @return void
 */
function addStatusClass(
  el: HTMLElement,
  className: string,
  duration: number
): void {
  el.classList.add(className)
  setTimeout(() => {
    el.classList.remove(className)
  }, duration)
}

/**
 * * @description 获取要复制的文本内容
 * ? @param options - 复制配置选项
 * ? @param el - 目标 HTML 元素
 * ! @return 复制的文本内容
 */
function getCopyText(options: Required<CopyOptions>, el: HTMLElement): string {
  const copyText = options.text || el.textContent || el.innerText || ''
  if (!copyText.trim()) {
    throw new Error('没有可复制的内容')
  }
  return copyText
}

/**
 * * @description 处理复制成功的情况
 * ? @param options - 复制配置选项
 * ? @param el - 目标 HTML 元素
 * ? @param copyText - 复制的文本内容
 * ! @return void
 */
function handleCopySuccess(
  options: Required<CopyOptions>,
  el: HTMLElement,
  copyText: string
): void {
  options.onSuccess(copyText)

  if (options.successMessage) {
    const messageHandler =
      options.messageInstance?.success ||
      ((msg: string) => showMessage(msg, 'success'))
    messageHandler(options.successMessage)
  }

  addStatusClass(el, 'copy-success', 300)
}

/**
 * * @description 处理复制失败的情况
 * ? @param options - 复制配置选项
 * ? @param el - 目标 HTML 元素
 * ? @param error - 错误对象
 * ! @return void
 */
function handleCopyError(
  options: Required<CopyOptions>,
  el: HTMLElement,
  error: Error
): void {
  options.onError(error)

  if (options.errorMessage) {
    const messageHandler =
      options.messageInstance?.error ||
      ((msg: string) => showMessage(msg, 'error'))
    messageHandler(options.errorMessage)
  }

  addStatusClass(el, 'copy-error', 300)
}

/**
 * * @description 创建复制点击处理函数
 * ? @param options - 复制配置选项
 * ? @param el - 目标 HTML 元素
 * ! @return 异步点击处理函数
 */
function createClickHandler(options: Required<CopyOptions>, el: HTMLElement) {
  return async (): Promise<void> => {
    if (options.disabled) return

    try {
      const copyText = getCopyText(options, el)
      await copyToClipboard(copyText)
      handleCopySuccess(options, el, copyText)
    } catch (error) {
      handleCopyError(options, el, error as Error)
    }
  }
}

// 指令实现
const copyDirective: Directive<HTMLElement, string | CopyOptions | undefined> =
  {
    /**
     * * @description 指令挂载时的钩子函数
     * ? @param el - 绑定指令的 HTML 元素
     * ? @param binding - 指令绑定对象
     * ! @return void
     */
    mounted(el: HTMLElement, binding: CopyBinding): void {
      const options = parseOptions(binding.value)
      const handleClick = createClickHandler(options, el)

      el.addEventListener('click', handleClick)
      el._copyHandler = handleClick

      // 设置样式
      el.style.cursor = options.disabled ? 'not-allowed' : 'pointer'
      el.setAttribute('data-copy', 'true')

      // 添加 title 提示
      if (!el.title && !options.disabled) {
        el.title = '点击复制'
      }
    },

    /**
     * * @description 指令更新时的钩子函数
     * ? @param el - 绑定指令的 HTML 元素
     * ? @param binding - 指令绑定对象
     * ! @return void
     */
    updated(el: HTMLElement, binding: CopyBinding): void {
      const options = parseOptions(binding.value)

      // 移除旧的事件监听器
      if (el._copyHandler) {
        el.removeEventListener('click', el._copyHandler)
      }

      // 创建新的事件处理器
      const handleClick = createClickHandler(options, el)
      el.addEventListener('click', handleClick)
      el._copyHandler = handleClick

      // 更新样式
      el.style.cursor = options.disabled ? 'not-allowed' : 'pointer'

      // 更新 title
      if (options.disabled) {
        el.title = ''
      } else if (!el.title) {
        el.title = '点击复制'
      }
    },

    /**
     * * @description 指令卸载时的钩子函数
     * ? @param el - 绑定指令的 HTML 元素
     * ! @return void
     */
    unmounted(el: HTMLElement): void {
      // 清理事件监听器
      if (el._copyHandler) {
        el.removeEventListener('click', el._copyHandler)
        delete el._copyHandler
      }

      // 清理属性
      el.removeAttribute('data-copy')
      el.style.cursor = ''
      el.title = ''
    },
  }

// 默认导出
export default copyDirective
