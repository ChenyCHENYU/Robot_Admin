/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\role-manage\d_columns.ts
 * @Description: 表格展示配置；业务变更通过明确的回调注入
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { computed, h } from 'vue'
import { NTag, NTooltip, NSpace, NButton } from 'naive-ui/es'
import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
import '@robot-admin/naive-ui-components/C_Icon/style.css'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import { type RoleData, ROLE_TYPE_CONFIG, STATUS_CONFIG } from './data'

/** 创建列配置，保留页面统一表格行为。 */
export function createRoleColumns(
  handleViewRoleUsers: (row: RoleData) => void
) {
  const tableColumns = computed<TableColumn<RoleData>[]>(() => [
    {
      key: 'type',
      title: '角色类型',
      width: 100,
      editable: false,
      render: (row: RoleData) =>
        h(
          NTag,
          {
            type: ROLE_TYPE_CONFIG[row.type as keyof typeof ROLE_TYPE_CONFIG]
              .type,
            size: 'small',
          },
          {
            icon: () =>
              h(C_Icon, {
                name: ROLE_TYPE_CONFIG[
                  row.type as keyof typeof ROLE_TYPE_CONFIG
                ].icon,
                size: 10,
              }),
            default: () =>
              ROLE_TYPE_CONFIG[row.type as keyof typeof ROLE_TYPE_CONFIG].text,
          }
        ),
    },
    {
      key: 'name',
      title: '角色名称',
      width: 120,
      editable: true,
      required: true,
    },
    { key: 'code', title: '角色编码', width: 120, editable: false },
    {
      key: 'description',
      title: '描述',
      width: 180,
      editable: true,
      editType: 'textarea' as const,
    },
    {
      key: 'permissionNames',
      title: '权限',
      width: 200,
      align: 'center' as const,
      editable: false,
      render: (row: RoleData) => {
        const { permissionNames } = row
        if (!permissionNames?.length) {
          return h('div', { style: { textAlign: 'center' } }, '-')
        }

        return h('div', { style: { textAlign: 'center' } }, [
          h(
            NTooltip,
            {
              trigger: 'hover',
              placement: 'top',
              style: { maxWidth: '300px' },
            },
            {
              trigger: () =>
                h(NSpace, { size: 4, justify: 'center' }, () => [
                  h(
                    NTag,
                    { size: 'small', type: 'primary' },
                    () => permissionNames[0]
                  ),
                  permissionNames.length > 1 &&
                    h(
                      NTag,
                      { size: 'small', type: 'default' },
                      () => `+${permissionNames.length - 1}`
                    ),
                ]),
              default: () =>
                h('div', { style: { padding: '8px' } }, [
                  h(
                    'div',
                    {
                      style: {
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: '4px',
                      },
                    },
                    `权限列表 (${permissionNames.length})`
                  ),
                  h(
                    'div',
                    { style: { maxHeight: '200px', overflowY: 'auto' } },
                    permissionNames.map((name: string) =>
                      h(
                        'div',
                        {
                          style: {
                            padding: '2px 0',
                            display: 'flex',
                            alignItems: 'center',
                          },
                        },
                        [
                          h(C_Icon, {
                            name: 'mdi:shield-check',
                            size: 12,
                            style: { marginRight: '6px', color: '#18a058' },
                          }),
                          h('span', name),
                        ]
                      )
                    )
                  ),
                ]),
            }
          ),
        ])
      },
    },
    {
      key: 'userCount',
      title: '用户数',
      width: 80,
      align: 'center' as const,
      editable: false,
      render: (row: RoleData) =>
        row.userCount
          ? h(
              NButton,
              {
                text: true,
                type: 'primary',
                size: 'small',
                onClick: () => handleViewRoleUsers(row),
              },
              () => `${row.userCount} 人`
            )
          : h('span', '0'),
    },
    {
      key: 'sort',
      title: '排序',
      width: 80,
      editable: true,
      editType: 'number' as const,
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      editable: true,
      editType: 'switch' as const,
      render: (row: RoleData) =>
        h(
          NTag,
          {
            type: STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].type,
            size: 'small',
          },
          () => STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].text
        ),
    },
    { key: 'createTime', title: '创建时间', width: 160, editable: false },
  ])

  return { tableColumns }
}
