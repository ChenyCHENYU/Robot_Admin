/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-30
 * @FilePath: \Robot_Admin\e2e\table-empty-state.pw.ts
 * @Description: 官方发布包在真实产销页面中的空态主题、窄屏与数据恢复回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const open = async (page: Page, route: string, root: string) => {
  await page.goto(`/#/production-sales/${route}`)
  await expect(page.getByTestId(root)).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
}

const assertIllustration = async (empty: Locator, prefix: string) => {
  await expect(empty).toBeVisible()
  await expect(empty.locator(`.${prefix}__title`)).toHaveText('没有可显示的行')
  await expect(empty.locator(`.${prefix}__hint`)).toContainText('调整查询条件')
  await expect(empty.locator('svg')).toHaveAttribute('aria-hidden', 'true')
  await expect(empty.locator('svg')).toHaveAttribute('viewBox', '0 0 96 84')
  await expect(empty.locator('svg [id],img')).toHaveCount(0)
  // 不能仅验证 DOM 存在：插画和两级文案都必须完整落在网格正文内。
  await expect
    .poll(() =>
      empty.evaluate(element => {
        const body = element
          .closest('.mach-root')!
          .querySelector('.mach-body')!
          .getBoundingClientRect()
        return [...element.children].every(child => {
          const rect = child.getBoundingClientRect()
          return (
            rect.top >= body.top - 1 &&
            rect.bottom <= body.bottom + 1 &&
            rect.left >= body.left - 1 &&
            rect.right <= body.right + 1
          )
        })
      })
    )
    .toBe(true)
  await expect(empty.locator('svg')).toHaveCSS('width', '96px')
  await expect(empty.locator('svg')).toHaveCSS('height', '84px')
}

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} 两套默认空态：Naive 原生与 Mach 插画、窄屏和数据恢复`, async ({
    page,
  }, info) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await installMockAdminSession(page)
    await page.addInitScript(
      value => localStorage.setItem('theme-mode', value),
      mode
    )
    await page.setViewportSize({ width: 1720, height: 1200 })
    await open(page, 'shipping', 'shipping-workbench')
    const search = page.locator('.ps-search')
    const input = search
      .locator('.n-form-item')
      .filter({
        has: page
          .locator('.n-form-item-label')
          .filter({ hasText: '发运单 / 客户' }),
      })
      .getByRole('textbox')
    await input.fill('无此发运单')
    await search.getByRole('button', { name: '搜索', exact: true }).click()
    const tableEmpty = page.locator('.shipping-queue .n-empty')
    await expect(tableEmpty).toBeVisible()
    await expect(tableEmpty.locator('.n-empty__icon')).toBeVisible()
    expect(
      await tableEmpty
        .locator('.n-empty__icon')
        .evaluate(element => getComputedStyle(element).color)
    ).toBe(mode === 'light' ? 'rgb(166, 197, 235)' : 'rgb(104, 137, 178)')
    await expect(page.locator('.shipping-queue .c-table-empty')).toHaveCount(0)
    await page
      .locator('.shipping-queue')
      .screenshot({ path: info.outputPath(`c-table-${mode}.png`) })
    await page.setViewportSize({ width: 760, height: 1100 })
    await tableEmpty.scrollIntoViewIfNeeded()
    await expect(tableEmpty).toBeVisible()
    await expect(tableEmpty.locator('.n-empty__icon')).toBeVisible()
    await expect(page.locator('.shipping-queue .c-table-empty')).toHaveCount(0)
    await tableEmpty.screenshot({
      path: info.outputPath(`c-table-${mode}-narrow.png`),
    })
    // 搜索配置要求有效条件，使用现有单号验证空态恢复。
    await input.fill('DN-261029-001')
    await search.getByRole('button', { name: '搜索', exact: true }).click()
    await expect(tableEmpty).toHaveCount(0)

    await page.setViewportSize({ width: 1720, height: 1200 })
    await open(page, 'sales-orders', 'business-workbench')
    await page.getByRole('button', { name: '体验空明细', exact: true }).click()
    const panel = page.getByTestId('line-panel')
    const machEmpty = panel.locator('.mach-empty')
    await assertIllustration(machEmpty, 'mach-empty')
    await panel.screenshot({ path: info.outputPath(`mach-table-${mode}.png`) })
    await page.setViewportSize({ width: 760, height: 1100 })
    // 缩放会重建覆盖层，滚动稳定的网格根节点，再定位当前空态。
    await panel.locator('.mach-root').scrollIntoViewIfNeeded()
    await expect(machEmpty).toBeInViewport()
    await assertIllustration(machEmpty, 'mach-empty')
    const clip = await machEmpty.boundingBox()
    expect(clip).not.toBeNull()
    await page.screenshot({
      clip: clip!,
      path: info.outputPath(`mach-table-${mode}-narrow.png`),
    })
    await expect
      .poll(() =>
        page
          .getByTestId('business-workbench')
          .evaluate(element => element.scrollWidth - element.clientWidth)
      )
      .toBeLessThanOrEqual(1)
    await page
      .getByRole('button', { name: '恢复当前单据', exact: true })
      .click()
    await expect(machEmpty).toHaveCount(0)
    await expect(panel.locator('.mach-row[data-id]').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}
