/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-04 10:03:45
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-05 14:07:45
 * @FilePath: \Robot_Admin\src\composables\Table\createTableActions.ts
 * @Description: 简化表格增删改查的工厂函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { unwrapSdk } from '@/utils/plugins/sdk-helper'

/**
 * 自定义操作按钮配置
 */
export interface CustomAction<T = any> {
  key: string
  label: string
  icon: string
  type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  onClick: (row: T, index: number) => void
}

/**
 * TableActions 配置项
 */
export interface TableActionsConfig<T extends Record<string, any>> {
  /**
   * CRUD API 函数配置
   */
  apis: {
    /** 更新/编辑 API */
    update?: (...args: any[]) => Promise<any>
    /** 删除 API */
    delete?: (...args: any[]) => Promise<any>
    /** 详情/查询 API */
    detail?: (...args: any[]) => Promise<any>
  }
  /**
   * 自定义操作按钮
   */
  custom?: CustomAction<T>[]
  /**
   * ID 字段名，默认 'id'
   */
  idField?: keyof T
}

/**
 * TableActions 返回类型
 */
export interface TableActions<T = any> {
  edit?: (row: T) => Promise<any>
  delete?: (row: T) => Promise<any>
  detail?: (row: T) => Promise<any>
  custom?: CustomAction<T>[]
}

/**
 * 创建表格操作配置
 *
 * @description
 * 自动包装 SDK API 调用，处理 { data, error } 响应格式
 * 大幅简化表格 CRUD 操作配置代码
 *
 * @template T 数据行类型，必须包含 id 字段
 * @param config 配置项
 * @returns 计算属性，包含 edit/delete/detail/custom 操作
 *
 * @example
 * ```ts
 * const tableActions = createTableActions<Employee>({
 *   apis: {
 *     update: putEmployeesById,
 *     delete: deleteEmployeesById,
 *     detail: getEmployeesById
 *   },
 *   custom: [
 *     {
 *       key: 'copy',
 *       label: '复制',
 *       icon: 'mdi:content-copy',
 *       type: 'default',
 *       onClick: handleCopy
 *     }
 *   ]
 * })
 * ```
 */
export const createTableActions = <T extends Record<string, any>>(
  config: TableActionsConfig<T>
): ComputedRef<TableActions<T>> => {
  const { apis, custom = [], idField = 'id' as keyof T } = config

  return computed(() => {
    const actions: TableActions<T> = {}

    // 编辑操作
    if (apis.update) {
      actions.edit = async (row: T) => {
        return unwrapSdk(apis.update!)({
          path: { id: row[idField] },
          body: row as any, // OpenAPI 定义可能缺少 requestBody
        })
      }
    }

    // 删除操作
    if (apis.delete) {
      actions.delete = async (row: T) => {
        return unwrapSdk(apis.delete!)({
          path: { id: row[idField] },
        })
      }
    }

    // 详情操作
    if (apis.detail) {
      actions.detail = async (row: T) => {
        return unwrapSdk(apis.detail!)({
          path: { id: row[idField] },
        })
      }
    }

    // 自定义操作
    if (custom.length > 0) {
      actions.custom = custom
    }

    return actions
  })
}
