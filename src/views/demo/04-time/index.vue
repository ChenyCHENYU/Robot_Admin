<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 08:55:05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-22 10:38:59
 * @FilePath: \Robot_Admin\src\views\demo\04-time\index.vue
 * @Description: 时间选择器组件场景示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="time-demo-page">
    <NH1>时间选择器组件场景示例</NH1>
    <NSpace
      vertical
      :size="24"
    >
      <!-- 场景1: 基础时间段选择 -->
      <NCard
        title="场景1: 基础时间段选择"
        hoverable
      >
        <template #header-extra>
          <NTag type="info">默认场景</NTag>
        </template>

        <NSpace vertical>
          <NText depth="2">
            适用于选择工作时间段、会议时间等场景，支持30分钟步进，时间格式为
            HH:mm
          </NText>

          <C_Time
            mode="range"
            :attrs="commonAttrs.medium"
            @change-range="
              (start, end) => handleRangeChange('basic', start, end)
            "
            @change-start="
              time => console.log('开始时间变化:', formatTimeHM(time))
            "
            @change-end="
              time => console.log('结束时间变化:', formatTimeHM(time))
            "
          />

          <NAlert
            v-if="results.basic"
            type="success"
            style="margin-top: 12px"
          >
            <template #header>选择结果</template>
            {{ results.basic }}
          </NAlert>
        </NSpace>
      </NCard>

      <!-- 场景2: 精确时分秒选择 -->
      <NCard
        title="场景2: 精确时分秒选择"
        hoverable
      >
        <template #header-extra>
          <NTag type="warning">高精度</NTag>
        </template>

        <NSpace vertical>
          <NText depth="2">
            适用于需要精确到秒的场景，如定时任务、倒计时设置等，默认显示当前时间
          </NText>

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
            style="margin-top: 12px"
          >
            <template #header>精确选择结果</template>
            {{ results.precise }}
          </NAlert>
        </NSpace>
      </NCard>

      <!-- 场景3: 单个时间选择 -->
      <NCard
        title="场景3: 单个时间选择"
        hoverable
      >
        <template #header-extra>
          <NTag type="success">单选模式</NTag>
        </template>

        <NSpace vertical>
          <NText depth="2">
            适用于闹钟设置、提醒时间等单个时间点选择场景
          </NText>

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
            style="margin-top: 12px"
          >
            <template #header>提醒时间</template>
            {{ results.single }}
          </NAlert>
        </NSpace>
      </NCard>

      <!-- 场景4: 智能时间限制选择 -->
      <NCard
        title="场景4: 智能时间限制选择"
        hoverable
      >
        <template #header-extra>
          <NTag type="error">时间限制</NTag>
        </template>

        <NSpace vertical>
          <NText depth="2">
            启用智能时间限制功能，结束时间选择器中会自动隐藏早于开始时间的选项，确保逻辑正确性
          </NText>

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
            style="margin-top: 12px"
          >
            <template #header>智能限制结果</template>
            {{ results.workShift }}
          </NAlert>

          <NAlert
            type="info"
            style="margin-top: 8px"
          >
            <template #header>功能说明</template>
            当选择开始时间后，结束时间选择器会自动过滤掉早于开始时间的选项，实现智能时间限制
          </NAlert>
        </NSpace>
      </NCard>

      <!-- 场景5: 自定义样式和行为 -->
      <NCard
        title="场景5: 自定义样式和行为"
        hoverable
      >
        <template #header-extra>
          <NTag type="default">自定义</NTag>
        </template>

        <NSpace vertical>
          <NText depth="2">
            展示组件的自定义能力，包括样式定制、事件处理等
          </NText>

          <NSpace>
            <C_Time
              ref="customTimeRef"
              mode="range"
              :attrs="commonAttrs.small"
              @change-range="
                (start, end) => handleRangeChange('custom', start, end)
              "
            />

            <C_ActionBar :actions="customTimeActions" />
          </NSpace>

          <NAlert
            v-if="results.custom"
            type="default"
            style="margin-top: 12px"
          >
            <template #header>自定义操作结果</template>
            {{ results.custom }}
          </NAlert>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<script lang="ts" setup>
  import type { TimePickerProps } from 'naive-ui/es'

  /**
   * 响应式数据 - 使用对象统一管理结果
   */
  const results = reactive({
    basic: '',
    precise: '',
    single: '',
    workShift: '',
    custom: '',
  })

  /**
   * 时间相关数据
   */
  const currentTime = ref(Date.now())
  const reminderTime = ref(new Date().setHours(9, 0, 0, 0)) // 默认上午9点
  const customTimeRef = ref()

  /**
   * 公共配置属性 - 减少重复定义
   */
  const commonAttrs = {
    small: { size: 'small', clearable: true } as Partial<TimePickerProps>,
    medium: { size: 'medium', clearable: true } as Partial<TimePickerProps>,
    large: { size: 'large', clearable: false } as Partial<TimePickerProps>,
  }

  /**
   * * @description 格式化时间戳为可读字符串
   * ? @param timestamp - 时间戳
   * ? @param includeSeconds - 是否包含秒
   * ! @return 格式化后的时间字符串
   */
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

  /**
   * 格式化时间戳为时分格式 - 使用 formatTime 函数避免重复
   */
  const formatTimeHM = (timestamp: number | null): string =>
    formatTime(timestamp, false)

  /**
   * * @description 计算时长
   * ? @param startTime - 开始时间戳
   * ? @param endTime - 结束时间戳
   * ! @return 格式化的时长字符串
   */
  const calculateDuration = (startTime: number, endTime: number): string => {
    const diffMs = endTime - startTime
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours === 0) return `${minutes} 分钟`
    if (minutes === 0) return `${hours} 小时`
    return `${hours} 小时 ${minutes} 分钟`
  }

  /**
   * * @description: 统一的范围选择处理函数
   * ? @param key - 结果存储的键名
   * ? @param startTime - 开始时间
   * ? @param endTime - 结束时间
   * ? @param includeSeconds - 是否包含秒
   * ? @param showDuration - 是否显示时长
   * ! @return void
   */
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

  /**
   * 单个时间选择处理
   */
  const handleSingleTimeChange = (time: number | null) => {
    results.single = time ? `提醒设置为: ${formatTimeHM(time)}` : ''
  }

  /** 自定义时间操作按钮 */
  const customTimeActions = computed(() => [
    { label: '重置', onClick: resetCustomTime },
    {
      label: '设为当前时间',
      type: 'primary' as const,
      onClick: setCurrentTime,
    },
    { label: '获取值', type: 'info' as const, onClick: getCurrentValues },
  ])

  /**
   * 自定义操作方法
   */

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
      customTimeRef.value.setStartTime(now)
      customTimeRef.value.setEndTime(now + 3600000) // 1小时后
      results.custom = '已设置为当前时间 + 1小时'
    }
  }

  // 获取当前值
  const getCurrentValues = () => {
    if (customTimeRef.value) {
      const startTime = customTimeRef.value.getStartTime()
      const endTime = customTimeRef.value.getEndTime()
      results.custom = `当前值: 开始=${formatTimeHM(startTime)}, 结束=${formatTimeHM(endTime)}`
    }
  }

  /**
   * 生命周期
   */
  onMounted(() => {
    currentTime.value = Date.now()
  })
</script>

<style scoped lang="scss">
  @use 'index.scss';
</style>
