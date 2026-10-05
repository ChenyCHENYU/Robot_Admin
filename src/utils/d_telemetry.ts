/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\utils\d_telemetry.ts
 * @Description: 匿名埋点运行时，独立于登录逻辑，采集失败不影响应用
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { observabilityConfig as config } from '@/config/observability'
import type { TelemetryEvent, TelemetryEventType } from '@/types/observability'
import {
  createTelemetryStore,
  sanitizeTelemetryEvent,
} from './d_telemetryStore'
import { resolveAuthMode } from '@/api/auth.contract'

/** 无痕或禁用存储时使用内存会话。 */
const getStorage = (
  name: 'localStorage' | 'sessionStorage'
): Storage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window[name]
  } catch {
    return undefined
  }
}
const storage = getStorage('localStorage')
const sessionStorage = getStorage('sessionStorage')
let idSequence = 0
/** HTTP 内网或旧浏览器缺少 randomUUID 时仍能生成非认证用途的匿名标识。 */
const createAnonymousId = (): string => {
  try {
    const value = globalThis.crypto?.randomUUID?.()
    if (value) return value
  } catch {
    /* 使用本地匿名标识，不影响业务。 */
  }
  return `anon-${Date.now().toString(36)}-${idSequence++}-${Math.random().toString(36).slice(2)}`
}
let session = 'anonymous'
try {
  session =
    sessionStorage?.getItem(`${config.storageKey}:session`) ||
    createAnonymousId()
  sessionStorage?.setItem(`${config.storageKey}:session`, session)
} catch {
  session = createAnonymousId()
}

export const telemetry = createTelemetryStore({ ...config, storage })
type EventSink = (event: TelemetryEvent) => void
let sink: EventSink | undefined
const authMode = resolveAuthMode(
  import.meta.env.VITE_AUTH_MODE,
  import.meta.env.VITE_APP_ENV,
  import.meta.env.VITE_DEPLOYMENT_PROFILE
)

/** 统一设置可选的外部发布器，默认不发网络请求。 */
export const setTelemetrySink = (value: EventSink | undefined) => {
  sink = value
}

/** 只接受明确事件与功能名，不扫描点击、不读取表单与账号。 */
export const recordTelemetry = (
  type: TelemetryEventType,
  options: { route?: string; durationMs?: number; action?: string } = {}
) => {
  if (!config.enabled || typeof window === 'undefined') return
  try {
    const event = sanitizeTelemetryEvent({
      id: createAnonymousId(),
      type,
      timestamp: Date.now(),
      session,
      route: options.route ?? 'application',
      mode: authMode,
      device:
        window.innerWidth < 640
          ? 'mobile'
          : window.innerWidth < 1024
            ? 'tablet'
            : 'desktop',
      durationMs: options.durationMs,
      action: options.action,
    })
    if (!event) return
    telemetry.record(event)
    sink?.(event)
  } catch {
    /* 观测永远不能中断认证、公司切换或路由。 */
  }
}
