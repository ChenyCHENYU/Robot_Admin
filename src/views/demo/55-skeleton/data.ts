/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: C_Skeleton 骨架屏演示页面 - 数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 预设模式选项 */
export const PRESET_OPTIONS = [
  { value: 'text', label: '文本', icon: 'mdi:text' },
  { value: 'avatar', label: '头像', icon: 'mdi:account-circle' },
  { value: 'image', label: '图片', icon: 'mdi:image' },
  { value: 'card', label: '卡片', icon: 'mdi:card-outline' },
  { value: 'table', label: '表格', icon: 'mdi:table' },
  { value: 'form', label: '表单', icon: 'mdi:form-textbox' },
  { value: 'list', label: '列表', icon: 'mdi:format-list-bulleted' },
  { value: 'detail', label: '详情', icon: 'mdi:text-box-outline' },
] as const

/** 动画类型选项 */
export const ANIMATION_OPTIONS = [
  { value: 'wave', label: '波浪' },
  { value: 'pulse', label: '脉冲' },
  { value: false, label: '无动画' },
] as const
