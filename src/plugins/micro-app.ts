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

/**
 * * @description: 初始化 micro-app 微前端框架
 * 在主应用启动阶段调用，早于 Vue 实例挂载
 */
export function setupMicroApp() {
  microApp.start({
    'disable-memory-router': false,
    'disable-patch-request': false,
  })
  console.log('🚀 [主应用] micro-app 已启动')
}
