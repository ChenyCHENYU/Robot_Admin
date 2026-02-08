<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19 17:13:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-01 16:16:24
 * @FilePath: \Robot_Admin\src\components\global\C_MenuTop\index.vue
 * @Description: 菜单顶部区域
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    ref="menuContainer"
    class="menu-top h-56px shrink-0 flex items-center relative overflow-hidden transition-all duration-300"
    :class="[isCollapsed ? 'justify-center px-2' : 'justify-start pl-14px']"
  >
    <!-- 背景装饰 -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-transparent via-[#646cff]/5 to-transparent"
      :class="{ 'animate-shimmer': !isCollapsed }"
    ></div>
    <div
      class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#646cff]/30 to-transparent"
    ></div>

    <!-- Logo容器 -->
    <div class="relative flex-shrink-0">
      <!-- Logo光晕背景 -->
      <div
        class="absolute inset-0 bg-[#646cff]/20 rounded-lg blur-md scale-110"
        :class="{ 'animate-pulse-slow': !isCollapsed }"
      ></div>

      <!-- 使用 video 标签嵌入小视频 -->
      <video
        src="/menu-too-logo.webm"
        width="40"
        height="40"
        autoplay
        loop
        muted
        playsinline
        class="relative z-10 rounded-md shadow-lg transition-transform duration-300 hover:scale-105"
        :class="[isCollapsed ? 'scale-110' : 'scale-100']"
        style="filter: drop-shadow(0 4px 12px rgba(100, 108, 255, 0.3))"
      >
        您的浏览器不支持 video 标签。
      </video>
    </div>

    <!-- 分隔线 - 折叠时隐藏 -->
    <div
      v-show="!isCollapsed"
      class="w-[1px] h-6 mx-4 bg-gradient-to-b from-transparent via-[#646cff]/40 to-transparent transition-all duration-300"
    ></div>

    <!-- 文字内容 - 折叠时隐藏 -->
    <div
      v-show="!isCollapsed"
      class="mt-[6px] text-base font-semibold flex flex-col transition-all duration-300"
    >
      <span class="text-title">Robot Admin</span>
      <span class="text-subtitle">机 器 人 管 理 系 统</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'C_MenuTop' })

  // 获取容器引用
  const menuContainer = ref<HTMLElement>()
  const isCollapsed = ref(false)

  // 监听容器宽度变化
  onMounted(() => {
    if (!menuContainer.value) return

    const updateCollapsedState = () => {
      if (menuContainer.value) {
        // 当父容器宽度小于等于 80px 时认为是折叠状态
        isCollapsed.value = menuContainer.value.parentElement!.offsetWidth <= 80
      }
    }

    // 初始检查
    updateCollapsedState()

    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(() => {
      updateCollapsedState()
    })

    if (menuContainer.value.parentElement) {
      resizeObserver.observe(menuContainer.value.parentElement)
    }

    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
