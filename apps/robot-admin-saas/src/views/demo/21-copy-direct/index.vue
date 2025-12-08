<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 16:30:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:26:20
 * @FilePath: \Robot_Admin\src\views\demo\21-copy-direct\index.vue
 * @Description: 复制指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="copy-demo-page">
    <NH1>v-copy 复制指令场景示例</NH1>

    <NGrid
      :cols="2"
      :x-gap="24"
      :y-gap="16"
    >
      <!-- 左侧演示区 -->
      <NGridItem>
        <NSpace
          vertical
          size="large"
        >
          <!-- 基础文本复制 -->
          <NCard
            title="基础文本复制"
            size="small"
          >
            <NSpace>
              <NButton
                v-copy="{
                  text: 'Hello World!',
                  messageInstance: message,
                  onSuccess: handleCopySuccess,
                }"
                type="primary"
              >
                <template #icon>
                  <div class="i-mdi:content-copy" />
                </template>
                复制文本
              </NButton>

              <NTag
                v-copy="{
                  text: '这是标签内容',
                  messageInstance: message,
                  onSuccess: handleCopySuccess,
                }"
                clickable
              >
                复制标签
              </NTag>
            </NSpace>
            <NDivider />
            <NText depth="3"
              >点击按钮或标签复制内容到剪贴板，会自动显示消息提示</NText
            >
          </NCard>

          <!-- 复制元素内容 -->
          <NCard
            title="复制元素内容"
            size="small"
          >
            <NAlert
              v-copy="{
                messageInstance: message,
                onSuccess: handleCopySuccess,
              }"
              type="info"
            >
              <template #icon>
                <div class="i-mdi:information" />
              </template>
              点击这个提示框复制整段内容：这是一段重要信息，可以通过点击复制。
            </NAlert>
            <NDivider />
            <NText depth="3">不传参数时，自动复制元素的文本内容</NText>
          </NCard>

          <!-- 动态内容复制 -->
          <NCard
            title="动态内容复制"
            size="small"
          >
            <NSpace vertical>
              <NInput
                v-model:value="inputText"
                placeholder="输入要复制的内容"
                clearable
              />
              <NButton
                v-copy="{
                  text: inputText,
                  messageInstance: message,
                  onSuccess: handleCopySuccess,
                }"
                :disabled="!inputText"
              >
                <template #icon>
                  <div class="i-mdi:content-copy" />
                </template>
                复制输入内容
              </NButton>
            </NSpace>
            <NDivider />
            <NText depth="3">复制响应式数据，内容会实时更新</NText>
          </NCard>

          <!-- 高级配置 -->
          <NCard
            title="高级配置"
            size="small"
          >
            <NSpace>
              <NButton
                v-copy="{
                  text: '自定义消息内容',
                  onSuccess: handleCopySuccess,
                  successMessage: '🎉 复制成功了！',
                  messageInstance: message,
                }"
                type="success"
              >
                <template #icon>
                  <div class="i-mdi:settings" />
                </template>
                自定义消息
              </NButton>

              <NButton
                v-copy="{
                  text: '静默复制内容',
                  successMessage: false,
                  onSuccess: handleSilentSuccess,
                }"
                quaternary
              >
                <template #icon>
                  <div class="i-mdi:volume-off" />
                </template>
                静默模式
              </NButton>
            </NSpace>
            <NDivider />
            <NText depth="3">支持自定义回调函数、消息提示和独立消息实例</NText>
          </NCard>
        </NSpace>
      </NGridItem>

      <!-- 右侧代码展示 -->
      <NGridItem>
        <NCard
          title="使用代码"
          size="small"
        >
          <NTabs
            v-model:value="activeTab"
            type="line"
            size="small"
          >
            <NTabPane
              name="basic"
              tab="基础用法"
            >
              <C_Code
                :code="basicCode"
                language="html"
              />
            </NTabPane>

            <NTabPane
              name="message"
              tab="消息提示"
            >
              <C_Code
                :code="messageCode"
                language="html"
              />
            </NTabPane>

            <NTabPane
              name="advanced"
              tab="高级配置"
            >
              <C_Code
                :code="advancedCode"
                language="html"
              />
            </NTabPane>
          </NTabs>
        </NCard>

        <!-- 统计信息 -->
        <NCard
          title="复制统计"
          size="small"
          class="mt-4"
        >
          <NSpace>
            <NTag type="info">
              <template #icon>
                <div class="i-mdi:counter" />
              </template>
              复制次数: {{ copyCount }}
            </NTag>
            <NTag
              type="success"
              v-if="lastCopyText"
            >
              <template #icon>
                <div class="i-mdi:check" />
              </template>
              最后复制: {{ lastCopyText.substring(0, 15) }}...
            </NTag>
          </NSpace>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import { getBasicCode, getMessageCode, getAdvancedCode } from './data'

  // 获取消息实例
  const message = useMessage()

  // 响应式数据
  const activeTab = ref('basic')
  const inputText = ref('这是动态文本内容')
  const copyCount = ref(0)
  const lastCopyText = ref('')

  // 回调函数
  const handleCopySuccess = (text: string) => {
    copyCount.value++
    lastCopyText.value = text
  }

  const handleSilentSuccess = (text: string) => {
    copyCount.value++
    lastCopyText.value = text
  }

  // 代码示例
  const basicCode = getBasicCode()
  const messageCode = getMessageCode()
  const advancedCode = getAdvancedCode()
</script>
