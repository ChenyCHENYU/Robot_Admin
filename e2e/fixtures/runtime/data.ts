/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\data.ts
 * @Description: 有界本地数据与实际可解码媒体，不请求第三方服务
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { WaterFallItem } from '@robot-admin/naive-ui-components/C_WaterFall'

export const FIELD_COUNT = 240
export const ITEM_COUNT = 1200
const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#456789"/></svg>')}`
export const items: WaterFallItem[] = Array.from(
  { length: ITEM_COUNT },
  (_, index) => ({
    id: `asset-${index}`,
    title: `素材 ${index}`,
    src: image,
    width: 160,
    height: 120,
  })
)
export const fields: FormOption[] = Array.from(
  { length: FIELD_COUNT },
  (_, index) => ({
    prop: `field${index}`,
    label: `字段 ${index}`,
    type: 'input',
    attrs: { inputProps: { 'aria-label': `字段 ${index}` } },
  })
)
export const markdown = Array.from(
  { length: 80 },
  (_, index) =>
    `## 第 ${index + 1} 节\n\n这是本地文档内容，用于验证编辑器反复初始化与释放。\n\n- 明确资源所有权\n- 保留业务数据\n`
).join('\n')
export const videoUrl = new URL(
  '../../../public/menu-too-logo.webm',
  import.meta.url
).href

/** 构造一秒静音 PCM WAV；用于真实浏览器加载，不伪造媒体事件。 */
export function createAudioBlob(): Blob {
  const rate = 8000
  const buffer = new ArrayBuffer(44 + rate * 2)
  const view = new DataView(buffer)
  const text = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++)
      view.setUint8(offset + index, value.charCodeAt(index))
  }
  text(0, 'RIFF')
  view.setUint32(4, buffer.byteLength - 8, true)
  text(8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, rate * 2, true)
  return new Blob([buffer], { type: 'audio/wav' })
}
