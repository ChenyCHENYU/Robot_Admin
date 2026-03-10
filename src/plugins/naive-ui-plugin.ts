/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:42:08
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:41:07
 * @FilePath: \Robot_Admin\src\plugins\naive-ui.ts
 * @Description: naive-ui插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { App } from 'vue'
import { notification } from '@/plugins/discrete'

export { notification }

/**
 * * @description: naive-ui插件
 * ? @param {App} app
 * ! @return {*}  {void}
 */
export function setupNaiveUI(app: App) {
  app.provide('notification', notification)
}
