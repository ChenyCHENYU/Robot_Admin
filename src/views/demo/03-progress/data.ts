/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-08 22:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 22:00:00
 * @FilePath: \Robot_Admin\src\views\demo\03-progress\data.ts
 * @Description: 进度条组件演示数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { CSSProperties, Ref } from 'vue'
import { useThemeVars } from 'naive-ui'
import { changeColor } from 'seemly'

/** 两组指标模拟独立于组件动画，重复启动不增加计时器。 */
export const createAnimationTimers = (
  circlePercentages: Ref<number[]>,
  doublePercentages: Ref<number[]>
) => {
  let raceTimer: ReturnType<typeof setInterval> | undefined
  let doubleTimer: ReturnType<typeof setInterval> | undefined
  const start = () => {
    if (raceTimer !== undefined || doubleTimer !== undefined) return
    raceTimer = setInterval(() => {
      circlePercentages.value = circlePercentages.value.map(
        value => (value + Math.random() * 2 + 1) % 100
      )
    }, 100)
    doubleTimer = setInterval(() => {
      doublePercentages.value = doublePercentages.value.map(
        (value, index) =>
          (value +
            (index === 0 ? Math.random() * 1.5 + 0.5 : Math.random() + 0.3)) %
          100
      )
    }, 150)
  }
  const stop = () => {
    clearInterval(raceTimer)
    clearInterval(doubleTimer)
    raceTimer = undefined
    doubleTimer = undefined
  }
  return { start, stop }
}

/** KeepAlive 离开时暂停业务模拟，返回后继续保留原指标。 */
export function useProgressDemo() {
  const themeVars = useThemeVars()
  const circlePercentages = ref([0, 0, 0])
  const doublePercentages = ref([30, 60])
  const timers = createAnimationTimers(circlePercentages, doublePercentages)
  onMounted(timers.start)
  onActivated(timers.start)
  onDeactivated(timers.stop)
  onBeforeUnmount(timers.stop)
  const cardContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '260px',
    padding: '32px 24px',
  }
  const linearCardContentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '120px',
    padding: '32px 24px',
  }
  return {
    themeVars,
    circlePercentages,
    doublePercentages,
    cardContentStyle,
    linearCardContentStyle,
    changeColor,
  }
}
