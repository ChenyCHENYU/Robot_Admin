/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-09
 * @FilePath: \Robot_Admin\src\router\authenticatedShell.ts
 * @Description: 认证提交后的布局与首页并行预加载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

let authenticatedShellPromise: Promise<void> | null = null

/**
 * 在登录请求进行期间并行加载布局与首页。相同动态 import 会被浏览器和
 * Vue Router 复用，不注册路由、不修改状态，也不会把其他业务页带入首屏。
 */
export const preloadAuthenticatedShell = (): Promise<void> => {
  if (authenticatedShellPromise) return authenticatedShellPromise

  authenticatedShellPromise = Promise.all([
    import('@/components/global/C_Layout/index.vue'),
    import('@/views/home/index.vue'),
  ])
    .then(() => undefined)
    .catch(error => {
      authenticatedShellPromise = null
      throw error
    })

  return authenticatedShellPromise
}
