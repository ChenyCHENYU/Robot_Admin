/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 图片工作台的场景预设与输出参数
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { CropOutputFormat } from '@robot-admin/naive-ui-components/C_ImageCropper'

export const CROP_PRESETS = [
  {
    key: 'free',
    label: '自由裁剪',
    note: '保留创作空间',
    ratio: 0,
    maxWidth: 1600,
    icon: 'i-mdi:crop',
  },
  {
    key: 'avatar',
    label: '头像',
    note: '1:1 · 最大 512px',
    ratio: 1,
    maxWidth: 512,
    icon: 'i-mdi-account-circle-outline',
  },
  {
    key: 'cover',
    label: '文章封面',
    note: '16:9 · 最大 1280px',
    ratio: 16 / 9,
    maxWidth: 1280,
    icon: 'i-mdi:image-outline',
  },
  {
    key: 'card',
    label: '内容卡片',
    note: '4:3 · 最大 960px',
    ratio: 4 / 3,
    maxWidth: 960,
    icon: 'i-mdi:file-document-outline',
  },
] as const
export const SAMPLE_IMAGES = [
  { key: 'robot', label: '品牌素材', src: '/robot-logo.png' },
  { key: 'avatar', label: '头像素材', src: '/robot-avatar.png' },
] as const
export const FORMAT_OPTIONS: Array<{ label: string; value: CropOutputFormat }> =
  [
    { label: 'PNG · 透明背景', value: 'png' },
    { label: 'JPEG · 照片', value: 'jpeg' },
    { label: 'WebP · 轻量网页', value: 'webp' },
  ]
export const formatFileSize = (size: number) =>
  size < 1024
    ? `${size} B`
    : size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / 1024 / 1024).toFixed(2)} MB`
