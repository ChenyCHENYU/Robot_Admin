<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\54-audio-player\index.vue
 * @Description: 音频播放器演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="audio-player-demo">
    <NH1>音频播放器场景示例</NH1>

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
      <p class="section-desc"
        >选择不同场景，体验音频播放器在各类业务中的使用。</p
      >

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
          <span class="label">封面</span>
          <NSwitch v-model:value="showCover" />
        </div>
        <div class="control-group">
          <span class="label">列表</span>
          <NSwitch v-model:value="showPlaylist" />
        </div>
      </div>

      <!-- 播放器 -->
      <div class="player-wrapper">
        <C_AudioPlayer
          :key="activeScene"
          :tracks="currentTracks"
          :show-playlist="showPlaylist"
          :show-cover="showCover"
          @play="handlePlay"
          @pause="handlePause"
        />
      </div>
    </div>

    <!-- ==================== 主题对比 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:palette"
          class="title-icon"
        />
        主题对比
      </h2>
      <p class="section-desc">默认主题 vs 迷你主题，适用于不同场景的嵌入。</p>

      <div class="theme-comparison">
        <div>
          <div class="theme-label">默认主题</div>
          <C_AudioPlayer
            :tracks="currentTracks.slice(0, 3)"
            theme="default"
            :show-playlist="false"
          />
        </div>
        <div>
          <div class="theme-label">迷你主题</div>
          <C_AudioPlayer
            :tracks="currentTracks.slice(0, 3)"
            theme="minimal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import {
    DEMO_SCENES,
    FEATURE_LIST,
    MUSIC_TRACKS,
    PODCAST_TRACKS,
    TAG_TYPE_MAP,
    VOICE_TRACKS,
  } from './data'
  import './index.scss'

  // ==================== 场景切换 ====================

  const activeScene = ref<'music' | 'voice' | 'podcast'>('music')

  const sceneDataMap = {
    music: MUSIC_TRACKS,
    voice: VOICE_TRACKS,
    podcast: PODCAST_TRACKS,
  }

  const currentTracks = computed(() => sceneDataMap[activeScene.value])

  // ==================== 控制 ====================

  const showCover = ref(true)
  const showPlaylist = ref(true)

  /** 播放事件处理 */
  function handlePlay(idx: number) {
    console.log('[AudioPlayer] play:', idx)
  }

  /** 暂停事件处理 */
  function handlePause() {
    console.log('[AudioPlayer] pause')
  }
</script>
