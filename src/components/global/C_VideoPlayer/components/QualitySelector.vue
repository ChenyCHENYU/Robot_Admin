<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\QualitySelector.vue
 * @Description: 清晰度选择器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    v-if="qualityList.length > 1"
    class="vp-quality-selector"
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
          class="vp-quality-btn"
        >
          {{ currentLabel }}
        </NButton>
      </template>

      <div class="vp-quality-list">
        <div
          v-for="item in qualityList"
          :key="item.label"
          class="vp-quality-item"
          :class="{ 'is-active': item.label === currentQuality }"
          @click="handleSwitch(item.label)"
        >
          {{ QUALITY_LABEL_MAP[item.label] || item.label }}
        </div>
      </div>
    </NPopover>

    <!-- 切换中 loading 提示 -->
    <NSpin
      v-if="isSwitching"
      :size="14"
      class="vp-quality-loading"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { QUALITY_LABEL_MAP } from '../constants'
  import type { QualityDefinition, QualityLevel } from '../types'

  interface Props {
    qualityList: QualityDefinition[]
    currentQuality: QualityLevel | null
    isSwitching?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    isSwitching: false,
  })

  const emit = defineEmits<{
    switch: [quality: QualityLevel]
  }>()

  const currentLabel = computed(() => {
    if (!props.currentQuality) return '清晰度'
    return QUALITY_LABEL_MAP[props.currentQuality] || props.currentQuality
  })

  /** 处理清晰度切换 */
  function handleSwitch(quality: QualityLevel) {
    if (quality !== props.currentQuality) {
      emit('switch', quality)
    }
  }
</script>

<style scoped lang="scss">
  .vp-quality-selector {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .vp-quality-btn {
    color: #fff;
    font-size: 13px;
  }

  .vp-quality-list {
    display: flex;
    flex-direction: column;
    min-width: 100px;
  }

  .vp-quality-item {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.is-active {
      color: var(--primary-color, #18a058);
      font-weight: 600;
    }
  }

  .vp-quality-loading {
    margin-left: 4px;
  }
</style>
