/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 08:55:05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:00:00
 * @FilePath: \Robot_Admin\src\views\demo\04-time\data.ts
 * @Description: 时间选择器组件演示数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { TimeRangeValue } from '@robot-admin/naive-ui-components/C_Time'

// 公共配置属性
export const commonAttrs = {
  small: { size: 'small', clearable: true },
  medium: { size: 'medium', clearable: true },
  large: { size: 'large', clearable: false },
} as const

const rangeFormats = {
  basic: { prefix: '', includeSeconds: false, showDuration: false },
  precise: { prefix: '精确', includeSeconds: true, showDuration: false },
  workShift: { prefix: '', includeSeconds: false, showDuration: true },
  custom: { prefix: '自定义', includeSeconds: false, showDuration: false },
}

export type TimeRangeScenario = keyof typeof rangeFormats

export const formatTime = (
  timestamp: number | null,
  includeSeconds = false
): string => {
  if (timestamp === null) return '未选择'
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  })
}

const formatDuration = (milliseconds: number): string => {
  const totalMinutes = Math.floor(milliseconds / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} 分钟`
  if (minutes === 0) return `${hours} 小时`
  return `${hours} 小时 ${minutes} 分钟`
}

/** 完整时间范围才显示结果，各演示只指定自己的格式。 */
export const formatTimeRange = (
  range: TimeRangeValue | null,
  scenario: TimeRangeScenario
): string => {
  const [start, end] = range ?? [null, null]
  if (start === null || end === null) return ''
  const { prefix, includeSeconds, showDuration } = rangeFormats[scenario]
  const label = `${prefix}时间段: ${formatTime(start, includeSeconds)} - ${formatTime(end, includeSeconds)}`
  return showDuration
    ? `${label} (时长: ${formatDuration(end - start)})`
    : label
}
