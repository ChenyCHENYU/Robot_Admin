/**
 * 语言管理 Store
 * 管理应用语言状态，同步 Naive UI locale 和路由标题翻译
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  zhCN,
  dateZhCN,
  enUS,
  dateEnUS,
  jaJP,
  dateJaJP,
  koKR,
  dateKoKR,
  type NLocale,
  type NDateLocale,
} from 'naive-ui/es'

// lang/index.js 挂载的全局函数类型声明
declare global {
  var $changeLang: ((lang: string) => void) | undefined
}

// 本地存储键名（与 i18n-route.ts 保持一致）
const LANG_STORAGE_KEY = 'robot_admin'

/** 支持的语言配置映射 */
const localeMap: Record<string, { locale: NLocale; dateLocale: NDateLocale }> =
  {
    'zh-cn': { locale: zhCN, dateLocale: dateZhCN },
    en: { locale: enUS, dateLocale: dateEnUS },
    ja: { locale: jaJP, dateLocale: dateJaJP },
    ko: { locale: koKR, dateLocale: dateKoKR },
  }

export const useLanguageStore = defineStore('language', () => {
  // 初始值从 localStorage 读取
  const currentLang = ref(localStorage.getItem(LANG_STORAGE_KEY) || 'zh-cn')

  /** 当前 Naive UI locale */
  const naiveLocale = computed(
    () => localeMap[currentLang.value]?.locale ?? zhCN
  )

  /** 当前 Naive UI dateLocale */
  const naiveDateLocale = computed(
    () => localeMap[currentLang.value]?.dateLocale ?? dateZhCN
  )

  /** 切换语言 */
  /** 切换语言 */
  function setLanguage(lang: string) {
    if (lang === currentLang.value) return
    currentLang.value = lang
    localStorage.setItem(LANG_STORAGE_KEY, lang)

    // 同步运行时 $t() 翻译函数（影响生产构建中自动翻译的中文）
    if (typeof globalThis.$changeLang === 'function') {
      globalThis.$changeLang(lang)
    }

    // 设置 html lang 属性
    document.documentElement.lang = lang === 'zh-cn' ? 'zh-CN' : lang

    // 刷新页面以应用路由标题翻译等
    window.location.reload()
  }

  return {
    currentLang,
    naiveLocale,
    naiveDateLocale,
    setLanguage,
  }
})
