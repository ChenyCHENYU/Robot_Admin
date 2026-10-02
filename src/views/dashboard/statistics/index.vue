<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-06 14:09:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-26 10:04:05
 * @FilePath: \Robot_Admin\src\views\home\index.vue
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="statistics-dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="page-title">数据分析</h1>
        <p class="page-subtitle">实时业务数据概览</p>
      </div>
      <div class="header-right">
        <NDatePicker
          v-model:value="pickDate"
          type="daterange"
          placeholder="选择日期范围"
          class="date-picker"
        />
        <NButton
          type="primary"
          strong
          secondary
        >
          <template #icon>
            <C_Icon name="mdi:refresh" />
          </template>
          刷新数据
        </NButton>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <NCard
        v-for="(metric, index) in metrics"
        :key="index"
        class="metric-card"
        :class="`metric-${metric.type}`"
        hoverable
      >
        <div class="metric-content">
          <div class="metric-header">
            <div
              class="metric-icon"
              :style="{ background: metric.gradient }"
            >
              <C_Icon
                :name="metric.icon"
                size="28"
              />
            </div>
            <div class="metric-trend">
              <span
                class="trend-value"
                :class="[metric.trendUp ? 'trend-up' : 'trend-down']"
              >
                <C_Icon
                  :name="
                    metric.trendUp ? 'mdi:trending-up' : 'mdi:trending-down'
                  "
                  size="16"
                />
                {{ metric.trend }}
              </span>
            </div>
          </div>
          <div class="metric-body">
            <h3 class="metric-value">{{ metric.value }}</h3>
            <p class="metric-label">{{ metric.label }}</p>
            <p class="metric-desc">{{ metric.desc }}</p>
          </div>
          <div class="metric-chart">
            <div
              :ref="el => setChartRef(el, index)"
              class="mini-chart"
            ></div>
          </div>
        </div>
      </NCard>
    </div>

    <!-- 图表区域 -->
    <NGrid
      :x-gap="24"
      :y-gap="24"
    >
      <!-- 收入趋势图 -->
      <NGi :span="16">
        <NCard
          class="chart-card"
          hoverable
        >
          <template #header>
            <div class="chart-header">
              <div class="chart-title-group">
                <h3 class="chart-title">收入趋势</h3>
                <p class="chart-subtitle">近30天收入走势分析</p>
              </div>
              <NSpace>
                <NTag
                  type="success"
                  round
                >
                  <template #icon>
                    <div class="tag-dot"></div>
                  </template>
                  当前周期
                </NTag>
                <NTag
                  type="default"
                  round
                >
                  上一周期
                </NTag>
                <NButton
                  text
                  size="small"
                >
                  <C_Icon name="mdi:dots-horizontal" />
                </NButton>
              </NSpace>
            </div>
          </template>
          <div class="revenue-stats">
            <div
              v-for="(stat, index) in revenueStats"
              :key="index"
              class="revenue-stat-item"
            >
              <div class="stat-indicator">
                <span
                  class="stat-dot"
                  :style="{ background: stat.color }"
                ></span>
                <span class="stat-period">{{ stat.period }}</span>
              </div>
              <h2 class="stat-amount">¥{{ stat.amount }}</h2>
              <p class="stat-change">
                <C_Icon
                  :name="stat.changeUp ? 'mdi:arrow-up' : 'mdi:arrow-down'"
                  :style="{ color: stat.changeUp ? '#18a058' : '#d03050' }"
                />
                {{ stat.change }}
              </p>
            </div>
          </div>
          <div
            ref="revenueChartRef"
            class="chart-container"
            style="height: 360px"
          ></div>
        </NCard>
      </NGi>

      <!-- 数据分布饼图 -->
      <NGi :span="8">
        <NCard
          class="chart-card"
          hoverable
        >
          <template #header>
            <div class="chart-header">
              <div class="chart-title-group">
                <h3 class="chart-title">渠道分布</h3>
                <p class="chart-subtitle">流量来源占比</p>
              </div>
            </div>
          </template>
          <div
            ref="channelChartRef"
            class="chart-container"
            style="height: 320px"
          ></div>
          <div class="channel-legend">
            <div
              v-for="(channel, index) in channelData"
              :key="index"
              class="legend-item"
            >
              <div class="legend-info">
                <span
                  class="legend-dot"
                  :style="{ background: channel.color }"
                ></span>
                <span class="legend-label">{{ channel.name }}</span>
              </div>
              <div class="legend-value">
                <span class="legend-count">{{ channel.value }}</span>
                <span class="legend-percent">{{ channel.percent }}%</span>
              </div>
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script lang="ts" setup>
  import type { ComponentPublicInstance } from 'vue'
  import { useInitBarChart } from './useInitBarChart'
  import { useInitGridChart } from './useInitLineChart'
  import { useInitPolorChart } from './useInitPolorChart'

  const pickDate = ref()
  const chartRefs = ref<Array<HTMLElement | undefined>>([])
  const revenueChartRef = ref<HTMLElement | null>(null)
  const channelChartRef = ref<HTMLElement | null>(null)

  const setChartRef = (
    element: Element | ComponentPublicInstance | null,
    index: number
  ) => {
    chartRefs.value[index] =
      element instanceof HTMLElement ? element : undefined
  }

  // 核心指标数据
  const metrics = ref([
    {
      type: 'primary',
      icon: 'mdi:eye-outline',
      label: '总访问量',
      value: '156,789',
      desc: '今日访问',
      trend: '+12.5%',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      type: 'success',
      icon: 'mdi:account-multiple-plus',
      label: '新增用户',
      value: '8,426',
      desc: '较昨日',
      trend: '+8.2%',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      type: 'warning',
      icon: 'mdi:cart-outline',
      label: '成交订单',
      value: '3,562',
      desc: '转化率',
      trend: '-2.4%',
      trendUp: false,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      type: 'info',
      icon: 'mdi:currency-usd',
      label: '总收入',
      value: '¥2.4M',
      desc: '本月累计',
      trend: '+15.8%',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ])

  // 收入统计
  const revenueStats = ref([
    {
      period: '本周',
      amount: '486,352',
      change: '+18.2%',
      changeUp: true,
      color: '#18a058',
    },
    {
      period: '上周',
      amount: '412,086',
      change: '+12.5%',
      changeUp: true,
      color: '#909399',
    },
  ])

  // 渠道数据
  const channelData = ref([
    { name: '直接访问', value: '4,862', percent: 35, color: '#667eea' },
    { name: '搜索引擎', value: '3,248', percent: 28, color: '#764ba2' },
    { name: '社交媒体', value: '2,156', percent: 22, color: '#f093fb' },
    { name: '外部链接', value: '1,824', percent: 15, color: '#4facfe' },
  ])

  onMounted(() => {
    // 初始化迷你图表
    chartRefs.value.forEach((el: HTMLElement | undefined) => {
      if (el) {
        useInitBarChart(el)
      }
    })

    // 初始化主图表
    if (revenueChartRef.value) {
      useInitGridChart(revenueChartRef.value)
    }
    if (channelChartRef.value) {
      useInitPolorChart(channelChartRef.value)
    }
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
