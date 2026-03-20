/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 08:55:05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:00:00
 * @FilePath: \Robot_Admin\src\views\demo\04-time\data.ts
 * @Description: 时间选择器组件演示数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 公共配置属性
export const commonAttrs = {
  small: { size: 'small', clearable: true },
  medium: { size: 'medium', clearable: true },
  large: { size: 'large', clearable: false },
} as const

// 场景配置类型
export interface TimeSceneConfig {
  id: string
  title: string
  tag: string
  tagType: 'default' | 'info' | 'success' | 'warning' | 'error'
  description: string
  mode: 'single' | 'range'
  props: Record<string, any>
}

// 时间场景配置
export const timeScenes: TimeSceneConfig[] = [
  {
    id: 'basic',
    title: '基础时间段选择',
    tag: '默认场景',
    tagType: 'info',
    description:
      '适用于选择工作时间段、会议时间等场景，支持30分钟步进，时间格式为 HH:mm',
    mode: 'range',
    props: {
      mode: 'range',
      attrs: commonAttrs.medium,
    },
  },
  {
    id: 'precise',
    title: '精确时分秒选择',
    tag: '高精度',
    tagType: 'warning',
    description:
      '适用于需要精确到秒的场景，如定时任务、倒计时设置等，默认显示当前时间',
    mode: 'range',
    props: {
      mode: 'range',
      format: 'HH:mm:ss',
      useSeconds: true,
      minuteStep: 1,
      secondStep: 1,
      attrs: commonAttrs.medium,
    },
  },
  {
    id: 'single',
    title: '单个时间选择',
    tag: '单选模式',
    tagType: 'success',
    description: '适用于闹钟设置、提醒时间等单个时间点选择场景',
    mode: 'single',
    props: {
      mode: 'single',
      placeholder: '请选择提醒时间',
      attrs: commonAttrs.medium,
    },
  },
  {
    id: 'workShift',
    title: '智能时间限制选择',
    tag: '时间限制',
    tagType: 'error',
    description:
      '启用智能时间限制功能，结束时间选择器中会自动隐藏早于开始时间的选项，确保逻辑正确性',
    mode: 'range',
    props: {
      mode: 'range',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间',
      hourStep: 1,
      minuteStep: 30,
      enableTimeRestriction: true,
      attrs: commonAttrs.large,
    },
  },
  {
    id: 'custom',
    title: '自定义样式和行为',
    tag: '自定义',
    tagType: 'default',
    description: '展示组件的自定义能力，包括样式定制、事件处理等',
    mode: 'range',
    props: {
      mode: 'range',
      attrs: commonAttrs.small,
    },
  },
]
