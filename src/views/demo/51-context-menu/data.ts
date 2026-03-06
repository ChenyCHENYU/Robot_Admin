/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\51-context-menu\data.ts
 * @Description: 右键菜单组件演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ContextMenuItem } from '@robot-admin/naive-ui-components'

// ==================== 编辑器菜单 ====================

export const EDITOR_MENU: ContextMenuItem[] = [
  { key: 'undo', label: '撤销', icon: 'mdi:undo', shortcut: 'Ctrl+Z' },
  { key: 'redo', label: '重做', icon: 'mdi:redo', shortcut: 'Ctrl+Y' },
  { key: 'd1', label: '', divider: true },
  { key: 'cut', label: '剪切', icon: 'mdi:content-cut', shortcut: 'Ctrl+X' },
  { key: 'copy', label: '复制', icon: 'mdi:content-copy', shortcut: 'Ctrl+C' },
  {
    key: 'paste',
    label: '粘贴',
    icon: 'mdi:content-paste',
    shortcut: 'Ctrl+V',
  },
  { key: 'd2', label: '', divider: true },
  {
    key: 'select-all',
    label: '全选',
    icon: 'mdi:select-all',
    shortcut: 'Ctrl+A',
  },
  {
    key: 'find',
    label: '查找与替换',
    icon: 'mdi:find-replace',
    shortcut: 'Ctrl+H',
  },
]

// ==================== 文件管理菜单（含子菜单） ====================

export const FILE_MANAGER_MENU: ContextMenuItem[] = [
  {
    key: 'new',
    label: '新建',
    icon: 'mdi:plus-circle-outline',
    children: [
      {
        key: 'new-file',
        label: '文件',
        icon: 'mdi:file-plus-outline',
        shortcut: 'Ctrl+N',
      },
      { key: 'new-folder', label: '文件夹', icon: 'mdi:folder-plus-outline' },
      { key: 'd-new', label: '', divider: true },
      {
        key: 'new-from-tpl',
        label: '从模板创建...',
        icon: 'mdi:file-document-outline',
      },
    ],
  },
  {
    key: 'open-with',
    label: '打开方式',
    icon: 'mdi:open-in-app',
    children: [
      { key: 'open-editor', label: '代码编辑器', icon: 'mdi:code-braces' },
      { key: 'open-preview', label: '预览', icon: 'mdi:eye-outline' },
      { key: 'open-terminal', label: '终端', icon: 'mdi:console' },
    ],
  },
  { key: 'd3', label: '', divider: true },
  {
    key: 'rename',
    label: '重命名',
    icon: 'mdi:rename-outline',
    shortcut: 'F2',
  },
  { key: 'move', label: '移动到...', icon: 'mdi:folder-move-outline' },
  {
    key: 'copy-path',
    label: '复制路径',
    icon: 'mdi:content-copy',
    shortcut: 'Shift+Alt+C',
  },
  { key: 'd4', label: '', divider: true },
  {
    key: 'delete',
    label: '删除',
    icon: 'mdi:delete-outline',
    shortcut: 'Delete',
    danger: true,
  },
]

// ==================== 表格行菜单 ====================

export const TABLE_ROW_MENU: ContextMenuItem[] = [
  { key: 'view', label: '查看详情', icon: 'mdi:eye-outline' },
  { key: 'edit', label: '编辑', icon: 'mdi:pencil-outline', shortcut: 'Enter' },
  { key: 'd5', label: '', divider: true },
  { key: 'export', label: '导出', icon: 'mdi:export-variant' },
  { key: 'share', label: '分享链接', icon: 'mdi:share-variant-outline' },
  { key: 'd6', label: '', divider: true },
  {
    key: 'disable',
    label: '禁用（演示）',
    icon: 'mdi:block-helper',
    disabled: true,
  },
  {
    key: 'remove',
    label: '从列表移除',
    icon: 'mdi:close-circle-outline',
    danger: true,
  },
]

// ==================== 场景 ====================

export const DEMO_SCENES = [
  {
    key: 'editor',
    title: '编辑器',
    description: '快捷键标注、经典编辑操作',
    icon: 'mdi:code-braces',
  },
  {
    key: 'file',
    title: '文件管理',
    description: '嵌套子菜单、多级操作',
    icon: 'mdi:folder-open-outline',
  },
  {
    key: 'table',
    title: '表格行操作',
    description: '禁用项、危险操作',
    icon: 'mdi:table',
  },
]

// ==================== 功能特性 ====================

export const FEATURE_LIST = [
  {
    icon: 'mdi:file-tree',
    title: '声明式配置',
    desc: 'JSON 结构描述菜单，零模板代码',
    tag: '核心',
  },
  {
    icon: 'mdi:keyboard-outline',
    title: '快捷键标注',
    desc: '每项可配 shortcut 文本展示',
    tag: '核心',
  },
  {
    icon: 'mdi:menu-right',
    title: '嵌套子菜单',
    desc: 'children 无限嵌套，悬停展开',
    tag: '核心',
  },
  {
    icon: 'mdi:alert-circle-outline',
    title: '危险操作',
    desc: 'danger 属性标红高亮关键操作',
    tag: '交互',
  },
  {
    icon: 'mdi:monitor-screenshot',
    title: '自动边界检测',
    desc: '智能避免菜单溢出视窗',
    tag: '交互',
  },
  {
    icon: 'mdi:brush-variant',
    title: 'CSS 变量主题',
    desc: '毛玻璃背景、全变量化定制',
    tag: '主题',
  },
]

export const TAG_TYPE_MAP: Record<string, string> = {
  核心: 'success',
  交互: 'info',
  主题: 'default',
}
