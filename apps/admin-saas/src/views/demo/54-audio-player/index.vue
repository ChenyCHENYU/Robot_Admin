<template>
  <div class="audio-player-demo">
    <c_vTitle
      title="音频播放器场景示例"
      icon="mdi:music-circle"
      description="支持音乐播放、语音消息、播客节目等多种场景，提供完整的播放控制和播放列表管理"
    />

    <!-- 功能特性 -->
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

    <!-- 左右布局：场景演示 + 主题对比 -->
    <div class="main-layout">
      <!-- 左侧：场景选择 + 控制选项 -->
      <div class="left-panel">
        <NCard title="场景选择">
          <div class="scene-list">
            <div
              v-for="scene in DEMO_SCENES"
              :key="scene.key"
              class="scene-item"
              :class="{ 'is-active': activeScene === scene.key }"
              @click="activeScene = scene.key"
            >
              <C_Icon
                :name="scene.icon"
                class="scene-icon"
              />
              <div class="scene-body">
                <span class="scene-title">{{ scene.title }}</span>
                <span class="scene-desc">{{ scene.description }}</span>
              </div>
            </div>
          </div>
        </NCard>

        <NCard title="显示选项">
          <div class="control-options">
            <div class="control-item">
              <span>显示封面</span>
              <NSwitch v-model:value="showCover" />
            </div>
            <div class="control-item">
              <span>显示列表</span>
              <NSwitch v-model:value="showPlaylist" />
            </div>
          </div>
        </NCard>
      </div>

      <!-- 右侧：播放器演示 -->
      <div class="right-panel">
        <NCard title="默认主题">
          <C_AudioPlayer
            :key="activeScene"
            :tracks="currentTracks"
            :show-playlist="showPlaylist"
            :show-cover="showCover"
            theme="default"
            @play="handlePlay"
            @pause="handlePause"
          />
        </NCard>

        <NCard title="迷你主题">
          <C_AudioPlayer
            :tracks="currentTracks.slice(0, 3)"
            theme="minimal"
          />
          <p class="hint-text">
            迷你主题适用于侧边栏、嵌入式播放器等空间受限场景
          </p>
        </NCard>
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

  // 场景切换
  const activeScene = ref<'music' | 'voice' | 'podcast'>('music')
  const sceneDataMap = {
    music: MUSIC_TRACKS,
    voice: VOICE_TRACKS,
    podcast: PODCAST_TRACKS,
  }
  const currentTracks = computed(() => sceneDataMap[activeScene.value])

  // 控制选项
  const showCover = ref(true)
  const showPlaylist = ref(true)

  // 事件处理
  const handlePlay = (idx: number) => console.log('[AudioPlayer] play:', idx)
  const handlePause = () => console.log('[AudioPlayer] pause')
</script>
