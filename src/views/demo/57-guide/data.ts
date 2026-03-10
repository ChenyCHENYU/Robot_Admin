/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: C_Guide 用户引导演示页面 - 数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { GuideStep } from '@robot-admin/naive-ui-components'

/** 演示引导步骤 */
export const demoSteps: GuideStep[] = [
  {
    element: '#guide-target-title',
    popover: {
      title: '页面标题',
      description:
        '这是用户引导演示页面的标题区域，展示 C_Guide 组件的核心能力。',
      side: 'bottom',
    },
    group: '基础',
  },
  {
    element: '#guide-target-panel',
    popover: {
      title: '配置面板',
      description: '在这里可以切换不同的引导配置参数，实时预览效果。',
      side: 'bottom',
    },
    group: '基础',
  },
  {
    element: '#guide-target-features',
    popover: {
      title: '功能特性',
      description:
        '展示了 C_Guide 增强版支持的所有核心功能：步骤分组、键盘导航、回调、持久化等。',
      side: 'top',
    },
    group: '高级',
  },
  {
    element: '#guide-target-action',
    popover: {
      title: '操作按钮',
      description:
        '点击这些按钮可以启动不同配置的引导流程，也可以重置已完成状态。',
      side: 'left',
    },
    group: '高级',
  },
]

/** 功能特性列表 */
export const FEATURE_LIST = [
  {
    icon: 'mdi:group',
    title: '步骤分组',
    desc: '通过 group 字段将步骤分为不同分类',
  },
  { icon: 'mdi:keyboard', title: '键盘导航', desc: '支持方向键和 Esc 键控制' },
  {
    icon: 'mdi:callback',
    title: '步骤回调',
    desc: '每个步骤支持 onHighlightStarted / onDeselected 回调',
  },
  {
    icon: 'mdi:palette',
    title: '主题自定义',
    desc: '通过 CSS 变量覆盖弹层颜色、圆角等',
  },
  {
    icon: 'mdi:database',
    title: '完成持久化',
    desc: '记住已完成的引导，不再重复展示',
  },
  {
    icon: 'mdi:skip-forward',
    title: '条件跳过',
    desc: '通过 skipIf 回调跳过不符合条件的步骤',
  },
] as const
