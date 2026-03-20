/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-15
 * @Description: file-utils 包初始化配置 - 桥接 naive-ui 消息系统
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { configureFileUtils } from '@robot-admin/file-utils'
import { message, notification } from '@/plugins/discrete'

/**
 * @description 初始化 file-utils 包配置
 * 将 naive-ui 的消息和通知系统注入到 file-utils 中
 * 使其在使用时能正确显示 UI 提示
 */
export function setupFileUtils(): void {
  configureFileUtils({
    onMessage: (type, text) => message[type](text),
    onNotification: (type, content, duration) =>
      notification[type]({ content, duration: duration ?? 2000 }),
  })
}
