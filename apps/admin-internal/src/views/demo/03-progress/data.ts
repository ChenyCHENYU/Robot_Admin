/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-08 22:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 22:00:00
 * @FilePath: \Robot_Admin\src\views\demo\03-progress\data.ts
 * @Description: 进度条组件演示数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// 进度条配置类型
export interface ProgressConfig {
  id: string
  title: string
  description: string
  type: 'line' | 'circle' | 'multiple-circle' | 'dashboard'
  props: Record<string, any>
  useNative?: boolean
}

// 进度条配置
export const progressConfigs: ProgressConfig[] = [
  {
    id: 'line',
    title: '基础进度条',
    description: '用于展示操作进度，如文件上传、数据加载等场景',
    type: 'line',
    props: {
      percentage: 60,
      isAnimation: true,
      strokeWidth: 12,
    },
  },
  {
    id: 'circle',
    title: '圆形进度条',
    description: '适用于空间受限的场景，如卡片、仪表板等',
    type: 'circle',
    props: {
      percentage: 75,
      color: '#18a058',
      strokeWidth: 10,
      isAnimation: true,
    },
  },
  {
    id: 'multiple-circle',
    title: '圈圈赛跑',
    description: '多圆环动态进度展示，适用于多任务并行处理场景',
    type: 'multiple-circle',
    props: {
      color: ['#2080f0', '#18a058', '#f0a020'],
    },
  },
  {
    id: 'double-circle',
    title: '双环进度条',
    description: '适用于同时展示两个相关指标，如CPU与内存使用率',
    type: 'multiple-circle',
    props: {
      strokeWidth: 10,
      circleGap: 10,
    },
    useNative: true,
  },
  {
    id: 'dashboard',
    title: '仪表盘进度条',
    description: '适用于系统监控、性能指标等场景',
    type: 'dashboard',
    props: {
      percentage: 85,
      gapDegree: 90,
      status: 'success',
      isAnimation: true,
    },
  },
  {
    id: 'status-line',
    title: '渐变进度条',
    description: '自定义颜色的进度条，适用于需要品牌色或特殊配色的场景',
    type: 'line',
    props: {
      percentage: 70,
      strokeWidth: 14,
      color: 'linear-gradient(90deg, #2080f0, #18a058)',
      isAnimation: true,
    },
  },
]

// 创建动画更新函数
export const createAnimationTimers = (
  circlePercentages: Ref<number[]>,
  doublePercentages: Ref<number[]>
) => {
  let raceTimer: ReturnType<typeof setInterval> | null = null
  let doubleTimer: ReturnType<typeof setInterval> | null = null

  const updateRace = () => {
    circlePercentages.value = circlePercentages.value.map(
      p => (p + Math.random() * 2 + 1) % 100
    )
  }

  const updateDouble = () => {
    doublePercentages.value = doublePercentages.value.map((p, i) => {
      const speed =
        i === 0 ? Math.random() * 1.5 + 0.5 : Math.random() * 1 + 0.3
      return (p + speed) % 100
    })
  }

  const start = () => {
    raceTimer = setInterval(updateRace, 100)
    doubleTimer = setInterval(updateDouble, 150)
  }

  const stop = () => {
    if (raceTimer) clearInterval(raceTimer)
    if (doubleTimer) clearInterval(doubleTimer)
    raceTimer = null
    doubleTimer = null
  }

  return { start, stop }
}
