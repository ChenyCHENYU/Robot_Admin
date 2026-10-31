/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\plugins\dictionary.ts
 * @Description: 每个应用独立的字典实例，与用户、公司、语言上下文同步隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { App } from 'vue'
import { DICTIONARY_PROVIDER_KEY } from '@robot-admin/naive-ui-components/config'
import {
  APP_DICTIONARY_KEY,
  createAppDictionaries,
} from '@/utils/d_dictionaryContext'
import { s_userStore } from '@/stores/user'
import { s_languageStore } from '@/stores/language'

/** 全局注册只负责提供实例，不预加载未使用的字典。 */
export const setupDictionaries = (app: App): void => {
  const user = s_userStore()
  const dictionaries = createAppDictionaries(() => Boolean(user.token))
  const language = s_languageStore()
  const stop = watch(
    () =>
      JSON.stringify([
        user.userInfo.id ?? user.userInfo.username ?? '',
        user.activeContext?.tenantId ?? '',
        user.activeContext?.companyId ?? '',
        language.currentLang,
        Boolean(user.token),
      ]),
    scope => dictionaries.setScope(scope),
    { immediate: true, flush: 'sync' }
  )
  app.provide(APP_DICTIONARY_KEY, dictionaries)
  app.provide(DICTIONARY_PROVIDER_KEY, dictionaries)
  app.onUnmount(() => {
    stop()
    dictionaries.destroy()
  })
}
