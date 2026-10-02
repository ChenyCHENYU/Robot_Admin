<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-04-13
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-04-13
 * @FilePath: \Robot_Admin\src\components\global\C_MfRemoteContainer\index.vue
 * @Description: Module Federation 远程组件容器 — CSS 隔离 + 主题继承
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NConfigProvider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :cls-prefix="clsPrefix"
  >
    <div :class="containerClass">
      <slot />
    </div>
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'

  defineOptions({ name: 'C_MfRemoteContainer' })

  interface Props {
    /** CSS 类前缀，用于隔离远程组件样式，默认 'mf' */
    clsPrefix?: string
    /** 额外容器 class */
    containerClass?: string
  }

  withDefaults(defineProps<Props>(), {
    clsPrefix: 'mf',
    containerClass: 'mf-remote-container',
  })

  const themeStore = s_themeStore()
  const { currentTheme: theme, themeOverrides } = storeToRefs(themeStore)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
