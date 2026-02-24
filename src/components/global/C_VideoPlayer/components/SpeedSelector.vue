<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\SpeedSelector.vue
 * @Description: 倍速选择器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="vp-speed-selector">
    <NPopover
      trigger="click"
      placement="top"
      :show-arrow="false"
    >
      <template #trigger>
        <NButton
          quaternary
          size="small"
          class="vp-speed-btn"
        >
          {{ currentRate === 1 ? '倍速' : `${currentRate}x` }}
        </NButton>
      </template>

      <div class="vp-speed-list">
        <div
          v-for="rate in rates"
          :key="rate"
          class="vp-speed-item"
          :class="{ 'is-active': rate === currentRate }"
          @click="handleSelect(rate)"
        >
          {{ rate === 1 ? '正常' : `${rate}x` }}
        </div>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import { DEFAULT_PLAYBACK_RATES } from '../constants'
  import type { PlaybackRate } from '../types'

  interface Props {
    currentRate?: number
    rates?: PlaybackRate[]
  }

  withDefaults(defineProps<Props>(), {
    currentRate: 1,
    rates: () => DEFAULT_PLAYBACK_RATES,
  })

  const emit = defineEmits<{
    change: [rate: number]
  }>()

  /** 处理倍速选择 */
  function handleSelect(rate: number) {
    emit('change', rate)
  }
</script>

<style scoped lang="scss">
  .vp-speed-btn {
    color: #fff;
    font-size: 13px;
  }

  .vp-speed-list {
    display: flex;
    flex-direction: column;
    min-width: 80px;
  }

  .vp-speed-item {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
    border-radius: 4px;
    text-align: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.is-active {
      color: var(--primary-color, #18a058);
      font-weight: 600;
    }
  }
</style>
