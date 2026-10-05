/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\utils\d_i18n.ts
 * @Description: 按需加载当前语言词典，统一页面和路由标题的翻译入口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  DEFAULT_LANGUAGE,
  I18N_NAMESPACE,
  LANGUAGE_STORAGE_KEY,
  getTranslationKey,
  normalizeLanguage,
  type AppLanguage,
} from '@/config/i18n'

const dictionaries = {
  en: () => import('../../lang/en.json'),
  ja: () => import('../../lang/ja.json'),
  ko: () => import('../../lang/ko.json'),
}
let currentLanguage: AppLanguage = DEFAULT_LANGUAGE
let dictionary: Record<string, string> = {}

/** 读取兼容旧版本的原始字符串 key；存储不可用时仍能正常打开应用。 */
export function getStoredLanguage(): AppLanguage {
  try {
    return normalizeLanguage(
      globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY)
    )
  } catch {
    return DEFAULT_LANGUAGE
  }
}

/** 保存语言选择，返回结果供切换入口决定是否刷新。 */
export function persistLanguage(language: AppLanguage): boolean {
  try {
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    return true
  } catch {
    return false
  }
}

/** 在加载应用模块之前准备词典，避免模块级常量和静态节点拿到中文回退值。 */
export async function initializeLanguage(
  language: AppLanguage = getStoredLanguage()
): Promise<void> {
  try {
    dictionary =
      language === DEFAULT_LANGUAGE
        ? {}
        : (await dictionaries[language]()).default
    currentLanguage = language
  } catch (error) {
    // 词典加载失败时保留应用入口，避免翻译资源异常导致登录白屏。
    dictionary = {}
    currentLanguage = DEFAULT_LANGUAGE
    persistLanguage(DEFAULT_LANGUAGE)
    console.warn('语言资源加载失败，已使用简体中文', error)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang =
      currentLanguage === DEFAULT_LANGUAGE ? 'zh-CN' : currentLanguage
  }
}

/** 当前已准备完毕的语言，用于 Naive UI 与语言菜单的初始状态。 */
export function getCurrentLanguage(): AppLanguage {
  return currentLanguage
}

/** 插件编译后的 $t(hash, 原文, 命名空间)；缺失翻译时保留原文。 */
export function translateKey(
  key: string,
  fallback: string,
  namespace = I18N_NAMESPACE
): string {
  if (currentLanguage === DEFAULT_LANGUAGE || namespace !== I18N_NAMESPACE)
    return fallback
  const source = fallback.trim()
  const value =
    dictionary[key] ||
    (source !== fallback ? dictionary[getTranslationKey(source)] : undefined)
  if (!value) return fallback
  // 模板常将数字、英文名和中文分为相邻文本节点，保留原文两侧的空格。
  return (
    (fallback.match(/^\s*/)?.[0] ?? '') +
    value.trim() +
    (fallback.match(/\s*$/)?.[0] ?? '')
  )
}

/** 翻译来自菜单 JSON、已打开标签和面包屑的原始标题，不读取浏览器存储。 */
export function translateText(text: string): string {
  if (currentLanguage === DEFAULT_LANGUAGE) return text
  return translateKey(getTranslationKey(text.trim()), text)
}
