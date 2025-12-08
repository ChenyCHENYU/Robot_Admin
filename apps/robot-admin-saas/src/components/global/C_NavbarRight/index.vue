<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-12 13:51:41
 * @FilePath: \Robot_Admin\src\components\global\C_NavbarRight\index.vue
 * @Description: 统一的导航栏右侧操作区组件 - 所有布局共用
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="navbar-right">
    <!-- 全局搜索 -->
    <C_GlobalSearch />

    <!-- 操作按钮组 -->
    <div class="action-buttons">
      <template
        v-for="(item, index) in headerActions"
        :key="index"
      >
        <!-- 渲染自定义组件 -->
        <DynamicComponent
          v-if="item.type === 'component'"
          :name="item.componentName"
        />

        <!-- 渲染普通图标按钮 -->
        <NTooltip
          v-else
          placement="bottom"
          trigger="hover"
        >
          <template #trigger>
            <NButton
              text
              @click="item.action"
              class="action-btn"
            >
              <span :class="item.icon"></span>
            </NButton>
          </template>
          <span>{{ item.tooltip }}</span>
        </NTooltip>
      </template>
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
  import { computed, h } from 'vue'
  import { s_userStore } from '@/stores/user'
  import C_GlobalSearch from '@/components/global/C_GlobalSearch/index.vue'

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

  // 用户名
  const userName = computed(() => userStore.userInfo?.username || 'CHENY')

  // 头部操作按钮配置
  const headerActions = [
    {
      type: 'component',
      componentName: 'C_Notice',
    },
    {
      icon: 'i-mdi:fullscreen',
      tooltip: '全屏',
      action: () => {
        toggleFullscreen()
      },
    },
    {
      type: 'component',
      componentName: 'C_Language',
    },
    {
      type: 'component',
      componentName: 'C_Theme',
    },
    {
      type: 'component',
      componentName: 'C_Guide',
    },
    {
      icon: 'i-mdi:settings-transfer-outline',
      tooltip: '布局配置',
      action: () => {
        emit('update:showSettings', true)
      },
    },
  ]

  /**
   * 全屏切换
   */
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

  /**
   * 处理用户菜单选择
   */
  const handleUserSelect = (key: string) => {
    if (key === 'profile') {
      console.info('个人中心')
    } else if (key === 'logout') {
      userStore.logout()
    }
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
