/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\config\i18n.ts
 * @Description: 国际化的语言、命名空间与持久化 key
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { normalizeLanguage as normalize } from 'vite-auto-i18n-plugin/runtime'

export { getTranslationKey } from 'vite-auto-i18n-plugin/runtime'

export const I18N_NAMESPACE = 'robot_admin'
export const LANGUAGE_STORAGE_KEY = I18N_NAMESPACE
export const DEFAULT_LANGUAGE = 'zh-cn'
export const TARGET_LANGUAGES = ['en', 'ja', 'ko'] as const
export type AppLanguage =
  typeof DEFAULT_LANGUAGE | (typeof TARGET_LANGUAGES)[number]

/** 将历史别名和无效的持久化值归一为组件与翻译器共同使用的语言 key。 */
export function normalizeLanguage(value: unknown): AppLanguage {
  return normalize<AppLanguage>(value, DEFAULT_LANGUAGE, TARGET_LANGUAGES)
}
