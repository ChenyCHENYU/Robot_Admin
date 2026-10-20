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
