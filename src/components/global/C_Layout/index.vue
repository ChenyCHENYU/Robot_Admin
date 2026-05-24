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
  <div v-if="isReady">
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
  import { C_LayoutContainer, LAYOUT_CONTEXT_KEY } from '@robot-admin/layout'
  import { useLayoutBridge } from '@/composables/useLayoutBridge'
  import { s_themeStore } from '@/stores/theme'
  import { s_permissionStore } from '@/stores/permission'
  import { s_settingsStore } from '@/stores/settings'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import {
    DEFAULT_MENU_GROUPS,
    GROUP_COLORS,
    OTHER_GROUP_LABEL,
    type MenuGroupConfig,
  } from '@/components/global/C_MenuGrouped/data'
  import C_Settings from '@/components/global/C_Settings/index.vue'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'
  import C_MenuGrouped from '@/components/global/C_MenuGrouped/index.vue'

  // 提供布局上下文（桥接业务 Store → 包标准接口）
  const layoutContext = useLayoutBridge()
  provide(LAYOUT_CONTEXT_KEY, layoutContext)

  const permissionStore = s_permissionStore()
  const themeStore = s_themeStore()
  const settingsStore = s_settingsStore()
  const route = useRoute()
  const router = useRouter()

  const isReady = ref(true)
  const isDarkMode = computed(() => themeStore.isDark)
  const menuExpandMode = computed<'inline' | 'panel'>(
    () => (settingsStore.$state as any).menuExpandMode ?? 'panel'
  )

  /**
   * 菜单是否为亮色背景（决定 inverted 和文本配色方案）
   */
  const isMenuLight = computed(() => themeStore.isMenuLight)

  /**
   * 最终菜单数据：响应式 + 分组模式下自动包装 type:'group'
   */
  const menuData = computed(() => permissionStore.showMenuListGet as any[])

  interface MenuGroup {
    label: string
    items: any[]
  }

  const isMatchGroup = (
    cfg: MenuGroupConfig,
    p: string,
    t: string
  ): boolean => {
    if (cfg.paths?.some(x => p === x || p.endsWith(`/${x}`))) return true
    if (cfg.keywords?.some(kw => t.includes(kw))) return true
    return false
  }

  const groupedMenuData = computed<MenuGroup[]>(() => {
    const menus = menuData.value
    const buckets: MenuGroup[] = DEFAULT_MENU_GROUPS.map(g => ({
      label: g.label,
      items: [],
    }))
    const other: MenuGroup = { label: OTHER_GROUP_LABEL, items: [] }

    for (const menu of menus) {
      const p = menu.path || menu.key || ''
      const t = menu.meta?.title || menu.name || ''
      const i = DEFAULT_MENU_GROUPS.findIndex(c => isMatchGroup(c, p, t))
      if (i >= 0) buckets[i].items.push(menu)
      else other.items.push(menu)
    }

    const out = buckets.filter(g => g.items.length > 0)
    if (other.items.length > 0) out.push(other)
    return out
  })

  const getGroupColor = (i: number) => GROUP_COLORS[i % GROUP_COLORS.length]

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

  onMounted(() => {
    _disposeThemeEffect()
    themeStore.init()
  })

  // 提供设置抽屉状态给子组件
  provide('settingsDrawer', {
    showSettings,
  })
</script>

<style scoped lang="scss">
  .menu-group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 18px 16px 8px;
    color: rgba(214, 222, 244, 0.5);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2px;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--group-dot-color, rgba(255, 255, 255, 0.3));
      box-shadow: 0 0 10px
        color-mix(in srgb, var(--group-dot-color, #646cff) 55%, transparent);
    }

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      margin-left: 4px;
      opacity: 0.55;
      background: linear-gradient(
        to right,
        color-mix(in srgb, var(--group-dot-color, #646cff) 32%, transparent),
        transparent 72%
      );
    }
  }

  .menu-group-dot {
    width: 4px;
    height: 4px;
    margin: 12px auto 6px;
    border-radius: 50%;
    opacity: 0.7;
  }

  .menu-scroll-container.menu-signature {
    --menu-signature-bg: #0d1425;
    --menu-signature-bg-soft: #111a31;
    --menu-signature-border: rgba(118, 132, 255, 0.16);

    background:
      radial-gradient(
        circle at 16% 12%,
        rgba(118, 132, 255, 0.12),
        transparent 30%
      ),
      linear-gradient(
        180deg,
        var(--menu-signature-bg) 0%,
        var(--menu-signature-bg-soft) 18%,
        #0b1120 100%
      );
    border-right: 1px solid var(--menu-signature-border);
    box-shadow:
      inset -1px 0 0 rgba(255, 255, 255, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);

    :deep(.n-menu) {
      padding: 0 6px 6px;
    }

    :deep(.n-menu-item-content) {
      height: 38px !important;
      min-height: 38px;
      margin: 3px 0;
      border-radius: 10px;
      transition:
        background-color 0.18s ease,
        box-shadow 0.18s ease,
        color 0.18s ease,
        transform 0.18s cubic-bezier(0.2, 0, 0, 1);
    }

    :deep(.n-menu-item-content::before) {
      inset: 1px 2px;
      border-radius: 10px;
      transition:
        background-color 0.18s ease,
        box-shadow 0.18s ease,
        opacity 0.18s ease;
    }

    :deep(.n-menu-item-content:hover) {
      transform: translateX(0.5px);
    }

    :deep(.n-menu-item-content:hover::before) {
      background: rgba(255, 255, 255, 0.045) !important;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    }

    :deep(.n-menu-item-content.n-menu-item-content--selected::before),
    :deep(.n-menu-item-content.n-menu-item-content--child-active::before) {
      background: linear-gradient(
        135deg,
        rgba(118, 132, 255, 0.16),
        rgba(255, 255, 255, 0.04)
      ) !important;
      box-shadow:
        inset 0 0 0 1px rgba(150, 160, 255, 0.14),
        0 4px 12px rgba(0, 0, 0, 0.1);
    }

    :deep(.n-menu-item-content__icon),
    :deep(.n-menu-item-content-header),
    :deep(.n-menu-item-content__arrow) {
      transition:
        color 0.18s ease,
        opacity 0.18s ease,
        transform 0.2s ease;
    }

    :deep(.n-submenu-children) {
      position: relative;
      margin: 3px 0 1px 16px;
      padding: 4px 0 4px 10px;
      border-left: 0;
    }

    :deep(.n-submenu-children::before) {
      content: '';
      position: absolute;
      left: 0;
      top: 7px;
      bottom: 7px;
      width: 1px;
      background: linear-gradient(
        180deg,
        transparent,
        rgba(150, 160, 255, 0.2) 14%,
        rgba(150, 160, 255, 0.2) 86%,
        transparent
      );
    }

    :deep(.n-submenu-children .n-menu-item-content) {
      height: 32px !important;
      min-height: 32px;
      margin: 1px 0;
      border-radius: 9px;
      padding-left: 8px !important;
    }

    :deep(.n-submenu-children .n-menu-item-content::before) {
      inset: 1px 4px 1px 0;
      border-radius: 9px;
    }

    :deep(
      .n-submenu-children
        .n-menu-item-content.n-menu-item-content--selected::before
    ) {
      background: rgba(118, 132, 255, 0.14) !important;
      box-shadow:
        inset 2px 0 0 rgba(118, 132, 255, 0.72),
        inset 0 0 0 1px rgba(150, 160, 255, 0.1);
    }
  }
</style>
