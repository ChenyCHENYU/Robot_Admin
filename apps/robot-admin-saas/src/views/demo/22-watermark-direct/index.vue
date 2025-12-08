<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 18:47:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 19:23:48
 * @FilePath: \Robot_Admin\src\views\demo\22-watermark-direct\index.vue
 * @Description: 水印指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="watermark-demo-page">
    <NH1>v-watermark 水印指令场景示例</NH1>

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
          <!-- 基础水印演示 -->
          <NCard
            title="基础水印演示"
            size="small"
          >
            <NSpace vertical>
              <div
                v-watermark="'版权所有'"
                class="demo-box"
              >
                <h4>基础文本水印</h4>
                <p
                  >这是一个带有基础文本水印的区域，水印会自动重复显示在背景中。</p
                >
              </div>

              <div
                v-watermark
                class="demo-box"
              >
                <h4>默认水印</h4>
                <p>使用默认的 "Robot Admin" 文本作为水印。</p>
              </div>
            </NSpace>
            <NDivider />
            <NText depth="3">最简单的使用方式，支持字符串和默认配置</NText>
          </NCard>

          <!-- 样式自定义演示 -->
          <NCard
            title="样式自定义演示"
            size="small"
          >
            <NSpace vertical>
              <div
                v-watermark="{
                  text: '机密文档',
                  textColor: 'rgba(255, 0, 0, 0.3)',
                  fontSize: 20,
                  font: 'Arial',
                }"
                class="demo-box"
              >
                <h4>自定义样式</h4>
                <p>红色、Arial字体、20px大小的水印效果。</p>
                <NAlert type="warning">
                  <template #icon>
                    <div class="i-mdi:alert" />
                  </template>
                  重要提醒内容
                </NAlert>
              </div>

              <div
                v-watermark="{
                  text: 'CONFIDENTIAL',
                  textColor: 'rgba(0, 123, 255, 0.25)',
                  fontSize: 16,
                  textXGap: 180,
                  textYGap: 90,
                  rotate: -45,
                }"
                class="demo-box"
              >
                <h4>间距和角度调整</h4>
                <p>调整水印间距为180x90，旋转角度-45度。</p>
              </div>
            </NSpace>
            <NDivider />
            <NText depth="3"
              >支持字体、颜色、大小、间距、角度等样式自定义</NText
            >
          </NCard>

          <!-- 动态内容演示 -->
          <NCard
            title="动态内容演示"
            size="small"
          >
            <NSpace vertical>
              <NSpace>
                <NInput
                  v-model:value="watermarkText"
                  placeholder="输入水印文本"
                  style="width: 200px"
                />
                <NColorPicker
                  v-model:value="watermarkColor"
                  :show-alpha="true"
                  class="mr-140px"
                />
                <NInputNumber
                  v-model:value="watermarkSize"
                  :min="12"
                  :max="36"
                  placeholder="字体大小"
                />
              </NSpace>

              <div
                v-watermark="{
                  text: watermarkText,
                  textColor: watermarkColor,
                  fontSize: watermarkSize,
                  onUpdate: handleWatermarkUpdate,
                  onError: handleWatermarkError,
                }"
                class="demo-box"
              >
                <h4>实时动态水印</h4>
                <p>水印内容会根据上方输入实时更新，包括文本、颜色和大小。</p>
                <NSpace>
                  <NTag>动态文本: {{ watermarkText }}</NTag>
                  <NTag type="info">更新次数: {{ updateCount }}</NTag>
                </NSpace>
              </div>
            </NSpace>
            <NDivider />
            <NText depth="3">支持响应式数据和回调函数</NText>
          </NCard>

          <!-- 应用场景演示 -->
          <NCard
            title="应用场景演示"
            size="small"
          >
            <NTabs
              v-model:value="scenarioTab"
              type="line"
              size="small"
            >
              <NTabPane
                name="document"
                tab="文档场景"
              >
                <div
                  v-watermark="{
                    text: '草稿',
                    textColor: 'rgba(255, 165, 0, 0.3)',
                    fontSize: 18,
                    textXGap: 200,
                    textYGap: 100,
                  }"
                  class="demo-box document-style"
                >
                  <h4>📄 重要文档</h4>
                  <p><strong>文档标题:</strong> 年度工作总结报告</p>
                  <p><strong>创建时间:</strong> {{ currentDate }}</p>
                  <p><strong>状态:</strong> 草稿阶段</p>
                  <p
                    >这是一份重要的工作文档，包含敏感信息。文档上的水印表明这是草稿版本，未经授权不得传播。</p
                  >
                  <NSpace>
                    <NButton size="small">编辑</NButton>
                    <NButton
                      size="small"
                      type="primary"
                      >保存</NButton
                    >
                  </NSpace>
                </div>
              </NTabPane>

              <NTabPane
                name="image"
                tab="图片预览"
              >
                <div
                  v-watermark="{
                    text: '仅供预览',
                    fontSize: 24,
                    rotate: 45,
                    textXGap: 220,
                    textYGap: 120,
                  }"
                  class="demo-box image-style"
                >
                  <h4>🖼️ 图片预览</h4>
                  <div class="image-container">
                    <div class="placeholder-image">
                      <div class="i-mdi:image-outline text-6xl text-gray-400" />
                      <p class="text-gray-500">预览图片区域</p>
                    </div>
                  </div>
                  <NSpace class="mt-4">
                    <NButton size="small">下载原图</NButton>
                    <NButton
                      size="small"
                      type="primary"
                      >购买授权</NButton
                    >
                  </NSpace>
                </div>
              </NTabPane>

              <NTabPane
                name="data"
                tab="数据表格"
              >
                <div
                  v-watermark="{
                    text: '内部数据',
                    textColor: 'rgba(220, 20, 60, 0.25)',
                    fontSize: 14,
                    textXGap: 200,
                    textYGap: 100,
                  }"
                  class="demo-box"
                >
                  <h4>📊 数据报表</h4>
                  <NDataTable
                    :data="tableData"
                    :columns="tableColumns"
                    size="small"
                    :pagination="false"
                  />
                  <NSpace class="mt-4">
                    <NButton size="small">导出Excel</NButton>
                    <NButton
                      size="small"
                      type="primary"
                      >生成报告</NButton
                    >
                  </NSpace>
                </div>
              </NTabPane>
            </NTabs>
            <NDivider />
            <NText depth="3">不同业务场景下的水印应用示例</NText>
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
              name="style"
              tab="样式配置"
            >
              <C_Code
                :code="styleCode"
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

            <NTabPane
              name="scenarios"
              tab="应用场景"
            >
              <C_Code
                :code="scenarioCode"
                language="html"
              />
            </NTabPane>
          </NTabs>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import {
    getBasicCode,
    getStyleCode,
    getAdvancedCode,
    getScenarioCode,
    tableData,
    tableColumns,
  } from './data'

  // 响应式数据
  const activeTab = ref('basic')
  const scenarioTab = ref('document')
  const watermarkText = ref('动态水印')
  const watermarkColor = ref('rgba(180, 180, 180, 0.4)')
  const watermarkSize = ref(16)
  const updateCount = ref(0)
  const errorCount = ref(0)

  // 计算属性
  const currentDate = computed(() => {
    return new Date().toLocaleDateString('zh-CN')
  })

  // 回调函数
  const handleWatermarkUpdate = (el: HTMLElement) => {
    updateCount.value++
    console.log('水印更新:', el)
  }

  const handleWatermarkError = (error: Error) => {
    errorCount.value++
    console.error('水印错误:', error)
  }

  // 代码示例
  const basicCode = getBasicCode()
  const styleCode = getStyleCode()
  const advancedCode = getAdvancedCode()
  const scenarioCode = getScenarioCode()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
