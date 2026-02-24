/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useAntiCheat.ts
 * @Description: 防作弊 - 防跳播 / 焦点检测 / 水印
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, onBeforeUnmount, type ShallowRef, type Ref } from 'vue'
import { Events } from 'xgplayer'
import type { PlayerInstance, AntiCheatConfig } from '../types'

/**
 * 防作弊 composable
 * - 首次观看防跳播：禁止向未观看区域拖动进度条
 * - 焦点检测：切出页面自动暂停
 * - 水印标记开关（UI 通过 Watermark.vue 组件渲染）
 */
export function useAntiCheat(
  playerRef: ShallowRef<PlayerInstance | null>,
  currentTime: Ref<number>,
  config?: AntiCheatConfig
) {
  /** 已观看的最远位置（秒） */
  const maxWatchedTime = ref(0)

  /** 是否为首次观看（有未完整看过的区段） */
  const isFirstWatch = ref(true)

  /** 是否处于焦点外（页面不可见） */
  const isBlurred = ref(false)

  /** 是否启用水印 */
  const showWatermark = ref(config?.watermark ?? false)

  /** 水印文本 */
  const watermarkText = ref(config?.watermarkText ?? '')

  /** 记录播放的最远位置 */
  function updateMaxWatched(time: number) {
    if (time > maxWatchedTime.value) {
      maxWatchedTime.value = time
    }
  }

  /** 防跳播拦截 */
  function handleSeeking(player: PlayerInstance) {
    if (!config?.preventSeekOnFirstWatch || !isFirstWatch.value) return

    const seekTarget = player.currentTime ?? 0
    // 只允许向已观看区域拖动
    if (seekTarget > maxWatchedTime.value + 2) {
      // 回弹到最远观看位置
      player.currentTime = maxWatchedTime.value
    }
  }

  /** 焦点检测 - 页面可见性变化 */
  function handleVisibilityChange() {
    if (!config?.focusDetection) return

    const player = playerRef.value
    if (!player) return

    if (document.hidden) {
      isBlurred.value = true
      if (!player.paused) {
        player.pause()
      }
    } else {
      isBlurred.value = false
    }
  }

  /** 绑定事件 */
  function bindEvents(player: PlayerInstance) {
    // 防跳播
    if (config?.preventSeekOnFirstWatch) {
      player.on(Events.SEEKING, () => handleSeeking(player))
    }

    // 更新最远观看位置
    player.on(Events.TIME_UPDATE, () => {
      updateMaxWatched(currentTime.value)
    })

    // 焦点检测
    if (config?.focusDetection) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  /** 标记已完整看过（允许自由拖动） */
  function markAsWatched() {
    isFirstWatch.value = false
  }

  /** 设置水印文本 */
  function setWatermarkText(text: string) {
    watermarkText.value = text
  }

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    maxWatchedTime,
    isFirstWatch,
    isBlurred,
    showWatermark,
    watermarkText,
    bindEvents,
    markAsWatched,
    setWatermarkText,
  }
}
