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
 * alias → src/ 让 Vite 直接编译 .vue 源文件，并通过模式隔离缓存保持 HMR 可预期。
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

/** 组件源码自身已携带样式；这些入口只补充无法写入 scoped SFC 的第三方样式。 */
const COMPONENT_VENDOR_STYLE_ENTRIES: Record<string, string> = {
  'C_Captcha/style.css': 'vue3-puzzle-vcode/dist/main.css',
  'C_Login/style.css': 'vue3-puzzle-vcode/dist/main.css',
  'C_Code/style.css': 'highlight.js/styles/github.css',
  'C_Editor/style.css': '@wangeditor-next/editor/dist/css/style.css',
  'C_Form/full.css': '@wangeditor-next/editor/dist/css/style.css',
  'C_Table/full.css': '@wangeditor-next/editor/dist/css/style.css',
  'C_Guide/style.css': 'driver.js/dist/driver.css',
  'C_Map/style.css': 'leaflet/dist/leaflet.css',
  'C_Markdown/style.css': 'md-editor-v3/lib/style.css',
  'C_VideoPlayer/style.css': 'xgplayer/dist/index.min.css',
}

/** MachTable 独立仓库联调；可单独启用，也会纳入 `dev:local` 全量联调。 */
const MACH_TABLE_LOCAL = {
  enabled: process.env.USE_LOCAL_MACH_TABLE === 'true',
  root:
    process.env.MACH_TABLE_LOCAL_ROOT || '../../../office-project/wl/MachTable',
} as const

/**
 * 本地包配置
 */
const LOCAL_PACKAGE_CONFIG: LocalPackageConfig = {
  packagesDir: '../robot-admin-packages/packages',
  namespace: '@robot-admin',
  enabled: process.env.USE_LOCAL_PACKAGES === 'true',
}

/** 仅联调明确依赖的 monorepo 包，避免为了一个页面扫描并接入整套生态。 */
const SELECTED_LOCAL_PACKAGES = new Set(
  (process.env.USE_LOCAL_PACKAGE_NAMES ?? '')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
)

/** 独立包模式：仅 alias 独立本地包，不动 monorepo 包 */
const STANDALONE_MODE =
  process.env.USE_LOCAL_COMPONENTS === 'true' &&
  process.env.USE_LOCAL_PACKAGES !== 'true'

/** 已注册的传递依赖别名（避免重复） */
const registeredTransitiveDeps = new Set<string>()

/** 将 npm 包名安全转换为精确匹配的正则表达式片段。 */
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * 从包的 exports 自动寻找源码子入口。
 *
 * @description
 * 支持当前生态的四种源码布局，新增标准子入口时无需继续手写 Vite alias：
 * `src/entries/foo.ts`、`src/foo/index.ts`、`src/foo.ts`、`src/directives/foo.ts`。
 * CSS/SCSS 仍使用包声明的正式样式入口，避免把构建期聚合样式误映射为单个源码文件。
 */
function collectSourceSubpathAliases(
  packageRoot: string,
  srcPath: string,
  fullPackageName: string,
  aliases: Alias[]
): void {
  const packageJsonPath = resolve(packageRoot, 'package.json')
  if (!existsSync(packageJsonPath)) return

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      exports?: Record<string, unknown>
    }
    const exportKeys = Object.keys(packageJson.exports ?? {})

    for (const exportKey of exportKeys) {
      if (!exportKey.startsWith('./') || exportKey === './package.json')
        continue

      const subpath = exportKey.slice(2)
      if (!subpath || /(?:^|\/)(?:style|styles|css)(?:\.|\/|$)/.test(subpath)) {
        continue
      }

      const candidates = [
        resolve(srcPath, 'entries', `${subpath}.ts`),
        resolve(srcPath, subpath, 'index.ts'),
        resolve(srcPath, `${subpath}.ts`),
        resolve(srcPath, 'directives', `${subpath}.ts`),
      ]
      const sourceEntry = candidates.find(existsSync)
      if (!sourceEntry) continue

      aliases.push({
        find: new RegExp(
          `^${escapeRegExp(fullPackageName)}/${escapeRegExp(subpath)}$`
        ),
        replacement: sourceEntry,
      })
    }
  } catch {
    console.warn(`⚠️  无法读取 ${fullPackageName} 的源码子入口，跳过`)
  }
}

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

const addMonorepoAliases = (
  aliases: Alias[],
  packageNames: string[],
  selectedPackages?: ReadonlySet<string>
): void => {
  const localPath = resolve(process.cwd(), LOCAL_PACKAGE_CONFIG.packagesDir)
  if (!existsSync(localPath)) {
    console.warn('⚠️  未找到 monorepo 包目录，跳过扫描')
    console.warn(`    路径: ${localPath}`)
    return
  }

  for (const pkgName of readdirSync(localPath)) {
    if (selectedPackages && !selectedPackages.has(pkgName)) continue
    const srcPath = resolve(localPath, pkgName, 'src')
    if (!existsSync(srcPath)) continue

    const fullPackageName = `${LOCAL_PACKAGE_CONFIG.namespace}/${pkgName}`

    // 子入口先注册，防止 /vue、/axios、/core 等静默回落到 node_modules。
    collectSourceSubpathAliases(
      resolve(localPath, pkgName),
      srcPath,
      fullPackageName,
      aliases
    )

    aliases.push({
      find: new RegExp(`^${escapeRegExp(fullPackageName)}$`),
      replacement: resolve(srcPath, 'index.ts'),
    })
    packageNames.push(pkgName)
    collectTransitiveDeps(localPath, pkgName, aliases)
  }
}

const addStandaloneAliases = (
  aliases: Alias[],
  packageNames: string[]
): void => {
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

    if (pkgName === 'naive-ui-components') {
      for (const [styleEntry, dependencyStyle] of Object.entries(
        COMPONENT_VENDOR_STYLE_ENTRIES
      )) {
        const localVendorStyle = resolve(
          process.cwd(),
          relativePath,
          'node_modules',
          dependencyStyle
        )
        if (!existsSync(localVendorStyle)) continue
        aliases.push({
          find: new RegExp(
            `^${escapeRegExp(fullPackageName)}/${escapeRegExp(styleEntry)}$`
          ),
          replacement: localVendorStyle,
        })
      }

      // 源码 SFC 已加载自身 scoped 样式；其余发布态聚合 CSS 在联调模式下必须为空，
      // 否则会把 node_modules 中的旧组件样式重新叠加到最新源码之上。
      aliases.push({
        find: new RegExp(
          `^${escapeRegExp(fullPackageName)}/C_[A-Za-z0-9_]+/(?:style|base|full)\\.css$`
        ),
        replacement: resolve(
          process.cwd(),
          'src/styles/local-package-style-noop.css'
        ),
      })

      aliases.push({
        find: new RegExp(
          `^${escapeRegExp(fullPackageName)}/(C_[A-Za-z0-9_]+)$`
        ),
        replacement: resolve(srcDir, 'components', '$1', 'index.ts'),
      })
    }

    aliases.push({
      find: new RegExp(`^${escapeRegExp(fullPackageName)}$`),
      replacement,
    })

    // 全局样式入口在本地模式下仅映射共享变量；组件样式由源码 SFC 自行产出。
    const localStyleScss = resolve(
      process.cwd(),
      relativePath,
      'src',
      'styles',
      'global.scss'
    )
    if (existsSync(localStyleScss)) {
      aliases.push({
        find: new RegExp(`^${escapeRegExp(fullPackageName)}/style\\.css$`),
        replacement: localStyleScss,
      })
    }

    // 本地独立包与 npm 安装保持同一依赖语义；仅为主项目缺失的传递依赖补精确别名。
    collectTransitiveDeps(
      resolve(process.cwd(), relativePath, '..'),
      pkgName,
      aliases
    )

    packageNames.push(`${pkgName}(独立)`)
  }
}

const addMachTableAliases = (
  aliases: Alias[],
  packageNames: string[]
): void => {
  const root = resolve(process.cwd(), MACH_TABLE_LOCAL.root)
  const coreSrc = resolve(root, 'packages/core/src')
  const vueSrc = resolve(root, 'packages/vue/src')
  const styles = resolve(root, 'packages/core/styles/mach-table.css')

  if (![coreSrc, vueSrc, styles].every(existsSync)) {
    console.warn('⚠️  MachTable 本地源码未找到，回退到 npm 安装版本')
    console.warn(`    路径: ${root}`)
    return
  }

  // 子入口必须先于主入口匹配，保证 Vue 源码中的 adapter 引用也来自同一仓库。
  aliases.push(
    {
      find: /^@agile-team\/mach-table-vue\/styles\.css$/,
      replacement: styles,
    },
    {
      find: /^@agile-team\/mach-table-vue\/styles\/mach-table\.css$/,
      replacement: styles,
    },
    {
      find: /^@agile-team\/mach-table\/styles\/mach-table\.css$/,
      replacement: styles,
    },
    {
      find: /^@agile-team\/mach-table\/adapter$/,
      replacement: resolve(coreSrc, 'adapter.ts'),
    },
    {
      find: /^@agile-team\/mach-table\/worker$/,
      replacement: resolve(coreSrc, 'worker.ts'),
    },
    ...['async', 'workflows', 'adapters', 'worker', 'ui', 'editors'].map(
      subpath => ({
        find: new RegExp(
          `^@agile-team/mach-table-vue/${escapeRegExp(subpath)}$`
        ),
        replacement: resolve(vueSrc, `${subpath}.ts`),
      })
    ),
    {
      find: /^@agile-team\/mach-table-vue$/,
      replacement: resolve(vueSrc, 'index.ts'),
    },
    {
      find: /^@agile-team\/mach-table$/,
      replacement: resolve(coreSrc, 'index.ts'),
    }
  )
  packageNames.push('mach-table(独立)')
}

/** 返回当前启用的本地联调命令名称。 */
function getLocalModeLabel(
  isFullMode: boolean,
  isComponentsOnly: boolean,
  isMachTableMode: boolean
): string {
  if (isFullMode) return 'dev:local'
  if (isMachTableMode && isComponentsOnly) return 'dev:table'
  if (isComponentsOnly) return 'dev:components'
  return 'dev:table'
}

/**
 * 获取本地包别名配置
 *
 * @description
 * 支持按仓库边界启用本地调试：
 *
 * | 命令 | robot-admin 包 | 组件库 | MachTable | 适用场景 |
 * |------|-----------------|--------|-----------|---------|
 * | `bun run dev` | npm | npm | npm | 日常开发 |
 * | `bun run dev:components` | npm | 本地源码 | npm | 调试组件库 |
 * | `bun run dev:table` | request-core 本地源码 | 本地源码 | 本地源码 | 联调 MachTable 及其 CRUD 数据源 |
 * | `bun run dev:local` | 本地源码 | 本地源码 | 本地源码 | 全生态联调（推荐） |
 *
 * **工作原理：**
 * - 使用正则精确匹配主入口（如 `@robot-admin/layout$`）
 * - 根据各包 `exports` 自动映射 `/core`、`/vue`、`/axios` 等源码子入口
 * - 样式入口显式映射到对应仓库，避免源码与 npm 构建产物混用
 *
 * @returns Vite alias 配置数组
 */
export function getLocalPackagesAlias(): Alias[] {
  const isFullMode = LOCAL_PACKAGE_CONFIG.enabled
  const hasSelectedPackages = SELECTED_LOCAL_PACKAGES.size > 0
  const isComponentsOnly = STANDALONE_MODE
  const isMachTableMode = MACH_TABLE_LOCAL.enabled
  const hasLocalMode = [
    isFullMode,
    hasSelectedPackages,
    isComponentsOnly,
    isMachTableMode,
  ].some(Boolean)

  if (!hasLocalMode) return []

  const aliases: Alias[] = []
  const packageNames: string[] = []
  registeredTransitiveDeps.clear()

  // ── 1. Monorepo packages（全量模式或显式选择）──
  if (isFullMode) addMonorepoAliases(aliases, packageNames)
  else if (hasSelectedPackages) {
    addMonorepoAliases(aliases, packageNames, SELECTED_LOCAL_PACKAGES)
  }

  // ── 2. 独立本地包（全量模式 或 组件模式 均启用）──
  if (isFullMode || isComponentsOnly) {
    addStandaloneAliases(aliases, packageNames)
  }
  if (isFullMode || isMachTableMode) {
    addMachTableAliases(aliases, packageNames)
  }

  if (aliases.length > 0) {
    const modeLabel = getLocalModeLabel(
      isFullMode,
      isComponentsOnly,
      isMachTableMode
    )
    console.log(
      `\n🔗 [${modeLabel}] 已启用本地包调试: ${packageNames.join(', ')}\n`
    )
  }

  return aliases
}

/**
 * 获取本地包信息（用于调试）
 */
export function getLocalPackageInfo() {
  return {
    enabled: LOCAL_PACKAGE_CONFIG.enabled,
    selectiveMode: SELECTED_LOCAL_PACKAGES.size > 0,
    selectedPackages: [...SELECTED_LOCAL_PACKAGES],
    standaloneMode: STANDALONE_MODE,
    machTableMode: MACH_TABLE_LOCAL.enabled || LOCAL_PACKAGE_CONFIG.enabled,
    machTableRoot: resolve(process.cwd(), MACH_TABLE_LOCAL.root),
    packagesDir: LOCAL_PACKAGE_CONFIG.packagesDir,
    namespace: LOCAL_PACKAGE_CONFIG.namespace,
    standalonePackages: STANDALONE_LOCAL_PACKAGES,
    resolvedPath: resolve(process.cwd(), LOCAL_PACKAGE_CONFIG.packagesDir),
  }
}
