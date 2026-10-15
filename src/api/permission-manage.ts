/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\permission-manage.ts
 * @Description: 权限资源接口，使用明确的请求与响应契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { getData } from '@robot-admin/request-core/axios'
import type { ApiResponse } from './management.contract'
import type { PermissionResource } from './permission-manage.contract'
import type {
  GetAuthButtonListResponse,
  GetDataPermissionResponse,
} from './generated'

/**
 * * @description: 获取按钮权限列表接口
 * ! @return {Promise<GetAuthButtonListResponse>} 按钮权限映射数据
 */
export const getAuthButtonListApi = () =>
  getData<GetAuthButtonListResponse>('/auth/button-list')

/**
 * * @description: 获取当前用户数据权限接口
 * ! @return {Promise<GetDataPermissionResponse>} 数据权限配置
 */
export const getDataPermissionApi = () =>
  getData<GetDataPermissionResponse>('/auth/data-permission')

/** Cloud 权限目录是菜单/按钮的有效权限摘要，只读且保留真实资源 ID。 */
export const getPermissionCatalogApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<PermissionResource[]>> => {
  const response = await getData<
    ApiResponse<
      Array<{
        id: string
        menuId: string
        name: string
        permCode: string
        type: string
      }>
    >
  >('/sys/permissions', { signal })
  return {
    ...response,
    data: response.data.map(row => ({
      id: row.id,
      name: row.name,
      code: row.permCode,
      type: row.type === 'button' ? 'button' : 'function',
      module: row.menuId,
      description: '有效权限目录摘要；变更请使用菜单和按钮管理',
      resources: [],
      status: 1,
      sort: 0,
      createTime: 0,
      updateTime: 0,
      remark: '',
    })),
  }
}

/** 权限资源库只读；资源命令统一由菜单/按钮的版本接口承担。 */
export const getPermissionListApi = (signal?: AbortSignal) =>
  getPermissionCatalogApi(signal)
