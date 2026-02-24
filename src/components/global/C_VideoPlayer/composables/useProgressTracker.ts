/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useProgressTracker.ts
 * @Description: 学习进度追踪 & 心跳上报
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, watch, onBeforeUnmount, type Ref, type ShallowRef } from 'vue'
import {
  DEFAULT_HEARTBEAT_INTERVAL,
  PROGRESS_THROTTLE_INTERVAL,
  STORAGE_KEYS,
} from '../constants'
import type {
  PlayerInstance,
  ProgressData,
  ProgressReporter,
  AntiCheatConfig,
} from '../types'

/**
 * 学习进度追踪 composable
 * - 精确记录已观看时长（排除暂停和拖动时间）
 * - 节流上报进度
 * - 心跳上报
 * - 页面关闭时使用 sendBeacon 兜底上报
 * - 断点续播 localStorage 存储
 */
export function useProgressTracker(
  playerRef: ShallowRef<PlayerInstance | null>,
  currentTime: Ref<number>,
  duration: Ref<number>,
  url: Ref<string>,
  onProgress?: ProgressReporter,
  antiCheat?: AntiCheatConfig
) {
  /** 累计实际观看时长（秒） */
  const watchedDuration = ref(0)

  /** 完成百分比 */
  const completionPercent = ref(0)

  /** 上次记录时间 */
  let lastRecordTime = 0

  /** 是否正在播放 */
  let isPlaying = false

  /** 心跳定时器 */
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null

  /** 进度节流定时器 */
  let throttleTimer: ReturnType<typeof setInterval> | null = null

  /** 视频标识（用于 localStorage key） */
  function getVideoKey(): string {
    return STORAGE_KEYS.PROGRESS + encodeURIComponent(url.value)
  }

  /** 恢复进度 */
  function restoreProgress(): number {
    try {
      const stored = localStorage.getItem(getVideoKey())
      if (stored) {
        const data: ProgressData = JSON.parse(stored)
        watchedDuration.value = data.watchedDuration ?? 0
        completionPercent.value = data.completionPercent ?? 0
        return data.currentTime ?? 0
      }
    } catch {
      // 忽略解析失败
    }
    return 0
  }

  /** 获取当前进度数据 */
  function getProgressData(): ProgressData {
    return {
      currentTime: currentTime.value,
      duration: duration.value,
      watchedDuration: watchedDuration.value,
      completionPercent: completionPercent.value,
      updatedAt: Date.now(),
    }
  }

  /** 保存进度到 localStorage */
  function saveProgress() {
    try {
      localStorage.setItem(getVideoKey(), JSON.stringify(getProgressData()))
    } catch {
      // localStorage 可能已满，忽略
    }
  }

  /** 上报进度（节流） */
  function reportProgress() {
    const data = getProgressData()
    onProgress?.(data)
    saveProgress()
  }

  /** 计算观看时长 */
  function updateWatchedDuration() {
    if (!isPlaying) return
    const now = performance.now()
    if (lastRecordTime > 0) {
      const delta = (now - lastRecordTime) / 1000
      // 防止异常值（如浏览器后台导致的大跳跃）
      if (delta > 0 && delta < 5) {
        watchedDuration.value += delta
      }
    }
    lastRecordTime = now

    // 计算完成百分比
    if (duration.value > 0) {
      completionPercent.value = Math.min(
        100,
        Math.round((watchedDuration.value / duration.value) * 100)
      )
    }
  }

  /** 心跳上报 */
  function startHeartbeat() {
    const interval = antiCheat?.heartbeatInterval ?? DEFAULT_HEARTBEAT_INTERVAL
    heartbeatTimer = setInterval(() => {
      if (isPlaying) {
        antiCheat?.onHeartbeat?.(getProgressData())
      }
    }, interval)
  }

  /** 启动节流上报 */
  function startThrottleReport() {
    throttleTimer = setInterval(() => {
      if (isPlaying) {
        reportProgress()
      }
    }, PROGRESS_THROTTLE_INTERVAL)
  }

  /** 页面关闭兜底上报 */
  function handleBeforeUnload() {
    const data = getProgressData()
    saveProgress()
    // 使用 sendBeacon 确保数据不丢失
    if (onProgress) {
      try {
        navigator.sendBeacon?.('/api/video/progress', JSON.stringify(data))
      } catch {
        // sendBeacon 可能不可用
      }
    }
  }

  /** 页面可见性变化处理 */
  function handleVisibilityChange() {
    if (document.hidden) {
      // 离开页面时保存并上报
      updateWatchedDuration()
      reportProgress()
      isPlaying = false
    } else {
      // 回到页面时恢复计时
      const player = playerRef.value
      if (player && !player.paused) {
        isPlaying = true
        lastRecordTime = performance.now()
      }
    }
  }

  /** 初始化追踪 */
  function startTracking() {
    startHeartbeat()
    startThrottleReport()
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  /** 停止追踪 */
  function stopTracking() {
    isPlaying = false
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (throttleTimer) {
      clearInterval(throttleTimer)
      throttleTimer = null
    }
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    saveProgress()
  }

  /** 标记开始播放 */
  function onPlay() {
    isPlaying = true
    lastRecordTime = performance.now()
  }

  /** 标记暂停 */
  function onPause() {
    updateWatchedDuration()
    isPlaying = false
    lastRecordTime = 0
    saveProgress()
  }

  /** timeupdate 回调 */
  function onTimeUpdate() {
    updateWatchedDuration()
  }

  /** 监听播放器就绪后恢复进度 */
  watch(playerRef, player => {
    if (player) {
      startTracking()
    }
  })

  onBeforeUnmount(() => {
    stopTracking()
  })

  return {
    watchedDuration,
    completionPercent,
    getProgressData,
    restoreProgress,
    saveProgress,
    startTracking,
    stopTracking,
    onPlay,
    onPause,
    onTimeUpdate,
  }
}
