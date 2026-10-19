/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\src\views\demo\37-video-player\useVideoWorkspace.ts
 * @Description: 同一播放器实例中的场景、视频源与演示状态管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  PlayerState,
  QualityLevel,
  Chapter,
  Bookmark,
  ProgressData,
  VideoPlayerExpose,
} from '@robot-admin/naive-ui-components/C_VideoPlayer'
import {
  resolveDemoPlayerProps,
  DEMO_SCENES,
  VIDEO_SOURCE_OPTIONS,
  TAG_TYPE_MAP,
  type DemoSceneKey,
  type VideoSourceChoice,
} from './data'

/** 页面只管理资源和状态，播放与持久化生命周期由正式组件负责。 */
export function useVideoWorkspace() {
  const message = useMessage()

  /* ======================== 状态 ======================== */

  const activeScene = ref<DemoSceneKey>('basic')
  const sourceChoice = ref<VideoSourceChoice>('scene')
  const sourceCleared = ref(false)
  const playerRef = ref<VideoPlayerExpose | null>(null)
  const playerProps = computed(() => {
    const configured = resolveDemoPlayerProps(
      activeScene.value,
      sourceChoice.value
    )
    return { ...configured, url: sourceCleared.value ? '' : configured.url }
  })
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
    if (
      !Number.isFinite(videoDuration.value) ||
      !Number.isFinite(currentTime.value) ||
      videoDuration.value <= 0
    )
      return 0
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
    if (!Number.isFinite(seconds) || seconds < 0) return '--:--'
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
    if (eventLogs.value.length > 100) eventLogs.value.shift()
  }

  /** 功能标签配色 */
  const tagType = (tag: string) => TAG_TYPE_MAP[tag] ?? 'default'

  /* ======================== 场景切换 ======================== */

  /** 只有资源身份变化才清空播放状态；同源切换保留位置，答题仅由组件保留未变更题目的记录。 */
  watch(
    () => JSON.stringify([playerProps.value.url, playerProps.value.sourceType]),
    () => {
      playerState.value = 'idle'
      currentTime.value = 0
      videoDuration.value = 0
      completionPercent.value = 0
      currentChapterTitle.value = ''
    },
    { flush: 'sync' }
  )

  /** 场景仅切换能力配置，播放器生命周期由组件根据资源身份管理。 */
  function switchScene(key: DemoSceneKey) {
    if (key === activeScene.value) return
    activeScene.value = key
    sourceChoice.value = 'scene'
    sourceCleared.value = false
    addLog(
      '场景切换',
      'info',
      DEMO_SCENES.find(scene => scene.key === key)?.title
    )
  }

  /** 备用源不沿用原视频的章节和测验，清空后选择其他来源会直接恢复。 */
  const changeSource = (choice: VideoSourceChoice) => {
    sourceChoice.value = choice
    sourceCleared.value = false
    addLog(
      '视频源切换',
      'info',
      VIDEO_SOURCE_OPTIONS.find(item => item.value === choice)?.label
    )
  }
  /** 清空交给组件释放当前媒体资源，恢复时仍使用之前选择的来源。 */
  const toggleSource = () => {
    sourceCleared.value = !sourceCleared.value
    addLog(sourceCleared.value ? '清空视频源' : '恢复视频源', 'info')
  }
  /** 回到开头保留答题和书签，不使用重新挂载来隐藏资源切换行为。 */
  const restartPlayback = () => {
    if (!playerProps.value.url) return
    playerRef.value?.pause()
    playerRef.value?.seek(0)
    currentTime.value = 0
    playerState.value = 'paused'
    addLog('从头播放', 'info', '已回到开头，答题和书签记录保留')
  }

  /* ======================== 播放器事件 ======================== */

  const onReady = () => {
    const restored = playerRef.value?.getProgressData()
    if (restored) {
      currentTime.value = restored.currentTime
      videoDuration.value = restored.duration
      completionPercent.value = restored.completionPercent
    }
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
  const onProgressUpdate = (d: ProgressData) => {
    if (playerProps.value.url) completionPercent.value = d.completionPercent
  }
  return {
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
    tagType,
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
  }
}
