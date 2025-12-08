import type { FormOption } from '@/types/modules/form'
import { PRESET_RULES } from '@/utils/v_verify'

const { required, length, email, mobile, range } = PRESET_RULES

// ==================== 表单字段配置 ====================

/**
 * 卡片布局表单字段配置
 */
export const FORM_OPTIONS: FormOption[] = [
  // 基础信息分组
  {
    type: 'input' as const,
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    layout: { group: 'basic' },
    rules: [required('用户名'), length('用户名', 3, 20)],
  },
  {
    type: 'input' as const,
    prop: 'realName',
    label: '真实姓名',
    placeholder: '请输入真实姓名',
    layout: { group: 'basic' },
    rules: [required('真实姓名'), length('真实姓名', 2, 20)],
  },
  {
    type: 'inputNumber' as const,
    prop: 'age',
    label: '年龄',
    layout: { group: 'basic' },
    rules: [required('年龄'), range('年龄', 1, 120)],
    attrs: { min: 1, max: 120 },
  },
  {
    type: 'select' as const,
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    layout: { group: 'basic' },
    rules: [required('性别')],
    children: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
    ],
  },

  // 联系方式分组
  {
    type: 'input' as const,
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱地址',
    layout: { group: 'contact' },
    rules: [required('邮箱'), email('邮箱')],
  },
  {
    type: 'input' as const,
    prop: 'phone',
    label: '手机号',
    placeholder: '请输入手机号',
    layout: { group: 'contact' },
    rules: [required('手机号'), mobile('手机号')],
  },
  {
    type: 'textarea' as const,
    prop: 'address',
    label: '地址',
    placeholder: '请输入详细地址',
    layout: { group: 'contact' },
    rules: [required('地址'), length('地址', 5, 200)],
    attrs: { rows: 3 },
  },
  {
    type: 'input' as const,
    prop: 'wechat',
    label: '微信号',
    placeholder: '请输入微信号',
    layout: { group: 'contact' },
    rules: [length('微信号', 6, 20)],
  },

  // 偏好设置分组
  {
    type: 'datePicker' as const,
    prop: 'birthday',
    label: '出生日期',
    placeholder: '请选择出生日期',
    layout: { group: 'preferences' },
  },
  {
    type: 'checkbox' as const,
    prop: 'hobbies',
    label: '兴趣爱好',
    layout: { group: 'preferences' },
    rules: [required('兴趣爱好')],
    children: [
      { value: 'reading', label: '阅读' },
      { value: 'music', label: '音乐' },
      { value: 'sports', label: '运动' },
      { value: 'travel', label: '旅行' },
    ],
  },
  {
    type: 'switch' as const,
    prop: 'newsletter',
    label: '订阅邮件',
    layout: { group: 'preferences' },
  },
  {
    type: 'rate' as const,
    prop: 'satisfaction',
    label: '满意度评分',
    layout: { group: 'preferences' },
    rules: [required('满意度评分'), range('满意度评分', 1, 5)],
    attrs: { allowHalf: true },
  },
  {
    type: 'slider' as const,
    prop: 'volume',
    label: '音量设置',
    layout: { group: 'preferences' },
    attrs: { min: 0, max: 100 },
  },
]

// ==================== 布局配置 ====================

/**
 * 卡片布局配置
 */
export const CARD_LAYOUT_CONFIG = {
  card: {
    // 分组配置
    groups: [
      {
        key: 'basic',
        title: '基础信息',
        description: '用户的基本身份信息',
        icon: 'i-mdi-account',
      },
      {
        key: 'contact',
        title: '联系方式',
        description: '联系方式和地址信息',
        icon: 'i-mdi-phone',
      },
      {
        key: 'preferences',
        title: '偏好设置',
        description: '个人偏好和系统设置',
        icon: 'i-mdi-cog',
      },
    ],
    // 布局方向
    direction: 'vertical' as const,
    // 功能开关
    showLayoutConfig: true,
    showActionPanel: true,
    showProgress: true,
  },
}

// ==================== 示例数据（保留供需要时使用）====================

/**
 * 表单示例数据
 */
export const DEMO_FORM_DATA = {
  username: 'cheny_888',
  realName: 'CHENY',
  age: 28,
  gender: 'male',
  email: 'demo@cheny-test.com',
  phone: '16888888888',
  address: '西安市未央区某某街道188号',
  wechat: 'demo_cheny',
  birthday: '1995-06-15',
  hobbies: ['reading', 'music'],
  newsletter: true,
  satisfaction: 4.5,
  volume: 60,
}

// ==================== 调试面板配置 ====================

/**
 * 调试面板标签页配置
 */
export const DEBUG_TABS = [
  {
    name: 'formData',
    tab: '表单数据',
  },
  {
    name: 'options',
    tab: '字段配置',
  },
  {
    name: 'layoutConfig',
    tab: '布局配置',
  },
] as const

// ==================== 消息文本配置 ====================

/**
 * 操作提示文本
 */
export const MESSAGES = {
  submitSuccess: '表单提交成功！',
  submitError: '表单提交失败',
  resetSuccess: '表单已重置',
} as const

/**
 * 调试面板配置
 */
export const DEBUG_CONFIG = {
  title: '调试信息',
  showInDev: true,
} as const
