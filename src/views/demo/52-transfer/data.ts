/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\52-transfer\data.ts
 * @Description: 与项目模块对应的穿梭选择示例配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { TransferItem } from '@robot-admin/naive-ui-components'

export const TRANSFER_SCENES = {
  permission: {
    label: '权限范围',
    icon: 'mdi:shield-key-outline',
    subject: '运营角色',
    description: '选择角色可访问的模块，受保护的管理权限保持锁定。',
    titles: ['可选权限', '角色权限'] as [string, string],
    defaults: ['home', 'analysis'],
    data: [
      {
        key: 'home',
        label: '首页工作台',
        icon: 'mdi:home-outline',
        description: '项目概览与工作空间',
      },
      {
        key: 'analysis',
        label: '工程分析',
        icon: 'mdi:chart-box-outline',
        description: '依赖、构建与性能指标',
      },
      {
        key: 'usage',
        label: '使用统计',
        icon: 'mdi:chart-line',
        description: '访问与交互事件',
      },
      {
        key: 'users',
        label: '用户管理',
        icon: 'mdi:account-outline',
        description: '账号与状态维护',
      },
      {
        key: 'roles',
        label: '角色管理',
        icon: 'mdi:shield-account-outline',
        description: '平台管理员保留',
        disabled: true,
      },
      {
        key: 'menus',
        label: '菜单管理',
        icon: 'mdi:menu',
        description: '平台管理员保留',
        disabled: true,
      },
      {
        key: 'logs',
        label: '操作日志',
        icon: 'mdi:text-box-search-outline',
        description: '行为追踪与审计',
      },
    ] satisfies TransferItem[],
  },
  module: {
    label: '模块装配',
    icon: 'mdi:puzzle-outline',
    subject: '应用能力组合',
    description: '以 Robot Admin 生态包演示功能组合，选择结果仅用于预览。',
    titles: ['生态能力', '已选能力'] as [string, string],
    defaults: ['layout', 'theme', 'components'],
    data: [
      {
        key: 'layout',
        label: 'Layout',
        description: '@robot-admin/layout',
        icon: 'mdi:view-dashboard-outline',
      },
      {
        key: 'theme',
        label: 'Theme',
        description: '@robot-admin/theme',
        icon: 'mdi:palette-outline',
      },
      {
        key: 'components',
        label: 'Components',
        description: '@robot-admin/naive-ui-components',
        icon: 'mdi:puzzle-outline',
      },
      {
        key: 'request',
        label: 'Request Core',
        description: '@robot-admin/request-core',
        icon: 'mdi:swap-horizontal',
      },
      {
        key: 'validate',
        label: 'Form Validate',
        description: '@robot-admin/form-validate',
        icon: 'mdi:form-select',
      },
      {
        key: 'directives',
        label: 'Directives',
        description: '@robot-admin/directives',
        icon: 'mdi:cursor-default-click-outline',
      },
      {
        key: 'files',
        label: 'File Utils',
        description: '@robot-admin/file-utils',
        icon: 'mdi:folder-outline',
      },
    ] satisfies TransferItem[],
  },
  member: {
    label: '团队成员',
    icon: 'mdi:account-group-outline',
    subject: '示例项目组',
    description: '按职责分配示例成员，体验搜索、批量移动和结果回看。',
    titles: ['候选成员', '项目成员'] as [string, string],
    defaults: ['frontend', 'qa'],
    data: [
      {
        key: 'frontend',
        label: '前端工程师',
        description: '界面与交互',
        icon: 'mdi:code-tags',
      },
      {
        key: 'backend',
        label: '后端工程师',
        description: '接口与数据契约',
        icon: 'mdi:database-outline',
      },
      {
        key: 'qa',
        label: '测试工程师',
        description: '回归与验收',
        icon: 'mdi:test-tube',
      },
      {
        key: 'design',
        label: '产品设计师',
        description: '视觉与体验',
        icon: 'mdi:draw',
      },
      {
        key: 'ops',
        label: '运维工程师',
        description: '构建与发布',
        icon: 'mdi:server-outline',
      },
    ] satisfies TransferItem[],
  },
}
export type TransferScene = keyof typeof TRANSFER_SCENES
