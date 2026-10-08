/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\plugins\observability.ts
 * @Description: 路由真实访问、首帧耗时与有界批量上报，停用时零采集
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Router, RouteLocationNormalized } from 'vue-router'
import { s_themeStore } from '@/stores/theme'
import { s_languageStore } from '@/stores/language'
import { observabilityConfig as config } from '@/config/observability'
import type { TelemetryEvent } from '@/types/observability'
import { withRequestTimeout } from '@/utils/abort'
import {
  recordTelemetry,
  setTelemetrySink,
  telemetry,
} from '@/utils/d_telemetry'

/** 一次初始化；只统计成功导航，忽略重定向、失败和查询参数变化。 */
export const setupObservability = (router: Router): (() => void) => {
  if (!config.enabled) return () => undefined
  const starts = new WeakMap<RouteLocationNormalized, number>()
  let previousRoute = ''
  const stopBefore = router.beforeEach(to => {
    starts.set(to, performance.now())
  })
  const stopAfter = router.afterEach((to, _from, failure) => {
    const route = typeof to.name === 'string' ? to.name : 'unknown'
    if (failure || route === previousRoute) return
    previousRoute = route
    const start = starts.get(to)
    void nextTick(() => {
      requestAnimationFrame(() => {
        if (router.currentRoute.value.name !== to.name) return
        recordTelemetry('page_view', {
          route,
          ...(start === undefined || document.hidden
            ? {}
            : { durationMs: performance.now() - start }),
        })
      })
    })
  })
  const theme = s_themeStore()
  const language = s_languageStore()
  const stopTheme = watch(
    () => theme.mode,
    () => recordTelemetry('feature_action', { action: 'theme_change' }),
    { flush: 'sync' }
  )
  const stopLanguage = watch(
    () => language.currentLang,
    () => recordTelemetry('feature_action', { action: 'language_change' }),
    { flush: 'sync' }
  )
  /** 多标签页收到新的匿名记录时合并，避免覆盖其他标签页的访问。 */
  const onStorage = (event: StorageEvent) => {
    if (event.key === config.storageKey) telemetry.refresh()
  }
  window.addEventListener('storage', onStorage)

  let pending: TelemetryEvent[] = []
  let timer: ReturnType<typeof setTimeout> | undefined
  let sending = false
  let closed = false
  const collectController = new AbortController()
  /** 小批量发送，不重试风暴，不把历史本机记录补发给服务器。 */
  const flush = async () => {
    if (sending || !pending.length) return
    if (timer) clearTimeout(timer)
    timer = undefined
    sending = true
    const events = pending.splice(0, 20)
    try {
      await withRequestTimeout(
        signal =>
          fetch(config.collectEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            keepalive: true,
            signal,
            body: JSON.stringify({ schemaVersion: 1, events }),
          }),
        collectController.signal,
        4000
      )
    } catch {
      /* 断网时丢弃批次，不阻塞应用，不持续输出控制台噪声。 */
    } finally {
      sending = false
      if (pending.length && !closed)
        timer = setTimeout(() => void flush(), 2000)
    }
  }
  const validEndpoint = /^\/(?!\/)[\w/-]+$/.test(config.collectEndpoint)
  if (validEndpoint)
    setTelemetrySink(event => {
      pending = [...pending, event].slice(-100)
      if (!timer) timer = setTimeout(() => void flush(), 2000)
    })
  /** 卸载前发送队列，payload 始终保持在 keepalive 的小批量范围内。 */
  const onPageHide = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
    if (!validEndpoint || !pending.length) return
    const body = JSON.stringify({
      schemaVersion: 1,
      events: pending.splice(0, 20),
    })
    try {
      navigator.sendBeacon(
        config.collectEndpoint,
        new Blob([body], { type: 'application/json' })
      )
    } catch {
      /* 不影响退出。 */
    }
  }
  window.addEventListener('pagehide', onPageHide)
  /** 开发热更新解绑所有钩子、计时器与外部发布器。 */
  const cleanup = () => {
    closed = true
    collectController.abort()
    stopBefore()
    stopAfter()
    stopTheme()
    stopLanguage()
    window.removeEventListener('pagehide', onPageHide)
    window.removeEventListener('storage', onStorage)
    if (timer) clearTimeout(timer)
    pending = []
    setTelemetrySink(undefined)
  }
  import.meta.hot?.dispose(cleanup)
  return cleanup
}
