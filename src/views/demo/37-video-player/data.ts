/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 14:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 14:00:00
 * @FilePath: \Robot_Admin\src\views\demo\37-video-player\data.ts
 * @Description: 视频播放器演示页面 - 数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  Chapter,
  VideoQuiz,
  SubtitleTrack,
  AntiCheatConfig,
  VideoPlayerProps,
} from '@robot-admin/naive-ui-components'

/* ======================== 公开测试视频源 ======================== */

/** 公开演示源；网络不可用时可切换项目内置视频。 */
export const DEMO_SOURCES = {
  mp4: 'https://vjs.zencdn.net/v/oceans.mp4',
  mp4Alt: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  poster: '/demo-files/ocean-poster.svg',
  posterAlt:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sintel_poster.jpg/220px-Sintel_poster.jpg',
} as const

/* ======================== 章节数据 ======================== */

export const DEMO_CHAPTERS: Chapter[] = [
  { id: 'ch1', title: '开篇引言', startTime: 0, endTime: 10 },
  { id: 'ch2', title: '海洋生态', startTime: 10, endTime: 25 },
  { id: 'ch3', title: '深海探索', startTime: 25, endTime: 38 },
  { id: 'ch4', title: '总结展望', startTime: 38, endTime: 46 },
]

/* ======================== 测验题目 ======================== */

export const DEMO_QUIZZES: VideoQuiz[] = [
  {
    id: 'q1',
    triggerTime: 10,
    type: 'single',
    title: '以下哪种动物是深海中最大的无脊椎动物？',
    options: [
      { key: 'A', label: '大白鲨' },
      { key: 'B', label: '大王乌贼' },
      { key: 'C', label: '蓝鲸' },
      { key: 'D', label: '海龟' },
    ],
    answer: 'B',
    required: true,
  },
  {
    id: 'q2',
    triggerTime: 30,
    type: 'multiple',
    title: '以下哪些属于海洋哺乳动物？（多选）',
    options: [
      { key: 'A', label: '海豚' },
      { key: 'B', label: '鲨鱼' },
      { key: 'C', label: '海獭' },
      { key: 'D', label: '海马' },
    ],
    answer: ['A', 'C'],
    required: false,
  },
]

/* ======================== 字幕轨道 ======================== */

export const DEMO_SUBTITLES: SubtitleTrack[] = [
  { language: 'zh', label: '中文', src: '/subtitles/zh.vtt', default: true },
  { language: 'en', label: 'English', src: '/subtitles/en.vtt' },
]

/* ======================== 防作弊配置 ======================== */

export const DEMO_ANTI_CHEAT: AntiCheatConfig = {
  preventSeekOnFirstWatch: true,
  focusDetection: false,
  watermark: true,
  watermarkText: '学员: 张三 ID: 12345',
  heartbeatInterval: 30_000,
}

/* ======================== 场景配置 ======================== */

export interface DemoScene {
  key: DemoSceneKey
  title: string
  description: string
  icon: string
}

export type DemoSceneKey = 'basic' | 'hls' | 'education'

export const DEMO_SCENES: DemoScene[] = [
  {
    key: 'basic',
    title: '基础播放',
    description: '最简MP4播放，展示基本控制能力',
    icon: 'mdi:play-circle-outline',
  },
  {
    key: 'hls',
    title: 'HLS 直播流',
    description: '自适应码率HLS流，动态加载xgplayer-hls',
    icon: 'mdi:access-point-network',
  },
  {
    key: 'education',
    title: '在线教育全功能',
    description: '章节、测验、防作弊、书签与倍速播放',
    icon: 'mdi:school-outline',
  },
]

/** 公共播放选项只定义一次，场景配置仅补充差异项。 */
const BASE_PLAYER_PROPS = {
  fluid: true,
  fullscreen: true,
  pip: true,
  keyboard: true,
  screenshot: true,
} satisfies Partial<VideoPlayerProps>

export const DEMO_PLAYER_PROPS: Record<DemoSceneKey, VideoPlayerProps> = {
  basic: {
    ...BASE_PLAYER_PROPS,
    url: DEMO_SOURCES.mp4,
    poster: DEMO_SOURCES.poster,
    subtitles: DEMO_SUBTITLES,
    autoplayMuted: true,
  },
  hls: {
    ...BASE_PLAYER_PROPS,
    url: DEMO_SOURCES.hls,
    sourceType: 'hls',
    autoplayMuted: true,
  },
  education: {
    ...BASE_PLAYER_PROPS,
    url: DEMO_SOURCES.mp4,
    poster: DEMO_SOURCES.poster,
    autoplayMuted: false,
    chapters: DEMO_CHAPTERS,
    quizzes: DEMO_QUIZZES,
    subtitles: DEMO_SUBTITLES,
    antiCheat: DEMO_ANTI_CHEAT,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  },
}

/** 演示源切换不改变播放器身份；本地样例在无外网时仍可播放。 */
export type VideoSourceChoice = 'scene' | 'alternate' | 'local'
export const VIDEO_SOURCE_OPTIONS = [
  { label: '当前场景源', value: 'scene' },
  { label: '备用公开 MP4', value: 'alternate' },
  { label: '项目内置视频（可离线）', value: 'local' },
]

/** 章节、测验和清晰度均属于原视频，切换备用源时不沿用其业务内容。 */
export function resolveDemoPlayerProps(
  scene: DemoSceneKey,
  source: VideoSourceChoice
): VideoPlayerProps {
  const configured = DEMO_PLAYER_PROPS[scene]
  if (source === 'scene') return configured
  return {
    ...BASE_PLAYER_PROPS,
    url: source === 'local' ? '/menu-too-logo.webm' : DEMO_SOURCES.mp4Alt,
    // WebM 交给浏览器原生媒体引擎按 MIME 解码，不强制标记为 MP4。
    sourceType: source === 'local' ? undefined : 'mp4',
    autoplayMuted: false,
  }
}

/* ======================== 快捷键说明 ======================== */

export const SHORTCUT_LIST = [
  { key: 'Space', desc: '播放 / 暂停' },
  { key: '←', desc: '快退 5 秒' },
  { key: '→', desc: '快进 5 秒' },
  { key: '↑', desc: '音量 +10%' },
  { key: '↓', desc: '音量 -10%' },
  { key: 'F', desc: '全屏 / 退出全屏' },
  { key: 'M', desc: '静音 / 取消静音' },
  { key: 'Esc', desc: '退出全屏' },
]
