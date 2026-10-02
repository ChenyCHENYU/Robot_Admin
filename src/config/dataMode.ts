/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\config\dataMode.ts
 * @Description: 业务数据源运行模式解析
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export type DataMode = 'mock' | 'remote'
export type DeploymentProfile = 'application' | 'demo'

const isDataMode = (mode: string | undefined): mode is DataMode =>
  mode === 'mock' || mode === 'remote'

const isProtectedApplicationEnvironment = (
  appEnv: string | undefined,
  deploymentProfile: DeploymentProfile
): boolean =>
  ['production', 'staging'].includes(appEnv ?? '') &&
  deploymentProfile === 'application'

/**
 * @description 收敛业务数据模式，并阻止真实业务生产或预发环境回退到演示数据。
 * @param mode 数据模式环境变量
 * @param appEnv 当前应用环境
 * @param deploymentProfile 部署用途，公开演示允许闭环 Mock
 * @returns 有效数据模式
 */
export const resolveDataMode = (
  mode?: string,
  appEnv?: string,
  deploymentProfile: DeploymentProfile = 'application'
): DataMode => {
  const isProtectedEnvironment = isProtectedApplicationEnvironment(
    appEnv,
    deploymentProfile
  )

  if (mode && !isDataMode(mode)) {
    throw new Error(`VITE_DATA_MODE 不受支持: ${mode}`)
  }
  if (isProtectedEnvironment && mode === 'mock') {
    throw new Error(`${appEnv} 环境禁止使用 Mock 业务数据`)
  }
  if (isDataMode(mode)) return mode
  return isProtectedEnvironment ? 'remote' : 'mock'
}

/** 当前客户端业务数据模式。 */
export const getDataMode = (): DataMode =>
  resolveDataMode(
    import.meta.env.VITE_DATA_MODE,
    import.meta.env.VITE_APP_ENV,
    import.meta.env.VITE_DEPLOYMENT_PROFILE
  )

/** 当前客户端是否使用演示数据。 */
export const isMockDataMode = (): boolean => getDataMode() === 'mock'
