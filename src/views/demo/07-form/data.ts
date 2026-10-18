/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 16:24:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:27:35
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\data.ts
 * @Description: 表单演示页面入口文件  - 基本数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { FormModel, LayoutType } from '@robot-admin/naive-ui-components'

/** 表单、搜索与表格共用的三档密度。 */
export const DENSITY_OPTIONS = [
  { label: '紧凑', value: 'compact' },
  { label: '标准', value: 'default' },
  { label: '舒适', value: 'comfortable' },
] as const

/**
 * 布局选项配置
 */
export const layoutOptions = [
  { label: '默认布局', value: 'default' as const },
  { label: '内联布局', value: 'inline' as const },
  { label: '网格布局', value: 'grid' as const },
  { label: '卡片布局', value: 'card' as const },
  { label: '标签页布局', value: 'tabs' as const },
  { label: '步骤布局', value: 'steps' as const },
  { label: '动态布局', value: 'dynamic' as const },
  { label: '自定义渲染', value: 'custom' as const },
] as const

/**
 * 布局描述信息映射表
 */
export const layoutDescriptions: Record<
  LayoutType,
  { title: string; content: string }
> = {
  default: {
    title: '默认布局',
    content:
      '标准的垂直表单布局，适用于大多数场景，支持富文本编辑器等复杂组件。',
  },
  inline: {
    title: '内联布局',
    content: '水平排列的表单布局，适用于简单表单或搜索条件，自动过滤复杂组件。',
  },
  grid: {
    title: '网格布局',
    content: '基于栅格系统的响应式布局，可以灵活控制每个表单项的宽度和位置。',
  },
  card: {
    title: '卡片布局',
    content: '将表单项按功能分组，每个分组显示在独立的卡片中，层次清晰。',
  },
  tabs: {
    title: '标签页布局',
    content: '将表单项分散到不同的标签页中，适用于内容较多的表单。',
  },
  steps: {
    title: '步骤布局',
    content: '引导用户按步骤填写表单，适用于注册、向导等场景。',
  },
  dynamic: {
    title: '动态布局',
    content: '支持动态添加、删除、显示/隐藏字段的表单布局。',
  },
  custom: {
    title: '自定义渲染',
    content: '支持自定义渲染效果和高级控件的表单布局。',
  },
}

const baseTestData = {
  username: 'cheny_888',
  realName: 'CHENY',
  age: 28,
  gender: 'male',
  email: 'demo@cheny-test.com',
  phone: '16888888888',
  password: 'Demo123456',
  address: '西安市未央区某某街道188号',
  description: '',
}

// Naive 日期控件的 value 使用时间戳；每套示例只提供该布局真实存在的字段。
const birthday = new Date(1995, 5, 15).getTime()
const testDataByLayout: Record<LayoutType, FormModel> = {
  default: {
    ...baseTestData,
    description: '<p>这是<strong>富文本编辑器</strong>示例</p>',
  },
  inline: {
    username: baseTestData.username,
    email: baseTestData.email,
    gender: baseTestData.gender,
    age: baseTestData.age,
    city: 'shanghai',
  },
  grid: {
    name: baseTestData.realName,
    email: baseTestData.email,
    phone: baseTestData.phone,
    gender: baseTestData.gender,
    age: baseTestData.age,
    city: 'shanghai',
    company: 'Robot Admin 团队',
    address: baseTestData.address,
    zipcode: '710000',
    birthday,
    profession: 'frontend',
    bio: '专注于企业管理系统与 Vue 组件开发。',
  },
  card: {
    username: baseTestData.username,
    realName: baseTestData.realName,
    age: baseTestData.age,
    gender: baseTestData.gender,
    email: baseTestData.email,
    phone: baseTestData.phone,
    address: baseTestData.address,
    wechat: 'demo_cheny',
    birthday,
    hobbies: ['reading', 'music'],
    newsletter: true,
    satisfaction: 4.5,
    volume: 60,
  },
  tabs: {
    realName: baseTestData.realName,
    nickname: 'Robot 开发者',
    gender: baseTestData.gender,
    birthday,
    education: 'bachelor',
    mobile: baseTestData.phone,
    email: baseTestData.email,
    wechat: 'demo_cheny',
    qq: '123456789',
    address: baseTestData.address,
    username: baseTestData.username,
    password: baseTestData.password,
    confirmPassword: baseTestData.password,
    securityQuestion: '喜欢的开源项目？',
    securityAnswer: 'Robot Admin',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    notifications: ['email', 'push'],
    darkMode: false,
    autoSave: true,
    company: 'Robot Admin 团队',
    position: '前端工程师',
    bio: '专注于企业管理系统与 Vue 组件开发。',
    remarks: '仅用于演示',
  },
  steps: {
    name: baseTestData.realName,
    idCard: '110101199001010010',
    birthday,
    gender: baseTestData.gender,
    phone: baseTestData.phone,
    email: baseTestData.email,
    address: baseTestData.address,
    company: 'Robot Admin 团队',
    password: baseTestData.password,
    confirmPassword: baseTestData.password,
    securityQuestion: '喜欢的开源项目？',
    securityAnswer: 'Robot Admin',
    agreements: ['user', 'privacy'],
    newsletter: true,
    remarks: '仅用于演示',
  },
  dynamic: {
    name: baseTestData.realName,
    gender: baseTestData.gender,
    age: baseTestData.age,
    isActive: true,
    rating: 4,
    description: '支持添加、排序和隐藏动态字段。',
  },
  custom: {
    employeeId: 'EMP123456',
    fullName: baseTestData.realName,
    gender: baseTestData.gender,
    birthDate: birthday,
    phone: baseTestData.phone,
    email: baseTestData.email,
    address: baseTestData.address,
    department: 'tech',
    position: 'frontend',
    joinDate: new Date(2024, 0, 2).getTime(),
    salary: 18000,
    skills: ['vue', 'node'],
    performance: 4.5,
    isActive: true,
    remarks: '仅用于演示',
  },
}

/**
 * 测试数据配置管理器
 */
export const testDataConfig = {
  /**
   * 获取测试数据
   */
  getTestData(layoutType: LayoutType): FormModel {
    return structuredClone(testDataByLayout[layoutType])
  },
}
