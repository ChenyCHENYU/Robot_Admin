<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19
 * @FilePath: \Robot_Admin\src\components\global\C_MenuTop\index.vue
 * @Description: 菜单品牌区域；直接消费布局折叠状态，不通过测宽反推
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="menu-top"
    :class="{
      'menu-top--collapsed': collapsed,
      'menu-top--standard': !isSignature,
    }"
  >
    <video
      class="menu-top__logo"
      src="/menu-too-logo.webm"
      width="36"
      height="36"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    ></video>
    <div
      v-if="!collapsed"
      class="menu-top__copy"
    >
      <span class="menu-top__title">Robot Admin</span>
      <span class="menu-top__subtitle">机器人管理系统</span>
    </div>
    <span
      v-else
      class="sr-only"
      >Robot Admin</span
    >
  </div>
</template>

<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'

  defineOptions({ name: 'C_MenuTop' })
  withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })

  const themeStore = s_themeStore()
  const isSignature = computed(() => themeStore.menuTheme === 'signature')
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
