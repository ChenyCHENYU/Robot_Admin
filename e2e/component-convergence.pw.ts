/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\component-convergence.pw.ts
 * @Description: 密度、组件交互及嵌套多表工作台的正式产物回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 首屏遮罩离开后验证实际渲染的三表工作台。 */
async function openSplitWorkbench(page: Page) {
  await page.goto('/#/demo/split-pane')
  await expect(page.locator('.app-loading')).toBeHidden({ timeout: 15_000 })
  const workbench = page.getByTestId('split-workbench')
  await expect(workbench.locator('.c-table-wrapper')).toHaveCount(3)
  await expect(
    page.getByTestId('split-orders-panel').locator('tbody tr')
  ).toHaveCount(24)
  await expect(
    page.getByTestId('split-material-panel').locator('tbody tr')
  ).toHaveCount(18)
  await expect(
    page.getByTestId('split-delivery-panel').locator('tbody tr')
  ).toHaveCount(12)
  return workbench
}

/** 只取外层手柄，防止嵌套组件的 separator 参与同一拖动断言。 */
const outerSplitHandle = (workbench: Locator) =>
  workbench.locator(':scope > .c-split-pane > [role="separator"]')

/** 记录页面脚本异常和浏览器控制台错误，不放行 Vue/表格运行时错误。 */
const collectConvergenceErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

/** 检查真实主区滚动、表内末行和命中目标，避免只用尺寸断言掩盖裁切。 */
async function assertSplitDeliveryReachable(page: Page) {
  const main = page.locator('.app-content > .n-layout-scroll-container')
  const delivery = page.getByTestId('split-delivery-panel')
  await delivery.scrollIntoViewIfNeeded()
  await expect(
    delivery.getByRole('heading', { name: '发运记录', exact: true })
  ).toBeInViewport({ ratio: 1 })
  expect(await main.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  const lastCell = delivery.locator('tbody tr').last().locator('td').nth(1)
  await lastCell.scrollIntoViewIfNeeded()
  await expect(lastCell).toBeInViewport({ ratio: 1 })
  await expect(lastCell).toHaveText('发运批次 1-12')
  await lastCell.click()
  expect(
    await lastCell.evaluate(element => {
      const box = element.getBoundingClientRect()
      const target = document.elementFromPoint(
        box.x + box.width / 2,
        box.y + box.height / 2
      )
      return target !== null && element.contains(target)
    })
  ).toBe(true)
  expect(
    await delivery
      .locator('.n-scrollbar-container')
      .evaluateAll(items => items.some(item => item.scrollTop > 0))
  ).toBe(true)
  const mainBox = (await main.boundingBox())!
  const cellBox = (await lastCell.boundingBox())!
  expect(cellBox.y).toBeGreaterThanOrEqual(mainBox.y)
  expect(cellBox.y + cellBox.height).toBeLessThanOrEqual(
    mainBox.y + mainBox.height + 1
  )
}

test.describe('分割面板与三表工作台', () => {
  test.beforeEach(async ({ page }) => {
    await installMockAdminSession(page)
    await page.setViewportSize({ width: 1600, height: 1100 })
  })

  test('主表点击与键盘选择联动双明细，行滚动保留各自容器', async ({ page }) => {
    const errors = collectConvergenceErrors(page)
    await openSplitWorkbench(page)
    const orders = page.getByTestId('split-orders-panel')
    const materials = page.getByTestId('split-material-panel')
    const delivery = page.getByTestId('split-delivery-panel')
    await orders.locator('tbody tr').nth(1).click()
    await expect(materials).toContainText('SO-202610-002')
    await expect(materials).toContainText('精密部件 2-1')
    await expect(delivery).toContainText('发运批次 2-1')
    await orders.locator('tbody tr').nth(2).focus()
    await page.keyboard.press('Enter')
    await expect(materials).toContainText('SO-202610-003')
    await expect(delivery).toContainText('发运批次 3-1')

    const dimensions = await materials.evaluate(element => {
      const panel = element.getBoundingClientRect()
      const table = element
        .querySelector('.n-data-table')!
        .getBoundingClientRect()
      const scroller = [
        ...element.querySelectorAll<HTMLElement>('.n-scrollbar-container'),
      ].find(
        item =>
          item.clientHeight > 0 && item.scrollHeight > item.clientHeight + 20
      )!
      if (!scroller) throw new Error('物料表未建立独立的纵向滚动容器')
      scroller.scrollTop = scroller.scrollHeight
      return {
        panel: panel.height,
        table: table.height,
        scrolled: scroller.scrollTop,
      }
    })
    expect(dimensions.table).toBeGreaterThan(100)
    expect(dimensions.table).toBeLessThan(dimensions.panel)
    expect(dimensions.scrolled).toBeGreaterThan(20)
    expect(
      await orders
        .locator('.n-scrollbar-container')
        .evaluateAll(items => items.every(item => item.scrollTop === 0))
    ).toBe(true)
    expect(errors).toEqual([])
  })

  test('内外拖动隔离，真实像素下限与收起重显保留业务上下文', async ({
    page,
  }) => {
    const errors = collectConvergenceErrors(page)
    const workbench = await openSplitWorkbench(page)
    const orders = page.getByTestId('split-orders-panel')
    await orders.locator('tbody tr').nth(1).click()
    const outer = outerSplitHandle(workbench)
    const initialOrderWidth = (await orders.boundingBox())!.width
    const outerBox = (await outer.boundingBox())!
    await page.mouse.move(
      outerBox.x + outerBox.width / 2,
      outerBox.y + outerBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(outerBox.x + 125, outerBox.y + outerBox.height / 2, {
      steps: 5,
    })
    await page.mouse.up()
    await expect
      .poll(async () => (await orders.boundingBox())!.width)
      .toBeGreaterThan(initialOrderWidth + 80)

    const materials = page.getByTestId('split-material-panel')
    const initialHeight = (await materials.boundingBox())!.height
    const nested = workbench.getByRole('separator', {
      name: '订单物料明细',
      exact: true,
    })
    const nestedBox = (await nested.boundingBox())!
    const widthBeforeInnerDrag = (await orders.boundingBox())!.width
    await page.mouse.move(
      nestedBox.x + nestedBox.width / 2,
      nestedBox.y + nestedBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(nestedBox.x + nestedBox.width / 2, nestedBox.y + 65, {
      steps: 4,
    })
    await page.mouse.up()
    await expect
      .poll(async () => (await materials.boundingBox())!.height)
      .toBeGreaterThan(initialHeight + 40)
    expect(
      Math.abs((await orders.boundingBox())!.width - widthBeforeInnerDrag)
    ).toBeLessThan(1)

    await outer.focus()
    await page.keyboard.press('Home')
    await expect
      .poll(async () => (await orders.boundingBox())!.width)
      .toBeCloseTo(280, 0)
    await page
      .getByRole('button', { name: '订单区折叠 / 展开', exact: true })
      .click()
    await expect(orders).toHaveCount(0)
    await expect(workbench.locator('.c-table-wrapper')).toHaveCount(2)
    await expect(outer).toHaveAttribute('aria-valuenow', '0')
    const collapsedWidth = await workbench
      .locator(':scope > .c-split-pane > .split-panel--first')
      .evaluate(element => element.getBoundingClientRect().width)
    expect(collapsedWidth).toBe(0)
    await page
      .getByRole('button', { name: '订单区折叠 / 展开', exact: true })
      .click()
    await expect(workbench.locator('.c-table-wrapper')).toHaveCount(3)
    await expect(materials).toContainText('SO-202610-002')
    await expect(orders.locator('[aria-selected="true"]')).toContainText(
      'SO-202610-002'
    )
    expect(errors).toEqual([])
  })

  test('键盘与触摸取消恢复拖动状态，窄容器自动切换上下布局', async ({
    page,
  }) => {
    const errors = collectConvergenceErrors(page)
    const workbench = await openSplitWorkbench(page)
    const outer = outerSplitHandle(workbench)
    await outer.focus()
    await page.keyboard.press('Home')
    const minimum = Number(await outer.getAttribute('aria-valuenow'))
    await page.keyboard.press('Shift+ArrowRight')
    expect(
      Number(await outer.getAttribute('aria-valuenow')) - minimum
    ).toBeCloseTo(20, 3)
    const beforeIrrelevantKey = await outer.getAttribute('aria-valuenow')
    await page.keyboard.press('ArrowDown')
    await expect(outer).toHaveAttribute('aria-valuenow', beforeIrrelevantKey!)

    const styles = await page.evaluate(() => ({
      cursor: document.body.style.cursor,
      selection: document.body.style.userSelect,
    }))
    await outer.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      pointerId: 19,
      isPrimary: true,
      button: 0,
      clientX: 600,
      clientY: 400,
    })
    await expect(workbench.locator(':scope > .c-split-pane')).toHaveClass(
      /c-split-pane--dragging/
    )
    await page.evaluate(() =>
      document.dispatchEvent(
        new PointerEvent('pointercancel', {
          pointerId: 19,
          pointerType: 'touch',
          isPrimary: true,
        })
      )
    )
    await expect(workbench.locator(':scope > .c-split-pane')).not.toHaveClass(
      /c-split-pane--dragging/
    )
    expect(
      await page.evaluate(() => ({
        cursor: document.body.style.cursor,
        selection: document.body.style.userSelect,
      }))
    ).toEqual(styles)

    await page.setViewportSize({ width: 430, height: 1000 })
    await expect(workbench).toHaveClass(/split-workbench--stacked/)
    await expect(outer).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(workbench.locator('.c-table-wrapper')).toHaveCount(3)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true)
    await assertSplitDeliveryReachable(page)
    expect(errors).toEqual([])
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} 三表在宽屏和窄屏有完整高度链及主题截图`, async ({
      page,
    }, info) => {
      const errors = collectConvergenceErrors(page)
      await page.addInitScript(
        mode => localStorage.setItem('theme-mode', mode),
        theme
      )
      const workbench = await openSplitWorkbench(page)
      await expect(outerSplitHandle(workbench)).toHaveAttribute(
        'aria-orientation',
        'vertical'
      )
      await Promise.all(
        [
          'split-orders-panel',
          'split-material-panel',
          'split-delivery-panel',
        ].map(async id => {
          const panel = page.getByTestId(id)
          expect(
            (await panel.locator('.n-data-table').boundingBox())!.height
          ).toBeGreaterThan(100)
          await expect(panel.locator('.c-table-wrapper')).toHaveClass(
            /c-table-wrapper--compact/
          )
        })
      )
      await page
        .locator('.split-workbench-section')
        .screenshot({ path: info.outputPath(`split-workbench-${theme}.png`) })
      await page.setViewportSize({ width: 430, height: 1000 })
      await expect(workbench).toHaveClass(/split-workbench--stacked/)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1
        )
      ).toBe(true)
      await page
        .getByRole('heading', { name: '订单与双明细工作台', exact: true })
        .scrollIntoViewIfNeeded()
      // 受限 main 内的大元素截图会穿过 footer 后截取空白，窄屏保存实际可见的两个滚动位置。
      await page.screenshot({
        path: info.outputPath(`split-workbench-${theme}-narrow-top.png`),
      })
      await assertSplitDeliveryReachable(page)
      await page.screenshot({
        path: info.outputPath(`split-workbench-${theme}-narrow-bottom.png`),
      })
      expect(errors).toEqual([])
    })
  }
})
