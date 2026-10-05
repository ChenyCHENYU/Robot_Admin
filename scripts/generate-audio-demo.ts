/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\scripts\generate-audio-demo.ts
 * @Description: 生成原创低振幅合成音频，不依赖远端音乐或版权样本
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { mkdir, writeFile } from 'node:fs/promises'
const rate = 22050
const tracks = [
  {
    name: 'ambient',
    duration: 12,
    frequencies: [220, 277.18, 329.63],
    rhythm: false,
  },
  {
    name: 'pulse',
    duration: 10,
    frequencies: [196, 246.94, 293.66],
    rhythm: true,
  },
  {
    name: 'chime',
    duration: 8,
    frequencies: [523.25, 659.25, 783.99],
    rhythm: true,
  },
]
await mkdir('public/audio-demo', { recursive: true })
for (const track of tracks) {
  const count = rate * track.duration
  const bytes = new Uint8Array(44 + count * 2)
  const data = new DataView(bytes.buffer)
  const text = (offset: number, value: string) =>
    [...value].forEach((char, index) =>
      data.setUint8(offset + index, char.charCodeAt(0))
    )
  text(0, 'RIFF')
  data.setUint32(4, bytes.length - 8, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  data.setUint32(16, 16, true)
  data.setUint16(20, 1, true)
  data.setUint16(22, 1, true)
  data.setUint32(24, rate, true)
  data.setUint32(28, rate * 2, true)
  data.setUint16(32, 2, true)
  data.setUint16(34, 16, true)
  text(36, 'data')
  data.setUint32(40, count * 2, true)
  for (let index = 0; index < count; index++) {
    const time = index / rate
    const fade = Math.min(1, time / 0.3, (track.duration - time) / 0.5)
    const envelope = track.rhythm
      ? Math.exp(-(time % 0.75) * 5)
      : 0.75 + 0.25 * Math.sin(time * 0.8)
    const signal =
      track.frequencies.reduce(
        (sum, frequency, note) =>
          sum + Math.sin(2 * Math.PI * frequency * time) / (note + 1),
        0
      ) / 3
    data.setInt16(
      44 + index * 2,
      Math.round(signal * envelope * fade * 0.2 * 32767),
      true
    )
  }
  await writeFile(`public/audio-demo/${track.name}.wav`, bytes)
}
console.log('Generated 3 mono PCM demo clips (12 / 10 / 8 seconds).')
