/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\utils\d_notificationTarget.ts
 * @Description: 消息业务入口只允许已注册且当前账户获授权的站内页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Router } from 'vue-router'

const isInternalPath = (path: unknown): path is string =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('\\') &&
  ![...path].some(character => character.charCodeAt(0) <= 32)

/** 消息内容不能自行引入外部页面、登录跳转或不存在的业务入口。 */
export function resolveNotificationTarget(
  path: unknown,
  router: Pick<Router, 'resolve'>,
  hasPermission: (path: string) => boolean
): { path: string } | { error: string } {
  if (!isInternalPath(path)) return { error: '消息未提供有效的业务入口' }
  try {
    const resolved = router.resolve(path)
    if (
      !resolved.matched.length ||
      resolved.matched.some(record => record.path.includes(':pathMatch')) ||
      ['/login', '/401', '/404'].includes(resolved.path) ||
      !hasPermission(resolved.path)
    )
      return { error: '业务入口已失效或当前账户没有访问权限' }
    return { path: resolved.fullPath }
  } catch {
    return { error: '业务入口已失效，请联系消息发送方' }
  }
}
