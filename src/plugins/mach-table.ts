/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\plugins\mach-table.ts
 * @Description: 一次安装异步 MachTable 插件，共享外观且保留页面按需加载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { App } from 'vue'
import AsyncMachTablePlugin from '@agile-team/mach-table-vue/async'
import machTableConfig from '@/config/mach-table'

/** 配置随应用安装，网格组件和 Core 仍在首次渲染表格时加载。 */
export function setupMachTable(app: App): void {
  app.use(AsyncMachTablePlugin, machTableConfig)
}
