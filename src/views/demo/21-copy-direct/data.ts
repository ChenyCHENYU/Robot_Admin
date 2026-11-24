/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 18:39:05
 * @FilePath: \Robot_Admin\src\views\demo\21-copy-direct\data.ts
 * @Description: 复制指令演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description 基础用法代码示例
 * ! @return 基础用法的代码字符串
 */
export function getBasicCode(): string {
  return `<!-- 基础文本复制 -->
<NButton v-copy="'Hello World!'">复制文本</NButton>

<!-- 复制元素内容 -->
<NAlert v-copy>点击复制这段文本</NAlert>

<!-- 复制响应式数据 -->
<NButton v-copy="inputText">复制输入内容</NButton>`
}

/**
 * * @description 消息提示代码示例
 * ! @return 消息提示的代码字符串
 */
export function getMessageCode(): string {
  const scriptStart = '<script setup>'
  const scriptEnd = '</' + 'script>'

  return `${scriptStart}
const message = useMessage()

// 统计回调
const handleCopySuccess = (text) => {
  copyCount.value++
  lastCopyText.value = text
}
${scriptEnd}

<!-- 使用 useMessage 显示提示 -->
<NButton v-copy="{
  text: 'Hello World!',
  messageInstance: message,
  onSuccess: handleCopySuccess
}">复制并提示</NButton>

<!-- 复制元素内容并提示 -->
<NAlert v-copy="{
  messageInstance: message,
  onSuccess: handleCopySuccess
}">点击复制这段文本</NAlert>`
}

/**
 * * @description 高级配置代码示例
 * ! @return 高级配置的代码字符串
 */
export function getAdvancedCode(): string {
  return `<!-- 自定义成功消息 -->
<NButton v-copy="{
  text: '内容',
  successMessage: '🎉 复制成功了！',
  messageInstance: message,
  onSuccess: handleCopySuccess
}">自定义消息</NButton>

<!-- 静默复制，不显示消息 -->
<NButton v-copy="{
  text: '内容',
  successMessage: false,
  onSuccess: handleCopySuccess
}">静默模式</NButton>`
}
