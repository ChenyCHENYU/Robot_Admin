<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-28 11:26:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 22:00:00
 * @FilePath: \Robot_Admin\src\views\demo\03-progress\index.vue
 * @Description: 进度条组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="progress-demo">
    <c_vTitle
      title="进度条组件场景示例"
      icon="mdi:chart-donut"
      description="支持线性、圆形、仪表盘等多种进度展示形式，适用于任务进度、系统监控等场景"
    />

    <div class="demo-grid">
      <!-- 基础进度条 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>基础进度条</h3>
            <NTag
              type="info"
              size="small"
              round
              >线性</NTag
            >
          </div>
          <p class="card-desc">用于展示操作进度，如文件上传、数据加载等场景</p>
        </template>
        <C_Progress
          :percentage="60"
          :is-animation="true"
          :stroke-width="12"
        />
      </NCard>

      <!-- 圆形进度条 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>圆形进度条</h3>
            <NTag
              type="success"
              size="small"
              round
              >圆形</NTag
            >
          </div>
          <p class="card-desc">适用于空间受限的场景，如卡片、仪表板等</p>
        </template>
        <C_Progress
          type="circle"
          :percentage="75"
          color="#18a058"
          :stroke-width="10"
          :is-animation="true"
        />
      </NCard>

      <!-- 圈圈赛跑 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>圈圈赛跑</h3>
            <NTag
              type="warning"
              size="small"
              round
              >多环</NTag
            >
          </div>
          <p class="card-desc">多圆环动态进度展示，适用于多任务并行处理场景</p>
        </template>
        <C_Progress
          type="multiple-circle"
          :percentage="circlePercentages"
          :color="['#2080f0', '#18a058', '#f0a020']"
        >
          <template #indicator>
            <div class="race-indicator">
              <div class="race-title">圈圈赛跑</div>
              <div class="race-speeds">
                <span>🏃‍♂️ {{ Math.round(circlePercentages[0]) }}%</span>
                <span>🏃‍♀️ {{ Math.round(circlePercentages[1]) }}%</span>
                <span>🏃 {{ Math.round(circlePercentages[2]) }}%</span>
              </div>
            </div>
          </template>
        </C_Progress>
      </NCard>

      <!-- 双环进度条 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>双环进度条</h3>
            <NTag
              size="small"
              round
              >双环</NTag
            >
          </div>
          <p class="card-desc">适用于同时展示两个相关指标，如CPU与内存使用率</p>
        </template>
        <NProgress
          type="multiple-circle"
          :stroke-width="10"
          :circle-gap="10"
          :percentage="doublePercentages"
          :color="[themeVars.infoColor, themeVars.successColor]"
          :rail-color="[
            changeColor(themeVars.infoColor, { alpha: 0.2 }),
            changeColor(themeVars.successColor, { alpha: 0.2 }),
          ]"
        />
      </NCard>

      <!-- 仪表盘进度条 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>仪表盘进度条</h3>
            <NTag
              type="error"
              size="small"
              round
              >仪表盘</NTag
            >
          </div>
          <p class="card-desc">适用于系统监控、性能指标等场景</p>
        </template>
        <C_Progress
          type="dashboard"
          :percentage="85"
          :gap-degree="90"
          status="success"
          :is-animation="true"
        />
      </NCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useThemeVars } from 'naive-ui/es'
  import { changeColor } from 'seemly'

  const themeVars = useThemeVars()

  // 动态进度数据
  const circlePercentages = ref([0, 0, 0])
  const doublePercentages = ref([30, 60])

  // 定时器
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

  onMounted(() => {
    raceTimer = setInterval(updateRace, 100)
    doubleTimer = setInterval(updateDouble, 150)
  })

  onBeforeUnmount(() => {
    if (raceTimer) clearInterval(raceTimer)
    if (doubleTimer) clearInterval(doubleTimer)
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
