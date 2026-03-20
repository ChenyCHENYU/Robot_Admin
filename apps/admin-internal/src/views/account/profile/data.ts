import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export interface ProfileFormData {
  username: string
  nickname: string
  email: string
  phone: string
  bio: string
  avatar: string
}

export interface ProfileInfo {
  username: string
  nickname: string
  email: string
  phone: string
  bio: string
  avatar: string
  role: string
  department: string
  createTime: string
  lastLoginTime: string
  lastLoginIp: string
}

// ==================== 表单验证规则 ====================
export const PROFILE_FORM_RULES: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2-20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
}

// ==================== 默认表单数据 ====================
export const DEFAULT_PROFILE_FORM: ProfileFormData = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  avatar: '',
}

// ==================== Mock 数据 ====================
export const MOCK_PROFILE: ProfileInfo = {
  username: 'CHENY',
  nickname: 'ChenYu',
  email: 'ycyplus@gmail.com',
  phone: '138****8000',
  bio: '一只小趴菜 | 全栈开发者',
  avatar: '/robot-avatar.png',
  role: '系统管理员',
  department: '技术部',
  createTime: '2025-01-15 09:30:00',
  lastLoginTime: '2026-03-04 08:15:22',
  lastLoginIp: '192.168.1.100',
}

// ==================== 信息展示配置 ====================
export const ACCOUNT_INFO_ITEMS = [
  { label: '用户名', key: 'username', icon: 'i-mdi:account-outline' },
  { label: '角色', key: 'role', icon: 'i-mdi:shield-account-outline' },
  { label: '部门', key: 'department', icon: 'i-mdi:domain' },
  { label: '注册时间', key: 'createTime', icon: 'i-mdi:calendar-plus-outline' },
  {
    label: '上次登录',
    key: 'lastLoginTime',
    icon: 'i-mdi:clock-outline',
  },
  { label: '登录 IP', key: 'lastLoginIp', icon: 'i-mdi:ip-network-outline' },
] as const
