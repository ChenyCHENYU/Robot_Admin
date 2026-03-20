/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:48:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-05
 * @FilePath: \Robot_Admin\src\config\vite\index.ts
 * @Description: Vite 配置文件入口
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

export { default as viteConsolePlugin } from './viteConsolePluginConfig'
export { default as viteAutoImportPlugin } from './viteAutoImportConfig'
export { default as viteComponentsPlugin } from './viteComponentsConfig'
export { default as resolveConfig } from './viteResolveConfig'
export { default as serverConfig } from './viteServerConfig'
export { default as buildConfig } from './viteBuildConfig'
export {
  default as createI18nPlugin,
  createVuePluginOptions,
} from './viteI18nConfig'
