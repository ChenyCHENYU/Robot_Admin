/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-23
 * @Description: 微前端通信类型定义 — 主子应用共享接口契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// ============ 主应用 → 子应用 数据结构 ============

/**
 * * @description: 主题数据
 */
export interface ThemeData {
  mode: 'light' | 'dark' | 'system'
  isDark: boolean
}

/**
 * * @description: 环境变量数据
 */
export interface EnvData {
  mode: string
  baseUrl: string
  apiUrl: string
}

/**
 * * @description: 应用元信息
 */
export interface AppInfo {
  mainApp: string
  version: string
  timestamp: number
}

/**
 * * @description: Header 组件配置
 */
export interface HeaderConfig {
  showCollapse: boolean
  showBreadcrumb: boolean
  showTagsView: boolean
  fullWidth: boolean
  showLogo: boolean
  showPortalButton: boolean
  showPlatformTitle: boolean
  showNavbarRight: boolean
}

/**
 * * @description: 主应用通过 data 绑定传递给子应用的完整数据
 */
export interface MicroAppData {
  token: string
  userInfo: Record<string, unknown>
  theme: ThemeData
  env: EnvData
  appInfo: AppInfo
  components?: Record<string, unknown>
  headerConfig?: HeaderConfig
  utils?: Record<string, (...args: any[]) => any>
  methods?: Record<string, (...args: any[]) => any>
}

// ============ PostMessage 消息体 ============

/**
 * * @description: PostMessage 消息通用结构
 */
export interface MicroAppMessage<T = unknown> {
  type: string
  payload: T
}

/**
 * * @description: 导航请求 payload
 */
export interface NavigatePayload {
  path: string
}

/**
 * * @description: 自定义消息 payload
 */
export interface CustomMessagePayload {
  message: string
  timestamp?: number
}

/**
 * * @description: 数据更新 payload
 */
export interface DataUpdatePayload {
  module: string
  data: Record<string, unknown>
}

/**
 * * @description: 子应用挂载通知 payload
 */
export interface MountedPayload {
  name: string
  version: string
  timestamp: number
}

/**
 * * @description: 路由变化通知 payload
 */
export interface RouteChangePayload {
  path: string
  name?: string | symbol
}
