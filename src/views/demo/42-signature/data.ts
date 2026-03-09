/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\42-signature\data.ts
 * @Description: 电子签名演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ExportOptions } from '@robot-admin/naive-ui-components'

/** 演示场景配置 */
export const DEMO_SCENARIOS = [
  {
    id: 'basic',
    title: '基础签名',
    description: '最简单的签名板，默认配置',
  },
  {
    id: 'custom',
    title: '自定义配置',
    description: '自定义画笔颜色、粗细、背景色',
  },
  {
    id: 'watermark',
    title: '带水印签名',
    description: '签名带时间戳水印，适用于合同场景',
  },
  {
    id: 'readonly',
    title: '只读模式',
    description: '展示已有签名，不可编辑',
  },
] as const

/** 导出格式选项 */
export const EXPORT_OPTIONS: Array<{
  label: string
  value: ExportOptions['format']
}> = [
  { label: 'PNG（透明背景）', value: 'png' },
  { label: 'JPEG（白色背景）', value: 'jpeg' },
]

/** 预设签名示例图片（Base64） */
export const SAMPLE_SIGNATURE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
