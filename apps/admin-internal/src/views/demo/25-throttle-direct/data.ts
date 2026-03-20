/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:16:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:42:25
 * @FilePath: \Robot_Admin\src\views\demo\25-throttle-direct\data.ts
 * @Description: 节流指令演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description 脚本标签常量，避免字符串中的转义问题
 */
const SCRIPT_END_TAG = '<' + '/script>'

/**
 * * @description 代码示例常量，展示节流指令的各种用法
 */
export const CODE_EXAMPLES = {
  basic: `<!-- 指定延迟时间 -->
<NButton v-throttle="300" @click="handleClick">
  节流按钮 (300ms)
</NButton>

<!-- 使用默认配置 -->
<NButton v-throttle @click="handleClick">
  默认节流按钮
</NButton>

<!-- 普通按钮对比 -->
<NButton @click="handleClick">
  普通按钮 (无节流)
</NButton>`,

  config: `<!-- 自定义延迟时间和回调 -->
<NButton v-throttle="{
  delay: 1000,
  onExecute: handleExecute,
  onThrottle: handleThrottle
}" @click="handleClick">
  慢速节流 (1000ms)
</NButton>

<!-- 仅前缘执行 -->
<NButton v-throttle="{
  delay: 500,
  leading: true,
  trailing: false
}" @click="handleClick">
  仅前缘执行
</NButton>

<!-- 仅后缘执行 -->
<NButton v-throttle="{
  delay: 600,
  leading: false,
  trailing: true
}" @click="handleClick">
  仅后缘执行
</NButton>`,

  callback: `<script setup>
// 回调函数
const handleExecute = () => {
  console.log('节流执行')
}

const handleThrottle = () => {
  console.log('触发节流')
}
${SCRIPT_END_TAG}

<!-- 回调函数演示 -->
<NButton v-throttle="{
  delay: 500,
  onExecute: handleExecute,
  onThrottle: handleThrottle
}" @click="handleClick">
  回调演示按钮
</NButton>`,

  dynamic: `<script setup>
const throttleEnabled = ref(true)
const throttleDelay = ref(500)
const leadingMode = ref(true)
const trailingMode = ref(true)

const handleExecute = () => {
  console.log('节流执行')
}

const handleThrottle = () => {
  console.log('触发节流')
}
${SCRIPT_END_TAG}

<!-- 动态配置 -->
<template>
  <NSpace>
    <NSwitch v-model:value="throttleEnabled" />
    <NText>启用节流</NText>
    
    <NInputNumber v-model:value="throttleDelay" :min="100" :max="3000" />
    <NText>延迟时间(ms)</NText>

    <NSwitch v-model:value="leadingMode" />
    <NText>前缘执行</NText>

    <NSwitch v-model:value="trailingMode" />
    <NText>后缘执行</NText>
  </NSpace>
  
  <NButton v-throttle="{
    disabled: !throttleEnabled,
    delay: throttleDelay,
    leading: leadingMode,
    trailing: trailingMode,
    onExecute: handleExecute,
    onThrottle: handleThrottle
  }" @click="handleClick">
    动态配置节流
  </NButton>
</template>`,

  scenarios: `<!-- 1. 搜索优化 -->
<NButton 
  v-throttle="{
    delay: 500,
    onExecute: () => console.log('搜索执行')
  }"
  type="primary"
  @click="handleSearch"
  :loading="isSearching"
>
  搜索 (节流 500ms)
</NButton>

<!-- 2. 滚动加载 -->
<NButton 
  v-throttle="{
    delay: 800,
    leading: true,
    trailing: false
  }"
  @click="handleLoadMore"
  :loading="isLoading"
>
  加载更多 (前缘节流)
</NButton>

<!-- 3. 点赞操作 -->
<NButton 
  v-throttle="400"
  type="primary"
  @click="handleLike"
>
  点赞 ❤️ (节流 400ms)
</NButton>

<!-- 4. 分享功能 -->
<NButton 
  v-throttle="{
    delay: 600,
    leading: true,
    trailing: false,
    onExecute: handleShareExecute
  }"
  @click="handleShare"
>
  分享 📤 (前缘节流)
</NButton>`,
} as const

/**
 * * @description 创建演示页面的响应式数据状态
 * ! @return 包含所有演示状态的响应式对象
 */
export function createDemoState() {
  return {
    // UI 状态
    activeTab: ref('basic'),
    scenarioTab: ref('search'),

    // 基础演示计数
    basicClickCount: ref(0),
    defaultClickCount: ref(0),
    normalClickCount: ref(0),

    // 高级配置演示计数
    slowExecuteCount: ref(0),
    slowThrottleCount: ref(0),
    leadingClickCount: ref(0),
    trailingClickCount: ref(0),

    // 动态配置
    throttleEnabled: ref(true),
    throttleDelay: ref(500),
    leadingMode: ref(true),
    trailingMode: ref(true),
    dynamicExecuteCount: ref(0),
    dynamicThrottleCount: ref(0),

    // 搜索场景数据
    searchKeyword: ref(''),
    lastSearchKeyword: ref(''),
    searchCount: ref(0),
    isSearching: ref(false),
    searchResults: ref([
      {
        id: 1,
        title: 'Vue 3 节流指令使用指南',
        description: '深入了解 Vue 3 节流指令的使用方法和最佳实践',
      },
      {
        id: 2,
        title: 'JavaScript 节流与防抖详解',
        description: '详细对比节流和防抖的区别，及其在实际项目中的应用',
      },
      {
        id: 3,
        title: '前端性能优化之函数节流',
        description: '使用函数节流技术优化前端应用性能的实践方案',
      },
    ]),

    // 滚动加载场景数据
    scrollItems: ref(
      Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date().toLocaleTimeString(),
      }))
    ),
    loadCount: ref(0),
    isLoading: ref(false),

    // 高频操作场景计数
    likeCount: ref(0),
    shareCount: ref(0),
    downloadCount: ref(0),
  }
}

/**
 * * @description 创建演示页面的处理函数集合
 * ? @param state - 演示页面的状态对象
 * ! @return 包含所有处理函数的对象
 */
export function createDemoHandlers(state: ReturnType<typeof createDemoState>) {
  return {
    // 基础演示处理函数
    /**
     * * @description 处理基础节流按钮点击
     * ! @return void
     */
    handleBasicClick: () => state.basicClickCount.value++,

    /**
     * * @description 处理默认节流按钮点击
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
     * * @description 处理慢速节流按钮点击
     * ! @return void
     */
    handleSlowClick: () => {
      console.log('慢速节流点击')
    },

    /**
     * * @description 慢速节流执行回调
     * ! @return void
     */
    handleSlowExecute: () => {
      state.slowExecuteCount.value++
      console.log('慢速节流执行')
    },

    /**
     * * @description 慢速节流触发回调
     * ! @return void
     */
    handleSlowThrottle: () => {
      state.slowThrottleCount.value++
      console.log('慢速节流触发')
    },

    /**
     * * @description 处理前缘执行按钮点击
     * ! @return void
     */
    handleLeadingClick: () => {
      console.log('前缘执行点击')
    },

    /**
     * * @description 前缘执行回调
     * ! @return void
     */
    handleLeadingExecute: () => {
      state.leadingClickCount.value++
      console.log('前缘执行')
    },

    /**
     * * @description 处理后缘执行按钮点击
     * ! @return void
     */
    handleTrailingClick: () => {
      console.log('后缘执行点击')
    },

    /**
     * * @description 后缘执行回调
     * ! @return void
     */
    handleTrailingExecute: () => {
      state.trailingClickCount.value++
      console.log('后缘执行')
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
     * * @description 动态配置节流回调
     * ! @return void
     */
    handleDynamicThrottle: () => {
      state.dynamicThrottleCount.value++
      console.log('动态配置节流')
    },

    // 搜索场景处理函数
    /**
     * * @description 处理搜索按钮点击
     * ! @return void
     */
    handleSearch: () => {
      console.log('搜索点击')
    },

    /**
     * * @description 搜索执行回调
     * ! @return void
     */
    handleSearchExecute: () => {
      if (!state.searchKeyword.value.trim()) {
        return
      }

      state.searchCount.value++
      state.lastSearchKeyword.value = state.searchKeyword.value
      state.isSearching.value = true

      // 模拟搜索API调用
      setTimeout(() => {
        state.isSearching.value = false
        console.log('搜索执行:', state.searchKeyword.value)
      }, 800)
    },

    // 滚动加载场景处理函数
    /**
     * * @description 处理加载更多按钮点击
     * ! @return void
     */
    handleLoadMore: () => {
      console.log('加载更多点击')
    },

    /**
     * * @description 加载更多执行回调
     * ! @return void
     */
    handleLoadMoreExecute: () => {
      state.loadCount.value++
      state.isLoading.value = true

      // 模拟加载数据
      setTimeout(() => {
        const newItems = Array.from({ length: 3 }, (_, i) => ({
          id: state.scrollItems.value.length + i + 1,
          timestamp: new Date().toLocaleTimeString(),
        }))

        state.scrollItems.value.push(...newItems)
        state.isLoading.value = false
        console.log('加载更多执行，新增', newItems.length, '条数据')
      }, 1000)
    },

    // 高频操作场景处理函数
    /**
     * * @description 处理点赞按钮点击
     * ! @return void
     */
    handleLikeClick: () => {
      state.likeCount.value++
      console.log('点赞操作执行')
    },

    /**
     * * @description 处理分享按钮点击
     * ! @return void
     */
    handleShareClick: () => {
      state.shareCount.value++
      console.log('分享操作执行')
    },

    /**
     * * @description 处理下载按钮点击
     * ! @return void
     */
    handleDownloadClick: () => {
      state.downloadCount.value++
      console.log('下载操作执行')
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
 * * @description 演示配置常量，定义各种延迟时间和参数
 */
export const DEMO_CONFIG = {
  // 节流配置
  DEFAULT_DELAY: 300,
  SLOW_DELAY: 1000,
  LEADING_DELAY: 500,
  TRAILING_DELAY: 600,

  // 动态配置范围
  DELAY_MIN: 100,
  DELAY_MAX: 3000,
  DELAY_STEP: 100,

  // 应用场景延迟
  SEARCH_DELAY: 500,
  LOAD_DELAY: 800,
  LIKE_DELAY: 400,
  SHARE_DELAY: 600,
  DOWNLOAD_DELAY: 1000,
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
 * * @description 搜索结果模拟数据（用于搜索场景演示）
 */
export const searchResultsData = reactive([
  {
    id: 1,
    title: 'Vue 3 节流指令使用指南',
    description: '深入了解 Vue 3 节流指令的使用方法和最佳实践',
  },
  {
    id: 2,
    title: 'JavaScript 节流与防抖详解',
    description: '详细对比节流和防抖的区别，及其在实际项目中的应用',
  },
  {
    id: 3,
    title: '前端性能优化之函数节流',
    description: '使用函数节流技术优化前端应用性能的实践方案',
  },
  {
    id: 4,
    title: 'React 中的节流处理',
    description: '在 React 应用中实现函数节流的多种方案对比',
  },
  {
    id: 5,
    title: '移动端滚动优化实践',
    description: '使用节流技术优化移动端滚动事件的性能表现',
  },
  {
    id: 6,
    title: 'API 请求频率控制',
    description: '通过节流机制控制API请求频率，提升用户体验',
  },
])

/**
 * * @description 滚动加载数据生成器
 * ? @param startId - 起始ID
 * ? @param count - 生成数量
 * ! @return 生成的数据数组
 */
export function generateScrollData(startId: number, count: number = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    timestamp: new Date().toLocaleTimeString(),
    content: `这是第 ${startId + i} 条动态生成的数据`,
  }))
}
