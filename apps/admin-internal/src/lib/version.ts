/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-10 08:49:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-01 09:55:11
 * @FilePath: \Robot_Admin\src\lib\version.ts
 * @Description: 版本信息管理工具(配合release-please)
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import packageJson from '../../package.json'

export const showVersionInfo = () => {
  console.log(`
🚀 Robot Admin 后台管理系统
📦 版本: v${packageJson.version}
🕐 构建时间: ${new Date().toLocaleString('zh-CN')}
👨‍💻 作者: CHENY
  `)
}

// 开发环境自动显示
if (import.meta.env.DEV) showVersionInfo()
