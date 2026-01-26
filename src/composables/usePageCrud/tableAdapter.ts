/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-01-26
 * @Description: usePageCrud 表格适配器 - 简化表格操作配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { UsePageCrudReturn } from './types'

/**
 * 将 usePageCrud 的 CRUD 方法适配为表格组件需要的格式
 *
 * @description
 * 自动处理 params 结构（path、body、query）和错误处理
 * 让你可以直接使用 crud 方法，无需手写适配代码
 *
 * @template T - 数据类型
 * @param crud - usePageCrud 返回的实例
 * @returns 表格 actions 配置对象
 *
 * @example
 * ```ts
 * const crud = usePageCrud<Employee>({ ... })
 * const tableActions = createTableActions({
 *   apis: toTableApis(crud),  // 一行搞定！
 *   custom: [...]
 * })
 * ```
 */
export function toTableApis<T>(crud: UsePageCrudReturn<T, any>) {
  return {
    // 更新操作：从 params.body 获取数据
    update: async (params: any) => {
      try {
        await crud.update(params.body)
        return { data: params.body, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },

    // 删除操作：从 params.path.id 获取 ID
    delete: async (params: any) => {
      try {
        await crud.remove(params.path.id)
        return { data: { success: true }, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },

    // 详情操作：从 params.path.id 获取 ID
    detail: async (params: any) => {
      try {
        const result = await crud.get(params.path.id)
        return { data: result, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },
  }
}
