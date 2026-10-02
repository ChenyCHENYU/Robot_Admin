/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-22
 * @FilePath: \Robot_Admin\src\plugins\micro-app.ts
 * @Description: micro-app 微前端插件初始化
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import microApp from '@micro-zoe/micro-app'

let started = false

/**
 * * @description: 初始化 micro-app 微前端框架
 * 首次进入微应用路由时按需调用；重复导航不会重复初始化。
 */
export function setupMicroApp() {
  if (started) return
  microApp.start({
    'disable-memory-router': false,
    'disable-patch-request': false,
  })
  started = true
}
