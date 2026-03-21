/*
 * @Description: 微前端子应用配置
 * @Author: CHENY
 * @Date: 2025-12-25
 */

/**
 * 子应用配置接口
 */
export interface MicroAppConfig {
  id: string // 应用唯一ID
  name: string // 应用名称
  dev: string // 开发环境地址
  test?: string // 测试环境地址
  staging?: string // 预发布环境地址
  prod?: string // 生产环境地址
  icon?: string // 应用图标
  description?: string // 应用描述
}

/**
 * 微前端子应用配置表
 */
export const MICRO_APPS: Record<string, MicroAppConfig> = {
  // 智慧物流管理系统
  logistics: {
    id: 'logistics',
    name: '智慧物流管理系统',
    dev: 'http://localhost:3003',
    test: 'https://logistics-test.example.com',
    staging: 'https://logistics-staging.example.com',
    prod: 'https://logistics.example.com',
    icon: '🚚',
    description: '物流运输、仓储管理、车辆调度',
  },

  // 可以继续添加其他子应用
  // warehouse: {
  //   id: 'warehouse',
  //   name: '智能仓储系统',
  //   dev: 'http://localhost:3004',
  //   test: 'https://warehouse-test.example.com',
  //   prod: 'https://warehouse.example.com',
  //   icon: '📦',
  //   description: '仓库管理、库存盘点、出入库',
  // },
}

/**
 * 根据应用ID和环境获取访问地址
 * @param appId 应用ID
 * @param env 环境 (development | test | staging | production)
 * @returns 应用访问地址
 */
export function getMicroAppUrl(
  appId: string,
  env: string = import.meta.env.MODE
): string | null {
  const app = MICRO_APPS[appId]
  if (!app) {
    console.error(`[MicroApp] 未找到应用配置: ${appId}`)
    return null
  }

  // 环境映射
  const envMap: Record<string, keyof MicroAppConfig> = {
    development: 'dev',
    test: 'test',
    staging: 'staging',
    production: 'prod',
  }

  const envKey = envMap[env] || 'dev'
  const url = app[envKey] as string | undefined

  if (!url) {
    console.warn(
      `[MicroApp] 应用 ${appId} 未配置 ${env} 环境地址，降级使用开发环境`
    )
    return app.dev
  }

  return url
}

/**
 * 获取应用配置
 * @param appId 应用ID
 * @returns 应用配置对象
 */
export function getMicroAppConfig(appId: string): MicroAppConfig | null {
  return MICRO_APPS[appId] || null
}

/**
 * 获取所有已注册的子应用列表
 * @returns 子应用配置数组
 */
export function getAllMicroApps(): MicroAppConfig[] {
  return Object.values(MICRO_APPS)
}
