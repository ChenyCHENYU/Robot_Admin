/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\management.contract.ts
 * @Description: 系统管理资源通用响应和分页契约，与生成接口的 msg 字段一致
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface ApiResponse<T> {
  code: string | number
  data: T
  msg: string
}
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
