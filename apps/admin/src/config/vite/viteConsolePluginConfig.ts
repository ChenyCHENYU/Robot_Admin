/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 14:09:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-01 11:24:14
 * @FilePath: \Robot_Admin\src\config\vite\viteConsolePluginConfig.ts
 * @Description: Vite 控制台插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import viteConsolePlugin from 'vite-console-plugin'

export default viteConsolePlugin({
  systemName: 'Robot_Admin',
  description: '企业级后台管理系统',
  team: '信息化部-业务2室西安领域',
  owner: 'CHENY | 编号: 409322',
  warning: '团队协作项目，修改前请先沟通',
  security: '生产环境禁止输出敏感信息',
  autoVersion: true,
})
