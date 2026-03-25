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
  url: string // 当前环境访问地址（由 env 注入）
  icon?: string // 应用图标
  description?: string // 应用描述
}

/**
 * * @description: 微前端子应用配置表
 * 地址统一从 envs/.env.* 中的 VITE_MICRO_<APP>_URL 读取，
 * 不再硬编码多环境地址，新增子应用时同步追加环境变量即可。
 */
export const MICRO_APPS: Record<string, MicroAppConfig> = {
  logistics: {
    id: 'logistics',
    name: '智慧物流管理系统',
    url: import.meta.env.VITE_MICRO_LOGISTICS_URL || '',
    icon: '🚚',
    description: '物流运输、仓储管理、车辆调度',
  },

  // 新增子应用示例：
  // warehouse: {
  //   id: 'warehouse',
  //   name: '智能仓储系统',
  //   url: import.meta.env.VITE_MICRO_WAREHOUSE_URL || '',
  //   icon: '📦',
  //   description: '仓库管理、库存盘点、出入库',
  // },
}

/**
 * * @description: 获取子应用访问地址
 * ? @param {string} appId 应用ID
 * ! @return {string | null}
 */
export function getMicroAppUrl(appId: string): string | null {
  const app = MICRO_APPS[appId]
  if (!app) {
    console.error(`[MicroApp] 未找到应用配置: ${appId}`)
    return null
  }
  return app.url
}

/**
 * * @description: 获取应用配置
 * ? @param {string} appId 应用ID
 * ! @return {MicroAppConfig | null}
 */
export function getMicroAppConfig(appId: string): MicroAppConfig | null {
  return MICRO_APPS[appId] || null
}

/**
 * * @description: 获取所有已注册的子应用列表
 * ! @return {MicroAppConfig[]}
 */
export function getAllMicroApps(): MicroAppConfig[] {
  return Object.values(MICRO_APPS)
}
