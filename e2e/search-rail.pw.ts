/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-06
 * @FilePath: \Robot_Admin\e2e\search-rail.pw.ts
 * @Description: 生产计划搜索操作行与隐藏班次条件的浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 窄屏允许进阶查询等附加操作换行，内置按钮与计数保持同行。 */
const readRail = (rail: Locator, includeExtraActions: boolean) =>
  rail.evaluate((element, includeExtras) => {
    const selector = includeExtras
      ? 'button'
      : '.form-search-hidden-trigger, .form-search-icon-button'
    const buttons = Array.from(element.querySelectorAll(selector), button =>
      button.getBoundingClientRect()
    )
    const label = element.querySelector(
      '.form-search-hidden-trigger .n-button__content'
    )!
    const text = document.createRange()
    text.selectNodeContents(label)
    return {
      sameRow: buttons.every(
        button => Math.abs(button.top - buttons[0].top) < 2
      ),
      labelLines: new Set(
        Array.from(text.getClientRects(), rect => Math.round(rect.top))
      ).size,
      fitsWidth: element.scrollWidth - element.clientWidth <= 1,
    }
  }, includeExtraActions)

test('隐藏条件计数在宽窄屏保持同行，班次查询和重置正常', async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1000 })
  await page.goto('/#/production-sales/production-plan')
  const workbench = page.getByTestId('production-plan')
  await expect(workbench).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)

  const search = workbench.locator('.ps-search')
  const rail = search.locator('.form-search-action-buttons')
  const searchButton = rail.getByRole('button', { name: '搜索', exact: true })
  const resetButton = rail.getByRole('button', { name: '重置', exact: true })
  const chip = rail.getByRole('button', { name: '查看隐藏条件（1 项）' })
  const ledger = workbench.getByRole('region', { name: '排产计划台账' })
  const count = ledger.locator('header span').first()
  await expect(count).toHaveText(/^18 项/)
  const initialLeft = await searchButton.evaluate(
    element => element.getBoundingClientRect().left
  )
  await rail.getByRole('button', { name: '展开搜索条件' }).click()
  const shift = search.locator('.n-form-item').filter({
    has: page.locator('.n-form-item-label').getByText('班次', { exact: true }),
  })
  await shift.locator('.n-base-selection').click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText('夜班', { exact: true })
    .click()
  await rail.getByRole('button', { name: '收起搜索条件' }).click()
  await expect(shift).toBeHidden()
  await expect(chip).toBeVisible()
  await expect
    .poll(() =>
      searchButton.evaluate(
        (element, left) =>
          Math.abs(element.getBoundingClientRect().left - left),
        initialLeft
      )
    )
    .toBeLessThan(2)

  const geometry = {
    sameRow: true,
    labelLines: 1,
    fitsWidth: true,
  }
  await expect.poll(() => readRail(rail, true)).toEqual(geometry)
  await page.setViewportSize({ width: 390, height: 900 })
  await expect.poll(() => readRail(rail, false)).toEqual(geometry)
  await expect(rail.getByRole('button', { name: '进阶查询' })).toBeVisible()

  await chip.press('Enter')
  const details = page.getByRole('region', { name: '隐藏条件', exact: true })
  await expect(details).toContainText('班次')
  await expect(details).toContainText('已折叠')
  await expect(chip).toHaveAttribute('aria-expanded', 'true')
  await chip.press('Escape')
  await expect(details).toBeHidden()
  await expect(chip).toBeFocused()
  await expect(count).toHaveText(/^18 项/)
  await searchButton.click()
  await expect(count).toHaveText(/^9 项/)
  await resetButton.click()
  await expect(count).toHaveText(/^18 项/)
  await expect(chip).toBeHidden()
})
