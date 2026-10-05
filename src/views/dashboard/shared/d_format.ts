/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\shared\d_format.ts
 * @Description: 统一观测图表的体积、时间与轴线格式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
/** 保留测量单位；缺失数据使用占位，不伪造零。 */
export const formatBytes = (value: number | null | undefined): string => {
  if (value == null) return '—'
  return value >= 1024 * 1024
    ? `${(value / 1024 / 1024).toFixed(2)} MiB`
    : `${(value / 1024).toFixed(1)} KiB`
}
/** 小样本时间不四舍五入成无意义的零秒。 */
export const formatDuration = (value: number | null | undefined): string => {
  if (value == null) return '—'
  return value >= 1000
    ? `${(value / 1000).toFixed(2)} s`
    : `${Math.round(value)} ms`
}
/** 主题轴线使用透明中性色，亮暗主题保持一致的图表结构。 */
export const valueAxis = {
  type: 'value',
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: 'rgba(128,128,128,.13)', type: 'dashed' } },
  axisLabel: { color: 'inherit', fontSize: 10 },
} as const
export const categoryAxis = {
  type: 'category',
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: 'inherit', fontSize: 11 },
} as const
