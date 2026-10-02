/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 22:46:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 15:43:56
 * @FilePath: \Robot_Admin\src\hooks\useFormSubmit\index.ts
 * @Description:  表单提交封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { notification } from '@/plugins/naive-ui-plugin'

export interface ApiResponse<T = unknown> {
  code: string
  message?: string
  data?: T
  // 你可以在这里添加更多的属性
}

export interface SubmitOptions<T extends ApiResponse = ApiResponse> {
  successCode?: string
  successMsg?: string
  meta?: string | ((data: T) => string) // 直接使用官方的 meta 属性
  errorMsg?: string
  onSuccess?: (data: T) => Promise<void> | void
  globalErrorHandler?: (error: unknown) => void
  debounce?: number | false
}

// 定义默认的全局错误处理函数
const defaultGlobalErrorHandler = (error: unknown): void => {
  console.error('默认全局错误处理:', error)
}

interface FormSubmitScope<TModel extends object> {
  form?: { validate: () => Promise<void> } | null
  model: TModel
}

export const useFormSubmit = <
  T extends ApiResponse = ApiResponse,
  TModel extends object = Record<string, unknown>,
>() => {
  const loading = ref(false)

  /**
   * 处理表单未准备好的情况
   */
  const handleFormNotReady = () => {
    notification.error({
      content: '表单实例未准备好',
      duration: 3000,
    })
  }

  /**
   * 验证表单
   */
  const validateForm = async (formScope: FormSubmitScope<TModel>) =>
    formScope.form?.validate()

  /**
   * 处理响应数据
   */
  const handleResponse = async (
    data: T,
    options: SubmitOptions<T>
  ): Promise<boolean> => {
    if (data.code === (options.successCode || '0')) {
      await options.onSuccess?.(data)

      // 处理成功提示信息
      const displayMessage = options.successMsg || '提交成功'
      let metaContent: string | undefined

      // 如果有 meta 属性，则生成个性化信息
      if (options.meta) {
        metaContent =
          typeof options.meta === 'function' ? options.meta(data) : options.meta
      }

      notification.success({
        content: displayMessage,
        meta: metaContent, // 直接使用官方的 meta 属性
        duration: 3000,
      })
      return true
    }
    return false
  }

  /**
   * 处理错误
   */
  const handleError = (error: unknown, options: SubmitOptions<T>): void => {
    console.error('[表单提交] 错误:', error)
    if (options.globalErrorHandler) {
      options.globalErrorHandler(error)
    } else {
      defaultGlobalErrorHandler(error)
    }
    notification.error({
      content: error instanceof Error ? error.message : '提交失败',
      duration: 3000,
    })
  }

  const createSubmit = (
    apiFn: (model: TModel) => Promise<T>,
    options: SubmitOptions<T> = {}
  ) => {
    // 智能防抖处理
    const finalApiFn =
      options.debounce !== false
        ? useDebounceFn(apiFn, options.debounce || 500)
        : apiFn

    return async (
      formScope: FormSubmitScope<TModel>
    ): Promise<T | undefined> => {
      if (!formScope.form) {
        handleFormNotReady()
        return
      }

      try {
        console.info('[表单验证] 开始验证...')
        await validateForm(formScope)
        loading.value = true
        const data = await finalApiFn(formScope.model)

        // 处理成功逻辑
        if (await handleResponse(data, options)) {
          return data
        }

        throw new Error(data.message || options.errorMsg || '操作失败')
      } catch (error) {
        handleError(error, options)
        throw error
      } finally {
        loading.value = false
      }
    }
  }

  return { loading, createSubmit }
}

// TAG: 使用示例

// 示例1: 简单的个性化信息
// const login = createSubmit(loginApi, {
//   successMsg: '登录成功',
//   meta: '欢迎你，CHENY！', // 静态个性化信息
//   errorMsg: '账号或密码错误',
//   onSuccess: async ({ token }) => {
//     userStore.handleLoginSuccess(token)
//     await initDynamicRouter()
//     router.push('/home')
//   }
// })

// 示例2: 动态个性化信息（根据API响应数据生成）
// const login = createSubmit(loginApi, {
//   successMsg: '登录成功',
//   meta: (data) => {
//     const username = data.data?.username || data.data?.name || 'CHENY'
//     const time = new Date().getHours()
//     let greeting = '早上好'
//     if (time >= 12 && time < 18) greeting = '下午好'
//     else if (time >= 18) greeting = '晚上好'
//     return `${greeting}，${username}！欢迎回来～`
//   },
//   errorMsg: '账号或密码错误',
//   onSuccess: async ({ token }) => {
//     userStore.handleLoginSuccess(token)
//     await initDynamicRouter()
//     router.push('/home')
//   }
// })

// 示例3: 防抖自定义示例
// const createUser = createSubmit(userApi, {
//   debounce: 1000, // 1秒防抖
//   meta: (data) => `用户 ${data.data?.name} 创建成功！`
// })
