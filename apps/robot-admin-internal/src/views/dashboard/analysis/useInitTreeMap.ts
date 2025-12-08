/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-28 09:48:05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-28 15:45:15
 * @FilePath: \Robot_Admin\src\views\dashboard\analysis\useInitTreeMap.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import * as echarts from 'echarts/core'
import { ref, onUnmounted } from 'vue'
import {
  TreemapChart,
  type TreemapSeriesOption,
  SunburstChart,
  type SunburstSeriesOption,
} from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([TreemapChart, SunburstChart, CanvasRenderer, UniversalTransition])

type EChartsOption = echarts.ComposeOption<
  SunburstSeriesOption | TreemapSeriesOption
>

let treemapOption: EChartsOption
let sunburstOption: EChartsOption

import data from '@/assets/data/echarts-package-size.json'

export const useInitTreeMap = (chartDom: HTMLElement | undefined) => {
  if (!chartDom) return

  // 使用 ref 存储 interval ID，方便清理
  const intervalId = ref<number>()
  // 存储图表实例
  const myChart = echarts.init(chartDom)

  // 清理函数
  const cleanup = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = undefined
    }
    myChart.dispose()
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    cleanup()
  })

  treemapOption = {
    series: [
      {
        type: 'treemap',
        id: 'echarts-package-size',
        animationDurationUpdate: 1000,
        roam: false,
        nodeClick: undefined,
        data: data.children,
        universalTransition: true,
        label: {
          show: true,
        },
        breadcrumb: {
          show: false,
        },
      },
    ],
  }

  sunburstOption = {
    series: [
      {
        type: 'sunburst',
        id: 'echarts-package-size',
        radius: ['20%', '90%'],
        animationDurationUpdate: 1000,
        nodeClick: undefined,
        data: data.children,
        universalTransition: true,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.5)',
        },
        label: {
          show: false,
        },
      },
    ],
  }

  let currentOption = treemapOption

  // 初始化图表
  myChart.setOption(currentOption)

  // 设置定时器并保存ID以便清理
  intervalId.value = window.setInterval(() => {
    currentOption =
      currentOption === treemapOption ? sunburstOption : treemapOption
    myChart.setOption(currentOption)
  }, 3000)
}

export default { useInitTreeMap }
