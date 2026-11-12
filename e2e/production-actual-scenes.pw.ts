/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\e2e\production-actual-scenes.pw.ts
 * @Description: 同屏 detail 对照小表与 list 成分核对表的真实组合回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 以可见业务标签定位输入，不依赖表单字段排列。 */
const actualInput = (root: Locator, label: string) =>
  root
    .locator('.n-form-item')
    .filter({
      has: root.page().locator('.n-form-item-label').filter({ hasText: label }),
    })
    .locator('input')

/** 等待官方产物的炉次工作区初始化完成。 */
const openActual = async (page: Page) => {
  await installMockAdminSession(page)
  await page.goto('/#/production-sales/production-actual')
  const root = page.getByTestId('production-actual')
  await expect(root).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  return root
}

/** 检查标题真正位于内容视口内，且中心点没有被真实头部、页脚或浮层遮挡。 */
const expectUncoveredHeading = async (heading: Locator) => {
  await expect
    .poll(() =>
      heading.evaluate(element => {
        const bounds = element.getBoundingClientRect()
        const content = element.closest('.content-with-header')
        if (!content || !bounds.width || !bounds.height) return false
        const viewport = content.getBoundingClientRect()
        return (
          bounds.top >= Math.max(0, viewport.top) &&
          bounds.bottom <= Math.min(window.innerHeight, viewport.bottom) &&
          element.contains(
            document.elementFromPoint(
              bounds.x + bounds.width / 2,
              bounds.y + bounds.height / 2
            )
          )
        )
      })
    )
    .toBe(true)
}

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} 同页小表只显示文字表头，宽表保留核对工具且窄屏自然堆叠`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      value => localStorage.setItem('theme-mode', value),
      mode
    )
    await page.setViewportSize({ width: 1720, height: 1200 })
    const root = await openActual(page)
    const comparisons = root.locator('.actual-comparisons')
    const cards = comparisons.locator('.actual-comparison-card')
    await expect(cards).toHaveCount(3)
    await Promise.all(
      (await cards.all()).map(async card => {
        await expect(
          card.locator('.mach-pane--center .mach-row[data-id]')
        ).toHaveCount(6)
        await expect(
          card.locator(
            '.mach-filter-btn,.mach-menu-btn,.mach-header-resize,.mach-cell-edit-trigger'
          )
        ).toHaveCount(0)
        await expect(card.locator('.mach-pagination')).toBeHidden()
        expect(
          await card.evaluate(element => {
            const grid = element.querySelector('.mach-root')!
            const last = element.querySelector(
              '.mach-pane--center .mach-row[data-index="5"]'
            )!
            return (
              grid.getBoundingClientRect().bottom -
              last.getBoundingClientRect().bottom
            )
          })
        ).toBeLessThanOrEqual(16)
      })
    )
    const wide = root.locator('.actual-chemistry-grid')
    await expect(wide.locator('.mach-filter-btn').first()).toBeVisible()
    await expect(wide.locator('.mach-menu-btn').first()).toBeVisible()
    await expect(wide.locator('.mach-header-resize').first()).toHaveCount(1)
    await expect(
      wide.getByRole('button', { name: '定位实测录入' }).first()
    ).toBeVisible()
    await comparisons.screenshot({
      path: info.outputPath(`actual-detail-tables-${mode}-wide.png`),
      animations: 'disabled',
    })
    await page.setViewportSize({ width: 430, height: 930 })
    await expect
      .poll(() =>
        root.evaluate(element => element.scrollWidth - element.clientWidth)
      )
      .toBeLessThanOrEqual(1)
    const tops = await cards.evaluateAll(elements =>
      elements.map(element => element.getBoundingClientRect().top)
    )
    expect(tops[1]).toBeGreaterThan(tops[0])
    expect(tops[2]).toBeGreaterThan(tops[1])
    // 三卡总高度超过内容视口，逐卡串行滚动并保留真实布局头尾验证。
    /* eslint-disable no-await-in-loop */
    for (const [index, card] of (await cards.all()).entries()) {
      await card.scrollIntoViewIfNeeded()
      await expectUncoveredHeading(card.getByRole('heading', { level: 4 }))
      await card.screenshot({
        path: info.outputPath(
          `actual-detail-table-${mode}-narrow-${index + 1}.png`
        ),
        animations: 'disabled',
      })
    }
    /* eslint-enable no-await-in-loop */

    const chemistryLink = root
      .getByRole('navigation', { name: '实绩分区导航' })
      .getByRole('button', { name: '成分与判定', exact: true })
    await chemistryLink.click()
    await expect(chemistryLink).toHaveAttribute('aria-current', 'location')
    // 此处直接验证导航结果，不额外滚动标题，避免掩盖产品滚动定位缺口。
    await expectUncoveredHeading(
      root
        .getByRole('region', { name: '成分与判定', exact: true })
        .getByRole('heading', { level: 2 })
    )
  })
}

test('只读小表同步零与缺测，上一炉参考只读取保存快照，切炉保留既有草稿保护', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1720, height: 1200 })
  const root = await openActual(page)
  const charge = root.locator('[data-comparison="charge"]')
  const received = charge.locator('.mach-row[data-id="received"]')
  const currentCell = received.locator('.mach-cell[data-col-id="current"]')
  const previousCell = received.locator('.mach-cell[data-col-id="previous"]')
  await expect(previousCell).toHaveText('—')
  const input = actualInput(root, '受钢量')
  await input.fill('0')
  await input.press('Tab')
  await expect(currentCell).toHaveText('0')
  await root.getByRole('button', { name: '保存实绩', exact: true }).click()
  await expect(root.getByText('已保存', { exact: true })).toBeVisible()
  await root.getByRole('button', { name: /L261029102/ }).click()
  await expect(previousCell).toHaveText('0')
  await expect(currentCell).toHaveText('122.8')
  await input.fill('')
  await input.press('Tab')
  await expect(currentCell).toHaveText('—')
  await currentCell.dblclick()
  await expect(charge.locator('.mach-editor-input')).toHaveCount(0)
  await expect(input).toHaveValue('')
  await root.getByRole('button', { name: '恢复记录', exact: true }).click()
  await expect(currentCell).toHaveText('122.8')
  await expect(previousCell).toHaveText('0')
  await input.fill('125')
  await input.press('Tab')
  await root.getByRole('button', { name: /L261029103/ }).click()
  await page.getByRole('button', { name: '保留当前炉次', exact: true }).click()
  await expect(root.locator('.actual-context h2')).toHaveText('L261029102')
  await expect(currentCell).toHaveText('125')
  await root.getByRole('button', { name: /L261029103/ }).click()
  await page.getByRole('button', { name: '放弃并切换', exact: true }).click()
  await expect(root.locator('.actual-context h2')).toHaveText('L261029103')
  await expect(previousCell).toHaveText('122.8')
  await expect(currentCell).toHaveText('122.8')
})
