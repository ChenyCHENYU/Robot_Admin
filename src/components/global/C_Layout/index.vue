<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-11 09:41:14
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\index.vue
 * @Description: 布局组件 - 使用 @robot-admin/layout 包
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div v-if="isReady">
    <C_LayoutContainer>
      <!-- Side 布局的垂直菜单 -->
      <template #menu="{ collapsed }">
        <C_MenuTop id="guide-menu-top" />
        <div
          id="guide-menu"
          class="menu-scroll-container"
        >
          <C_Menu
            :routes="menuData"
            :value="route.path"
            mode="vertical"
            :collapsed="collapsed"
            :inverted="isDarkMode"
            :label-formatter="translateRouteTitle"
            @select="router.push"
          />
        </div>
      </template>

      <!-- Side / Mix 布局的完整头部 -->
      <template #header>
        <C_Header />
      </template>

      <!-- Top / MixTop / Reverse / Card 布局头部右侧操作区 -->
      <template #header-extra>
        <C_NavbarRight v-model:show-settings="showSettings" />
      </template>

      <!-- 标签页 -->
      <template #tags-view>
        <C_TagsView :label-formatter="translateRouteTitle" />
      </template>

      <!-- 页脚 -->
      <template #footer>
        <C_Footer />
      </template>
    </C_LayoutContainer>

    <!-- 全局设置抽屉 - 提升到布局切换之外，避免切换时被销毁 -->
    <C_Settings v-model:show="showSettings" />
  </div>
</template>

<script setup lang="ts">
  import { C_LayoutContainer, LAYOUT_CONTEXT_KEY } from '@robot-admin/layout'
  import { useLayoutBridge } from '@/composables/useLayoutBridge'
  import { s_themeStore } from '@/stores/theme'
  import { s_permissionStore } from '@/stores/permission'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import C_Settings from '@/components/global/C_Settings/index.vue'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'

  // 提供布局上下文（桥接业务 Store → 包标准接口）
  const layoutContext = useLayoutBridge()
  provide(LAYOUT_CONTEXT_KEY, layoutContext)

  const permissionStore = s_permissionStore()
  const themeStore = s_themeStore()
  const route = useRoute()
  const router = useRouter()

  const isReady = ref(true)
  const isDarkMode = computed(() => themeStore.isDark)

  // 获取菜单数据
  const menuData = permissionStore.showMenuListGet

  // 设置抽屉状态 - 提升到全局
  const showSettings = ref(false)

  /**
   * * @description: 预设主题样式，避免白闪（仅在暗色模式下需要）
   */
  const _disposeThemeEffect = () => {
    if (isDarkMode.value) {
      document.documentElement.style.backgroundColor = '#1c1c21'
    } else {
      document.documentElement.style.backgroundColor = '#ffffff'
    }
  }

  onMounted(() => _disposeThemeEffect())

  // 提供设置抽屉状态给子组件
  provide('settingsDrawer', {
    showSettings,
  })
</script>
