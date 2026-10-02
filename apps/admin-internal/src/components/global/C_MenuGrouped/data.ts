/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-05-24
 * @FilePath: \Robot_Admin\src\components\global\C_MenuGrouped\data.ts
 * @Description: 菜单分组配置 — 按业务域对一级菜单进行归类
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 菜单分组配置项 */
export interface MenuGroupConfig {
  /** 分组标签 */
  label: string
  /** 匹配的一级路由 path（精确匹配） */
  paths?: string[]
  /** 模糊匹配的关键词（匹配 meta.title） */
  keywords?: string[]
}

/** 默认分组配置 — 可通过 props 覆盖 */
export const DEFAULT_MENU_GROUPS: MenuGroupConfig[] = [
  {
    label: '核心功能',
    paths: ['home', '/dashboard'],
  },
  {
    label: '组件展示',
    paths: ['/demo', '/plugins', '/editor'],
    keywords: ['示范', '插件', '编辑'],
  },
  {
    label: '开发工具',
    paths: ['/hooks', '/directives', '/large-screen'],
    keywords: ['Hooks', '指令', '大屏'],
  },
  {
    label: '系统管理',
    paths: ['/account', '/sys-manage'],
    keywords: ['账户', '系统'],
  },
  // 未匹配的自动归入 "其他" 分组
]

/** 未分类菜单的默认分组名 */
export const OTHER_GROUP_LABEL = '其他'

/** 分组主题配色（克制的互补色，Linear 风格） */
export const GROUP_COLORS = [
  '#5b8def',
  '#3aa76d',
  '#f0995c',
  '#b563e0',
  '#ef6461',
] as const
