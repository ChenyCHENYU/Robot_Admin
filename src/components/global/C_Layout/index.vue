<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-06 17:03:12
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\index.vue
 * @Description: 布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    v-if="isReady"
    :class="['layout-container', isDarkMode ? 'dark-mode' : 'light-mode']"
  >
    <!-- 左侧菜单布局 (side) -->
    <NLayout
      v-if="settingsStore.layoutMode === 'side'"
      has-sider
    >
      <NLayoutSider
        ref="siderRef"
        bordered
        collapse-mode="width"
        :collapsed-width="settingsStore.sidebarCollapsedWidth"
        :width="settingsStore.sidebarWidth"
        :native-scrollbar="false"
        :collapsed="isCollapsed"
        @update:collapsed="handleCollapsedChange"
        :class="[
          'layout-sider',
          'no-horizontal-scroll',
          isDarkMode ? 'dark-theme' : 'light-theme',
        ]"
      >
        <C_MenuTop id="guide-menu-top" />
        <div
          id="guide-menu"
          class="menu-scroll-container"
        >
          <C_Menu
            :data="menuData"
            mode="vertical"
            :collapsed="isCollapsed"
            :inverted="isDarkMode"
          />
        </div>
      </NLayoutSider>

      <NLayout>
        <C_Header />

        <NLayoutContent class="content-with-header p16px app-content">
          <!-- ⚡ 智能 KeepAlive 缓存控制 -->
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
        <C_Footer v-if="settingsStore.showFooter" />
      </NLayout>
    </NLayout>

    <!-- 其他布局暂未实现 -->
    <NLayout v-else>
      <NLayoutContent class="content-with-header p16px app-content">
        <div class="layout-coming-soon">
          <div class="coming-soon-content">
            <div class="coming-soon-icon">🚧</div>
            <div class="coming-soon-title">布局开发中</div>
            <div class="coming-soon-desc">该布局模式正在开发中，敬请期待</div>
            <NButton
              type="primary"
              @click="settingsStore.layoutMode = 'side'"
              style="margin-top: 16px"
            >
              返回左侧菜单布局
            </NButton>
          </div>
        </div>
      </NLayoutContent>
    </NLayout>
  </div>
</template>
<script setup lang="ts">
  import { type LayoutSiderInst } from 'naive-ui/es'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import { MAX_CACHE_COUNT, DEV_CONFIG } from '@/config/keepAliveConfig'

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()
  const route = useRoute()

  const isReady = ref(true)
  const isDarkMode = computed(() => themeStore.isDark)

  // ⚡ KeepAlive 缓存管理（极简版）
  const cachedViews = ref<string[]>([])
  const maxCacheCount = ref(MAX_CACHE_COUNT)

  /**
   * * @description: 判断页面是否应该被缓存
   * * 极简策略：只有明确配置 meta.keepAlive = true 才缓存
   */
  const shouldCache = (routeName: string | symbol | undefined | null) => {
    if (!routeName || typeof routeName !== 'string') return false

    // 只看 meta.keepAlive 的值
    const keepAlive = route.meta?.keepAlive
    return keepAlive === true
  }

  /**
   * * @description: 添加缓存
   */
  const addCache = (name: string) => {
    if (!cachedViews.value.includes(name) && shouldCache(name)) {
      cachedViews.value.push(name)

      // 控制缓存数量
      if (cachedViews.value.length > maxCacheCount.value) {
        cachedViews.value.shift() // 移除最早的缓存
      }

      if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
        console.debug(
          `[KeepAlive] ✅ 缓存: ${name} (${cachedViews.value.length}/${maxCacheCount.value})`
        )
      }
    }
  }

  /**
   * * @description: 移除缓存
   */
  const removeCache = (name: string) => {
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
      if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
        console.debug(`[KeepAlive] ❌ 移除: ${name}`)
      }
    }
  }

  /**
   * * @description: 清空所有缓存
   */
  const clearAllCache = () => {
    cachedViews.value = []
    if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
      console.debug('[KeepAlive] 🗑️ 清空所有缓存')
    }
  }

  // 暴露缓存管理方法到 window（便于调试）
  if (import.meta.env.DEV && DEV_CONFIG.exposeToWindow) {
    ;(window as any).__clearCache__ = clearAllCache
    ;(window as any).__removeCache__ = removeCache
    ;(window as any).__getCachedViews__ = () => cachedViews.value
  }

  // 监听路由变化，动态管理缓存
  watch(
    () => route.name,
    newName => {
      if (newName && typeof newName === 'string') {
        addCache(newName)
      }
    },
    { immediate: true }
  )

  /**
   * * @description: 预设主题样式，避免白闪（仅在暗色模式下需要）
   * ! @return {*} void
   */
  const _disposeThemeEffect = () => {
    // 暗色主题预设背景色，避免白闪
    if (isDarkMode.value) {
      document.documentElement.style.backgroundColor = '#1c1c21'
    } else {
      document.documentElement.style.backgroundColor = '#ffffff'
    }
  }

  // 获取菜单数据
  const menuData = permissionStore.showMenuListGet

  // 侧边栏相关
  const siderRef = ref<LayoutSiderInst | null>(null)
  const isCollapsed = ref(false)

  /**
   * * @description: 处理侧边栏折叠状态变化
   * ? @param {*} collapsed 是否折叠
   * ! @return {*} void
   */
  const handleCollapsedChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }

  // 监听实际的暗色模式状态，而不是 mode
  watch(
    isDarkMode,
    (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )

  // 在组件挂载后执行初始化
  onMounted(() => _disposeThemeEffect())

  provide('menuCollapse', {
    isCollapsed,
    handleCollapsedChange,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';

  // ⚡ 页面切换过渡动画 - 滑动效果
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }

  // ⚡ 页面切换过渡动画 - 淡入效果
  .fade-transform-enter-active,
  .fade-transform-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-transform-enter-from {
    opacity: 0;
    transform: scale(0.95);
  }

  .fade-transform-leave-to {
    opacity: 0;
    transform: scale(1.05);
  }

  // ⚡ 页面切换过渡动画 - 缩放效果
  .fade-zoom-enter-active,
  .fade-zoom-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-zoom-enter-from {
    opacity: 0;
    transform: scale(0.8);
  }

  .fade-zoom-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }

  // 🎨 布局开发中提示样式
  .layout-coming-soon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: var(--app-bg-content);
  }

  .coming-soon-content {
    text-align: center;
    max-width: 400px;
    padding: 40px;
    border-radius: 12px;
    background-color: var(--app-bg-surface);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .coming-soon-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .coming-soon-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--app-text-primary);
  }

  .coming-soon-desc {
    font-size: 16px;
    color: var(--app-text-secondary);
    line-height: 1.5;
  }
</style>
