/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\error-page\components\c_errorPage\data.ts
 * @Description: 异常页展示配置与稳定粒子布局
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { CSSProperties } from 'vue'

export type ErrorCode = '401' | '403' | '404' | '500'
interface ErrorContent {
  title: string
  description: string
  icon: string
  decorations?: readonly [string, string]
}

export const errorContent: Record<ErrorCode, ErrorContent> = {
  '401': {
    title: '访问被拒绝',
    description: '抱歉，您没有权限访问此页面，请先登录或联系管理员',
    icon: 'i-mdi-shield-lock',
    decorations: ['i-mdi-key-chain', 'i-mdi-lock'],
  },
  '403': {
    title: '禁止访问',
    description: '抱歉，您的访问权限不足，无法查看此页面内容',
    icon: 'i-mdi-shield-lock-outline',
    decorations: ['i-mdi-shield-alert', 'i-mdi-shield-lock'],
  },
  '404': {
    title: '页面走丢了',
    description: '抱歉，您访问的页面不存在或已被移除',
    icon: 'i-mdi-robot-confused',
  },
  '500': {
    title: '服务器错误',
    description: '抱歉，服务器遇到了问题，我们正在努力修复中...',
    icon: 'i-mdi-server-network-off',
    decorations: ['i-mdi-server', 'i-mdi-alert-octagon'],
  },
}

/** 模块初始化时分布粒子；倒计时、语言和路由更新均不会重排位置。 */
export const particles: readonly CSSProperties[] = Array.from(
  { length: 20 },
  (_, index) => ({
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 53 + 7) % 100}%`,
    animationDelay: `${(index % 5) * 0.4}s`,
    animationDuration: `${2 + (index % 7) * 0.4}s`,
  })
)
