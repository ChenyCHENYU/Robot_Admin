<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-18 14:26:26
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\index.vue
 * @Description: 布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    v-if="isReady"
    :class="['layout-container', isDarkMode ? 'dark-mode' : 'light-mode']"
  >
    <NLayout has-sider>
      <NLayoutSider
        ref="siderRef"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
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
        <C_Header :isLightTheme="!isDarkMode" />

        <NLayoutContent
          class="content-with-header p16px"
          :style="{ backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff' }"
        >
          <RouterView class="main-content" />
        </NLayoutContent>
        <C_Footer :isLightTheme="!isDarkMode" />
      </NLayout>
    </NLayout>
  </div>
</template>
<script setup lang="ts">
  import { type LayoutSiderInst } from 'naive-ui/es'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()

  const isReady = ref(true) // 移除延迟加载，提升响应速度

  // 关键修改：使用 themeStore.isDark 来统一判断主题
  const isDarkMode = computed(() => themeStore.isDark)

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
</style>
