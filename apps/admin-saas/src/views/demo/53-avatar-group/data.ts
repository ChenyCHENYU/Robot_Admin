/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\53-avatar-group\data.ts
 * @Description: 头像组演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { AvatarItem } from '@robot-admin/naive-ui-components'

/** 功能特性 */
export const FEATURE_LIST = [
  {
    icon: 'mdi:account-multiple',
    title: '堆叠展示',
    desc: '头像重叠排列，节省空间',
    tag: '核心',
  },
  {
    icon: 'mdi:counter',
    title: '溢出 +N',
    desc: '超出最大数量自动显示 +N',
    tag: '核心',
  },
  {
    icon: 'mdi:circle-slice-8',
    title: '在线状态',
    desc: '在线 / 离线 / 忙碌 / 离开',
    tag: '状态',
  },
  {
    icon: 'mdi:format-letter-case',
    title: '首字母头像',
    desc: '无图片时自动生成首字母',
    tag: '样式',
  },
  {
    icon: 'mdi:cursor-default-click',
    title: '可交互',
    desc: '头像和 +N 均可点击',
    tag: '交互',
  },
  {
    icon: 'mdi:shape',
    title: '圆形/方形',
    desc: '两种形状可切换',
    tag: '样式',
  },
]

export const TAG_TYPE_MAP: Record<string, string> = {
  核心: 'primary',
  状态: 'success',
  样式: 'info',
  交互: 'warning',
}

/** ========== 场景 1: 团队协作 ========== */
export const TEAM_MEMBERS: AvatarItem[] = [
  {
    id: 1,
    name: 'CHENY',
    src: 'https://i.pravatar.cc/150?u=cheny',
    status: 'online',
  },
  {
    id: 2,
    name: '林晓',
    src: 'https://i.pravatar.cc/150?u=linxiao',
    status: 'online',
  },
  {
    id: 3,
    name: '张伟',
    src: 'https://i.pravatar.cc/150?u=zhangwei',
    status: 'busy',
  },
  {
    id: 4,
    name: '王芳',
    src: 'https://i.pravatar.cc/150?u=wangfang',
    status: 'away',
  },
  {
    id: 5,
    name: '李明',
    src: 'https://i.pravatar.cc/150?u=liming',
    status: 'offline',
  },
  {
    id: 6,
    name: '赵敏',
    src: 'https://i.pravatar.cc/150?u=zhaomin',
    status: 'online',
  },
  {
    id: 7,
    name: '孙涛',
    src: 'https://i.pravatar.cc/150?u=suntao',
    status: 'offline',
  },
  {
    id: 8,
    name: '周杰',
    src: 'https://i.pravatar.cc/150?u=zhoujie',
    status: 'online',
  },
]

/** ========== 场景 2: 任务分配 (无图片，测试 fallback) ========== */
export const TASK_ASSIGNEES: AvatarItem[] = [
  { id: 't1', name: '前端小组', status: 'online' },
  { id: 't2', name: '后端小组', status: 'online' },
  { id: 't3', name: 'UI 设计', status: 'busy' },
  { id: 't4', name: '测试团队', status: 'away' },
  { id: 't5', name: 'DevOps', status: 'online' },
  { id: 't6', name: '产品中心', status: 'offline' },
  { id: 't7', name: '数据分析', status: 'online' },
  { id: 't8', name: '安全审计', status: 'away' },
  { id: 't9', name: '客服支持', status: 'offline' },
  { id: 't10', name: 'AI 实验室', status: 'online' },
]

/** ========== 场景 3: 项目贡献者 (混合头像) ========== */
export const CONTRIBUTORS: AvatarItem[] = [
  {
    id: 'c1',
    name: 'Alice Chen',
    src: 'https://i.pravatar.cc/150?u=alice',
    status: 'online',
    tooltip: 'Alice Chen — Core Maintainer',
  },
  {
    id: 'c2',
    name: 'Bob Wang',
    status: 'online',
    tooltip: 'Bob Wang — Contributor',
  },
  {
    id: 'c3',
    name: 'Charlie Li',
    src: 'https://i.pravatar.cc/150?u=charlie',
    status: 'busy',
  },
  { id: 'c4', name: 'Diana Zhao', status: 'away' },
  {
    id: 'c5',
    name: 'Eve Liu',
    src: 'https://i.pravatar.cc/150?u=eve',
    status: 'online',
  },
  { id: 'c6', name: 'Frank Wu', status: 'offline' },
  {
    id: 'c7',
    name: 'Grace Xu',
    src: 'https://i.pravatar.cc/150?u=grace',
    status: 'online',
  },
  { id: 'c8', name: 'Hank Sun', status: 'online' },
  {
    id: 'c9',
    name: 'Ivy Zhou',
    src: 'https://i.pravatar.cc/150?u=ivy',
    status: 'away',
  },
  { id: 'c10', name: 'Jack Feng', status: 'offline' },
  {
    id: 'c11',
    name: 'Kelly Huang',
    src: 'https://i.pravatar.cc/150?u=kelly',
    status: 'online',
  },
  { id: 'c12', name: 'Leo Yang', status: 'busy' },
]

/** 演示场景列表 */
export const DEMO_SCENES = [
  {
    key: 'team',
    title: '团队协作',
    description: '查看在线团队成员',
    icon: 'mdi:account-group',
  },
  {
    key: 'task',
    title: '任务分配',
    description: '首字母头像展示',
    icon: 'mdi:clipboard-account',
  },
  {
    key: 'contributor',
    title: '项目贡献者',
    description: '混合头像 + 大量溢出',
    icon: 'mdi:source-branch',
  },
] as const
