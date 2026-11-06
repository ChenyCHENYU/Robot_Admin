/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-31
 * @FilePath: \Robot_Admin\e2e\runtime-density.pw.ts
 * @Description: 大字段表单的真实校验几何、滚动边界及输入帧耗时
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'

/** 记录输入事件到两次绘制帧的样本，以便比较普通字段与联动字段。 */
async function measureInputFrames(locator: Locator) {
  return locator.evaluate(async element => {
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
    const sorted = samples.sort((a, b) => a - b)
    return {
      timings: sorted,
      p95InputFrameMs: sorted[Math.ceil(sorted.length * 0.95) - 1],
    }
  })
}

test('400 字段保留完整多行校验、固定页脚及按需更新', async ({ page }, info) => {
  await page.goto('/dense.html', { waitUntil: 'domcontentloaded' })
  const modal = page.locator('.c-form-modal')
  await expect(modal).toHaveAccessibleName('400 字段密集录入')
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
  const firstRowGap = await modal.evaluate(element => {
    const header = element.querySelector('.n-card-header')!
    const first = element.querySelector('.n-form-item-blank')!
    return (
      first.getBoundingClientRect().top - header.getBoundingClientRect().bottom
    )
  })
  expect(firstRowGap).toBeGreaterThanOrEqual(8)
  expect(firstRowGap).toBeLessThanOrEqual(18)
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
      .querySelector('.c-form-modal__footer')!
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
  const input = modal.locator('input').nth(1)
  const metrics = await measureInputFrames(input)
  await expect(input).toBeFocused()
  expect(metrics.p95InputFrameMs).toBeLessThan(200)
  await info.attach('dense-form-metrics', {
    body: JSON.stringify({
      fields: 400,
      initialMountToPaintMs,
      ...metrics,
      geometry,
    }),
    contentType: 'application/json',
  })
  await modal.screenshot({ path: info.outputPath('dense-form-errors.png') })
})

test('400 字段联动保留衍生值、异步选项和动态规则', async ({ page }, info) => {
  await page.goto('/dense.html?linked', { waitUntil: 'domcontentloaded' })
  const modal = page.locator('.c-form-modal')
  const fields = modal.locator('.grid-item')
  await expect(fields).toHaveCount(400)
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
  const metrics = await measureInputFrames(fields.nth(1).locator('input'))
  expect(metrics.p95InputFrameMs).toBeLessThan(200)
  await expect(fields.nth(2).locator('input')).toHaveValue('派生：测量 11')
  await fields.nth(3).locator('.n-base-selection').click()
  const option = page
    .locator('.n-base-select-option:visible')
    .filter({ hasText: '派生：测量 11' })
  await expect(option).toBeVisible()
  await option.click()
  await expect(fields.nth(3)).toContainText('派生：测量 11')
  await modal.getByRole('button', { name: '保存验证', exact: true }).click()
  await expect(fields.nth(4)).toContainText('联动后必填')
  await info.attach('dense-form-linked-metrics', {
    body: JSON.stringify({ fields: 400, initialMountToPaintMs, ...metrics }),
    contentType: 'application/json',
  })
})
