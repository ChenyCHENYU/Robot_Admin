/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 20:40:08
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:40:17
 * @FilePath: \Robot_Admin\types\menu.d.ts
 * @Description: 菜单类型定义
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
declare namespace Menu {
  interface MenuOptions {
    name?: string
    meta?: {
      hidden?: boolean
      isKeepAlive?: boolean
      [key: string]: unknown
    }
    children?: MenuOptions[]
    [key: string]: unknown
  }
}
