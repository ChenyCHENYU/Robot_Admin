/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 15:51:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:18:28
 * @FilePath: \Robot_Admin\src\views\demo\26-longpress-direct\data.ts
 * @Description: 长按指令演示页面数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description 创建演示页面的响应式数据状态
 * ! @return 包含所有演示状态的响应式对象
 */
export function createDemoState() {
  return {
    // UI 状态
    activeTab: ref('basic'),

    // 基础演示状态
    basicCount: ref(0),
    defaultCount: ref(0),
    normalCount: ref(0),

    // 高级配置状态
    slowCount: ref(0),
    slowCancelCount: ref(0),
    progressValue: ref(0),

    // 动态配置状态
    enabled: ref(true),
    duration: ref(800),
    dynamicCount: ref(0),

    // 应用场景状态
    deleteCount: ref(0),
    quantity: ref(1),
    isIncreasing: ref(false),
  }
}

/**
 * * @description 创建演示页面的处理函数集合
 * ? @param state - 演示页面的状态对象
 * ! @return 包含所有处理函数的对象
 */
export function createDemoHandlers(state: ReturnType<typeof createDemoState>) {
  let increaseTimer: ReturnType<typeof setTimeout> | null = null

  return {
    /**
     * * @description 处理基础长按按钮点击
     * ! @return void
     */
    handleBasicClick: () => {
      console.log('基础按钮点击')
    },

    /**
     * * @description 处理默认长按按钮点击
     * ! @return void
     */
    handleDefaultClick: () => {
      console.log('默认按钮点击')
    },

    /**
     * * @description 处理进度长按进度回调
     * ? @param progress - 进度百分比 (0-1)
     * ? @param elapsed - 已用时间 (ms)
     * ! @return void
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleProgress: (progress: number, elapsed: number) => {
      state.progressValue.value = Math.round(progress * 100)
    },

    /**
     * * @description 进度条完成回调
     * ! @return void
     */
    handleProgressComplete: () => {
      state.progressValue.value = 100
      setTimeout(() => (state.progressValue.value = 0), 1000)
    },

    /**
     * * @description 开始连续增加操作
     * ! @return void
     */
    startIncrease: () => {
      state.isIncreasing.value = true
    },

    /**
     * * @description 执行连续增加操作
     * ! @return void
     */
    continuousIncrease: () => {
      if (state.isIncreasing.value) {
        const increase = () => {
          if (state.isIncreasing.value && state.quantity.value < 999) {
            state.quantity.value++
            increaseTimer = setTimeout(increase, 100)
          }
        }
        increase()
      }
    },

    /**
     * * @description 停止连续增加操作
     * ! @return void
     */
    stopIncrease: () => {
      state.isIncreasing.value = false
      if (increaseTimer) {
        clearTimeout(increaseTimer)
        increaseTimer = null
      }
    },
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
  onCancel: stopIncrease
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
