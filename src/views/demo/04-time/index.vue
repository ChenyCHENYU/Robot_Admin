<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 08:55:05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:00:00
 * @FilePath: \Robot_Admin\src\views\demo\04-time\index.vue
 * @Description: 时间选择器组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="time-demo">
    <c_vTitle
      title="时间选择器组件场景示例"
      icon="mdi:clock-outline"
      description="支持单选、范围选择、时分秒精度控制等多种时间选择场景，适用于时间段选择、提醒设置等业务场景"
    />

    <div class="demo-grid">
      <!-- 基础时间段选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>基础时间段选择</h3>
            <NTag
              type="info"
              size="small"
              round
              >默认场景</NTag
            >
          </div>
          <p class="card-desc">
            适用于选择工作时间段、会议时间等场景，支持30分钟步进，时间格式为
            HH:mm
          </p>
        </template>
        <C_Time
          mode="range"
          :attrs="commonAttrs.medium"
          @change-range="(start, end) => handleRangeChange('basic', start, end)"
          @change-start="
            time => console.log('开始时间变化:', formatTimeHM(time))
          "
          @change-end="time => console.log('结束时间变化:', formatTimeHM(time))"
        />
        <NAlert
          v-if="results.basic"
          type="success"
          class="result-alert"
        >
          {{ results.basic }}
        </NAlert>
      </NCard>

      <!-- 精确时分秒选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>精确时分秒选择</h3>
            <NTag
              type="warning"
              size="small"
              round
              >高精度</NTag
            >
          </div>
          <p class="card-desc">
            适用于需要精确到秒的场景，如定时任务、倒计时设置等，默认显示当前时间
          </p>
        </template>
        <C_Time
          mode="range"
          format="HH:mm:ss"
          :use-seconds="true"
          :minute-step="1"
          :second-step="1"
          :default-start-time="currentTime"
          :default-end-time="currentTime + 3600000"
          :attrs="commonAttrs.medium"
          @change-range="
            (start, end) => handleRangeChange('precise', start, end, true)
          "
        />
        <NAlert
          v-if="results.precise"
          type="info"
          class="result-alert"
        >
          {{ results.precise }}
        </NAlert>
      </NCard>

      <!-- 单个时间选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>单个时间选择</h3>
            <NTag
              type="success"
              size="small"
              round
              >单选模式</NTag
            >
          </div>
          <p class="card-desc">适用于闹钟设置、提醒时间等单个时间点选择场景</p>
        </template>
        <C_Time
          mode="single"
          placeholder="请选择提醒时间"
          :default-single-time="reminderTime"
          :attrs="commonAttrs.medium"
          @change-single="handleSingleTimeChange"
        />
        <NAlert
          v-if="results.single"
          type="warning"
          class="result-alert"
        >
          {{ results.single }}
        </NAlert>
      </NCard>

      <!-- 智能时间限制选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>智能时间限制选择</h3>
            <NTag
              type="error"
              size="small"
              round
              >时间限制</NTag
            >
          </div>
          <p class="card-desc">
            启用智能时间限制功能，结束时间选择器中会自动隐藏早于开始时间的选项，确保逻辑正确性
          </p>
        </template>
        <C_Time
          mode="range"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :hour-step="1"
          :minute-step="30"
          :enable-time-restriction="true"
          :attrs="commonAttrs.large"
          @change-range="
            (start, end) =>
              handleRangeChange('workShift', start, end, false, true)
          "
        />
        <NAlert
          v-if="results.workShift"
          type="success"
          class="result-alert"
        >
          {{ results.workShift }}
        </NAlert>
        <NAlert
          type="info"
          class="result-alert"
        >
          当选择开始时间后，结束时间选择器会自动过滤掉早于开始时间的选项，实现智能时间限制
        </NAlert>
      </NCard>

      <!-- 自定义样式和行为 - 全宽卡片 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>自定义样式和行为</h3>
            <NTag
              size="small"
              round
              >自定义</NTag
            >
          </div>
          <p class="card-desc"
            >展示组件的自定义能力，包括样式定制、事件处理等</p
          >
        </template>
        <div class="custom-content">
          <C_Time
            ref="customTimeRef"
            mode="range"
            :attrs="commonAttrs.small"
            @change-range="
              (start, end) => handleRangeChange('custom', start, end)
            "
          />
          <div class="action-bar">
            <C_ActionBar :actions="customTimeActions" />
          </div>
        </div>
        <NAlert
          v-if="results.custom"
          type="default"
          class="result-alert"
        >
          {{ results.custom }}
        </NAlert>
      </NCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ActionItem } from '@/types/modules/action-bar'
  import { commonAttrs } from './data'

  // 响应式数据
  const results = reactive({
    basic: '',
    precise: '',
    single: '',
    workShift: '',
    custom: '',
  })

  // 时间相关数据
  const currentTime = ref(Date.now())
  const reminderTime = ref(new Date().setHours(9, 0, 0, 0))
  const customTimeRef = ref()

  // 格式化时间戳
  const formatTime = (
    timestamp: number | null,
    includeSeconds = false
  ): string => {
    if (!timestamp) return '未选择'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' }),
    })
  }

  const formatTimeHM = (timestamp: number | null): string =>
    formatTime(timestamp, false)

  // 计算时长
  const calculateDuration = (startTime: number, endTime: number): string => {
    const diffMs = endTime - startTime
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours === 0) return `${minutes} 分钟`
    if (minutes === 0) return `${hours} 小时`
    return `${hours} 小时 ${minutes} 分钟`
  }

  // 范围选择处理
  const handleRangeChange = (
    key: keyof typeof results,
    startTime: number | null,
    endTime: number | null,
    includeSeconds = false,
    showDuration = false
  ) => {
    if (!startTime || !endTime) {
      results[key] = ''
      return
    }

    const start = formatTime(startTime, includeSeconds)
    const end = formatTime(endTime, includeSeconds)
    const prefix = key === 'precise' ? '精确' : key === 'custom' ? '自定义' : ''

    let result = `${prefix}时间段: ${start} - ${end}`

    if (showDuration) {
      result += ` (时长: ${calculateDuration(startTime, endTime)})`
    }

    results[key] = result
  }

  // 单个时间选择处理
  const handleSingleTimeChange = (time: number | null) => {
    results.single = time ? `提醒设置为: ${formatTimeHM(time)}` : ''
  }

  // 自定义时间操作按钮
  const customTimeActions = computed((): ActionItem[] => [
    { label: '重置', onClick: resetCustomTime },
    { label: '设为当前时间', type: 'primary', onClick: setCurrentTime },
    { label: '获取值', type: 'info', onClick: getCurrentValues },
  ])

  // 重置自定义时间
  const resetCustomTime = () => {
    if (customTimeRef.value) {
      customTimeRef.value.reset()
      results.custom = '时间已重置'
    }
  }

  // 设置为当前时间
  const setCurrentTime = () => {
    if (customTimeRef.value) {
      const now = Date.now()
      customTimeRef.value.startTime = now
      customTimeRef.value.endTime = now + 3600000
      results.custom = '已设置为当前时间 + 1小时'
    }
  }

  // 获取当前值
  const getCurrentValues = () => {
    if (customTimeRef.value) {
      const start = customTimeRef.value.startTime
      const end = customTimeRef.value.endTime
      results.custom = `当前值: 开始=${formatTimeHM(start)}, 结束=${formatTimeHM(end)}`
    }
  }

  // 生命周期
  onMounted(() => {
    currentTime.value = Date.now()
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
