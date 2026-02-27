<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-13 14:22:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-25 16:09:11
 * @FilePath: \Robot_Admin\src\components\global\C_Theme\index.vue
 * @Description: 主题组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NTooltip
    placement="bottom"
    trigger="hover"
  >
    <template #trigger>
      <NButton
        text
        @click="cycleThemeMode"
      >
        <span :class="currentIcon"></span>
      </NButton>
    </template>
    <span>{{ themeTooltip }}</span>
  </NTooltip>
</template>

<script setup lang="ts">
  import type { ThemeMode } from '@/stores/theme'

  const props = withDefaults(
    defineProps<{
      /** 当前主题模式 */
      modelValue?: ThemeMode
    }>(),
    { modelValue: 'system' }
  )

  const emit = defineEmits<{
    'update:modelValue': [mode: ThemeMode]
  }>()

  // 当前图标
  const currentIcon = computed(() => {
    switch (props.modelValue) {
      case 'light':
        return 'i-mdi:white-balance-sunny'
      case 'dark':
        return 'i-mdi:moon-and-stars'
      default:
        return 'i-mdi:sun-moon-stars'
    }
  })

  // 提示文本
  const themeTooltip = computed(() => {
    switch (props.modelValue) {
      case 'light':
        return '当前: 浅色模式 (点击切换)'
      case 'dark':
        return '当前: 深色模式 (点击切换)'
      default:
        return '当前: 跟随系统 (点击切换)'
    }
  })

  // 主题模式循环切换
  const cycleThemeMode = async () => {
    // 按照 system -> light -> dark -> system 顺序循环
    const modes: ThemeMode[] = ['system', 'light', 'dark']
    const currentIndex = modes.indexOf(props.modelValue)
    const nextIndex = (currentIndex + 1) % modes.length

    emit('update:modelValue', modes[nextIndex])
  }
</script>
