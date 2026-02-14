<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 21:43:34
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-29 22:06:51
 * @FilePath: \Robot_Admin\src\views\demo\05-date\index.vue
 * @Description: 日期选择器组件示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="examples-container">
    <NH1>日期选择器组件场景示例</NH1>
    <NCard hoverable>
      <!-- 单日期选择 -->
      <div class="example-section">
        <h3>1. 单日期选择</h3>
        <C_Date
          mode="date"
          placeholder="请选择日期"
          :disabled-before-today="true"
          value-format="yyyy-MM-dd"
          @change="handleSingleDateChange"
        />
        <p class="result">选择的日期: {{ singleDateResult || '未选择' }}</p>
      </div>

      <!-- 日期时间选择 -->
      <div class="example-section">
        <h3>2. 日期时间选择</h3>
        <C_Date
          mode="datetime"
          placeholder="请选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="handleSingleDateTimeChange"
        />
        <p class="result"
          >选择的日期时间: {{ singleDateTimeResult || '未选择' }}</p
        >
      </div>

      <!-- 日期范围选择 -->
      <div class="example-section">
        <h3>3. 日期范围选择</h3>
        <C_Date
          mode="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled-before-today="true"
          value-format="yyyy-MM-dd"
          @change="handleDateRangeChange"
        />
        <p class="result"
          >选择的日期范围: {{ formatRangeResult(dateRangeResult) }}</p
        >
      </div>

      <!-- 日期时间范围选择 -->
      <div class="example-section">
        <h3>4. 日期时间范围选择</h3>
        <C_Date
          mode="datetimerange"
          start-placeholder="开始日期时间"
          end-placeholder="结束日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="handleDateTimeRangeChange"
        />
        <p class="result"
          >选择的日期时间范围: {{ formatRangeResult(dateTimeRangeResult) }}</p
        >
      </div>

      <!-- 智能双日期选择 -->
      <div class="example-section">
        <h3>5. 智能双日期选择（联动限制）</h3>
        <C_Date
          mode="smart-range"
          start-placeholder="请选择开始日期"
          end-placeholder="请选择结束日期"
          :disabled-before-today="true"
          value-format="yyyy-MM-dd"
          :start-date-props="{ style: 'margin-right: 12px' }"
          @change="handleSmartRangeChange"
        />
        <p class="result"
          >选择的智能范围: {{ formatRangeResult(smartRangeResult) }}</p
        >
        <p class="tip"
          >💡 选择开始日期后，结束日期会自动启用，且不能早于开始日期</p
        >
      </div>

      <!-- 限制未来日期的示例 -->
      <div class="example-section">
        <h3>6. 限制未来日期（只能选择今天及以前）</h3>
        <C_Date
          mode="date"
          placeholder="请选择日期（不能超过今天）"
          :disabled-after-today="true"
          value-format="yyyy-MM-dd"
          @change="handlePastDateChange"
        />
        <p class="result">选择的日期: {{ pastDateResult || '未选择' }}</p>
      </div>

      <!-- 自定义格式示例 -->
      <div class="example-section">
        <h3>7. 自定义格式示例</h3>
        <div class="custom-format-group">
          <div>
            <label>时间戳格式:</label>
            <C_Date
              mode="date"
              placeholder="选择日期（时间戳）"
              @change="handleTimestampChange"
            />
            <p class="result">时间戳: {{ timestampResult || '未选择' }}</p>
          </div>

          <div>
            <label>中文格式:</label>
            <C_Date
              mode="date"
              placeholder="选择日期（中文格式）"
              value-format="yyyy年MM月dd日"
              @change="handleChineseDateChange"
            />
            <p class="result">中文日期: {{ chineseDateResult || '未选择' }}</p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="example-section">
        <h3>8. 组件操作</h3>
        <C_ActionBar :actions="dateActions" />
      </div>
    </NCard>

    <!-- 数据展示 -->
    <NCard
      title="当前所有数据"
      style="margin-top: 20px"
    >
      <pre class="data-display"> {{ JSON.stringify(allResults, null, 2) }}</pre>
    </NCard>
  </div>
</template>

<script lang="ts" setup>
  // 消息提示
  const message = useMessage()

  // 各种结果数据
  const singleDateResult = ref<string | number | null>(null)
  const singleDateTimeResult = ref<string | number | null>(null)
  const dateRangeResult = ref<[string | number, string | number] | null>(null)
  const dateTimeRangeResult = ref<[string | number, string | number] | null>(
    null
  )
  const smartRangeResult = ref<[string | number, string | number] | null>(null)
  const pastDateResult = ref<string | number | null>(null)
  const timestampResult = ref<number | null>(null)
  const chineseDateResult = ref<string | null>(null)

  /**
   * * @description: 格式化范围结果显示
   * ? @param {any} rangeValue 范围值
   * ! @return {string} 格式化后的字符串
   */
  const formatRangeResult = (rangeValue: any): string => {
    if (!rangeValue || !Array.isArray(rangeValue)) {
      return '未选择'
    }
    return `${rangeValue[0]} 至 ${rangeValue[1]}`
  }

  /**
   * * @description: 所有结果的计算属性
   */
  const allResults = computed(() => ({
    singleDate: singleDateResult.value,
    singleDateTime: singleDateTimeResult.value,
    dateRange: dateRangeResult.value,
    dateTimeRange: dateTimeRangeResult.value,
    smartRange: smartRangeResult.value,
    pastDate: pastDateResult.value,
    timestamp: timestampResult.value,
    chineseDate: chineseDateResult.value,
  }))

  // 事件处理函数
  const handleSingleDateChange = (value: any) => {
    singleDateResult.value = value
    console.info('单日期变化:', value)
  }

  const handleSingleDateTimeChange = (value: any) => {
    singleDateTimeResult.value = value
    console.info('单日期时间变化:', value)
  }

  const handleDateRangeChange = (value: any) => {
    dateRangeResult.value = value
    console.info('日期范围变化:', value)
  }

  const handleDateTimeRangeChange = (value: any) => {
    dateTimeRangeResult.value = value
    console.info('日期时间范围变化:', value)
  }

  const handleSmartRangeChange = (value: any) => {
    smartRangeResult.value = value
    console.info('智能范围变化:', value)
  }

  const handlePastDateChange = (value: any) => {
    pastDateResult.value = value
    console.info('过去日期变化:', value)
  }

  const handleTimestampChange = (value: any) => {
    // 如果需要时间戳格式，可以转换
    if (value) {
      const timestamp =
        typeof value === 'string' ? new Date(value).getTime() : value
      timestampResult.value = timestamp
    } else {
      timestampResult.value = null
    }
    console.info('时间戳变化:', timestampResult.value)
  }

  const handleChineseDateChange = (value: any) => {
    chineseDateResult.value = value
    console.info('中文日期变化:', value)
  }

  /** 日期操作按钮 */
  const dateActions = computed(() => [
    { label: '清空所有日期', type: 'warning' as const, onClick: clearAllDates },
    {
      label: '设置默认日期',
      type: 'primary' as const,
      onClick: setDefaultDates,
    },
    { label: '获取组件数据', type: 'info' as const, onClick: getComponentData },
  ])

  /**
   * * @description: 清空所有日期
   */
  const clearAllDates = () => {
    singleDateResult.value = null
    singleDateTimeResult.value = null
    dateRangeResult.value = null
    dateTimeRangeResult.value = null
    smartRangeResult.value = null
    pastDateResult.value = null
    timestampResult.value = null
    chineseDateResult.value = null

    message.success('所有日期已清空')
  }

  /**
   * * @description: 设置默认日期
   */
  const setDefaultDates = () => {
    singleDateResult.value = '2024-01-15'
    singleDateTimeResult.value = '2024-01-15 14:30:00'
    dateRangeResult.value = ['2024-01-10', '2024-01-20']

    message.info('已设置默认日期')
  }

  /**
   * * @description: 获取组件数据
   */
  const getComponentData = () => {
    console.info('当前所有数据:', allResults.value)
    message.info('数据已输出到控制台')
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
