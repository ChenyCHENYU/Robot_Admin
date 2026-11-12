/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\e2e\production-matrix.pw.ts
 * @Description: 检测矩阵的真实键盘流程、窄屏与打印/CSV/XLSX口径验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page, type Locator } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { useExcel } from '@robot-admin/file-utils/excel'
import { installMockAdminSession } from './auth-fixture'

/** 使用真实产销路由，不借助页面内部 API 或测试入口替代用户交互。 */
async function openMatrix(page: Page) {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1640, height: 1060 })
  await page.goto('/#/production-sales/production-matrix')
  const root = page.getByTestId('production-matrix')
  await expect(root).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  await expect(root.locator('.matrix-reading').first()).toBeVisible()
  return root
}

/** 真正命中合并格中心，防止文本仍在 DOM 中却被后续行背景遮住。 */
async function expectVisibleTankAnchors(root: Locator) {
  const anchors = root.locator(
    '.matrix-grid .mach-cell[data-col-id="tank"][aria-rowspan="3"]'
  )
  await expect(anchors.first()).toHaveText('1# 酸洗槽')
  const snapshots = await anchors.evaluateAll(elements =>
    elements.flatMap(cell => {
      const rect = cell.getBoundingClientRect()
      if (rect.height <= 0) return []
      const viewport = cell
        .closest('.mach-body-viewport')!
        .getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      if (y < viewport.top || y > viewport.bottom) return []
      // 页面内容区也会裁剪表格；只检查实际可见的中心点，不能只看表内视口。
      let top = 0
      let bottom = window.innerHeight
      for (
        let parent = cell.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        if (!/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowY))
          continue
        const bounds = parent.getBoundingClientRect()
        top = Math.max(top, bounds.top)
        bottom = Math.min(bottom, bounds.bottom)
      }
      if (y < top || y > bottom) return []
      const hit = document.elementFromPoint(x, y)
      return [
        {
          text: cell.textContent,
          height: rect.height,
          hitOwnCell: hit === cell || (hit !== null && cell.contains(hit)),
          hitClass: hit?.className,
          hitRow: hit?.closest('.mach-row')?.getAttribute('data-index'),
        },
      ]
    })
  )
  expect(snapshots.length).toBeGreaterThan(0)
  for (const snapshot of snapshots) {
    expect(snapshot.height).toBeGreaterThan(150)
    expect(snapshot.hitOwnCell, JSON.stringify(snapshot)).toBe(true)
  }
}

test('复合格键盘/取消/粘贴/撤销与28天矩阵窄屏保持可用', async ({
  page,
}, testInfo) => {
  const root = await openMatrix(page)
  await expectVisibleTankAnchors(root)
  const first = root.locator(
    '.mach-pane--center .mach-row[data-index="0"] .mach-cell[data-col-id="2026-11-06_0"]'
  )
  const old = {
    value: await first.locator('strong').innerText(),
    time: await first.locator('small').innerText(),
  }
  await first.dblclick()
  const value = root.getByTestId('matrix-value-input')
  const time = root.getByTestId('matrix-time-input')
  await expect(value).toBeFocused()
  await value.fill('0')
  await value.press('Tab')
  await expect(time).toBeFocused()
  await time.fill('00:00')
  await time.press('Shift+Tab')
  await expect(value).toBeFocused()
  await value.press('Escape')
  await expect(first.locator('strong')).toHaveText(old.value)
  await expect(first.locator('small')).toHaveText(old.time)
  await first.dblclick()
  await value.fill('12.50')
  await time.fill('')
  await time.press('Tab')
  await expect(value).toBeVisible()
  await expect(first).toHaveClass(/mach-cell--editing/)
  await time.fill('08:45')
  await time.press('Tab')
  await expect(first).toContainText('12.50')
  await expect(root.locator('.mach-cell--editing')).toHaveAttribute(
    'data-col-id',
    '2026-11-06_1'
  )
  await page.keyboard.press('Escape')
  await root.getByRole('button', { name: '撤销', exact: true }).click()
  await expect(first.locator('strong')).toHaveText(old.value)
  await expect(first.locator('small')).toHaveText(old.time)
  await root.getByRole('button', { name: '重做', exact: true }).click()
  await expect(first).toContainText('08:45')
  await first.click()
  await root.locator('.mach-root').evaluate(element => {
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '0.00 @ 00:00\t12.50 @ 16:30' },
    })
    element.dispatchEvent(event)
  })
  await expect(first).toContainText('0.00')
  await expect(first).toContainText('00:00')
  await root.getByRole('button', { name: '撤销', exact: true }).click()
  await expect(first).toContainText('12.50')
  await expect(first).toContainText('08:45')
  await root.locator('.matrix-period').click()
  await page.getByText('完整 28 天', { exact: true }).click()
  const viewport = root.locator('.matrix-grid .mach-body-viewport--scroll')
  await viewport.evaluate(element => {
    element.scrollLeft = element.scrollWidth
    element.dispatchEvent(new Event('scroll'))
  })
  await expect(
    root.locator('.matrix-grid .mach-cell[data-col-id="2026-12-03_2"]').first()
  ).toBeVisible()
  expect(
    await root.locator('.matrix-grid .matrix-reading').count()
  ).toBeLessThan(400)
  await page.screenshot({
    path: testInfo.outputPath('matrix-desktop.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 760, height: 900 })
  expect(
    await root
      .locator('.matrix-grid')
      .evaluate(element => element.getBoundingClientRect().height)
  ).toBeGreaterThan(300)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('matrix-narrow.png'),
    fullPage: true,
  })
})

test('真实CSV/XLSX文件与完整打印报告保留同一检测值、时间及空记录', async ({
  page,
}) => {
  const root = await openMatrix(page)
  await root.getByRole('button', { name: '检测报表', exact: true }).click()
  const modal = page.locator('.matrix-report-modal:visible')
  await expect(modal).toContainText('252 条记录')
  const csvDownload = page.waitForEvent('download')
  await modal.getByRole('button', { name: '导出 CSV', exact: true }).click()
  const csv = await readFile((await (await csvDownload).path())!, 'utf8')
  expect(csv.replace(/^\uFEFF/, '').split('\r\n')).toHaveLength(253)
  expect(csv).toContain('"检测值","取样时间"')
  expect(csv).toContain('"0","08:15"')
  const xlsxDownload = page.waitForEvent('download')
  await modal.getByRole('button', { name: '导出 Excel', exact: true }).click()
  const bytes = await readFile((await (await xlsxDownload).path())!)
  expect(Array.from(bytes.subarray(0, 2))).toEqual([80, 75])
  const excel = useExcel()
  const workbook = await excel.readFile(new Blob([new Uint8Array(bytes)]))
  const records = workbook[excel.sheets.value[0]]
  expect(records).toHaveLength(252)
  expect(records[21].检测值).toBe(0)
  expect(records[21].取样时间).toBe('08:15')
  expect(
    records.some(
      record =>
        record.检测值 === '' &&
        record.取样时间 === '' &&
        record.判定 === '未取样'
    )
  ).toBe(true)
  await page.evaluate(() => {
    const open = window.open.bind(window)
    window.open = (...args) => {
      const popup = open(...args)
      if (popup) popup.print = () => undefined
      return popup
    }
  })
  const printed = page.waitForEvent('popup')
  await modal.getByRole('button', { name: '打印', exact: true }).click()
  const popup = await printed
  await expect(popup.locator('tbody tr')).toHaveCount(records.length)
  await expect(popup.locator('tbody tr').nth(21)).toContainText('08:15')
  expect(
    await popup.locator('tbody tr').nth(21).locator('td').nth(7).innerText()
  ).toBe('0')
  await popup.close()
})
