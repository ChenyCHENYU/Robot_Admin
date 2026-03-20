/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:35:57
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\login\data.ts
 * @Description: 登录页数据配置（供 C_Login 组件 + useLoginController 使用）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type {
  SocialProvider,
  LoginFeatures,
} from '@robot-admin/naive-ui-components'
import type { WelcomeConfig } from '@/composables/useLoginController'

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

// ================= 欢迎语配置（工厂函数，接受 i18n 翻译函数） =================
export const createWelcomeConfig = (
  t: (key: string, fallback: string) => string
): WelcomeConfig => ({
  timeSlots: [
    {
      range: [6, 12] as const,
      greeting: t('lp_morning', '早上好'),
      emoji: '🌅',
    },
    {
      range: [12, 14] as const,
      greeting: t('lp_noon', '中午好'),
      emoji: '☀️',
    },
    {
      range: [14, 18] as const,
      greeting: t('lp_afternoon', '下午好'),
      emoji: '🌤️',
    },
    {
      range: [18, 22] as const,
      greeting: t('lp_evening', '晚上好'),
      emoji: '🌆',
    },
    {
      range: [22, 6] as const,
      greeting: t('lp_late_night', '夜深了'),
      emoji: '🌙',
    },
  ],
  templates: [
    '{greeting}，{username}！' + t('lp_wb1', '欢迎回来～') + ' {emoji}',
    '{emoji} {greeting}，{username}！' + t('lp_wb2', '开始今天的工作吧'),
    t('lp_wb3', '欢迎回来') + '，{username}！{greeting} {emoji}',
    '{greeting}，{username}！' + t('lp_wb4', '准备好了吗？') + ' {emoji}',
  ],
  getUserName: (response: any) => response.data?.username || 'CHENY',
})
