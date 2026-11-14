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
import {
  COMPONENT_LOCALE_KEY,
  FORM_GLOBAL_CONFIG_KEY,
  TABLE_GLOBAL_CONFIG_KEY,
} from '@robot-admin/naive-ui-components/config'
import { notification } from '@/plugins/discrete'
import { s_languageStore } from '@/stores/language'
import { s_userStore } from '@/stores/user'
import { buildTablePreferenceScope } from '@/utils/d_tablePreferences'

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
  // 表单、搜索与编辑弹窗共享默认密度；页面和字段的明确配置继续优先。
  app.provide(FORM_GLOBAL_CONFIG_KEY, { density: 'compact' })
  const user = s_userStore()
  app.provide(TABLE_GLOBAL_CONFIG_KEY, {
    /** 表格包只接收通用命名空间；身份信息和登录生命周期由应用管理。 */
    get persistPrefix() {
      if (!user.token) return undefined
      return buildTablePreferenceScope({
        userId: user.userInfo.id,
        tenantId: user.activeContext?.tenantId,
        companyId: user.activeContext?.companyId,
      })
    },
  })
  const language = s_languageStore()
  app.provide(COMPONENT_LOCALE_KEY, {
    /** 组件内置中英文；其他宿主语言先使用英文，业务翻译仍由宿主管理。 */
    get locale() {
      return language.currentLang === 'zh-cn' ? 'zh-CN' : 'en-US'
    },
  })
}
