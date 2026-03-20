<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\50-timeline\index.vue
 * @Description: 时间线组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="timeline-demo">
    <c_vTitle
      title="时间线组件场景示例"
      icon="mdi:timeline-clock-outline"
      description="支持垂直/水平布局、节点样式自定义、展开折叠等特性，适用于项目进度、审批流程、物流追踪等场景"
    />

    <!-- ==================== 场景切换 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:television-play"
          class="title-icon"
        />
        在线演示
      </h2>
      <p class="section-desc">
        选择不同场景，体验时间线组件在各类业务场景中的表现。
      </p>

      <div class="scene-switcher">
        <div
          v-for="scene in DEMO_SCENES"
          :key="scene.key"
          class="scene-card"
          :class="{ 'is-active': activeScene === scene.key }"
          @click="activeScene = scene.key"
        >
          <C_Icon
            :name="scene.icon"
            class="scene-card__icon"
          />
          <span class="scene-card__title">{{ scene.title }}</span>
          <span class="scene-card__desc">{{ scene.description }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== 控制面板 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:tune-variant"
          class="title-icon"
        />
        交互控制
      </h2>
      <div class="control-panel">
        <NSpace
          align="center"
          :wrap="true"
        >
          <NButton
            size="small"
            @click="tlRef?.expandAll()"
          >
            展开全部
          </NButton>
          <NButton
            size="small"
            @click="tlRef?.collapseAll()"
          >
            折叠全部
          </NButton>
          <NDivider vertical />
          <NSwitch
            v-model:value="showPending"
            size="small"
          >
            <template #checked>Pending</template>
            <template #unchecked>Pending</template>
          </NSwitch>
          <NSwitch
            v-model:value="reversed"
            size="small"
          >
            <template #checked>反转</template>
            <template #unchecked>反转</template>
          </NSwitch>
          <NSwitch
            v-model:value="showTime"
            size="small"
          >
            <template #checked>时间</template>
            <template #unchecked>时间</template>
          </NSwitch>
          <NDivider vertical />
          <NRadioGroup
            v-model:value="lineType"
            size="small"
          >
            <NRadioButton value="solid"> 实线 </NRadioButton>
            <NRadioButton value="dashed"> 虚线 </NRadioButton>
            <NRadioButton value="dotted"> 点线 </NRadioButton>
          </NRadioGroup>
          <NDivider vertical />
          <NRadioGroup
            v-model:value="nodeSize"
            size="small"
          >
            <NRadioButton value="small"> S </NRadioButton>
            <NRadioButton value="medium"> M </NRadioButton>
            <NRadioButton value="large"> L </NRadioButton>
          </NRadioGroup>
        </NSpace>
      </div>
    </div>

    <!-- ==================== 时间线实例 ==================== -->
    <div class="demo-section demo-section--timeline">
      <!-- 项目发布 -->
      <C_Timeline
        v-if="activeScene === 'project'"
        ref="tlRef"
        :items="PROJECT_TIMELINE"
        :pending="showPending"
        :reverse="reversed"
        :show-time="showTime"
        :line-type="lineType"
        :size="nodeSize"
      />

      <!-- CI 流水线（水平） -->
      <C_Timeline
        v-else-if="activeScene === 'pipeline'"
        ref="tlRef"
        :items="CI_PIPELINE_TIMELINE"
        mode="horizontal"
        :reverse="reversed"
        :show-time="showTime"
        :line-type="lineType"
        :size="nodeSize"
        :pending="showPending"
      />

      <!-- 物流 -->
      <C_Timeline
        v-else
        ref="tlRef"
        :items="ORDER_TIMELINE"
        :pending="showPending"
        :reverse="reversed"
        :show-time="showTime"
        :line-type="lineType"
        :size="nodeSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    PROJECT_TIMELINE,
    CI_PIPELINE_TIMELINE,
    ORDER_TIMELINE,
    DEMO_SCENES,
  } from './data'
  import './index.scss'

  // ===== 状态 =====
  const tlRef = ref()
  const activeScene = ref('project')
  const showPending = ref(false)
  const reversed = ref(false)
  const showTime = ref(true)
  const lineType = ref<'solid' | 'dashed' | 'dotted'>('solid')
  const nodeSize = ref<'small' | 'medium' | 'large'>('medium')
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
