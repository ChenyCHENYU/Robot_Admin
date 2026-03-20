import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface LoginRecord {
  id: string
  time: string
  ip: string
  location: string
  device: string
  browser: string
  status: 'success' | 'failed'
}

export interface SecuritySetting {
  key: string
  label: string
  description: string
  icon: string
  enabled: boolean
  action?: string
}

// ==================== 表单验证规则 ====================
export const PASSWORD_FORM_RULES: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度在 8-32 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: '需包含大小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
  ],
}

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
    icon: 'i-mdi:lock-outline',
    enabled: true,
    action: '修改',
  },
  {
    key: 'twoFactor',
    label: '两步验证',
    description: '开启后登录需要额外的验证码，推荐开启',
    icon: 'i-mdi:cellphone-key',
    enabled: false,
  },
  {
    key: 'emailBind',
    label: '邮箱绑定',
    description: '已绑定邮箱：ycyplus@gmail.com',
    icon: 'i-mdi:email-check-outline',
    enabled: true,
    action: '更换',
  },
  {
    key: 'phoneBind',
    label: '手机绑定',
    description: '已绑定手机：138****8000',
    icon: 'i-mdi:cellphone-check',
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
