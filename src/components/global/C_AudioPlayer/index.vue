<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05 23:27:33
 * @FilePath: \Robot_Admin\src\components\global\C_AudioPlayer\index.vue
 * @Description: 音频播放器组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="c-audio-player"
    :class="{ 'is-minimal': theme === 'minimal' }"
  >
    <!-- ================ Now Playing ================ -->
    <div class="c-audio-player__now-playing">
      <div
        v-if="showCover"
        class="c-audio-player__cover"
      >
        <img
          v-if="currentTrack?.cover"
          :src="currentTrack.cover"
          :alt="currentTrack.title"
        />
        <C_Icon
          v-else
          name="mdi:music-note"
          class="c-audio-player__cover-placeholder"
        />
      </div>
      <div class="c-audio-player__info">
        <div class="c-audio-player__title">{{
          currentTrack?.title ?? '未选择曲目'
        }}</div>
        <div
          v-if="currentTrack?.artist"
          class="c-audio-player__artist"
        >
          {{ currentTrack.artist }}
        </div>
      </div>
    </div>

    <!-- ================ Progress ================ -->
    <div
      v-if="theme !== 'minimal'"
      class="c-audio-player__progress"
    >
      <div
        class="c-audio-player__progress-bar"
        @click="seekByClick"
      >
        <div
          class="c-audio-player__progress-fill"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <div class="c-audio-player__time">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(totalDuration) }}</span>
      </div>
    </div>

    <!-- ================ Controls ================ -->
    <div class="c-audio-player__controls">
      <button
        class="c-audio-player__ctrl-btn is-mode"
        :title="currentModeLabel"
        @click="cycleMode"
      >
        <C_Icon :name="currentModeIcon" />
      </button>
      <button
        class="c-audio-player__ctrl-btn is-skip"
        title="上一曲"
        @click="prev"
      >
        <C_Icon name="mdi:skip-previous" />
      </button>
      <button
        class="c-audio-player__ctrl-btn is-play"
        :title="isPlaying ? '暂停' : '播放'"
        @click="togglePlay"
      >
        <C_Icon :name="isPlaying ? 'mdi:pause' : 'mdi:play'" />
      </button>
      <button
        class="c-audio-player__ctrl-btn is-skip"
        title="下一曲"
        @click="next"
      >
        <C_Icon name="mdi:skip-next" />
      </button>
      <button
        class="c-audio-player__ctrl-btn is-mode"
        title="播放列表"
        @click="playlistVisible = !playlistVisible"
      >
        <C_Icon name="mdi:playlist-music" />
      </button>
    </div>

    <!-- ================ Volume ================ -->
    <div
      v-if="theme !== 'minimal'"
      class="c-audio-player__volume"
    >
      <C_Icon
        :name="volumeIcon"
        class="c-audio-player__volume-icon"
        @click="toggleMute"
      />
      <NSlider
        v-model:value="volume"
        :min="0"
        :max="100"
        :step="1"
        class="c-audio-player__volume-slider"
        @update:value="handleVolumeChange"
      />
    </div>

    <!-- ================ Playlist ================ -->
    <div
      v-if="showPlaylist && playlistVisible && theme !== 'minimal'"
      class="c-audio-player__playlist"
    >
      <div class="c-audio-player__playlist-header">
        <span>播放列表</span>
        <span>{{ tracks.length }} 首</span>
      </div>
      <div
        v-for="(track, idx) in tracks"
        :key="track.id"
        class="c-audio-player__track"
        :class="{ 'is-active': idx === activeIndex }"
        @click="playTrack(idx)"
      >
        <span class="c-audio-player__track-index">
          <C_Icon
            v-if="idx === activeIndex && isPlaying"
            name="mdi:volume-high"
          />
          <template v-else>{{ idx + 1 }}</template>
        </span>
        <div class="c-audio-player__track-info">
          <div class="c-audio-player__track-title">{{ track.title }}</div>
          <div
            v-if="track.artist"
            class="c-audio-player__track-artist"
          >
            {{ track.artist }}
          </div>
        </div>
        <span
          v-if="track.duration"
          class="c-audio-player__track-duration"
        >
          {{ formatTime(track.duration) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import {
    DEFAULT_AUDIO_PLAYER_PROPS,
    formatTime,
    MODE_ICON_MAP,
    type AudioPlayerProps,
  } from './types'
  import './index.scss'

  const props = withDefaults(
    defineProps<{
      tracks: AudioPlayerProps['tracks']
      initialIndex?: number
      showPlaylist?: boolean
      showCover?: boolean
      autoplay?: boolean
      mode?: AudioPlayerProps['mode']
      theme?: AudioPlayerProps['theme']
    }>(),
    {
      initialIndex: DEFAULT_AUDIO_PLAYER_PROPS.initialIndex,
      showPlaylist: DEFAULT_AUDIO_PLAYER_PROPS.showPlaylist,
      showCover: true,
      autoplay: DEFAULT_AUDIO_PLAYER_PROPS.autoplay,
      mode: DEFAULT_AUDIO_PLAYER_PROPS.mode,
      theme: DEFAULT_AUDIO_PLAYER_PROPS.theme,
    }
  )

  const emit = defineEmits<{
    play: [index: number]
    pause: []
    ended: [index: number]
    modeChange: [mode: string]
  }>()

  // ==================== Audio Core ====================

  let audio: HTMLAudioElement | null = null

  const activeIndex = ref(props.initialIndex ?? 0)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const totalDuration = ref(0)
  const volume = ref(70)
  const prevVolume = ref(70)
  const playlistVisible = ref(props.showPlaylist)
  const playMode = ref(props.mode ?? 'list')

  const currentTrack = computed(() => props.tracks[activeIndex.value])

  const progressPercent = computed(() => {
    if (totalDuration.value === 0) return 0
    return (currentTime.value / totalDuration.value) * 100
  })

  const volumeIcon = computed(() => {
    if (volume.value === 0) return 'mdi:volume-off'
    if (volume.value < 40) return 'mdi:volume-low'
    if (volume.value < 70) return 'mdi:volume-medium'
    return 'mdi:volume-high'
  })

  const currentModeIcon = computed(
    () => MODE_ICON_MAP[playMode.value]?.icon ?? 'mdi:repeat'
  )
  const currentModeLabel = computed(
    () => MODE_ICON_MAP[playMode.value]?.label ?? '循环'
  )

  /** 初始化音频实例 */
  function initAudio() {
    if (audio) {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onMetaLoaded)
      audio.removeEventListener('ended', onEnded)
    }
    const track = currentTrack.value
    if (!track) return

    audio = new Audio(track.src)
    audio.volume = volume.value / 100
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onMetaLoaded)
    audio.addEventListener('ended', onEnded)
  }

  /** 播放进度更新回调 */
  function onTimeUpdate() {
    if (audio) currentTime.value = audio.currentTime
  }

  /** 音频元数据加载完成回调 */
  function onMetaLoaded() {
    if (audio) totalDuration.value = audio.duration
  }

  /** 播放结束回调，根据模式决定下一步 */
  function onEnded() {
    emit('ended', activeIndex.value)
    switch (playMode.value) {
      case 'loop':
        audio?.play()
        break
      case 'single':
        isPlaying.value = false
        break
      case 'shuffle':
        playTrack(Math.floor(Math.random() * props.tracks.length))
        break
      default: // list
        if (activeIndex.value < props.tracks.length - 1) next()
        else {
          activeIndex.value = 0
          initAudio()
          audio?.play()
        }
    }
  }

  /** 切换播放/暂停 */
  function togglePlay() {
    if (!audio) initAudio()
    if (isPlaying.value) {
      audio?.pause()
      isPlaying.value = false
      emit('pause')
    } else {
      audio?.play()
      isPlaying.value = true
      emit('play', activeIndex.value)
    }
  }

  /** 播放指定索引的曲目 */
  function playTrack(idx: number) {
    activeIndex.value = idx
    initAudio()
    audio?.play()
    isPlaying.value = true
    emit('play', idx)
  }

  /** 上一曲 */
  function prev() {
    const idx =
      activeIndex.value <= 0 ? props.tracks.length - 1 : activeIndex.value - 1
    playTrack(idx)
  }

  /** 下一曲 */
  function next() {
    const idx =
      activeIndex.value >= props.tracks.length - 1 ? 0 : activeIndex.value + 1
    playTrack(idx)
  }

  /** 点击进度条跳转播放位置 */
  function seekByClick(e: MouseEvent) {
    if (!audio || !totalDuration.value) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * totalDuration.value
    currentTime.value = audio.currentTime
  }

  /** 处理音量变更 */
  function handleVolumeChange(val: number) {
    volume.value = val
    if (audio) audio.volume = val / 100
  }

  /** 切换静音状态 */
  function toggleMute() {
    if (volume.value > 0) {
      prevVolume.value = volume.value
      volume.value = 0
    } else {
      volume.value = prevVolume.value || 70
    }
    if (audio) audio.volume = volume.value / 100
  }

  const MODES = ['list', 'loop', 'single', 'shuffle'] as const
  /** 循环切换播放模式 */
  function cycleMode() {
    const idx = MODES.indexOf(playMode.value as (typeof MODES)[number])
    playMode.value = MODES[(idx + 1) % MODES.length]
    emit('modeChange', playMode.value)
  }

  // ==================== Lifecycle ====================

  watch(
    () => props.tracks,
    () => {
      activeIndex.value = 0
      initAudio()
    }
  )

  watch(
    () => props.initialIndex,
    val => {
      if (val !== undefined && val !== activeIndex.value) {
        activeIndex.value = val
        initAudio()
      }
    }
  )

  onBeforeUnmount(() => {
    if (audio) {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onMetaLoaded)
      audio.removeEventListener('ended', onEnded)
      audio = null
    }
  })

  // 自动播放
  if (props.autoplay && props.tracks.length > 0) {
    playTrack(activeIndex.value)
  }
</script>
