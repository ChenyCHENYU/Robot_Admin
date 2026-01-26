/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: usePageCrud 使用示例（优化后）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { usePageCrud, configureCrud } from '@/composables/usePageCrud'

// ==================== 示例 0：全局配置（可选） ====================

/**
 * 在 main.ts 或 app setup 中配置一次
 * 所有页面自动继承
 */
export function setupCrud() {
  configureCrud({
    preset: 'restful', // 全局使用 RESTful 风格
    defaultPage: { current: 1, size: 20 },
  })
}

// ==================== 示例 1：基础用法 ====================

/**
 * ✅ 基础写法：完整路径（清晰明了）
 * - 明确定义所有端点
 * - 自动注入消息通知
 * - 使用全局配置
 */
export function useSimpleExample() {
  return usePageCrud({
    list: '/api/user/list',
    get: '/api/user/detail',
    create: '/api/user/create',
    update: '/api/user/update',
    remove: '/api/user/delete',
  })
}

// ==================== 示例 2：RESTful 风格 ====================

/**
 * ✅ RESTful 风格：ID 在路径中
 */
export function useRestfulExample() {
  return usePageCrud(
    {
      list: '/api/order/list',
      get: '/api/order', // GET /api/order/:id
      create: '/api/order', // POST /api/order
      update: '/api/order', // PUT /api/order/:id
      remove: '/api/order', // DELETE /api/order/:id
    },
    {
      preset: 'restful',
      defaultQuery: { status: 'pending' },
    }
  )
}

// ==================== 示例 3：自定义查询条件 ====================

interface Product {
  id: number
  name: string
  price: number
}

interface ProductQuery {
  keyword?: string
  category?: string
  priceRange?: [number, number]
}

/**
 * ✅ 带查询条件和分页
 */
export function useQueryExample() {
  return usePageCrud<Product, ProductQuery>(
    {
      list: '/api/product/list',
      get: '/api/product/:id',
      create: '/api/product',
      update: '/api/product/:id',
      remove: '/api/product/:id',
    },
    {
      defaultQuery: {
        category: 'electronics',
      },
      defaultPage: {
        current: 1,
        size: 50,
      },
    }
  )
}

// ==================== 示例 4：完全自定义 ====================

/**
 * ✅ 自定义端点和配置
 */
export function useCustomExample() {
  return usePageCrud(
    {
      list: '/api/custom/query',
      get: '/api/custom/detail/:id', // 支持路径参数占位符
      create: '/api/custom/add',
      update: '/api/custom/modify/:id',
      remove: '/api/custom/delete/:id',
    },
    {
      // 自定义响应格式
      mapListResult: res => ({
        items: res.data?.records || [],
        total: res.data?.totalCount || 0,
      }),

      // 请求前参数处理
      beforeFetch: params => {
        // 日期范围处理
        if (params.dateRange?.length === 2) {
          return {
            ...params,
            startDate: params.dateRange[0],
            endDate: params.dateRange[1],
            dateRange: undefined,
          }
        }
        return params
      },

      // 自定义刷新策略
      autoRefresh: {
        onCreate: true,
        onUpdate: false, // 更新后不刷新
        onRemove: true,
      },
    }
  )
}

// ==================== 示例 5：批量操作 ====================

/**
 * ✅ 支持批量更新和导出
 */
export function useBatchExample() {
  return usePageCrud(
    {
      list: '/api/report/list',
      get: '/api/report/detail',
      create: '/api/report/create',
      update: '/api/report/update',
      remove: '/api/report/delete',
    },
    {
      preset: 'restful',
      batchOperations: {
        update: true,
        updateEndpoint: '/api/report/batchUpdate',
        export: true,
        exportEndpoint: '/api/report/export',
      },
    }
  )
}

// ==================== 示例 6：静默模式 ====================

/**
 * ✅ 无消息提示
 * 适用于后台自动刷新场景
 */
export function useSilentExample() {
  return usePageCrud(
    {
      list: '/api/background-task/list',
      get: '/api/background-task/detail',
      create: '/api/background-task/create',
      update: '/api/background-task/update',
      remove: '/api/background-task/delete',
    },
    {
      preset: 'silent',
    }
  )
}

// ==================== 示例 7：手动刷新 ====================

/**
 * ✅ 操作后不自动刷新
 * 适用于需要乐观更新的场景
 */
export function useManualExample() {
  const crud = usePageCrud(
    {
      list: '/api/comment/list',
      get: '/api/comment/detail',
      create: '/api/comment/create',
      update: '/api/comment/update',
      remove: '/api/comment/delete',
    },
    {
      preset: 'manual',
      afterMutate: async ({ action, result }) => {
        if (action === 'update') {
          // 乐观更新：手动更新列表中的对应项
          const index = crud.items.value.findIndex(
            item => item.id === result.id
          )
          if (index !== -1) {
            crud.items.value[index] = result
          }
        }
      },
    }
  )

  return crud
}

// ==================== 完整页面示例 ====================

interface User {
  id: number
  username: string
  email: string
  status: 'active' | 'inactive'
}

interface UserQuery {
  keyword?: string
  status?: User['status']
  dateRange?: [string, string]
}

/**
 * ✅ 实际页面中的完整使用示例
 */
export function usePageExample() {
  // ✅ 清晰的端点配置
  const crud = usePageCrud<User, UserQuery>(
    {
      list: '/api/user/list',
      get: '/api/user/detail',
      create: '/api/user/create',
      update: '/api/user/update',
      remove: '/api/user/delete',
    },
    {
      preset: 'restful',
      defaultQuery: { status: 'active' },
      defaultPage: { current: 1, size: 20 },
    }
  )

  // ✅ 使用
  const handleSearch = () => {
    crud.fetch(undefined, { resetPage: true })
  }

  const handleAdd = async (data: Partial<User>) => {
    await crud.create(data) // 自动刷新列表
  }

  const handleEdit = async (data: User) => {
    await crud.update(data) // 自动刷新列表
  }

  const handleDelete = async (id: number) => {
    await crud.remove(id) // 自动刷新列表
  }

  const handleBatchDelete = async (ids: number[]) => {
    await crud.remove({ ids }) // 自动刷新列表
  }

  return {
    crud,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
  }
}

// ==================== 对比：优化前 vs 优化后 ====================

/**
 * ❌ 优化前（~20 行）
 */
export function useOldWay() {
  const message = useMessage()

  return usePageCrud(
    {
      list: '/api/user/list',
      get: '/api/user',
      create: '/api/user',
      update: '/api/user',
      remove: '/api/user',
    },
    {
      defaultQuery: { status: 'active' },
      defaultPage: { current: 1, size: 20 },
      notifier: {
        success: message.success,
        error: message.error,
      },
      endpointOptions: {
        get: { idIn: 'path', appendIdToPath: true },
        update: { idIn: 'path', appendIdToPath: true },
        remove: { idIn: 'path', appendIdToPath: true },
      },
      autoRefresh: true,
      filterParams: true,
    }
  )
}

/**
 * ✅ 优化后（~10 行，清晰明了）
 */
export function useNewWay() {
  return usePageCrud(
    {
      list: '/api/user/list',
      get: '/api/user/detail',
      create: '/api/user/create',
      update: '/api/user/update',
      remove: '/api/user/delete',
    },
    {
      preset: 'restful',
      defaultQuery: { status: 'active' },
    }
  )
}

// ==================== ✨ 示例 9：自定义业务操作 ====================

interface UserWithActions {
  id: number
  name: string
  status: 'active' | 'inactive' | 'pending'
}

/**
 * ✅ 带自定义业务操作（审批、启用等）
 */
export function useActionsExample() {
  return usePageCrud<UserWithActions>(
    {
      list: '/api/user/list',
      get: '/api/user/:id',
      create: '/api/user/create',
      update: '/api/user/:id',
      remove: '/api/user/:id',
      // ✨ 自定义业务操作
      actions: {
        approve: '/api/user/approve',
        reject: '/api/user/reject',
        enable: '/api/user/enable',
        disable: '/api/user/disable',
        resetPassword: '/api/user/reset-password',
      },
    },
    {
      // 配置操作行为
      actionOptions: {
        approve: {
          method: 'post',
          autoRefresh: true,
          successMessage: '审批成功',
          errorMessage: '审批失败',
        },
        enable: {
          method: 'post',
          autoRefresh: true,
          successMessage: '已启用',
        },
      },
    }
  )
}

/**
 * ✅ 使用示例
 */
export async function actionsUsageExample() {
  const crud = useActionsExample()

  // 标准 CRUD 操作
  await crud.fetch()
  await crud.create({ name: '张三', status: 'pending' })

  // ✨ 自定义业务操作
  await crud.actions.approve({ id: 1, approver: 'admin' })
  await crud.actions.reject({ id: 2, reason: '不符合条件' })
  await crud.actions.enable({ id: 3 })

  // ✨ 通用操作方法（临时性操作）
  await crud.action('post', '/api/user/send-email', {
    id: 1,
    subject: '欢迎',
  })

  const stats = await crud.action('get', '/api/user/stats')
  console.log(stats)
}
