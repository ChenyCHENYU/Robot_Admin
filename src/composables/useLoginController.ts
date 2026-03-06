/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\composables\useLoginController.ts
 * @Description: 通用登录控制器 composable
 *
 * 将登录业务逻辑从页面中解耦，使 C_Login 组件成为真正可插拔的纯 UI 组件。
 *
 * 使用方式：
 *   1. 提供 loginApi（对接自有后端）
 *   2. 提供 onLoginSuccess（处理 token 存储、路由跳转等）
 *   3. 可选：自定义欢迎语、错误处理、其他登录方式的回调
 *
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { notification } from '@/plugins/naive-ui-plugin'
import type {
  PasswordFormData,
  CaptchaFormData,
  RegisterFormData,
} from '@robot-admin/naive-ui-components'

// ======================== Types ========================

/** 欢迎语时段配置 */
export interface WelcomeTimeSlot {
  /** [开始时, 结束时]，支持跨午夜（如 [22, 6]） */
  range: readonly [number, number]
  greeting: string
  emoji: string
}

/** 欢迎语配置 */
export interface WelcomeConfig<TResponse = any> {
  timeSlots: WelcomeTimeSlot[]
  /** 可含占位符：{greeting} {username} {emoji} */
  templates: string[]
  /** 从 API 响应中提取用户名，默认返回 'User' */
  getUserName?: (response: TResponse) => string
}

/** useLoginController 选项 */
export interface UseLoginControllerOptions<TResponse = any> {
  // ─── 核心：必填 ───

  /** 登录 API 函数 */
  loginApi: (data: Record<string, any>) => Promise<TResponse>

  /**
   * 登录成功后的业务处理
   * - 存储 token
   * - 初始化动态路由
   * - 跳转首页
   *
   * 若内部抛出错误，会被 composable 捕获并走错误流程
   */
  onLoginSuccess: (
    response: TResponse,
    formData: { username: string; password: string }
  ) => Promise<void> | void

  // ─── 通知 & 欢迎语 ───

  /** 成功状态码（默认 '0'） */
  successCode?: string
  /** 登录成功提示文字 */
  successMessage?: string
  /** 登录失败提示文字 */
  errorMessage?: string

  /**
   * 基于时段的欢迎语配置（用于 notification.meta）
   * 与 welcomeMessage 二选一；若同时传入，welcomeMessage 优先
   */
  welcomeConfig?: WelcomeConfig<TResponse>

  /** 自定义欢迎语生成函数（优先于 welcomeConfig） */
  welcomeMessage?: (response: TResponse) => string

  // ─── 错误处理 ───

  /** 登录错误回调（除 notification 外的额外处理） */
  onError?: (error: Error) => void

  // ─── 其他登录方式（可选，不传则静默忽略） ───

  onCaptchaLogin?: (data: CaptchaFormData) => void | Promise<void>
  onSendCode?: (account: string) => void
  onSocialLogin?: (provider: string) => void
  onForgotPassword?: () => void
  onRegisterSubmit?: (data: RegisterFormData) => void | Promise<void>
  onRegisterSendCode?: (phone: string) => void
}

// ======================== Composable ========================

/**
 * 通用登录控制器 composable
 *
 * 将登录业务逻辑（API 调用、通知、错误处理、欢迎语生成）从页面中解耦，
 * 使 C_Login 组件成为真正可插拔的纯 UI 组件。
 *
 * @template TResponse - 登录 API 的响应类型
 * @param options - 登录控制器配置
 */
export function useLoginController<
  TResponse extends { code: string; data?: any; message?: string } = any,
>(options: UseLoginControllerOptions<TResponse>) {
  const loading = ref(false)
  const loginRef = ref<{ resetCaptcha: () => void } | null>(null)

  // ─── 欢迎语生成 ───
  const generateWelcome = (response: TResponse): string | undefined => {
    // 优先使用自定义函数
    if (options.welcomeMessage) return options.welcomeMessage(response)
    if (!options.welcomeConfig) return undefined

    const { timeSlots, templates, getUserName } = options.welcomeConfig
    const username = getUserName?.(response) ?? 'User'
    const hour = new Date().getHours()

    const slot =
      timeSlots.find(({ range: [start, end] }) =>
        start < end ? hour >= start && hour < end : hour >= start || hour < end
      ) ?? timeSlots[0]

    const { greeting, emoji } = slot
    const template = templates[Math.floor(Math.random() * templates.length)]

    return template
      .replace('{greeting}', greeting)
      .replace('{username}', username)
      .replace('{emoji}', emoji)
  }

  // ─── 内部工具 ───
  type LoginFormData = PasswordFormData & {
    captchaToken?: string
    captchaTimestamp?: number
  }

  /** 构建登录请求体 */
  const buildPayload = (formData: LoginFormData): Record<string, any> => {
    const payload: Record<string, any> = {
      username: formData.username,
      password: formData.password,
    }
    if (formData.captchaToken) {
      payload.captcha = {
        token: formData.captchaToken,
        timestamp: formData.captchaTimestamp,
        type: 'puzzle-captcha',
      }
    }
    return payload
  }

  /** 处理登录成功响应 */
  const handleLoginSuccess = async (
    response: TResponse,
    formData: LoginFormData
  ) => {
    notification.success({
      content: options.successMessage ?? '登录成功',
      meta: generateWelcome(response),
      duration: 3000,
    })
    await options.onLoginSuccess(response, {
      username: formData.username,
      password: formData.password,
    })
  }

  /** 处理登录错误 */
  const handleLoginError = (error: unknown) => {
    const msg =
      error instanceof Error
        ? error.message
        : (options.errorMessage ?? '登录失败')
    notification.error({ content: msg, duration: 3000 })
    options.onError?.(error as Error)
    loginRef.value?.resetCaptcha()
  }

  // ─── 密码登录 ───
  const handleLogin = async (formData: LoginFormData) => {
    loading.value = true
    try {
      const response = await options.loginApi(buildPayload(formData))
      const successCode = options.successCode ?? '0'

      if (response.code === successCode) {
        await handleLoginSuccess(response, formData)
      } else {
        throw new Error(response.message ?? options.errorMessage ?? '登录失败')
      }
    } catch (error: unknown) {
      handleLoginError(error)
    } finally {
      loading.value = false
    }
  }

  // ─── 验证码登录 ───
  const handleCaptchaLogin = (data: CaptchaFormData) => {
    options.onCaptchaLogin?.(data)
  }

  // ─── 发送验证码 ───
  const handleSendCode = (account: string) => {
    options.onSendCode?.(account)
  }

  // ─── 社交登录 ───
  const handleSocialLogin = (provider: string) => {
    options.onSocialLogin?.(provider)
  }

  // ─── 忘记密码 ───
  const handleForgotPassword = () => {
    options.onForgotPassword?.()
  }

  // ─── 注册提交 ───
  const handleRegisterSubmit = (data: RegisterFormData) => {
    options.onRegisterSubmit?.(data)
  }

  // ─── 注册发送验证码 ───
  const handleRegisterSendCode = (phone: string) => {
    options.onRegisterSendCode?.(phone)
  }

  return {
    /** C_Login 组件 ref（用于重置验证码等） */
    loginRef,
    /** 登录请求加载状态 */
    loading: readonly(loading),
    /** 密码登录处理器 → 绑定 @submit */
    handleLogin,
    /** 验证码登录处理器 → 绑定 @captcha-submit */
    handleCaptchaLogin,
    /** 发送验证码处理器 → 绑定 @send-code */
    handleSendCode,
    /** 社交登录处理器 → 绑定 @social-login */
    handleSocialLogin,
    /** 忘记密码处理器 → 绑定 @forgot-password */
    handleForgotPassword,
    /** 注册提交处理器 → 绑定 @register-submit */
    handleRegisterSubmit,
    /** 注册发送验证码处理器 → 绑定 @register-send-code */
    handleRegisterSendCode,
  }
}
