/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:35:57
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\login\data.ts
 * @Description: 登录页数据配置（供 C_Login 组件使用）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type {
  SocialProvider,
  LoginFeatures,
} from '@/components/global/C_Login/types'

// ================= 登录功能开关 =================
export const LOGIN_FEATURES: LoginFeatures = {
  passwordLogin: true,
  captchaLogin: true,
  qrcodeLogin: true,
  socialLogin: true,
  register: true,
  captchaVerify: true,
  rememberMe: true,
  forgotPassword: true,
}

// ================= 社交登录配置 =================
export const SOCIAL_PROVIDERS: SocialProvider[] = [
  { key: 'github', label: 'GitHub', icon: 'mdi:github' },
  { key: 'google', label: 'Google', icon: 'mdi:google' },
  { key: 'wechat', label: '微信登录', icon: 'mdi:wechat' },
  { key: 'qq', label: 'QQ 登录', icon: 'mdi:qqchat' },
]
