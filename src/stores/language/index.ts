/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\stores\language\index.ts
 * @Description: 语言选择与 Naive UI 文案、日期 locale 同步
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  zhCN,
  dateZhCN,
  enUS,
  dateEnUS,
  jaJP,
  dateJaJP,
  koKR,
  dateKoKR,
} from 'naive-ui/es'
import { normalizeLanguage } from '@/config/i18n'
import { getCurrentLanguage, persistLanguage } from '@/utils/d_i18n'

const locales = {
  'zh-cn': { locale: zhCN, dateLocale: dateZhCN },
  en: { locale: enUS, dateLocale: dateEnUS },
  ja: { locale: jaJP, dateLocale: dateJaJP },
  ko: { locale: koKR, dateLocale: dateKoKR },
}

export const s_languageStore = defineStore('language', () => {
  const currentLang = ref(getCurrentLanguage())
  const naiveLocale = computed(() => locales[currentLang.value].locale)
  const naiveDateLocale = computed(() => locales[currentLang.value].dateLocale)

  /** 模块级配置在编译后包含已求值的文本，保留一次刷新确保页面和已有标签同时切换。 */
  function setLanguage(value: string): void {
    const language = normalizeLanguage(value)
    if (language === currentLang.value || !persistLanguage(language)) return
    currentLang.value = language
    window.location.reload()
  }

  return { currentLang, naiveLocale, naiveDateLocale, setLanguage }
})
