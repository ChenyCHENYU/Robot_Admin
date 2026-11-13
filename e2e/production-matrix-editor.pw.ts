/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \Robot_Admin\e2e\production-matrix-editor.pw.ts
 * @Description: 复合编辑器真实可读宽度、附属操作条回收与矮屏横向滚动验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 通过真实路由与公开页面操作验收，不绕过编辑器的提交/取消管道。 */
async function open(page: Page, preview = false) {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1640, height: 1060 })
  await page.goto(
    `/#/${preview ? 'preview/' : ''}production-sales/production-matrix`
  )
  const root = page.getByTestId('production-matrix')
  await expect(root).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  await expect(root.locator('.matrix-reading').first()).toBeVisible()
  return root
}

/** 输入保有完整数值和时间宽度；工具条既不覆盖输入，也不进入冻结区或原生滚动条。 */
async function expectReadableEditor(root: Locator) {
  const geometry = await root.locator('.mach-cell--editing').evaluate(cell => {
    const inputs = [...cell.querySelectorAll('input')]
    const controls = cell
      .closest('.mach-root')!
      .querySelector('.mach-cell-editor-controls')!
    const tools = controls.getBoundingClientRect()
    const viewport = cell.closest('.mach-body-viewport')!
    const clip = viewport.getBoundingClientRect()
    return {
      separate: controls.parentElement === cell.closest('.mach-root'),
      inputs: inputs.map(input => {
        const box = input.getBoundingClientRect()
        return {
          width: box.width,
          fits: input.scrollWidth <= input.clientWidth + 1,
          overlap:
            tools.left < box.right &&
            tools.right > box.left &&
            tools.top < box.bottom &&
            tools.bottom > box.top,
        }
      }),
      bounded:
        tools.left >= clip.left - 1 &&
        tools.right <= clip.left + viewport.clientWidth + 1 &&
        tools.top >= clip.top - 1 &&
        tools.bottom <= clip.top + viewport.clientHeight + 1,
    }
  })
  expect(geometry.separate).toBe(true)
  expect(geometry.bounded).toBe(true)
  expect(geometry.inputs).toHaveLength(2)
  for (const input of geometry.inputs) {
    expect(input.width).toBeGreaterThanOrEqual(80)
    expect(input.fits).toBe(true)
    expect(input.overlap).toBe(false)
  }
}

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} 复合编辑结果和完整时间可读，操作条不抢焦点且随滚动回收`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      value => localStorage.setItem('theme-mode', value),
      mode
    )
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const root = await open(page)
    const first = root.locator(
      '.mach-pane--center .mach-row[data-index="0"] .mach-cell[data-col-id="2026-11-06_0"]'
    )
    const original = await first.locator('strong').innerText()
    await first.dblclick()
    const value = root.getByTestId('matrix-value-input')
    const time = root.getByTestId('matrix-time-input')
    await value.fill('999999.99')
    await time.fill('23:59')
    await expectReadableEditor(root)
    await page.screenshot({
      path: info.outputPath(`matrix-editor-${mode}.png`),
      animations: 'disabled',
    })
    const controls = root.locator('.mach-cell-editor-controls')
    const cancel = controls.getByRole('button', {
      name: 'Cancel edit',
      exact: true,
    })
    const box = await cancel.boundingBox()
    if (!box) throw new Error('取消按钮不可见')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await expect(time).toBeFocused()
    await expect(first).toHaveClass(/mach-cell--editing/)
    await page.mouse.up()
    await expect(first.locator('strong')).toHaveText(original)
    await expect(controls).toHaveCount(0)
    await first.dblclick()
    await value.fill('110.25')
    await time.fill('08:30')
    await controls
      .getByRole('button', { name: 'Confirm edit', exact: true })
      .click()
    await expect(first.locator('strong')).toHaveText('110.25')
    await expect(first.locator('small')).toHaveText('08:30')
    await first.dblclick()
    await value.fill('111.25')
    await time.fill('09:30')
    const viewport = root.locator('.matrix-grid .mach-body-viewport--scroll')
    await viewport.evaluate(element => {
      element.scrollLeft = element.scrollWidth
    })
    await expect(controls).toHaveCount(0)
    await viewport.evaluate(element => {
      element.scrollLeft = 0
    })
    await expect(first.locator('strong')).toHaveText('111.25')
    await expect(first.locator('small')).toHaveText('09:30')
    expect(errors).toEqual([])
  })
}

for (const preview of [false, true]) {
  for (const viewportSize of [
    { width: 1640, height: 700 },
    { width: 760, height: 600 },
  ]) {
    test(`${preview ? 'preview' : 'admin'} ${viewportSize.width}×${viewportSize.height}可到达完整工具栏、底部横向滚动及说明`, async ({
      page,
    }, info) => {
      const root = await open(page, preview)
      await page.setViewportSize(viewportSize)
      const footer = root.locator('.matrix-help')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeInViewport()
      const viewport = root.locator('.matrix-grid .mach-body-viewport--scroll')
      expect(
        await viewport.evaluate(
          element =>
            element.getBoundingClientRect().bottom <=
            element.closest('.matrix-grid')!.getBoundingClientRect().bottom + 1
        )
      ).toBe(true)
      await expect
        .poll(() =>
          viewport.evaluate(
            element =>
              element.getBoundingClientRect().bottom <= window.innerHeight + 1
          )
        )
        .toBe(true)
      await viewport.evaluate(element => {
        element.scrollLeft = element.scrollWidth
      })
      expect(
        await viewport.evaluate(element => element.scrollLeft)
      ).toBeGreaterThan(0)
      await page.screenshot({
        path: info.outputPath(
          `matrix-layout-${preview ? 'preview' : 'admin'}-${viewportSize.width}.png`
        ),
        animations: 'disabled',
      })
      const toolbar = root.locator('.matrix-toolbar')
      await toolbar.scrollIntoViewIfNeeded()
      await expect(
        toolbar.getByRole('button', { name: '检测报表', exact: true })
      ).toBeInViewport()
    })
  }
}
