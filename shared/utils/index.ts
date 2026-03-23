/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-23
 * @Description: 微前端共享工具函数
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { MicroAppMessage } from '../types'

/**
 * * @description: 创建类型安全的 PostMessage 消息
 * ? @param {string} type 消息类型
 * ? @param {T} payload 消息负载
 * ! @return {MicroAppMessage<T>}
 */
export function createMessage<T>(type: string, payload: T): MicroAppMessage<T> {
  return { type, payload }
}

/**
 * * @description: 安全解析 PostMessage 事件数据
 * ? @param {MessageEvent} event 消息事件
 * ! @return {MicroAppMessage | null}
 */
export function parseMessage(event: MessageEvent): MicroAppMessage | null {
  const { type, payload } = event.data || {}
  if (!type || typeof type !== 'string') return null
  return { type, payload }
}
