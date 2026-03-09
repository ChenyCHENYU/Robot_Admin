/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-09
 * @Description: API 自动生成类型占位 — 后续由代码生成器覆盖
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 登录接口响应 */
export interface PostAuthLoginResponse {
  code: string
  data: {
    token: string
    [key: string]: unknown
  }
  msg: string
}

/** 权限详情响应 */
export interface GetSysPermissionsByIdResponse {
  code: string
  data: Record<string, unknown>
  msg: string
}

/** 权限更新响应 */
export interface PutSysPermissionsByIdResponse {
  code: string
  data: Record<string, unknown>
  msg: string
}

/** 权限删除响应 */
export interface DeleteSysPermissionsByIdResponse {
  code: string
  data: Record<string, unknown>
  msg: string
}

/** 员工展开列表响应 */
export interface GetEmployeesExpandListResponse {
  code: string
  data: {
    list: Array<{
      id: number
      name: string
      department: string
      role: string
      status: string
      childData: Array<{ id: number; [key: string]: unknown }>
      hasChildren: boolean
      [key: string]: unknown
    }>
    [key: string]: unknown
  }
  msg: string
}
