/*
 * @robot/business - 业务逻辑包
 * 
 * 提供 Robot Admin 应用所需的:
 * - 业务 Hooks (useCopy, useDownload, useExcel 等)
 * - 业务工具函数 (验证、格式化等)
 */

export const BUSINESS_VERSION = '1.0.0'

// 导出所有 Hooks
export * from './hooks'

// 导出工具函数
export * from './utils'
