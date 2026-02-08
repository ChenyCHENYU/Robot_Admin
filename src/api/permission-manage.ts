// src/api/permissions.ts
import { getData, deleteData, putData } from '@robot-admin/request-core'
import type {
  GetSysPermissionsByIdResponse,
  PutSysPermissionsByIdResponse,
  DeleteSysPermissionsByIdResponse,
} from './generated'

/**
 * * @description: 根据ID查询权限详情接口
 * ? @param {number|string} id 权限唯一标识ID
 * ! @return {Promise<GetSysPermissionsByIdResponse>} 权限详情响应数据
 */
export const getPermissionByIdApi = (id: number | string) =>
  getData<GetSysPermissionsByIdResponse>(`/sys/permissions/${id}`)

/**
 * * @description: 更新权限信息接口（部分字段更新）
 * ? @param {number|string} id 权限唯一标识ID
 * ? @param {object} data 更新的权限数据对象（后端将返回更新后的完整记录）
 * ! @return {Promise<PutSysPermissionsByIdResponse>} 更新后的权限信息响应数据
 */
export const updatePermissionApi = (
  id: number | string,
  data: Record<string, any>
) => putData<PutSysPermissionsByIdResponse>(`/sys/permissions/${id}`, data)

/**
 * * @description: 删除权限接口
 * ? @param {number|string} id 权限唯一标识ID
 * ! @return {Promise<DeleteSysPermissionsByIdResponse>} 删除响应数据
 */
export const deletePermissionApi = (id: number | string) =>
  deleteData<DeleteSysPermissionsByIdResponse>(`/sys/permissions/${id}`)
