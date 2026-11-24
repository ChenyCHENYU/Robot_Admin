/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:16:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:42:25
 * @FilePath: \Robot_Admin\src\views\demo\25-throttle-direct\codeExamples.ts
 * @Description: 节流指令演示的可复制代码示例
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
