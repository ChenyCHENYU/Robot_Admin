<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-01 19:52:41
 * @FilePath: \robot\Robot_Admin\src\components\global\C_NavbarRight\index.vue
 * @Description: 统一的导航栏右侧操作区组件 - 所有布局共用
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="navbar-right">
    <!-- 全局搜索 -->
    <C_GlobalSearch :options="searchOptions" />

    <!-- 操作按钮组：显式导入，不依赖 DynamicComponent -->
    <div class="action-buttons">
      <!-- 通知中心 -->
      <C_NotificationCenter :on-navigate="handleNavigate" />

      <!-- 全屏 -->
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NButton
            text
            @click="toggleFullscreen"
            class="action-btn"
          >
            <span class="i-mdi:fullscreen"></span>
          </NButton>
        </template>
        <span>全屏</span>
      </NTooltip>

      <!-- 语言切换 -->
      <C_Language
        :model-value="languageStore.currentLang"
        @change="languageStore.setLanguage"
      />

      <!-- 主题切换 -->
      <C_Theme
        :model-value="themeStore.mode"
        @update:model-value="themeStore.setMode"
      />

      <!-- 功能引导 -->
      <C_Guide :steps="guideSteps" />

      <!-- 布局配置 -->
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NButton
            text
            @click="emit('update:showSettings', true)"
            class="action-btn"
          >
            <span class="i-mdi:settings-transfer-outline"></span>
          </NButton>
        </template>
        <span>布局配置</span>
      </NTooltip>
    </div>

    <!-- 用户信息 -->
    <div class="user-info">
      <NAvatar
        round
        size="small"
        src="/robot-avatar.png"
      />
      <NDropdown
        size="small"
        :options="userOptions"
        @select="handleUserSelect"
      >
        <div class="user-dropdown">
          <span>{{ userName }}</span>
          <span class="i-mdi:chevron-down"></span>
        </div>
      </NDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { s_userStore } from '@/stores/user'
  import { useThemeStore } from '@/stores/theme'
  import { useLanguageStore } from '@/stores/language'
  import { s_permissionStore } from '@/stores/permission'
  import { normalizeMenuOptions } from '@/utils/d_menu'
  import {
    C_GlobalSearch,
    C_NotificationCenter,
    C_Language,
    C_Theme,
    C_Guide,
    type GlobalSearchOptions,
    type SearchMenuItem,
    type GuideStep,
  } from '@robot-admin/naive-ui-components'
  import type { MenuOption } from 'naive-ui/es'

  defineOptions({ name: 'C_NavbarRight' })

  // 定义 props 和 emits
  interface Props {
    showSettings?: boolean
  }

  defineProps<Props>()

  const emit = defineEmits<{
    'update:showSettings': [value: boolean]
  }>()

  const userStore = s_userStore()
  const themeStore = useThemeStore()
  const languageStore = useLanguageStore()
  const permissionStore = s_permissionStore()
  const router = useRouter()

  // 用户名
  const userName = computed(() => userStore.userInfo?.username || 'CHENY')

  // ==================== 全局搜索配置 ====================
  /** 将权限菜单树扁平化为 SearchMenuItem[] */
  function flattenMenuItems(items: MenuOption[]): SearchMenuItem[] {
    const result: SearchMenuItem[] = []
    for (const item of items) {
      if (item.key && item.label) {
        result.push({
          key: item.key as string,
          label: item.label as string,
          icon: item.icon,
          children: item.children,
        })
      }
      if (item.children?.length) {
        result.push(...flattenMenuItems(item.children))
      }
    }
    return result
  }

  /** 在菜单树中找到父级的第一个子路由 key */
  function findFirstChildKey(parentKey: string): string | null {
    const normalized = normalizeMenuOptions(permissionStore.showMenuListGet)
    const find = (nodes: MenuOption[]): string | null => {
      for (const n of nodes) {
        if (n.key === parentKey && n.children?.length)
          return (n.children[0]?.key as string) || null
        if (n.children?.length) {
          const r = find(n.children)
          if (r) return r
        }
      }
      return null
    }
    return find(normalized)
  }

  const searchOptions: GlobalSearchOptions = {
    menuItems: () =>
      flattenMenuItems(normalizeMenuOptions(permissionStore.showMenuListGet)),
    isDark: () => themeStore.isDark,
    /** 选中菜单项后跳转路由 */
    onSelect(key: string, hasChildren: boolean) {
      if (hasChildren) {
        const childKey = findFirstChildKey(key)
        if (childKey) {
          router.push(childKey)
          return
        }
      }
      router.push(key)
    },
  }

  // ==================== 功能引导步骤 ====================
  const guideSteps: GuideStep[] = [
    {
      element: '#guide-menu-top',
      popover: {
        title: '品牌 Logo',
        description: '这里展示系统品牌标识，点击可返回首页。',
        side: 'right',
      },
    },
    {
      element: '#guide-menu',
      popover: {
        title: '导航菜单',
        description: '系统功能模块入口，点击展开子菜单并跳转到对应页面。',
        side: 'right',
      },
    },
    {
      element: '#guide-menu-collapse',
      popover: {
        title: '折叠菜单',
        description: '点击此按钮可展开或收起侧边导航栏，获得更大的内容区域。',
        side: 'bottom',
      },
    },
    {
      element: '#guide-breadcrumb',
      popover: {
        title: '面包屑导航',
        description: '显示当前页面在系统中的层级位置，可点击快速返回上级。',
        side: 'bottom',
      },
    },
    {
      element: '#guide-tags-view',
      popover: {
        title: '标签页',
        description: '已打开的页面标签，支持快速切换、右键关闭操作。',
        side: 'bottom',
      },
    },
  ]

  // ==================== 操作事件 ====================
  /** 通知中心 — 跳转到指定 URL */
  const handleNavigate = (url: string) => router.push(url)

  /** 全屏切换 */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // 用户下拉菜单选项
  const userOptions = [
    {
      key: 'profile',
      label: '个人中心',
      icon: () => h('span', { class: 'i-mdi:account' }),
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: () => h('span', { class: 'i-mdi:logout' }),
    },
  ]

  /** 处理用户菜单选择 */
  const handleUserSelect = (key: string) => {
    if (key === 'profile') {
      router.push('/profile')
    } else if (key === 'logout') {
      userStore.logout()
    }
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
