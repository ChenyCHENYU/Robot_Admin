/**
 * @Description: 自动生成路由翻译映射脚本
 *
 * 运行方式: bun run scripts/generate-route-translations.ts
 *
 * 工作流程:
 * 1. 读取 dynamicRouter.json
 * 2. 提取所有路由标题
 * 3. 生成包含字符串字面量的 TypeScript 代码
 * 4. 让 vite-auto-i18n-plugin 自动扫描并翻译
 */

import fs from 'fs'
import path from 'path'

const DYNAMIC_ROUTER_PATH = path.resolve(
  __dirname,
  '../src/assets/data/dynamicRouter.json'
)
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../src/utils/plugins/i18n-route.ts'
)

interface Route {
  meta?: { title?: string }
  children?: Route[]
}

/** 提取所有路由标题 */
function extractRouteTitles(routes: Route[]): Set<string> {
  const titles = new Set<string>()
  const queue: Route[] = [...routes]

  while (queue.length) {
    const route = queue.shift()!
    if (route.meta?.title) {
      titles.add(route.meta.title)
    }
    if (route.children) {
      queue.push(...route.children)
    }
  }

  return titles
}

/** 生成 TypeScript 代码 */
function generateCode(titles: Set<string>): string {
  const titleArray = Array.from(titles).sort()

  return `/**
 * @Description: 路由标题翻译 - 自动生成文件
 * 
 * ⚠️ 请勿手动编辑此文件！
 * 此文件由 scripts/generate-route-translations.ts 自动生成
 * 运行 \`bun run gen:route-i18n\` 重新生成
 * 
 * 🔑 工作原理（优雅方案 - 直接读取 JSON）：
 * 1. 脚本从 dynamicRouter.json 提取所有路由标题（${titleArray.length} 个）
 * 2. 生成导入 lang/index.json 的代码
 * 3. 编译时构建 中文 -> 英文 直接映射表
 * 4. 运行时 O(1) 查找，无需遍历 hash key
 * 
 * ✨ 优势：
 * - 不依赖 window.langMap（避免加载时机问题）
 * - 不需要反向查找 hash key（性能更好）
 * - 代码更简洁（50 行 vs 100+ 行）
 * - 完全自动化（插件翻译 -> 自动读取 -> 自动构建映射）
 */

import langJSON from '../../../lang/index.json'

type LangData = Record<string, { 'zh-cn': string; en: string }>

/**
 * 构建翻译映射表（编译时执行）
 * 
 * @param json 插件生成的翻译 JSON
 * @param targetLang 目标语言
 * @returns 中文 -> 目标语言 的映射表
 */
function buildTranslationMap(json: LangData, targetLang: 'en' = 'en'): Record<string, string> {
  const map: Record<string, string> = {}
  
  // 遍历所有 hash key，构建 中文 -> 英文 映射
  for (const hashKey in json) {
    const item = json[hashKey]
    if (item['zh-cn'] && item[targetLang]) {
      map[item['zh-cn']] = item[targetLang]
    }
  }
  
  return map
}

// 编译时构建映射表（只执行一次）
const translationMap = buildTranslationMap(langJSON as LangData, 'en')

/**
 * 翻译路由标题（优雅方案）
 * 
 * @param title 原始标题（中文）
 * @returns 翻译后的标题（根据当前语言）
 */
export function translateRouteTitle(title: string): string {
  if (!title || typeof window === 'undefined') return title

  // 获取当前语言
  const currentLang = (window as any).localStorage?.getItem('robot-admin') || 'zh-cn'
  
  // 中文环境直接返回
  if (currentLang === 'zh-cn') return title

  // 🎯 直接从映射表查找（O(1) 时间复杂度）
  return translationMap[title] || title
}

/**
 * 开发环境调试信息
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  setTimeout(() => {
    const totalTranslations = Object.keys(translationMap).length
    console.log(\`✅ 已加载 \${totalTranslations} 个翻译映射（来自 lang/index.json）\`)
  }, 1000)
}
`
}

/** 主函数 */
function main() {
  try {
    // 读取 dynamicRouter.json
    const routerData = JSON.parse(fs.readFileSync(DYNAMIC_ROUTER_PATH, 'utf-8'))

    // 提取路由标题
    const titles = extractRouteTitles(routerData.data || [])

    console.log(`📊 共提取 ${titles.size} 个路由标题`)

    // 生成代码
    const code = generateCode(titles)

    // 写入文件
    fs.writeFileSync(OUTPUT_PATH, code, 'utf-8')

    console.log(`✅ 成功生成 ${OUTPUT_PATH}`)
    console.log('💡 请重启开发服务器让 vite-auto-i18n-plugin 扫描新文件')
  } catch (error) {
    console.error('❌ 生成失败:', error)
    process.exit(1)
  }
}

main()
