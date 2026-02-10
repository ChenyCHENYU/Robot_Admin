<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-13 09:41:14
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
        :collapsed-width="layout.sidebarCollapsedWidth"
        :width="layout.sidebarWidth"
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
              :name="layout.transitionName.value"
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
        <C_Footer v-if="layout.showFooter" />
      </NLayout>
    </NLayout>

    <!-- 顶部导航布局 (top) -->
    <TopLayout v-else-if="settingsStore.layoutMode === 'top'" />

    <!-- 混合布局【左侧】 (mix) -->
    <MixLayout v-else-if="settingsStore.layoutMode === 'mix'" />

    <!-- 顶部混合布局【侧边优先】 (mix-top) -->
    <MixTopLayout v-else-if="settingsStore.layoutMode === 'mix-top'" />

    <!-- 反转混合布局 (reverse-horizontal-mix) -->
    <ReverseHorizontalMixLayout
      v-else-if="settingsStore.layoutMode === 'reverse-horizontal-mix'"
    />

    <!-- 卡片式布局 (card-layout) -->
    <CardLayout v-else-if="settingsStore.layoutMode === 'card-layout'" />

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

    <!-- 全局设置抽屉 - 提升到布局切换之外，避免切换时被销毁 -->
    <C_Settings v-model:show="showSettings" />
  </div>
</template>

<script setup lang="ts">
  import { type LayoutSiderInst } from 'naive-ui/es'
  import { useSettingsStore } from '@/stores/settings'
  import { useLayoutCache } from '@/composables/useLayoutCache'
  import { useLayoutBridge } from '@/composables/useLayoutBridge'
  import TopLayout from './layouts/TopLayout/index.vue'
  import MixLayout from './layouts/MixLayout/index.vue'
  import MixTopLayout from './layouts/MixTopLayout/index.vue'
  import ReverseHorizontalMixLayout from './layouts/ReverseHorizontalMixLayout/index.vue'
  import CardLayout from './layouts/CardLayout/index.vue'
  import C_Settings from '@/components/global/C_Settings/index.vue'

  // ✅ 使用数据桥接层（解耦业务 Store）
  const layout = useLayoutBridge()
  const settingsStore = useSettingsStore()

  const isReady = ref(true)
  const isDarkMode = layout.isDark

  // ✅ 使用统一的 KeepAlive 缓存管理
  const { cachedViews, maxCacheCount } = useLayoutCache()

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

  // ✅ 通过桥接层获取菜单数据
  const menuData = layout.menus

  // 侧边栏相关
  const siderRef = ref<LayoutSiderInst | null>(null)
  const isCollapsed = ref(false)

  // 设置抽屉状态 - 提升到全局
  const showSettings = ref(false)

  /**
   * * @description: 处理侧边栏折叠状态变化
   * ? @param {*} collapsed 是否折叠
   * ! @return {*} void
   */
  const handleCollapsedChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }

  // 在组件挂载后执行初始化
  onMounted(() => _disposeThemeEffect())

  provide('menuCollapse', {
    isCollapsed,
    handleCollapsedChange,
  })

  // 提供设置抽屉状态给子组件
  provide('settingsDrawer', {
    showSettings,
  })
</script>

<style scoped lang="scss">
  // 所有样式已移至 index.scss 统一管理
  @use './index.scss';
</style>
