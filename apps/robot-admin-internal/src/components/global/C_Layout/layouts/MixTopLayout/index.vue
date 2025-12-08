<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-11 11:33:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-12 08:56:39
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\layouts\MixTopLayout\index.vue
 * @Description: 顶部混合布局（侧边优先）- 左侧一级菜单 + 顶部二三级菜单
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="mix-top-layout-container">
    <!-- 左侧一级菜单栏 -->
    <div
      class="first-level-sidebar"
      :class="[isDarkMode ? 'dark-theme' : 'light-theme']"
    >
      <!-- Logo 区域 -->
      <div class="logo-container">
        <div class="logo-glow"></div>
        <video
          src="/menu-too-logo.webm"
          width="40"
          height="40"
          autoplay
          loop
          muted
          playsinline
          class="logo-video"
        >
          您的浏览器不支持 video 标签。
        </video>
      </div>

      <!-- 一级菜单项 -->
      <div class="first-menu-list">
        <div
          v-for="item in menuData"
          :key="item.path"
          class="first-menu-item"
          :class="{ active: activeFirstMenu === item.path }"
          @click="handleFirstMenuClick(item)"
        >
          <div class="menu-item-content">
            <C_Icon
              v-if="item.meta?.icon"
              :name="item.meta.icon"
              :size="20"
            />
            <span
              v-else
              class="menu-item-text"
            >
              {{ item.meta?.title?.charAt(0) || '?' }}
            </span>
          </div>
          <div class="menu-item-label">
            {{ item.meta?.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧主区域 -->
    <div class="main-area">
      <!-- 顶部导航栏 -->
      <div
        class="top-navbar"
        :class="[isDarkMode ? 'dark-theme' : 'light-theme']"
      >
        <!-- 左侧：品牌信息 -->
        <div class="navbar-left">
          <div class="brand-name">
            <span class="brand-title">Robot Admin</span>
            <span class="brand-subtitle">机器人管理系统</span>
          </div>
          <div class="navbar-divider"></div>
        </div>

        <!-- 中间：二级菜单（使用ResponsiveMenu组件）-->
        <div class="navbar-center">
          <ResponsiveMenu
            v-if="currentSecondMenus.length > 0"
            :data="currentSecondMenus"
          />
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
  import ResponsiveMenu from '../components/ResponsiveMenu.vue'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'

  defineOptions({ name: 'MixTopLayout' })

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()
  const route = useRoute()
  const router = useRouter()

  // 设置面板状态
  const showSettings = ref(false)

  const isDarkMode = computed(() => themeStore.isDark)
  const menuData = permissionStore.showMenuListGet

  // 当前激活的一级菜单
  const activeFirstMenu = ref<string>('')

  /**
   * 检查当前路由是否匹配菜单项
   * 支持完整路径匹配和部分路径匹配
   */
  const isMenuItemActive = (menuPath: string | undefined) => {
    if (!menuPath) return false

    const currentPath = route.path

    // 完全匹配
    if (currentPath === menuPath) {
      return true
    }

    // 标准化路径（确保以 / 开头）
    const normalizePath = (path: string) =>
      path.startsWith('/') ? path : `/${path}`

    const normalizedMenuPath = normalizePath(menuPath)
    const normalizedCurrentPath = normalizePath(currentPath)

    // 完全匹配（标准化后）
    if (normalizedCurrentPath === normalizedMenuPath) {
      return true
    }

    // 检查当前路径是否以菜单路径开头（子路径匹配）
    // 例如：currentPath="/demo/table-manage/table" 应该匹配 menuPath="table"
    return normalizedCurrentPath.includes(`/${menuPath}`)
  }

  /**
   * 获取当前一级菜单的二级菜单列表
   */
  const currentSecondMenus = computed(() => {
    const firstMenu = menuData.find(item => item.path === activeFirstMenu.value)
    return firstMenu?.children || []
  })

  /**
   * 处理一级菜单点击
   */
  const handleFirstMenuClick = (item: MenuOptions) => {
    activeFirstMenu.value = item.path || ''

    // 如果没有子菜单，直接导航
    if (!item.children || item.children.length === 0) {
      if (item.path) {
        router.push(item.path)
      }
    }
  }

  /**
   * 根据当前路由自动激活对应的一级菜单
   */
  const updateActiveMenuByRoute = () => {
    // 递归检查菜单项是否包含当前路由
    const findMenuByPath = (items: MenuOptions[]): MenuOptions | null => {
      for (const item of items) {
        // 使用智能匹配函数检查是否匹配
        if (isMenuItemActive(item.path)) {
          return item
        }

        // 检查子菜单
        if (item.children && item.children.length > 0) {
          const found = findMenuByPath(item.children)
          if (found) {
            return item // 返回顶级菜单项
          }
        }
      }
      return null
    }

    // 查找当前路由属于哪个一级菜单
    const matchedFirstMenu = findMenuByPath(menuData)

    if (matchedFirstMenu) {
      activeFirstMenu.value = matchedFirstMenu.path || ''
    } else if (menuData.length > 0 && !activeFirstMenu.value) {
      // 如果没有匹配到，默认激活第一个
      activeFirstMenu.value = menuData[0].path || ''
    }
  }

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

  // 监听路由变化，更新激活的菜单
  watch(
    () => route.path,
    () => {
      updateActiveMenuByRoute()
    },
    { immediate: true }
  )

  // 初始化
  onMounted(() => {
    updateActiveMenuByRoute()
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
