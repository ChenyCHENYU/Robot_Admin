/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\usePlayerCore.ts
 * @Description: 播放器核心逻辑 - 初始化 / 销毁 / 状态管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, shallowRef, onBeforeUnmount, type Ref } from 'vue'
import { Events } from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import { DEFAULT_VOLUME, SOURCE_TYPE_MAP } from '../constants'
import type {
  PlayerInstance,
  PlayerState,
  VideoPlayerProps,
  IPlayerOptions,
  VideoSourceType,
} from '../types'

/** 根据 URL 推断视频源类型 */
function detectSourceType(url: string): VideoSourceType {
  try {
    const { pathname } = new URL(url, location.href)
    const ext = pathname.slice(pathname.lastIndexOf('.')).toLowerCase()
    return SOURCE_TYPE_MAP[ext] ?? 'mp4'
  } catch {
    return 'mp4'
  }
}

/**
 * 播放器核心 composable
 * - 管理 xgplayer 实例的创建 & 销毁
 * - 暴露播放器状态、引用
 */
export function usePlayerCore(props: VideoPlayerProps) {
  /** 播放器 DOM 容器 */
  const containerRef: Ref<HTMLElement | null> = ref(null)

  /** xgplayer 实例（使用 shallowRef 避免深度响应） */
  const playerRef = shallowRef<PlayerInstance | null>(null)

  /** 播放器当前状态 */
  const playerState = ref<PlayerState>('idle')

  /** 当前播放时间 */
  const currentTime = ref(0)

  /** 视频总时长 */
  const duration = ref(0)

  /** 是否全屏 */
  const isFullscreen = ref(false)

  /** 构建播放器核心容器配置 */
  function buildCoreConfig(): IPlayerOptions {
    return {
      el: containerRef.value!,
      url: props.url,
      width: props.width ?? '100%',
      height: props.height ?? '100%',
      fluid: props.fluid !== false,
      fitVideoSize: 'fixWidth' as const,
      poster: props.poster ?? '',
      playsinline: true,
      videoAttributes: { crossOrigin: 'anonymous' },
      lang: props.lang ?? 'zh-cn',
      inactive: 3000,
    }
  }

  /** 构建播放行为配置 */
  function buildPlaybackConfig(): Partial<IPlayerOptions> {
    return {
      autoplay: props.autoplay ?? false,
      autoplayMuted: props.autoplayMuted ?? false,
      loop: props.loop ?? false,
      volume: props.volume ?? DEFAULT_VOLUME,
      startTime: props.startTime ?? 0,
      defaultPlaybackRate: props.defaultPlaybackRate ?? 1,
      playbackRate: props.playbackRates
        ? { list: props.playbackRates.map(r => r) }
        : true,
    }
  }

  /** 构建功能开关配置 */
  function buildFeatureConfig(): Partial<IPlayerOptions> {
    return {
      pip: props.pip !== false,
      screenShot: props.screenshot ?? false,
      mini: props.miniPlayer ?? false,
      fullscreen: props.fullscreen !== false,
      cssFullscreen: props.cssFullscreen !== false,
      keyShortcut: props.keyboard !== false,
    }
  }

  /** 构建扩展配置（缩略图、清晰度等） */
  function applyExtendedConfig(config: IPlayerOptions): void {
    if (props.thumbnail) {
      config.thumbnail = {
        urls: props.thumbnail.urls,
        pic_num: props.thumbnail.picNum,
        col: props.thumbnail.col,
        row: props.thumbnail.row,
        width: props.thumbnail.width,
        height: props.thumbnail.height,
      }
    }

    if (props.qualityList?.length) {
      config.definition = {
        list: props.qualityList.map(q => ({
          url: q.url,
          definition: q.label,
          text: { zh: q.label, en: q.label },
          bitrate: q.bitrate,
        })),
        defaultDefinition: props.defaultQuality ?? props.qualityList[0].label,
      }
    }

    if (props.playerOptions) {
      Object.assign(config, props.playerOptions)
    }
  }

  /** 构建完整 xgplayer 配置 */
  function buildConfig(): IPlayerOptions {
    const sourceType = props.sourceType ?? detectSourceType(props.url)
    const config: IPlayerOptions = {
      ...buildCoreConfig(),
      ...buildPlaybackConfig(),
      ...buildFeatureConfig(),
    }
    applyExtendedConfig(config)
    ;(config as Record<string, unknown>).__sourceType = sourceType
    return config
  }

  /** 初始化播放器 */
  async function initPlayer() {
    if (!containerRef.value) return

    playerState.value = 'loading'

    const config = buildConfig()
    const sourceType = (config as Record<string, unknown>)
      .__sourceType as VideoSourceType
    delete (config as Record<string, unknown>).__sourceType

    let PlayerConstructor: typeof import('xgplayer').default

    // 根据源类型动态加载对应的播放器
    if (sourceType === 'hls') {
      const { default: HlsPlayer } = await import('xgplayer-hls')
      PlayerConstructor =
        HlsPlayer as unknown as typeof import('xgplayer').default
    } else {
      const { default: PresetPlayer } = await import('xgplayer')
      PlayerConstructor = PresetPlayer
    }

    const player = new PlayerConstructor(config)
    playerRef.value = player

    // 绑定事件
    player.on(Events.READY, () => {
      playerState.value = 'ready'
    })

    player.on(Events.PLAY, () => {
      playerState.value = 'playing'
    })

    player.on(Events.PAUSE, () => {
      playerState.value = 'paused'
    })

    player.on(Events.ENDED, () => {
      playerState.value = 'ended'
    })

    player.on(Events.ERROR, () => {
      playerState.value = 'error'
    })

    player.on(Events.TIME_UPDATE, () => {
      currentTime.value = player.currentTime ?? 0
      duration.value = player.duration ?? 0
    })

    player.on(Events.DURATION_CHANGE, () => {
      duration.value = player.duration ?? 0
    })

    player.on(Events.FULLSCREEN_CHANGE, (isFS: boolean) => {
      isFullscreen.value = isFS
    })
  }

  /** 销毁播放器 */
  function destroyPlayer() {
    const player = playerRef.value
    if (player) {
      player.destroy()
      playerRef.value = null
    }
    playerState.value = 'idle'
    currentTime.value = 0
    duration.value = 0
  }

  onBeforeUnmount(() => {
    destroyPlayer()
  })

  return {
    containerRef,
    playerRef,
    playerState,
    currentTime,
    duration,
    isFullscreen,
    initPlayer,
    destroyPlayer,
  }
}
