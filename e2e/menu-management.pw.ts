/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\e2e\menu-management.pw.ts
 * @Description: 菜单工作区、真实 KeepAlive 状态与主题响应式回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const menuPath = '/sys-manage/menu-manage'

/** 单页导航保持同一文档，避免刷新掩盖缓存失效。 */
async function navigate(page: Page, path: string) {
  await page.evaluate(path => {
    location.hash = path
  }, path)
  await expect(page).toHaveURL(new RegExp(`#${path}$`))
}

/** 在实际菜单编辑入口切换缓存，并等待新路由接管当前页面。 */
async function toggleMenuCache(page: Page) {
  await page
    .locator('.details-panel')
    .getByRole('button', { name: '编辑菜单', exact: true })
    .click()
  const editor = page.locator('.menu-editor')
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '页面缓存' })
    .getByRole('switch')
    .click()
  await editor.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(editor).not.toBeVisible()
  await page.getByRole('button', { name: '同步导航', exact: true }).click()
  await expect(page.getByRole('textbox', { name: '搜索菜单' })).toHaveValue('')
  await expect(
    page.getByRole('button', { name: '新增菜单', exact: true }).first()
  ).toBeEnabled()
}

test('缓存开关控制真实页面状态，刷新只保留配置', async ({ page }) => {
  test.setTimeout(90_000)
  await installMockAdminSession(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`/#${menuPath}`)
  await expect(page.locator('.details-panel')).toContainText(
    '/sys-manage/menu-manage'
  )
  await toggleMenuCache(page)
  await expect(page.locator('.details-panel')).toContainText('缓存已开启')
  const search = page.getByRole('textbox', { name: '搜索菜单' })
  await search.fill('menu-manage')
  await navigate(page, '/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await navigate(page, menuPath)
  await expect(search).toHaveValue('menu-manage')
  await page.reload()
  await expect(search).toHaveValue('')
  await expect(page.locator('.details-panel')).toContainText('缓存已开启')
  await toggleMenuCache(page)
  await expect(page.locator('.details-panel')).toContainText('每次进入重新加载')
  await search.fill('menu-manage')
  await navigate(page, '/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await navigate(page, menuPath)
  await expect(search).toHaveValue('')
  expect(errors).toEqual([])
})

test('空权限可直接新增，重复权限被校验，删除需要确认', async ({ page }) => {
  test.setTimeout(60_000)
  await installMockAdminSession(page)
  await page.goto(`/#${menuPath}`)
  const search = page.getByRole('textbox', { name: '搜索菜单' })
  await search.fill('/demo/icon')
  await page
    .locator('.menu-tree .n-tree-node-content')
    .filter({ hasText: '图标选择器' })
    .click()
  await expect(page.locator('.permissions-section')).toContainText(
    '尚未配置按钮权限'
  )
  const add = page.getByRole('button', { name: '添加权限', exact: true })
  await add.click()
  const editor = page.locator('.menu-editor')
  await editor.getByPlaceholder('请输入清晰易懂的名称').fill('浏览图标')
  await editor.getByPlaceholder('如 sys:menu:add').fill('demo:icon:view')
  await editor.getByRole('button', { name: '确认新增', exact: true }).click()
  await expect(editor).not.toBeVisible()
  const row = page
    .locator('.permission-row')
    .filter({ hasText: 'demo:icon:view' })
  await expect(row).toBeVisible()
  await add.click()
  await editor.getByPlaceholder('请输入清晰易懂的名称').fill('重复权限')
  await editor.getByPlaceholder('如 sys:menu:add').fill('demo:icon:view')
  await editor.getByRole('button', { name: '确认新增', exact: true }).click()
  await expect(editor).toContainText('权限标识已存在')
  await editor.getByRole('button', { name: '取消', exact: true }).click()
  await row.getByRole('button', { name: '删除', exact: true }).click()
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: '删除', exact: true }).click()
  await page.getByRole('button', { name: '确认删除', exact: true }).click()
  await expect(row).toHaveCount(0)
})

test('亮暗主题与窄屏保持完整布局，父级选择排除自身和后代', async ({
  page,
}, testInfo) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/#${menuPath}`)
  await expect(page.locator('.details-panel h2')).toContainText('菜单管理')
  await page.screenshot({
    path: testInfo.outputPath('menu-desktop.png'),
    fullPage: true,
  })
  await page.getByRole('textbox', { name: '搜索菜单' }).fill('系统管理')
  await page
    .locator('.menu-tree .n-tree-node-content')
    .filter({ hasText: '系统管理' })
    .first()
    .click()
  await page
    .locator('.details-panel')
    .getByRole('button', { name: '编辑菜单', exact: true })
    .click()
  const editor = page.locator('.menu-editor')
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '上级目录' })
    .locator('.n-base-selection')
    .click()
  await expect(page.locator('.n-tree-select-menu')).not.toContainText(
    '系统管理'
  )
  await expect(page.locator('.n-tree-select-menu')).not.toContainText(
    '菜单管理'
  )
  await page.keyboard.press('Escape')
  await editor.getByRole('button', { name: '取消', exact: true }).click()
  await page.getByRole('textbox', { name: '搜索菜单' }).clear()
  await page.evaluate(() => {
    localStorage.setItem('theme-mode', 'dark')
  })
  await page.reload()
  await expect(page.locator('.details-panel h2')).toContainText('菜单管理')
  await page.screenshot({
    path: testInfo.outputPath('menu-dark.png'),
    fullPage: true,
  })
  await page.locator('#guide-menu-collapse').click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() =>
      page
        .locator('.n-layout-sider')
        .evaluate(el => Math.round(el.getBoundingClientRect().width))
    )
    .toBe(64)
  await expect(page.locator('.menu-workspace')).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('.menu-management')
        .evaluate(el => el.scrollWidth <= el.clientWidth + 1)
    )
    .toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('menu-mobile.png'),
    fullPage: true,
  })
})

test('切换公司清除缓存状态，返回公司后重新加载页面', async ({ page }) => {
  test.setTimeout(75_000)
  await installMockAdminSession(page)
  await page.addInitScript(() => {
    localStorage.setItem(
      'robot-admin:menu-cache:v1:jinheng-nanjing',
      JSON.stringify({ 'sys-menu-manage': true })
    )
  })
  await page.goto(`/#${menuPath}`)
  const search = page.getByRole('textbox', { name: '搜索菜单' })
  await expect(page.locator('.details-panel')).toContainText('缓存已开启')
  await search.fill('menu-manage')
  await page.locator('.navbar-right .user-info').click()
  await page.getByRole('button', { name: '切换公司', exact: true }).click()
  await page
    .getByRole('button', {
      name: '进入 江苏金恒 · 江苏金恒（西安）',
      exact: true,
    })
    .click()
  await expect(page.locator('.enterprise-overview')).toContainText(
    '江苏金恒（西安）'
  )
  await page.locator('.navbar-right .user-info').click()
  await page.getByRole('button', { name: '切换公司', exact: true }).click()
  await page
    .getByRole('button', {
      name: '进入 江苏金恒 · 江苏金恒（南京）',
      exact: true,
    })
    .click()
  await expect(page.locator('.enterprise-overview')).toContainText(
    '江苏金恒（南京）'
  )
  await navigate(page, menuPath)
  await expect(search).toHaveValue('')
  await expect(page.locator('.details-panel')).toContainText('缓存已开启')
  expect(
    await page.evaluate(() =>
      localStorage.getItem('robot-admin:menu-cache:v1:jinheng-xian')
    )
  ).toBeNull()
})
