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
    <div data-guide="search">
      <C_GlobalSearch :options="searchOptions" />
    </div>

    <!-- 操作按钮组：统一由组件解析器按需加载组件与样式 -->
    <div class="action-buttons">
      <!-- 通知中心 -->
      <div data-guide="notifications">
        <C_NotificationCenter :on-navigate="handleNavigate" />
      </div>

      <!-- 全屏 -->
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NButton
            text
            data-guide="fullscreen"
            aria-label="切换全屏"
            @click="toggleFullscreen"
            class="action-btn"
          >
            <span class="i-mdi-fullscreen"></span>
          </NButton>
        </template>
        <span>全屏</span>
      </NTooltip>

      <!-- 语言切换 -->
      <div data-guide="language">
        <C_Language
          :model-value="languageStore.currentLang"
          tooltip="语言切换"
          @change="languageStore.setLanguage"
        />
      </div>

      <!-- 主题切换 -->
      <div data-guide="theme">
        <C_Theme
          :model-value="themeStore.mode"
          @update:model-value="themeStore.setMode"
        />
      </div>

      <!-- 功能引导 -->
      <div data-guide="guide">
        <C_Guide
          ref="guideRef"
          :steps="guideSteps"
          :theme="{ overlayOpacity: themeStore.isDark ? 0.55 : 0.38 }"
          done-btn-text="开始使用"
          @error="message.error('引导加载失败，请重试')"
        />
      </div>

      <!-- 布局配置 -->
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NButton
            text
            data-guide="settings"
            aria-label="布局配置"
            @click="emit('update:showSettings', true)"
            class="action-btn"
          >
            <C_Icon
              name="mdi:settings-transfer-outline"
              :size="18"
              class="action-icon"
            />
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
    >
      <template #trigger>
        <div
          class="user-info"
          data-guide="workspace"
        >
          <div class="avatar-wrapper">
            <NAvatar
              round
              size="small"
              src="/robot-avatar.png"
            />
            <span class="status-dot status-online" />
          </div>
          <div class="user-dropdown">
            <span class="user-dropdown__identity">
              <span>{{ userName }}</span>
              <small v-if="userStore.activeContext">{{
                userStore.activeContext.companyName
              }}</small>
            </span>
            <span class="i-mdi-chevron-down dropdown-arrow"></span>
          </div>
        </div>
      </template>

      <!-- 用户面板 -->
      <div class="user-panel">
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
              <span class="i-mdi-shield-account text-xs"></span>
              {{ userRole }}
            </div>
            <div
              v-if="userEmail"
              class="user-panel__email"
            >
              <span class="i-mdi-email-outline text-xs"></span>
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

        <div
          v-if="userStore.activeContext"
          class="user-panel__context"
        >
          <span class="user-panel__context-label">当前工作空间</span>
          <strong>{{ userStore.activeContext.companyName }}</strong>
          <span
            >{{ userStore.activeContext.tenantName }} ·
            {{
              userStore.activeContext.isPrimary ? '主公司' : '兼任公司'
            }}</span
          >
          <button
            v-if="userStore.availableContexts.length > 1"
            type="button"
            @click="contextModalVisible = true"
          >
            切换公司
            <span
              class="i-mdi-arrow-right"
              aria-hidden="true"
            />
          </button>
        </div>

        <NDivider
          style="margin: 5px 0"
          :theme-overrides="{ color: 'var(--c-border)' }"
        />

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
            <span class="i-mdi-chevron-right user-panel__item-arrow"></span>
          </div>
        </div>

        <NDivider
          style="margin: 5px 0"
          :theme-overrides="{ color: 'var(--c-border)' }"
        />

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

        <NDivider
          style="margin: 5px 0"
          :theme-overrides="{ color: 'var(--c-border)' }"
        />

        <!-- 退出区 -->
        <div class="user-panel__section">
          <div
            class="user-panel__item user-panel__item--danger"
            @click="handleLogout"
          >
            <span class="i-mdi-logout user-panel__item-icon"></span>
            <span class="user-panel__item-label">退出登录</span>
          </div>
        </div>

        <!-- 底部版本信息 -->
        <div class="user-panel__footer">
          <a
            :href="buildInfoUrl"
            target="_blank"
            rel="noopener noreferrer"
            title="查看构建身份信息"
            >Robot Admin v{{ appVersion }} · 构建信息</a
          >
        </div>
      </div>
    </NPopover>

    <NModal
      v-model:show="contextModalVisible"
      preset="card"
      class="context-switch-modal"
      :style="{ width: 'min(480px, calc(100vw - 32px))' }"
      :bordered="false"
    >
      <ContextPicker
        :contexts="userStore.availableContexts"
        :active-context-id="userStore.activeContext?.id"
        :loading-context-id="switchingContextId"
        :tone="themeStore.isDark ? 'dark' : 'light'"
        title="切换工作空间"
        description="切换后会刷新权限、菜单与页面数据，避免沿用上一公司的内容。"
        @select="handleContextSwitch"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { s_userStore } from '@/stores/user'
  import { s_themeStore } from '@/stores/theme'
  import { s_languageStore } from '@/stores/language'
  import { s_permissionStore } from '@/stores/permission'
  import { switchAuthContextApi } from '@/api/auth'
  import { recordTelemetry } from '@/utils/d_telemetry'
  import { applyAuthSession } from '@/utils/d_authSession'
  import ContextPicker from '@/components/local/c_contextPicker/index.vue'
  import { s_settingsStore } from '@/stores/settings'
  import type { GuideExpose } from '@robot-admin/naive-ui-components/C_Guide'
  import { createWorkspaceGuideSteps } from './data'
  import type { GlobalSearchOptions } from '@robot-admin/naive-ui-components/C_GlobalSearch'
  import {
    createSearchMenuOptions,
    flattenMenuItems,
    findFirstChildKey,
  } from './d_searchMenu'
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
  const settingsStore = s_settingsStore()
  const router = useRouter()
  const route = useRoute()
  const dialog = useDialog()
  const message = useMessage()
  const contextModalVisible = ref(false)
  const switchingContextId = ref('')
  const guideRef = ref<GuideExpose>()
  const guideSteps = computed(() =>
    createWorkspaceGuideSteps(
      settingsStore.layoutMode,
      userStore.availableContexts.length > 1
    )
  )

  watch(
    () => route.fullPath,
    () => guideRef.value?.stopGuide()
  )

  // 用户名 / 角色 / 邮箱
  const userName = computed(() => userStore.userInfo?.username || '用户')
  const userRole = computed(
    () =>
      userStore.activeContext?.roles.map(role => role.name).join(' · ') ||
      userStore.userInfo.role ||
      '未配置角色'
  )
  const userEmail = computed(() => userStore.userInfo.email || '')
  const appVersion = packageJson.version
  const buildInfoUrl = `${import.meta.env.BASE_URL}build-info.json`

  // ==================== 用户面板菜单 ====================
  interface UserMenuItem {
    key: string
    label: string
    icon: string
    shortcut?: string
  }

  const primaryMenuItems: UserMenuItem[] = [
    { key: 'profile', label: '个人中心', icon: 'i-mdi-account-circle-outline' },
    { key: 'security', label: '安全设置', icon: 'i-mdi-shield-lock-outline' },
    { key: 'activity', label: '操作日志', icon: 'i-mdi-history' },
  ]

  const secondaryMenuItems: UserMenuItem[] = [
    {
      key: 'docs',
      label: '使用文档',
      icon: 'i-mdi-book-open-page-variant-outline',
    },
    {
      key: 'feedback',
      label: '反馈建议',
      icon: 'i-mdi-message-reply-text-outline',
    },
  ]

  /** 处理用户面板菜单点击 */
  const handleUserAction = (key: string) => {
    switch (key) {
      case 'profile':
        void router.push({ name: 'account-profile' }).catch(() => undefined)
        break
      case 'security':
        void router.push({ name: 'account-security' }).catch(() => undefined)
        break
      case 'activity':
        void router
          .push({ name: 'account-activity-log' })
          .catch(() => undefined)
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

  /** 请求已核验的目标公司会话；不在这里修改当前状态。 */
  const requestContextSwitchSession = async (contextId: string) => {
    const response = await switchAuthContextApi(
      contextId,
      userStore.userInfo.username || '',
      userStore.refreshToken
    )
    if (String(response.code) !== '0') {
      throw new Error(response.msg || '公司切换失败')
    }
    if (!response.data.activeContext || !response.data.availableContexts) {
      throw new Error('目标公司会话不完整')
    }
    return response
  }

  /** 切换前先请求新会话，成功后清理旧上下文并整页重建运行时。 */
  const handleContextSwitch = async (contextId: string) => {
    if (!contextId || switchingContextId.value) return
    if (contextId === userStore.activeContext?.id) return

    const tokenAtStart = userStore.token
    switchingContextId.value = contextId
    try {
      const response = await requestContextSwitchSession(contextId)
      if (tokenAtStart !== userStore.token) return
      applyAuthSession(response)
      recordTelemetry('company_switch')
      window.location.replace(router.resolve('/home').href)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '公司切换失败')
    } finally {
      switchingContextId.value = ''
    }
  }
  const searchMenuOptions = computed(() =>
    createSearchMenuOptions(permissionStore.showMenuListGet)
  )
  const searchItems = computed(() => flattenMenuItems(searchMenuOptions.value))
  const searchOptions: GlobalSearchOptions = {
    menuItems: () => searchItems.value,
    isDark: () => themeStore.isDark,
    /** 选中菜单项后跳转路由 */
    onSelect(key: string, hasChildren: boolean) {
      if (hasChildren) {
        const childKey = findFirstChildKey(key, searchMenuOptions.value)
        if (childKey) {
          void router.push(childKey).catch(() => undefined)
          return
        }
      }
      void router.push(key).catch(() => undefined)
    },
  }

  // ==================== 操作事件 ====================
  /** 通知中心 — 跳转到指定 URL */
  const handleNavigate = (url: string): void => {
    void router.push(url).catch(() => undefined)
  }

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
  @use './popover.scss';
</style>
