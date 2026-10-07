/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\permission-manage.contract.ts
 * @Description: 权限资源的请求及响应契约，独立于页面配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export type PermissionType = 'module' | 'function' | 'button' | 'api'

export interface PermissionResource {
  [key: string]: unknown
  id: number
  name: string
  code: string
  type: PermissionType
  module: string
  description: string
  resources: string[]
  /** 0 停用，1 启用。 */
  status: number
  sort: number
  createTime: number
  updateTime: number
  remark: string
}

export type PermissionDraft = Pick<
  PermissionResource,
  | 'name'
  | 'code'
  | 'type'
  | 'module'
  | 'description'
  | 'resources'
  | 'status'
  | 'sort'
  | 'remark'
>

export interface PermissionQuery {
  keyword?: string
  type?: PermissionType | null
  module?: string | null
  status?: number | null
  page?: number
  pageSize?: number
}
