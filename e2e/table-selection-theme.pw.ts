/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\e2e\table-selection-theme.pw.ts
 * @Description: 真实页面的紧凑默认、选中标识和实色控件前景回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} 表格使用紧凑默认、白勾与独立行标识`, async ({ page }, info) => {
    await installMockAdminSession(page)
    await page.addInitScript(value => {
      localStorage.setItem('theme-mode', value)
    }, mode)
    await page.setViewportSize({ width: 1560, height: 1050 })
    await page.goto('/#/demo/table-manage/table')
    const table = page.locator('.c-table-wrapper:visible').first()
    await expect(table).toBeVisible({ timeout: 20000 })
    await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
    await expect(table).toHaveClass(/c-table-wrapper--compact/)
    const rows = table.locator('tbody > tr')
    const checked = rows.first()
    const control = checked.locator(
      ':scope > .n-data-table-td--selection > .n-checkbox'
    )
    await control.click()
    await expect(control).toHaveClass(/n-checkbox--checked/)
    await expect(checked.locator('td').first()).not.toHaveCSS(
      'box-shadow',
      'none'
    )
    await expect(rows.nth(1).locator('td').first()).toHaveCSS(
      'box-shadow',
      'none'
    )
    expect(
      await control.evaluate(element =>
        getComputedStyle(element)
          .getPropertyValue('--n-check-mark-color')
          .trim()
      )
    ).toBe('#ffffff')
    await page.screenshot({ path: info.outputPath(`table-${mode}.png`) })
    await control.click()
    await expect(checked.locator('td').first()).toHaveCSS('box-shadow', 'none')

    await page.goto('/#/production-sales/shipping')
    await expect(page.getByTestId('shipping-workbench')).toBeVisible({
      timeout: 20000,
    })
    await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
    const add = page.getByRole('button', { name: '新增发运任务', exact: true })
    await expect(add).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(add.locator('svg').first()).toHaveCSS(
      'color',
      'rgb(255, 255, 255)'
    )
    const queueRow = page.locator('.shipping-queue tbody tr').first()
    expect((await queueRow.boundingBox())!.height).toBeLessThan(40)
    await page.screenshot({ path: info.outputPath(`shipping-${mode}.png`) })

    await page.goto('/#/demo/table-manage/mach-table')
    const grid = page.locator('.mach-table-demo .mach-root')
    await expect(grid).toBeVisible({ timeout: 20000 })
    const machControl = grid.locator('.mach-row-checkbox').nth(1)
    await machControl.check()
    const machRow = machControl.locator('..').locator('..')
    await expect(machRow).toHaveClass(/mach-row--selected/)
    await expect(machRow).toHaveCSS('height', '30px')
    expect(
      await machRow.evaluate(row => getComputedStyle(row, '::after').width)
    ).toBe('2px')
    expect(
      await machControl.evaluate(
        input => getComputedStyle(input, '::before').backgroundColor
      )
    ).toBe('rgb(255, 255, 255)')
    await grid.screenshot({ path: info.outputPath(`mach-${mode}.png`) })
  })
}
