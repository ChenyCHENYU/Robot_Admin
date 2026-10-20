<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\components\global\C_Header\index.vue
 * @Description: 顶部导航与可访问的侧边栏折叠入口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NLayoutHeader
    bordered
    position="absolute"
    :class="[
      'layout-header',
      themeStore.isDark ? 'dark-theme' : 'light-theme',
      'px-20px flex flex-col items-center top-0 left-0 right-0 z-1000',
    ]"
    :style="{
      height: `${settingsStore.headerHeight + (settingsStore.showTagsView ? settingsStore.tagsViewHeight : 0)}px`,
    }"
  >
    <!--* 头部 - 上方 -->
    <div
      class="header-top w-full"
      :style="{ height: `${settingsStore.headerHeight}px` }"
    >
      <div
        class="header-content w-full h-full flex items-center justify-between"
      >
        <!-- 左侧：侧边栏折叠 + 面包屑 -->
        <div class="header-navigation flex items-center h-full gap-12px">
          <NTooltip placement="bottom">
            <template #trigger>
              <button
                id="guide-menu-collapse"
                type="button"
                class="collapse-trigger"
                :class="{ 'is-collapsed': isCollapsed }"
                :aria-label="isCollapsed ? '展开菜单' : '收起菜单'"
                :aria-expanded="!isCollapsed"
                @click="handleCollapsedChange(!isCollapsed)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="3"
                  />
                  <path d="M9 4v16" />
                  <path
                    class="collapse-trigger__arrow"
                    d="m15.5 9-3 3 3 3"
                  />
                </svg>
              </button>
            </template>
            {{ isCollapsed ? '展开菜单' : '收起菜单' }}
          </NTooltip>

          <!-- 分隔线 -->
          <div
            class="header-divider"
            aria-hidden="true"
          />

          <!-- 面包屑导航 -->
          <div
            v-show="settingsStore.showBreadcrumb"
            class="flex-1 min-w-0 h-full flex items-center"
          >
            <C_Breadcrumb
              :menus="permissionStore.showMenuListGet"
              :label-formatter="translateRouteTitle"
              :show-icon="settingsStore.showBreadcrumbIcon"
              @select="navigateTo"
            />
          </div>
        </div>

        <!-- 右侧：统一操作区 -->
        <C_NavbarRight v-model:show-settings="showSettings" />
      </div>
    </div>

    <!--* 头部 - 下方 -->
    <div
      v-if="settingsStore.showTagsView"
      class="header-bottom w-full flex items-end"
      data-guide="tags"
      :style="{ height: `${settingsStore.tagsViewHeight}px` }"
    >
      <C_TagsView :label-formatter="translateRouteTitle" />
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'
  import { s_settingsStore } from '@/stores/settings'
  import { s_permissionStore } from '@/stores/permission'
  import { MENU_COLLAPSE_KEY } from '@robot-admin/layout/naive'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'
  import { SETTINGS_DRAWER_KEY } from '@/components/global/C_Layout/d_context'

  defineOptions({ name: 'C_Header' })

  const themeStore = s_themeStore()
  const settingsStore = s_settingsStore()
  const permissionStore = s_permissionStore()
  const router = useRouter()

  /** 面包屑事件不向 Vue 返回导航 Promise，避免把路由加载错误误报为组件错误。 */
  const navigateTo = (path: string): void => {
    void router.push(path).catch(() => undefined)
  }

  // 从父组件注入设置抽屉状态
  const { showSettings } = inject(SETTINGS_DRAWER_KEY, {
    showSettings: ref(false), // 提供默认值以兼容旧代码
  })

  // 使用布局包的类型化 key；独立页面也提供同一契约。
  const { isCollapsed, handleCollapsedChange } = inject(MENU_COLLAPSE_KEY, {
    isCollapsed: computed(() => false),
    handleCollapsedChange: () => undefined,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
