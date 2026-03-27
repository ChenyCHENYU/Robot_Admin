/*
 * @Description: Vue Bridge — Consumer 端封装
 * 在 Host 应用中加载一个完整的远程 Vue 应用（含路由、插件）
 *
 * 使用场景：当需要在主应用中嵌入一个完整的远程子应用时
 *
 * @example
 * // 主应用 router/index.ts
 * import { createFederationConsumer } from '@federation/bridge'
 *
 * const RemoteLogistics = createFederationConsumer({
 *   loader: () => loadRemote('logistics/export-app'),
 *   rootAttrs: { class: 'logistics-container' },
 * })
 *
 * const routes = [
 *   { path: '/logistics/:pathMatch(.*)*', component: RemoteLogistics },
 * ]
 */

import { createRemoteAppComponent } from '@module-federation/bridge-vue3'
import type { AsyncComponentOptions } from 'vue'

export interface FederationConsumerOptions<T = any> {
  /** 远程模块加载器，如 () => loadRemote('logistics/export-app') */
  loader: () => Promise<T>
  /** 模块导出名，默认 'default' */
  export?: string
  /** 传递给 defineAsyncComponent 的参数 */
  asyncComponentOptions?: Omit<AsyncComponentOptions, 'loader'>
  /** 绑定到远程应用根容器的属性 */
  rootAttrs?: Record<string, unknown>
}

/**
 * 创建联邦 Consumer 组件
 * 封装 @module-federation/bridge-vue3 的 createRemoteAppComponent
 */
export function createFederationConsumer<T = any>(
  options: FederationConsumerOptions<T>
) {
  return createRemoteAppComponent({
    loader: options.loader,
    export: options.export as any,
    asyncComponentOptions: options.asyncComponentOptions,
    rootAttrs: options.rootAttrs,
  })
}
