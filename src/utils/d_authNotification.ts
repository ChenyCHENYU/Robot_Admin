/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\src\utils\d_authNotification.ts
 * @Description: 登录与退出共用一个通知位置，避免快速退出后残留欢迎提示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { notification } from '@/plugins/discrete'
import { createLoginFeedback, createLogoutFeedback } from './d_authFeedback'

let currentNotice: { destroy: () => void } | undefined

/** 完整会话已经就绪时展示一次欢迎，不影响其他业务通知。 */
export const notifyLoginSuccess = (displayName: string, companyName = '') => {
  currentNotice?.destroy()
  currentNotice = notification.success(
    createLoginFeedback(displayName, companyName)
  )
}

/** 离开会话后替换旧欢迎；主动退出和登录到期采用不同语气。 */
export const notifyLogout = (displayName: string, isExpired = false) => {
  currentNotice?.destroy()
  const feedback = createLogoutFeedback(displayName, isExpired)
  currentNotice = isExpired
    ? notification.warning(feedback)
    : notification.success(feedback)
}
