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
  await expect(empty.locator(`.${prefix}__title`)).toHaveText(
    '当前订单还没有商品明细'
  )
  await expect(empty.locator(`.${prefix}__hint`)).toContainText(
    '新增明细后即可核对数量和金额'
  )
  await expect(empty.locator('svg')).toHaveAttribute('aria-hidden', 'true')
  await expect(empty.locator('svg')).toHaveAttribute('viewBox', '0 0 96 84')
  await expect(empty.locator('svg [id],img')).toHaveCount(0)
  // 覆盖层直属网格根；autoHeight 空数据的 body 高度为零，按实际裁切根及命中验收。
  await expect
    .poll(() =>
      empty.evaluate(element => {
        const root = element.closest('.mach-root')!
        const bounds = root.getBoundingClientRect()
        return [...element.children].every(child => {
          const rect = child.getBoundingClientRect()
          const hit = root.ownerDocument.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          )
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top >= bounds.top - 1 &&
            rect.bottom <= bounds.bottom + 1 &&
            rect.left >= bounds.left - 1 &&
            rect.right <= bounds.right + 1 &&
            (hit === child || child.contains(hit))
          )
        })
      })
    )
    .toBe(true)
  await expect(empty.locator('svg')).toHaveCSS('width', '96px')
  // 窄分栏优先保留文案，插画可在84px以内自适应缩小。
  const illustration = (await empty.locator('svg').boundingBox())!
  expect(illustration.height).toBeGreaterThan(0)
  expect(illustration.height).toBeLessThanOrEqual(84)
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
    await expect(
      page.getByTestId('line-panel').locator('.mach-row[data-id]').first()
    ).toBeVisible()
    await page.getByRole('button', { name: '全选明细', exact: true }).click()
    await page
      .getByRole('button', { name: '删除选中明细', exact: true })
      .click()
    await page
      .locator('.n-dialog')
      .getByRole('button', { name: '删除明细', exact: true })
      .click()
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
