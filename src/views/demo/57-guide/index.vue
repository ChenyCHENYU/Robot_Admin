<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: C_Guide 用户引导组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="guide-demo">
    <!-- 1. 页面标题 -->
    <NH1
      id="guide-target-title"
      prefix="bar"
    >
      用户引导组件场景示例
    </NH1>
    <NP
      >C_Guide
      增强版支持步骤分组、键盘导航、步骤回调、主题自定义、完成持久化等特性。</NP
    >

    <!-- 2. 控制面板 -->
    <NCard
      id="guide-target-panel"
      title="配置面板"
      :bordered="false"
      class="mb-4"
    >
      <NSpace
        align="center"
        :wrap="true"
      >
        <NSwitch v-model:value="showProgress">
          <template #checked>显示进度</template>
          <template #unchecked>隐藏进度</template>
        </NSwitch>
        <NSwitch v-model:value="keyboard">
          <template #checked>键盘导航</template>
          <template #unchecked>禁用键盘</template>
        </NSwitch>
        <NSwitch v-model:value="persistence">
          <template #checked>持久化</template>
          <template #unchecked>不持久化</template>
        </NSwitch>
      </NSpace>
    </NCard>

    <!-- 3. 功能特性 -->
    <NCard
      id="guide-target-features"
      title="功能特性"
      :bordered="false"
      class="mb-4"
    >
      <NGrid
        :cols="3"
        :x-gap="12"
        :y-gap="12"
      >
        <NGi
          v-for="feat in FEATURE_LIST"
          :key="feat.title"
        >
          <NCard size="small">
            <NSpace align="center">
              <C_Icon
                :name="feat.icon"
                :size="20"
              />
              <div>
                <div class="font-bold text-sm">{{ feat.title }}</div>
                <div class="text-xs text-gray-500">{{ feat.desc }}</div>
              </div>
            </NSpace>
          </NCard>
        </NGi>
      </NGrid>
    </NCard>

    <!-- 4. 操作按钮 -->
    <NCard
      id="guide-target-action"
      title="操作"
      :bordered="false"
    >
      <NSpace>
        <NButton
          type="primary"
          @click="handleStartGuide"
        >
          启动引导
        </NButton>
        <NButton @click="handleForceGuide">强制启动（忽略持久化）</NButton>
        <NButton @click="handleReset">重置完成状态</NButton>
      </NSpace>
    </NCard>

    <!-- 隐藏的 C_Guide 组件（仅通过 expose 控制） -->
    <C_Guide
      ref="guideRef"
      :steps="demoSteps"
      :show-progress="showProgress"
      :keyboard="keyboard"
      :show-trigger="false"
      :persistence="persistenceConfig"
      @start="handleGuideStart"
      @complete="handleGuideComplete"
      @close="handleGuideClose"
    />
  </div>
</template>

<script setup lang="ts">
  import { demoSteps, FEATURE_LIST } from './data'

  defineOptions({ name: 'demo-guide' })

  const message = useMessage()
  const guideRef = ref<any>(null)
  const showProgress = ref(true)
  const keyboard = ref(true)
  const persistence = ref(false)

  const persistenceConfig = computed(() =>
    persistence.value
      ? { enabled: true, keyPrefix: 'demo_guide' }
      : { enabled: false }
  )

  /**
   * * @description: 启动引导（遵循持久化状态）
   */
  const handleStartGuide = () => {
    guideRef.value?.startGuide()
  }

  /**
   * * @description: 强制启动引导
   */
  const handleForceGuide = () => {
    guideRef.value?.startGuide(true)
  }

  /**
   * * @description: 重置完成状态
   */
  const handleReset = () => {
    guideRef.value?.resetCompleted()
    message.success('已重置引导完成状态')
  }

  const handleGuideStart = () => {
    message.info('引导开始')
  }

  const handleGuideComplete = () => {
    message.success('引导完成 🎉')
  }

  const handleGuideClose = (step: number) => {
    message.warning(`引导在第 ${step + 1} 步被关闭`)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
