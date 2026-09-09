<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-12
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\index.vue
 * @Description: 布局组件 - 使用 @robot-admin/layout 包
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div>
    <C_LayoutContainer>
      <!-- Side 布局的垂直菜单 -->
      <template #menu="{ collapsed }">
        <C_MenuTop id="guide-menu-top" />
        <div
          id="guide-menu"
          class="menu-scroll-container"
          :class="{
            'menu-light': isMenuLight,
            'menu-signature': themeStore.menuTheme === 'signature',
          }"
        >
          <template v-if="menuExpandMode === 'inline'">
            <template
              v-for="(group, gIdx) in groupedMenuData"
              :key="group.label"
            >
              <div
                v-if="!collapsed"
                class="menu-group-title"
                :style="{ '--group-dot-color': getGroupColor(gIdx) }"
              >
                {{ group.label }}
              </div>
              <div
                v-else
                class="menu-group-dot"
                :style="{ background: getGroupColor(gIdx) }"
              ></div>
              <C_Menu
                :routes="group.items"
                :value="route.path"
                mode="vertical"
                :collapsed="collapsed"
                :inverted="isDarkMode"
                :label-formatter="translateRouteTitle"
                @intent="prefetchRoute"
                @select="router.push"
              />
            </template>
          </template>
          <C_MenuGrouped
            v-else
            :routes="menuData"
            :collapsed="collapsed"
            :inverted="!isMenuLight"
            :menu-theme="themeStore.menuTheme"
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
  import {
    C_LayoutContainer,
    normalizeLayoutMenus,
    type LayoutMenuItem,
    type MenuOptions,
  } from '@robot-admin/layout/naive'
  import { useLayoutBridge } from '@/composables/useLayoutBridge'
  import { s_themeStore } from '@/stores/theme'
  import { s_permissionStore } from '@/stores/permission'
  import { s_settingsStore } from '@/stores/settings'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import { prefetchRoute } from '@/router/routePrefetch'
  import { buildGroupedMenuData, getMenuGroupColor } from './data'
  import C_Settings from '@/components/global/C_Settings/index.vue'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'
  import C_MenuGrouped from '@/components/global/C_MenuGrouped/index.vue'

  // 创建并提供布局上下文（业务 Store → 包标准接口）
  useLayoutBridge()

  const permissionStore = s_permissionStore()
  const themeStore = s_themeStore()
  const settingsStore = s_settingsStore()
  const route = useRoute()
  const router = useRouter()

  const isDarkMode = computed(() => themeStore.isDark)
  const menuExpandMode = computed<'inline' | 'panel'>(
    () => settingsStore.menuExpandMode
  )

  /**
   * 菜单是否为亮色背景（决定 inverted 和文本配色方案）
   */
  const isMenuLight = computed(() => themeStore.isMenuLight)

  /**
   * 最终菜单数据：响应式 + 分组模式下自动包装 type:'group'
   */
  const menuData = computed<LayoutMenuItem[]>(() =>
    normalizeLayoutMenus(permissionStore.showMenuListGet as MenuOptions[])
  )

  const groupedMenuData = computed(() => buildGroupedMenuData(menuData.value))

  const getGroupColor = (i: number) => getMenuGroupColor(i)

  // 设置抽屉状态 - 提升到全局
  const showSettings = ref(false)

  // 提供设置抽屉状态给子组件
  provide('settingsDrawer', {
    showSettings,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
