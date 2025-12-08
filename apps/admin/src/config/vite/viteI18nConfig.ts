/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-19 08:35:33
 * @FilePath: \Robot_Admin\src\config\vite\viteI18nConfig.ts
 * @Description: Vite 国际化插件配置（独立维护）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Plugin } from 'vite'

/**
 * @description i18n 插件配置
 * @returns {Plugin | null} 返回插件实例或 null（禁用时）
 *
 * 📌 使用方式：
 * 1. 安装依赖: bun add -D vite-auto-i18n-plugin
 * 2. 申请有道翻译 API: https://ai.youdao.com/
 * 3. 在 envs/.env.development 中配置:
 *    VITE_I18N_ENABLED=true
 *    VITE_YOUDAO_APP_ID=你的AppId
 *    VITE_YOUDAO_APP_KEY=你的AppKey
 * 4. 在入口文件 main.ts 顶部添加: import '../lang/index.js'
 *
 * 💡 工作原理：
 * - 开发环境: 自动扫描代码中的中文并调用API翻译，生成 lang/index.json
 * - 生产环境: 直接使用已生成的 lang/index.json，不调用翻译API
 * - 运行时: 所有环境都加载 lang/index.js 提供 window.$t() 函数
 */
export default function createI18nPlugin(): Plugin | null {
  const enabled = process.env.VITE_I18N_ENABLED === 'true'

  if (!enabled) {
    return null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const autoI18n = require('vite-auto-i18n-plugin').default
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { YoudaoTranslator } = require('vite-auto-i18n-plugin')

    const appId = process.env.VITE_YOUDAO_APP_ID
    const appKey = process.env.VITE_YOUDAO_APP_KEY

    if (!appId || !appKey) {
      console.warn('⚠️ i18n 翻译 API 未配置，将跳过自动翻译')
      return null
    }

    return autoI18n({
      // ========== 基础配置 ==========
      enabled: true, // 是否启用插件
      translateType: 'full-auto', // 全自动翻译中文（full-auto | semi-auto）
      translateKey: '$t', // 翻译函数名称
      logLevel: 'error', //  日志级别：error | warn | info (只在有错误时输出)

      // ========== 路径配置（白名单机制）==========
      includePath: [
        /src\/views\//,
        /src\/components\//,
        /src\/router\//,
        /src\/stores\//,
        /src\/utils\/plugins\//, // ✅ 包含插件目录（i18n-route.ts）
      ],

      excludedPath: [
        'node_modules',
        'src/api/generated', // 🔒 排除自动生成的 API 代码
        'src/assets/data', // 🔒 排除静态数据文件（JSON 不会被扫描）
        'src/types', // 🔒 排除类型声明文件
        'dist',
        'lang',
      ],

      // ========== 排除规则（避免误翻译）==========
      excludedPattern: [
        /\.\w+$/, // 文件扩展名：.vue .ts .js
        /^[a-z_]+$/i, // 变量名：userName, user_name
        /^\/.+\/[gimsuy]*$/, // 正则表达式：/pattern/g
        /^http(s)?:\/\//, // URL：https://example.com
        /^#[0-9a-f]{3,6}$/i, // 颜色值：#fff #123456
        /^\d+(\.\d+)?(px|em|rem|vh|vw|%)?$/, // CSS 数值：100px 1.5rem
      ],

      excludedCall: [
        'require',
        'import',
        'console.log',
        'console.info',
        'console.warn',
        'console.error',
        'console.debug',
      ],

      // ========== 翻译器配置 ==========
      translator: new YoudaoTranslator({
        appId: appId,
        appKey: appKey,
      }),

      // ========== 语言配置 ==========
      originLang: 'zh-cn', // 源语言
      targetLangList: ['en', 'ja', 'ko'], // 目标语言列表（已添加日语和韩语）

      // ========== 输出配置 ==========
      globalPath: './lang',
      distPath: './dist',
      distKey: 'index',
      namespace: 'robot_admin',

      // ========== 高级配置 ==========
      deepScan: true, // ✅ 深度扫描（精确切割模板字符串，自动识别对象属性中的中文）
      isClearSpace: true, // 清除字符串前后空格
      buildToDist: true, // 构建时打包翻译文件到主包
      rewriteConfig: false, // 🔒 不重写配置文件（避免覆盖手动修改）
      isClear: false, // 是否清理未使用的翻译键（生产环境可启用）

      // ========== 插值翻译支持 ==========
      // 示例："欢迎 {name} 登录" -> $t('xxx', { name: '张三' })
      // 需要配合 commonTranslateKey 使用
      commonTranslateKey: '', // 通用翻译 key 前缀

      // ========== 文件扩展名配置 ==========
      // ✅ 扫描 .ts 和 .tsx 文件（对象属性、数组元素中的中文字符串）
      insertFileExtensions: ['ts', 'tsx'],
    })
  } catch (error) {
    console.warn(
      '⚠️ i18n 插件未安装，请运行: pnpm add -D vite-auto-i18n-plugin'
    )
    console.warn('错误详情:', error)
    return null
  }
}

/**
 * @description Vue 插件配置（i18n 需要特殊处理）
 * @returns {object} Vue 插件配置对象
 *
 * 重要：i18n 插件需要禁用 Vue 的某些优化
 */
export function createVuePluginOptions() {
  const i18nEnabled = process.env.VITE_I18N_ENABLED === 'true'

  // 🔥 仅在启用 i18n 时修改 Vue 配置
  if (i18nEnabled) {
    return {
      template: {
        compilerOptions: {
          hoistStatic: false, // 禁用静态提升（i18n 需要）
          cacheHandlers: false, // 禁用事件处理器缓存（i18n 需要）
        },
      },
    }
  }

  // 未启用 i18n 时保持默认配置（性能最优）
  return {}
}
