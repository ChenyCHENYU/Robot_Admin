<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 15:51:08
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:32:37
 * @FilePath: \Robot_Admin\src\views\demo\26-longpress-direct\index.vue
 * @Description: 长按指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="longpress-demo-page">
    <c_vTitle
      title="v-longpress 长按指令场景示例"
      icon="mdi:gesture-tap-hold"
      description="通过 v-longpress 指令识别长按手势，支持自定义触发时长和回调"
    />

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
          <!-- 基础演示 -->
          <NCard
            title="基础演示"
            size="small"
          >
            <NSpace vertical>
              <div class="demo-row">
                <NButton
                  v-longpress="{
                    duration: DEMO_CONFIG.DEFAULT_DURATION,
                    onTrigger: () => state.basicCount.value++,
                  }"
                  type="primary"
                  @click="handlers.handleBasicClick"
                >
                  长按按钮 (800ms)
                </NButton>
                <NText>长按触发次数: {{ state.basicCount.value }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-longpress="{
                    duration: DEMO_CONFIG.DEFAULT_DURATION,
                    onTrigger: () => state.defaultCount.value++,
                  }"
                  @click="handlers.handleDefaultClick"
                >
                  默认长按按钮
                </NButton>
                <NText>长按触发次数: {{ state.defaultCount.value }}</NText>
              </div>

              <div class="demo-row">
                <NButton @click="state.normalCount.value++">
                  普通按钮 (无长按)
                </NButton>
                <NText>点击次数: {{ state.normalCount.value }}</NText>
              </div>
            </NSpace>
          </NCard>

          <!-- 高级配置 -->
          <NCard
            title="高级配置"
            size="small"
          >
            <NSpace vertical>
              <div class="demo-row">
                <NButton
                  v-longpress="{
                    duration: DEMO_CONFIG.SLOW_DURATION,
                    onStart: () => console.log('慢速长按开始'),
                    onTrigger: () => state.slowCount.value++,
                    onCancel: () => state.slowCancelCount.value++,
                  }"
                  type="info"
                >
                  慢速长按 (2000ms)
                </NButton>
                <NSpace>
                  <NText>触发: {{ state.slowCount.value }}</NText>
                  <NText>取消: {{ state.slowCancelCount.value }}</NText>
                </NSpace>
              </div>

              <div class="demo-row progress-demo">
                <NButton
                  v-longpress="{
                    duration: DEMO_CONFIG.PROGRESS_DURATION,
                    onProgress: handlers.handleProgress,
                    onTrigger: handlers.handleProgressComplete,
                  }"
                  type="error"
                  class="progress-button"
                  :style="{ '--progress': state.progressValue.value + '%' }"
                >
                  进度长按 (1500ms)
                </NButton>
                <NProgress
                  :percentage="state.progressValue.value"
                  :show-indicator="false"
                  style="width: 200px"
                />
              </div>
            </NSpace>
          </NCard>

          <!-- 动态配置 -->
          <NCard
            title="动态配置"
            size="small"
          >
            <NSpace vertical>
              <NSpace>
                <NSwitch v-model:value="state.enabled.value" />
                <NText>启用长按</NText>
                <NInputNumber
                  v-model:value="state.duration.value"
                  :min="DEMO_CONFIG.DURATION_MIN"
                  :max="DEMO_CONFIG.DURATION_MAX"
                  :step="DEMO_CONFIG.DURATION_STEP"
                  style="width: 120px"
                  class="mt--8px"
                />
                <NText>ms</NText>
              </NSpace>

              <div class="demo-row">
                <NButton
                  v-longpress="{
                    disabled: !state.enabled.value,
                    duration: state.duration.value,
                    onTrigger: () => state.dynamicCount.value++,
                  }"
                  type="primary"
                >
                  动态配置按钮
                </NButton>
                <NText>触发次数: {{ state.dynamicCount.value }}</NText>
              </div>

              <NSpace>
                <NTag>状态: {{ state.enabled.value ? '启用' : '禁用' }}</NTag>
                <NTag type="info">持续时间: {{ state.duration.value }}ms</NTag>
              </NSpace>
            </NSpace>
          </NCard>

          <!-- 实际应用 -->
          <NCard
            title="实际应用"
            size="small"
          >
            <NSpace vertical>
              <div class="demo-row">
                <NButton
                  v-longpress="{
                    duration: DEMO_CONFIG.DELETE_DURATION,
                    onTrigger: () => state.deleteCount.value++,
                  }"
                  type="error"
                >
                  长按删除 (2000ms)
                </NButton>
                <NText>删除次数: {{ state.deleteCount.value }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-longpress="{
                    duration: DEMO_CONFIG.QUANTITY_DURATION,
                    onStart: handlers.startIncrease,
                    onTrigger: handlers.continuousIncrease,
                    onCancel: handlers.stopIncrease,
                  }"
                  @click="state.quantity.value++"
                >
                  + 数量调节
                </NButton>
                <NText>数量: {{ state.quantity.value }}</NText>
              </div>
            </NSpace>
          </NCard>
        </NSpace>
      </NGridItem>

      <!-- 右侧代码展示 -->
      <NGridItem>
        <NCard
          title="使用示例"
          size="small"
        >
          <NTabs
            v-model:value="state.activeTab.value"
            type="line"
            size="small"
          >
            <NTabPane
              name="basic"
              tab="基础用法"
            >
              <C_Code
                :code="CODE_EXAMPLES.basic"
                language="html"
              />
            </NTabPane>
            <NTabPane
              name="config"
              tab="配置选项"
            >
              <C_Code
                :code="CODE_EXAMPLES.config"
                language="html"
              />
            </NTabPane>
            <NTabPane
              name="scenarios"
              tab="应用场景"
            >
              <C_Code
                :code="CODE_EXAMPLES.scenarios"
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
    createDemoState,
    createDemoHandlers,
    CODE_EXAMPLES,
    DEMO_CONFIG,
  } from './data'

  // 创建状态和处理函数
  const state = createDemoState()
  const handlers = createDemoHandlers(state)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
