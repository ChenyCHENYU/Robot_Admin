/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\src\config\vite\viteEnvConfig.ts
 * @Description: Vite 环境变量校验与安全默认值
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { resolveDataMode, type DataMode } from '../dataMode.ts'

export type AppEnvironment = 'development' | 'test' | 'staging' | 'production'
export type RouterMode = 'hash' | 'history'
export type AuthMode = 'mock' | 'remote'

export interface ValidatedViteEnv {
  appEnv: AppEnvironment
  authMode: AuthMode
  dataMode: DataMode
  routerMode: RouterMode
  apiBase: string
  port: number
}

const APP_ENVIRONMENTS = new Set<AppEnvironment>([
  'development',
  'test',
  'staging',
  'production',
])
const BOOLEAN_ENV_KEYS = [
  'VITE_I18N_ENABLED',
  'VITE_ANALYTICS_ENABLED',
  'VITE_ROUTE_IDLE_PREFETCH',
] as const
const UNSAFE_REMOTE_API_PATTERNS = [/apifoxmock\.com/i, /dummy/i]

const isBooleanValue = (value: string): boolean =>
  value === 'true' || value === 'false'

const resolveAppEnvironment = (
  env: Record<string, string | undefined>,
  mode: string,
  errors: string[]
): AppEnvironment => {
  const rawAppEnv = env.VITE_APP_ENV || mode
  if (APP_ENVIRONMENTS.has(rawAppEnv as AppEnvironment)) {
    return rawAppEnv as AppEnvironment
  }
  errors.push(`VITE_APP_ENV 不受支持: ${rawAppEnv}`)
  return 'development'
}

const resolveAuthMode = (
  env: Record<string, string | undefined>,
  appEnv: AppEnvironment,
  errors: string[]
): AuthMode => {
  const value = env.VITE_AUTH_MODE
  if (value === 'remote' || value === 'mock') return value
  if (value) errors.push(`VITE_AUTH_MODE 不受支持: ${value}`)
  return appEnv === 'production' || appEnv === 'staging' ? 'remote' : 'mock'
}

const resolveRouterMode = (
  env: Record<string, string | undefined>,
  errors: string[]
): RouterMode => {
  const value = env.VITE_ROUTER_MODE
  if (value === 'history' || value === 'hash') return value
  if (value) errors.push(`VITE_ROUTER_MODE 不受支持: ${value}`)
  return 'hash'
}

const resolvePort = (
  env: Record<string, string | undefined>,
  errors: string[]
): number => {
  const port = Number(env.VITE_PORT || 1988)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    errors.push(`VITE_PORT 必须是 1-65535 的整数: ${env.VITE_PORT}`)
  }
  return port
}

const validateProtectedEnvironment = (
  appEnv: AppEnvironment,
  authMode: AuthMode,
  dataMode: DataMode,
  apiBase: string,
  errors: string[]
): void => {
  if (appEnv !== 'production' && appEnv !== 'staging') return
  if (authMode !== 'remote') errors.push(`${appEnv} 环境禁止使用 Mock 认证`)
  if (dataMode !== 'remote') errors.push(`${appEnv} 环境禁止使用 Mock 业务数据`)
  if (UNSAFE_REMOTE_API_PATTERNS.some(pattern => pattern.test(apiBase))) {
    errors.push(`${appEnv} 环境禁止使用 Mock 或占位 API: ${apiBase}`)
  }
}

const validateErrorReportEndpoint = (
  endpoint: string | undefined,
  errors: string[]
): void => {
  const value = endpoint?.trim()
  if (!value) return
  if (!value.startsWith('/') || value.startsWith('//')) {
    errors.push('VITE_ERROR_REPORT_ENDPOINT 必须是同源绝对路径')
  }
}

const validateAmapServiceHost = (
  serviceHost: string | undefined,
  errors: string[]
): void => {
  const value = serviceHost?.trim()
  if (!value) return
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    !value.endsWith('/_AMapService')
  ) {
    errors.push('VITE_AMAP_SERVICE_HOST 必须是同源路径并以 /_AMapService 结尾')
  }
}

const validateBooleanVariables = (
  env: Record<string, string | undefined>,
  errors: string[]
): void => {
  for (const key of BOOLEAN_ENV_KEYS) {
    const value = env[key]
    if (value && !isBooleanValue(value)) {
      errors.push(`${key} 只能是 true 或 false`)
    }
  }
}

const validateI18nCredentials = (
  env: Record<string, string | undefined>,
  errors: string[]
): void => {
  if (
    env.VITE_I18N_ENABLED === 'true' &&
    (!env.YOUDAO_APP_ID || !env.YOUDAO_APP_KEY)
  ) {
    errors.push('启用自动翻译时必须通过本机或 CI 注入有道 API 凭据')
  }
}

/**
 * @description 校验构建环境，阻止 Mock、占位 API 或非法配置进入生产产物。
 * @param env Vite 加载后的环境变量
 * @param mode 当前 Vite mode
 * @returns 经过类型收敛的环境配置
 */
export function validateViteEnv(
  env: Record<string, string | undefined>,
  mode: string
): ValidatedViteEnv {
  const errors: string[] = []
  const appEnv = resolveAppEnvironment(env, mode, errors)
  const authMode = resolveAuthMode(env, appEnv, errors)
  let dataMode: DataMode = 'mock'
  try {
    dataMode = resolveDataMode(env.VITE_DATA_MODE, appEnv)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : '业务数据模式无效')
  }

  const apiBase = env.VITE_API_BASE?.trim() || ''
  if (!apiBase) errors.push('VITE_API_BASE 不能为空')
  validateProtectedEnvironment(appEnv, authMode, dataMode, apiBase, errors)

  const routerMode = resolveRouterMode(env, errors)
  const port = resolvePort(env, errors)
  validateBooleanVariables(env, errors)
  validateI18nCredentials(env, errors)
  validateErrorReportEndpoint(env.VITE_ERROR_REPORT_ENDPOINT, errors)
  validateAmapServiceHost(env.VITE_AMAP_SERVICE_HOST, errors)

  if (errors.length > 0) {
    throw new Error(`环境配置校验失败:\n- ${errors.join('\n- ')}`)
  }

  return { appEnv, authMode, dataMode, routerMode, apiBase, port }
}
