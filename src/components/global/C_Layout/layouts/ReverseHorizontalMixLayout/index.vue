<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-12 14:35:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-12 23:40:59
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\layouts\ReverseHorizontalMixLayout\index.vue
 * @Description: 反转混合布局 - 顶部一级菜单 + 右侧二级菜单 + 左侧内容
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="reverse-horizontal-mix-layout-container">
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

      <!-- 中间：一级水平菜单 -->
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

    <!-- 主区域：左侧内容 + 右侧菜单 -->
    <div class="main-area">
      <!-- 左侧：主内容区 -->
      <NLayout class="content-layout">
        <NLayoutContent class="main-content">
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

      <!-- 右侧：二级菜单侧边栏 -->
      <div
        v-if="currentSecondMenus.length > 0"
        class="right-sidebar"
        :class="[
          isDarkMode ? 'dark-theme' : 'light-theme',
          { collapsed: isCollapsed },
        ]"
      >
        <!-- 折叠按钮 -->
        <div
          class="collapse-trigger"
          @click="toggleCollapse"
        >
          <i
            :class="[
              'transition-all duration-300 ease-in-out',
              isCollapsed ? 'i-ri:menu-fold-4-fill' : 'i-ri:menu-fold-3-fill',
            ]"
          ></i>
        </div>

        <!-- 菜单内容 -->
        <div
          v-show="!isCollapsed"
          class="sidebar-content"
        >
          <!-- 侧边栏标题 -->
          <div
            class="sidebar-header"
            :class="[isDarkMode ? 'dark-theme' : 'light-theme']"
          >
            <div class="header-icon">
              <C_Icon
                v-if="activeFirstMenuItem?.meta?.icon"
                :name="activeFirstMenuItem.meta.icon"
                :size="20"
              />
            </div>
            <span class="header-title">{{
              activeFirstMenuItem?.meta?.title || '菜单'
            }}</span>
          </div>

          <!-- 二级菜单列表 -->
          <div class="sidebar-menu-list">
            <template
              v-for="child in currentSecondMenus"
              :key="child.path"
            >
              <!-- 有子菜单的项 -->
              <div
                v-if="child.children && child.children.length > 0"
                class="menu-group"
              >
                <div class="group-title">
                  <C_Icon
                    v-if="child.meta?.icon"
                    :name="child.meta.icon"
                    :size="16"
                  />
                  <span>{{ child.meta?.title }}</span>
                </div>
                <div
                  v-for="subChild in child.children"
                  :key="subChild.path"
                  class="menu-item sub-item"
                  :class="{ active: isMenuItemActive(subChild.path) }"
                  @click="handleMenuClick(subChild)"
                >
                  <C_Icon
                    v-if="subChild.meta?.icon"
                    :name="subChild.meta.icon"
                    :size="16"
                  />
                  <span class="item-title">{{ subChild.meta?.title }}</span>
                </div>
              </div>
              <!-- 没有子菜单的项 -->
              <div
                v-else
                class="menu-item"
                :class="{ active: isMenuItemActive(child.path) }"
                @click="handleMenuClick(child)"
              >
                <C_Icon
                  v-if="child.meta?.icon"
                  :name="child.meta.icon"
                  :size="18"
                />
                <span class="item-title">{{ child.meta?.title }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { MenuOptions } from '@/types/modules/menu'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import { useLayoutCache } from '@/composables/useLayoutCache'
  import ResponsiveMenu from '../components/ResponsiveMenu.vue'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'

  defineOptions({ name: 'ReverseHorizontalMixLayout' })

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()
  const route = useRoute()
  const router = useRouter()

  // 从父组件注入设置抽屉状态
  interface SettingsDrawer {
    showSettings: Ref<boolean>
  }
  const { showSettings } = inject<SettingsDrawer>('settingsDrawer', {
    showSettings: ref(false),
  })

  const isDarkMode = computed(() => themeStore.isDark)
  const menuData = permissionStore.showMenuListGet

  // 右侧边栏折叠状态
  const isCollapsed = ref(false)

  /**
   * 切换右侧边栏折叠状态
   */
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
  }

  // ==================== 工具函数 ====================
  /**
   * 标准化路径
   */
  const normalizePath = (path: string) =>
    path.startsWith('/') ? path : `/${path}`

  /**
   * 检查当前路由是否匹配菜单项
   */
  const isMenuItemActive = (menuPath: string | undefined): boolean => {
    if (!menuPath) return false

    const currentPath = route.path
    const normalizedMenuPath = normalizePath(menuPath)
    const normalizedCurrentPath = normalizePath(currentPath)

    // 完全匹配或子路径匹配
    return (
      currentPath === menuPath ||
      normalizedCurrentPath === normalizedMenuPath ||
      normalizedCurrentPath.includes(`/${menuPath}`)
    )
  }

  /**
   * 递归查找包含当前路由的顶级菜单项
   */
  const findActiveTopMenu = (items: MenuOptions[]): MenuOptions | null => {
    for (const item of items) {
      if (isMenuItemActive(item.path)) return item

      if (item.children?.length) {
        const found = findActiveTopMenu(item.children)
        if (found) return item
      }
    }
    return null
  }

  // ==================== 计算属性 ====================
  /**
   * 当前激活的一级菜单项
   */
  const activeFirstMenuItem = computed(() => findActiveTopMenu(menuData))

  /**
   * 当前一级菜单的二级菜单列表
   */
  const currentSecondMenus = computed(
    () => activeFirstMenuItem.value?.children || []
  )

  // ==================== 事件处理 ====================
  /**
   * 处理菜单点击
   */
  const handleMenuClick = (menuItem: MenuOptions) => {
    if (menuItem.path) router.push(menuItem.path)
  }

  // ✅ 使用统一的 KeepAlive 缓存管理
  const { cachedViews, maxCacheCount } = useLayoutCache()
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
