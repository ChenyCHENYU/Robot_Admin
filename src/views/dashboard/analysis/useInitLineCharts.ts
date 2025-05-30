/*
 * @Author: GeekQiaQia
 * @Date: 2021-12-30 17:22:19
 * @LastEditTime: 2025-05-27 18:32:53
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @Description: 初始化折线图
 * @FilePath: \Robot_Admin\src\views\dashboard\analysis\useInitLineCharts.ts
 */

import * as echarts from 'echarts/core'
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
])

let option

export const useInitLineChart = (chartDom: HTMLElement | undefined) => {
  // var chartDom = document.getElementById('main');
  const myChart = echarts.init(chartDom as HTMLElement)

  option = {
    title: {
      //   text: 'Stacked Line'
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Email', 'Union Ads'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
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
        name: 'Email',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: 'Union Ads',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
      },
    ],
  }

  option && myChart.setOption(option)
}

export default { useInitLineChart }
