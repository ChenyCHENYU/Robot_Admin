/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\shared\d_permissionPolicy.ts
 * @Description: 数据范围与临时授权状态的统一展示配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DataScopeType } from '@/api/permission-policy.contract'

export const DATA_SCOPE_CONFIG: Record<
  DataScopeType,
  {
    text: string
    type: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    icon: string
    description: string
  }
> = {
  all: {
    text: '全部数据',
    type: 'success',
    icon: 'mdi:database',
    description: '可访问系统中所有数据',
  },
  department: {
    text: '本部门',
    type: 'info',
    icon: 'mdi:office-building',
    description: '仅可访问本部门的数据',
  },
  department_below: {
    text: '本部门及下级',
    type: 'warning',
    icon: 'mdi:sitemap',
    description: '可访问本部门及下级部门的数据',
  },
  self: {
    text: '仅本人',
    type: 'error',
    icon: 'mdi:account',
    description: '仅可访问本人创建的数据',
  },
  custom: {
    text: '自定义',
    type: 'default',
    icon: 'mdi:tune',
    description: '自定义选择可访问的部门数据',
  },
}

export const DATA_SCOPE_OPTIONS = Object.entries(DATA_SCOPE_CONFIG).map(
  ([value, config]) => ({
    label: config.text,
    value,
    description: config.description,
  })
)

// ==================== 临时授权 ====================

export const TEMP_AUTH_STATUS_CONFIG = {
  active: {
    text: '生效中',
    type: 'success' as const,
    icon: 'mdi:check-circle',
  },
  expired: {
    text: '已过期',
    type: 'warning' as const,
    icon: 'mdi:clock-alert',
  },
  revoked: { text: '已撤销', type: 'error' as const, icon: 'mdi:close-circle' },
}
