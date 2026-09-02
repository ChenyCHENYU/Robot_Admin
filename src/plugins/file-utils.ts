/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-15
 * @LastEditTime: 2026-09-02
 * @FilePath: \Robot_Admin\src\plugins\file-utils.ts
 * @Description: file-utils 包初始化配置 - 桥接 naive-ui 消息系统
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { configureFileUtils } from '@robot-admin/file-utils'
import { message, notification } from '@/plugins/discrete'

let initialized = false

/**
 * @description 初始化 file-utils 包配置
 * 将 naive-ui 的消息和通知系统注入到 file-utils 中
 * 各文件功能页面可安全调用；首次配置后幂等返回，避免重复修改全局配置
 */
export function setupFileUtils(): void {
  if (initialized) return

  configureFileUtils({
    onMessage: (type, text) => message[type](text),
    onNotification: (type, content, duration) =>
      notification[type]({ content, duration: duration ?? 2000 }),
  })

  initialized = true
}
