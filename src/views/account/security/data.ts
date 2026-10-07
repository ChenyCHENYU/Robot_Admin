/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: security 页面表单与业务配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  PRESET_RULES,
  type FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type { AccountLoginRecord, AccountSecuritySetting } from '@/api/account'

// ==================== 类型定义 ====================
export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export type LoginRecord = AccountLoginRecord

export type SecuritySetting = AccountSecuritySetting

// ==================== 表单验证规则 ====================
export const PASSWORD_FORM_OPTIONS: FormOption<ChangePasswordForm>[] = [
  {
    prop: 'oldPassword',
    label: '当前密码',
    type: 'input',
    placeholder: '请输入当前密码',
    attrs: {
      type: 'password',
      showPasswordOn: 'click',
      autocomplete: 'current-password',
    },
    rules: [PRESET_RULES.required('当前密码')],
  },
  {
    prop: 'newPassword',
    label: '新密码',
    type: 'input',
    placeholder: '请输入新密码',
    attrs: {
      type: 'password',
      showPasswordOn: 'click',
      autocomplete: 'new-password',
    },
    rules: [
      PRESET_RULES.required('新密码'),
      PRESET_RULES.length('密码', 8, 32),
      {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: '需包含大小写字母和数字',
        trigger: 'blur',
      },
    ],
  },
  {
    prop: 'confirmPassword',
    label: '确认密码',
    type: 'input',
    placeholder: '请再次输入新密码',
    attrs: {
      type: 'password',
      showPasswordOn: 'click',
      autocomplete: 'new-password',
    },
    rules: [PRESET_RULES.required('确认密码')],
    dependsOn: ['newPassword'],
    crossFieldValidator: model =>
      model.confirmPassword !== model.newPassword
        ? '两次输入的密码不一致'
        : null,
  },
]

// ==================== 默认表单数据 ====================
export const DEFAULT_PASSWORD_FORM: ChangePasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

// ==================== 安全配置项 ====================
export const SECURITY_SETTINGS: SecuritySetting[] = [
  {
    key: 'password',
    label: '登录密码',
    description: '定期更换密码可以提高账户安全性',
    icon: 'i-mdi-lock-outline',
    enabled: true,
    action: '修改',
  },
  {
    key: 'twoFactor',
    label: '两步验证',
    description: '开启后登录需要额外的验证码，推荐开启',
    icon: 'i-mdi-cellphone-key',
    enabled: false,
  },
  {
    key: 'emailBind',
    label: '邮箱绑定',
    description: '已绑定邮箱：ycyplus@gmail.com',
    icon: 'i-mdi-email-check-outline',
    enabled: true,
    action: '更换',
  },
  {
    key: 'phoneBind',
    label: '手机绑定',
    description: '已绑定手机：138****8000',
    icon: 'i-mdi-cellphone-check',
    enabled: true,
    action: '更换',
  },
]

// ==================== Mock 登录记录 ====================
export const MOCK_LOGIN_RECORDS: LoginRecord[] = [
  {
    id: '1',
    time: '2026-03-04 08:15:22',
    ip: '192.168.1.100',
    location: '中国·上海',
    device: 'Windows 11',
    browser: 'Chrome 133',
    status: 'success',
  },
  {
    id: '2',
    time: '2026-03-03 19:30:45',
    ip: '192.168.1.100',
    location: '中国·上海',
    device: 'Windows 11',
    browser: 'Chrome 133',
    status: 'success',
  },
  {
    id: '3',
    time: '2026-03-03 14:22:11',
    ip: '10.0.0.55',
    location: '中国·北京',
    device: 'macOS 15',
    browser: 'Safari 19',
    status: 'failed',
  },
  {
    id: '4',
    time: '2026-03-02 09:05:33',
    ip: '192.168.1.100',
    location: '中国·上海',
    device: 'Windows 11',
    browser: 'Chrome 133',
    status: 'success',
  },
  {
    id: '5',
    time: '2026-03-01 20:18:07',
    ip: '172.16.0.88',
    location: '中国·深圳',
    device: 'Android 16',
    browser: 'Chrome Mobile',
    status: 'success',
  },
]
