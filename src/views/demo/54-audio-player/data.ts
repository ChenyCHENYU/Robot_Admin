/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\54-audio-player\data.ts
 * @Description: 音频播放器演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { AudioTrack } from '@robot-admin/naive-ui-components'

/** 功能特性 */
export const FEATURE_LIST = [
  {
    icon: 'mdi:play-circle',
    title: '播放控制',
    desc: '播放/暂停/上一曲/下一曲',
    tag: '核心',
  },
  {
    icon: 'mdi:progress-clock',
    title: '进度条',
    desc: '实时进度 + 点击跳转',
    tag: '核心',
  },
  {
    icon: 'mdi:volume-high',
    title: '音量调节',
    desc: '音量滑块 + 静音切换',
    tag: '交互',
  },
  {
    icon: 'mdi:repeat',
    title: '播放模式',
    desc: '列表/单曲/随机循环',
    tag: '交互',
  },
  {
    icon: 'mdi:playlist-music',
    title: '播放列表',
    desc: '可展开的曲目列表面板',
    tag: '扩展',
  },
]

export const TAG_TYPE_MAP: Record<string, string> = {
  核心: 'primary',
  交互: 'success',
  扩展: 'warning',
  样式: 'info',
}

/** ========== 场景 1: 音乐播放器 ========== */
export const MUSIC_TRACKS: AudioTrack[] = [
  {
    id: 'm1',
    title: 'Midnight Jazz',
    artist: 'The Jazz Collective',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/jazz/200/200',
    duration: 372,
  },
  {
    id: 'm2',
    title: 'Electric Dreams',
    artist: 'Synthwave Radio',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/synth/200/200',
    duration: 291,
  },
  {
    id: 'm3',
    title: 'Ocean Breeze',
    artist: 'Nature Sounds',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/ocean/200/200',
    duration: 318,
  },
  {
    id: 'm4',
    title: 'Urban Rhythm',
    artist: 'City Beats',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover: 'https://picsum.photos/seed/urban/200/200',
    duration: 264,
  },
  {
    id: 'm5',
    title: 'Dawn Chorus',
    artist: 'Morning Light',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    cover: 'https://picsum.photos/seed/dawn/200/200',
    duration: 346,
  },
]

/** ========== 场景 2: 语音消息 ========== */
export const VOICE_TRACKS: AudioTrack[] = [
  {
    id: 'v1',
    title: '项目沟通会议录音',
    artist: 'CHENY · 2026-03-04',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 245,
  },
  {
    id: 'v2',
    title: '需求评审语音记录',
    artist: '产品团队 · 2026-03-03',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 180,
  },
  {
    id: 'v3',
    title: '技术方案讨论',
    artist: '前端小组 · 2026-03-02',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 312,
  },
]

/** ========== 场景 3: 播客节目 ========== */
export const PODCAST_TRACKS: AudioTrack[] = [
  {
    id: 'p1',
    title: 'EP.42 Vue 3.5 新特性解读',
    artist: '前端早报',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    cover: 'https://picsum.photos/seed/podcast1/200/200',
    duration: 1824,
  },
  {
    id: 'p2',
    title: 'EP.41 TypeScript 5.8 实战',
    artist: '前端早报',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    cover: 'https://picsum.photos/seed/podcast2/200/200',
    duration: 2160,
  },
  {
    id: 'p3',
    title: 'EP.40 Vite 7 迁移指南',
    artist: '前端早报',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    cover: 'https://picsum.photos/seed/podcast3/200/200',
    duration: 1560,
  },
]

/** 演示场景 */
export const DEMO_SCENES = [
  {
    key: 'music',
    title: '音乐播放',
    description: '完整的音乐播放器',
    icon: 'mdi:music',
  },
  {
    key: 'voice',
    title: '语音消息',
    description: '会议录音 / 语音笔记',
    icon: 'mdi:microphone',
  },
  {
    key: 'podcast',
    title: '播客节目',
    description: '长音频播客管理',
    icon: 'mdi:podcast',
  },
] as const
