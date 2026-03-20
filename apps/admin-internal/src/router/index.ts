/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-06 16:19:04
 * @FilePath: \Robot_Admin\src\router\index.ts
 * @Description: 路由入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './publicRouter'

/**
 * @description 动态路由参数配置简介
 * @param path ==> 菜单路径
 * @param name ==> 菜单别名
 * @param redirect ==> 重定向地址
 * @param component ==> 视图文件路径
 * @param meta ==> 菜单信息
 * @param meta.icon ==> 菜单图标
 * @param meta.title ==> 菜单标题
 * @param meta.link ==> 是否外链
 * @param meta.hidden ==> 是否隐藏
 * @param meta.full ==> 是否全屏(示例：用来隔离数据大屏页面)
 * @param meta.keepAlive ==> 是否缓存
 * */

const mode = import.meta.env.VITE_ROUTER_MODE as 'hash' | 'history'

const routerMode = {
  hash: () => createWebHashHistory(),
  history: () => createWebHistory(),
}

const historyCreator = routerMode[mode] || createWebHashHistory

const router = createRouter({
  routes,
  history: historyCreator(),
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})
export default router
