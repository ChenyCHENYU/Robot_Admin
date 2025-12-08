/*
 * @robot/integrations - 第三方集成包
 * 
 * 统一封装所有第三方库的集成:
 * - ECharts / AntV 图表
 * - Markdown / 代码编辑器
 * - 日历 / 地图组件
 * - 其他第三方集成
 * 
 * 注意: 此包仅提供配置和初始化逻辑
 * 具体组件仍在各应用的 views 中使用
 */

export const INTEGRATIONS_VERSION = '1.0.0'

// 将来可以导出:
// - 图表默认配置
// - 编辑器默认配置
// - 地图默认配置
// - 初始化函数等

// 目前作为占位包存在
export const CHART_DEFAULT_CONFIG = {
  // ECharts 默认配置
  echarts: {},
  // AntV X6 默认配置
  antv: {},
}

export const EDITOR_DEFAULT_CONFIG = {
  // Markdown 编辑器默认配置
  markdown: {},
  // 代码编辑器默认配置
  code: {},
}
