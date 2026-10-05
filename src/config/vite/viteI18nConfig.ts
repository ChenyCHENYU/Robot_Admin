/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\config\vite\viteI18nConfig.ts
 * @Description: 始终编译已有翻译，仅在显式启用时联网生成新词条
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import autoI18n, {
  EmptyTranslator,
  YoudaoTranslator,
} from 'vite-auto-i18n-plugin'
import type { Plugin } from 'vite'
import { I18N_NAMESPACE, DEFAULT_LANGUAGE, TARGET_LANGUAGES } from '../i18n.ts'

/** 用官方空翻译器保证普通开发和生产构建都不会调用默认 Google / 有道 API。 */
export default function createI18nPlugin(): Plugin {
  const generateTranslations = process.env.VITE_I18N_ENABLED === 'true'
  const plugin = autoI18n({
    // enabled 控制 API 生成阶段，transform 无论是否联网都必须执行。
    enabled: generateTranslations,
    translator: generateTranslations
      ? new YoudaoTranslator({
          appId: process.env.YOUDAO_APP_ID!.trim(),
          appKey: process.env.YOUDAO_APP_KEY!.trim(),
        })
      : new EmptyTranslator(),
    translateType: 'full-auto',
    translateKey: '$t',
    namespace: I18N_NAMESPACE,
    originLang: DEFAULT_LANGUAGE,
    targetLangList: [...TARGET_LANGUAGES],
    languageJsonMode: 'split',
    globalPath: './lang',
    includePath: [
      /src\/(views|components)\//,
      /src\/utils\/plugins\/i18n-route\.ts$/,
    ],
    excludedPath: ['node_modules', 'src/api', 'src/types', 'dist', 'lang'],
    excludedCall: [
      '$t',
      '$$t',
      '$deepScan',
      '_createCommentVNode',
      'require',
      'import',
      'console.log',
      'console.info',
      'console.warn',
      'console.error',
      'console.debug',
    ],
    excludedPattern: [
      /\.\w+$/,
      /^[a-z_]+$/i,
      /^\/.+\/[gimsuy]*$/,
      /^https?:\/\//,
      /^#[0-9a-f]{3,6}$/i,
      /^\d+(\.\d+)?(px|em|rem|vh|vw|%)?$/,
    ],
    deepScan: true,
    // 1.1.16 的 true 实际保留原始空格；运行时兼容去空格的词条，保证混合文案间距。
    isClearSpace: true,
    rewriteConfig: false,
    isClear: false,
    // 词典由原生动态 import 分包；不让插件在 closeBundle 重写已带 hash 的产物。
    buildToDist: false,
  })

  // Vite 8 将 Vue 模板/脚本拆成带查询参数的模块，包的扩展名判断会直接漏过它们。
  const { transform } = plugin
  if (typeof transform !== 'function') {
    throw new Error('自动翻译插件缺少 transform 钩子')
  }
  plugin.enforce = 'post'
  /** 为 Vue 查询模块适配扩展名，并为翻译后的模块建立词典就绪依赖。 */
  plugin.transform = async function (source, id, ...args) {
    if (id.includes('vue&type=style')) return null
    const result = await transform.call(this, source, id.split('?')[0], ...args)
    // 显式依赖异步语言入口，避免 ESM 并行执行时模块常量先拿到中文回退值。
    return typeof result === 'string' && result !== source
      ? `import '/lang/index.js';\n${result}`
      : result
  }

  if (!generateTranslations) {
    // 离线模式无需排队、打印翻译进度或执行清理钩子，也不会修改词典。
    delete plugin.buildEnd
    delete plugin.closeBundle
    delete plugin.configResolved
  }
  return plugin
}
