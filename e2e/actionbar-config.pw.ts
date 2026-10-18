/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\actionbar-config.pw.ts
 * @Description: 按钮组尺寸、紧凑间距、容器换行与树表字段语义回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1000 })
})

for (const theme of ['light', 'dark']) {
  test(`${theme} 配置开关真实改变间距与按钮行数，尺寸切换即时生效`, async ({
    page,
  }) => {
    await page.addInitScript(
      mode => localStorage.setItem('theme-mode', mode),
      theme
    )
    await page.goto('/#/demo/action-bar')
    const config = page.locator('.action-bar-config')
    const preview = config.locator('.action-bar-config__preview')
    const bar = preview.locator('.c-action-bar')
    const buttons = bar.locator('button')
    await expect(buttons).toHaveCount(6)
    const layout = () =>
      bar.evaluate(element => ({
        padding: getComputedStyle(element).paddingTop,
        gap: getComputedStyle(element.querySelector('.actions-group')!).gap,
        rows: new Set(
          Array.from(element.querySelectorAll('button')).map(button =>
            Math.round(button.getBoundingClientRect().top)
          )
        ).size,
      }))
    expect(await layout()).toEqual({ padding: '16px', gap: '12px', rows: 1 })
    await config.getByRole('checkbox', { name: '紧凑', exact: true }).click()
    expect(await layout()).toEqual({ padding: '8px', gap: '6px', rows: 1 })
    await config.getByRole('checkbox', { name: '行内', exact: true }).click()
    expect((await layout()).padding).toBe('0px')
    await config.getByRole('checkbox', { name: '紧凑', exact: true }).click()
    expect((await layout()).gap).toBe('12px')
    await config.getByRole('checkbox', { name: '换行', exact: true }).click()
    expect((await layout()).rows).toBeGreaterThan(1)
    expect(
      await preview.evaluate(
        element => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(1)
    await config.getByRole('checkbox', { name: '分隔线', exact: true }).click()
    await expect(bar.locator('.action-divider')).toHaveCount(5)
    await config.locator('.action-bar-config__size').click()
    await page.getByText('小型', { exact: true }).click()
    expect(
      await buttons.evaluateAll(elements =>
        elements.map(button => ({
          small: button.classList.contains('n-button--small-type'),
          height: button.getBoundingClientRect().height,
        }))
      )
    ).toEqual(Array.from({ length: 6 }, () => ({ small: true, height: 28 })))
    await config.getByRole('checkbox', { name: '分隔线', exact: true }).click()
    await config.getByRole('checkbox', { name: '换行', exact: true }).click()
    expect((await layout()).rows).toBe(1)
  })
}

test('树表客户名称与父节点一致，文本居中且 CSV 和其他工具按钮等高', async ({
  page,
}) => {
  await page.goto('/#/demo/table-manage/mach-table')
  await page.getByText('树形表格', { exact: true }).click()
  const row = (id: string) =>
    page
      .locator(`.mach-row[data-id="${id}"]`)
      .filter({ has: page.locator('[data-col-id="customer"]') })
  const customer = row('tree:华东:星海科技')
  await expect(customer).toBeVisible()
  await expect(row('tree:华东').locator('[data-col-id="customer"]')).toHaveText(
    '—'
  )
  await expect(customer.locator('[data-col-id="customer"]')).toHaveText(
    '星海科技'
  )
  await expect(customer.locator('[data-col-id="product"]')).toHaveText('—')
  const leaves = page
    .locator('.mach-row[data-id^="tree:华东:星海科技:"]')
    .filter({ has: page.locator('[data-col-id="customer"]') })
  await expect(leaves).toHaveCount(3)
  expect(
    await leaves.locator('[data-col-id="customer"]').allTextContents()
  ).toEqual(['星海科技', '星海科技', '星海科技'])
  expect(
    (await leaves.locator('[data-col-id="product"]').allTextContents()).every(
      product => product !== '—'
    )
  ).toBe(true)
  const alignment = await customer
    .locator('[data-col-id="customer"], [data-col-id="product"]')
    .evaluateAll(cells => cells.map(cell => getComputedStyle(cell).justifyContent))
  expect(alignment).toEqual(['center', 'center'])
  const sizes = await page
    .locator(
      '.mach-demo-toolbar__actions button, .mach-scenario-bar .c-action-bar button'
    )
    .evaluateAll(buttons =>
      buttons.map(button => ({
        text: button.textContent?.trim(),
        height: button.getBoundingClientRect().height,
        font: getComputedStyle(button).fontSize,
        padding: getComputedStyle(button).padding,
      }))
    )
  expect(sizes.some(button => button.text === '导出 CSV')).toBe(true)
  expect(new Set(sizes.map(button => button.height))).toEqual(new Set([22]))
  expect(new Set(sizes.map(button => button.font)).size).toBe(1)
  expect(new Set(sizes.map(button => button.padding)).size).toBe(1)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 CSV', exact: true }).click()
  expect((await download).suggestedFilename()).toMatch(/\.csv$/)
})
