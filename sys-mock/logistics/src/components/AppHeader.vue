<!--
 * @Description: 应用头部 - 样式复用主应用 C_Header
-->
<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左侧 -->
      <div class="header-left">
        <div class="header-logo">
          <span class="logo-icon">🚚</span>
          <span class="logo-text">智慧物流管理系统</span>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="header-right">
        <!-- 主题切换 -->
        <NTooltip>
          <template #trigger>
            <NButton
              text
              @click="toggleTheme"
            >
              <span style="font-size: 18px">
                {{ appStore.theme.isDark ? '☀️' : '🌙' }}
              </span>
            </NButton>
          </template>
          {{ appStore.theme.isDark ? '切换到亮色模式' : '切换到暗色模式' }}
        </NTooltip>

        <!-- 用户信息 -->
        <div
          v-if="appStore.userInfo.nickname"
          class="user-info"
        >
          <NAvatar
            size="small"
            :src="appStore.userInfo.avatar"
          >
            {{ appStore.userInfo.nickname?.charAt(0) }}
          </NAvatar>
          <span class="user-name">{{ appStore.userInfo.nickname }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { useAppStore } from '../stores/app'

  const appStore = useAppStore()

  const toggleTheme = () => {
    const newMode = appStore.theme.isDark ? 'light' : 'dark'
    appStore.setTheme({
      mode: newMode,
      isDark: newMode === 'dark',
    })
  }
</script>

<style lang="scss" scoped>
  .app-header {
    height: 60px;
    background: var(--app-bg-card);
    border-bottom: 1px solid var(--app-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .header-content {
      height: 100%;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      color: var(--app-text-primary);

      .logo-icon {
        font-size: 24px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--app-bg-hover);

      .user-name {
        font-size: 14px;
        color: var(--app-text-primary);
      }
    }
  }
</style>
