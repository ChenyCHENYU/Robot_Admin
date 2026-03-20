/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:34:56
 * @FilePath: \Robot_Admin\src\views\demo\24-debounce-direct\data.ts
 * @Description: 防抖指令演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description 脚本标签常量，避免字符串中的转义问题
 */
const SCRIPT_END_TAG = '<' + '/script>'

/**
 * * @description 代码示例常量
 */
export const CODE_EXAMPLES = {
  basic: `<!-- 指定延迟时间 -->
<NButton v-debounce="300" @click="handleClick">
  防抖按钮 (300ms)
</NButton>

<!-- 使用默认配置 -->
<NButton v-debounce @click="handleClick">
  默认防抖按钮
</NButton>

<!-- 普通按钮对比 -->
<NButton @click="handleClick">
  普通按钮 (无防抖)
</NButton>`,

  config: `<!-- 自定义延迟时间 -->
<NButton v-debounce="{
  delay: 1000,
  onExecute: handleExecute
}" @click="handleClick">
  慢速防抖 (1000ms)
</NButton>

<!-- 立即执行模式 -->
<NButton v-debounce="{
  delay: 500,
  immediate: true
}" @click="handleClick">
  立即执行防抖
</NButton>

<!-- 回调函数演示 -->
<NButton v-debounce="{
  delay: 800,
  onExecute: handleExecute,
  onCancel: handleCancel
}" @click="handleClick">
  回调演示按钮
</NButton>`,

  callback: `<script setup>
// 回调函数
const handleExecute = () => {
  console.log('防抖执行')
}

const handleCancel = () => {
  console.log('防抖取消')
}
${SCRIPT_END_TAG}

<!-- 回调函数演示 -->
<NButton v-debounce="{
  delay: 500,
  onExecute: handleExecute,
  onCancel: handleCancel
}" @click="handleClick">
  回调演示按钮
</NButton>`,

  dynamic: `<script setup>
const debounceEnabled = ref(true)
const debounceDelay = ref(500)
const immediateMode = ref(false)

const handleExecute = () => {
  console.log('防抖执行')
}

const handleCancel = () => {
  console.log('防抖取消')
}
${SCRIPT_END_TAG}

<!-- 动态配置 -->
<template>
  <NSpace>
    <NSwitch v-model:value="debounceEnabled" />
    <NText>启用防抖</NText>
    
    <NInputNumber v-model:value="debounceDelay" :min="100" :max="3000" />
    <NText>延迟时间(ms)</NText>

    <NSwitch v-model:value="immediateMode" />
    <NText>立即执行</NText>
  </NSpace>
  
  <NButton v-debounce="{
    disabled: !debounceEnabled,
    delay: debounceDelay,
    immediate: immediateMode,
    onExecute: handleExecute,
    onCancel: handleCancel
  }" @click="handleClick">
    动态配置防抖
  </NButton>
</template>`,

  scenarios: `<!-- 1. 表单提交防重复 -->
<NButton 
  v-debounce="{
    delay: 1000,
    onExecute: () => console.log('提交执行')
  }"
  type="primary"
  @click="handleSubmit"
  :loading="isSubmitting"
>
  提交表单 (防重复提交)
</NButton>

<!-- 2. 删除操作防误触 -->
<NButton 
  v-debounce="800"
  type="error"
  @click="handleDelete"
>
  删除数据 (防误删)
</NButton>

<!-- 3. 保存操作防抖 -->
<NButton 
  v-debounce="{
    delay: 600,
    onExecute: () => message.success('保存成功')
  }"
  type="warning"
  @click="handleSave"
>
  保存数据 (防抖保存)
</NButton>

<!-- 4. API调用防抖 -->
<NButton 
  v-debounce="{
    delay: 1000,
    immediate: false,
    onExecute: handleApiExecute
  }"
  @click="handleApiCall"
>
  调用API (防重复请求)
</NButton>`,
} as const

/**
 * * @description 创建演示页面的响应式数据
 * ! @return 包含所有演示状态的响应式对象
 */
export function createDemoState() {
  return {
    // UI 状态
    activeTab: ref('basic'),
    scenarioTab: ref('submit'),

    // 基础演示计数
    basicClickCount: ref(0),
    defaultClickCount: ref(0),
    normalClickCount: ref(0),

    // 高级配置演示计数
    slowClickCount: ref(0),
    immediateClickCount: ref(0),
    callbackExecuteCount: ref(0),
    callbackCancelCount: ref(0),

    // 动态配置
    debounceEnabled: ref(true),
    debounceDelay: ref(500),
    immediateMode: ref(false),
    dynamicExecuteCount: ref(0),
    dynamicCancelCount: ref(0),

    // 表单场景数据
    formData: ref({
      username: '',
      email: '',
    }),
    formSubmitCount: ref(0),
    isSubmitting: ref(false),
    submitSuccess: ref(false),

    // 操作场景计数
    deleteCount: ref(0),
    saveCount: ref(0),
    refreshCount: ref(0),
  }
}

/**
 * * @description 创建演示页面的处理函数
 * ? @param state - 演示页面的状态对象
 * ! @return 包含所有处理函数的对象
 */
export function createDemoHandlers(state: ReturnType<typeof createDemoState>) {
  return {
    // 基础演示处理函数
    /**
     * * @description 处理基础防抖按钮点击
     * ! @return void
     */
    handleBasicClick: () => state.basicClickCount.value++,

    /**
     * * @description 处理默认防抖按钮点击
     * ! @return void
     */
    handleDefaultClick: () => state.defaultClickCount.value++,

    /**
     * * @description 处理普通按钮点击
     * ! @return void
     */
    handleNormalClick: () => state.normalClickCount.value++,

    // 高级配置处理函数
    /**
     * * @description 处理慢速防抖按钮点击
     * ! @return void
     */
    handleSlowClick: () => {
      state.slowClickCount.value++
    },

    /**
     * * @description 慢速防抖执行回调
     * ! @return void
     */
    handleSlowExecute: () => {
      console.log('慢速防抖执行')
    },

    /**
     * * @description 处理立即执行防抖按钮点击
     * ! @return void
     */
    handleImmediateClick: () => {
      state.immediateClickCount.value++
    },

    /**
     * * @description 立即执行防抖回调
     * ! @return void
     */
    handleImmediateExecute: () => {
      console.log('立即执行防抖')
    },

    /**
     * * @description 处理回调演示按钮点击
     * ! @return void
     */
    handleCallbackClick: () => {
      console.log('回调演示点击')
    },

    /**
     * * @description 执行回调函数
     * ! @return void
     */
    handleExecuteCallback: () => {
      state.callbackExecuteCount.value++
      console.log('执行回调')
    },

    /**
     * * @description 取消回调函数
     * ! @return void
     */
    handleCancelCallback: () => {
      state.callbackCancelCount.value++
      console.log('取消回调')
    },

    // 动态配置处理函数
    /**
     * * @description 处理动态配置按钮点击
     * ! @return void
     */
    handleDynamicClick: () => {
      console.log('动态配置点击')
    },

    /**
     * * @description 动态配置执行回调
     * ! @return void
     */
    handleDynamicExecute: () => {
      state.dynamicExecuteCount.value++
      console.log('动态配置执行')
    },

    /**
     * * @description 动态配置取消回调
     * ! @return void
     */
    handleDynamicCancel: () => {
      state.dynamicCancelCount.value++
      console.log('动态配置取消')
    },

    // 表单场景处理函数
    /**
     * * @description 处理表单提交按钮点击
     * ! @return void
     */
    handleFormSubmit: () => {
      console.log('表单提交点击')
    },

    /**
     * * @description 表单提交执行回调
     * ! @return void
     */
    handleFormSubmitExecute: () => {
      state.formSubmitCount.value++
      state.isSubmitting.value = true
      state.submitSuccess.value = false

      // 模拟提交
      setTimeout(() => {
        state.isSubmitting.value = false
        state.submitSuccess.value = true
        setTimeout(() => {
          state.submitSuccess.value = false
        }, 2000)
      }, 1000)

      console.log('表单提交执行:', state.formData.value)
    },

    /**
     * * @description 处理表单重置
     * ! @return void
     */
    handleFormReset: () => {
      state.formData.value = { username: '', email: '' }
      state.submitSuccess.value = false
      state.isSubmitting.value = false
    },

    // 操作场景处理函数
    /**
     * * @description 处理删除操作点击
     * ! @return void
     */
    handleDeleteClick: () => {
      state.deleteCount.value++
      console.log('删除操作执行')
    },

    /**
     * * @description 处理保存操作点击
     * ! @return void
     */
    handleSaveClick: () => {
      state.saveCount.value++
      console.log('保存操作执行')
    },

    /**
     * * @description 处理刷新操作点击
     * ! @return void
     */
    handleRefreshClick: () => {
      state.refreshCount.value++
      console.log('刷新操作执行')
    },
  }
}

/**
 * * @description Tab 标题映射常量
 */
export const TAB_TITLES = {
  basic: '基础用法',
  config: '配置选项',
  callback: '回调函数',
  dynamic: '动态配置',
  scenarios: '实际应用场景',
} as const

/**
 * * @description 演示配置常量
 */
export const DEMO_CONFIG = {
  // 防抖配置
  DEFAULT_DELAY: 300,
  SLOW_DELAY: 1000,
  IMMEDIATE_DELAY: 500,
  CALLBACK_DELAY: 800,

  // 动态配置范围
  DELAY_MIN: 100,
  DELAY_MAX: 3000,
  DELAY_STEP: 100,

  // 表单提交模拟延迟
  SUBMIT_DELAY: 1000,
  SUCCESS_DISPLAY_DURATION: 2000,
} as const

/**
 * * @description 兼容性导出（保留原有函数名以兼容其他地方的使用）
 * ! @return 代码示例字符串
 */
export const getBasicCode = () => CODE_EXAMPLES.basic
export const getStyleCode = () => CODE_EXAMPLES.config
export const getAdvancedCode = () => CODE_EXAMPLES.dynamic
export const getScenarioCode = () => CODE_EXAMPLES.scenarios

/**
 * * @description 搜索结果模拟数据（保留原有数据）
 */
export const searchResultsData = reactive([
  {
    id: 1,
    title: 'Vue 3 组件开发指南',
    description: '深入学习 Vue 3 Composition API 和组件开发最佳实践',
  },
  {
    id: 2,
    title: 'TypeScript 高级技巧',
    description: '掌握 TypeScript 的高级类型系统和泛型编程',
  },
  {
    id: 3,
    title: 'JavaScript 性能优化',
    description: '前端性能优化策略和最佳实践指南',
  },
  {
    id: 4,
    title: 'React Hooks 深入理解',
    description: '全面掌握 React Hooks 的使用场景和原理',
  },
  {
    id: 5,
    title: 'CSS Grid 布局完整指南',
    description: '现代 CSS 网格布局系统的完整学习教程',
  },
  {
    id: 6,
    title: 'Node.js 微服务架构',
    description: '使用 Node.js 构建可扩展的微服务系统',
  },
  {
    id: 7,
    title: 'webpack 配置优化',
    description: '深入理解 webpack 配置和构建优化技巧',
  },
  {
    id: 8,
    title: 'Git 工作流最佳实践',
    description: '团队协作中的 Git 分支管理和工作流程',
  },
])
