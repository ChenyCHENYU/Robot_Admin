/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 页面工作台、结构图、分页留白和图片输出的真实交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1200 })
})

test('关于页两组分页器保留底部留白，搜索后仍能稳定分页', async ({ page }) => {
  await page.goto('/#/about')
  await expect(page.locator('.about-dependencies')).toHaveCount(2)
  const gaps = await page.locator('.about-dependencies').evaluateAll(sections =>
    sections.map(section => {
      const bounds = section.getBoundingClientRect()
      const footer = section
        .querySelector('.n-pagination')!
        .getBoundingClientRect()
      return {
        bottom: bounds.bottom - footer.bottom,
        right: bounds.right - footer.right,
      }
    })
  )
  gaps.forEach(gap => {
    expect(gap.bottom).toBeGreaterThanOrEqual(24)
    expect(gap.right).toBeGreaterThanOrEqual(12)
  })
})

test('结构图统计来自真实清单，节点可切换且明细不产生横向溢出', async ({
  page,
}) => {
  const report = await (await page.request.get('/project-metrics.json')).json()
  await page.goto('/#/dashboard/analysis')
  const maps = page.locator('.structure-map')
  await expect(maps).toHaveCount(2)
  const total = report.inventory.routes.reduce(
    (sum: number, item: { count: number }) => sum + item.count,
    0
  )
  await expect(
    maps.first().locator('.structure-map__root > strong')
  ).toHaveText(String(total))
  const counts = await maps
    .first()
    .locator('.structure-map__node > strong')
    .allTextContents()
  expect(counts.reduce((sum, value) => sum + Number(value), 0)).toBe(total)
  const dependency = maps.last()
  await dependency.getByRole('button', { name: /开发与工程/ }).click()
  await expect(
    dependency.locator('.structure-map__detail > header > strong')
  ).toHaveText('开发与工程')
  await expect(dependency.locator('.structure-map__list')).toContainText(
    'typescript'
  )
  await maps
    .first()
    .getByRole('button', { name: /业务与账户/ })
    .click()
  await expect(maps.first().locator('.structure-map__list')).toContainText(
    '系统管理'
  )
  expect(
    await maps.evaluateAll(items =>
      items.map(item => item.scrollWidth - item.clientWidth)
    )
  ).toEqual([0, 0])
})

test('日程创建、冲突提示和刷新持久化生效，过滤后导出仍包含全部日程', async ({
  page,
}) => {
  await page.goto('/#/plugins/calendar')
  await expect(
    page.locator('.calendar-summary > div').last().locator('strong')
  ).toHaveText('9')
  await page.getByRole('button', { name: '新建日程', exact: true }).click()
  const editor = page.locator('.calendar-editor')
  await expect(editor).toBeVisible()
  await editor.getByPlaceholder('例如：产品方案评审').fill('浏览器回归日程')
  await expect(editor.locator('.calendar-conflict')).toContainText(
    '产品迭代周会'
  )
  await editor.getByRole('button', { name: '保存日程', exact: true }).click()
  await expect(editor).toBeHidden()
  await expect(
    page.locator('.calendar-summary > div').last().locator('strong')
  ).toHaveText('10')
  await page.reload()
  await expect(
    page.locator('.calendar-summary > div').last().locator('strong')
  ).toHaveText('10')
  await page.getByLabel('搜索日程').fill('浏览器回归日程')
  await expect(page.locator('.fc-event')).toHaveCount(1)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出备份', exact: true }).click()
  const result = await download
  const data = JSON.parse(await readFile((await result.path())!, 'utf8'))
  expect(data.schemaVersion).toBe(1)
  expect(data.events).toHaveLength(10)
  await page.getByRole('checkbox', { name: '允许编辑', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '新建日程', exact: true })
  ).toBeDisabled()
  await page.locator('.calendar-agenda__event').click()
  await expect(page.locator('.calendar-editor')).toContainText('日程详情')
  await expect(
    page
      .locator('.calendar-editor')
      .getByRole('button', { name: '保存日程', exact: true })
  ).toHaveCount(0)
})

test('日历分类、周末和视图切换保持数据，拖动仅改变当前可见日程', async ({
  page,
}) => {
  await page.goto('/#/plugins/calendar')
  await page.getByRole('button', { name: /会议协作/ }).click()
  await expect(page.locator('.calendar-main__footer')).toContainText(
    '6 条可见日程'
  )
  await page.getByRole('button', { name: '周', exact: true }).click()
  await expect(page.locator('.fc-dayGridWeek-view')).toBeVisible()
  await page.getByRole('checkbox', { name: '显示周末', exact: true }).click()
  await expect(page.locator('.fc-daygrid-day')).toHaveCount(5)
  await page.getByRole('button', { name: '日程', exact: true }).click()
  await expect(page.locator('.fc-listWeek-view')).toBeVisible()
  await page.getByRole('button', { name: '月', exact: true }).click()
  await page.getByRole('checkbox', { name: '显示周末', exact: true }).click()
  const item = page.locator('.fc-event').filter({ hasText: '版本验收与发布' })
  await item.scrollIntoViewIfNeeded()
  const source = (await item.boundingBox())!
  const targetDay = await page.evaluate(() => {
    const day = new Date()
    day.setDate(day.getDate() + 2)
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
  })
  const target = page.locator(`.fc-daygrid-day[data-date="${targetDay}"]`)
  const box = (await target.boundingBox())!
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    source.x + source.width / 2 + 8,
    source.y + source.height / 2,
    { steps: 3 }
  )
  await page.waitForTimeout(200)
  await page.mouse.move(box.x + box.width / 2, box.y + 35, { steps: 12 })
  await page.mouse.up()
  await expect(target).toContainText('版本验收与发布')
  const backup = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('robot-admin:calendar-workspace:v2')!)
  )
  expect(backup.events).toHaveLength(9)
  expect(
    backup.events.filter(
      (event: { category: string }) => event.category === 'meeting'
    )
  ).toHaveLength(3)
})

test('裁剪框与手柄实际可见，头像输出比例、大小和下载格式正确', async ({
  page,
}) => {
  await page.goto('/#/demo/image-cropper')
  const generate = page.getByRole('button', {
    name: '生成裁剪结果',
    exact: true,
  })
  await expect(generate).toBeEnabled()
  await expect(page.locator('.crop-stage .cropper-crop-box')).toBeVisible()
  expect(
    (await page.locator('.crop-stage .cropper-crop-box').boundingBox())!.width
  ).toBeGreaterThan(100)
  await expect(page.locator('.crop-stage .crop-point')).toHaveCount(8)
  await page.getByRole('button', { name: /头像 1:1/ }).click()
  await generate.click()
  await expect(page.locator('.crop-result img')).toBeVisible()
  const output = await page
    .locator('.crop-result img')
    .evaluate((img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
    }))
  expect(output.width).toBe(output.height)
  expect(output.width).toBeGreaterThan(50)
  expect(output.width).toBeLessThanOrEqual(512)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载图片', exact: true }).click()
  expect((await download).suggestedFilename()).toMatch(/-crop\.png$/)
  await page.getByRole('button', { name: '左转', exact: true }).click()
  await expect(page.locator('.crop-result')).toContainText('需要重新生成')
  await expect(
    page.getByRole('button', { name: '下载图片', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: '品牌素材', exact: true }).click()
  await expect(generate).toBeEnabled()
  await page.getByRole('button', { name: '弹窗编辑', exact: true }).click()
  const modal = page.locator('.n-modal').filter({ hasText: '放大编辑图片' })
  await expect(modal.locator('.cropper-crop-box')).toBeVisible()
  await modal.getByRole('button', { name: '确认裁剪', exact: true }).click()
  await expect(modal).toBeHidden()
  await expect(page.locator('.crop-result')).toContainText('已生成')
  await expect(
    page.getByRole('button', { name: '下载图片', exact: true })
  ).toBeEnabled()
})

for (const theme of ['light', 'dark']) {
  for (const [route, selector] of [
    ['/plugins/calendar', '.calendar-workspace'],
    ['/demo/image-cropper', '.crop-workspace'],
    ['/dashboard/analysis', '.project-analysis'],
  ]) {
    test(`${theme} ${route} 窄屏布局保持可读且不横向溢出`, async ({ page }) => {
      await page.addInitScript(
        mode => localStorage.setItem('theme-mode', mode),
        theme
      )
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto('/#' + route)
      await expect(page.locator(selector)).toBeVisible()
      expect(
        await page
          .locator(selector)
          .evaluate(element => element.scrollWidth - element.clientWidth)
      ).toBeLessThanOrEqual(1)
      if (theme === 'dark')
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })
  }
}
