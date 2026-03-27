/*
 * @Description: Module Federation 运行时插件 — 错误兜底 + 加载策略
 * 集中在 federation/ 层管理，所有应用共享同一套运行时行为
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { ModuleFederationRuntimePlugin as FederationRuntimePlugin } from '@module-federation/runtime'

/**
 * Robot Admin Federation Runtime Plugin
 *
 * - beforeInit: 日志记录 + 环境注入
 * - errorLoadRemote: 远程模块加载失败时返回空组件兜底，防止白屏
 * - beforeRequest: 根据环境变量动态修正 Remote Entry URL
 */
const runtimePlugin: () => FederationRuntimePlugin = () => ({
  name: 'robot-admin-runtime-plugin',

  /**
   * 联邦初始化前钩子 — 注入环境信息 & 日志
   */
  beforeInit(args: any) {
    console.info(
      `[MF Runtime] 🚀 初始化联邦: ${args.options.name}`,
      `| shared keys: ${Object.keys(args.options.shared ?? {}).join(', ')}`
    )
    return args
  },

  /**
   * 远程模块加载失败兜底 — 返回空 fallback 组件，避免白屏崩溃
   */
  errorLoadRemote(args: any) {
    const { id, error } = args
    console.error(`[MF Runtime] ❌ 加载远程模块失败: ${id}`, error)

    // 返回兜底空组件（Vue defineComponent 格式）
    const FallbackComponent = {
      name: 'MFFallback',
      /** 渲染空内容作为兜底 */
      render() {
        return null
      },
    }

    return FallbackComponent
  },

  /**
   * 请求拦截 — 可基于环境变量动态替换 entry URL
   */
  beforeRequest(args: any) {
    // 生产环境下可根据 CDN 地址替换 remoteEntry URL
    // 扩展示例: args.options.remotes 可在此动态修改
    return args
  },
})

export default runtimePlugin
