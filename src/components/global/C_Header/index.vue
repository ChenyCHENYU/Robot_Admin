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
        <!-- 左侧：折叠菜单 -->
        <div
          id="guide-menu-collapse"
          class="flex items-center"
        >
          <NTooltip>
            <template #trigger>
              <NButton
                text
                @click="handleCollapsedChange(!isCollapsed)"
              >
                <i
                  :class="[
                    'transition-all duration-300 ease-in-out',
                    isCollapsed
                      ? 'i-ri:menu-fold-4-fill rotate-0'
                      : 'i-ri:menu-fold-3-fill rotate-360',
                  ]"
                ></i>
              </NButton>
            </template>
            折叠菜单
          </NTooltip>
        </div>

        <!-- 中间：面包屑导航 -->
        <div
          class="flex-1 min-w-0"
          :style="{
            visibility: settingsStore.showBreadcrumb ? 'visible' : 'hidden',
          }"
        >
          <C_Breadcrumb />
        </div>

        <!-- 右侧：统一操作区 -->
        <C_NavbarRight v-model:show-settings="showSettings" />
      </div>
    </div>

    <!--* 头部 - 下方 -->
    <div
      v-if="settingsStore.showTagsView"
      class="header-bottom w-full flex items-end"
      :style="{ height: `${settingsStore.tagsViewHeight}px` }"
    >
      <C_TagsView />
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'

  defineOptions({ name: 'C_Header' })

  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()

  // 从父组件注入设置抽屉状态
  interface SettingsDrawer {
    showSettings: Ref<boolean>
  }
  const { showSettings } = inject<SettingsDrawer>('settingsDrawer', {
    showSettings: ref(false), // 提供默认值以兼容旧代码
  })

  interface MenuCollapse {
    isCollapsed: Ref<boolean>
    handleCollapsedChange: (collapsed: boolean) => void
  }

  const { isCollapsed, handleCollapsedChange } =
    inject<MenuCollapse>('menuCollapse')!
</script>
