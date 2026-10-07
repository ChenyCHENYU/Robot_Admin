/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: profile 页面表单与业务配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  PRESET_RULES,
  type FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type { AccountProfile } from '@/api/account'

// ==================== 类型定义 ====================
export interface ProfileFormData {
  username: string
  nickname: string
  email: string
  phone: string
  bio: string
  avatar: string
}

export type ProfileInfo = AccountProfile

// ==================== 表单验证规则 ====================
export const PROFILE_FORM_OPTIONS: FormOption<ProfileFormData>[] = [
  {
    prop: 'nickname',
    label: '昵称',
    type: 'input',
    placeholder: '请输入昵称',
    rules: [PRESET_RULES.required('昵称'), PRESET_RULES.length('昵称', 2, 20)],
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    rules: [PRESET_RULES.required('邮箱'), PRESET_RULES.email('邮箱')],
  },
  {
    prop: 'phone',
    label: '手机',
    type: 'input',
    placeholder: '请输入手机号',
    rules: [PRESET_RULES.optional(PRESET_RULES.mobile('手机号'))],
  },
  { prop: 'bio', label: '简介', type: 'input', placeholder: '一句话介绍自己' },
]

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

export const EMPTY_PROFILE: ProfileInfo = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  avatar: '',
  role: '',
  department: '',
  createTime: '',
  lastLoginTime: '',
  lastLoginIp: '',
}

// ==================== 信息展示配置 ====================
export const ACCOUNT_INFO_ITEMS = [
  { label: '用户名', key: 'username', icon: 'i-mdi-account-outline' },
  { label: '角色', key: 'role', icon: 'i-mdi-shield-account-outline' },
  { label: '部门', key: 'department', icon: 'i-mdi-domain' },
  { label: '注册时间', key: 'createTime', icon: 'i-mdi-calendar-plus-outline' },
  {
    label: '上次登录',
    key: 'lastLoginTime',
    icon: 'i-mdi-clock-outline',
  },
  { label: '登录 IP', key: 'lastLoginIp', icon: 'i-mdi-ip-network-outline' },
] as const
