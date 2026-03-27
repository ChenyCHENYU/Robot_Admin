/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-06 09:09:51
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-18 10:05:46
 * @FilePath: \Robot_Admin\src\utils\plugins\i18n-route.ts
 * @Description: 路由标题翻译插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
/**
 * @Description: 路由标题翻译 - 自动生成文件
 *
 * ⚠️ 请勿手动编辑此文件！
 * 此文件由 scripts/generate-route-translations.ts 自动生成
 * 运行 `bun run gen:route-i18n` 重新生成
 *
 * 🔑 工作原理（优雅方案 - 直接读取 JSON）：
 * 1. 脚本从 dynamicRouter.json 提取所有路由标题（60 个）
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

import langJSON from '@lang/index.json'

type LangData = Record<
  string,
  { 'zh-cn': string; en: string; ja: string; ko: string }
>

/**
 * 构建翻译映射表（编译时执行）
 *
 * @param json 插件生成的翻译 JSON
 * @param targetLang 目标语言
 * @returns 中文 -> 目标语言 的映射表
 */
function buildTranslationMap(
  json: LangData,
  targetLang: 'en' | 'ja' | 'ko' = 'en'
): Record<string, string> {
  const map: Record<string, string> = {}

  // 遍历所有 hash key，构建 中文 -> 目标语言 映射
  for (const hashKey in json) {
    const item = json[hashKey]
    if (item['zh-cn'] && item[targetLang]) {
      map[item['zh-cn']] = item[targetLang]
    }
  }

  return map
}

// 编译时构建所有语言的映射表（只执行一次）
const translationMaps = {
  en: buildTranslationMap(langJSON as LangData, 'en'),
  ja: buildTranslationMap(langJSON as LangData, 'ja'),
  ko: buildTranslationMap(langJSON as LangData, 'ko'),
}

/**
 * 翻译路由标题（优雅方案）
 *
 * @param title 原始标题（中文）
 * @returns 翻译后的标题（根据当前语言）
 */
export function translateRouteTitle(title: string): string {
  if (!title || typeof window === 'undefined') return title

  // 获取当前语言
  const currentLang =
    (window as any).localStorage?.getItem('robot_admin') || 'zh-cn'

  // 中文环境直接返回
  if (currentLang === 'zh-cn') return title

  // 🎯 直接从对应语言的映射表查找（O(1) 时间复杂度）
  const translationMap =
    translationMaps[currentLang as keyof typeof translationMaps]
  return translationMap?.[title] || title
}

/**
 * 开发环境调试信息
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  setTimeout(() => {
    const enCount = Object.keys(translationMaps.en).length
    const jaCount = Object.keys(translationMaps.ja).length
    const koCount = Object.keys(translationMaps.ko).length
    console.log(
      `✅ 已加载翻译映射（来自 lang/index.json）：`,
      `英文 ${enCount} 个，`,
      `日文 ${jaCount} 个，`,
      `韩文 ${koCount} 个`
    )
  }, 1000)
}
