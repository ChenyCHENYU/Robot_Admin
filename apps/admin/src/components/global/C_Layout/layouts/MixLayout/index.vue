<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-10 13:57:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-10 15:05:12
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\layouts\MixLayout\index.vue
 * @Description: 混合布局 - 左侧一级菜单 + 悬停展开二级菜单 + 右侧内容
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="mix-layout-container">
    <!-- 左侧一级菜单栏 -->
    <div
      class="first-level-menu"
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

    <!-- 悬浮二级菜单 -->
    <Transition name="slide-fade">
      <div
        v-if="showSecondMenu && hoveredMenuItem"
        class="second-level-menu-popup"
        :class="[isDarkMode ? 'dark-theme' : 'light-theme']"
      >
        <!-- 二级菜单标题 - 显示品牌信息 -->
        <div class="second-menu-header">
          <div class="brand-info">
            <span class="brand-title">Robot Admin</span>
            <span class="brand-subtitle">机器人管理系统</span>
          </div>
        </div>

        <!-- 二级菜单列表 -->
        <div class="second-menu-list">
          <template
            v-for="child in hoveredMenuItem.children"
            :key="child.path"
          >
            <!-- 有子菜单的项 -->
            <div
              v-if="child.children && child.children.length > 0"
              class="second-menu-group"
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
                class="second-menu-item sub-item"
                :class="{ active: isMenuItemActive(subChild.path) }"
                @click="handleSecondMenuClick(subChild)"
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
              class="second-menu-item"
              :class="{ active: isMenuItemActive(child.path) }"
              @click="handleSecondMenuClick(child)"
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
    </Transition>

    <!-- 右侧主内容区 -->
    <NLayout class="main-layout">
      <!-- 头部 -->
      <C_Header />

      <!-- 内容区 -->
      <NLayoutContent class="content-with-header p16px app-content">
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
      </NLayoutContent>

      <!-- 页脚 -->
      <C_Footer v-if="settingsStore.showFooter" />
    </NLayout>
  </div>
</template>

<script setup lang="ts">
  import type { MenuOptions } from '@/types/modules/menu'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import { MAX_CACHE_COUNT, DEV_CONFIG } from '@/config/keepAliveConfig'

  defineOptions({ name: 'MixLayout' })

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()
  const route = useRoute()
  const router = useRouter()

  const isDarkMode = computed(() => themeStore.isDark)
  const menuData = permissionStore.showMenuListGet

  // 当前激活的一级菜单
  const activeFirstMenu = ref<string>('')
  // 当前悬停的菜单项
  const hoveredMenuItem = ref<MenuOptions | null>(null)
  // 是否显示二级菜单
  const showSecondMenu = ref(false)

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
   * 处理一级菜单点击
   */
  const handleFirstMenuClick = (item: MenuOptions) => {
    activeFirstMenu.value = item.path || ''

    // 如果有子菜单，切换显示/隐藏二级菜单
    if (item.children && item.children.length > 0) {
      // 如果点击的是当前已展开的菜单，则关闭
      if (showSecondMenu.value && hoveredMenuItem.value?.path === item.path) {
        showSecondMenu.value = false
        hoveredMenuItem.value = null
      } else {
        // 否则展开新菜单
        hoveredMenuItem.value = item
        showSecondMenu.value = true
      }
    } else {
      // 没有子菜单，关闭右侧面板并直接导航
      showSecondMenu.value = false
      hoveredMenuItem.value = null

      if (item.path) {
        router.push(item.path)
      }
    }
  }

  /**
   * 处理二级菜单点击
   */
  const handleSecondMenuClick = (item: MenuOptions) => {
    if (item.path) {
      router.push(item.path)
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
      // 二级菜单默认不展开，需要用户手动点击一级菜单才展开
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

<style lang="scss">
  @use './index.scss';
</style>
