<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-28 11:26:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 22:30:00
 * @FilePath: \Robot_Admin\src\views\demo\31-steps\index.vue
 * @Description: 进度步骤条组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="steps-demo">
    <c_vTitle
      title="进度步骤条组件场景示例"
      icon="mdi:steering"
      description="支持多种布局方式、自定义图标、时间轴等特性，适用于订单跟踪、项目进度、审批流程等场景"
    />

    <div class="demo-grid">
      <!-- 基础用法 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>基础用法</h3>
            <NTag
              type="info"
              size="small"
              round
              >交互</NTag
            >
          </div>
          <p class="card-desc">最基础的步骤条，支持上一步、下一步操作</p>
        </template>
        <div class="card-content">
          <C_Steps
            :steps="basicSteps"
            :current="demo1.current"
          />
          <div class="action-bar">
            <C_ActionBar :actions="basicStepActions" />
          </div>
        </div>
      </NCard>

      <!-- 订单跟踪 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>订单跟踪</h3>
            <NTag
              type="success"
              size="small"
              round
              >时间轴</NTag
            >
          </div>
          <p class="card-desc">带时间信息的步骤条，适用于物流跟踪场景</p>
        </template>
        <C_Steps
          :steps="orderSteps"
          :current="2"
        />
      </NCard>

      <!-- 垂直布局 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>垂直布局</h3>
            <NTag
              type="warning"
              size="small"
              round
              >项目进度</NTag
            >
          </div>
          <p class="card-desc">垂直方向的步骤条，适用于空间受限的场景</p>
        </template>
        <C_Steps
          :steps="projectSteps"
          :current="2"
          direction="vertical"
        />
      </NCard>

      <!-- 审批流程 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>审批流程</h3>
            <NTag
              size="small"
              round
              >可点击</NTag
            >
          </div>
          <p class="card-desc">支持点击切换步骤，适用于需要手动跳转的场景</p>
        </template>
        <C_Steps
          :steps="approvalSteps"
          :current="3"
          direction="vertical"
          :clickable="true"
          @change="handleChange"
        />
      </NCard>

      <!-- 自定义图标 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>自定义图标</h3>
            <NTag
              type="info"
              size="small"
              round
              >图标</NTag
            >
          </div>
          <p class="card-desc">使用自定义图标增强视觉效果</p>
        </template>
        <C_Steps
          :steps="iconSteps"
          :current="2"
        />
      </NCard>

      <!-- 错误状态 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>错误状态</h3>
            <NTag
              type="error"
              size="small"
              round
              >异常</NTag
            >
          </div>
          <p class="card-desc">显示流程中的错误状态，适用于异常处理场景</p>
        </template>
        <C_Steps
          :steps="errorSteps"
          :current="2"
        />
      </NCard>

      <!-- 注册流程 - 全宽卡片 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>注册流程</h3>
            <NTag
              type="success"
              size="small"
              round
              >实际应用</NTag
            >
          </div>
          <p class="card-desc">完整的注册流程示例，展示步骤条的实际应用场景</p>
        </template>
        <C_Steps
          :steps="registerSteps"
          :current="demo2.current"
          :clickable="true"
          @update:current="demo2.current = $event"
        />

        <div class="step-detail">
          <h4>{{ registerSteps[demo2.current].title }}</h4>
          <p>{{ registerSteps[demo2.current].detail }}</p>
          <div class="action-bar">
            <C_ActionBar :actions="registerStepActions" />
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ActionItem } from '@robot-admin/naive-ui-components'
  import {
    basicSteps,
    orderSteps,
    projectSteps,
    approvalSteps,
    iconSteps,
    errorSteps,
    registerSteps,
  } from './data'

  const message = useMessage()

  // 基础步骤演示
  const demo1 = reactive({ current: 1 })

  // 注册流程演示
  const demo2 = reactive({ current: 0 })
  const loading = ref(false)

  // 基础步骤操作按钮
  const basicStepActions = computed((): ActionItem[] => [
    {
      label: '上一步',
      disabled: demo1.current <= 0,
      onClick: () => {
        demo1.current--
      },
    },
    {
      label: '下一步',
      type: 'primary',
      disabled: demo1.current >= 4,
      onClick: () => {
        demo1.current++
      },
    },
  ])

  // 注册流程操作按钮
  const registerStepActions = computed((): ActionItem[] => [
    {
      label: '上一步',
      disabled: demo2.current <= 0,
      onClick: () => {
        demo2.current--
      },
    },
    {
      label: demo2.current === registerSteps.length - 1 ? '完成' : '下一步',
      type: 'primary',
      loading: loading.value,
      onClick: handleNext,
    },
  ])

  // 审批流程步骤点击
  const handleChange = (n: number) => {
    message.info(`切换到第 ${n + 1} 步`)
  }

  // 处理下一步
  const handleNext = async () => {
    if (demo2.current >= registerSteps.length - 1) return

    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    demo2.current++
    loading.value = false

    if (demo2.current === registerSteps.length - 1) {
      message.success('注册完成！')
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
