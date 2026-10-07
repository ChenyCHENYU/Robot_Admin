/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 路由加载反馈适配；组件库负责动画与延迟，项目只关联导航生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { createPageLoading } from '@robot-admin/naive-ui-components/C_PageLoading'
import type { Router, RouteLocationNormalized } from 'vue-router'

export const pageLoading = createPageLoading({ delay: 160 })
const installedRouters = new WeakSet<Router>()

/** 仅在已有页面的切换中显示；首次启动由 HTML 首屏加载负责。 */
export function installPageLoading(router: Router): () => void {
  if (installedRouters.has(router)) return () => undefined
  installedRouters.add(router)
  const navigations = new WeakMap<RouteLocationNormalized, number>()
  const removeBefore = router.beforeEach((to, from) => {
    if (!from.matched.length || to.fullPath === from.fullPath) return
    navigations.set(to, pageLoading.start())
  })
  const removeAfter = router.afterEach(to => {
    const id = navigations.get(to)
    if (id !== undefined) {
      void nextTick(() => pageLoading.finish(id))
    }
  })
  const removeError = router.onError((_error, to) => {
    const id = navigations.get(to)
    if (id !== undefined) pageLoading.finish(id)
  })
  return () => {
    removeBefore()
    removeAfter()
    removeError()
    installedRouters.delete(router)
    pageLoading.reset()
  }
}
