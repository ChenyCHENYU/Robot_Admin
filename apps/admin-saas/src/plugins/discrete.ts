/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-10
 * @Description: Naive UI Discrete API 共享实例 — 全局唯一，跟随主题
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { createDiscreteApi } from 'naive-ui/es'

/**
 * * @description: 全局唯一 Discrete API 实例
 * ! 所有需要在组件外使用 message / notification 的场景统一从此处导入
 */
const { message, notification } = createDiscreteApi(
  ['message', 'notification'],
  {
    messageProviderProps: { max: 3 },
    notificationProviderProps: {
      max: 3,
      placement: 'top-right',
      keepAliveOnHover: true,
    },
  }
)

export { message, notification }
