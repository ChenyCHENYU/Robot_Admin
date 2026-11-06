/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-06
 * @FilePath: \Robot_Admin\e2e\runtime-picker.pw.ts
 * @Description: 选择器首次与再次打开的候选表呈现耗时
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'

test('独立选择器首次与再次打开均绘制候选表', async ({ page }, info) => {
  await page.goto('/picker.html', { waitUntil: 'domcontentloaded' })
  const trigger = page.locator('.c-data-picker__open')
  const dialog = page.getByRole('dialog')
  const customer = dialog.getByRole('cell', { name: '星海科技' })

  /** 从按钮的实际点击事件起计时，包含候选表的加载与首次呈现。 */
  async function openAndMeasure() {
    await trigger.evaluate(element =>
      element.addEventListener('click', () => performance.mark('picker-open'), {
        capture: true,
        once: true,
      })
    )
    await trigger.click()
    await expect(customer).toBeVisible()
    return page.evaluate(async () => {
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
      return performance.measure('picker-render', 'picker-open').duration
    })
  }

  const firstOpenMs = await openAndMeasure()
  await dialog.getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog).toBeHidden()
  const repeatOpenMs = await openAndMeasure()
  expect(firstOpenMs).toBeLessThan(3000)
  expect(repeatOpenMs).toBeLessThan(3000)
  await info.attach('picker-open-metrics', {
    body: JSON.stringify({ firstOpenMs, repeatOpenMs }),
    contentType: 'application/json',
  })
})
