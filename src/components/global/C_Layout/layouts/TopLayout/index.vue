<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-10 08:25:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-10 08:52:47
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\layouts\TopLayout.vue
 * @Description: 顶部导航布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="top-layout-container">
    <!-- 顶部导航栏 -->
    <div
      class="top-navbar"
      :class="[isDarkMode ? 'dark-theme' : 'light-theme']"
    >
      <!-- 左侧：Logo 和品牌 -->
      <div class="navbar-left">
        <div class="logo-container">
          <!-- Logo光晕背景 -->
          <div class="logo-glow"></div>

          <!-- Logo视频 -->
          <video
            src="/menu-too-logo.webm"
            width="36"
            height="36"
            autoplay
            loop
            muted
            playsinline
            class="logo-video"
          >
            您的浏览器不支持 video 标签。
          </video>
        </div>

        <!-- 品牌名称 -->
        <div class="brand-name">
          <span class="brand-title">Robot Admin</span>
          <span class="brand-subtitle">机器人管理系统</span>
        </div>

        <!-- 分隔线 -->
        <div class="navbar-divider"></div>
      </div>

      <!-- 中间：水平菜单 -->
      <div class="navbar-center">
        <ResponsiveMenu :data="menuData" />
      </div>

      <!-- 右侧：操作区 -->
      <C_NavbarRight v-model:show-settings="showSettings" />
    </div>

    <!-- 标签页区域 -->
    <div
      v-if="settingsStore.showTagsView"
      class="tags-view-container"
      :style="{ height: `${settingsStore.tagsViewHeight}px` }"
    >
      <C_TagsView />
    </div>

    <!-- 主内容区域 -->
    <NLayout class="main-layout">
      <NLayoutContent class="main-content">
        <!-- 页面内容 -->
        <div class="page-content">
          <RouterView v-slot="{ Component, route }">
            <Transition
              :name="settingsStore.transitionName"
              mode="out-in"
            >
              <KeepAlive
                :include="cachedViews"
                :max="maxCacheCount"
              >
                <component
                  :is="Component"
                  :key="route.path"
                />
              </KeepAlive>
            </Transition>
          </RouterView>
        </div>
      </NLayoutContent>

      <!-- 页脚 -->
      <C_Footer v-if="settingsStore.showFooter" />
    </NLayout>

    <!-- 设置面板 -->
    <C_Settings v-model:show="showSettings" />
  </div>
</template>

<script setup lang="ts">
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import { MAX_CACHE_COUNT, DEV_CONFIG } from '@/config/keepAliveConfig'
  import ResponsiveMenu from '../components/ResponsiveMenu.vue'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'

  defineOptions({ name: 'TopLayout' })

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()
  const route = useRoute()

  // 设置面板状态
  const showSettings = ref(false)

  const isDarkMode = computed(() => themeStore.isDark)
  const menuData = permissionStore.showMenuListGet

  // KeepAlive 缓存管理
  const cachedViews = ref<string[]>([])
  const maxCacheCount = ref(MAX_CACHE_COUNT)

  const shouldCache = (routeName: string | symbol | undefined | null) => {
    if (!routeName || typeof routeName !== 'string') return false
    const keepAlive = route.meta?.keepAlive
    return keepAlive === true
  }

  const addCache = (name: string) => {
    if (!cachedViews.value.includes(name) && shouldCache(name)) {
      cachedViews.value.push(name)
      if (cachedViews.value.length > maxCacheCount.value) {
        cachedViews.value.shift()
      }
      if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
        console.debug(
          `[KeepAlive] ✅ 缓存: ${name} (${cachedViews.value.length}/${maxCacheCount.value})`
        )
      }
    }
  }

  watch(
    () => route.name,
    newName => {
      if (newName && typeof newName === 'string') {
        addCache(newName)
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
