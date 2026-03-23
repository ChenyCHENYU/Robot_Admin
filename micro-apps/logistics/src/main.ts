import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupRouter } from './router'
import { setupMicroApp } from './microApp'
import App from './App.vue'
// @ts-ignore - TypeScript无法识别.scss文件类型声明
import './styles/index.scss'

console.log('🚀 物流应用初始化开始...')

const app = createApp(App)

// 状态管理
app.use(createPinia())

// 路由
const router = setupRouter(app)

// 🎯 核心优化：注册主应用共享的组件
if (window.__MICRO_APP_ENVIRONMENT__) {
  const mainAppData = window.microApp?.getData() || {}

  // 全局注册头部组件
  if (mainAppData.components?.Header) {
    app.component('SharedHeader', mainAppData.components.Header)
    console.log('✅ 已注册主应用共享头部组件')
  }

  // 注入全局工具
  if (mainAppData.utils) {
    app.config.globalProperties.$utils = mainAppData.utils
    console.log('✅ 已注入全局工具函数')
  }

  // 注入全局方法
  if (mainAppData.methods) {
    app.config.globalProperties.$mainApp = mainAppData.methods
    console.log('✅ 已注入主应用全局方法')
  }
}

// 微前端通信初始化
setupMicroApp(app, router)

app.mount('#app')

console.log('✅ 智慧物流管理系统已启动 - Port: 3003')
console.log('📍 当前路由:', router.currentRoute.value.path)
console.log('🔗 微前端环境:', !!window.__MICRO_APP_ENVIRONMENT__)
