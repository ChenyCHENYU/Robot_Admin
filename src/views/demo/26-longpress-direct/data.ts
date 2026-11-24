/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 15:51:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:18:28
 * @FilePath: \Robot_Admin\src\views\demo\26-longpress-direct\data.ts
 * @Description: 长按指令演示页面数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { LongPressOptions } from '@robot-admin/directives/longpress'

/** 长按进度与数量示例共享页面的停用和卸载边界。 */
export function useLongPressDemo() {
  const state = reactive({
    activeTab: 'basic',
    basicCount: 0,
    defaultCount: 0,
    normalCount: 0,
    slowCount: 0,
    slowCancelCount: 0,
    progressValue: 0,
    enabled: true,
    duration: 800,
    dynamicCount: 0,
    deleteCount: 0,
    quantity: 1,
  })
  let progressTimer: ReturnType<typeof setTimeout> | undefined
  let repeatTimer: ReturnType<typeof setInterval> | undefined
  let triggered = false

  const increaseOnce = () => {
    if (state.quantity < 999) state.quantity++
  }
  const stopRepeating = () => {
    clearInterval(repeatTimer)
    repeatTimer = undefined
  }
  const quantityPress: LongPressOptions = {
    duration: DEMO_CONFIG.QUANTITY_DURATION,
    onStart: () => {
      triggered = false
    },
    onTrigger: () => {
      triggered = true
      increaseOnce()
      repeatTimer = setInterval(increaseOnce, 100)
    },
    onEnd: (event, didTrigger) => {
      stopRepeating()
      if (event.type === 'keyup' && !didTrigger) increaseOnce()
    },
  }
  const clickQuantity = () => {
    if (!triggered) increaseOnce()
    triggered = false
  }
  const updateProgress = (progress: number) => {
    state.progressValue = Math.round(progress * 100)
  }
  const completeProgress = () => {
    clearTimeout(progressTimer)
    state.progressValue = 100
    progressTimer = setTimeout(() => (state.progressValue = 0), 1000)
  }
  const clearTimers = () => {
    clearTimeout(progressTimer)
    stopRepeating()
    state.progressValue = 0
  }
  onDeactivated(clearTimers)
  onScopeDispose(clearTimers)
  return {
    state,
    updateProgress,
    completeProgress,
    quantityPress,
    clickQuantity,
  }
}

/**
 * * @description 代码示例常量，展示长按指令的各种用法
 */
export const CODE_EXAMPLES = {
  basic: `<!-- 基础长按 -->
<NButton v-longpress="{
  duration: 800,
  onTrigger: () => count++
}">
  长按按钮 (800ms)
</NButton>

<!-- 默认配置 -->
<NButton v-longpress="{
  duration: 800,
  onTrigger: () => defaultCount++
}">
  默认长按按钮
</NButton>

<!-- 普通按钮对比 -->
<NButton @click="normalCount++">
  普通按钮 (无长按)
</NButton>`,

  config: `<!-- 慢速长按配置 -->
<NButton v-longpress="{
  duration: 2000,
  onStart: () => console.log('开始'),
  onTrigger: () => slowCount++,
  onCancel: () => slowCancelCount++
}">
  慢速长按 (2000ms)
</NButton>

<!-- 进度跟踪长按 -->
<NButton v-longpress="{
  duration: 1500,
  onProgress: handleProgress,
  onTrigger: () => {
    progressValue = 100
    setTimeout(() => progressValue = 0, 1000)
  }
}">
  进度长按 (1500ms)
</NButton>`,

  scenarios: `<!-- 危险操作确认 -->
<NButton v-longpress="{
  duration: 2000,
  onTrigger: () => handleDelete()
}" type="error">
  长按删除 (2000ms)
</NButton>

<!-- 连续数量调节 -->
<NButton v-longpress="{
  duration: 300,
  onStart: startIncrease,
  onTrigger: continuousIncrease,
  onEnd: stopIncrease
}" @click="quantity++">
  + 数量调节
</NButton>

<!-- 动态配置 -->
<NButton v-longpress="{
  disabled: !enabled,
  duration: duration,
  onTrigger: () => dynamicCount++
}">
  动态配置按钮
</NButton>`,
} as const

/**
 * * @description 演示配置常量
 */
export const DEMO_CONFIG = {
  DEFAULT_DURATION: 800,
  SLOW_DURATION: 2000,
  PROGRESS_DURATION: 1500,
  DELETE_DURATION: 2000,
  QUANTITY_DURATION: 300,
  DURATION_MIN: 200,
  DURATION_MAX: 5000,
  DURATION_STEP: 100,
  MAX_QUANTITY: 999,
  INCREASE_INTERVAL: 100,
} as const
