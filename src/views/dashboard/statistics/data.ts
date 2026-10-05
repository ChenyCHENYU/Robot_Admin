/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\statistics\data.ts
 * @Description: 真实使用统计的事件说明与趋势、排行、分布图配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { EChartsCoreOption } from 'echarts/core'
import type { TelemetryEventType, UsageSummary } from '@/types/observability'
import { categoryAxis, valueAxis } from '../shared/d_format'

export const eventLabels: Record<TelemetryEventType, string> = {
  page_view: '页面访问',
  login_success: '登录成功',
  login_failure: '登录失败',
  company_switch: '公司切换',
  feature_action: '功能使用',
}
export const actionLabels: Record<string, string> = {
  repository_star: 'Star 入口',
  repository_open: '仓库入口',
  theme_change: '主题切换',
  language_change: '语言切换',
  report_export: '报告导出',
}
export const deviceLabels: Record<string, string> = {
  desktop: '桌面宽度',
  tablet: '平板宽度',
  mobile: '移动宽度',
}

/** 日趋势不插值造峰值，页面访问与成功登录使用同一计数单位。 */
export const createTrendOption = (
  summary: UsageSummary | null
): EChartsCoreOption => ({
  grid: { left: 35, right: 18, top: 20, bottom: 30 },
  xAxis: {
    ...categoryAxis,
    boundaryGap: false,
    data: summary?.daily.map(item => item.date.slice(5)) ?? [],
  },
  yAxis: { ...valueAxis, minInterval: 1 },
  tooltip: { trigger: 'axis' },
  series: [
    {
      name: eventLabels.page_view,
      type: 'line',
      smooth: false,
      symbolSize: 6,
      areaStyle: { opacity: 0.1 },
      lineStyle: { width: 3 },
      data: summary?.daily.map(item => item.views) ?? [],
    },
    {
      name: eventLabels.login_success,
      type: 'line',
      smooth: false,
      symbolSize: 6,
      lineStyle: { width: 2 },
      data: summary?.daily.map(item => item.logins) ?? [],
    },
  ],
})

/** 页面排名直接来自事件计数，未访问的页面不补演示流量。 */
export const createPagesOption = (
  summary: UsageSummary | null,
  title: (route: string) => string
): EChartsCoreOption => ({
  grid: { left: 115, right: 32, top: 10, bottom: 20 },
  xAxis: { ...valueAxis, minInterval: 1 },
  yAxis: {
    ...categoryAxis,
    inverse: true,
    data: summary?.pages.slice(0, 8).map(item => title(item.route)) ?? [],
    axisLabel: {
      color: 'inherit',
      fontSize: 10,
      width: 105,
      overflow: 'truncate',
    },
  },
  series: [
    {
      type: 'bar',
      barMaxWidth: 17,
      data: summary?.pages.slice(0, 8).map(item => item.views) ?? [],
      itemStyle: { borderRadius: [0, 5, 5, 0] },
      label: { show: true, position: 'right', color: 'inherit', fontSize: 10 },
    },
  ],
})

/** 环形图用于已记录的事件，不以本机样本推算全站访客。 */
export const createEventsOption = (
  summary: UsageSummary | null
): EChartsCoreOption => ({
  legend: {
    bottom: 0,
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { color: 'inherit', fontSize: 10 },
  },
  series: [
    {
      type: 'pie',
      radius: ['43%', '68%'],
      center: ['50%', '42%'],
      padAngle: 3,
      label: { show: false },
      itemStyle: { borderRadius: 5 },
      data:
        summary?.events
          .filter(item => item.count)
          .map(item => ({ name: eventLabels[item.type], value: item.count })) ??
        [],
    },
  ],
})
