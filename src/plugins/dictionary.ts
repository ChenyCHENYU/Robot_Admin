/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\plugins\dictionary.ts
 * @Description: 每个应用独立的字典实例，与用户、公司、语言上下文同步隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { App } from 'vue'
import { createDictionaryPlugin } from '@robot-admin/dictionary/vue'
import dictionaryConfig from '@/config/dictionary'
import { s_userStore } from '@/stores/user'
import { s_languageStore } from '@/stores/language'

/** 宿主只提供业务上下文；插件负责实例、惰性消费、暂停和卸载。 */
export const setupDictionaries = (app: App): void => {
  const user = s_userStore()
  const language = s_languageStore()
  app.use(
    createDictionaryPlugin({
      ...dictionaryConfig,
      enabled: () => Boolean(user.token),
      // 先捕获所属应用的 Store，响应式回调不再读取全局 active Pinia。
      scope: () =>
        JSON.stringify([
          user.userInfo.id ?? user.userInfo.username ?? '',
          user.activeContext?.tenantId ?? '',
          user.activeContext?.companyId ?? '',
          language.currentLang,
          Boolean(user.token),
        ]),
    })
  )
}
