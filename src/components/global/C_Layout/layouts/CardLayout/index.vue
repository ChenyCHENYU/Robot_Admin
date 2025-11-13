<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-13 09:40:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-13 12:33:48
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\layouts\CardLayout\index.vue
 * @Description: 卡片式布局 - 顶部导航 + 卡片网格菜单 + 内容区
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="card-layout-container">
    <!-- 顶部导航栏 -->
    <div
      class="top-navbar"
      :class="[isDarkMode ? 'dark-theme' : 'light-theme']"
    >
      <!-- 左侧：Logo 和品牌 -->
      <div class="navbar-left">
        <!-- 悬停触发区域 -->
        <div
          class="hover-trigger-area"
          @mouseenter="cancelHideTimer"
          @mouseleave="hideDrawerMenu"
        >
          <div class="menu-indicator">
            <i class="i-ri:menu-3-line"></i>
          </div>
        </div>

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

    <!-- 抽屉式菜单 -->
    <div
      class="drawer-menu"
      :class="[
        isDarkMode ? 'dark-theme' : 'light-theme',
        { visible: showDrawerMenu },
      ]"
      @mouseenter="cancelHideTimer"
      @mouseleave="hideDrawerMenu"
    >
      <!-- 菜单头部 -->
      <div class="drawer-header">
        <div class="drawer-title">
          <i class="i-ri:apps-2-line"></i>
          <span>功能导航</span>
        </div>
      </div>

      <!-- 菜单内容 - 阿里云风格铺开布局 -->
      <div class="drawer-content">
        <div class="menu-grid">
          <div
            v-for="category in menuData"
            :key="category.path"
            class="menu-category"
          >
            <!-- 分类标题 -->
            <div
              class="category-header"
              @click="navigateToPage(category)"
            >
              <C_Icon
                v-if="category.meta?.icon"
                :name="category.meta.icon"
                :size="18"
              />
              <span>{{ category.meta?.title }}</span>
            </div>

            <!-- 分类下的菜单项 - 铺开显示 -->
            <div
              class="category-items"
              v-if="category.children && category.children.length > 0"
            >
              <!-- 2级菜单项 -->
              <div
                v-for="item in category.children"
                :key="item.path"
                class="menu-item"
                @click="navigateToPage(item)"
              >
                <C_Icon
                  v-if="item.meta?.icon"
                  :name="item.meta.icon"
                  :size="16"
                />
                <span class="item-title">{{ item.meta?.title }}</span>
              </div>

              <!-- 3级菜单项 - 铺开显示 -->
              <template
                v-for="item in category.children"
                :key="item.path"
              >
                <div
                  v-if="item.children && item.children.length > 0"
                  class="submenu-items"
                >
                  <div class="submenu-title">{{ item.meta?.title }}</div>
                  <div
                    v-for="subItem in item.children"
                    :key="subItem.path"
                    class="menu-item submenu-item"
                    @click="navigateToPage(subItem)"
                  >
                    <C_Icon
                      v-if="subItem.meta?.icon"
                      :name="subItem.meta.icon"
                      :size="14"
                    />
                    <span class="item-title">{{ subItem.meta?.title }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content-area">
      <NLayout class="content-layout">
        <NLayoutContent class="main-content p16px app-content">
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
    </div>

    <!-- 设置面板 -->
    <C_Settings v-model:show="showSettings" />
  </div>
</template>

<script setup lang="ts">
  import type { MenuOptions } from '@/types/modules/menu'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import { MAX_CACHE_COUNT, DEV_CONFIG } from '@/config/keepAliveConfig'

  defineOptions({ name: 'CardLayout' })

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()
  const route = useRoute()
  const router = useRouter()

  // 设置面板状态
  const showSettings = ref(false)

  const isDarkMode = computed(() => themeStore.isDark)
  const menuData = permissionStore.showMenuListGet

  // 抽屉菜单显示状态
  const showDrawerMenu = ref(false)
  const hideTimer = ref<NodeJS.Timeout | null>(null)

  /**
   * 隐藏抽屉菜单（延迟）
   */
  const hideDrawerMenu = () => {
    if (hideTimer.value) {
      clearTimeout(hideTimer.value)
    }
    hideTimer.value = setTimeout(() => {
      showDrawerMenu.value = false
    }, 300)
  }

  /**
   * 取消隐藏定时器
   */
  const cancelHideTimer = () => {
    if (hideTimer.value) {
      clearTimeout(hideTimer.value)
      hideTimer.value = null
    }
    showDrawerMenu.value = true
  }

  /**
   * 导航到页面
   */
  const navigateToPage = (item: MenuOptions) => {
    if (item.path) {
      router.push(item.path)
      showDrawerMenu.value = false
    }
  }

  // KeepAlive 缓存管理
  const cachedViews = ref<string[]>([])
  const maxCacheCount = ref(MAX_CACHE_COUNT)

  /**
   * 判断路由是否需要缓存
   */
  const shouldCache = (
    routeName: string | symbol | undefined | null
  ): boolean => {
    return typeof routeName === 'string' && route.meta?.keepAlive === true
  }

  /**
   * 添加路由到缓存列表
   */
  const addCache = (name: string) => {
    if (cachedViews.value.includes(name) || !shouldCache(name)) return

    cachedViews.value.push(name)

    // 超出最大缓存数量时移除最早的
    if (cachedViews.value.length > maxCacheCount.value) {
      cachedViews.value.shift()
    }

    // 开发环境日志
    if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
      console.debug(
        `[KeepAlive] ✅ 缓存: ${name} (${cachedViews.value.length}/${maxCacheCount.value})`
      )
    }
  }

  /**
   * 监听路由变化，管理缓存
   */
  watch(
    () => route.name,
    newName => {
      if (typeof newName === 'string') addCache(newName)
    },
    { immediate: true }
  )

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (hideTimer.value) {
      clearTimeout(hideTimer.value)
    }
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
