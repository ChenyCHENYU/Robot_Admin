<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19 17:13:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-25 20:42:29
 * @FilePath: \Robot_Admin\src\components\global\C_MenuTop\index.vue
 * @Description: 菜单顶部区域
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="menu-top h-56px shrink-0 flex items-center pl-14px"
    :style="{ backgroundColor: menuBgColor }"
  >
    <!-- <img
      src="@/assets/images/menu-top-logo.gif"
      w40px
    /> -->

    <!-- 使用 video 标签嵌入小视频 -->
    <video
      src="/menu-too-logo.webm"
      width="40"
      autoplay
      loop
      muted
      playsinline
    >
      您的浏览器不支持 video 标签。
    </video>
    <div
      class="mt-[6px] ml-[10px] text-base font-semibold text-[#646cff] flex flex-col"
    >
      <span>Robot Admin</span>
      <span class="text-12px">机 器 人 管 理 系 统</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  defineOptions({ name: 'C_MenuTop' })

  const themeStore = useThemeStore()
  const menuBgColor = computed(() =>
    themeStore.isDark ? themeStore.darkModeBgColor : '#0d1425'
  )
</script>
