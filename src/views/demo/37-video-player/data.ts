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
  QualityDefinition,
  SubtitleTrack,
  AntiCheatConfig,
} from '@robot-admin/naive-ui-components'

/* ======================== 公开测试视频源 ======================== */

/** MP4 测试源（Big Buck Bunny - 开源短片） */
export const DEMO_SOURCES = {
  mp4: 'https://vjs.zencdn.net/v/oceans.mp4',
  mp4Alt: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  poster: 'https://vjs.zencdn.net/v/oceans.png',
  posterAlt:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sintel_poster.jpg/220px-Sintel_poster.jpg',
} as const

/* ======================== 清晰度列表 ======================== */

export const DEMO_QUALITY_LIST: QualityDefinition[] = [
  {
    label: '360p',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    bitrate: 500,
  },
  {
    label: '720p',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    bitrate: 1500,
  },
  {
    label: '1080p',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    bitrate: 3000,
  },
]

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
  key: string
  title: string
  description: string
  icon: string
}

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
    description: '章节、测验、防作弊、书签、清晰度、倍速一体',
    icon: 'mdi:school-outline',
  },
]

/* ======================== 功能特性列表 ======================== */

export interface FeatureItem {
  icon: string
  title: string
  desc: string
  tag: string
}

export const FEATURE_LIST: FeatureItem[] = [
  {
    icon: 'mdi:filmstrip',
    title: '多格式',
    desc: 'MP4 / HLS / DASH（预留）',
    tag: '核心',
  },
  {
    icon: 'mdi:high-definition-box',
    title: '清晰度切换',
    desc: '360P ~ 4K 手动切换',
    tag: '核心',
  },
  {
    icon: 'mdi:play-speed',
    title: '倍速播放',
    desc: '0.5x ~ 3.0x 调速',
    tag: '核心',
  },
  {
    icon: 'mdi:bookmark-multiple-outline',
    title: '章节标记',
    desc: '进度条章节分段导航',
    tag: '教育',
  },
  {
    icon: 'mdi:bookmark-plus-outline',
    title: '书签笔记',
    desc: '任意时间点打标签记笔记',
    tag: '教育',
  },
  {
    icon: 'mdi:chart-timeline-variant-shimmer',
    title: '进度追踪',
    desc: '观看时长、完成百分比、心跳上报',
    tag: '教育',
  },
  {
    icon: 'mdi:play-pause',
    title: '断点续播',
    desc: 'localStorage 自动记忆播放位置',
    tag: '教育',
  },
  {
    icon: 'mdi:shield-check-outline',
    title: '防作弊',
    desc: '防跳播、焦点检测、动态水印',
    tag: '安全',
  },
  {
    icon: 'mdi:message-question-outline',
    title: '视频内测验',
    desc: '指定时间弹出测验题',
    tag: '教育',
  },
  {
    icon: 'mdi:picture-in-picture-bottom-right-outline',
    title: '画中画 & 小窗',
    desc: '浏览器PiP + 滚动浮动小窗',
    tag: '体验',
  },
  {
    icon: 'mdi:keyboard-outline',
    title: '快捷键',
    desc: '空格/方向键/F/M 全键盘操作',
    tag: '体验',
  },
  {
    icon: 'mdi:chart-bar',
    title: '数据分析',
    desc: '播放行为事件上报',
    tag: '运营',
  },
]

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

/* ======================== 功能标签配色 ======================== */

type TagType = 'default' | 'success' | 'info' | 'warning' | 'error'

export const TAG_TYPE_MAP: Record<string, TagType> = {
  核心: 'success',
  教育: 'info',
  安全: 'error',
  体验: 'warning',
  运营: 'default',
}

/* ======================== API 参考表格 ======================== */

export const PROPS_COLUMNS = [
  { title: '属性', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 200 },
  { title: '默认值', key: 'default', width: 120 },
  { title: '说明', key: 'desc' },
]

export const PROPS_DATA = [
  { name: 'url', type: 'string', default: '—', desc: '视频源地址（必填）' },
  {
    name: 'sourceType',
    type: "'mp4'|'hls'|'dash'|'flv'",
    default: '自动检测',
    desc: '视频格式类型',
  },
  { name: 'poster', type: 'string', default: '—', desc: '封面图地址' },
  { name: 'autoplay', type: 'boolean', default: 'false', desc: '自动播放' },
  {
    name: 'qualityList',
    type: 'QualityDefinition[]',
    default: '—',
    desc: '清晰度列表',
  },
  { name: 'chapters', type: 'Chapter[]', default: '—', desc: '章节列表' },
  { name: 'quizzes', type: 'VideoQuiz[]', default: '—', desc: '视频内测验' },
  {
    name: 'antiCheat',
    type: 'AntiCheatConfig',
    default: '—',
    desc: '防作弊配置',
  },
  {
    name: 'playbackRates',
    type: 'PlaybackRate[]',
    default: '[0.5~3.0]',
    desc: '倍速列表',
  },
  { name: 'pip', type: 'boolean', default: 'true', desc: '画中画' },
  { name: 'keyboard', type: 'boolean', default: 'true', desc: '快捷键' },
  {
    name: 'onProgress',
    type: 'ProgressReporter',
    default: '—',
    desc: '进度上报回调',
  },
  {
    name: 'onAnalytics',
    type: 'AnalyticsReporter',
    default: '—',
    desc: '数据分析上报',
  },
  {
    name: 'playerOptions',
    type: 'Partial<IPlayerOptions>',
    default: '—',
    desc: 'xgplayer 原生配置透传',
  },
]

export const EVENTS_COLUMNS = [
  { title: '事件', key: 'name', width: 180 },
  { title: '参数', key: 'params', width: 260 },
  { title: '说明', key: 'desc' },
]

export const EVENTS_DATA = [
  { name: 'ready', params: '—', desc: '播放器就绪' },
  { name: 'stateChange', params: 'state: PlayerState', desc: '播放状态变化' },
  { name: 'timeUpdate', params: 'currentTime, duration', desc: '播放时间更新' },
  { name: 'ended', params: '—', desc: '播放结束' },
  { name: 'error', params: 'error: Error', desc: '播放错误' },
  {
    name: 'qualityChange',
    params: 'quality: QualityLevel',
    desc: '清晰度切换',
  },
  { name: 'rateChange', params: 'rate: number', desc: '倍速切换' },
  { name: 'bookmarkChange', params: 'bookmarks: Bookmark[]', desc: '书签变化' },
  { name: 'quizAnswer', params: 'quizId, answer, isCorrect', desc: '测验作答' },
  { name: 'chapterChange', params: 'chapter: Chapter', desc: '章节切换' },
  { name: 'progressUpdate', params: 'data: ProgressData', desc: '进度更新' },
]

export const EXPOSE_COLUMNS = [
  { title: '方法', key: 'name', width: 220 },
  { title: '参数', key: 'params', width: 200 },
  { title: '说明', key: 'desc' },
]

export const EXPOSE_DATA = [
  { name: 'play()', params: '—', desc: '播放' },
  { name: 'pause()', params: '—', desc: '暂停' },
  { name: 'seek(time)', params: 'time: number', desc: '跳转到指定时间' },
  { name: 'setPlaybackRate(rate)', params: 'rate: number', desc: '设置倍速' },
  { name: 'setVolume(vol)', params: 'volume: number 0-1', desc: '设置音量' },
  {
    name: 'switchQuality(q)',
    params: 'quality: QualityLevel',
    desc: '切换清晰度',
  },
  { name: 'getProgressData()', params: '—', desc: '获取当前进度数据' },
  { name: 'destroy()', params: '—', desc: '销毁播放器' },
  { name: 'getPlayerInstance()', params: '—', desc: '获取 xgplayer 原始实例' },
]
