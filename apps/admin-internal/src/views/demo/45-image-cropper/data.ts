/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\45-image-cropper\data.ts
 * @Description: 图片裁剪演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  AspectRatioPreset,
  CropOutputFormat,
} from '@robot-admin/naive-ui-components'

/** 示例图片 */
export const DEMO_IMAGE = 'https://picsum.photos/seed/cropper/800/600'
export const DEMO_AVATAR = 'https://picsum.photos/seed/avatar/400/400'

/** 比例预设 */
export const ratioPresets: AspectRatioPreset[] = [
  { label: '自由', value: 0 },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
]

/** 输出格式选项 */
export const formatOptions: { label: string; value: CropOutputFormat }[] = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'WebP', value: 'webp' },
]

/** 质量选项 */
export const qualityOptions = [
  { label: '最高 (1.0)', value: 1 },
  { label: '高 (0.92)', value: 0.92 },
  { label: '中 (0.8)', value: 0.8 },
  { label: '低 (0.6)', value: 0.6 },
]
