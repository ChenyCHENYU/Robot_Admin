<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\shared\c_chart\index.vue
 * @Description: 响应式图表视图，主题变化与 KeepAlive 生命周期统一处理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="observatory-chart"
    role="img"
    :aria-label="label"
  >
    <div
      ref="container"
      class="observatory-chart__canvas"
      :aria-hidden="true"
    />
    <div
      v-if="empty"
      class="observatory-chart__empty"
      ><span class="i-mdi:chart-box-outline" />暂无采集数据</div
    >
  </div>
</template>
<script setup lang="ts">
  import * as echarts from 'echarts/core'
  import { BarChart, LineChart, PieChart, TreemapChart } from 'echarts/charts'
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
  } from 'echarts/components'
  import { SVGRenderer } from 'echarts/renderers'
  import type { ChartProps } from './types'
  import { s_themeStore } from '@/stores/theme'

  defineOptions({ name: 'ObservatoryChart' })
  const props = withDefaults(defineProps<ChartProps>(), { empty: false })
  const theme = s_themeStore()
  const container = ref<HTMLElement | null>(null)
  let chart: echarts.EChartsType | undefined
  let observer: ResizeObserver | undefined
  let active = true
  echarts.use([
    BarChart,
    LineChart,
    PieChart,
    TreemapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    SVGRenderer,
  ])

  /** 使用实际容器尺寸，保证 CSS 网格重排后 SVG 内部坐标同步更新。 */
  const resize = () => {
    if (!active || !container.value) return
    chart?.resize({
      width: container.value.clientWidth,
      height: container.value.clientHeight,
    })
  }

  /** CSS 主题 token 同时进入轴线、图例与背景，避免只切换页面背景。 */
  const render = () => {
    if (!active || !container.value || !container.value.clientWidth) return
    if (!chart)
      chart = echarts.init(container.value, undefined, { renderer: 'svg' })
    const css = getComputedStyle(container.value)
    const text = css.getPropertyValue('--app-text-secondary').trim()
    const border = css.getPropertyValue('--app-border-default').trim()
    const { tooltip } = props.option
    chart.setOption(
      {
        animationDuration: matchMedia('(prefers-reduced-motion: reduce)')
          .matches
          ? 0
          : 420,
        color: [
          '#4b7bec',
          '#21b7a8',
          '#8c6eea',
          '#e7ad43',
          '#ec7089',
          '#6b9fb5',
        ],
        textStyle: { color: text, fontFamily: 'inherit' },
        ...props.option,
        tooltip: {
          trigger: 'item',
          renderMode: 'richText',
          backgroundColor: css.getPropertyValue('--app-bg-content').trim(),
          borderColor: border,
          textStyle: {
            color: css.getPropertyValue('--app-text-primary').trim(),
          },
          confine: true,
          ...(typeof tooltip === 'object' &&
          tooltip !== null &&
          !Array.isArray(tooltip)
            ? tooltip
            : {}),
        },
      },
      { notMerge: true }
    )
    resize()
  }
  /** 只观察当前容器；侧栏折叠、网格换列与窗口变化均能重排图表。 */
  const activate = () => {
    active = true
    if (!container.value) return
    observer?.disconnect()
    observer = new ResizeObserver(() => {
      if (active) {
        if (chart) resize()
        else render()
      }
    })
    observer.observe(container.value)
    render()
  }
  /** 离开页面释放实例与监听，避免反复进入仪表盘造成内存增长。 */
  const dispose = () => {
    active = false
    observer?.disconnect()
    observer = undefined
    chart?.dispose()
    chart = undefined
  }
  onMounted(activate)
  onActivated(activate)
  onDeactivated(dispose)
  onBeforeUnmount(dispose)
  watch(
    [() => props.option, () => theme.isDark, () => theme.mode],
    () => void nextTick(render),
    { flush: 'post' }
  )
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
