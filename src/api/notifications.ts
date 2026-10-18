/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.ts
 * @Description: 企业消息服务入口，严格按部署数据模式选择适配器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { isMockDataMode } from '@/config/dataMode'
import type {
  NotificationScope,
  NotificationService,
} from './notifications.contract'
import { createNotificationDemoService } from './notifications.demo'
import { createNotificationRemoteService } from './notifications.remote'

/** 演示与远端使用同一领域契约，远端出错不会切换到本地数据。 */
export const createNotificationService = (
  scope: NotificationScope
): NotificationService =>
  isMockDataMode()
    ? createNotificationDemoService(scope)
    : createNotificationRemoteService(scope)
