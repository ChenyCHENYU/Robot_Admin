<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:42:38
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\index.vue
 * @Description: 布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    v-if="isReady"
    :class="['layout-container', `${themeStore.mode}-mode`]"
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
          isLightTheme ? 'light-theme' : 'dark-theme',
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
            :inverted="!isLightTheme"
          />
        </div>
      </NLayoutSider>

      <NLayout>
        <C_Header :isLightTheme="isLightTheme" />

        <NLayoutContent
          class="content-with-header p16px"
          :style="{ backgroundColor: isLightTheme ? '#ffffff' : '#1c1c1c' }"
        >
          <RouterView class="main-content" />
        </NLayoutContent>
        <C_Footer :isLightTheme="isLightTheme" />
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

  const isReady = ref(false) // 控制布局组件是否准备好显示，避免主题闪烁
  const theme = computed(() => themeStore.mode)
  const isLightTheme = computed(() => theme.value === 'light')

  /**
   * * @description: 创建预渲染样式，确保黑色主题下页面初始加载不会出现白闪
   * ! @return {*} void
   */
  const _disposeThemeEffect = () => {
    if (
      themeStore.mode === 'dark' ||
      (themeStore.mode === 'system' && themeStore.systemIsDark)
    ) {
      const style = document.createElement('style')
      style.textContent = `
        body, #app {
          background-color: #1c1c21 !important;
        }
      `
      document.head.appendChild(style)

      // 清理临时样式
      nextTick(() => {
        setTimeout(() => {
          document.head.removeChild(style)
          isReady.value = true
        }, 10)
      })
    } else {
      // 对于浅色主题，直接显示
      isReady.value = true
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

  watch(
    theme,
    newTheme => {
      if (newTheme === 'dark') {
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
