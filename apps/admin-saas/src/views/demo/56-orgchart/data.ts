/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-11
 * @FilePath: \Robot_Admin\src\views\demo\56-orgchart\data.ts
 * @Description: C_OrgChart 组织架构图演示页面 - 数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { OrgChartNode } from '@robot-admin/naive-ui-components'

/** 演示用组织架构数据 */
export const orgData: OrgChartNode = {
  id: '1',
  label: '张总',
  subtitle: 'CEO · 首席执行官',
  avatar: 'https://i.pravatar.cc/80?img=1',
  data: {
    email: 'zhangzong@company.com',
    phone: '138****8001',
    dept: '总裁办',
  },
  children: [
    {
      id: '2',
      label: '李副总',
      subtitle: '技术VP',
      avatar: 'https://i.pravatar.cc/80?img=2',
      data: { email: 'lifuzong@company.com', dept: '技术中心' },
      children: [
        {
          id: '5',
          label: '王主管',
          subtitle: '前端主管',
          avatar: 'https://i.pravatar.cc/80?img=5',
          data: { dept: '前端组', headcount: 3 },
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
          data: { dept: '后端组', headcount: 2 },
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
      data: { email: 'chenfuzong@company.com', dept: '产品中心' },
      children: [
        {
          id: '7',
          label: '郑经理',
          subtitle: '产品经理',
          avatar: 'https://i.pravatar.cc/80?img=7',
          data: { dept: '产品设计组' },
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
      data: { email: 'huangfuzong@company.com', dept: '运营中心' },
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
]

/** 连线样式选项 */
export const LINE_STYLE_OPTIONS = [
  { value: 'rounded', label: '圆角连线' },
  { value: 'straight', label: '直角连线' },
  { value: 'stepped', label: '阶梯连线' },
]

/** 功能特性列表 */
export const FEATURES = [
  { icon: 'mdi:cursor-move', title: '拖拽平移', desc: '按住鼠标拖动画布' },
  {
    icon: 'mdi:magnify-plus-outline',
    title: '滚轮缩放',
    desc: '滚轮控制缩放比例',
  },
  {
    icon: 'mdi:unfold-less-horizontal',
    title: '节点折叠',
    desc: '点击 +/- 折叠子树',
  },
  {
    icon: 'mdi:arrow-decision-outline',
    title: '双向布局',
    desc: '支持垂直 / 水平方向',
  },
  {
    icon: 'mdi:cursor-default-click-outline',
    title: '节点交互',
    desc: '点击节点查看详情',
  },
  { icon: 'mdi:palette-outline', title: 'CSS 变量', desc: '支持主题自适应' },
]
