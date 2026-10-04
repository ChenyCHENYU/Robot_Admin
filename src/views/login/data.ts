/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:35:57
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\login\data.ts
 * @Description: 登录页数据配置（供 C_Login 组件 + useLoginController 使用）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { LoginFeatures } from '@robot-admin/naive-ui-components'
import type { WelcomeConfig } from '@/composables/useLoginController'
import type { LoginResponse } from '@/api/auth'
import type { AuthMode } from '@/api/auth.contract'

/** 演示认证保留体验账号；远端认证不向用户预填公开凭据。 */
export const resolveLoginDefaults = (
  authMode: AuthMode
): { username: string; password: string } =>
  authMode === 'mock'
    ? { username: 'CHENY', password: '123456' }
    : { username: '', password: '' }

// ================= 登录功能开关 =================
export const LOGIN_FEATURES: LoginFeatures = {
  passwordLogin: true,
  captchaLogin: false,
  qrcodeLogin: false,
  socialLogin: false,
  register: false,
  captchaVerify: true,
  rememberMe: false,
  forgotPassword: false,
}

/** 演示也保留人机验证交互；Mock 拼图不是安全边界。 */
export const resolveLoginFeatures = (): LoginFeatures => ({
  ...LOGIN_FEATURES,
})

// ================= 欢迎语配置（工厂函数，接受 i18n 翻译函数） =================
export const createWelcomeConfig = (
  t: (key: string, fallback: string) => string
): WelcomeConfig<LoginResponse> => ({
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
  getUserName: (response: LoginResponse) =>
    response.data.user?.displayName || response.data.user?.username || 'User',
})

/** 登录面板采用固定深色品牌背景，公司控件沿用同一色板。 */
export const LOGIN_COMPANY_SELECT_THEME = {
  peers: {
    InternalSelection: {
      color: 'rgba(7, 14, 27, 0.35)',
      colorActive: 'rgba(7, 14, 27, 0.35)',
      textColor: 'rgba(255, 255, 255, 0.95)',
      placeholderColor: 'rgba(218, 230, 250, 0.55)',
      border: '1px solid rgba(139, 176, 247, 0.25)',
      borderHover: '1px solid #77a7ff',
      borderFocus: '1px solid #77a7ff',
      borderActive: '1px solid #77a7ff',
      colorDisabled: 'rgba(7, 14, 27, 0.2)',
      textColorDisabled: 'rgba(218, 230, 250, 0.8)',
      placeholderColorDisabled: 'rgba(218, 230, 250, 0.55)',
    },
    InternalSelectMenu: {
      color: '#18263d',
      optionTextColor: '#e8eef9',
      optionTextColorActive: '#a9c8ff',
      optionColorPending: 'rgba(119, 167, 255, 0.12)',
      optionColorActive: 'rgba(119, 167, 255, 0.18)',
      optionColorActivePending: 'rgba(119, 167, 255, 0.24)',
      optionCheckColor: '#a9c8ff',
      optionTextColorPressed: '#cfe1ff',
    },
  },
}
