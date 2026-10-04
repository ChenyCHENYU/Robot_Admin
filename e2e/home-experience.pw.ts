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

const componentVersion = JSON.parse(
  readFileSync(
    new URL(
      '../node_modules/@robot-admin/naive-ui-components/package.json',
      import.meta.url
    ),
    'utf8'
  )
).version

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

test('登录公司下拉在悬停、选中和重新展开时保持柔和的深色高亮', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/#/login')
  const selection = page.locator('.login-workspace .n-base-selection')
  await expect(selection).toContainText('江苏金恒（南京）')
  await selection.click()
  const selected = page.locator('.n-base-select-option--selected')
  await expect(selected).toBeVisible()
  /** 按实际菜单背景混合伪元素高亮，避免亮色主题的白底再次覆盖深色菜单。 */
  const readHighlight = () =>
    selected.evaluate(element => {
      const color = getComputedStyle(element, '::before')
        .backgroundColor.match(/[\d.]+/g)!
        .map(Number)
      const menu = element.closest('.n-base-select-menu')!
      const background = getComputedStyle(menu)
        .backgroundColor.match(/[\d.]+/g)!
        .map(Number)
      const alpha = color[3] ?? 1
      const average =
        color
          .slice(0, 3)
          .reduce(
            (total, channel, index) =>
              total + channel * alpha + background[index] * (1 - alpha),
            0
          ) / 3
      return { alpha, average }
    })
  await selected.hover()
  const active = await readHighlight()
  expect(active.alpha).toBeGreaterThan(0)
  expect(active.average).toBeLessThan(100)
  await page
    .locator('.n-base-select-option')
    .filter({ hasText: '江苏金恒（西安）' })
    .hover()
  expect((await readHighlight()).average).toBeLessThan(100)
  await page.keyboard.press('Escape')
  await expect(selected).not.toBeVisible()
  await selection.click()
  await expect(selected).toBeVisible()
  await selected.hover()
  await expect.poll(readHighlight).toEqual(active)
})
