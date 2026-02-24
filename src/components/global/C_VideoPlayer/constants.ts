/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\constants.ts
 * @Description: 视频播放器组件 - 常量配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { PlaybackRate, QualityLevel, VideoSourceType } from './types'

/** 默认播放倍速列表 */
export const DEFAULT_PLAYBACK_RATES: PlaybackRate[] = [
  0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0,
]

/** 默认播放倍速 */
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1.0

/** 默认音量 */
export const DEFAULT_VOLUME = 0.75

/** 心跳上报间隔（毫秒） */
export const DEFAULT_HEARTBEAT_INTERVAL = 30_000

/** 进度上报节流间隔（毫秒） */
export const PROGRESS_THROTTLE_INTERVAL = 5_000

/** 清晰度标签映射 */
export const QUALITY_LABEL_MAP: Record<QualityLevel, string> = {
  '360p': '流畅 360P',
  '480p': '标清 480P',
  '720p': '高清 720P',
  '1080p': '超清 1080P',
  '1440p': '2K 1440P',
  '4K': '4K 超高清',
}

/** 视频源文件扩展名与类型映射 */
export const SOURCE_TYPE_MAP: Record<string, VideoSourceType> = {
  '.mp4': 'mp4',
  '.m3u8': 'hls',
  '.mpd': 'dash',
  '.flv': 'flv',
}

/** 快捷键映射描述 */
export const KEYBOARD_SHORTCUTS = {
  SPACE: '播放/暂停',
  ARROW_LEFT: '快退 5 秒',
  ARROW_RIGHT: '快进 5 秒',
  ARROW_UP: '音量增加 10%',
  ARROW_DOWN: '音量减少 10%',
  F: '全屏/退出全屏',
  M: '静音/取消静音',
  ESC: '退出全屏',
} as const

/** 快进/快退步长（秒） */
export const SEEK_STEP = 5

/** 音量调节步长 */
export const VOLUME_STEP = 0.1

/** localStorage 存储键前缀 */
export const STORAGE_PREFIX = 'c_video_player_'

/** 存储键 */
export const STORAGE_KEYS = {
  /** 音量 */
  VOLUME: `${STORAGE_PREFIX}volume`,
  /** 倍速 */
  PLAYBACK_RATE: `${STORAGE_PREFIX}playback_rate`,
  /** 播放进度前缀（后接视频标识） */
  PROGRESS: `${STORAGE_PREFIX}progress_`,
  /** 书签前缀（后接视频标识） */
  BOOKMARKS: `${STORAGE_PREFIX}bookmarks_`,
} as const

/** 水印默认样式 */
export const WATERMARK_DEFAULT_STYLE = {
  fontSize: 14,
  color: 'rgba(150, 150, 150, 0.15)',
  rotate: -25,
  gap: 120,
} as const
