/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useQualitySwitch.ts
 * @Description: 清晰度切换
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, type ShallowRef } from 'vue'
import { Events } from 'xgplayer'
import type { PlayerInstance, QualityDefinition, QualityLevel } from '../types'

/**
 * 清晰度切换 composable
 * - 监听 xgplayer 原生清晰度切换事件
 * - 提供编程式清晰度切换
 */
export function useQualitySwitch(
  playerRef: ShallowRef<PlayerInstance | null>,
  qualityList: QualityDefinition[] = []
) {
  const currentQuality = ref<QualityLevel | null>(null)
  const isSwitching = ref(false)

  /** 初始化：监听清晰度变化事件 */
  function bindEvents(player: PlayerInstance) {
    player.on(Events.AFTER_DEFINITION_CHANGE, (data: { to: string }) => {
      currentQuality.value = data.to as QualityLevel
      isSwitching.value = false
    })

    player.on(Events.BEFORE_DEFINITION_CHANGE, () => {
      isSwitching.value = true
    })
  }

  /** 编程式切换清晰度 */
  function switchQuality(quality: QualityLevel) {
    const player = playerRef.value
    if (!player || !qualityList.length) return

    const target = qualityList.find(q => q.label === quality)
    if (!target) {
      console.warn(`[C_VideoPlayer] 未找到清晰度: ${quality}`)
      return
    }

    isSwitching.value = true
    // xgplayer definition 切换
    player.changeDefinition?.({
      url: target.url,
      definition: target.label,
      text: { zh: target.label, en: target.label },
      bitrate: target.bitrate,
    })
  }

  return {
    currentQuality,
    isSwitching,
    switchQuality,
    bindEvents,
  }
}
