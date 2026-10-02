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
        ref="microAppElement"
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
        v-else-if="loadError || !appUrl"
        class="error-placeholder"
      >
        <NResult
          status="error"
          title="子应用加载失败"
          :description="errorMessage || '未配置有效的子应用 HTTPS 地址，请检查 VITE_MICRO_LOGISTICS_URL。'"
        >
          <template #footer>
            <NButton v-if="appUrl" @click="reloadApp"> 重新加载 </NButton>
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
  import { s_themeStore } from '@/stores/theme'
  import packageJson from '../../../package.json'
  import C_Header from '@/components/global/C_Header/index.vue'
  import { MESSAGE_TYPES, CUSTOM_EVENTS, STORAGE_KEYS } from '@shared/constants'

  const route = useRoute()
  const router = useRouter()
  const userStore = s_userStore()
  const themeStore = s_themeStore()
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
  const microAppElement = ref<HTMLElement | null>(null)

  // 使用环境变量配置获取子应用URL
  const appUrl = computed(() => {
    const url = getMicroAppUrl(appId.value)
    return url
  })

  // 获取应用配置信息
  const currentApp = computed(() => getMicroAppConfig(appId.value))

  // 传递给子应用的数据
  const appData = computed(() => ({
    // 传递认证信息
    token: userStore.token,
    userInfo: JSON.parse(JSON.stringify(userStore.userInfo ?? null)),

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
      version: packageJson.version,
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

    // iframe data must remain serializable; navigation and notices use validated messages.
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
  const handleCustomMessage = (payload: { message: string }, source: Window, origin: string) => {
    message.info(
      `收到来自 ${currentApp.value?.name || '子应用'} 的消息：${payload.message}`,
      { duration: 5000 }
    )
    sendAckToChild(source, origin, MESSAGE_TYPES.CUSTOM_MESSAGE_ACK, {
      received: true,
      timestamp: Date.now(),
    })
  }

  // 处理数据更新
  const handleDataUpdate = (payload: { module?: string; data: unknown }, source: Window, origin: string) => {
    try {
      if (JSON.stringify(payload.data).length > 65_536) return
    } catch {
      return
    }
    message.success(`收到 ${payload.module || '子应用'} 推送的数据更新`, {
      duration: 3000,
    })
    try {
      const parsed = JSON.parse(
        sessionStorage.getItem(STORAGE_KEYS.MICRO_APP_DATA) || '[]'
      )
      const existingData: unknown[] = Array.isArray(parsed) ? parsed : []
      const newData = {
        module: payload.module,
        data: payload.data,
        timestamp: Date.now(),
      }
      existingData.unshift(newData)
      const dataToSave = existingData.slice(0, 10)
      sessionStorage.setItem(
        STORAGE_KEYS.MICRO_APP_DATA,
        JSON.stringify(dataToSave)
      )
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENTS.MICRO_APP_DATA_UPDATE, {
          detail: dataToSave,
        })
      )
    } catch (error) {
      console.error('[主应用] 存储数据失败:', error)
    }
    sendAckToChild(source, origin, MESSAGE_TYPES.DATA_UPDATE_ACK, {
      received: true,
      timestamp: Date.now(),
    })
  }

  const isMessageFromFrame = (frame: HTMLIFrameElement | null | undefined, event: MessageEvent) => {
    if (!frame || event.source !== frame.contentWindow) return false
    try {
      return event.origin === new URL(frame.src, window.location.href).origin
    } catch {
      return false
    }
  }

  const getTrustedFrame = (event: MessageEvent): HTMLIFrameElement | undefined => {
    const element = microAppElement.value
    const sandbox = document.getElementById(appId.value)
    const candidates = [
      element?.querySelector('iframe'),
      element?.shadowRoot?.querySelector('iframe'),
      sandbox instanceof HTMLIFrameElement && sandbox.hasAttribute('powered-by') ? sandbox : null,
    ]
    return candidates.find(candidate => isMessageFromFrame(candidate, event)) ?? undefined
  }

  const dispatchChildMessage = (type: string, payload: unknown, source: Window, origin: string) => {
    switch (type) {
      case MESSAGE_TYPES.MICRO_APP_NAVIGATE:
        if (isSafeMainPath(payload)) handleNavigate(payload.path)
        break
      case MESSAGE_TYPES.CUSTOM_MESSAGE:
        dispatchCustomMessage(payload, source, origin)
        break
      case MESSAGE_TYPES.DATA_UPDATE:
        dispatchDataUpdate(payload, source, origin)
        break
    }
  }

  const dispatchCustomMessage = (payload: unknown, source: Window, origin: string) => {
    if (isRecord(payload) && typeof payload.message === 'string' && payload.message.length <= 500)
      handleCustomMessage({ message: payload.message }, source, origin)
  }

  const dispatchDataUpdate = (payload: unknown, source: Window, origin: string) => {
    if (isRecord(payload) && (!payload.module || (typeof payload.module === 'string' && payload.module.length <= 100)))
      handleDataUpdate({ module: payload.module as string | undefined, data: payload.data }, source, origin)
  }

  // micro-app's iframe sandbox lives in document.body, not under the custom element.
  const handlePostMessage = (event: MessageEvent) => {
    if (!appUrl.value) return
    const frame = getTrustedFrame(event)
    if (!frame) return
    if (!event.data || typeof event.data !== 'object' || Array.isArray(event.data)) return
    const { type, payload } = event.data as { type?: string; payload?: unknown }
    const source = frame.contentWindow
    if (source && typeof type === 'string') dispatchChildMessage(type, payload, source, event.origin)
  }

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value)

  const isSafeMainPath = (value: unknown): value is { path: string } =>
    isRecord(value) && typeof value.path === 'string' &&
    value.path.startsWith('/') && !value.path.startsWith('//') &&
    !value.path.includes('\\') && value.path.length <= 2048

  /**
   * 向子应用回传确认消息
   */
  const sendAckToChild = (childWindow: Window, origin: string, type: string, payload: unknown) => {
    childWindow.postMessage({ type, payload }, origin)
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
    background: var(--app-bg-layout);
  }

  .micro-app-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: var(--app-bg-content);
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
    background: var(--app-bg-content);
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
