/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-10 23:41:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-11 00:13:26
 * @FilePath: \Robot_Admin\src\views\home\useInitLineChart.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import * as echarts from 'echarts/core'
import { GridComponent, type GridComponentOption } from 'echarts/components'
import { LineChart, type LineSeriesOption } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition])

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption
>

let option: EChartsOption

export const useInitGridChart = (chartDom: HTMLElement | undefined) => {
  const myChart = echarts.init(chartDom as HTMLElement)

  option = {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [55, 45, 60, 45, 37, 52, 44],
        type: 'line',
        smooth: true,
      },
      {
        name: 'Search Engine',
        type: 'line',
        emphasis: {
          focus: 'series',
        },
        smooth: true,
        areaStyle: {},
        data: [44, 31, 48, 34, 26, 40, 31],
      },
    ],
  }

  if (option) myChart.setOption(option)
}

export default { useInitGridChart }
