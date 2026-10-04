/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\login-routing.pw.ts
 * @Description: 在正式产物中构造登录路由时间窗口，回归首页偶发 404
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { s_permissionStore } from '../src/stores/permission'
import { installMockAdminSession } from './auth-fixture'

type PermissionStore = ReturnType<typeof s_permissionStore>
type AppContainer = HTMLElement & { __vue_app__: App }

test('首页已解析为 404 后注册完成，守卫必须采用新的匹配且保留地址参数', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  const result = await page.evaluate(async () => {
    const app = (document.querySelector('#app') as AppContainer).__vue_app__
    const router = app.config.globalProperties.$router as Router
    const home = router.getRoutes().find(record => record.name === 'home')!
    const layout = router.getRoutes().find(record => record.path === '/')!
    router.removeRoute('home')
    const before = router.resolve('/home').name
    // push/replace 同步解析 matched，守卫在随后微任务中执行。
    const navigation = router.replace('/home?from=login-race#workspace')
    router.addRoute({
      path: '/',
      component: layout.components!.default,
      children: [
        {
          path: 'home',
          name: 'home',
          component: home.components!.default,
          meta: home.meta,
        },
      ],
    })
    await navigation
    return {
      before,
      after: router.currentRoute.value.name,
      fullPath: router.currentRoute.value.fullPath,
    }
  })
  expect(result).toEqual({
    before: 'NotFound',
    after: 'home',
    fullPath: '/home?from=login-race#workspace',
  })
  await expect(page.locator('.project-homepage')).toBeVisible()
  await expect(page.getByText('页面走丢了', { exact: true })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('已有菜单不等于路由就绪，缺少首页记录时等待重新注册再进入', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  const result = await page.evaluate(async () => {
    const app = (document.querySelector('#app') as AppContainer).__vue_app__
    const router = app.config.globalProperties.$router as Router
    const pinia = app.config.globalProperties.$pinia as {
      _s: Map<string, PermissionStore>
    }
    const permissions = pinia._s.get('permission')!
    // 恢复新会话中“菜单先返回、路由尚未注册”的真实状态。
    permissions.resetPermissions()
    router.removeRoute('home')
    await permissions.getAuthMenuList()
    const before = router.resolve('/home').name
    const menuCount = permissions.authMenuList.length
    await router.replace('/home?from=menus-before-routes')
    return { before, menuCount, after: router.currentRoute.value.name }
  })
  expect(result.before).toBe('NotFound')
  expect(result.menuCount).toBeGreaterThan(0)
  expect(result.after).toBe('home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await expect(page.locator('.enterprise-overview')).toContainText('企业管理员')
})

test('菜单加载缓慢时重叠导航共用一次初始化，最终进入最新目标', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  const result = await page.evaluate(async () => {
    const app = (document.querySelector('#app') as AppContainer).__vue_app__
    const router = app.config.globalProperties.$router as Router
    const pinia = app.config.globalProperties.$pinia as {
      _s: Map<string, PermissionStore>
    }
    const permissions = pinia._s.get('permission')!
    const original = permissions.getAuthMenuList.bind(permissions)
    let release!: () => void
    let started!: () => void
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    const requested = new Promise<void>(resolve => {
      started = resolve
    })
    let requests = 0
    permissions.getAuthMenuList = async (...args) => {
      requests += 1
      started()
      await gate
      return original(...args)
    }
    permissions.resetPermissions()
    router.removeRoute('home')
    try {
      const first = router.replace('/home?request=first')
      await requested
      const second = router.replace('/home?request=second#workspace')
      // 让第二个导航守卫进入同一份等待中的菜单任务，再释放接口响应。
      await new Promise(resolve => setTimeout(resolve, 0))
      release()
      await Promise.all([first, second])
      return {
        requests,
        name: router.currentRoute.value.name,
        fullPath: router.currentRoute.value.fullPath,
      }
    } finally {
      release()
      permissions.getAuthMenuList = original
    }
  })
  expect(result).toEqual({
    requests: 1,
    name: 'home',
    fullPath: '/home?request=second#workspace',
  })
  await expect(page.locator('.project-homepage')).toBeVisible()
})
