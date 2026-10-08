/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\user-manage\d_columns.ts
 * @Description: 用户表格列与展示，独立于账号维护流程
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { h } from 'vue'
import type { UserData } from '@/api/user-manage.contract'
import { NTag, NSpace, NButton, NDropdown } from 'naive-ui/es'
import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
import '@robot-admin/naive-ui-components/C_Icon/style.css'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import {
  TABLE_COLUMN_CONFIG,
  getUserTypeConfig,
  getUserStatusConfig,
} from './data'

/** 创建用户列，保留状态及角色标签的展示。 */
export function createUserColumns() {
  const createTagRenderer =
    <T>(
      getConfig: (value: T) => {
        type: 'default' | 'info' | 'success' | 'warning' | 'error'
        icon: string
        text: string
      },
      getValue: (row: UserData) => T
    ) =>
    (row: UserData) => {
      const config = getConfig(getValue(row))
      return h(
        NTag,
        {
          type: config.type,
          size: 'small',
          class: { 'disabled-tag': row.status === 0 },
        },
        {
          icon: () =>
            h(C_Icon, {
              name: config.icon,
              size: 10,
            }),
          default: () => config.text,
        }
      )
    }

  const createTextRenderer =
    (key: keyof UserData, fallback = '-') =>
    (row: UserData) =>
      h(
        'div',
        { class: { 'disabled-text': row.status === 0 } },
        String(row[key] || fallback)
      )

  const createUsernameRenderer = (row: UserData) =>
    h(
      'div',
      {
        class: ['username-cell', { 'disabled-user': row.status === 0 }],
        style:
          row.status === 0
            ? {
                textDecoration: 'line-through',
                color: '#999',
                backgroundColor: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-block',
                border: '1px solid #e0e0e0',
              }
            : undefined,
      },
      row.username
    )

  const createRolesRenderer = (row: UserData) => {
    if (!row.roleNames || row.roleNames.length === 0) {
      return h('div', '-')
    }
    return h(
      NSpace,
      { size: 4, justify: 'center' },
      {
        default: () =>
          row.roleNames!.map(role =>
            h(
              NTag,
              {
                key: role,
                size: 'small',
                type: 'info',
                class: { 'disabled-tag': row.status === 0 },
              },
              { default: () => role }
            )
          ),
      }
    )
  }

  const userColumns: TableColumn<UserData>[] = [
    { type: 'selection' },
    {
      title: TABLE_COLUMN_CONFIG.userType.title,
      key: 'userType',
      width: TABLE_COLUMN_CONFIG.userType.width,
      render: createTagRenderer(getUserTypeConfig, row => row.userType),
    },
    {
      title: TABLE_COLUMN_CONFIG.username.title,
      key: 'username',
      width: TABLE_COLUMN_CONFIG.username.width,
      fixed: TABLE_COLUMN_CONFIG.username.fixed,
      render: createUsernameRenderer,
    },
    {
      title: TABLE_COLUMN_CONFIG.nickname.title,
      key: 'nickname',
      width: TABLE_COLUMN_CONFIG.nickname.width,
      render: createTextRenderer('nickname'),
    },
    {
      title: TABLE_COLUMN_CONFIG.email.title,
      key: 'email',
      width: TABLE_COLUMN_CONFIG.email.width,
      render: createTextRenderer('email'),
    },
    {
      title: TABLE_COLUMN_CONFIG.phone.title,
      key: 'phone',
      width: TABLE_COLUMN_CONFIG.phone.width,
      render: createTextRenderer('phone'),
    },
    {
      title: TABLE_COLUMN_CONFIG.deptName.title,
      key: 'deptName',
      width: TABLE_COLUMN_CONFIG.deptName.width,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          row.userType === 'external'
            ? row.companyName || '-'
            : row.deptName || '-'
        ),
    },
    {
      title: TABLE_COLUMN_CONFIG.roleNames.title,
      key: 'roleNames',
      width: TABLE_COLUMN_CONFIG.roleNames.width,
      render: createRolesRenderer,
    },
    {
      title: TABLE_COLUMN_CONFIG.status.title,
      key: 'status',
      width: TABLE_COLUMN_CONFIG.status.width,
      render: createTagRenderer(getUserStatusConfig, row => row.status),
    },
    {
      title: TABLE_COLUMN_CONFIG.createTime.title,
      key: 'createTime',
      width: TABLE_COLUMN_CONFIG.createTime.width,
      render: createTextRenderer('createTime'),
    },
  ]

  return userColumns
}

/** 操作渲染只依赖事件契约，用户维护流程保留在控制器。 */
export function createUserActions(
  handlers: Record<
    'view' | 'edit' | 'delete' | 'toggle' | 'reset',
    (row: UserData) => void
  >
) {
  const button = (
    row: UserData,
    key: 'view' | 'edit' | 'delete',
    title: string,
    icon: string,
    type: 'info' | 'warning' | 'error'
  ) =>
    h(
      NButton,
      {
        size: 'small',
        type,
        quaternary: true,
        'aria-label': title,
        onClick: () => handlers[key](row),
      },
      () => h(C_Icon, { name: icon, size: 14, title })
    )
  return {
    render: (row: UserData) =>
      h(NSpace, { size: 2, wrap: false, justify: 'center' }, () => [
        button(row, 'view', '详情', 'mdi:eye', 'info'),
        button(row, 'edit', '编辑', 'mdi:pencil', 'warning'),
        button(row, 'delete', '删除', 'mdi:delete', 'error'),
        h(
          NDropdown,
          {
            options: [
              {
                key: 'toggle',
                label: row.status === 1 ? '禁用' : '启用',
                icon: () =>
                  h(C_Icon, {
                    name: row.status === 1 ? 'mdi:pause' : 'mdi:play',
                    size: 14,
                  }),
              },
              {
                key: 'reset',
                label: '重置密码',
                disabled: row.status === 0,
                icon: () => h(C_Icon, { name: 'mdi:key', size: 14 }),
              },
            ],
            onSelect: (key: 'toggle' | 'reset') => handlers[key](row),
          },
          () =>
            h(
              NButton,
              { size: 'small', quaternary: true, 'aria-label': '更多操作' },
              () =>
                h(C_Icon, {
                  name: 'mdi:dots-horizontal',
                  size: 14,
                  title: '更多操作',
                })
            )
        ),
      ]),
  }
}
