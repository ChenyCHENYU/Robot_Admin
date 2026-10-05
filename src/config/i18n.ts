/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\config\i18n.ts
 * @Description: 国际化的语言、命名空间与持久化 key
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export const I18N_NAMESPACE = 'robot_admin'
export const LANGUAGE_STORAGE_KEY = I18N_NAMESPACE
export const DEFAULT_LANGUAGE = 'zh-cn'
export const TARGET_LANGUAGES = ['en', 'ja', 'ko'] as const
export type AppLanguage =
  typeof DEFAULT_LANGUAGE | (typeof TARGET_LANGUAGES)[number]

/** 将历史别名和无效的持久化值归一为组件与翻译器共同使用的语言 key。 */
export function normalizeLanguage(value: unknown): AppLanguage {
  if (typeof value !== 'string') return DEFAULT_LANGUAGE
  const language = value.toLowerCase().replace('_', '-')
  if (language === 'en-us') return 'en'
  if (language === 'ja-jp') return 'ja'
  if (language === 'ko-kr') return 'ko'
  return TARGET_LANGUAGES.some(item => item === language)
    ? (language as AppLanguage)
    : DEFAULT_LANGUAGE
}

/** 与 vite-auto-i18n-plugin 的 generateId 保持一致，菜单标题不再维护反向映射。 */
export function getTranslationKey(text: string): string {
  const source = text.replace(/'/g, '"').replace(/\n/g, '\\n')
  let hash = 0
  for (let index = 0; index < source.length; index++) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36) + source.length.toString(36)
}
