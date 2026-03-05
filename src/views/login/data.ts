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
  QuickAccount,
  SocialProvider,
  LoginFeatures,
} from '@/components/global/C_Login/types'

// ================= 登录功能开关 =================
export const LOGIN_FEATURES: LoginFeatures = {
  captchaLogin: true,
  rememberMe: true,
  forgotPassword: true,
  socialLogin: true,
  quickLogin: true,
  register: true,
  captchaVerify: true,
}

// ================= 社交登录配置 =================
export const SOCIAL_PROVIDERS: SocialProvider[] = [
  { key: 'github', label: 'GitHub', icon: 'mdi:github' },
  { key: 'wechat', label: '微信登录', icon: 'mdi:wechat' },
  { key: 'qq', label: 'QQ 登录', icon: 'mdi:qqchat' },
]

// ================= 快捷账号（Demo） =================
export const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    label: '超级管理员',
    type: 'error',
    username: 'Super',
    password: '123456',
  },
  {
    label: '管理员',
    type: 'primary',
    username: 'Admin',
    password: '123456',
  },
  {
    label: '普通用户',
    type: 'default',
    username: 'User',
    password: '123456',
  },
]
