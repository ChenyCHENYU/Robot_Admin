import type { EChartsCoreOption } from 'echarts/core'
import {
  createCostTrend,
  formatQuantity,
  type FactoryData,
  type summarizeCosts,
} from './data'

/** 趋势图与台账使用同一成本范围。 */
export function createTrendOption(
  summary: ReturnType<typeof summarizeCosts>
): EChartsCoreOption {
  const points = createCostTrend(summary)
  return {
    grid: { left: 58, right: 22, top: 28, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) =>
        `${formatQuantity(Number(value), 2)} 元/吨`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map(point => point.date.slice(5)),
      axisLabel: { color: '#869bb8', fontSize: 11, interval: 5 },
      axisLine: { lineStyle: { color: '#293950' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: '#869bb8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1f2d42', type: 'dashed' } },
    },
    series: [
      {
        name: '实际吨成本',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: points.map(point => point.value),
        lineStyle: { color: '#5ccdc1', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#5ccdc13a' },
              { offset: 1, color: '#5ccdc100' },
            ],
          },
        },
      },
      {
        name: '预算参考',
        type: 'line',
        showSymbol: false,
        data: points.map(() => summary.standardUnit),
        lineStyle: { color: '#dca963', width: 1.5, type: 'dashed' },
      },
    ],
  }
}

/** 按实际预算差额排序并显示当前范围的主要偏差。 */
export function createDeviationOption(
  factories: FactoryData[]
): EChartsCoreOption {
  const rows = [...factories]
    .sort(
      (a, b) =>
        Math.abs(b.actual - b.standard) - Math.abs(a.actual - a.standard)
    )
    .slice(0, 6)
    .reverse()
  return {
    grid: { top: 18, left: 100, right: 24, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#869bb8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1f2d42', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: rows.map(row => row.name),
      axisLabel: { color: '#b6c4d8', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        name: '预算偏差 / 万元',
        barMaxWidth: 15,
        data: rows.map(row => ({
          value: Number(((row.actual - row.standard) / 10000).toFixed(2)),
          itemStyle: {
            color: row.actual > row.standard ? '#dca963' : '#5ccdc1',
            borderRadius: 3,
          },
        })),
      },
    ],
  }
}
