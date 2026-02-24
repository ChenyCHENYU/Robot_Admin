<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\index.vue
 * @Description: 视频播放器组件 — 基于 xgplayer 的教育场景视频播放器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    ref="wrapperRef"
    class="c-video-player"
    :class="{
      'is-mini': miniPlayer.isMiniMode.value,
      'is-fullscreen': isFullscreen,
    }"
    tabindex="0"
  >
    <!-- 播放器容器 -->
    <div
      ref="containerRef"
      class="c-video-player__container"
    />

    <!-- 动态水印 -->
    <WatermarkOverlay
      :visible="antiCheatState.showWatermark.value"
      :text="antiCheatState.watermarkText.value"
    />

    <!-- 字幕渲染层 -->
    <SubtitleOverlay
      :text="subtitle.currentText.value"
      :tracks="subtitle.subtitleList.value"
      :active-language="subtitle.activeLanguage.value"
      @switch="subtitle.switchSubtitle"
      @close="subtitle.closeSubtitle"
    />

    <!-- 测验弹窗 -->
    <QuizOverlay
      v-if="props.quizzes?.length"
      v-model:answer="quiz.selectedAnswer.value"
      :quiz="quiz.activeQuiz.value"
      :show-result="quiz.showResult.value"
      :is-correct="quiz.lastAnswerCorrect.value"
      @submit="handleQuizSubmit"
      @retry="quiz.retryQuiz()"
      @close="handleQuizClose"
    />

    <!-- 扩展控制栏（xgplayer 自带控制栏外的扩展） -->
    <ControlBar :visible="showExtendedControls">
      <template #left>
        <!-- 章节标记 -->
        <ChapterMarkers
          v-if="props.chapters?.length"
          :chapters="chaptersRef"
          :current-chapter="chapters.currentChapter.value"
          :current-index="chapters.currentChapterIndex.value"
          @go-to="chapters.goToChapter"
        />
      </template>

      <template #right>
        <!-- 书签面板 -->
        <BookmarkPanel
          :bookmarks="bookmarksState.bookmarks.value"
          @add="handleAddBookmark"
          @remove="bookmarksState.removeBookmark"
          @go-to="bookmarksState.goToBookmark"
        />
      </template>
    </ControlBar>

    <!-- 小窗关闭按钮 -->
    <div
      v-if="miniPlayer.isMiniMode.value"
      class="c-video-player__mini-close"
      @click="miniPlayer.closeMiniPlayer()"
    >
      ✕
    </div>

    <!-- 小窗点击回原位 -->
    <div
      v-if="miniPlayer.isMiniMode.value"
      class="c-video-player__mini-back"
      @click="miniPlayer.scrollToPlayer()"
    >
      回到原位
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    computed,
    watch,
    toRef,
    onMounted,
    onBeforeUnmount,
    nextTick,
  } from 'vue'
  import { Events } from 'xgplayer'
  import {
    usePlayerCore,
    usePlaybackControl,
    useProgressTracker,
    useQualitySwitch,
    useChapters,
    useBookmarks,
    useAntiCheat,
    useSubtitle,
    useQuiz,
    useMiniPlayer,
    useKeyboard,
  } from './composables'
  import { createAnalyticsPlugin } from './plugins'
  import ControlBar from './components/ControlBar.vue'
  import SubtitleOverlay from './components/SubtitleOverlay.vue'
  import ChapterMarkers from './components/ChapterMarkers.vue'
  import BookmarkPanel from './components/BookmarkPanel.vue'
  import QuizOverlay from './components/QuizOverlay.vue'
  import WatermarkOverlay from './components/WatermarkOverlay.vue'
  import type {
    VideoPlayerProps,
    VideoPlayerExpose,
    PlayerState,
    QualityLevel,
    ProgressData,
    Bookmark,
    Chapter,
  } from './types'

  const props = defineProps<VideoPlayerProps>()

  const emit = defineEmits<{
    ready: []
    stateChange: [state: PlayerState]
    timeUpdate: [currentTime: number, duration: number]
    ended: []
    error: [error: Error]
    qualityChange: [quality: QualityLevel]
    rateChange: [rate: number]
    fullscreenChange: [isFullscreen: boolean]
    bookmarkChange: [bookmarks: Bookmark[]]
    quizAnswer: [quizId: string, answer: string | string[], isCorrect: boolean]
    chapterChange: [chapter: Chapter]
    progressUpdate: [data: ProgressData]
  }>()

  /* ======================== 核心 ======================== */

  const core = usePlayerCore(props)
  const {
    containerRef,
    playerRef,
    playerState,
    currentTime,
    duration,
    isFullscreen,
  } = core

  const wrapperRef = ref<HTMLElement | null>(null)

  /* ======================== 播放控制 ======================== */

  const playback = usePlaybackControl(playerRef)

  /* ======================== 进度追踪 ======================== */

  const urlRef = toRef(props, 'url')
  const progressTracker = useProgressTracker(
    playerRef,
    currentTime,
    duration,
    urlRef,
    props.onProgress,
    props.antiCheat
  )

  /* ======================== 清晰度切换 ======================== */

  const qualitySwitch = useQualitySwitch(playerRef, props.qualityList)

  /* ======================== 章节标记 ======================== */

  const chaptersRef = computed(() => props.chapters ?? [])
  const chapters = useChapters(
    chaptersRef,
    currentTime,
    duration,
    playback.seek
  )

  /* ======================== 书签笔记 ======================== */

  const bookmarksState = useBookmarks(
    urlRef,
    currentTime,
    playback.seek,
    props.bookmarks
  )

  /* ======================== 防作弊 ======================== */

  const antiCheatState = useAntiCheat(playerRef, currentTime, props.antiCheat)

  /* ======================== 字幕 ======================== */

  const subtitle = useSubtitle(playerRef, props.subtitles, currentTime)

  /* ======================== 测验 ======================== */

  const quizzesRef = computed(() => props.quizzes ?? [])
  const quiz = useQuiz(playerRef, currentTime, quizzesRef)

  /* ======================== 小窗播放 ======================== */

  const miniEnabled = computed(() => props.miniPlayer ?? false)
  const miniPlayer = useMiniPlayer(wrapperRef, miniEnabled)

  /* ======================== 快捷键 ======================== */

  const keyboard = useKeyboard(playerRef, wrapperRef, {
    enabled: props.keyboard !== false,
    onToggleFullscreen: () => {
      playerRef.value?.getFullscreen?.()
    },
  })

  /* ======================== 数据分析 ======================== */

  let analyticsDestroy: (() => void) | null = null

  /* ======================== 扩展控制栏：书签始终可用，章节/清晰度按需 ======================== */

  const showExtendedControls = true

  /* ======================== 事件处理 ======================== */

  /** 处理添加书签 */
  function handleAddBookmark(note: string) {
    bookmarksState.addBookmark(note)
    emit('bookmarkChange', bookmarksState.bookmarks.value)
  }

  /** 处理测验提交 */
  function handleQuizSubmit() {
    const isCorrect = quiz.submitAnswer()
    const activeQuiz = quiz.activeQuiz.value
    if (activeQuiz) {
      emit('quizAnswer', activeQuiz.id, quiz.selectedAnswer.value, isCorrect)
    }
  }

  /** 处理测验关闭 */
  function handleQuizClose() {
    quiz.closeQuiz()
  }

  /* ======================== 监听播放器事件并向外 emit ======================== */

  watch(playerState, state => {
    emit('stateChange', state)
  })

  watch(isFullscreen, val => {
    emit('fullscreenChange', val)
  })

  // 监听章节变化
  watch(
    () => chapters.currentChapter.value,
    chapter => {
      if (chapter) {
        emit('chapterChange', chapter)
      }
    }
  )

  /* ======================== 初始化 & 销毁 ======================== */

  onMounted(async () => {
    // 将 wrapperRef 的 el 赋值给 core
    core.containerRef.value = containerRef.value

    await nextTick()
    await core.initPlayer()

    const player = playerRef.value
    if (!player) return

    // 绑定各模块事件
    qualitySwitch.bindEvents(player)
    antiCheatState.bindEvents(player)
    subtitle.initSubtitles()
    keyboard.startListening()
    miniPlayer.initObserver()

    // 恢复断点续播
    const restoreTime = progressTracker.restoreProgress()
    if (restoreTime > 0 && props.startTime === undefined) {
      player.currentTime = restoreTime
    }

    // 播放器事件 → 进度追踪
    player.on(Events.PLAY, () => {
      progressTracker.onPlay()
    })
    player.on(Events.PAUSE, () => {
      progressTracker.onPause()
    })
    player.on(Events.TIME_UPDATE, () => {
      progressTracker.onTimeUpdate()
      emit('timeUpdate', currentTime.value, duration.value)
      emit('progressUpdate', progressTracker.getProgressData())
    })
    player.on(Events.ENDED, () => {
      emit('ended')
      antiCheatState.markAsWatched()
    })
    player.on(Events.ERROR, () => {
      emit('error', new Error('播放器错误'))
    })
    player.on(Events.READY, () => {
      emit('ready')
    })

    // xgplayer 原生清晰度切换 → 向外 emit
    player.on(Events.AFTER_DEFINITION_CHANGE, (data: { to: string }) => {
      emit('qualityChange', data.to as QualityLevel)
    })

    // xgplayer 原生倍速切换 → 向外 emit
    player.on(Events.RATE_CHANGE, (rate: number) => {
      emit('rateChange', rate)
    })

    // 初始化数据分析
    if (props.onAnalytics) {
      const analytics = createAnalyticsPlugin(player, props.onAnalytics)
      analyticsDestroy = analytics.destroy
    }
  })

  onBeforeUnmount(() => {
    analyticsDestroy?.()
    keyboard.stopListening()
    miniPlayer.destroyObserver()
    progressTracker.stopTracking()
    core.destroyPlayer()
  })

  /* ======================== 暴露方法 ======================== */

  defineExpose<VideoPlayerExpose>({
    play: playback.play,
    pause: playback.pause,
    seek: playback.seek,
    setPlaybackRate: playback.setPlaybackRate,
    setVolume: playback.setVolume,
    switchQuality: qualitySwitch.switchQuality,
    getProgressData: progressTracker.getProgressData,
    destroy: core.destroyPlayer,
    getPlayerInstance: () => playerRef.value,
  })
</script>

<style scoped lang="scss">
  .c-video-player {
    position: relative;
    width: 100%;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    outline: none;

    &__container {
      width: 100%;
      height: 100%;
    }

    // 小窗模式样式
    &.is-mini {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 320px;
      height: 180px;
      z-index: 9999;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      transition:
        width 0.3s ease,
        height 0.3s ease;
    }

    &__mini-close {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      z-index: 10;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    &__mini-back {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      padding: 2px 10px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      z-index: 10;
      white-space: nowrap;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }
  }
</style>
