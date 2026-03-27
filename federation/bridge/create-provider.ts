/*
 * @Description: Vue Bridge — Provider 端封装
 * 将一个完整的 Vue 应用（含路由、插件）封装为可被其他应用消费的联邦模块
 *
 * 使用场景：当某个应用需要作为 Provider 暴露整个应用（而非单个组件）时
 * 例如：logistics 子应用将自己的物流模块暴露给第三方系统
 *
 * @example
 * // sub-apps/logistics/src/export-app.ts
 * import App from './App.vue'
 * import router from './router'
 * import { createFederationProvider } from '@federation/bridge'
 *
 * export default createFederationProvider({
 *   rootComponent: App,
 *   appOptions: ({ app }) => {
 *     app.use(pinia)
 *     return { router }
 *   },
 * })
 */

import { createBridgeComponent } from '@module-federation/bridge-vue3'
import type { App, Component } from 'vue'
import type { Router } from 'vue-router'

export interface FederationProviderOptions {
  /** Vue 根组件 */
  rootComponent: Component
  /** 应用选项回调 — 在挂载前注入插件、路由等 */
  appOptions?: (params: {
    app: App<Component>
    basename?: string
    memoryRoute?: { entryPath: string }
    [key: string]: any
  }) => { router?: Router } | void
}

/**
 * 创建联邦 Provider 组件
 * 封装 @module-federation/bridge-vue3 的 createBridgeComponent
 */
export function createFederationProvider(options: FederationProviderOptions) {
  return createBridgeComponent({
    rootComponent: options.rootComponent,
    appOptions: options.appOptions!,
  })
}
