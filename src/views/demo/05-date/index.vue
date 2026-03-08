<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 21:43:34
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:15:00
 * @FilePath: \Robot_Admin\src\views\demo\05-date\index.vue
 * @Description: 日期选择器组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="date-demo">
    <c_vTitle
      title="日期选择器组件场景示例"
      icon="mdi:calendar"
      description="支持单日期、日期范围、日期时间等多种选择模式，适用于预约、日程安排等业务场景"
    />

    <div class="demo-grid">
      <!-- 单日期选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>单日期选择</h3>
            <NTag
              type="info"
              size="small"
              round
              >基础</NTag
            >
          </div>
          <p class="card-desc">选择单个日期，支持禁用今天之前的日期</p>
        </template>
        <C_Date
          v-model:singleDate="singleDateResult"
          mode="date"
          placeholder="请选择日期"
          :disabled-before-today="true"
          value-format="yyyy-MM-dd"
        />
        <div class="result-box">
          {{ singleDateResult || '未选择' }}
        </div>
      </NCard>

      <!-- 日期时间选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>日期时间选择</h3>
            <NTag
              type="success"
              size="small"
              round
              >精确</NTag
            >
          </div>
          <p class="card-desc">选择日期和时间，精确到秒</p>
        </template>
        <C_Date
          v-model:singleDateTime="singleDateTimeResult"
          mode="datetime"
          placeholder="请选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <div class="result-box">
          {{ singleDateTimeResult || '未选择' }}
        </div>
      </NCard>

      <!-- 日期范围选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>日期范围选择</h3>
            <NTag
              type="warning"
              size="small"
              round
              >范围</NTag
            >
          </div>
          <p class="card-desc">选择日期范围，支持禁用今天之前的日期</p>
        </template>
        <C_Date
          v-model:dateRange="dateRangeResult"
          mode="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled-before-today="true"
          value-format="yyyy-MM-dd"
        />
        <div class="result-box">
          {{ formatRange(dateRangeResult) }}
        </div>
      </NCard>

      <!-- 日期时间范围选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>日期时间范围选择</h3>
            <NTag
              type="error"
              size="small"
              round
              >精确范围</NTag
            >
          </div>
          <p class="card-desc">选择日期时间范围，精确到秒</p>
        </template>
        <C_Date
          v-model:dateTimeRange="dateTimeRangeResult"
          mode="datetimerange"
          start-placeholder="开始日期时间"
          end-placeholder="结束日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <div class="result-box">
          {{ formatRange(dateTimeRangeResult) }}
        </div>
      </NCard>

      <!-- 智能双日期选择 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>智能双日期选择</h3>
            <NTag
              type="info"
              size="small"
              round
              >联动限制</NTag
            >
          </div>
          <p class="card-desc"
            >两个独立的日期选择器，结束日期不能早于开始日期</p
          >
        </template>
        <C_Date
          v-model:smartRange="smartRangeResult"
          mode="smart-range"
          start-placeholder="请选择开始日期"
          end-placeholder="请选择结束日期"
          :disabled-before-today="true"
          value-format="yyyy-MM-dd"
        />
        <div class="result-box">
          {{ formatRange(smartRangeResult) }}
        </div>
        <NAlert
          type="info"
          size="small"
          class="tip-alert"
        >
          选择开始日期后，结束日期会自动启用，且不能早于开始日期
        </NAlert>
      </NCard>

      <!-- 限制未来日期 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>限制未来日期</h3>
            <NTag
              type="warning"
              size="small"
              round
              >过去日期</NTag
            >
          </div>
          <p class="card-desc">只能选择今天及以前的日期</p>
        </template>
        <C_Date
          v-model:singleDate="pastDateResult"
          mode="date"
          placeholder="请选择日期（不能超过今天）"
          :disabled-after-today="true"
          value-format="yyyy-MM-dd"
        />
        <div class="result-box">
          {{ pastDateResult || '未选择' }}
        </div>
      </NCard>

      <!-- 自定义格式 - 全宽卡片 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>自定义格式示例</h3>
            <NTag
              size="small"
              round
              >格式化</NTag
            >
          </div>
          <p class="card-desc">展示不同的日期格式化输出方式</p>
        </template>
        <div class="custom-format-grid">
          <div class="format-item">
            <label>时间戳格式:</label>
            <C_Date
              v-model:singleDate="timestampDateResult"
              mode="date"
              placeholder="选择日期（时间戳）"
            />
            <div class="result-box">{{ timestampDisplay }}</div>
          </div>

          <div class="format-item">
            <label>中文格式:</label>
            <C_Date
              v-model:singleDate="chineseDateResult"
              mode="date"
              placeholder="选择日期（中文格式）"
              value-format="yyyy年MM月dd日"
            />
            <div class="result-box">{{ chineseDateResult || '未选择' }}</div>
          </div>
        </div>
      </NCard>

      <!-- 组件操作 - 全宽卡片 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>组件操作</h3>
            <NTag
              type="success"
              size="small"
              round
              >操作</NTag
            >
          </div>
          <p class="card-desc">提供清空、设置默认值、获取数据等操作</p>
        </template>
        <C_ActionBar :actions="dateActions" />

        <!-- 数据展示 -->
        <div class="data-display">
          <pre>{{ JSON.stringify(allResults, null, 2) }}</pre>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { createDateActions } from './data'

  const message = useMessage()

  // 各模式数据（formatted-value 绑定，类型统一为 string）
  const singleDateResult = ref<string | null>(null)
  const singleDateTimeResult = ref<string | null>(null)
  const dateRangeResult = ref<[string, string] | null>(null)
  const dateTimeRangeResult = ref<[string, string] | null>(null)
  const smartRangeResult = ref<[string, string] | null>(null)
  const pastDateResult = ref<string | null>(null)
  const timestampDateResult = ref<string | null>(null)
  const chineseDateResult = ref<string | null>(null)

  /**
   * * @description: 格式化范围显示
   */
  const formatRange = (val: [string, string] | null) =>
    val ? `${val[0]} 至 ${val[1]}` : '未选择'

  /**
   * * @description: 时间戳展示（从格式化日期计算）
   */
  const timestampDisplay = computed(() => {
    if (!timestampDateResult.value) return '未选择'
    const ts = new Date(timestampDateResult.value).getTime()
    return `${timestampDateResult.value} (时间戳: ${ts})`
  })

  /**
   * * @description: 所有结果汇总
   */
  const allResults = computed(() => ({
    singleDate: singleDateResult.value,
    singleDateTime: singleDateTimeResult.value,
    dateRange: dateRangeResult.value,
    dateTimeRange: dateTimeRangeResult.value,
    smartRange: smartRangeResult.value,
    pastDate: pastDateResult.value,
    timestamp: timestampDisplay.value,
    chineseDate: chineseDateResult.value,
  }))

  /**
   * * @description: 清空所有日期（受控模式，直接置空 ref 即可驱动组件）
   */
  const clearAllDates = () => {
    singleDateResult.value = null
    singleDateTimeResult.value = null
    dateRangeResult.value = null
    dateTimeRangeResult.value = null
    smartRangeResult.value = null
    pastDateResult.value = null
    timestampDateResult.value = null
    chineseDateResult.value = null
    message.success('所有日期已清空')
  }

  /**
   * * @description: 设置默认日期（仅对前三个选择器）
   */
  const setDefaultDates = () => {
    const emptyCount = [
      !singleDateResult.value,
      !singleDateTimeResult.value,
      !dateRangeResult.value,
    ].filter(Boolean).length

    if (!singleDateResult.value) singleDateResult.value = '2024-01-15'
    if (!singleDateTimeResult.value)
      singleDateTimeResult.value = '2024-01-15 14:30:00'
    if (!dateRangeResult.value)
      dateRangeResult.value = ['2024-01-10', '2024-01-20']

    if (emptyCount === 0) message.info('前三个选择器已有值')
    else message.success(`已设置 ${emptyCount} 个默认日期`)
  }

  /**
   * * @description: 获取组件数据
   */
  const getComponentData = () => {
    console.info('当前所有数据:', allResults.value)
    message.info('数据已输出到控制台')
  }

  const dateActions = computed(() =>
    createDateActions(clearAllDates, setDefaultDates, getComponentData)
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
