/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 12:30:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-01 08:58:40
 * @FilePath: \Robot_Admin\src\plugins\highlight.ts
 * @Description: highlight.js 插件 - 代码高亮支持
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import type { HLJSApi, LanguageFn } from 'highlight.js'
import hljs from 'highlight.js/lib/core'

// 导入默认主题样式
import 'highlight.js/styles/github.css'

// 默认支持的语言包（常用语言预加载）
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml' // HTML
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import java from 'highlight.js/lib/languages/java'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import python from 'highlight.js/lib/languages/python'

// 可选语言包映射（懒加载）
const OPTIONAL_LANGUAGES: Record<
  string,
  () => Promise<{ default: LanguageFn }>
> = {
  cpp: () => import('highlight.js/lib/languages/cpp'),
  c: () => import('highlight.js/lib/languages/c'),
  php: () => import('highlight.js/lib/languages/php'),
  ruby: () => import('highlight.js/lib/languages/ruby'),
  rust: () => import('highlight.js/lib/languages/rust'),
  swift: () => import('highlight.js/lib/languages/swift'),
  kotlin: () => import('highlight.js/lib/languages/kotlin'),
  scss: () => import('highlight.js/lib/languages/scss'),
  less: () => import('highlight.js/lib/languages/less'),
  sql: () => import('highlight.js/lib/languages/sql'),
  dockerfile: () => import('highlight.js/lib/languages/dockerfile'),
  powershell: () => import('highlight.js/lib/languages/powershell'),
}

// 插件配置选项
export interface HighlightPluginOptions {
  autoDetect?: boolean
  extraLanguages?: string[]
}

// 状态管理
const loadedLanguages = new Set<string>()
const hlJsInstance: HLJSApi = hljs

/**
 * * @description 注册语言包到 highlight.js 实例
 * ? @param name - 语言名称
 * ? @param languageFn - 语言定义函数
 * ! @return void
 */
function registerLanguage(name: string, languageFn: LanguageFn): void {
  hlJsInstance.registerLanguage(name, languageFn)
  loadedLanguages.add(name)
}

/**
 * * @description 初始化核心配置，注册默认语言包
 * ? @param options - 插件配置选项
 * ! @return void
 */
function initializeCore(options: HighlightPluginOptions): void {
  // 注册默认语言包
  const defaultLanguages = [
    ['javascript', javascript],
    ['typescript', typescript],
    ['json', json],
    ['html', xml],
    ['xml', xml],
    ['css', css],
    ['bash', bash],
    ['shell', bash],
    ['yaml', yaml],
    ['yml', yaml],
    ['markdown', markdown],
    ['java', java],
    ['csharp', csharp],
    ['go', go],
    ['python', python],
  ] as const

  defaultLanguages.forEach(([name, langFn]) => {
    registerLanguage(name, langFn)
  })

  // 配置 highlight.js
  hlJsInstance.configure({
    ignoreUnescapedHTML: true,
    languages: options.autoDetect ? undefined : [],
  })

  // 预加载额外语言
  if (options.extraLanguages?.length) {
    loadLanguages(options.extraLanguages)
  }
}

/**
 * * @description 批量加载多个语言包
 * ? @param languages - 要加载的语言名称数组
 * ! @return Promise<string[]> 成功加载的语言名称数组
 */
async function loadLanguages(languages: string[]): Promise<string[]> {
  const loadPromises = languages.map(lang => loadLanguage(lang))
  const results = await Promise.allSettled(loadPromises)

  return results
    .map((result, index) =>
      result.status === 'fulfilled' ? languages[index] : null
    )
    .filter(Boolean) as string[]
}

/**
 * * @description 动态加载单个语言包
 * ? @param language - 要加载的语言名称
 * ! @return Promise<boolean> 是否加载成功
 */
async function loadLanguage(language: string): Promise<boolean> {
  if (loadedLanguages.has(language)) {
    return true
  }

  const loader = OPTIONAL_LANGUAGES[language.toLowerCase()]
  if (!loader) {
    console.warn(`[HighlightPlugin] Language '${language}' not supported`)
    return false
  }

  try {
    const languageModule = await loader()
    registerLanguage(language, languageModule.default)
    console.log(`[HighlightPlugin] Language '${language}' loaded successfully`)
    return true
  } catch (error) {
    console.error(
      `[HighlightPlugin] Failed to load language '${language}':`,
      error
    )
    return false
  }
}

/**
 * * @description 获取 highlight 功能的 API 接口
 * ! @return highlight API 对象，包含所有可用方法
 */
export const useHighlight = () => {
  return {
    // 核心方法
    getHljs: () => hlJsInstance,

    // 语言管理
    loadLanguage: (language: string) => loadLanguage(language),
    loadLanguages: (languages: string[]) => loadLanguages(languages),
    getLoadedLanguages: () => Array.from(loadedLanguages),
  }
}

/**
 * * @description 安装 highlight.js 插件到 Vue 应用
 * ? @param app - Vue 应用实例
 * ? @param options - 插件配置选项
 * ! @return void
 */
export function setupHighlight(app: App, options: HighlightPluginOptions = {}) {
  const pluginOptions: HighlightPluginOptions = {
    autoDetect: false,
    extraLanguages: [],
    ...options,
  }

  // 初始化核心配置
  initializeCore(pluginOptions)

  // 挂载到全局
  if (typeof window !== 'undefined') {
    window.hljs = hlJsInstance
  }

  // 提供给 Vue 应用
  const highlightAPI = useHighlight()
  app.provide('highlightManager', highlightAPI)
  app.config.globalProperties.$highlight = highlightAPI

  console.log('[HighlightPlugin] 🎨 highlight.js plugin installed successfully')
}

// 导出默认配置
export const defaultHighlightOptions: HighlightPluginOptions = {
  autoDetect: false,
  extraLanguages: [],
}

// 类型声明
declare global {
  interface Window {
    hljs: HLJSApi
  }
}
