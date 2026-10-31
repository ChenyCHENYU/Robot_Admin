/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-31
 * @FilePath: \Robot_Admin\e2e\runtime-density.pw.ts
 * @Description: 大字段表单的真实校验几何、滚动边界及输入帧耗时
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'

test('400 字段保留完整多行校验、固定页脚及按需更新', async ({ page }, info) => {
  await page.goto('/dense.html', { waitUntil: 'domcontentloaded' })
  const modal = page.locator('.c-form-modal')
  await expect(modal.locator('input')).toHaveCount(400)
  await expect
    .poll(() =>
      page.evaluate(
        () => performance.getEntriesByName('dense-form-mount').length
      )
    )
    .toBe(1)
  const initialMountToPaintMs = await page.evaluate(
    () => performance.getEntriesByName('dense-form-mount')[0].duration
  )
  expect(initialMountToPaintMs).toBeLessThan(3000)
  await expect(modal.locator('.grid-item').first()).toHaveCSS(
    'animation-name',
    'none'
  )
  await expect(modal.locator('.n-grid')).toHaveCSS('row-gap', '4px')
  await modal.getByRole('button', { name: '保存验证', exact: true }).click()
  const error = modal.locator('.n-form-item-feedback--error').first()
  await expect(error).toBeVisible()
  const geometry = await modal.evaluate(element => {
    const feedback = element.querySelector<HTMLElement>(
      '.n-form-item-feedback-wrapper'
    )!
    const first = element
      .querySelector<HTMLElement>('.grid-item')!
      .getBoundingClientRect()
    const next = [...element.querySelectorAll('.grid-item')]
      .map(item => item.getBoundingClientRect())
      .find(box => box.top > first.top + 1)!
    const footer = element
      .querySelector('.n-card__action')!
      .getBoundingClientRect()
    return {
      feedbackHeight: feedback.clientHeight,
      overflow: feedback.scrollHeight - feedback.clientHeight,
      feedbackBottom: feedback.getBoundingClientRect().bottom,
      nextTop: next.top,
      footerBottom: footer.bottom,
      viewportHeight: innerHeight,
    }
  })
  expect(geometry.feedbackHeight).toBeGreaterThan(32)
  expect(geometry.overflow).toBeLessThanOrEqual(1)
  expect(geometry.nextTop).toBeGreaterThanOrEqual(geometry.feedbackBottom)
  expect(geometry.footerBottom).toBeLessThanOrEqual(geometry.viewportHeight)
  const timings = await modal
    .locator('input')
    .nth(1)
    .evaluate(async element => {
      const input = element as HTMLInputElement
      input.focus()
      const samples: number[] = []
      /* eslint-disable no-await-in-loop -- 逐帧依次采样同一控件，不能并行制造额外更新压力。 */
      for (let i = 0; i < 12; i++) {
        const started = performance.now()
        input.value = `测量 ${i}`
        input.dispatchEvent(new Event('input', { bubbles: true }))
        await new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
        samples.push(performance.now() - started)
      }
      /* eslint-enable no-await-in-loop */
      return samples.sort((a, b) => a - b)
    })
  await expect(modal.locator('input').nth(1)).toBeFocused()
  const p95 = timings[Math.ceil(timings.length * 0.95) - 1]
  expect(p95).toBeLessThan(200)
  await info.attach('dense-form-metrics', {
    body: JSON.stringify({
      fields: 400,
      initialMountToPaintMs,
      p95InputFrameMs: p95,
      timings,
      geometry,
    }),
    contentType: 'application/json',
  })
  await modal.screenshot({ path: info.outputPath('dense-form-errors.png') })
})
