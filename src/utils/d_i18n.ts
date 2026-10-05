/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\utils\d_i18n.ts
 * @Description: 项目语言配置与依赖包的按需词典运行时连接
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { createI18nRuntime } from 'vite-auto-i18n-plugin/runtime'
import {
  DEFAULT_LANGUAGE,
  I18N_NAMESPACE,
  LANGUAGE_STORAGE_KEY,
  TARGET_LANGUAGES,
  type AppLanguage,
} from '@/config/i18n'

// glob 只建立懒加载入口；词典文件缺失时由包回退，不让静态 import 解析中断应用。
const dictionaries = import.meta.glob([
  '../../lang/*.json',
  '!../../lang/zh-cn.json',
  '!../../lang/index.json',
])
export const i18n = createI18nRuntime<AppLanguage>({
  namespace: I18N_NAMESPACE,
  storageKey: LANGUAGE_STORAGE_KEY,
  defaultLanguage: DEFAULT_LANGUAGE,
  languages: TARGET_LANGUAGES,
  loaders: Object.fromEntries(
    TARGET_LANGUAGES.map(language => [
      language,
      dictionaries[`../../lang/${language}.json`],
    ])
  ),
})

export const {
  getCurrentLanguage,
  getStoredLanguage,
  persistLanguage,
  initializeLanguage,
  translateKey,
  translateText,
} = i18n
