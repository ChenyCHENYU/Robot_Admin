/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 17:32:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 17:45:29
 * @FilePath: \Robot_Admin\src\directives\index.ts
 * @Description: 指令系统统一入口
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 导出插件安装函数
export { setupDirectives } from './install'

// 按需导出指令
export { default as vCopy } from './modules/copy'

// 导出类型
export type { CopyOptions, CopyBinding } from './modules/copy'
