/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\52-transfer\data.ts
 * @Description: 穿梭框演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { TransferItem } from '@robot-admin/naive-ui-components'

/** 功能特性 */
export const FEATURE_LIST = [
  {
    icon: 'mdi:swap-horizontal',
    title: '双栏穿梭',
    desc: '左右面板互相转移数据',
    tag: '核心',
  },
  {
    icon: 'mdi:magnify',
    title: '搜索过滤',
    desc: '支持关键词实时搜索',
    tag: '交互',
  },
  {
    icon: 'mdi:checkbox-multiple-marked',
    title: '批量操作',
    desc: '全选 / 反选一键穿梭',
    tag: '效率',
  },
  {
    icon: 'mdi:cancel',
    title: '禁用项',
    desc: '特定项可设置为不可操作',
    tag: '控制',
  },
  {
    icon: 'mdi:resize',
    title: '三种尺寸',
    desc: 'Small / Medium / Large 适应不同场景',
    tag: '样式',
  },
  {
    icon: 'mdi:account-group',
    title: '图标支持',
    desc: '列表项可配置 Iconify 图标',
    tag: '扩展',
  },
]

export const TAG_TYPE_MAP: Record<string, string> = {
  核心: 'primary',
  交互: 'success',
  效率: 'warning',
  控制: 'error',
  样式: 'info',
  扩展: 'default',
}

/** ========== 场景 1: 权限分配 ========== */
export const PERMISSION_DATA: TransferItem[] = [
  { key: 'dashboard-view', label: '仪表盘 - 查看', icon: 'mdi:view-dashboard' },
  { key: 'dashboard-edit', label: '仪表盘 - 编辑', icon: 'mdi:pencil' },
  { key: 'user-list', label: '用户管理 - 列表', icon: 'mdi:account-multiple' },
  { key: 'user-create', label: '用户管理 - 新建', icon: 'mdi:account-plus' },
  {
    key: 'user-delete',
    label: '用户管理 - 删除',
    icon: 'mdi:account-remove',
    disabled: true,
  },
  { key: 'role-list', label: '角色管理 - 列表', icon: 'mdi:shield-account' },
  { key: 'role-edit', label: '角色管理 - 编辑', icon: 'mdi:shield-edit' },
  { key: 'menu-list', label: '菜单管理 - 列表', icon: 'mdi:menu' },
  { key: 'menu-edit', label: '菜单管理 - 编辑', icon: 'mdi:playlist-edit' },
  { key: 'log-view', label: '操作日志 - 查看', icon: 'mdi:text-box-search' },
  { key: 'log-export', label: '操作日志 - 导出', icon: 'mdi:file-export' },
  { key: 'settings', label: '系统设置', icon: 'mdi:cog' },
]

export const PERMISSION_DEFAULT: Array<string | number> = [
  'dashboard-view',
  'user-list',
  'role-list',
]

/** ========== 场景 2: 数据迁移 ========== */
export const MIGRATION_DATA: TransferItem[] = [
  {
    key: 'tbl-users',
    label: 'users 用户表',
    icon: 'mdi:table',
    description: '12,345 行',
  },
  {
    key: 'tbl-orders',
    label: 'orders 订单表',
    icon: 'mdi:table',
    description: '89,012 行',
  },
  {
    key: 'tbl-products',
    label: 'products 产品表',
    icon: 'mdi:table',
    description: '3,456 行',
  },
  {
    key: 'tbl-logs',
    label: 'logs 日志表',
    icon: 'mdi:table',
    description: '1,234,567 行',
    disabled: true,
  },
  {
    key: 'tbl-config',
    label: 'config 配置表',
    icon: 'mdi:table',
    description: '78 行',
  },
  {
    key: 'tbl-files',
    label: 'files 文件表',
    icon: 'mdi:table',
    description: '5,678 行',
  },
  {
    key: 'tbl-tags',
    label: 'tags 标签表',
    icon: 'mdi:table',
    description: '234 行',
  },
  {
    key: 'tbl-comments',
    label: 'comments 评论表',
    icon: 'mdi:table',
    description: '45,678 行',
  },
]

export const MIGRATION_DEFAULT: Array<string | number> = [
  'tbl-users',
  'tbl-orders',
]

/** ========== 场景 3: 成员分配 ========== */
export const MEMBER_DATA: TransferItem[] = [
  { key: 'm1', label: '张三', icon: 'mdi:account', description: '前端开发' },
  { key: 'm2', label: '李四', icon: 'mdi:account', description: '后端开发' },
  { key: 'm3', label: '王五', icon: 'mdi:account', description: '产品经理' },
  { key: 'm4', label: '赵六', icon: 'mdi:account', description: 'UI 设计师' },
  { key: 'm5', label: '孙七', icon: 'mdi:account', description: '测试工程师' },
  { key: 'm6', label: '周八', icon: 'mdi:account', description: '运维工程师' },
  { key: 'm7', label: '吴九', icon: 'mdi:account', description: '项目经理' },
  {
    key: 'm8',
    label: '郑十',
    icon: 'mdi:account',
    description: '架构师',
    disabled: true,
  },
]

export const MEMBER_DEFAULT: Array<string | number> = ['m1', 'm3']

/** 演示场景列表 */
export const DEMO_SCENES = [
  {
    key: 'permission',
    title: '权限分配',
    description: '为角色分配系统权限',
    icon: 'mdi:shield-key',
  },
  {
    key: 'migration',
    title: '数据迁移',
    description: '选择需要迁移的数据表',
    icon: 'mdi:database-export',
  },
  {
    key: 'member',
    title: '成员分配',
    description: '为项目组分配团队成员',
    icon: 'mdi:account-group',
  },
] as const
