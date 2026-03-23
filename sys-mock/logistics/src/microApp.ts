/**
 * 微前端通信配置
 * 处理主应用和子应用之间的数据交互
 */
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { useAppStore } from './stores/app'
import { MESSAGE_TYPES, CUSTOM_EVENTS } from '@shared/constants'

// 声明全局类型
declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean
    __MICRO_APP_NAME__?: string
    __MICRO_APP_PUBLIC_PATH__?: string
    microApp?: {
      getData: () => any
      dispatch: (data: any) => void
      addDataListener: (callback: (data: any) => void) => void
      removeDataListener: (callback: (data: any) => void) => void
      router?: any
    }
    rawWindow?: Window
  }
}

/**
 * 初始化微前端通信
 */
export function setupMicroApp(app: App, router: Router) {
  const appStore = useAppStore()

  // 判断是否在微前端环境中
  if (window.__MICRO_APP_ENVIRONMENT__) {
    console.log('🔗 子应用运行在微前端环境中')

    // 1. 接收主应用传递的初始数据
    const mainAppData = window.microApp?.getData()
    if (mainAppData) {
      handleMainAppData(mainAppData, appStore)
    }

    // 2. 监听主应用数据变化
    const dataListener = (data: any) => {
      console.log('📥 收到主应用数据:', data)
      handleMainAppData(data, appStore)
    }

    window.microApp?.addDataListener(dataListener)

    // 3. 监听主应用的确认消息（iframe模式）
    if (window !== window.parent) {
      window.addEventListener('message', handleMainAppAck)
    }

    // 4. 向主应用发送初始化完成消息
    setTimeout(() => {
      sendMessageToMainApp({
        type: MESSAGE_TYPES.MOUNTED,
        payload: {
          name: '智慧物流管理系统',
          version: '1.0.0',
          timestamp: Date.now(),
        },
      })
    }, 500)

    // 4. 路由同步（可选）
    router.afterEach(to => {
      sendMessageToMainApp({
        type: MESSAGE_TYPES.ROUTE_CHANGE,
        payload: {
          path: to.path,
          name: to.name,
        },
      })
    })

    // 5. 卸载时清理监听器
    app.unmount = () => {
      window.microApp?.removeDataListener(dataListener)
    }
  } else {
    console.log('🖥️ 子应用独立运行')
  }
}

/**
 * 处理主应用的确认消息
 */
function handleMainAppAck(event: MessageEvent) {
  const { type, payload } = event.data || {}

  // 触发自定义事件，让 Vue 组件处理
  switch (type) {
    case MESSAGE_TYPES.CUSTOM_MESSAGE_ACK:
      console.log('✅ [子应用] 主应用已确认收到消息:', payload)
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENTS.MAIN_APP_ACK, {
          detail: { type: 'message', payload },
        })
      )
      break

    case MESSAGE_TYPES.DATA_UPDATE_ACK:
      console.log('✅ [子应用] 主应用已确认收到数据:', payload)
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENTS.MAIN_APP_ACK, {
          detail: { type: 'data', payload },
        })
      )
      break
  }
}

/**
 * 处理主应用传递的数据
 */
function handleMainAppData(data: any, appStore: any) {
  // 同步认证信息
  if (data.token) {
    appStore.setToken(data.token)
    console.log('✅ 已同步主应用 Token')
  }

  if (data.userInfo) {
    appStore.setUserInfo(data.userInfo)
    console.log('✅ 已同步主应用用户信息:', data.userInfo)
  }

  // 同步主题信息
  if (data.theme) {
    appStore.setTheme(data.theme)
    console.log('✅ 已同步主应用主题:', data.theme.mode)
  }

  // 处理其他自定义消息
  if (data.type) {
    switch (data.type) {
      case MESSAGE_TYPES.THEME_CHANGE:
        appStore.setTheme(data.payload)
        break
      case MESSAGE_TYPES.LOGOUT:
        appStore.clearAuth()
        break
      case MESSAGE_TYPES.CUSTOM_MESSAGE:
        console.log('📨 自定义消息:', data.payload)
        break
    }
  }
}

/**
 * 向主应用发送消息
 */
export function sendMessageToMainApp(data: any) {
  // iframe 模式：使用 postMessage
  if (window !== window.parent) {
    window.parent.postMessage(data, '*')
    console.log('📤 [iframe] 发送消息到主应用:', data)
  }
  // 非 iframe 的 micro-app 模式：使用 dispatch
  else if (window.__MICRO_APP_ENVIRONMENT__ && window.microApp) {
    window.microApp.dispatch(data)
    console.log('📤 [micro-app] 发送消息到主应用:', data)
  } else {
    console.warn('⚠️ 当前不在微前端环境中，无法发送消息')
  }
}

/**
 * 跳转到主应用路由
 */
export function navigateToMainApp(path: string) {
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // iframe 模式：使用 postMessage 发送 MICRO_APP_NAVIGATE
  if (window !== window.parent) {
    window.parent.postMessage(
      {
        type: MESSAGE_TYPES.MICRO_APP_NAVIGATE,
        payload: { path: normalizedPath },
      },
      '*'
    )
    console.log('🔀 [iframe] 请求跳转到主应用:', normalizedPath)
  }
  // 非 iframe 模式
  else {
    sendMessageToMainApp({
      type: MESSAGE_TYPES.NAVIGATE,
      payload: { path: normalizedPath },
    })
  }
}
