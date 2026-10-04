/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-04
 * @FilePath: \Robot_Admin\e2e\guide-experience.pw.ts
 * @Description: 通用引导接入后的布局定位、主题与生命周期回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.use({ viewport: { width: 1600, height: 1000 } })

const layouts = [
  '左侧菜单',
  '顶部菜单',
  '左侧混合',
  '顶部混合',
  '反转混合',
  '卡片网格',
]
const titles = [
  '欢迎使用 Robot Admin',
  '找到功能入口',
  '快速搜索功能',
  '管理已打开页面',
  '了解当前工作空间',
  '查看通知消息',
  '专注全屏工作',
  '切换界面语言',
  '选择舒适的主题',
  '调整布局与偏好',
  '确认公司与角色',
  '随时回来查看引导',
]

for (const layout of layouts) {
  test(`${layout} 的引导定位真实目标并能完成`, async ({ page }) => {
    await installMockAdminSession(page)
    await page.goto('/#/home')
    await page.locator('[aria-label="mdi:settings-transfer-outline"]').click()
    await page.locator('.n-tabs-tab').filter({ hasText: '布局' }).click()
    await page.locator('.layout-item').filter({ hasText: layout }).click()
    await page.locator('.n-drawer-header__close').click()
    await page.getByRole('button', { name: '功能引导', exact: true }).click()

    const verifyStep = async (index: number): Promise<void> => {
      const title = titles[index]
      await expect(page.locator('.driver-popover-title')).toHaveText(title)
      await expect(page.locator('.driver-popover-progress-text')).toHaveText(
        `${index + 1} / ${titles.length}`
      )
      await expect(page.locator('.driver-active-element')).toHaveCount(1)
      if (index > 0)
        await expect(page.locator('.driver-active-element')).toBeVisible()
      await expect(
        page.locator('#driver-dummy-element.driver-active-element')
      ).toHaveCount(index === 0 ? 1 : 0)
      await expect(
        page.getByRole('button', { name: '跳过引导', exact: true })
      ).toBeVisible()
      await expect(async () => {
        const bounds = await page.locator('.driver-popover').boundingBox()
        expect(bounds).not.toBeNull()
        expect(bounds!.x).toBeGreaterThanOrEqual(0)
        expect(bounds!.y).toBeGreaterThanOrEqual(0)
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1600)
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(1000)
      }).toPass()
      await expect(page.locator('.driver-popover-next-btn')).toBeEnabled()
      await page.locator('.driver-popover-next-btn').click()
      if (index + 1 < titles.length) await verifyStep(index + 1)
    }
    await verifyStep(0)
    await expect(page.locator('.driver-overlay')).toHaveCount(0)
  })
}

test('引导按需加载、跟随主题，并在隐藏标签或导航时清理', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await installMockAdminSession(page)
  await page.goto('/#/home')
  const trigger = page.getByRole('button', { name: '功能引导', exact: true })
  await expect(trigger).toBeVisible()
  expect(
    await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .filter(entry => /driver/.test(entry.name))
    )
  ).toHaveLength(0)

  const setTheme = async (theme: string, attempts = 0): Promise<void> => {
    if ((await page.locator('html').getAttribute('data-theme')) === theme)
      return
    expect(attempts).toBeLessThan(3)
    const switcher = page.getByRole('button', { name: /当前:.*点击切换/ })
    const label = await switcher.getAttribute('aria-label')
    const mode = theme === 'dark' ? '深色模式' : '浅色模式'
    if (label?.includes(mode)) {
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      return
    }
    await switcher.click()
    await expect(switcher).not.toHaveAttribute('aria-label', label!)
    await setTheme(theme, attempts + 1)
  }
  const readThemeBackground = async (theme: string): Promise<string> => {
    await setTheme(theme)
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    await trigger.click()
    await expect(page.locator('.driver-popover')).toBeVisible()
    const background = await page
      .locator('.driver-popover')
      .evaluate(element => getComputedStyle(element).backgroundColor)
    await page.keyboard.press('Escape')
    await expect(page.locator('.driver-overlay')).toHaveCount(0)
    return background
  }
  const backgrounds = [
    await readThemeBackground('light'),
    await readThemeBackground('dark'),
  ]
  expect(backgrounds[0]).not.toBe(backgrounds[1])

  await page.locator('[aria-label="mdi:settings-transfer-outline"]').click()
  await page.locator('.n-tabs-tab').filter({ hasText: '布局' }).click()
  await page
    .locator('.setting-item')
    .filter({ hasText: '显示标签页' })
    .getByRole('switch')
    .click()
  await page.locator('.n-drawer-header__close').click()
  await trigger.click()
  await expect(page.locator('.driver-popover-progress-text')).toHaveText(
    `1 / ${titles.length - 1}`
  )
  await expect(page.locator('[data-guide="tags"]')).toHaveCount(0)

  await page.goto('/#/home?guide=route-change')
  await expect(page.locator('.driver-overlay')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('引导可随时跳过并从入口重新查看', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  const trigger = page.getByRole('button', { name: '功能引导', exact: true })
  await expect(trigger).toBeVisible()
  await expect(page.locator('.driver-overlay')).toHaveCount(0)
  await trigger.click()
  await page.getByRole('button', { name: '跳过引导', exact: true }).click()
  await expect(page.locator('.driver-overlay')).toHaveCount(0)
  await expect(page.locator('.driver-active-element')).toHaveCount(0)
  await trigger.click()
  await expect(page.locator('.driver-popover-progress-text')).toHaveText(
    `1 / ${titles.length}`
  )
  await expect(page.locator('.driver-popover-next-btn')).toBeEnabled()
  await page.locator('.driver-popover-next-btn').click()
  await expect(page.locator('.driver-popover-title')).toHaveText('找到功能入口')
  await page.getByRole('button', { name: '跳过引导', exact: true }).click()
  await expect(page.locator('.driver-overlay')).toHaveCount(0)
  await trigger.click()
  await expect(page.locator('.driver-popover-title')).toHaveText(
    '欢迎使用 Robot Admin'
  )
  await page.keyboard.press('Escape')
  await expect(page.locator('.driver-overlay')).toHaveCount(0)
})
