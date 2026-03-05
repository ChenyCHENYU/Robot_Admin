/**
 * @Description: C_Login 通用登录组件 - 类型定义
 */

// ================= 功能开关 =================
export interface LoginFeatures {
  /** 是否显示密码登录（默认 true） */
  passwordLogin?: boolean
  /** 是否显示验证码登录（默认 true） */
  captchaLogin?: boolean
  /** 是否显示扫码登录（默认 true） */
  qrcodeLogin?: boolean
  /** 是否显示其他账号登录（默认 true） */
  socialLogin?: boolean
  /** 是否显示注册账号（默认 true） */
  register?: boolean
  /** 是否启用人机验证拼图（默认 true） */
  captchaVerify?: boolean
  /** 是否显示记住我（默认 true） */
  rememberMe?: boolean
  /** 是否显示忘记密码（默认 true） */
  forgotPassword?: boolean
}

// ================= 社交登录 =================
export interface SocialProvider {
  key: string
  label: string
  /** mdi 图标名称 */
  icon: string
}

// ================= 表单数据 =================
export interface PasswordFormData {
  username: string
  password: string
}

export interface CaptchaFormData {
  account: string
  code: string
}

export interface RegisterFormData {
  phone: string
  code: string
  password: string
  confirmPassword: string
}

// ================= 组件 Props =================
export interface LoginProps {
  /** 标题文字 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** Logo icon 名称（mdi:xxx），不传则不显示图标 */
  logoIcon?: string
  /** 功能开关配置 */
  features?: LoginFeatures
  /** 社交登录提供商列表 */
  socialProviders?: SocialProvider[]
  /** 扫码登录二维码 URL */
  qrcodeUrl?: string
  /** localStorage key（记住我） */
  storageKey?: string
  /** 外部传入的 loading 状态 */
  loading?: boolean
  /** 表单默认用户名（Demo / 预填场景） */
  defaultUsername?: string
  /** 表单默认密码（Demo / 预填场景） */
  defaultPassword?: string
}

// ================= 默认社交登录配置 =================
export const DEFAULT_SOCIAL_PROVIDERS: SocialProvider[] = [
  { key: 'github', label: 'GitHub', icon: 'mdi:github' },
  { key: 'wechat', label: '微信', icon: 'mdi:wechat' },
  { key: 'qq', label: 'QQ', icon: 'mdi:qqchat' },
]

// ================= 默认功能开关 =================
export const DEFAULT_FEATURES: Required<LoginFeatures> = {
  passwordLogin: true,
  captchaLogin: true,
  qrcodeLogin: true,
  socialLogin: true,
  register: true,
  captchaVerify: true,
  rememberMe: true,
  forgotPassword: true,
}
