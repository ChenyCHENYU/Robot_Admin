/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\54-audio-player\data.ts
 * @Description: 可离线播放的自生成 PCM 音频和矢量封面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { AudioTrack } from '@robot-admin/naive-ui-components'

/** 封面为代码生成的波形图案，不依赖远程图片。 */
function cover(color: string, second: string, phase: number): string {
  const bars = Array.from({ length: 35 }, (_, index) => {
    const height =
      20 +
      Math.abs(Math.sin(index * 0.55 + phase) * Math.cos(index * 0.17)) * 170
    return `<rect x="${28 + index * 7}" y="${160 - height / 2}" width="3" height="${height}" rx="2" fill="white" opacity="${0.3 + index / 65}"/>`
  }).join('')
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${second}"/></linearGradient></defs><rect width="320" height="320" rx="30" fill="url(#a)"/><circle cx="270" cy="30" r="100" fill="white" opacity=".06"/><circle cx="40" cy="300" r="140" fill="white" opacity=".04"/>${bars}<text x="28" y="281" font-size="12" letter-spacing="3" fill="white" opacity=".65" font-family="sans-serif">ROBOT / SOUND LAB</text></svg>`)}`
}
export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'ambient',
    title: '缓慢和弦',
    artist: 'Robot Sound Lab · 合成样例',
    src: '/audio-demo/ambient.wav',
    duration: 12,
    cover: cover('#325f72', '#143042', 0.3),
    extra: {
      description: '持续和弦与轻柔的振幅变化，适合体验音量和进度控制。',
    },
  },
  {
    id: 'pulse',
    title: '脉冲节奏',
    artist: 'Robot Sound Lab · 合成样例',
    src: '/audio-demo/pulse.wav',
    duration: 10,
    cover: cover('#635997', '#302343', 1),
    extra: {
      description: '短促的包络与规律节奏，适合体验列表切换和循环播放。',
    },
  },
  {
    id: 'chime',
    title: '清亮音阶',
    artist: 'Robot Sound Lab · 合成样例',
    src: '/audio-demo/chime.wav',
    duration: 8,
    cover: cover('#8d7145', '#403429', 2),
    extra: {
      description: '高音区的合成音色，适合体验单次播放与播放结束事件。',
    },
  },
]
