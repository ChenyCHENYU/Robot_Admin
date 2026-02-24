<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\SubtitleOverlay.vue
 * @Description: 字幕渲染层 + 字幕切换按钮
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <!-- 字幕文本 -->
  <Transition name="vp-subtitle-fade">
    <div
      v-if="text"
      class="vp-subtitle-overlay"
    >
      <span class="vp-subtitle-text">{{ text }}</span>
    </div>
  </Transition>

  <!-- 字幕切换按钮（叠加在播放器控制栏上方） -->
  <div
    v-if="tracks.length"
    class="vp-subtitle-toggle"
  >
    <NPopover
      trigger="click"
      placement="top"
      :show-arrow="false"
    >
      <template #trigger>
        <NButton
          quaternary
          size="small"
          class="vp-subtitle-btn"
          :class="{ 'is-active': !!activeLanguage }"
        >
          字幕
        </NButton>
      </template>

      <div class="vp-subtitle-menu">
        <div
          class="vp-subtitle-menu__item"
          :class="{ 'is-active': !activeLanguage }"
          @click="$emit('close')"
        >
          关闭字幕
        </div>
        <div
          v-for="track in tracks"
          :key="track.language"
          class="vp-subtitle-menu__item"
          :class="{ 'is-active': activeLanguage === track.language }"
          @click="$emit('switch', track.language)"
        >
          {{ track.label }}
        </div>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import type { SubtitleTrack } from '../types'

  interface Props {
    /** 当前要显示的字幕文本 */
    text: string
    /** 字幕轨道列表 */
    tracks: SubtitleTrack[]
    /** 当前激活语言 */
    activeLanguage: string | null
  }

  defineProps<Props>()

  defineEmits<{
    switch: [language: string]
    close: []
  }>()
</script>

<style scoped lang="scss">
  /* ========== 字幕文本 ========== */
  .vp-subtitle-overlay {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    pointer-events: none;
    max-width: 80%;
    text-align: center;
  }

  .vp-subtitle-text {
    display: inline-block;
    padding: 4px 16px;
    font-size: 16px;
    line-height: 1.6;
    color: #fff;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 4px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* ========== 字幕按钮 ========== */
  .vp-subtitle-toggle {
    position: absolute;
    right: 12px;
    bottom: 46px;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.3s ease;

    .c-video-player:hover & {
      opacity: 1;
    }
  }

  .vp-subtitle-btn {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;

    &.is-active {
      color: var(--primary-color, #18a058);
    }
  }

  /* ========== 字幕菜单 ========== */
  .vp-subtitle-menu {
    display: flex;
    flex-direction: column;
    min-width: 100px;

    &__item {
      padding: 6px 14px;
      cursor: pointer;
      font-size: 13px;
      border-radius: 4px;
      text-align: center;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.06);
      }

      &.is-active {
        color: var(--primary-color, #18a058);
        font-weight: 600;
      }
    }
  }

  /* ========== 过渡 ========== */
  .vp-subtitle-fade-enter-active,
  .vp-subtitle-fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .vp-subtitle-fade-enter-from,
  .vp-subtitle-fade-leave-to {
    opacity: 0;
  }
</style>
