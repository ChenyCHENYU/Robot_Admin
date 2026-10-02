/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 14:09:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-11 08:13:36
 * @FilePath: \Robot_Admin\src\config\vite\viteConsolePluginConfig.ts
 * @Description: Vite 控制台插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import viteConsolePlugin from 'vite-console-plugin'

export default viteConsolePlugin({
  systemName: 'Robot Admin',
  description: '企业级后台管理系统',
  team: '共享技术中心',
  owner: 'CHENY | 编号: 409322',
  warning: '团队协作项目，修改前请先沟通',
  security: '生产环境禁止输出敏感信息',
  autoVersion: true,
})
