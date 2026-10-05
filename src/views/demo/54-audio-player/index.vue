<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\54-audio-player\index.vue
 * @Description: 声音实验室，真实可播放的本地音频与单实例主题预览
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="sound-lab">
    <header class="sound-heading"
      ><div
        ><span>SOUND LAB / C_AUDIOPLAYER</span><h1>听见交互的细节</h1
        ><p>播放、定位、调节，体验一套完整的音频控制。</p></div
      ><span class="sound-source"><i />本地音频 · 无远端依赖</span></header
    >
    <section class="sound-console">
      <div class="sound-artwork"
        ><img
          :src="activeTrack.cover"
          :alt="activeTrack.title"
          width="320"
          height="320"
        /><div class="sound-identity"
          ><span
            >{{ String(activeIndex + 1).padStart(2, '0') }} /
            {{ String(AUDIO_TRACKS.length).padStart(2, '0') }}</span
          ><h2>{{ activeTrack.title }}</h2
          ><p>代码生成的合成音色</p></div
        ></div
      >
      <div class="sound-controls"
        ><header
          ><span class="eyebrow">PLAYER CONSOLE</span
          ><span
            class="playback-state"
            :class="{ playing }"
            ><i />{{ playing ? '正在播放' : '等待播放' }}</span
          ></header
        ><h2>按你的节奏，开始播放</h2><p>{{ activeTrack.extra?.description }}</p
        ><div class="sound-player"
          ><C_AudioPlayer
            :key="theme"
            :tracks="AUDIO_TRACKS"
            :initial-index="activeIndex"
            :theme="theme"
            :show-cover="false"
            :show-playlist="showPlaylist"
            :autoplay="false"
            mode="single"
            @play="handlePlay"
            @pause="playing = false"
            @ended="playing = false"
            @mode-change="lastEvent = '播放模式已切换'"
            @error="handleError" /></div
        ><div class="sound-settings"
          ><div
            ><span>界面模式</span
            ><NRadioGroup
              v-model:value="theme"
              size="small"
              ><NRadioButton value="default">完整</NRadioButton
              ><NRadioButton value="minimal">迷你</NRadioButton></NRadioGroup
            ></div
          ><label
            ><span>播放列表</span
            ><NSwitch
              v-model:value="showPlaylist"
              :disabled="theme === 'minimal'"
              size="small" /></label></div
        ><div class="sound-event"
          ><span class="i-mdi:information-outline" />{{
            lastEvent || '默认不自动播放，点击播放按钮即可试听。'
          }}</div
        ></div
      >
    </section>
    <section class="sound-details"
      ><div
        ><span class="eyebrow">AUDIO FORMAT</span><strong>PCM / WAV</strong
        ><p>22.05 kHz · 16 bit · 单声道</p></div
      ><div
        ><span class="eyebrow">SAMPLE LIBRARY</span><strong>3 段合成音频</strong
        ><p>12 秒 / 10 秒 / 8 秒，时长来自生成文件</p></div
      ><div
        ><span class="eyebrow">LOCAL SOURCE</span><strong>可重建，可下载</strong
        ><p>由项目音频生成脚本制作</p
        ><a
          :href="activeTrack.src"
          :download="`${activeTrack.id}.wav`"
          >下载当前样例 <span class="i-mdi:arrow-down" /></a></div
    ></section>
    <p class="sound-note"
      >音色与封面用于播放器演示，没有虚构的歌手、会议录音或播客节目。离开页面时播放器会暂停。</p
    >
  </div>
</template>
<script setup lang="ts">
  import { AUDIO_TRACKS } from './data'
  defineOptions({ name: 'Demo54AudioPlayer' })
  const message = useMessage()
  const activeIndex = ref(0)
  const activeTrack = computed(() => AUDIO_TRACKS[activeIndex.value])
  const theme = ref<'default' | 'minimal'>('default')
  const showPlaylist = ref(true)
  const playing = ref(false)
  const lastEvent = ref('')
  /** 只有浏览器实际成功播放后，才显示播放状态。 */
  const handlePlay = (index: number) => {
    activeIndex.value = index
    playing.value = true
    lastEvent.value = `正在播放：${AUDIO_TRACKS[index].title}`
  }
  /** 加载或播放失败时反馈真实错误状态。 */
  const handleError = () => {
    playing.value = false
    lastEvent.value = '音频未能播放，请检查浏览器播放权限或重新尝试'
    message.error(lastEvent.value)
  }
  watch(theme, () => {
    playing.value = false
    lastEvent.value = '界面已切换，点击播放继续试听'
  })
  onDeactivated(() => {
    playing.value = false
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
