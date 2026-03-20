/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:01:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 14:13:05
 * @FilePath: \Robot_Admin\src\types\unocss.d.ts
 * @Description: UnoCSS 相关类型声明
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * UnoCSS 配置相关类型
 */
declare module '@unocss/core' {
  interface Theme {
    // 如果需要扩展主题类型，可以在这里添加
  }
}

/**
 * 扩展 UnoCSS 用户快捷方式类型定义
 */
declare module 'unocss' {
  interface UserShortcuts {
    /** 垂直居中的 flex 布局 */
    'flex-col-center': string
    /** 标题文本样式 */
    'text-header': string
    /** 按钮基础样式 */
    btn: string
    /** 水平垂直居中的 flex 布局 */
    'flex-center': string

    // 可以继续添加其他自定义快捷方式
  }
}
