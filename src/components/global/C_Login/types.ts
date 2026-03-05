/**
 * @Description: C_Login 通用登录组件 - 类型定义
 */

// ================= 功能开关 =================
export interface LoginFeatures {
  /** 是否显示验证码登录 tab（默认 true） */
  captchaLogin?: boolean
  /** 是否显示记住我（默认 true） */
  rememberMe?: boolean
  /** 是否显示忘记密码（默认 true） */
  forgotPassword?: boolean
  /** 是否显示其他账号登录（默认 true） */
  socialLogin?: boolean
  /** 是否显示快捷账号按钮（demo 专用，默认 false） */
  quickLogin?: boolean
  /** 是否显示注册账号（默认 true） */
  register?: boolean
  /** 是否启用人机验证拼图（默认 true） */
  captchaVerify?: boolean
}

// ================= 社交登录 =================
export interface SocialProvider {
  key: string
  label: string
  /** mdi 图标名称 */
  icon: string
}

// ================= 快捷账号 =================
export interface QuickAccount {
  label: string
  type?: 'default' | 'primary' | 'warning' | 'error' | 'info' | 'success'
  username: string
  password: string
}

// ================= 表单数据 =================
export interface PasswordFormData {
  username: string
  password: string
  rememberMe: boolean
}

export interface CaptchaFormData {
  account: string
  code: string
}

// ================= 组件 Props =================
export interface LoginProps {
  /** 标题文字 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 功能开关配置 */
  features?: LoginFeatures
  /** 社交登录提供商列表 */
  socialProviders?: SocialProvider[]
  /** 快捷账号列表（demo 演示用） */
  quickAccounts?: QuickAccount[]
  /** 外部传入的 loading 状态 */
  loading?: boolean
  /** Logo icon 名称（mdi:xxx） */
  logoIcon?: string
  /** 记住我本地存储 key */
  storageKey?: string
}

// ================= 默认社交登录配置 =================
export const DEFAULT_SOCIAL_PROVIDERS: SocialProvider[] = [
  { key: 'github', label: 'GitHub', icon: 'mdi:github' },
  { key: 'wechat', label: '微信', icon: 'mdi:wechat' },
  { key: 'qq', label: 'QQ', icon: 'mdi:qqchat' },
]

// ================= 默认功能开关 =================
export const DEFAULT_FEATURES: Required<LoginFeatures> = {
  captchaLogin: true,
  rememberMe: true,
  forgotPassword: true,
  socialLogin: true,
  quickLogin: false,
  register: true,
  captchaVerify: true,
}
