/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-02
 * @FilePath: \Robot_Admin\src\views\login\community.ts
 * @Description: 社区演示登录渠道归档；企业主线不导入、不打包、不展示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  LoginFeatures,
  SocialProvider,
} from '@robot-admin/naive-ui-components/C_Login'

/** 社区渠道仅作为独立配置保留，接通服务端回调前不可在主线启用。 */
export const COMMUNITY_LOGIN_FEATURES: LoginFeatures = {
  captchaLogin: true,
  qrcodeLogin: true,
  socialLogin: true,
  register: true,
}

export const COMMUNITY_SOCIAL_PROVIDERS: SocialProvider[] = [
  { key: 'github', label: 'GitHub', icon: 'mdi:github' },
  { key: 'google', label: 'Google', icon: 'mdi:google' },
  { key: 'wechat', label: '微信登录', icon: 'mdi:wechat' },
  { key: 'qq', label: 'QQ 登录', icon: 'mdi:qqchat' },
]
