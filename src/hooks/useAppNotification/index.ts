/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 20:05:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:06:50
 * @FilePath: \Robot_Admin\src\hooks\useAppNotification\index.ts
 * @Description: 封装naive-ui 的全局通知组件逻辑，通过依赖注入的方式
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { useNotification, type NotificationApi } from 'naive-ui'

/**
 *? 获取全局 notification 实例
 *? 组件内优先使用 naive-ui 的 useNotification
 *? 组件外（如普通 ts 文件）用 inject 获取
 */
export function useAppNotification(): NotificationApi {
  // 组件内 setup 时 useNotification 会有实例
  try {
    // 在组件上下文中直接使用 naive-ui 的 hook
    return useNotification()
  } catch {
    // 非组件环境（如普通 ts 文件）通过依赖注入获取

    // 从 Vue 上下文注入获取 notification 实例
    const notification = inject<NotificationApi>('notification')

    // 防御性检查确保实例存在
    if (!notification) {
      throw new Error('notification 未注入，请检查 main.ts')
    }

    // 返回可用的 notification 实例
    return notification
  }
}
