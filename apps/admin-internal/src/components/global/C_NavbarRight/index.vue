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
    <NPopover
      trigger="click"
      placement="bottom-end"
      :show-arrow="false"
      raw
      :style="{ padding: 0 }"
      class="user-popover-container"
    >
      <template #trigger>
        <div class="user-info">
          <div class="avatar-wrapper">
            <NAvatar
              round
              size="small"
              src="/robot-avatar.png"
            />
            <span class="status-dot status-online" />
          </div>
          <div class="user-dropdown">
            <span>{{ userName }}</span>
            <span class="i-mdi:chevron-down dropdown-arrow"></span>
          </div>
        </div>
      </template>

      <!-- 用户面板 -->
      <div
        class="user-panel"
        :class="{ 'user-panel--dark': themeStore.isDark }"
      >
        <!-- 用户卡片区 -->
        <div class="user-panel__header">
          <NAvatar
            round
            :size="40"
            src="/robot-avatar.png"
          />
          <div class="user-panel__info">
            <div class="user-panel__name">{{ userName }}</div>
            <div class="user-panel__role">
              <span class="i-mdi:shield-account text-xs"></span>
              {{ userRole }}
            </div>
            <div class="user-panel__email">
              <span class="i-mdi:email-outline text-xs"></span>
              {{ userEmail }}
            </div>
          </div>
          <div class="user-panel__status">
            <NTag
              :type="'success'"
              size="tiny"
              round
            >
              <template #icon>
                <span class="status-dot-inline status-online" />
              </template>
              在线
            </NTag>
          </div>
        </div>

        <NDivider style="margin: 5px 0" />

        <!-- 功能区 -->
        <div class="user-panel__section">
          <div
            v-for="item in primaryMenuItems"
            :key="item.key"
            class="user-panel__item"
            @click="handleUserAction(item.key)"
          >
            <span
              :class="item.icon"
              class="user-panel__item-icon"
            ></span>
            <span class="user-panel__item-label">{{ item.label }}</span>
            <span class="i-mdi:chevron-right user-panel__item-arrow"></span>
          </div>
        </div>

        <NDivider style="margin: 5px 0" />

        <!-- 辅助区 -->
        <div class="user-panel__section">
          <div
            v-for="item in secondaryMenuItems"
            :key="item.key"
            class="user-panel__item"
            @click="handleUserAction(item.key)"
          >
            <span
              :class="item.icon"
              class="user-panel__item-icon"
            ></span>
            <span class="user-panel__item-label">{{ item.label }}</span>
            <span
              v-if="item.shortcut"
              class="user-panel__item-shortcut"
              >{{ item.shortcut }}</span
            >
          </div>
        </div>

        <NDivider style="margin: 5px 0" />

        <!-- 退出区 -->
        <div class="user-panel__section">
          <div
            class="user-panel__item user-panel__item--danger"
            @click="handleLogout"
          >
            <span class="i-mdi:logout user-panel__item-icon"></span>
            <span class="user-panel__item-label">退出登录</span>
          </div>
        </div>

        <!-- 底部版本信息 -->
        <div class="user-panel__footer"> Robot Admin v{{ appVersion }} </div>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import { s_userStore } from '@/stores/user'
  import { s_themeStore } from '@/stores/theme'
  import { s_languageStore } from '@/stores/language'
  import { s_permissionStore } from '@/stores/permission'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import {
    C_GlobalSearch,
    C_NotificationCenter,
    C_Language,
    C_Theme,
    C_Guide,
    createMenuOptions,
    type GlobalSearchOptions,
    type SearchMenuItem,
    type GuideStep,
  } from '@robot-admin/naive-ui-components'
  import type { MenuOption } from 'naive-ui/es'
  import packageJson from '../../../../package.json'

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
  const themeStore = s_themeStore()
  const languageStore = s_languageStore()
  const permissionStore = s_permissionStore()
  const router = useRouter()
  const dialog = useDialog()

  // 用户名 / 角色 / 邮箱
  const userName = computed(() => userStore.userInfo?.username || 'CHENY')
  const userRole = computed(
    () => (userStore.userInfo as any)?.role || '系统管理员'
  )
  const userEmail = computed(
    () => (userStore.userInfo as any)?.email || 'ycyplus@gmail.com'
  )
  const appVersion = packageJson.version

  // ==================== 用户面板菜单 ====================
  interface UserMenuItem {
    key: string
    label: string
    icon: string
    shortcut?: string
  }

  const primaryMenuItems: UserMenuItem[] = [
    { key: 'profile', label: '个人中心', icon: 'i-mdi:account-circle-outline' },
    { key: 'security', label: '安全设置', icon: 'i-mdi:shield-lock-outline' },
    { key: 'activity', label: '操作日志', icon: 'i-mdi:history' },
  ]

  const secondaryMenuItems: UserMenuItem[] = [
    {
      key: 'docs',
      label: '使用文档',
      icon: 'i-mdi:book-open-page-variant-outline',
    },
    {
      key: 'feedback',
      label: '反馈建议',
      icon: 'i-mdi:message-reply-text-outline',
    },
  ]

  /** 处理用户面板菜单点击 */
  const handleUserAction = (key: string) => {
    switch (key) {
      case 'profile':
        router.push({ name: 'account-profile' })
        break
      case 'security':
        router.push({ name: 'account-security' })
        break
      case 'activity':
        router.push({ name: 'account-activity-log' })
        break
      case 'docs':
        window.open(
          'https://www.tzagileteam.com/robot/guide/overview',
          '_blank'
        )
        break
      case 'feedback':
        window.open(
          'https://github.com/ChenyCHENYU/Robot_Admin/issues',
          '_blank'
        )
        break
    }
  }

  /** 退出登录（带确认） */
  const handleLogout = () => {
    dialog.warning({
      title: '确认退出',
      content: '确定要退出登录吗？退出后需要重新登录。',
      positiveText: '确认退出',
      negativeText: '取消',
      onPositiveClick: () => {
        userStore.logout()
      },
    })
  }
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
    const normalized = createMenuOptions(
      permissionStore.showMenuListGet as any[],
      {
        labelFormatter: translateRouteTitle,
      }
    )
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
      flattenMenuItems(
        createMenuOptions(permissionStore.showMenuListGet as any[], {
          labelFormatter: translateRouteTitle,
        })
      ),
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
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>

<!-- NPopover raw 内容被 teleport 到 body，scoped 样式无法覆盖，需要独立 style 块 -->
<style lang="scss">
  .user-panel {
    width: 240px;
    background: #fff;
    border-radius: 10px;
    box-shadow:
      0 6px 24px rgba(0, 0, 0, 0.08),
      0 1px 4px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    font-size: 13px;
    color: #1f2937;
    animation: user-panel-enter 0.18s cubic-bezier(0.4, 0, 0.2, 1);

    // ---------- 暗色模式 ----------
    &--dark {
      background: #1e1e2e;
      color: #e5e7eb;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.3),
        0 2px 8px rgba(0, 0, 0, 0.2);

      .user-panel__header {
        background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
      }

      .user-panel__name {
        color: #f3f4f6;
      }
      .user-panel__role,
      .user-panel__email {
        color: #c4b5fd;
      }

      .user-panel__item {
        color: #d1d5db;

        &:hover {
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
        }

        &--danger {
          color: #fca5a5 !important;

          &:hover {
            background: rgba(239, 68, 68, 0.12) !important;
            color: #fca5a5 !important;
          }
        }
      }

      .user-panel__item-arrow,
      .user-panel__item-icon {
        color: #6b7280;
      }
      .user-panel__item:hover .user-panel__item-icon {
        color: #a5b4fc;
      }

      .user-panel__item-shortcut {
        background: #374151;
        color: #9ca3af;
        border-color: #4b5563;
      }

      .user-panel__footer {
        background: #16162a;
        color: #6b7280;
      }

      .n-divider {
        --n-color: rgba(255, 255, 255, 0.06) !important;
      }
    }

    // ---------- 用户卡片头部 ----------
    &__header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      position: relative;
    }

    &__info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    &__name {
      font-size: 13.5px;
      font-weight: 600;
      color: #111827;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__role,
    &__email {
      font-size: 11px;
      color: #6366f1;
      display: flex;
      align-items: center;
      gap: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__email {
      color: #6b7280;
    }

    &__status {
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: 1px;
    }

    // ---------- 菜单区块 ----------
    &__section {
      padding: 3px 6px;
    }

    &__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      border-radius: 6px;
      cursor: pointer;
      color: #374151;
      transition: all 0.18s ease;
      user-select: none;

      &:hover {
        background: rgba(99, 102, 241, 0.08);
        color: #6366f1;

        .user-panel__item-icon {
          color: #6366f1;
        }

        .user-panel__item-arrow {
          opacity: 1;
          transform: translateX(2px);
        }
      }

      &:active {
        transform: scale(0.98);
      }

      // 危险操作（退出登录）
      &--danger {
        color: #ef4444 !important;

        .user-panel__item-icon {
          color: #ef4444 !important;
        }

        &:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #dc2626 !important;

          .user-panel__item-icon {
            color: #dc2626 !important;
          }
        }
      }
    }

    &__item-icon {
      font-size: 15px;
      color: #6b7280;
      flex-shrink: 0;
      transition: color 0.18s ease;
    }

    &__item-label {
      flex: 1;
      font-size: 12.5px;
      line-height: 1;
    }

    &__item-arrow {
      font-size: 14px;
      color: #d1d5db;
      flex-shrink: 0;
      opacity: 0;
      transition: all 0.18s ease;
    }

    &__item-shortcut {
      font-size: 10px;
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
      padding: 1px 5px;
      border-radius: 3px;
      background: #f3f4f6;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      line-height: 1;
    }

    // ---------- 底部版本信息 ----------
    &__footer {
      padding: 6px 14px;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      background: #fafafa;
      border-top: 1px solid #f3f4f6;
      letter-spacing: 0.3px;
    }

    // ---------- NDivider 微调 ----------
    .n-divider {
      --n-color: #f0f0f0 !important;
    }
  }

  @keyframes user-panel-enter {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
