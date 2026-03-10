/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: C_OrgChart 组织架构图演示页面 - 数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { OrgChartNode } from '@robot-admin/naive-ui-components'

/** 演示用组织架构数据 */
export const orgData: OrgChartNode = {
  id: '1',
  label: '张总',
  subtitle: 'CEO',
  avatar: 'https://i.pravatar.cc/80?img=1',
  children: [
    {
      id: '2',
      label: '李副总',
      subtitle: '技术VP',
      avatar: 'https://i.pravatar.cc/80?img=2',
      children: [
        {
          id: '5',
          label: '王主管',
          subtitle: '前端主管',
          avatar: 'https://i.pravatar.cc/80?img=5',
          children: [
            {
              id: '9',
              label: '赵工',
              subtitle: '高级前端',
              avatar: 'https://i.pravatar.cc/80?img=9',
            },
            {
              id: '10',
              label: '钱工',
              subtitle: '前端工程师',
              avatar: 'https://i.pravatar.cc/80?img=10',
            },
            {
              id: '11',
              label: '孙工',
              subtitle: '前端工程师',
              avatar: 'https://i.pravatar.cc/80?img=11',
            },
          ],
        },
        {
          id: '6',
          label: '刘主管',
          subtitle: '后端主管',
          avatar: 'https://i.pravatar.cc/80?img=6',
          children: [
            {
              id: '12',
              label: '周工',
              subtitle: 'Java 高级',
              avatar: 'https://i.pravatar.cc/80?img=12',
            },
            {
              id: '13',
              label: '吴工',
              subtitle: 'Go 工程师',
              avatar: 'https://i.pravatar.cc/80?img=13',
            },
          ],
        },
      ],
    },
    {
      id: '3',
      label: '陈副总',
      subtitle: '产品VP',
      avatar: 'https://i.pravatar.cc/80?img=3',
      children: [
        {
          id: '7',
          label: '郑经理',
          subtitle: '产品经理',
          avatar: 'https://i.pravatar.cc/80?img=7',
          children: [
            {
              id: '14',
              label: '冯设计',
              subtitle: 'UI 设计师',
              avatar: 'https://i.pravatar.cc/80?img=14',
            },
          ],
        },
      ],
    },
    {
      id: '4',
      label: '黄副总',
      subtitle: '运营VP',
      avatar: 'https://i.pravatar.cc/80?img=4',
      children: [
        {
          id: '8',
          label: '许经理',
          subtitle: '运营总监',
          avatar: 'https://i.pravatar.cc/80?img=8',
        },
      ],
    },
  ],
}

/** 布局方向选项 */
export const DIRECTION_OPTIONS = [
  { value: 'vertical', label: '垂直布局' },
  { value: 'horizontal', label: '水平布局' },
] as const

/** 连线样式选项 */
export const LINE_STYLE_OPTIONS = [
  { value: 'rounded', label: '圆角' },
  { value: 'straight', label: '直角' },
  { value: 'stepped', label: '阶梯' },
] as const
