/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-10 23:41:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-11 00:13:40
 * @FilePath: \Robot_Admin\src\views\home\useInitPolorChart.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import * as echarts from 'echarts/core'
import {
  PolarComponent,
  type PolarComponentOption,
  LegendComponent,
  type LegendComponentOption,
} from 'echarts/components'
import { BarChart, type BarSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PolarComponent, LegendComponent, BarChart, CanvasRenderer])

type EChartsOption = echarts.ComposeOption<
  PolarComponentOption | LegendComponentOption | BarSeriesOption
>

let option: EChartsOption

export const useInitPolorChart = (chartDom: HTMLElement | undefined) => {
  const myChart = echarts.init(chartDom as HTMLElement)
  option = {
    angleAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    radiusAxis: {},
    polar: {},
    series: [
      {
        type: 'bar',
        data: [1, 2, 3, 4, 3, 5, 1],
        coordinateSystem: 'polar',
        name: 'Total',
        stack: 'a',
        emphasis: {
          focus: 'series',
        },
      },
      {
        type: 'bar',
        data: [2, 4, 6, 1, 3, 2, 1],
        coordinateSystem: 'polar',
        name: 'Reached',
        stack: 'a',
        emphasis: {
          focus: 'series',
        },
      },
      {
        type: 'bar',
        data: [1, 2, 3, 4, 1, 2, 5],
        coordinateSystem: 'polar',
        name: 'Opened',
        stack: 'a',
        emphasis: {
          focus: 'series',
        },
      },
    ],
    legend: {
      show: true,
      data: ['Total', 'Reached', 'Opened'],
    },
  }

  if (option) myChart.setOption(option)
}

export default { useInitPolorChart }
