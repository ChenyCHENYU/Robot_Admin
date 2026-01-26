/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: 自动注入消息通知器
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { getCurrentInstance } from 'vue'
import type { Notifier } from './types'

/**
 * 自动检测并创建消息通知器
 * 支持：Naive UI、Element Plus、Ant Design Vue
 *
 * @returns Notifier 或 undefined
 */
export function createAutoNotifier(): Notifier | undefined {
  // 只在组件上下文中才能获取实例
  const instance = getCurrentInstance()
  if (!instance) return undefined

  const { globalProperties } = instance.appContext.config

  // 检测 Naive UI ($message)
  const naiveMessage = globalProperties.$message
  if (naiveMessage && typeof naiveMessage.success === 'function') {
    return {
      success: (msg: string) => naiveMessage.success(msg),
      error: (msg: string) => naiveMessage.error(msg),
      warning: (msg: string) => naiveMessage.warning?.(msg),
      info: (msg: string) => naiveMessage.info?.(msg),
    }
  }

  // 检测 Element Plus ($message)
  // Element Plus 也使用 $message，但需要额外检查
  const elementMessage = globalProperties.$message
  if (elementMessage && elementMessage.success) {
    return {
      success: (msg: string) => elementMessage.success(msg),
      error: (msg: string) => elementMessage.error(msg),
      warning: (msg: string) => elementMessage.warning?.(msg),
      info: (msg: string) => elementMessage.info?.(msg),
    }
  }

  // 检测 Ant Design Vue ($message)
  const antMessage = globalProperties.$message
  if (antMessage && antMessage.success) {
    return {
      success: (msg: string) => antMessage.success(msg),
      error: (msg: string) => antMessage.error(msg),
      warning: (msg: string) => antMessage.warning?.(msg),
      info: (msg: string) => antMessage.info?.(msg),
    }
  }

  // 未检测到任何消息组件，返回 undefined
  return undefined
}

/**
 * 创建控制台消息通知器（fallback）
 */
export function createConsoleNotifier(): Notifier {
  return {
    success: (msg: string) => console.log(`✅ ${msg}`),
    error: (msg: string) => console.error(`❌ ${msg}`),
    warning: (msg: string) => console.warn(`⚠️ ${msg}`),
    info: (msg: string) => console.info(`ℹ️ ${msg}`),
  }
}
