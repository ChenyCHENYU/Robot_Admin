<!--
 * @Description: 微应用容器页面 - 加载子应用
 * @Author: ChenYu
 * @Date: 2025-12-19
-->
<template>
  <div class="micro-app-container">
    <!-- 使用统一的 C_Header 组件 -->
    <C_Header
      :show-collapse="false"
      :show-breadcrumb="false"
      :show-tags-view="false"
      :full-width="true"
      :show-logo="true"
      :show-portal-button="true"
    />

    <!-- 微应用容器 -->
    <div class="micro-app-wrapper">
      <MicroApp
        v-if="appUrl"
        :name="appId"
        :url="appUrl"
        :data="appData"
        iframe
        keep-alive
        @mounted="handleMounted"
        @unmount="handleUnmount"
        @error="handleError"
        @datachange="handleDataChange"
      ></MicroApp>

      <!-- 加载中状态 -->
      <div
        v-else
        class="loading-placeholder"
      >
        <NSpin size="large">
          <template #description> 正在加载子应用... </template>
        </NSpin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { provide } from 'vue'
  import { useRoute } from 'vue-router'
  import { s_userStore } from '@/stores/user'
  import { useThemeStore } from '@/stores/theme'
  import C_Header from '@/components/global/C_Header/index.vue'

  const route = useRoute()
  const userStore = s_userStore()
  const themeStore = useThemeStore()

  // 为 C_Header 提供必要的上下文
  const isCollapsed = ref(false)
  const handleCollapsedChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }

  provide('menuCollapse', {
    isCollapsed,
    handleCollapsedChange,
  })

  const appId = computed(() => route.params.id as string)
  const isLoading = ref(true)

  // 系统配置映射
  const systemsMap: Record<string, any> = {
    'data-analytics': {
      id: 'data-analytics',
      name: '数据分析平台',
      icon: '📊',
      url: 'http://localhost:3002',
      baseroute: '/data-analytics',
    },
    logistics: {
      id: 'logistics',
      name: '物流管理系统',
      icon: '🚚',
      url: 'http://localhost:3003',
      baseroute: '/logistics',
    },
    crm: {
      id: 'crm',
      name: '客户关系管理',
      icon: '👥',
      url: 'http://localhost:3004',
      baseroute: '/crm',
    },
  }

  const currentApp = computed(() => systemsMap[appId.value])
  const appUrl = computed(() => currentApp.value?.url)

  // 传递给子应用的数据
  const appData = computed(() => ({
    // 传递认证信息
    token: userStore.token,
    userInfo: userStore.userInfo,

    // 传递主题信息
    theme: {
      mode: themeStore.mode,
      isDark: themeStore.isDark,
    },

    // 传递应用信息
    appInfo: {
      mainApp: 'Robot Admin',
      version: '1.11.0',
      timestamp: Date.now(),
    },
  }))

  // 监听子应用挂载
  const handleMounted = () => {
    isLoading.value = false
    console.log(`✅ [主应用] 子应用 ${appId.value} 已挂载`)
  }

  // 监听子应用卸载
  const handleUnmount = () => {
    console.log(`🔄 [主应用] 子应用 ${appId.value} 已卸载`)
  }

  // 监听子应用错误
  const handleError = (e: CustomEvent) => {
    isLoading.value = false
    console.error(`❌ [主应用] 子应用 ${appId.value} 加载失败:`, e.detail)
  }

  // 监听子应用数据变化
  const handleDataChange = (e: CustomEvent) => {
    console.log(
      `📨 [主应用] 接收到子应用 ${appId.value} 的数据:`,
      e.detail.data
    )

    // 处理子应用发送的消息
    const { type, data } = e.detail.data

    switch (type) {
      case 'CHILD_APP_MOUNTED':
        console.log(`收到消息: ${data.appName} 已启动`)
        break
      case 'CHILD_MESSAGE':
        console.log(`子应用消息: ${data.message}`)
        break
      default:
        console.log('未处理的消息类型:', type)
    }
  }

  // 监听主题变化，同步给子应用
  watch(
    () => themeStore.mode,
    newMode => {
      if (window.microApp) {
        window.microApp.setData(appId.value, {
          ...appData.value,
          theme: {
            mode: newMode,
            isDark: newMode === 'dark',
          },
        })
      }
    }
  )
</script>

<style scoped lang="scss">
  .micro-app-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  }

  .micro-app-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  micro-app {
    width: 100%;
    height: 100%;
  }

  .loading-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }
</style>
