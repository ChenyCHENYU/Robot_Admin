/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.id.ts
 * @Description: 消息记录与幂等命令标识，兼容 HTTP 内网演示环境
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
let sequence = 0
/** 标识只用于记录去重，不作为认证凭据或权限票据。 */
export const createNotificationId = (): string => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  sequence++
  const entropy = new Uint32Array(2)
  if (globalThis.crypto?.getRandomValues)
    globalThis.crypto.getRandomValues(entropy)
  else {
    entropy[0] = Math.floor(Math.random() * 0xffffffff)
    entropy[1] = Math.floor(Math.random() * 0xffffffff)
  }
  return `message-${Date.now().toString(36)}-${sequence.toString(36)}-${[...entropy].map(value => value.toString(36)).join('')}`
}

const canonicalValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => key !== 'operationId' && item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, canonicalValue(item)])
  )
}
/** 同一尚未确认的用户意图复用幂等标识，编辑内容变化则形成新意图。 */
export const notificationOperationSignature = (
  type: string,
  payload: unknown
): string => `${type}:${JSON.stringify(canonicalValue(payload))}`
