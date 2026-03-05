<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\52-transfer\index.vue
 * @Description: 穿梭框组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="transfer-demo">
    <NH1>穿梭框组件场景示例</NH1>

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
      <p class="section-desc">选择不同场景，体验穿梭框在各类业务中的表现。</p>

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
          <NRadioGroup
            v-model:value="size"
            size="small"
          >
            <NRadioButton value="small">S</NRadioButton>
            <NRadioButton value="medium">M</NRadioButton>
            <NRadioButton value="large">L</NRadioButton>
          </NRadioGroup>
        </div>
        <div class="control-group">
          <span class="label">搜索</span>
          <NSwitch v-model:value="filterable" />
        </div>
        <div class="control-group">
          <span class="label">全选</span>
          <NSwitch v-model:value="showSelectAll" />
        </div>
      </div>

      <!-- Transfer 实例 -->
      <div class="transfer-wrapper">
        <C_Transfer
          v-model="currentSelected"
          :data="currentData"
          :filterable="filterable"
          :show-select-all="showSelectAll"
          :size="size"
          :titles="currentTitles"
          @change="handleChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import {
    DEMO_SCENES,
    FEATURE_LIST,
    MEMBER_DATA,
    MEMBER_DEFAULT,
    MIGRATION_DATA,
    MIGRATION_DEFAULT,
    PERMISSION_DATA,
    PERMISSION_DEFAULT,
    TAG_TYPE_MAP,
  } from './data'
  import './index.scss'

  // ==================== 场景切换 ====================

  const activeScene = ref<'permission' | 'migration' | 'member'>('permission')

  const sceneMap = {
    permission: {
      data: PERMISSION_DATA,
      defaults: [...PERMISSION_DEFAULT],
      titles: ['可分配权限', '已有权限'] as [string, string],
    },
    migration: {
      data: MIGRATION_DATA,
      defaults: [...MIGRATION_DEFAULT],
      titles: ['数据源表', '待迁移表'] as [string, string],
    },
    member: {
      data: MEMBER_DATA,
      defaults: [...MEMBER_DEFAULT],
      titles: ['团队成员', '已分配成员'] as [string, string],
    },
  }

  const selectedMap = ref<Record<string, Array<string | number>>>({
    permission: [...PERMISSION_DEFAULT],
    migration: [...MIGRATION_DEFAULT],
    member: [...MEMBER_DEFAULT],
  })

  const currentData = computed(() => sceneMap[activeScene.value].data)
  const currentTitles = computed(() => sceneMap[activeScene.value].titles)

  const currentSelected = computed({
    get: () => selectedMap.value[activeScene.value],
    set: val => {
      selectedMap.value[activeScene.value] = val
    },
  })

  // ==================== 控制 ====================

  const size = ref<'small' | 'medium' | 'large'>('medium')
  const filterable = ref(true)
  const showSelectAll = ref(true)

  /** 穿梭框变更事件处理 */
  function handleChange(
    targetKeys: Array<string | number>,
    direction: 'left' | 'right',
    moveKeys: Array<string | number>
  ) {
    console.log('[Transfer]', { direction, moveKeys, targetKeys })
  }
</script>
