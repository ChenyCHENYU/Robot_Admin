<template>
  <NLayoutHeader
    bordered
    position="absolute"
    :class="[
      'layout-header',
      isLightTheme ? 'light-theme' : 'dark-theme',
      'h-100px px-20px flex flex-col items-center top-0 left-0 right-0 z-1000',
    ]"
  >
    <!--* 头部 - 上方 -->
    <div class="header-top h56px w-full">
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
        <C_Breadcrumb />

        <C_GlobalSearch />

        <!-- 右侧：操作区 -->
        <div
          id="guide-actions"
          class="w-220px flex items-center justify-end gap-4 mr16px"
        >
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
                >
                  <span :class="item.icon"></span>
                </NButton>
              </template>
              <span>{{ item.tooltip }}</span>
            </NTooltip>
          </template>
        </div>

        <!-- 右侧：用户信息 -->
        <div class="flex items-center gap-2">
          <NAvatar
            round
            size="small"
            src="/robot-avatar.png"
          />
          <NDropdown
            size="small"
            :options="userOptions"
            @select="handleSelect"
          >
            <div class="flex items-center cursor-pointer">
              <span>CHENY</span>
              <span class="i-mdi:chevron-down"></span>
            </div>
          </NDropdown>
        </div>
      </div>
    </div>

    <!--* 头部 - 下方 -->
    <div class="header-bottom h44px w-full flex items-end">
      <C_TagsView />
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  import { s_userStore } from '@/stores/user'

  defineOptions({ name: 'C_Header' })
  defineProps({
    isLightTheme: {
      type: Boolean,
      default: true,
    },
  })

  interface MenuCollapse {
    isCollapsed: Ref<boolean>
    handleCollapsedChange: (collapsed: boolean) => void
  }

  const { isCollapsed, handleCollapsedChange } =
    inject<MenuCollapse>('menuCollapse')!

  const headerActions = [
    {
      type: 'component',
      componentName: 'C_Notice',
    },
    {
      icon: 'i-mdi:fullscreen',
      tooltip: '全屏',
      action: () => {
        // 全屏切换逻辑
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
        // 布局配置逻辑
      },
    },
  ]

  /**
   * * @description: 全屏切换函数示例
   * ! @return {*} {void}
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // 用户菜单选项
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

  const handleSelect = (key: string) => {
    if (key === 'profile') {
      // router.push('/profile')
      console.info('个人中心')
    } else if (key === 'logout') {
      s_userStore().logout()
    }
  }
</script>
