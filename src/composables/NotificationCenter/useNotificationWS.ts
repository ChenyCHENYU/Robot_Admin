/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\NotificationCenter\useNotificationWS.ts
 * @Description: WebSocket 连接管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  NotificationWSConfig,
  WSConnectionStatus,
  WSNotificationPayload,
} from '@/types/modules/notification'
import {
  DEFAULT_WS_RECONNECT_INTERVAL,
  DEFAULT_WS_MAX_RECONNECT,
  DEFAULT_WS_HEARTBEAT_INTERVAL,
  DEFAULT_WS_HEARTBEAT_MESSAGE,
} from '@/components/global/C_NotificationCenter/constants'

/**
 * WebSocket 连接管理
 *
 * 管理 WebSocket 的建连、重连、心跳保活、消息解析。
 * 支持自动重连、鉴权 token、心跳检测。
 */
export function useNotificationWS(
  onMessage: (payload: WSNotificationPayload) => void,
  onStatusChange?: (status: WSConnectionStatus) => void
) {
  /** 连接状态 */
  const status = ref<WSConnectionStatus>('disconnected')

  /** WebSocket 实例 */
  let ws: WebSocket | null = null
  /** 重连计数器 */
  let reconnectCount = 0
  /** 重连定时器 */
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** 心跳定时器 */
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  /** 当前配置 */
  let currentConfig: NotificationWSConfig | null = null

  /**
   * 更新连接状态
   */
  function setStatus(s: WSConnectionStatus) {
    status.value = s
    onStatusChange?.(s)
  }

  /**
   * 建立连接
   */
  function connect(config: NotificationWSConfig) {
    currentConfig = config
    reconnectCount = 0
    createConnection(config)
  }

  /**
   * 创建 WebSocket 连接
   */
  function createConnection(config: NotificationWSConfig) {
    cleanup()

    const url = buildUrl(config)
    setStatus('connecting')

    try {
      ws = new WebSocket(url)
    } catch {
      setStatus('disconnected')
      scheduleReconnect(config)
      return
    }

    ws.addEventListener('open', () => {
      setStatus('connected')
      reconnectCount = 0
      startHeartbeat(config)
    })

    ws.addEventListener('message', event => {
      handleMessage(event.data)
    })

    ws.addEventListener('close', () => {
      stopHeartbeat()
      setStatus('disconnected')

      if (config.autoReconnect !== false) {
        scheduleReconnect(config)
      }
    })

    ws.addEventListener('error', () => {
      // error 事件后通常紧接 close 事件，交由 close 处理重连
    })
  }

  /**
   * 构建带 token 的 WebSocket URL
   */
  function buildUrl(config: NotificationWSConfig): string {
    const token = config.getToken?.()
    if (token) {
      const separator = config.url.includes('?') ? '&' : '?'
      return `${config.url}${separator}token=${encodeURIComponent(token)}`
    }
    return config.url
  }

  /**
   * 处理接收到的消息
   */
  function handleMessage(raw: string | ArrayBuffer | Blob) {
    if (typeof raw !== 'string') return

    // 过滤心跳响应
    if (raw === 'pong') return

    try {
      const payload = JSON.parse(raw) as WSNotificationPayload
      onMessage(payload)
    } catch {
      // 非标准 JSON 消息，忽略
    }
  }

  /**
   * 调度重连
   */
  function scheduleReconnect(config: NotificationWSConfig) {
    const maxAttempts = config.maxReconnectAttempts ?? DEFAULT_WS_MAX_RECONNECT
    if (reconnectCount >= maxAttempts) return

    reconnectCount++
    setStatus('reconnecting')

    const interval = config.reconnectInterval ?? DEFAULT_WS_RECONNECT_INTERVAL
    reconnectTimer = setTimeout(() => {
      createConnection(config)
    }, interval)
  }

  /**
   * 启动心跳
   */
  function startHeartbeat(config: NotificationWSConfig) {
    const interval = config.heartbeatInterval ?? DEFAULT_WS_HEARTBEAT_INTERVAL
    if (interval <= 0) return

    const message = config.heartbeatMessage ?? DEFAULT_WS_HEARTBEAT_MESSAGE
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    }, interval)
  }

  /**
   * 停止心跳
   */
  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  /**
   * 清理资源
   */
  function cleanup() {
    stopHeartbeat()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
  }

  /**
   * 断开连接
   */
  function disconnect() {
    currentConfig = null
    reconnectCount = Infinity
    cleanup()
    setStatus('disconnected')
  }

  /**
   * 手动重新连接
   */
  function reconnect() {
    if (currentConfig) {
      reconnectCount = 0
      createConnection(currentConfig)
    }
  }

  // 组件卸载时自动清理
  onBeforeUnmount(cleanup)

  return {
    /** WebSocket 连接状态 */
    status: readonly(status),
    connect,
    disconnect,
    reconnect,
  }
}
