/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-15
 * @Description: 本地包调试配置 - 管理 dev:local 模式下的包别名
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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
 * 独立本地包映射
 *
 * @description
 * 不在 monorepo packages 目录下、但需要本地调试的独立包。
 * key = npm 包名中的短名（如 `naive-ui-components`）
 * value = 相对于项目根目录的本地仓库路径
 *
 * **为什么不用 bun link？**
 * `bun link` 让 Vite 加载预构建 dist JS，Vite 7 的 dev transform
 * 会注入 `import { h } from 'vue'`，与压缩后的同名变量冲突崩溃。
 * alias → src/ 让 Vite 直接编译 .vue 源文件，HMR 即时生效，零风险。
 *
 * **启用方式：**
 * ```bash
 * bun run dev:components   # 仅启用独立组件包调试
 * bun run dev:local        # 启用所有本地包（monorepo + 独立包）
 * ```
 */
const STANDALONE_LOCAL_PACKAGES: Record<string, string> = {
  'naive-ui-components': '../naive-ui-components',
}

/**
 * 本地包配置
 */
const LOCAL_PACKAGE_CONFIG: LocalPackageConfig = {
  packagesDir: '../robot-admin-packages/packages',
  namespace: '@robot-admin',
  enabled: process.env.USE_LOCAL_PACKAGES === 'true',
}

/** 独立包模式：仅 alias 独立本地包，不动 monorepo 包 */
const STANDALONE_MODE =
  process.env.USE_LOCAL_COMPONENTS === 'true' &&
  process.env.USE_LOCAL_PACKAGES !== 'true'

/** 已注册的传递依赖别名（避免重复） */
const registeredTransitiveDeps = new Set<string>()

/**
 * 为被别名的本地包自动解析传递依赖
 *
 * @description
 * 当 dev:local 将包入口别名到源码后，其 dependencies（如 xlsx、jszip）
 * 无法从主项目的 node_modules 解析。此函数读取包的 package.json，
 * 将主项目中不存在的传递依赖，从该包自身的 node_modules 中解析并添加别名。
 * 行为与 npm 安装模式一致——依赖随包自动可用，无需手动安装。
 */
function collectTransitiveDeps(
  packagesDir: string,
  pkgName: string,
  aliases: Alias[]
) {
  const pkgJsonPath = resolve(packagesDir, pkgName, 'package.json')
  if (!existsSync(pkgJsonPath)) return

  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
    const deps = Object.keys(pkgJson.dependencies || {})
    const transitiveNames: string[] = []

    for (const dep of deps) {
      if (registeredTransitiveDeps.has(dep)) continue

      // 主项目已安装的依赖跳过，避免版本冲突
      const mainResolved = resolve(process.cwd(), 'node_modules', dep)
      if (existsSync(mainResolved)) continue

      // 从包自身的 node_modules 解析（bun workspace 会在此处创建符号链接）
      const depInPkg = resolve(packagesDir, pkgName, 'node_modules', dep)
      if (existsSync(depInPkg)) {
        aliases.push({
          find: new RegExp(`^${dep.replace(/[/.]/g, '\\$&')}$`),
          replacement: depInPkg,
        })
        registeredTransitiveDeps.add(dep)
        transitiveNames.push(dep)
      }
    }

    if (transitiveNames.length > 0) {
      console.log(`  📦 ${pkgName} → 传递依赖: ${transitiveNames.join(', ')}`)
    }
  } catch {
    // package.json 读取失败，静默跳过
  }
}

/**
 * 获取本地包别名配置
 *
 * @description
 * 支持两种本地调试模式：
 *
 * | 命令 | monorepo 包 | 独立包 | 适用场景 |
 * |------|-------------|--------|---------|
 * | `bun run dev` | npm | npm | 日常开发 |
 * | `bun run dev:components` | npm | 本地源码 | 调试组件库 |
 * | `bun run dev:local` | 本地源码 | 本地源码 | 全量调试 |
 *
 * **工作原理：**
 * - 使用正则精确匹配主入口（如 `@robot-admin/layout$`）
 * - 子路径导出（如 `/style`）仍从 node_modules 解析
 *
 * @returns Vite alias 配置数组
 */
export function getLocalPackagesAlias(): Alias[] {
  const isFullMode = LOCAL_PACKAGE_CONFIG.enabled
  const isComponentsOnly = STANDALONE_MODE

  if (!isFullMode && !isComponentsOnly) {
    return []
  }

  const aliases: Alias[] = []
  const packageNames: string[] = []

  // ── 1. Monorepo packages（仅在全量模式下启用）──
  if (isFullMode) {
    const localPath = resolve(process.cwd(), LOCAL_PACKAGE_CONFIG.packagesDir)

    if (existsSync(localPath)) {
      readdirSync(localPath).forEach(pkgName => {
        const srcPath = resolve(localPath, pkgName, 'src')

        if (!existsSync(srcPath)) {
          return
        }

        const fullPackageName = `${LOCAL_PACKAGE_CONFIG.namespace}/${pkgName}`

        aliases.push({
          find: new RegExp(`^${fullPackageName.replace(/\//g, '\\/')}$`),
          replacement: srcPath,
        })

        packageNames.push(pkgName)

        // 自动解析传递依赖：读取被别名包的 dependencies，
        // 对主项目 node_modules 中不存在的依赖，从该包自身的 node_modules 解析
        collectTransitiveDeps(localPath, pkgName, aliases)
      })
    } else {
      console.warn('⚠️  未找到 monorepo 包目录，跳过扫描')
      console.warn(`    路径: ${localPath}`)
    }
  }

  // ── 2. 独立本地包（全量模式 或 组件模式 均启用）──
  for (const [pkgName, relativePath] of Object.entries(
    STANDALONE_LOCAL_PACKAGES
  )) {
    const srcIndex = resolve(process.cwd(), relativePath, 'src', 'index.ts')
    const srcDir = resolve(process.cwd(), relativePath, 'src')
    const replacement = existsSync(srcIndex) ? srcIndex : srcDir

    if (!existsSync(replacement)) {
      console.warn(`⚠️  独立本地包 ${pkgName} 源码未找到，跳过`)
      console.warn(`    路径: ${replacement}`)
      continue
    }

    const fullPackageName = `${LOCAL_PACKAGE_CONFIG.namespace}/${pkgName}`

    aliases.push({
      find: new RegExp(`^${fullPackageName.replace(/\//g, '\\/')}$`),
      replacement,
    })

    // 同时将 style.css 子路径映射到本地源码的 global.scss
    // 否则 `import '...naive-ui-components/style.css'` 仍加载安装包的旧 CSS
    const localStyleScss = resolve(
      process.cwd(),
      relativePath,
      'src',
      'styles',
      'global.scss'
    )
    if (existsSync(localStyleScss)) {
      aliases.push({
        find: new RegExp(
          `^${fullPackageName.replace(/\//g, '\\/')}/style\\.css$`
        ),
        replacement: localStyleScss,
      })
    }

    packageNames.push(`${pkgName}(独立)`)
  }

  if (aliases.length > 0) {
    const modeLabel = isFullMode ? 'dev:local' : 'dev:components'
    console.log(
      `\n🔗 [${modeLabel}] 已启用本地包调试: ${packageNames.join(', ')}\n`
    )
  }

  return aliases
}

/**
 * 检查本地包调试模式是否启用
 */
export function isLocalPackageMode(): boolean {
  return LOCAL_PACKAGE_CONFIG.enabled || STANDALONE_MODE
}

/**
 * 获取本地包信息（用于调试）
 */
export function getLocalPackageInfo() {
  return {
    enabled: LOCAL_PACKAGE_CONFIG.enabled,
    standaloneMode: STANDALONE_MODE,
    packagesDir: LOCAL_PACKAGE_CONFIG.packagesDir,
    namespace: LOCAL_PACKAGE_CONFIG.namespace,
    standalonePackages: STANDALONE_LOCAL_PACKAGES,
    resolvedPath: resolve(process.cwd(), LOCAL_PACKAGE_CONFIG.packagesDir),
  }
}
