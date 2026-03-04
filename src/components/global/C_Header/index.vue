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
        <div class="flex items-center h-full gap-12px">
          <NTooltip
            id="guide-menu-collapse"
            placement="bottom"
          >
            <template #trigger>
              <button
                class="collapse-trigger"
                :class="{ 'is-collapsed': isCollapsed }"
                @click="handleCollapsedChange(!isCollapsed)"
              >
                <i
                  :class="[
                    'text-18px transition-transform duration-300 ease-in-out',
                    isCollapsed ? 'i-ri:side-bar-fill' : 'i-ri:side-bar-line',
                  ]"
                ></i>
              </button>
            </template>
            {{ isCollapsed ? '展开菜单' : '收起菜单' }}
          </NTooltip>

          <!-- 分隔线 -->
          <div class="h-16px w-1px bg-gray-200 dark:bg-gray-700 op-60"></div>

          <!-- 面包屑导航 -->
          <div
            v-show="settingsStore.showBreadcrumb"
            class="flex-1 min-w-0 h-full flex items-center translate-y-1px"
          >
            <C_Breadcrumb
              :label-formatter="translateRouteTitle"
              :show-icon="settingsStore.showBreadcrumbIcon"
              @select="router.push"
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
      :style="{ height: `${settingsStore.tagsViewHeight}px` }"
    >
      <C_TagsView :label-formatter="translateRouteTitle" />
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'
  import { s_settingsStore } from '@/stores/settings'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'

  defineOptions({ name: 'C_Header' })

  const themeStore = s_themeStore()
  const settingsStore = s_settingsStore()
  const router = useRouter()

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

<style lang="scss" scoped>
  .collapse-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--app-text-secondary, #666);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    &:hover {
      background: var(--app-hover-bg, rgba(99, 102, 241, 0.08));
      color: #6366f1;
    }

    &:active {
      transform: scale(0.92);
    }

    &.is-collapsed i {
      transform: scaleX(-1);
    }
  }
</style>
