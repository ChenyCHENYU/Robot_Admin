/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\plugins\analytics-reporter.ts
 * @Description: 数据上报插件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { Events } from 'xgplayer'
import type {
  PlayerInstance,
  AnalyticsEvent,
  AnalyticsReporter,
} from '../types'

/**
 * 数据上报插件
 * - 监听播放器核心事件并通过回调上报
 * - 支持自定义事件过滤
 * - 页面关闭时使用 sendBeacon 兜底
 */
export function createAnalyticsPlugin(
  player: PlayerInstance,
  reporter: AnalyticsReporter
) {
  /** 构建事件数据 */
  function buildEvent(
    type: AnalyticsEvent['type'],
    payload?: Record<string, unknown>
  ): AnalyticsEvent {
    return {
      type,
      currentTime: player.currentTime ?? 0,
      timestamp: Date.now(),
      payload,
    }
  }

  /** 上报单个事件 */
  function report(
    type: AnalyticsEvent['type'],
    payload?: Record<string, unknown>
  ) {
    const event = buildEvent(type, payload)
    reporter(event)
  }

  // 事件处理函数（保留引用以便销毁时移除）
  const onPlay = () => report('play')
  const onPause = () => report('pause')
  const onEnded = () => report('ended')
  const onSeeked = () => report('seek')
  const onError = () => report('error')
  const onWaiting = () => report('buffer')
  const onFullscreen = (isFS: boolean) => {
    report('fullscreen', { isFullscreen: isFS })
  }
  const onDefinition = (data: Record<string, unknown>) => {
    report('quality_change', data)
  }
  const onRate = () => {
    report('speed_change', { rate: player.playbackRate })
  }

  // 绑定播放器事件
  player.on(Events.PLAY, onPlay)
  player.on(Events.PAUSE, onPause)
  player.on(Events.ENDED, onEnded)
  player.on(Events.SEEKED, onSeeked)
  player.on(Events.ERROR, onError)
  player.on(Events.WAITING, onWaiting)
  player.on(Events.FULLSCREEN_CHANGE, onFullscreen)
  player.on(Events.DEFINITION_CHANGE, onDefinition)
  player.on(Events.RATE_CHANGE, onRate)

  /** 销毁插件：移除所有事件监听 */
  function destroy() {
    player.off(Events.PLAY, onPlay)
    player.off(Events.PAUSE, onPause)
    player.off(Events.ENDED, onEnded)
    player.off(Events.SEEKED, onSeeked)
    player.off(Events.ERROR, onError)
    player.off(Events.WAITING, onWaiting)
    player.off(Events.FULLSCREEN_CHANGE, onFullscreen)
    player.off(Events.DEFINITION_CHANGE, onDefinition)
    player.off(Events.RATE_CHANGE, onRate)
  }

  return { report, destroy }
}
