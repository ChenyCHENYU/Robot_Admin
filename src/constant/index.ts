/*
 * @Author: ChenYu
 * @Date: 2022-04-06 01:23:50
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10
 * @FilePath: \Robot_Admin\src\constant\index.ts
 * @Description: 常量文件夹
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

export const TOKEN: string = 'token'

// token 时间戳
export const TIME_STAMP: string = 'timeStamp'

// * 超时时长：8小时（活跃续期机制）
export const TOKEN_TIMEOUT_VALUE: number = 8 * 3600 * 1000

// * 国际化
export const LANG: string = 'language'

// * 首页地址（默认）
export const HOME_URL: string = '/home'

// * 登录页地址（默认）
export const LOGIN_URL: string = '/login'

// * 默认主题颜色
export const DEFAULT_PRIMARY: string = '#409eff'

// * 权限缓存 key
export const PERMISSION_CACHE_KEY: string = 'permission_cache'

// * 数据权限范围常量
export const DATA_SCOPE = {
  ALL: 'all',
  DEPARTMENT: 'department',
  DEPARTMENT_BELOW: 'department_below',
  SELF: 'self',
  CUSTOM: 'custom',
} as const

// * Tabs（白名单地址，不需要添加到 tabs 的路由地址）
export const TABS_WHITE_LIST: string[] = ['/403', '/404', '/500', LOGIN_URL]

// * 高德地图key
export const MAP_KEY: string = import.meta.env.VITE_MAP_KEY || ''
