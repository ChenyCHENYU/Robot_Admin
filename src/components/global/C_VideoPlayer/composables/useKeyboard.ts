/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useKeyboard.ts
 * @Description: 快捷键管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { onBeforeUnmount, type ShallowRef, type Ref } from 'vue'
import { SEEK_STEP, VOLUME_STEP } from '../constants'
import type { PlayerInstance } from '../types'

/**
 * 快捷键管理 composable
 * - xgplayer 已内置快捷键，这里做补充增强
 * - 支持自定义快捷键回调
 */
export function useKeyboard(
  playerRef: ShallowRef<PlayerInstance | null>,
  containerRef: Ref<HTMLElement | null>,
  options: {
    enabled?: boolean
    onToggleFullscreen?: () => void
  } = {}
) {
  const { enabled = true, onToggleFullscreen } = options

  /** 快捷键动作映射 */
  const keyActions: Record<
    string,
    (e: KeyboardEvent, player: NonNullable<typeof playerRef.value>) => void
  > = {
    ' ': (e, player) => {
      e.preventDefault()
      if (player.paused) {
        player.play()
      } else {
        player.pause()
      }
    },
    ArrowLeft: (e, player) => {
      e.preventDefault()
      player.currentTime = Math.max(0, (player.currentTime ?? 0) - SEEK_STEP)
    },
    ArrowRight: (e, player) => {
      e.preventDefault()
      player.currentTime = Math.min(
        player.duration ?? 0,
        (player.currentTime ?? 0) + SEEK_STEP
      )
    },
    ArrowUp: (e, player) => {
      e.preventDefault()
      player.volume = Math.min(1, (player.volume ?? 0) + VOLUME_STEP)
    },
    ArrowDown: (e, player) => {
      e.preventDefault()
      player.volume = Math.max(0, (player.volume ?? 0) - VOLUME_STEP)
    },
    f: e => {
      e.preventDefault()
      onToggleFullscreen?.()
    },
    F: e => {
      e.preventDefault()
      onToggleFullscreen?.()
    },
    m: (e, player) => {
      e.preventDefault()
      player.volume = player.volume > 0 ? 0 : 0.75
    },
    M: (e, player) => {
      e.preventDefault()
      player.volume = player.volume > 0 ? 0 : 0.75
    },
  }

  /** 快捷键处理函数 */
  function handleKeydown(e: KeyboardEvent) {
    if (!enabled) return
    const player = playerRef.value
    if (!player) return

    // 避免在输入框中触发
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const action = keyActions[e.key]
    action?.(e, player)
  }

  /** 开始监听 */
  function startListening() {
    if (!enabled) return
    // 使用 container 级别监听，避免全局冲突
    containerRef.value?.addEventListener('keydown', handleKeydown)
  }

  /** 停止监听 */
  function stopListening() {
    containerRef.value?.removeEventListener('keydown', handleKeydown)
  }

  onBeforeUnmount(() => {
    stopListening()
  })

  return {
    startListening,
    stopListening,
  }
}
