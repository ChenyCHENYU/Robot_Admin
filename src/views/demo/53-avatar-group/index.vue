<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\53-avatar-group\index.vue
 * @Description: 头像组组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="avatar-group-demo">
    <NH1>头像组组件场景示例</NH1>

    <!-- ==================== 功能特性 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:puzzle-outline"
          class="title-icon"
        />
        功能特性
      </h2>
      <div class="feature-grid">
        <div
          v-for="feat in FEATURE_LIST"
          :key="feat.title"
          class="feature-card"
        >
          <div class="feature-card__icon">
            <C_Icon :name="feat.icon" />
          </div>
          <div class="feature-card__body">
            <span class="feature-card__title">{{ feat.title }}</span>
            <span class="feature-card__desc">{{ feat.desc }}</span>
          </div>
          <NTag
            :bordered="false"
            size="small"
            :type="(TAG_TYPE_MAP[feat.tag] as any) ?? 'default'"
          >
            {{ feat.tag }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- ==================== 场景演示 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:television-play"
          class="title-icon"
        />
        在线演示
      </h2>
      <p class="section-desc">选择不同场景，体验头像组在协作场景下的表现。</p>

      <!-- 场景切换 -->
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

      <!-- 控制面板 -->
      <div class="control-bar">
        <div class="control-group">
          <span class="label">尺寸</span>
          <NSlider
            v-model:value="avatarSize"
            :min="28"
            :max="64"
            :step="4"
            style="width: 120px"
          />
          <span class="label">{{ avatarSize }}px</span>
        </div>
        <div class="control-group">
          <span class="label">最大数量</span>
          <NInputNumber
            v-model:value="maxCount"
            :min="1"
            :max="15"
            size="small"
            style="width: 80px"
          />
        </div>
        <div class="control-group">
          <span class="label">形状</span>
          <NRadioGroup
            v-model:value="shape"
            size="small"
          >
            <NRadioButton value="circle">圆形</NRadioButton>
            <NRadioButton value="square">方形</NRadioButton>
          </NRadioGroup>
        </div>
        <div class="control-group">
          <span class="label">状态点</span>
          <NSwitch v-model:value="showStatus" />
        </div>
        <div class="control-group">
          <span class="label">可点击</span>
          <NSwitch v-model:value="clickable" />
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="avatar-preview">
        <C_AvatarGroup
          :items="currentItems"
          :max="maxCount"
          :size="avatarSize"
          :shape="shape"
          :show-status="showStatus"
          :clickable="clickable"
          @item-click="handleItemClick"
          @overflow-click="handleOverflowClick"
        />
      </div>

      <!-- 点击日志 -->
      <div
        v-if="clickLogs.length"
        class="click-log"
      >
        <div class="click-log__title">交互日志</div>
        <div
          v-for="(log, idx) in clickLogs"
          :key="idx"
          class="click-log__item"
        >
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { AvatarItem } from '@/components/global/C_AvatarGroup/types'
  import {
    CONTRIBUTORS,
    DEMO_SCENES,
    FEATURE_LIST,
    TAG_TYPE_MAP,
    TASK_ASSIGNEES,
    TEAM_MEMBERS,
  } from './data'
  import './index.scss'

  // ==================== 场景切换 ====================

  const activeScene = ref<'team' | 'task' | 'contributor'>('team')

  const sceneDataMap = {
    team: TEAM_MEMBERS,
    task: TASK_ASSIGNEES,
    contributor: CONTRIBUTORS,
  }

  const currentItems = computed(() => sceneDataMap[activeScene.value])

  // ==================== 控制 ====================

  const avatarSize = ref(42)
  const maxCount = ref(5)
  const shape = ref<'circle' | 'square'>('circle')
  const showStatus = ref(true)
  const clickable = ref(true)

  // ==================== 交互日志 ====================

  const clickLogs = ref<string[]>([])

  /** 头像点击事件处理 */
  function handleItemClick(item: AvatarItem) {
    clickLogs.value.unshift(
      `[头像] 点击了 "${item.name}" (${item.status ?? '无状态'})`
    )
    if (clickLogs.value.length > 10) clickLogs.value.length = 10
  }

  /** 溢出头像点击事件处理 */
  function handleOverflowClick(items: AvatarItem[]) {
    const names = items.map(i => i.name).join(', ')
    clickLogs.value.unshift(`[溢出] 还有 ${items.length} 人: ${names}`)
    if (clickLogs.value.length > 10) clickLogs.value.length = 10
  }
</script>
