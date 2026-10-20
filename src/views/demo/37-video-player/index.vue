<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 14:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 14:00:00
 * @FilePath: \Robot_Admin\src\views\demo\37-video-player\index.vue
 * @Description: 视频播放器演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="plugin-workspace video-player-demo">
    <header class="workspace-heading"
      ><div
        ><small>MEDIA EXPERIENCE</small><h1>视频体验工作台</h1
        ><p>先播放，再探索章节、字幕与学习交互。</p></div
      ><NTag
        size="small"
        :type="stateTagType"
        :bordered="false"
        >{{ stateLabels[playerState] ?? playerState }}</NTag
      ></header
    >
    <div class="video-workbench">
      <main class="workspace-panel video-main">
        <header class="workspace-toolbar"
          ><div
            ><h2>{{
              DEMO_SCENES.find(item => item.key === activeScene)?.title
            }}</h2
            ><small>{{
              sourceChoice === 'local'
                ? '本地 WebM · 无需外网'
                : '公开演示视频 · 需要网络连接'
            }}</small></div
          ><NButton
            size="small"
            :disabled="sourceCleared"
            @click="restartPlayback"
            >从头播放</NButton
          ></header
        >
        <div class="player-wrapper">
          <C_VideoPlayer
            ref="playerRef"
            v-bind="playerProps"
            @ready="onReady"
            @state-change="onStateChange"
            @time-update="onTimeUpdate"
            @ended="onEnded"
            @error="onError"
            @quality-change="onQualityChange"
            @chapter-change="onChapterChange"
            @quiz-answer="onQuizAnswer"
            @bookmark-change="onBookmarkChange"
            @progress-update="onProgressUpdate"
          />
          <div
            v-if="sourceCleared"
            class="player-empty"
            ><span class="i-mdi-video-off-outline" /><h3>视频源已清空</h3
            ><p>恢复上一个视频，或从右侧选择其他来源。</p
            ><NButton
              size="small"
              type="primary"
              @click="toggleSource"
              >恢复视频源</NButton
            ></div
          >
        </div>
        <div
          v-if="playerState === 'error' && sourceChoice !== 'local'"
          class="video-recovery"
          role="status"
          ><span>公开源暂时无法播放，可以先体验内置视频。</span
          ><NButton
            size="small"
            @click="changeSource('local')"
            >切换内置视频</NButton
          ></div
        >
        <div class="video-progress"
          ><div
            ><span>当前时间</span
            ><strong
              >{{ formatTime(currentTime) }}
              <small>/ {{ formatTime(videoDuration) }}</small></strong
            ></div
          ><div class="video-progress__track"
            ><NProgress
              type="line"
              :percentage="progressPercent"
              :show-indicator="false"
            /><small>{{ progressPercent }}% 已播放</small></div
          ><div v-if="activeScene === 'education'"
            ><span>学习完成率</span><strong>{{ completionPercent }}%</strong
            ><small>{{ currentChapterTitle || '等待进入章节' }}</small></div
          ></div
        >
        <footer class="workspace-footer"
          ><span>Space 播放 / 暂停 · ← → 快退 / 快进 · F 全屏</span
          ><span>播放位置按视频独立保留</span></footer
        >
      </main>
      <aside class="workspace-panel video-sidebar">
        <section class="workspace-section"
          ><h2>选择体验场景</h2
          ><button
            v-for="scene in DEMO_SCENES"
            :key="scene.key"
            type="button"
            class="video-scene"
            :aria-pressed="activeScene === scene.key"
            @click="switchScene(scene.key)"
            ><span class="video-scene__icon"
              ><span :class="SCENE_ICONS[scene.key]" /></span
            ><span
              ><strong>{{ scene.title }}</strong
              ><small>{{ scene.description }}</small></span
            ></button
          ></section
        >
        <section class="workspace-section"
          ><h2>视频来源</h2
          ><NSelect
            :value="sourceChoice"
            :options="VIDEO_SOURCE_OPTIONS"
            aria-label="演示视频源"
            @update:value="changeSource"
          /><p
            >外网不可用时，选择项目内置视频即可播放。章节与测验只跟随原场景视频。</p
          ><NButton
            size="small"
            :disabled="sourceCleared"
            @click="toggleSource"
            >清空视频源</NButton
          ></section
        >
        <section class="workspace-section video-guide"
          ><h2>这样开始体验</h2
          ><ol
            ><li>选择场景，点击画面播放</li
            ><li>在播放器中切换字幕与倍速</li
            ><li>教育场景可体验章节与测验</li></ol
          ></section
        >
      </aside>
    </div>
    <details class="video-details"
      ><summary
        >播放事件与快捷键 <span>{{ eventLogs.length }} 条事件</span></summary
      ><div class="video-detail-grid"
        ><section
          ><div class="video-detail-title"
            ><h2>最近播放事件</h2
            ><NButton
              text
              size="small"
              @click="eventLogs = []"
              >清空</NButton
            ></div
          ><ul class="event-log-panel"
            ><li
              v-for="(log, index) in eventLogs.slice(-8).reverse()"
              :key="index"
              ><time>{{ log.time }}</time
              ><NTag
                :type="log.type"
                size="small"
                :bordered="false"
                >{{ log.event }}</NTag
              ><span>{{ log.detail }}</span></li
            ><li v-if="!eventLogs.length"
              >播放视频后，事件将在这里显示。</li
            ></ul
          ></section
        ><section
          ><h2>键盘快捷键</h2
          ><div class="shortcut-grid"
            ><div
              v-for="item in SHORTCUT_LIST"
              :key="item.key"
              ><kbd>{{ item.key }}</kbd
              ><span>{{ item.desc }}</span></div
            ></div
          ></section
        ></div
      ></details
    >
  </div>
</template>
<script setup lang="ts">
  import { DEMO_SCENES, VIDEO_SOURCE_OPTIONS, SHORTCUT_LIST } from './data'
  import { useVideoWorkspace } from './useVideoWorkspace'
  defineOptions({ name: 'Demo37VideoPlayer' })
  const SCENE_ICONS = {
    basic: 'i-mdi-play-circle',
    hls: 'i-mdi-ip-network-outline',
    education: 'i-mdi-book-open-page-variant-outline',
  }
  const stateLabels = {
    idle: '等待播放',
    loading: '加载中',
    ready: '准备就绪',
    playing: '正在播放',
    paused: '已暂停',
    ended: '播放结束',
    error: '加载失败',
  }
  const {
    activeScene,
    sourceChoice,
    sourceCleared,
    playerRef,
    playerProps,
    playerState,
    currentTime,
    videoDuration,
    completionPercent,
    currentChapterTitle,
    eventLogs,
    progressPercent,
    stateTagType,
    formatTime,
    switchScene,
    changeSource,
    toggleSource,
    restartPlayback,
    onReady,
    onStateChange,
    onTimeUpdate,
    onEnded,
    onError,
    onQualityChange,
    onChapterChange,
    onQuizAnswer,
    onBookmarkChange,
    onProgressUpdate,
  } = useVideoWorkspace()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
