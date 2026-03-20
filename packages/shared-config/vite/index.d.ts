import type { UserConfig, PluginOption } from 'vite'

/** Vue 全家桶预构建排除列表（防止 RefImpl 符号断裂） */
export declare const VUE_OPTIMIZE_EXCLUDE: string[]

/** 通用预构建依赖列表 */
export declare const COMMON_OPTIMIZE_INCLUDE: string[]

export interface ViteAppOptions {
  plugins: PluginOption[]
  resolve?: UserConfig['resolve']
  server?: UserConfig['server']
  build?: UserConfig['build']
  /** 额外追加到 optimizeDeps.include 的包 */
  extraOptimizeInclude?: string[]
}

/**
 * 创建 Vite 配置
 *
 * @description 统一 loadEnv / optimizeDeps / analyzer 注入，各 app 只传入差异部分
 */
export declare function createViteConfig(
  appOptions:
    | ViteAppOptions
    | ((env: Record<string, string>, command: string) => ViteAppOptions)
): ReturnType<typeof import('vite').defineConfig>
