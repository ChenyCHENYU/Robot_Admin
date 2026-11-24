/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:34:56
 * @FilePath: \Robot_Admin\src\views\demo\24-debounce-direct\codeExamples.ts
 * @Description: 防抖指令演示的可复制代码示例
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
