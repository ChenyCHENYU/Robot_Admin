/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\permission-manage.ts
 * @Description: 权限资源接口，使用明确的请求与响应契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  getData,
  postData,
  deleteData,
  putData,
} from '@robot-admin/request-core/axios'
import type {
  GetSysPermissionsByIdResponse,
  GetSysPermissionsListResponse,
  PostSysPermissionsResponse,
  PutSysPermissionsByIdResponse,
  DeleteSysPermissionsByIdResponse,
  GetAuthButtonListResponse,
  GetDataPermissionResponse,
} from './generated'
import type {
  PermissionDraft,
  PermissionQuery,
} from './permission-manage.contract'

/**
 * * @description: 查询权限列表接口
 * ? @param {PermissionQuery} params 查询参数（keyword/type/module/status 等）
 * ! @return {Promise<GetSysPermissionsListResponse>} 权限列表响应数据
 */
export const getPermissionListApi = (params?: PermissionQuery) =>
  getData<GetSysPermissionsListResponse>('/sys/permissions', { params })

/**
 * * @description: 新增权限接口
 * ? @param {PermissionDraft} data 权限数据对象
 * ! @return {Promise<PostSysPermissionsResponse>} 新增后的权限响应数据
 */
export const createPermissionApi = (data: PermissionDraft) =>
  postData<PostSysPermissionsResponse>('/sys/permissions', data)

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
 * ? @param {Partial<PermissionDraft>} data 更新的权限数据对象（后端将返回更新后的完整记录）
 * ! @return {Promise<PutSysPermissionsByIdResponse>} 更新后的权限信息响应数据
 */
export const updatePermissionApi = (
  id: number | string,
  data: Partial<PermissionDraft>
) => putData<PutSysPermissionsByIdResponse>(`/sys/permissions/${id}`, data)

/**
 * * @description: 删除权限接口
 * ? @param {number|string} id 权限唯一标识ID
 * ! @return {Promise<DeleteSysPermissionsByIdResponse>} 删除响应数据
 */
export const deletePermissionApi = (id: number | string) =>
  deleteData<DeleteSysPermissionsByIdResponse>(`/sys/permissions/${id}`)

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
