/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\types.ts
 * @Description: 视频播放器组件 - 类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { IPlayerOptions, IDefinition } from 'xgplayer'

/* ======================== 基础类型 ======================== */

/** 清晰度等级 */
export type QualityLevel = '360p' | '480p' | '720p' | '1080p' | '1440p' | '4K'

/** 播放倍速 */
export type PlaybackRate = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0 | 3.0

/** 播放器状态 */
export type PlayerState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error'

/** 视频源类型 */
export type VideoSourceType = 'mp4' | 'hls' | 'dash' | 'flv'

/* ======================== 章节相关 ======================== */

/** 章节标记 */
export interface Chapter {
  /** 章节ID */
  id: string
  /** 章节标题 */
  title: string
  /** 起始时间（秒） */
  startTime: number
  /** 结束时间（秒） */
  endTime: number
}

/* ======================== 书签相关 ======================== */

/** 书签 */
export interface Bookmark {
  /** 书签ID */
  id: string
  /** 书签时间点（秒） */
  time: number
  /** 书签备注 */
  note: string
  /** 创建时间 */
  createdAt: number
}

/* ======================== 字幕相关 ======================== */

/** 字幕轨道 */
export interface SubtitleTrack {
  /** 字幕语言标识 */
  language: string
  /** 字幕显示名称 */
  label: string
  /** 字幕文件地址 */
  src: string
  /** 是否为默认字幕 */
  default?: boolean
}

/* ======================== 测验相关 ======================== */

/** 测验题类型 */
export type QuizType = 'single' | 'multiple' | 'judge'

/** 测验题选项 */
export interface QuizOption {
  /** 选项标识 */
  key: string
  /** 选项内容 */
  label: string
}

/** 视频内嵌测验 */
export interface VideoQuiz {
  /** 测验ID */
  id: string
  /** 触发时间（秒） */
  triggerTime: number
  /** 题目类型 */
  type: QuizType
  /** 题目标题 */
  title: string
  /** 选项列表 */
  options: QuizOption[]
  /** 正确答案 key（多选为数组） */
  answer: string | string[]
  /** 是否必须答对才能继续 */
  required?: boolean
}

/* ======================== 清晰度相关 ======================== */

/** 清晰度定义 */
export interface QualityDefinition {
  /** 清晰度标识 */
  label: QualityLevel
  /** 视频地址 */
  url: string
  /** 码率（kbps） */
  bitrate?: number
}

/* ======================== 进度追踪相关 ======================== */

/** 学习进度数据 */
export interface ProgressData {
  /** 当前播放时间（秒） */
  currentTime: number
  /** 视频总时长（秒） */
  duration: number
  /** 已观看时长（秒） */
  watchedDuration: number
  /** 完成百分比 0-100 */
  completionPercent: number
  /** 最后更新时间戳 */
  updatedAt: number
}

/** 进度上报回调 */
export type ProgressReporter = (data: ProgressData) => void | Promise<void>

/* ======================== 防作弊相关 ======================== */

/** 防作弊配置 */
export interface AntiCheatConfig {
  /** 是否禁止首次观看时拖动进度条 */
  preventSeekOnFirstWatch?: boolean
  /** 是否开启焦点检测（切出页面暂停） */
  focusDetection?: boolean
  /** 是否显示动态水印 */
  watermark?: boolean
  /** 水印文本（如用户名/ID） */
  watermarkText?: string
  /** 心跳上报间隔（毫秒），默认 30000 */
  heartbeatInterval?: number
  /** 心跳回调 */
  onHeartbeat?: (data: ProgressData) => void | Promise<void>
}

/* ======================== 缩略图预览 ======================== */

/** 缩略图配置 */
export interface ThumbnailConfig {
  /** 雪碧图地址列表 */
  urls: string[]
  /** 每张雪碧图包含的图片数量 */
  picNum: number
  /** 雪碧图列数 */
  col: number
  /** 雪碧图行数 */
  row: number
  /** 缩略图宽度 */
  width?: number
  /** 缩略图高度 */
  height?: number
}

/* ======================== 数据分析上报 ======================== */

/** 播放器事件类型 */
export type AnalyticsEventType =
  | 'play'
  | 'pause'
  | 'ended'
  | 'seek'
  | 'quality_change'
  | 'speed_change'
  | 'error'
  | 'buffer'
  | 'fullscreen'

/** 分析上报数据 */
export interface AnalyticsEvent {
  /** 事件类型 */
  type: AnalyticsEventType
  /** 事件发生时的播放时间 */
  currentTime: number
  /** 事件时间戳 */
  timestamp: number
  /** 附加数据 */
  payload?: Record<string, unknown>
}

/** 分析上报回调 */
export type AnalyticsReporter = (event: AnalyticsEvent) => void | Promise<void>

/* ======================== 组件 Props ======================== */

/** 视频播放器组件属性 */
export interface VideoPlayerProps {
  /** 视频源地址 */
  url: string
  /** 视频源类型，默认自动检测 */
  sourceType?: VideoSourceType
  /** 播放器宽度 */
  width?: number | string
  /** 播放器高度 */
  height?: number | string
  /** 封面图地址 */
  poster?: string
  /** 是否自适应容器宽度 */
  fluid?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否自动静音播放 */
  autoplayMuted?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 初始音量 0-1 */
  volume?: number
  /** 起始播放时间（秒），用于断点续播 */
  startTime?: number
  /** 播放倍速列表 */
  playbackRates?: PlaybackRate[]
  /** 默认倍速 */
  defaultPlaybackRate?: PlaybackRate
  /** 是否开启画中画 */
  pip?: boolean
  /** 是否开启全屏功能 */
  fullscreen?: boolean
  /** 是否开启网页全屏 */
  cssFullscreen?: boolean
  /** 是否开启小窗播放 */
  miniPlayer?: boolean
  /** 是否显示截图按钮 */
  screenshot?: boolean
  /** 是否开启快捷键 */
  keyboard?: boolean
  /** 语言 */
  lang?: string

  /* ---------- 教育增强 ---------- */

  /** 清晰度列表 */
  qualityList?: QualityDefinition[]
  /** 默认清晰度 */
  defaultQuality?: QualityLevel
  /** 章节列表 */
  chapters?: Chapter[]
  /** 字幕轨道列表 */
  subtitles?: SubtitleTrack[]
  /** 视频内测验列表 */
  quizzes?: VideoQuiz[]
  /** 书签列表（已有的） */
  bookmarks?: Bookmark[]
  /** 缩略图预览配置 */
  thumbnail?: ThumbnailConfig

  /* ---------- 进度追踪 & 防作弊 ---------- */

  /** 进度上报回调 */
  onProgress?: ProgressReporter
  /** 防作弊配置 */
  antiCheat?: AntiCheatConfig

  /* ---------- 数据分析 ---------- */

  /** 数据分析上报回调 */
  onAnalytics?: AnalyticsReporter

  /* ---------- xgplayer 原生透传 ---------- */

  /** xgplayer 原生配置透传，会与组件生成的配置进行合并 */
  playerOptions?: Partial<IPlayerOptions>
}

/** 视频播放器组件事件 */
export interface VideoPlayerEmits {
  /** 播放器就绪 */
  (e: 'ready'): void
  /** 播放状态变化 */
  (e: 'stateChange', state: PlayerState): void
  /** 播放时间更新 */
  (e: 'timeUpdate', currentTime: number, duration: number): void
  /** 播放结束 */
  (e: 'ended'): void
  /** 播放错误 */
  (e: 'error', error: Error): void
  /** 清晰度切换 */
  (e: 'qualityChange', quality: QualityLevel): void
  /** 倍速切换 */
  (e: 'rateChange', rate: number): void
  /** 全屏状态变化 */
  (e: 'fullscreenChange', isFullscreen: boolean): void
  /** 书签变化 */
  (e: 'bookmarkChange', bookmarks: Bookmark[]): void
  /** 测验作答 */
  (
    e: 'quizAnswer',
    quizId: string,
    answer: string | string[],
    isCorrect: boolean
  ): void
  /** 章节切换 */
  (e: 'chapterChange', chapter: Chapter): void
  /** 进度更新 */
  (e: 'progressUpdate', data: ProgressData): void
}

/** 视频播放器暴露的方法 */
export interface VideoPlayerExpose {
  /** 播放 */
  play: () => void
  /** 暂停 */
  pause: () => void
  /** 跳转到指定时间 */
  seek: (time: number) => void
  /** 设置倍速 */
  setPlaybackRate: (rate: number) => void
  /** 设置音量 */
  setVolume: (volume: number) => void
  /** 切换清晰度 */
  switchQuality: (quality: QualityLevel) => void
  /** 获取当前进度数据 */
  getProgressData: () => ProgressData
  /** 销毁播放器 */
  destroy: () => void
  /** 获取 xgplayer 原始实例 */
  getPlayerInstance: () => InstanceType<
    typeof import('xgplayer').default
  > | null
}

/* ======================== 工具类型，供 composables 使用 ======================== */

/** xgplayer 实例类型 */
export type PlayerInstance = InstanceType<typeof import('xgplayer').default>

/** 重新导出 xgplayer 原生类型，方便外部使用 */
export type { IPlayerOptions, IDefinition }
