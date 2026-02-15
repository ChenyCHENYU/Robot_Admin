/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-15
 * @Description: 本地包调试配置 - 管理 dev:local 模式下的包别名
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Alias } from 'vite'

/**
 * 本地包配置
 */
interface LocalPackageConfig {
  /** 本地包目录路径（相对于项目根目录） */
  packagesDir: string
  /** 包命名空间 */
  namespace: string
  /** 是否启用（通过环境变量控制） */
  enabled: boolean
}

/**
 * 本地包配置
 */
const LOCAL_PACKAGE_CONFIG: LocalPackageConfig = {
  packagesDir: '../robot-admin-packages/packages',
  namespace: '@robot-admin',
  enabled: process.env.USE_LOCAL_PACKAGES === 'true',
}

/**
 * 获取本地包别名配置
 *
 * @description
 * 用于 `bun run dev:local` 模式，将 @robot-admin/* 包解析到本地源码目录。
 *
 * **工作原理：**
 * - 使用正则精确匹配主入口（如 `@robot-admin/layout$`）
 * - 子路径导出（如 `/style`）仍从 node_modules 解析
 *
 * **使用场景：**
 * ```bash
 * bun run dev:local  # 启用本地包调试
 * bun run dev        # 使用 npm 包
 * ```
 *
 * @returns Vite alias 配置数组
 *
 * @example
 * // 解析行为
 * import { setupLayout } from '@robot-admin/layout'  // → ../packages/layout/src/
 * import '@robot-admin/layout/style'                 // → node_modules/.../dist/index.css
 */
export function getLocalPackagesAlias(): Alias[] {
  if (!LOCAL_PACKAGE_CONFIG.enabled) {
    return []
  }

  const localPath = resolve(process.cwd(), LOCAL_PACKAGE_CONFIG.packagesDir)

  if (!existsSync(localPath)) {
    console.warn('⚠️  未找到本地包目录，将使用 npm 包')
    console.warn(`    路径: ${localPath}`)
    return []
  }

  const aliases: Alias[] = []
  const packageNames: string[] = []

  readdirSync(localPath).forEach(pkgName => {
    const srcPath = resolve(localPath, pkgName, 'src')

    if (!existsSync(srcPath)) {
      return
    }

    // 使用正则精确匹配包名（不匹配子路径）
    // ^@robot-admin/layout$  ✅ 匹配
    // ^@robot-admin/layout/style  ❌ 不匹配（继续走正常解析）
    const fullPackageName = `${LOCAL_PACKAGE_CONFIG.namespace}/${pkgName}`

    aliases.push({
      find: new RegExp(`^${fullPackageName.replace(/\//g, '\\/')}$`),
      replacement: srcPath,
    })

    packageNames.push(pkgName)
  })

  if (aliases.length > 0) {
    console.log(
      `\n🔗 [dev:local] 已启用本地包调试: ${packageNames.join(', ')}\n`
    )
  }

  return aliases
}

/**
 * 检查本地包调试模式是否启用
 */
export function isLocalPackageMode(): boolean {
  return LOCAL_PACKAGE_CONFIG.enabled
}

/**
 * 获取本地包信息（用于调试）
 */
export function getLocalPackageInfo() {
  return {
    enabled: LOCAL_PACKAGE_CONFIG.enabled,
    packagesDir: LOCAL_PACKAGE_CONFIG.packagesDir,
    namespace: LOCAL_PACKAGE_CONFIG.namespace,
    resolvedPath: resolve(process.cwd(), LOCAL_PACKAGE_CONFIG.packagesDir),
  }
}
