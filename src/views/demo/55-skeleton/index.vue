<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: C_Skeleton 骨架屏组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="skeleton-demo">
    <NH1 prefix="bar">骨架屏组件场景示例</NH1>
    <NP>C_Skeleton 提供 8 种预设骨架屏模式，适用于数据加载过渡场景。</NP>

    <!-- 控制面板 -->
    <NCard
      title="配置面板"
      :bordered="false"
      class="mb-4"
    >
      <NSpace
        align="center"
        :wrap="true"
      >
        <NSelect
          v-model:value="currentPreset"
          :options="presetSelectOptions"
          style="width: 140px"
          placeholder="预设模式"
        />
        <NSelect
          v-model:value="currentAnimation"
          :options="animationSelectOptions"
          style="width: 120px"
          placeholder="动画类型"
        />
        <NInputNumber
          v-model:value="repeatCount"
          :min="1"
          :max="10"
          style="width: 120px"
          placeholder="重复次数"
        />
        <NSwitch v-model:value="isLoading">
          <template #checked>加载中</template>
          <template #unchecked>已完成</template>
        </NSwitch>
      </NSpace>
    </NCard>

    <!-- 预设模式展示 -->
    <NGrid
      :cols="2"
      :x-gap="16"
      :y-gap="16"
    >
      <NGi
        v-for="preset in PRESET_OPTIONS"
        :key="preset.value"
      >
        <NCard :title="preset.label + '模式'">
          <C_Skeleton
            :preset="preset.value"
            :loading="isLoading"
            :animation="currentAnimation"
            :repeat="repeatCount"
            :table="{ rows: 4, cols: 3 }"
            :form="{ fields: 4, cols: 2 }"
            :list="{ items: 3 }"
          >
            <NP>实际内容已加载完成 ✅</NP>
          </C_Skeleton>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import { PRESET_OPTIONS, ANIMATION_OPTIONS } from './data'
  import type {
    SkeletonPreset,
    SkeletonAnimation,
  } from '@robot-admin/naive-ui-components'

  defineOptions({ name: 'demo-skeleton' })

  const isLoading = ref(true)
  const currentPreset = ref<SkeletonPreset>('text')
  const currentAnimation = ref<SkeletonAnimation>('wave')
  const repeatCount = ref(3)

  const presetSelectOptions = PRESET_OPTIONS.map(p => ({
    label: p.label,
    value: p.value,
  }))

  const animationSelectOptions = ANIMATION_OPTIONS.map(a => ({
    label: a.label,
    value: a.value,
  }))
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
