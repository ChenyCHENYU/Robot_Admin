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
    <!-- ==================== 头部介绍 ==================== -->
    <div class="demo-header">
      <div class="demo-header__content">
        <h1 class="demo-header__title">
          <C_Icon
            name="mdi:play-circle-outline"
            class="demo-header__icon"
          />
          C_VideoPlayer 视频播放器
        </h1>
        <p class="demo-header__desc">
          基于
          <NTag
            size="small"
            type="success"
          >
            xgplayer 西瓜播放器
          </NTag>
          封装的教育场景视频播放器——支持多格式、清晰度切换、章节标记、防作弊、视频内测验等在线教育核心能力。
        </p>
      </div>
    </div>

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
          @ready="onPlayerReady"
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
          @ready="onPlayerReady"
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
          @ready="onPlayerReady"
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
            :columns="propsColumns"
            :data="propsData"
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
            :columns="eventsColumns"
            :data="eventsData"
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
            :columns="exposeColumns"
            :data="exposeData"
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
  } from '@/components/global/C_VideoPlayer/types'
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
  function tagType(
    tag: string
  ): 'default' | 'success' | 'info' | 'warning' | 'error' {
    const map: Record<
      string,
      'default' | 'success' | 'info' | 'warning' | 'error'
    > = {
      核心: 'success',
      教育: 'info',
      安全: 'error',
      体验: 'warning',
      运营: 'default',
    }
    return map[tag] ?? 'default'
  }

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

  /** 播放器就绪 */
  function onPlayerReady() {
    addLog('ready', 'success', '播放器初始化完成')
    message.success('播放器就绪')
  }

  /** 状态变化 */
  function onStateChange(state: PlayerState) {
    playerState.value = state
    addLog('stateChange', 'info', state)
  }

  /** 时间更新 */
  function onTimeUpdate(time: number, dur: number) {
    currentTime.value = time
    videoDuration.value = dur
  }

  /** 播放结束 */
  function onEnded() {
    addLog('ended', 'warning', '视频播放完毕')
    message.info('视频播放完毕')
  }

  /** 播放错误 */
  function onError(err: Error) {
    addLog('error', 'error', err.message)
    message.error(`播放错误: ${err.message}`)
  }

  /** 清晰度切换 */
  function onQualityChange(quality: QualityLevel) {
    addLog('qualityChange', 'info', quality)
    message.info(`已切换至 ${quality}`)
  }

  /** 章节变化 */
  function onChapterChange(chapter: Chapter) {
    currentChapterTitle.value = chapter.title
    addLog('chapterChange', 'info', chapter.title)
  }

  /** 测验作答 */
  function onQuizAnswer(
    quizId: string,
    answer: string | string[],
    isCorrect: boolean
  ) {
    const result = isCorrect ? '✓ 正确' : '✗ 错误'
    addLog(
      'quizAnswer',
      isCorrect ? 'success' : 'error',
      `题目 ${quizId} — ${result} (${JSON.stringify(answer)})`
    )
  }

  /** 书签变化 */
  function onBookmarkChange(bookmarks: Bookmark[]) {
    addLog('bookmarkChange', 'info', `共 ${bookmarks.length} 个书签`)
  }

  /** 进度上报回调 */
  function handleProgress(data: ProgressData) {
    completionPercent.value = data.completionPercent
    // 演示环境仅打印
    console.log('[进度上报]', data)
  }

  /** 进度更新事件 */
  function onProgressUpdate(data: ProgressData) {
    completionPercent.value = data.completionPercent
  }

  /** 数据分析回调 */
  function handleAnalytics(event: AnalyticsEvent) {
    console.log('[数据分析]', event.type, event)
  }

  /* ======================== API 参考表格 ======================== */

  const propsColumns = [
    { title: '属性', key: 'name', width: 180 },
    { title: '类型', key: 'type', width: 200 },
    { title: '默认值', key: 'default', width: 120 },
    { title: '说明', key: 'desc' },
  ]

  const propsData = [
    { name: 'url', type: 'string', default: '—', desc: '视频源地址（必填）' },
    {
      name: 'sourceType',
      type: "'mp4'|'hls'|'dash'|'flv'",
      default: '自动检测',
      desc: '视频格式类型',
    },
    {
      name: 'poster',
      type: 'string',
      default: '—',
      desc: '封面图地址',
    },
    {
      name: 'autoplay',
      type: 'boolean',
      default: 'false',
      desc: '自动播放',
    },
    {
      name: 'qualityList',
      type: 'QualityDefinition[]',
      default: '—',
      desc: '清晰度列表',
    },
    {
      name: 'chapters',
      type: 'Chapter[]',
      default: '—',
      desc: '章节列表',
    },
    {
      name: 'quizzes',
      type: 'VideoQuiz[]',
      default: '—',
      desc: '视频内测验',
    },
    {
      name: 'antiCheat',
      type: 'AntiCheatConfig',
      default: '—',
      desc: '防作弊配置',
    },
    {
      name: 'playbackRates',
      type: 'PlaybackRate[]',
      default: '[0.5~3.0]',
      desc: '倍速列表',
    },
    {
      name: 'pip',
      type: 'boolean',
      default: 'true',
      desc: '画中画',
    },
    {
      name: 'keyboard',
      type: 'boolean',
      default: 'true',
      desc: '快捷键',
    },
    {
      name: 'onProgress',
      type: 'ProgressReporter',
      default: '—',
      desc: '进度上报回调',
    },
    {
      name: 'onAnalytics',
      type: 'AnalyticsReporter',
      default: '—',
      desc: '数据分析上报',
    },
    {
      name: 'playerOptions',
      type: 'Partial<IPlayerOptions>',
      default: '—',
      desc: 'xgplayer 原生配置透传',
    },
  ]

  const eventsColumns = [
    { title: '事件', key: 'name', width: 180 },
    { title: '参数', key: 'params', width: 260 },
    { title: '说明', key: 'desc' },
  ]

  const eventsData = [
    { name: 'ready', params: '—', desc: '播放器就绪' },
    {
      name: 'stateChange',
      params: 'state: PlayerState',
      desc: '播放状态变化',
    },
    {
      name: 'timeUpdate',
      params: 'currentTime, duration',
      desc: '播放时间更新',
    },
    { name: 'ended', params: '—', desc: '播放结束' },
    { name: 'error', params: 'error: Error', desc: '播放错误' },
    {
      name: 'qualityChange',
      params: 'quality: QualityLevel',
      desc: '清晰度切换',
    },
    { name: 'rateChange', params: 'rate: number', desc: '倍速切换' },
    {
      name: 'bookmarkChange',
      params: 'bookmarks: Bookmark[]',
      desc: '书签变化',
    },
    {
      name: 'quizAnswer',
      params: 'quizId, answer, isCorrect',
      desc: '测验作答',
    },
    {
      name: 'chapterChange',
      params: 'chapter: Chapter',
      desc: '章节切换',
    },
    {
      name: 'progressUpdate',
      params: 'data: ProgressData',
      desc: '进度更新',
    },
  ]

  const exposeColumns = [
    { title: '方法', key: 'name', width: 220 },
    { title: '参数', key: 'params', width: 200 },
    { title: '说明', key: 'desc' },
  ]

  const exposeData = [
    { name: 'play()', params: '—', desc: '播放' },
    { name: 'pause()', params: '—', desc: '暂停' },
    { name: 'seek(time)', params: 'time: number', desc: '跳转到指定时间' },
    {
      name: 'setPlaybackRate(rate)',
      params: 'rate: number',
      desc: '设置倍速',
    },
    {
      name: 'setVolume(vol)',
      params: 'volume: number 0-1',
      desc: '设置音量',
    },
    {
      name: 'switchQuality(q)',
      params: 'quality: QualityLevel',
      desc: '切换清晰度',
    },
    {
      name: 'getProgressData()',
      params: '—',
      desc: '获取当前进度数据',
    },
    { name: 'destroy()', params: '—', desc: '销毁播放器' },
    {
      name: 'getPlayerInstance()',
      params: '—',
      desc: '获取 xgplayer 原始实例',
    },
  ]
</script>

<style scoped lang="scss">
  .video-player-demo {
    padding: 20px;
  }

  /* ========== 头部 ========== */
  .demo-header {
    margin-bottom: 32px;
    padding: 28px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: #fff;

    &__content {
      max-width: 800px;
    }

    &__title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &__icon {
      font-size: 28px;
    }

    &__desc {
      font-size: 14px;
      line-height: 1.7;
      margin: 0;
      opacity: 0.92;
    }
  }

  /* ========== 通用段落 ========== */
  .demo-section {
    margin-bottom: 32px;

    &--player {
      margin-bottom: 24px;
    }
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      color: var(--primary-color, #18a058);
      font-size: 20px;
    }
  }

  .section-desc {
    color: #666;
    margin-bottom: 16px;
    line-height: 1.6;
    font-size: 14px;
  }

  /* ========== 功能特性 ========== */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }

  .feature-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: all 0.25s ease;

    &:hover {
      border-color: var(--primary-color, #18a058);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    &__icon {
      font-size: 22px;
      color: var(--primary-color, #18a058);
      flex-shrink: 0;
    }

    &__body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    &__title {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    &__desc {
      font-size: 11px;
      color: #999;
      margin-top: 2px;
    }

    &__tag {
      flex-shrink: 0;
    }
  }

  /* ========== 场景切换 ========== */
  .scene-switcher {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .scene-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 16px;
    background: #fff;
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: center;

    &:hover {
      border-color: var(--primary-color, #18a058);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    &.is-active {
      border-color: var(--primary-color, #18a058);
      background: rgba(24, 160, 88, 0.04);
      box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.12);
    }

    &__icon {
      font-size: 32px;
      color: var(--primary-color, #18a058);
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    &__desc {
      font-size: 12px;
      color: #999;
      line-height: 1.4;
    }
  }

  /* ========== 播放器容器 ========== */
  .player-wrapper {
    max-width: 960px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    background: #000;
  }

  /* ========== 状态面板 ========== */
  .status-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .status-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 13px;

    &__label {
      color: #999;
      white-space: nowrap;
    }

    &__value {
      color: #333;
      font-weight: 500;

      &.mono {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-variant-numeric: tabular-nums;
      }
    }

    &__pct {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--primary-color, #18a058);
    }
  }

  /* ========== 事件日志 ========== */
  .event-log-panel {
    background: #1e1e2e;
    border-radius: 8px;
    padding: 12px 16px;
    max-height: 260px;
    overflow-y: auto;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
  }

  .event-log-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
    }
  }

  .event-log-time {
    color: #6c7086;
    white-space: nowrap;
  }

  .event-log-detail {
    color: #a6adc8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event-log-empty {
    color: #6c7086;
    text-align: center;
    padding: 20px 0;
    font-style: italic;
  }

  /* ========== 快捷键 ========== */
  .shortcut-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 6px;
    font-size: 13px;
  }

  .shortcut-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 28px;
    padding: 0 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    background: #f4f4f5;
    border: 1px solid #d9d9d9;
    border-bottom-width: 2px;
    border-radius: 4px;
  }

  .shortcut-desc {
    color: #666;
  }

  /* ========== 响应式 ========== */
  @media (max-width: 768px) {
    .video-player-demo {
      padding: 12px;
    }

    .demo-header {
      padding: 20px;

      &__title {
        font-size: 18px;
      }
    }

    .feature-grid {
      grid-template-columns: 1fr 1fr;
    }

    .scene-switcher {
      grid-template-columns: 1fr;
    }

    .shortcut-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
