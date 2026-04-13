/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-04-13
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-04-13
 * @FilePath: \Robot_Admin\src\config\mf-css-isolation.ts
 * @Description: Module Federation CSS 隔离策略配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description: Module Federation CSS 隔离 — 三层方案
 *
 * Layer 1: NConfigProvider clsPrefix — 组件级前缀隔离
 * Layer 2: PostCSS 自动前缀 — 构建时自动添加作用域
 * Layer 3: Shadow DOM（可选）— 完全样式隔离（极端场景）
 */

/** 远程容器默认 CSS 类前缀 */
export const MF_CLS_PREFIX = 'mf'

/** 主应用默认 CSS 类前缀（NConfigProvider 默认值） */
export const HOST_CLS_PREFIX = 'n'

/**
 * * @description: 生成 PostCSS 前缀插件配置
 * ? @param {string} prefix CSS 类前缀
 * ! @return {object} PostCSS 插件配置
 */
export function createMfPostCSSConfig(prefix = MF_CLS_PREFIX) {
  return {
    plugins: {
      /**
       * postcss-prefix-selector:
       * 为远程组件容器内的样式自动添加作用域前缀
       * 例如 .n-button → .mf-remote-container .n-button
       */
      'postcss-prefix-selector': {
        prefix: `.${prefix}-remote-container`,
        // 排除全局样式和 Naive UI 自身的主题变量
        exclude: [
          /^:root/,
          /^body/,
          /^html/,
          /\.n-config-provider/,
          /^@keyframes/,
        ],
        // 仅处理远程组件相关样式文件
        includeFiles: [/mf-remote/i, /federation/i],
      },
    },
  }
}

/**
 * * @description: 根据宿主/远程角色获取对应的 cls-prefix
 * ? @param {'host' | 'remote'} role 应用角色
 * ! @return {string} CSS 类前缀
 */
export function getMfClsPrefix(role: 'host' | 'remote' = 'host'): string {
  return role === 'remote' ? MF_CLS_PREFIX : HOST_CLS_PREFIX
}
