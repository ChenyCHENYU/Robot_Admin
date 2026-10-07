/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\permission-manage\d_columns.ts
 * @Description: 表格展示配置；业务变更通过明确的回调注入
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { h } from 'vue'
import { NTag, NSpace, NButton } from 'naive-ui/es'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import type {
  DataPermissionRule,
  FieldPermissionItem,
  TempAuthorization,
} from '@/api/permission-governance.contract'
import { DATA_SCOPE_CONFIG, TEMP_AUTH_STATUS_CONFIG } from './data'

/** 创建列配置，保留页面统一表格行为。 */
export function createGovernanceColumns(actions: {
  handleEditDataPermission: (row: DataPermissionRule) => void
  handleEditScope: (row: DataPermissionRule) => void
  handleRevokeTempAuth: (row: TempAuthorization) => void
}) {
  const { handleEditDataPermission, handleEditScope, handleRevokeTempAuth } =
    actions
  const dataPermissionColumns: TableColumn<DataPermissionRule>[] = [
    {
      title: '模块',
      key: 'moduleName',
      width: 120,
    },
    {
      title: '数据范围',
      key: 'scope',
      width: 140,
      render: (row: DataPermissionRule) => {
        const config =
          DATA_SCOPE_CONFIG[row.scope as keyof typeof DATA_SCOPE_CONFIG]
        return h(
          NTag,
          { type: config?.type, size: 'small' },
          { default: () => config?.text || row.scope }
        )
      },
    },
    {
      title: '自定义部门',
      key: 'departmentIds',
      width: 160,
      render: (row: DataPermissionRule) =>
        row.scope === 'custom'
          ? h('span', null, `${row.departmentIds.length} 个部门`)
          : h('span', { style: { color: '#999' } }, '—'),
    },
    {
      title: '字段权限',
      key: 'fieldPermissions',
      width: 120,
      render: (row: DataPermissionRule) => {
        const total = row.fieldPermissions.length
        const masked = row.fieldPermissions.filter(
          (f: FieldPermissionItem) => f.masked
        ).length
        const hidden = row.fieldPermissions.filter(
          (f: FieldPermissionItem) => !f.visible
        ).length
        return h(NSpace, { size: 4, justify: 'center' }, () => [
          h(
            NTag,
            { type: 'info', size: 'small' },
            { default: () => `${total} 字段` }
          ),
          masked > 0
            ? h(
                NTag,
                { type: 'warning', size: 'small' },
                { default: () => `${masked} 脱敏` }
              )
            : null,
          hidden > 0
            ? h(
                NTag,
                { type: 'error', size: 'small' },
                { default: () => `${hidden} 隐藏` }
              )
            : null,
        ])
      },
    },
    {
      title: '更新时间',
      key: 'updateTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (row: DataPermissionRule) =>
        h(NSpace, { size: 8, justify: 'center' }, () => [
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              size: 'small',
              onClick: () => handleEditDataPermission(row),
            },
            { default: () => '配置字段' }
          ),
          h(
            NButton,
            {
              text: true,
              type: 'info',
              size: 'small',
              onClick: () => handleEditScope(row),
            },
            { default: () => '修改范围' }
          ),
        ]),
    },
  ]

  // ============ 临时授权表格列配置 ============
  const tempAuthColumns: TableColumn<TempAuthorization>[] = [
    { title: '目标角色', key: 'targetRoleName', width: 120 },
    {
      title: '授权权限',
      key: 'permissionNames',
      width: 180,
      render: (row: TempAuthorization) =>
        h(NSpace, { size: 4, justify: 'center' }, () =>
          row.permissionNames.map((name: string) =>
            h(NTag, { type: 'info', size: 'small' }, { default: () => name })
          )
        ),
    },
    { title: '授权原因', key: 'reason', width: 200 },
    { title: '授权人', key: 'grantedByName', width: 100 },
    { title: '开始时间', key: 'startTime', width: 160 },
    { title: '过期时间', key: 'expireTime', width: 160 },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (row: TempAuthorization) => {
        const config =
          TEMP_AUTH_STATUS_CONFIG[
            row.status as keyof typeof TEMP_AUTH_STATUS_CONFIG
          ]
        return h(
          NTag,
          { type: config.type, size: 'small' },
          { default: () => config.text }
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (row: TempAuthorization) =>
        row.status === 'active'
          ? h(
              NButton,
              {
                text: true,
                type: 'error',
                size: 'small',
                onClick: () => handleRevokeTempAuth(row),
              },
              { default: () => '撤销' }
            )
          : h('span', { style: { color: '#999' } }, '—'),
    },
  ]

  return { dataPermissionColumns, tempAuthColumns }
}
