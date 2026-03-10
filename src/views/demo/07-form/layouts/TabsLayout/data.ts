/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-08 22:09:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 22:44:34
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\TabsLayout\data.ts
 * @Description: 标签布局演示页面 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { FormOption } from '@robot-admin/naive-ui-components'
import { PRESET_RULES } from '@robot-admin/form-validate'
import { reactive } from 'vue'

// ================= 验证规则 =================
export const { required, length, email, mobile } = PRESET_RULES

// ================= 配置选项 =================
export const placementOptions = [
  { label: '顶部', value: 'top' },
  { label: '底部', value: 'bottom' },
  { label: '左侧', value: 'left' },
  { label: '右侧', value: 'right' },
]

// ================= 布局配置 =================
export const layoutConfig = reactive({
  tabs: {
    tabs: [
      {
        key: 'basic',
        title: '基本信息',
        description: '填写用户的基本个人信息',
        icon: 'i-carbon-user',
      },
      {
        key: 'contact',
        title: '联系方式',
        description: '填写联系电话、邮箱等信息',
        icon: 'i-carbon-phone',
      },
      {
        key: 'security',
        title: '账户安全',
        description: '设置登录密码和安全问题',
        icon: 'i-carbon-security',
      },
      {
        key: 'preferences',
        title: '偏好设置',
        description: '个性化设置和通知偏好',
        icon: 'i-carbon-settings',
      },
      {
        key: 'additional',
        title: '附加信息',
        description: '其他补充信息和备注',
        icon: 'i-carbon-document',
      },
    ],
    type: 'line' as 'line' | 'card' | 'segment',
    size: 'medium' as 'small' | 'medium' | 'large',
    placement: 'top' as 'top' | 'bottom' | 'left' | 'right',
    animated: true,
    showTabHeader: true,
    showActions: true,
    showCount: true,
    validateBeforeSwitch: false,
    defaultTab: 'basic',
  },
})

// ================= 表单字段配置 =================
export const createFormOptions = (): FormOption[] => [
  // 基本信息标签
  {
    type: 'input',
    prop: 'realName',
    label: '真实姓名',
    placeholder: '请输入真实姓名',
    value: '',
    layout: { tab: 'basic' },
    rules: [required('真实姓名')],
    attrs: {
      clearable: true,
      prefixIcon: 'user',
    },
  },
  {
    type: 'input',
    prop: 'nickname',
    label: '昵称',
    placeholder: '请输入昵称',
    value: '',
    layout: { tab: 'basic' },
    rules: [required('昵称')],
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'radio',
    prop: 'gender',
    label: '性别',
    value: '',
    layout: { tab: 'basic' },
    rules: [required('性别')],
    children: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '其他', value: 'other' },
    ],
  },
  {
    type: 'datePicker',
    prop: 'birthday',
    label: '出生日期',
    value: null,
    layout: { tab: 'basic' },
    attrs: {
      type: 'date',
      clearable: true,
    },
  },
  {
    type: 'select',
    prop: 'education',
    label: '学历',
    value: '',
    layout: { tab: 'basic' },
    children: [
      { label: '高中及以下', value: 'high_school' },
      { label: '专科', value: 'associate' },
      { label: '本科', value: 'bachelor' },
      { label: '硕士', value: 'master' },
      { label: '博士', value: 'doctor' },
    ],
    attrs: {
      clearable: true,
    },
  },

  // 联系方式标签
  {
    type: 'input',
    prop: 'mobile',
    label: '手机号码',
    placeholder: '请输入手机号码',
    value: '',
    layout: { tab: 'contact' },
    rules: [required('手机号码'), mobile('手机号码')],
    attrs: {
      clearable: true,
      prefixIcon: 'phone',
    },
  },
  {
    type: 'input',
    prop: 'email',
    label: '电子邮箱',
    placeholder: '请输入电子邮箱',
    value: '',
    layout: { tab: 'contact' },
    rules: [required('电子邮箱'), email('电子邮箱')],
    attrs: {
      clearable: true,
      prefixIcon: 'mail',
    },
  },
  {
    type: 'input',
    prop: 'wechat',
    label: '微信号',
    placeholder: '请输入微信号',
    value: '',
    layout: { tab: 'contact' },
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'input',
    prop: 'qq',
    label: 'QQ号码',
    placeholder: '请输入QQ号码',
    value: '',
    layout: { tab: 'contact' },
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'textarea',
    prop: 'address',
    label: '联系地址',
    placeholder: '请输入详细联系地址',
    value: '',
    layout: { tab: 'contact' },
    attrs: {
      rows: 3,
      clearable: true,
    },
  },

  // 账户安全标签
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    value: '',
    layout: { tab: 'security' },
    rules: [required('用户名'), length('用户名', 3, 20)],
    attrs: {
      clearable: true,
      prefixIcon: 'user',
    },
  },
  {
    type: 'input',
    prop: 'password',
    label: '登录密码',
    placeholder: '请输入登录密码',
    value: '',
    layout: { tab: 'security' },
    rules: [required('登录密码'), length('登录密码', 6, 20)],
    attrs: {
      type: 'password',
      showPasswordOn: 'click',
      clearable: true,
    },
  },
  {
    type: 'input',
    prop: 'confirmPassword',
    label: '确认密码',
    placeholder: '请再次输入密码',
    value: '',
    layout: { tab: 'security' },
    rules: [
      required('确认密码'),
      // 跨字段校验在提交时由 C_Form 统一处理
    ],
    attrs: {
      type: 'password',
      showPasswordOn: 'click',
      clearable: true,
    },
  },
  {
    type: 'input',
    prop: 'securityQuestion',
    label: '密保问题',
    placeholder: '请设置密保问题',
    value: '',
    layout: { tab: 'security' },
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'input',
    prop: 'securityAnswer',
    label: '密保答案',
    placeholder: '请输入密保答案',
    value: '',
    layout: { tab: 'security' },
    attrs: {
      clearable: true,
    },
  },

  // 偏好设置标签
  {
    type: 'select',
    prop: 'language',
    label: '语言偏好',
    value: 'zh-CN',
    layout: { tab: 'preferences' },
    children: [
      { label: '简体中文', value: 'zh-CN' },
      { label: '繁体中文', value: 'zh-TW' },
      { label: 'English', value: 'en-US' },
      { label: '日本語', value: 'ja-JP' },
    ],
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'select',
    prop: 'timezone',
    label: '时区',
    value: 'Asia/Shanghai',
    layout: { tab: 'preferences' },
    children: [
      { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
      { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
      { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
      { label: '伦敦时间 (UTC+0)', value: 'Europe/London' },
    ],
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'checkbox',
    prop: 'notifications',
    label: '通知设置',
    value: [],
    layout: { tab: 'preferences' },
    children: [
      { label: '邮件通知', value: 'email' },
      { label: '短信通知', value: 'sms' },
      { label: '微信通知', value: 'wechat' },
      { label: '应用推送', value: 'push' },
    ],
  },
  {
    type: 'switch',
    prop: 'darkMode',
    label: '深色模式',
    value: false,
    layout: { tab: 'preferences' },
  },
  {
    type: 'switch',
    prop: 'autoSave',
    label: '自动保存',
    value: true,
    layout: { tab: 'preferences' },
  },

  // 附加信息标签
  {
    type: 'input',
    prop: 'company',
    label: '工作单位',
    placeholder: '请输入工作单位',
    value: '',
    layout: { tab: 'additional' },
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'input',
    prop: 'position',
    label: '职位',
    placeholder: '请输入职位',
    value: '',
    layout: { tab: 'additional' },
    attrs: {
      clearable: true,
    },
  },
  {
    type: 'textarea',
    prop: 'bio',
    label: '个人简介',
    placeholder: '请输入个人简介',
    value: '',
    layout: { tab: 'additional' },
    attrs: {
      rows: 4,
      clearable: true,
    },
  },
  {
    type: 'textarea',
    prop: 'remarks',
    label: '备注信息',
    placeholder: '请输入备注信息',
    value: '',
    layout: { tab: 'additional' },
    attrs: {
      rows: 3,
      clearable: true,
    },
  },
]

// ================= 模拟数据 =================
export const mockDraftData = {
  realName: '张三',
  nickname: '小张',
  gender: 'male',
  mobile: '13800138000',
  email: 'zhangsan@example.com',
}
