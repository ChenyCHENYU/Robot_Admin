/*
 * @Description: 全局错误处理入口 - 优化版
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import { handleError, createErrorContext, stopCleanupTimer } from './handler'

// 资源标签列表
const RESOURCE_TAGS = ['img', 'script', 'link', 'video', 'audio'] as const

/**
 * 检查是否为已处理的错误
 */
const isHandledError = (error: any): boolean => error?.handled === true

/**
 * 获取组件名称
 */
const getComponentName = (instance: any): string | undefined => {
  return instance?.$options?.name || instance?.$options?.__name
}

/**
 * 设置 Vue 错误处理
 */
const setupVueErrorHandler = (app: App): void => {
  app.config.errorHandler = (err: any, instance, info: string) => {
    if (isHandledError(err)) return

    const context = createErrorContext('vue', err, getComponentName(instance), {
      info,
    })
    handleError(context, { showMessage: true, logToConsole: true })
  }
}

/**
 * 设置 Promise 错误处理
 */
const setupPromiseErrorHandler = (): void => {
  // 浏览器扩展（Vue DevTools 等）通信错误，与应用逻辑无关，全局静默过滤
  const EXTENSION_ERR_RE =
    /Could not establish connection|Receiving end does not exist/

  window.addEventListener('unhandledrejection', (event: any) => {
    const msg = String(event.reason?.message || event.reason || '')
    if (EXTENSION_ERR_RE.test(msg)) {
      event.preventDefault()
      return
    }

    // 只在生产环境阻止默认行为，开发环境保留原始错误堆栈
    if (!import.meta.env.DEV) {
      event.preventDefault()
    }

    if (isHandledError(event.reason)) return

    const context = createErrorContext('promise', event.reason)
    handleError(context, { showMessage: true, logToConsole: true })
  })
}

/**
 * 设置资源加载错误处理
 *
 * ⚠️ 关键修复点:
 * 1. error 事件既捕获资源错误,也捕获脚本运行时错误
 * 2. 需要精确区分这两种情况,避免重复处理
 * 3. 资源错误: event.target 是具体的 HTML 元素
 * 4. 脚本错误: event.target 是 window 或 null,且通常有 error 属性
 */
const setupResourceErrorHandler = (): void => {
  window.addEventListener(
    'error',
    (event: Event) => {
      const { target } = event

      // ✅ 修复1: 精确判断 - 如果没有 target 或 target 是 window,说明是脚本错误
      if (!target || target === window) return

      // ✅ 修复2: 双重检查 - ErrorEvent 有 error 属性通常表示脚本错误
      // 资源加载错误的 ErrorEvent 不会有 error 属性
      const errorEvent = event as ErrorEvent
      if ('error' in errorEvent && errorEvent.error instanceof Error) return

      const element = target as HTMLElement
      const tagName = element.tagName?.toLowerCase()

      // ✅ 修复3: 确保是我们关心的资源标签
      if (tagName && RESOURCE_TAGS.includes(tagName as any)) {
        const url = (element as any).src || (element as any).href || 'unknown'

        // ✅ 修复5: 过滤空 src 引源的 img 错误（第三方库内部初始化带来的无害错误）
        // 典型场景：vue-cropper 等组件初始化时 data 中 imgs="" 导致 <img src=""> 加载当前页面 URL
        if (tagName === 'img') {
          const imgSrc = (element as HTMLImageElement).getAttribute('src')
          if (!imgSrc || imgSrc === '' || url === window.location.origin + '/')
            return
        }

        // ✅ 修复4: 所有资源加载错误统一归类为 'resource'
        // 'script' 类型专门用于脚本运行时错误,避免混淆
        const context = createErrorContext(
          'resource',
          `${tagName} 资源加载失败: ${url}`,
          undefined,
          {
            url,
            tagName,
            resourceType: tagName, // 保留具体的资源类型用于分析
          }
        )

        handleError(context, {
          showMessage: false, // 资源错误通常不需要打扰用户
          logToConsole: true,
          reportToServer: true, // 但需要上报以便分析
        })
      }
    },
    true // 使用捕获阶段
  )
}

/**
 * 设置脚本运行时错误处理（window.onerror）
 *
 * ⚠️ 注意:
 * 1. 这个处理器专门处理脚本运行时错误(runtime errors)
 * 2. 不处理脚本文件加载失败(那是资源错误,由 setupResourceErrorHandler 处理)
 */
const setupScriptErrorHandler = (): void => {
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => {
    if (isHandledError(error)) return true

    // ✅ 过滤已知无害的浏览器内部警告
    // ResizeObserver loop 是浏览器在 observer 回调引起布局变更时抛出的警告，不影响功能
    const msg = typeof message === 'string' ? message : ''
    if (msg.includes('ResizeObserver loop')) return true

    // ✅ 构建清晰的错误消息
    const errorMessage =
      error?.message || (typeof message === 'string' ? message : '脚本运行错误')

    const context = createErrorContext(
      'script',
      error || errorMessage,
      undefined,
      {
        url: source,
        line: lineno,
        column: colno,
        errorType: 'runtime', // 明确标识这是运行时错误
      }
    )

    handleError(context, {
      showMessage: true, // 运行时错误通常需要提示用户
      logToConsole: true,
      reportToServer: true,
    })

    return true // 阻止默认错误处理
  }
}

/**
 * 设置全局错误处理
 * @param app Vue 应用实例
 */
export function setupGlobalErrorHandler(app: App): void {
  setupVueErrorHandler(app)
  setupPromiseErrorHandler()
  setupResourceErrorHandler()
  setupScriptErrorHandler()

  if (import.meta.env.DEV) {
    console.log('[全局错误处理] 已初始化')
  }
}

/**
 * 清理全局错误处理（应用卸载时调用）
 *
 * ⚠️ 注意: 对于 SPA 应用,通常不需要调用此函数
 * 因为应用生命周期 = 页面生命周期,定时器会随页面刷新自动清理
 */
export function cleanupGlobalErrorHandler(): void {
  stopCleanupTimer()

  if (import.meta.env.DEV) {
    console.log('[全局错误处理] 已清理')
  }
}

// 导出工具函数，供业务代码使用
export { handleError, createErrorContext }
