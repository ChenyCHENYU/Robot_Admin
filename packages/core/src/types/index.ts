/*
 * @robot/core/types - 核心类型定义
 */

// 菜单类型
export interface MenuOptions {
  path: string
  name?: string
  meta?: {
    title?: string
    icon?: string | (() => any)
    hidden?: boolean
    keepAlive?: boolean
    [key: string]: any
  }
  disabled?: boolean
  type?: string
  icon?: string | (() => any)
  children?: MenuOptions[]
}

// 用户信息类型
export interface UserInfo {
  username?: string
  password?: string
  [key: string]: unknown
}

// 路由元信息类型
export interface RouteMeta {
  title?: string
  icon?: string | (() => any)
  hidden?: boolean
  keepAlive?: boolean
  full?: boolean
  link?: string
  [key: string]: any
}

// 动态路由类型
export interface DynamicRoute {
  path: string
  name?: string
  redirect?: string
  component?: any
  meta?: RouteMeta
  children?: DynamicRoute[]
}

// 导出所有类型
export * from './request'
