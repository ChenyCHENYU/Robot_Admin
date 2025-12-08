/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:01:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 14:10:01
 * @FilePath: \Robot_Admin\src\types\global.d.ts
 * @Description: 全局命名空间和工具类型
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 应用全局配置类型
 */
export interface AppConfig {
  name: string
  version: string
  title: string
  description?: string
  author?: string
}

/**
 * 应用主题配置类型
 */
export interface AppThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  borderRadius: number
  fontSize: number
}
