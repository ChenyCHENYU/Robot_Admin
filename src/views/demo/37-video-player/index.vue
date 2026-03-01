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
  <div class="video-player-demo">
    <NH1>视频播放器场景示例</NH1>

    <!-- ==================== 功能特性网格 ==================== -->
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
            :type="tagType(feat.tag)"
            class="feature-card__tag"
          >
            {{ feat.tag }}
          </NTag>
        </div>
      </div>
    </div>

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
        选择不同场景，体验视频播放器在各类业务场景中的表现。
      </p>

      <!-- 场景选择卡片 -->
      <div class="scene-switcher">
        <div
          v-for="scene in DEMO_SCENES"
          :key="scene.key"
          class="scene-card"
          :class="{ 'is-active': activeScene === scene.key }"
          @click="switchScene(scene.key)"
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

    <!-- ==================== 播放器实例 ==================== -->
    <div class="demo-section demo-section--player">
      <div class="player-wrapper">
        <!-- 场景1: 基础播放 -->
        <C_VideoPlayer
          v-if="activeScene === 'basic'"
          ref="playerRef"
          :url="DEMO_SOURCES.mp4"
          :poster="DEMO_SOURCES.poster"
          :subtitles="DEMO_SUBTITLES"
          fluid
          :autoplay-muted="true"
          fullscreen
          pip
          keyboard
          screenshot
          @ready="onReady"
          @state-change="onStateChange"
          @time-update="onTimeUpdate"
          @ended="onEnded"
          @error="onError"
        />

        <!-- 场景2: HLS 流 -->
        <C_VideoPlayer
          v-else-if="activeScene === 'hls'"
          ref="playerRef"
          :url="DEMO_SOURCES.hls"
          source-type="hls"
          fluid
          :autoplay-muted="true"
          fullscreen
          pip
          keyboard
          screenshot
          @ready="onReady"
          @state-change="onStateChange"
          @time-update="onTimeUpdate"
          @error="onError"
        />

        <!-- 场景3: 教育全功能 -->
        <C_VideoPlayer
          v-else-if="activeScene === 'education'"
          ref="playerRef"
          :url="DEMO_SOURCES.mp4"
          :poster="DEMO_SOURCES.poster"
          fluid
          :autoplay-muted="false"
          :quality-list="DEMO_QUALITY_LIST"
          :chapters="DEMO_CHAPTERS"
          :quizzes="DEMO_QUIZZES"
          :subtitles="DEMO_SUBTITLES"
          :anti-cheat="DEMO_ANTI_CHEAT"
          :playback-rates="[0.5, 0.75, 1.0, 1.25, 1.5, 2.0]"
          :on-progress="handleProgress"
          :on-analytics="handleAnalytics"
          fullscreen
          pip
          keyboard
          screenshot
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
      </div>
    </div>

    <!-- ==================== 实时状态面板 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:information-outline"
          class="title-icon"
        />
        实时状态
      </h2>
      <div class="status-grid">
        <div class="status-card">
          <span class="status-card__label">播放状态</span>
          <NTag
            :type="stateTagType"
            size="small"
          >
            {{ playerState }}
          </NTag>
        </div>
        <div class="status-card">
          <span class="status-card__label">当前时间</span>
          <span class="status-card__value mono">{{
            formatTime(currentTime)
          }}</span>
        </div>
        <div class="status-card">
          <span class="status-card__label">视频时长</span>
          <span class="status-card__value mono">{{
            formatTime(videoDuration)
          }}</span>
        </div>
        <div class="status-card">
          <span class="status-card__label">播放进度</span>
          <NProgress
            type="line"
            :percentage="progressPercent"
            :show-indicator="false"
            style="width: 80px"
          />
          <span class="status-card__pct">{{ progressPercent }}%</span>
        </div>
        <div
          v-if="activeScene === 'education'"
          class="status-card"
        >
          <span class="status-card__label">当前章节</span>
          <span class="status-card__value">{{
            currentChapterTitle || '—'
          }}</span>
        </div>
        <div
          v-if="activeScene === 'education'"
          class="status-card"
        >
          <span class="status-card__label">完成率</span>
          <span class="status-card__value mono">{{ completionPercent }}%</span>
        </div>
      </div>
    </div>

    <!-- ==================== 事件日志 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:console"
          class="title-icon"
        />
        事件日志
        <NButton
          quaternary
          size="small"
          style="margin-left: auto"
          @click="eventLogs = []"
        >
          清空
        </NButton>
      </h2>
      <div class="event-log-panel">
        <div
          v-for="(log, idx) in eventLogs.slice(-20)"
          :key="idx"
          class="event-log-item"
        >
          <span class="event-log-time">{{ log.time }}</span>
          <NTag
            :type="log.type"
            size="small"
            :bordered="false"
          >
            {{ log.event }}
          </NTag>
          <span
            v-if="log.detail"
            class="event-log-detail"
            >{{ log.detail }}</span
          >
        </div>
        <div
          v-if="!eventLogs.length"
          class="event-log-empty"
        >
          播放视频后，事件将在此处实时显示...
        </div>
      </div>
    </div>

    <!-- ==================== 快捷键说明 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:keyboard-outline"
          class="title-icon"
        />
        快捷键
      </h2>
      <div class="shortcut-grid">
        <div
          v-for="sc in SHORTCUT_LIST"
          :key="sc.key"
          class="shortcut-item"
        >
          <kbd class="shortcut-key">{{ sc.key }}</kbd>
          <span class="shortcut-desc">{{ sc.desc }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== API 参考 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:api"
          class="title-icon"
        />
        核心 API
      </h2>
      <p class="section-desc">
        完整文档请参阅组件目录下的
        <NButton
          text
          type="primary"
          tag="a"
          href="#"
          @click.prevent
        >
          README.md
        </NButton>
      </p>
      <NCollapse
        arrow-placement="right"
        default-expanded-names="props"
      >
        <NCollapseItem
          title="Props 属性"
          name="props"
        >
          <NDataTable
            :columns="PROPS_COLUMNS"
            :data="PROPS_DATA"
            :bordered="false"
            size="small"
            :pagination="false"
          />
        </NCollapseItem>
        <NCollapseItem
          title="Events 事件"
          name="events"
        >
          <NDataTable
            :columns="EVENTS_COLUMNS"
            :data="EVENTS_DATA"
            :bordered="false"
            size="small"
            :pagination="false"
          />
        </NCollapseItem>
        <NCollapseItem
          title="Expose 方法（ref 调用）"
          name="expose"
        >
          <NDataTable
            :columns="EXPOSE_COLUMNS"
            :data="EXPOSE_DATA"
            :bordered="false"
            size="small"
            :pagination="false"
          />
        </NCollapseItem>
      </NCollapse>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type {
    PlayerState,
    QualityLevel,
    Chapter,
    Bookmark,
    ProgressData,
    AnalyticsEvent,
  } from '@robot-admin/naive-ui-components'
  import {
    DEMO_SOURCES,
    DEMO_QUALITY_LIST,
    DEMO_CHAPTERS,
    DEMO_QUIZZES,
    DEMO_SUBTITLES,
    DEMO_ANTI_CHEAT,
    DEMO_SCENES,
    FEATURE_LIST,
    SHORTCUT_LIST,
    PROPS_COLUMNS,
    PROPS_DATA,
    EVENTS_COLUMNS,
    EVENTS_DATA,
    EXPOSE_COLUMNS,
    EXPOSE_DATA,
    TAG_TYPE_MAP,
  } from './data'

  const message = useMessage()

  /* ======================== 状态 ======================== */

  const playerRef = ref()
  const activeScene = ref('basic')
  const playerState = ref<PlayerState>('idle')
  const currentTime = ref(0)
  const videoDuration = ref(0)
  const completionPercent = ref(0)
  const currentChapterTitle = ref('')

  interface EventLog {
    time: string
    event: string
    type: 'default' | 'success' | 'info' | 'warning' | 'error'
    detail?: string
  }
  const eventLogs = ref<EventLog[]>([])

  /* ======================== 计算属性 ======================== */

  /** 播放进度百分比 */
  const progressPercent = computed(() => {
    if (videoDuration.value <= 0) return 0
    return Math.min(
      100,
      Math.round((currentTime.value / videoDuration.value) * 100)
    )
  })

  /** 状态标签类型 */
  const stateTagType = computed(() => {
    const map: Record<
      string,
      'default' | 'success' | 'info' | 'warning' | 'error'
    > = {
      idle: 'default',
      loading: 'info',
      ready: 'info',
      playing: 'success',
      paused: 'warning',
      ended: 'default',
      error: 'error',
    }
    return map[playerState.value] ?? 'default'
  })

  /* ======================== 工具函数 ======================== */

  /** 格式化时间 mm:ss */
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  /** 追加事件日志 */
  function addLog(
    event: string,
    type: EventLog['type'] = 'default',
    detail?: string
  ) {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    eventLogs.value.push({ time, event, type, detail })
  }

  /** 功能标签配色 */
  const tagType = (tag: string) => TAG_TYPE_MAP[tag] ?? 'default'

  /* ======================== 场景切换 ======================== */

  /** 切换演示场景 */
  function switchScene(key: string) {
    activeScene.value = key
    playerState.value = 'idle'
    currentTime.value = 0
    videoDuration.value = 0
    completionPercent.value = 0
    currentChapterTitle.value = ''
    eventLogs.value = []
    addLog('场景切换', 'info', DEMO_SCENES.find(s => s.key === key)?.title)
  }

  /* ======================== 播放器事件 ======================== */

  const onReady = () => {
    addLog('ready', 'success', '播放器初始化完成')
    message.success('播放器就绪')
  }
  const onStateChange = (s: PlayerState) => {
    playerState.value = s
    addLog('stateChange', 'info', s)
  }
  const onTimeUpdate = (t: number, d: number) => {
    currentTime.value = t
    videoDuration.value = d
  }
  const onEnded = () => {
    addLog('ended', 'warning', '视频播放完毕')
    message.info('视频播放完毕')
  }
  const onError = (e: Error) => {
    addLog('error', 'error', e.message)
    message.error(`播放错误: ${e.message}`)
  }
  const onQualityChange = (q: QualityLevel) => {
    addLog('qualityChange', 'info', q)
    message.info(`已切换至 ${q}`)
  }
  const onChapterChange = (c: Chapter) => {
    currentChapterTitle.value = c.title
    addLog('chapterChange', 'info', c.title)
  }
  const onQuizAnswer = (id: string, ans: string | string[], ok: boolean) => {
    addLog(
      'quizAnswer',
      ok ? 'success' : 'error',
      `题目 ${id} — ${ok ? '✓ 正确' : '✗ 错误'} (${JSON.stringify(ans)})`
    )
  }
  const onBookmarkChange = (b: Bookmark[]) =>
    addLog('bookmarkChange', 'info', `共 ${b.length} 个书签`)
  const handleProgress = (d: ProgressData) => {
    completionPercent.value = d.completionPercent
    console.log('[进度上报]', d)
  }
  const onProgressUpdate = (d: ProgressData) => {
    completionPercent.value = d.completionPercent
  }
  const handleAnalytics = (e: AnalyticsEvent) =>
    console.log('[数据分析]', e.type, e)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
