/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:42:08
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:41:07
 * @FilePath: \Robot_Admin\src\plugins\naive-ui.ts
 * @Description: naive-ui插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { App, InjectionKey } from 'vue'
import { COMPONENT_LOCALE_KEY } from '@robot-admin/naive-ui-components/config'
import { notification } from '@/plugins/discrete'
import { s_languageStore } from '@/stores/language'

export { notification }
export const NOTIFICATION_KEY: InjectionKey<typeof notification> =
  Symbol('notification')

/**
 * * @description: naive-ui插件
 * ? @param {App} app
 * ! @return {*}  {void}
 */
export function setupNaiveUI(app: App) {
  app.provide(NOTIFICATION_KEY, notification)
  const language = s_languageStore()
  app.provide(COMPONENT_LOCALE_KEY, {
    /** 组件内置中英文；其他宿主语言先使用英文，业务翻译仍由宿主管理。 */
    get locale() {
      return language.currentLang === 'zh-cn' ? 'zh-CN' : 'en-US'
    },
  })
}
