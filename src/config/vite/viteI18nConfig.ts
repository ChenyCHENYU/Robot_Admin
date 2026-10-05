/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\config\vite\viteI18nConfig.ts
 * @Description: 自动翻译的项目扫描范围、语言与联网生成配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { YoudaoTranslator } from 'vite-auto-i18n-plugin'
import { createI18nPlugin } from 'vite-auto-i18n-plugin/adapter'
import { I18N_NAMESPACE, DEFAULT_LANGUAGE, TARGET_LANGUAGES } from '../i18n.ts'

/** 编译、缓存和查询模块适配由依赖包负责，项目只配置展示内容的范围。 */
export default function createProjectI18nPlugin() {
  const enabled = process.env.VITE_I18N_ENABLED === 'true'
  return createI18nPlugin({
    enabled,
    ...(enabled && {
      translator: new YoudaoTranslator({
        appId: process.env.YOUDAO_APP_ID!.trim(),
        appKey: process.env.YOUDAO_APP_KEY!.trim(),
      }),
    }),
    namespace: I18N_NAMESPACE,
    originLang: DEFAULT_LANGUAGE,
    targetLangList: [...TARGET_LANGUAGES],
    globalPath: './lang',
    includePath: [
      /src\/(views|components)\//,
      /src\/utils\/plugins\/i18n-route\.ts$/,
    ],
    excludedPath: ['node_modules', 'src/api', 'src/types', 'dist', 'lang'],
  })
}
