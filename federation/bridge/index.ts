/*
 * @Description: Vue Bridge — 统一出口
 * 应用级模块联邦通信层，支持 Provider（暴露整个应用）和 Consumer（加载远程应用）
 *
 * 与 exposes/ 的区别：
 * - exposes/  → 组件级暴露（Table, Form 等独立组件）
 * - bridge/   → 应用级暴露（整个 Vue App 含路由、插件、状态）
 */

export { createFederationProvider } from './create-provider'
export type { FederationProviderOptions } from './create-provider'

export { createFederationConsumer } from './create-consumer'
export type { FederationConsumerOptions } from './create-consumer'
