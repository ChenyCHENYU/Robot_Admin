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
      :show-platform-title="true"
    />

    <!-- 微应用容器 -->
    <div class="micro-app-wrapper">
      <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
      <micro-app
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
      ></micro-app>

      <!-- 加载失败提示 -->
      <div
        v-else-if="loadError"
        class="error-placeholder"
      >
        <NResult
          status="error"
          title="子应用加载失败"
          :description="errorMessage"
        >
          <template #footer>
            <NButton @click="reloadApp"> 重新加载 </NButton>
            <NButton
              text
              @click="router.push('/portal')"
            >
              返回门户
            </NButton>
          </template>
        </NResult>
      </div>

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
  import { useRoute, useRouter } from 'vue-router'
  import { s_userStore } from '@/stores/user'
  import { getMicroAppUrl, getMicroAppConfig } from '@/config/microApps'
  import { useThemeStore } from '@/stores/theme'
  import C_Header from '@/components/global/C_Header/index.vue'
  import { formatTime } from '@/utils/d_route'
  import dayjs from 'dayjs'

  const route = useRoute()
  const router = useRouter()
  const userStore = s_userStore()
  const themeStore = useThemeStore()
  const message = useMessage()

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
  const loadError = ref(false)
  const errorMessage = ref('')

  // 使用环境变量配置获取子应用URL
  const appUrl = computed(() => {
    const url = getMicroAppUrl(appId.value)
    if (!url) {
      console.error(`[MicroApp] 未找到应用 ${appId.value} 的配置`)
    }
    return url
  })

  // 获取应用配置信息
  const appConfig = computed(() => getMicroAppConfig(appId.value))
  const currentApp = computed(() => appConfig.value)

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

    // 传递环境变量
    env: {
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.VITE_APP_BASE_URL || '',
      apiUrl: import.meta.env.VITE_APP_API_URL || '',
    },

    // 传递应用信息
    appInfo: {
      mainApp: 'Robot Admin',
      version: '1.11.0',
      timestamp: Date.now(),
    },

    // 🎯 核心优化：共享组件
    components: {
      // 导出头部组件
      Header: C_Header,
    },

    // 头部组件默认配置
    headerConfig: {
      showCollapse: false,
      showBreadcrumb: false,
      showTagsView: false,
      fullWidth: true,
      showLogo: true,
      showPortalButton: false,
      showPlatformTitle: true,
      showNavbarRight: true,
    },

    // 🔧 工具函数
    utils: {
      formatTime,
      dayjs,
      // 可以继续添加更多工具
    },

    // 📢 全局方法
    methods: {
      showMessage: (
        content: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'success'
      ) => {
        message[type](content)
      },
      navigateToMain: (path: string) => {
        router.push(path)
      },
    },
  }))

  // 监听子应用生命周期
  const handleMounted = () => {
    isLoading.value = false
  }

  const handleUnmount = () => {
    // 子应用卸载时的清理逻辑
  }

  const handleError = (e: CustomEvent) => {
    isLoading.value = false
    loadError.value = true
    errorMessage.value = `应用 ${appId.value} 加载失败，请检查应用地址是否正确或联系管理员`
    console.error(`[MicroApp] 子应用加载失败:`, e.detail)
    message.error(`子应用 ${appId.value} 加载失败`)
  }

  // 重新加载子应用
  const reloadApp = () => {
    loadError.value = false
    errorMessage.value = ''
    isLoading.value = true
    window.location.reload()
  }

  // 监听子应用数据变化（通过 micro-app 的 datachange 事件）
  const handleDataChange = () => {
    // 预留：处理子应用通过 microApp.dispatch 发送的消息
    // 当前主要使用 postMessage 进行通信
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

  // 处理路由导航
  const handleNavigate = (path: string) => {
    router.push(path).catch((err: Error) => {
      const ignoredErrors = [
        'redundant navigation',
        'Navigation cancelled',
        'Navigation aborted',
      ]
      if (!ignoredErrors.some(msg => err.message.includes(msg))) {
        console.error('路由跳转失败:', err)
      }
    })
  }

  // 处理自定义消息
  const handleCustomMessage = (payload: any, source: Window) => {
    console.log('📨 [主应用] 收到子应用消息:', payload)
    message.info(
      `收到来自 ${currentApp.value?.name || '子应用'} 的消息：${payload.message}`,
      { duration: 5000 }
    )
    sendAckToChild(source, 'CUSTOM_MESSAGE_ACK', {
      received: true,
      timestamp: Date.now(),
    })
  }

  // 处理数据更新
  const handleDataUpdate = (payload: any, source: Window) => {
    message.success(`收到 ${payload.module || '子应用'} 推送的数据更新`, {
      duration: 3000,
    })
    try {
      const existingData = JSON.parse(
        sessionStorage.getItem('microAppData') || '[]'
      )
      const newData = {
        module: payload.module,
        data: payload.data,
        timestamp: Date.now(),
      }
      existingData.unshift(newData)
      const dataToSave = existingData.slice(0, 10)
      sessionStorage.setItem('microAppData', JSON.stringify(dataToSave))
      window.dispatchEvent(
        new CustomEvent('microAppDataUpdate', { detail: dataToSave })
      )
    } catch (error) {
      console.error('[主应用] 存储数据失败:', error)
    }
    sendAckToChild(source, 'DATA_UPDATE_ACK', {
      received: true,
      timestamp: Date.now(),
    })
  }

  // 监听来自 iframe 子应用的 postMessage（用于子应用请求路由跳转）
  const handlePostMessage = (event: MessageEvent) => {
    const { type, payload } = event.data || {}
    const source = event.source as Window

    switch (type) {
      case 'MICRO_APP_NAVIGATE':
        handleNavigate(payload.path)
        break
      case 'CUSTOM_MESSAGE':
        handleCustomMessage(payload, source)
        break
      case 'DATA_UPDATE':
        handleDataUpdate(payload, source)
        break
      case 'MOUNTED':
        console.log('✅ [主应用] 子应用已挂载:', payload)
        break
      case 'ROUTE_CHANGE':
        console.log('🔀 [主应用] 子应用路由变化:', payload)
        break
    }
  }

  /**
   * 向子应用回传确认消息
   */
  const sendAckToChild = (childWindow: Window, type: string, payload: any) => {
    childWindow.postMessage({ type, payload }, '*')
    console.log('✅ [主应用] 回传确认给子应用:', type)
  }

  // 生命周期：添加和移除 postMessage 监听
  onMounted(() => {
    window.addEventListener('message', handlePostMessage)
  })

  onUnmounted(() => {
    window.removeEventListener('message', handlePostMessage)
  })
</script>

<style scoped lang="scss">
  .micro-app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  }

  .micro-app-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: #ffffff;
    min-height: 0;
  }

  :deep(micro-app) {
    display: block;
    width: 100%;
    height: 100%;

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  }

  .loading-placeholder,
  .error-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }

  .error-placeholder {
    :deep(.n-result) {
      .n-result-footer {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }
</style>
