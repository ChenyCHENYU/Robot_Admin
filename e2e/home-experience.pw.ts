/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\home-experience.pw.ts
 * @Description: 首页响应式、主题、真实版本与权限入口，以及登录下拉高亮回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { solveDemoCaptcha } from './d_login'

const componentVersion = JSON.parse(
  readFileSync(
    new URL(
      '../node_modules/@robot-admin/naive-ui-components/package.json',
      import.meta.url
    ),
    'utf8'
  )
).version

for (const mode of ['light', 'dark']) {
  test(`${mode} 用户弹层退出项的文字与图标在默认和悬停时保持危险操作颜色`, async ({
    page,
  }) => {
    await installMockAdminSession(page)
    await page.addInitScript(
      mode => localStorage.setItem('theme-mode', mode),
      mode
    )
    await page.goto('/#/home')
    await page.locator('.navbar-right .user-info').click()
    const item = page.locator('.user-panel__item--danger')
    await expect(item).toBeVisible()
    const expected = await item.evaluate(element => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--error-color, var(--c-error))'
      element.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    })
    await expect(item).toHaveCSS('color', expected)
    await expect(item.locator('.user-panel__item-icon')).toHaveCSS(
      'color',
      expected
    )
    await item.hover()
    await expect(item).toHaveCSS('color', expected)
    await expect(item.locator('.user-panel__item-icon')).toHaveCSS(
      'color',
      expected
    )
  })
}

for (const width of [1440, 3440]) {
  test(`${width}px 首页铺满内容区域并跟随主题，入口可正常导航`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1100 })
    await page.emulateMedia({ colorScheme: 'dark' })
    await installMockAdminSession(page)
    await page.goto('/#/home')
    await expect(page.locator('.home-entry')).toHaveCount(8)
    await expect(
      page.locator('.home-package').filter({ hasText: 'naive-ui-components' })
    ).toContainText(componentVersion)
    await expect(page.locator('.home-entry .home-icon').first()).toHaveCSS(
      'mask-image',
      /url\(/
    )
    const bounds = await page.locator('.home-top-grid').evaluate(element => {
      const intro = element
        .querySelector('.home-intro')!
        .getBoundingClientRect()
      const workspace = element
        .querySelector('.enterprise-overview')!
        .getBoundingClientRect()
      const parent = element.getBoundingClientRect()
      return {
        gap: workspace.x - intro.right,
        rowOffset: workspace.y - intro.y,
        rightGap: parent.right - workspace.right,
        leftGap: intro.x - parent.x,
        width: parent.width,
      }
    })
    expect(bounds.width).toBeGreaterThan(width * 0.7)
    expect(bounds.gap).toBeGreaterThan(0)
    expect(Math.abs(bounds.rowOffset)).toBeLessThan(1)
    expect(Math.abs(bounds.rightGap)).toBeLessThan(1)
    expect(Math.abs(bounds.leftGap)).toBeLessThan(1)
    const panel = page.locator('.home-panel').first()
    await expect(panel).toHaveCSS('background-color', 'rgb(28, 28, 28)')
    await page.locator('[data-guide="theme"] button').click()
    await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await page.locator('[data-guide="theme"] button').click()
    await expect(panel).toHaveCSS('background-color', 'rgb(28, 28, 28)')
    await page
      .locator('.home-entry')
      .filter({ hasText: '维护用户与公司成员关系' })
      .click()
    await expect(page).toHaveURL(/#\/sys-manage\/user-manage$/)
  })
}

test('390px 首页收为单列，展开或收起侧栏都无内容横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await installMockAdminSession(page)
  await page.goto('/#/home')
  const home = page.locator('.project-homepage')
  await expect(home).toBeVisible()
  expect(
    await home.evaluate(element => element.scrollWidth > element.clientWidth)
  ).toBe(false)
  await page.locator('#guide-menu-collapse').click()
  await expect
    .poll(() => home.evaluate(element => element.clientWidth))
    .toBeGreaterThan(250)
  await expect
    .poll(() =>
      home.evaluate(element => element.scrollWidth > element.clientWidth)
    )
    .toBe(false)
  const bounds = await page.locator('.home-top-grid').evaluate(element => {
    const intro = element.querySelector('.home-intro')!.getBoundingClientRect()
    const workspace = element
      .querySelector('.enterprise-overview')!
      .getBoundingClientRect()
    return {
      verticalGap: workspace.y - intro.bottom,
      horizontalOffset: workspace.x - intro.x,
    }
  })
  expect(bounds.verticalGap).toBeGreaterThan(0)
  expect(Math.abs(bounds.horizontalOffset)).toBeLessThan(1)
})

test('切换到审计公司后首页入口和页面统计随授权刷新', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.home-entry')).toHaveCount(8)
  const before = Number(
    await page
      .locator('.enterprise-overview__metrics strong')
      .first()
      .innerText()
      .then(text => text.replace(/\D/g, ''))
  )
  await page.locator('.navbar-right .user-info').click()
  await page.getByRole('button', { name: '切换公司' }).click()
  await page.getByRole('button', { name: '进入 西安天智 · 西安天智' }).click()
  await expect(page.locator('.enterprise-overview')).toContainText('只读审计')
  await expect(page.locator('.home-entry[href*="sys-manage"]')).toHaveCount(0)
  await expect(page.locator('.home-entry[href*="about"]')).toBeVisible()
  const after = Number(
    await page
      .locator('.enterprise-overview__metrics strong')
      .first()
      .innerText()
      .then(text => text.replace(/\D/g, ''))
  )
  expect(after).toBeLessThan(before)
})

test('公司卡片在亮色系统主题下保持深色高亮，并可用键盘直接进入', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/#/login')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  const company = page.getByRole('button', {
    name: '进入江苏金恒（南京）',
    exact: true,
  })
  await expect(company).toBeVisible()
  await expect(page.locator('.c-login__submit-btn')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '确认工作公司' })).toHaveCount(
    0
  )
  await company.hover()
  const background = await page
    .locator('.company-entry')
    .evaluate(element => getComputedStyle(element).backgroundImage)
  expect(background).toContain('gradient')
  await company.focus()
  await expect(company).toBeFocused()
  await company.press('Enter')
  await expect(page).toHaveURL(/#\/home$/)
})
