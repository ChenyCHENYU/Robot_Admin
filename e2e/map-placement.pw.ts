/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @FilePath: \Robot_Admin\e2e\map-placement.pw.ts
 * @Description: 地图点选坐标、名称确认、取消与缓存返回的真实浏览器验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { expectRenderedMap, placeMapMarker } from './map-assertions'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1700, height: 835 })
  await page.route('**/tile.openstreetmap.org/**', route =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e9eef2"/><path d="M0 80h256M60 0v256" stroke="white" stroke-width="12"/></svg>',
    })
  )
})

/** 根据可见瓦片的 XYZ 与点击像素独立计算经纬度，防止仍按中心偏移添加。 */
async function pickPoint(page: Page, fraction = { x: 0.62, y: 0.4 }) {
  const map = page.locator('.leaflet-container')
  await map.scrollIntoViewIfNeeded()
  await expect(map).not.toHaveClass(/leaflet-zoom-anim/)
  const bounds = (await map.boundingBox())!
  const offset = { x: bounds.width * fraction.x, y: bounds.height * fraction.y }
  const coordinate = await map.evaluate((node, position) => {
    const bounds = node.getBoundingClientRect()
    const x = bounds.left + position.x
    const y = bounds.top + position.y
    const tile = Array.from(
      node.querySelectorAll<HTMLImageElement>('.leaflet-tile-loaded')
    ).find(image => {
      const rect = image.getBoundingClientRect()
      return (
        x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom
      )
    })!
    const rect = tile.getBoundingClientRect()
    const [, zoom, tileX, tileY] = new URL(tile.src).pathname.match(
      /\/(\d+)\/(\d+)\/(\d+)\.png$/
    )!
    const scale = 2 ** Number(zoom)
    const lng =
      ((Number(tileX) + (x - rect.left) / rect.width) / scale) * 360 - 180
    const projectedY = (Number(tileY) + (y - rect.top) / rect.height) / scale
    const lat =
      (Math.atan(Math.sinh(Math.PI * (1 - 2 * projectedY))) * 180) / Math.PI
    return { lat, lng }
  }, offset)
  await map.click({ position: offset })
  await expect(page.locator('.map-marker-dialog')).toBeVisible()
  return coordinate
}

for (const width of [1700, 768]) {
  test(`${width}px 添加先选地图位置，确认名称后保存准确坐标`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    if (width === 768)
      await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
    await page.goto('/#/plugins/map')
    await expectRenderedMap(page)
    await page.getByRole('button', { name: '添加标记', exact: true }).click()
    await expect(
      page.locator('.map-marker-list .workspace-choice')
    ).toHaveCount(2)
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2)
    await expect(page.locator('.map-picking-hint')).toBeVisible()
    const coordinate = await pickPoint(page)
    const pickedLat = (await page.getByLabel('选中纬度').textContent())!
    const pickedLng = (await page.getByLabel('选中经度').textContent())!
    expect(Number(await page.getByLabel('选中纬度').textContent())).toBeCloseTo(
      coordinate.lat,
      4
    )
    expect(Number(await page.getByLabel('选中经度').textContent())).toBeCloseTo(
      coordinate.lng,
      4
    )
    await expect(
      page.locator('.leaflet-marker-icon[title="待确认位置"]')
    ).toHaveCount(1)
    await expect(
      page.locator('.map-marker-list .workspace-choice')
    ).toHaveCount(2)
    await page.getByLabel('标记名称').fill('   ')
    await expect(
      page.getByRole('button', { name: '确认添加', exact: true })
    ).toBeDisabled()
    await page.getByLabel('标记名称').fill('  客户拜访位置  ')
    await page
      .getByLabel('标记名称')
      .dispatchEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        isComposing: true,
      })
    await expect(page.locator('.map-marker-dialog')).toBeVisible()
      await expect(page.locator('.map-marker-dialog')).toHaveCSS('width', '420px')
    await page.screenshot({
      path: testInfo.outputPath('placement-confirm.png'),
      fullPage: true,
        animations: 'disabled',
    })
    await page.getByRole('button', { name: '确认添加', exact: true }).click()
    await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
    await expect(
      page.locator('.map-marker-list .workspace-choice')
    ).toHaveCount(3)
    await expect(page.locator('.map-detail h3')).toHaveText('客户拜访位置')
    await expect(page.locator('.map-detail')).toContainText(pickedLat)
    await expect(page.locator('.map-detail')).toContainText(pickedLng)
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3)
    await expect(
      page.locator('.leaflet-marker-icon[title="待确认位置"]')
    ).toHaveCount(0)
    await page
      .locator('.leaflet-container')
      .click({ position: { x: 150, y: 150 } })
    await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
  })
}

test('取消、Esc、重新选点和切换城市均不会保存临时标记', async ({ page }) => {
  await page.goto('/#/plugins/map')
  await expectRenderedMap(page)
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  await page.getByRole('button', { name: '取消选点', exact: true }).click()
  await expect(page.locator('.map-picking-hint')).toHaveCount(0)
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  const original = await pickPoint(page)
  await page.getByLabel('标记名称').fill('重选位置')
  await page.getByRole('button', { name: '重新选点', exact: true }).click()
  await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
  const replacement = await pickPoint(page, { x: 0.5, y: 0.6 })
  expect(replacement).not.toEqual(original)
  await expect(page.getByLabel('标记名称')).toHaveValue('重选位置')
  await page.getByRole('button', { name: '取消添加', exact: true }).click()
  await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2)
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  await pickPoint(page)
  await page.keyboard.press('Escape')
  await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
  await expect(page.locator('.map-picking-hint')).toHaveCount(0)
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  await page.getByRole('button', { name: /上海外滩.*2 个内置/ }).click()
  await expect(page.locator('.map-picking-hint')).toHaveCount(0)
  await expect(page.locator('.map-marker-list .workspace-choice')).toHaveCount(
    2
  )
})

test('缓存页面离开时清理草稿，返回后仍可重新选点且不重复添加', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'robot-admin:menu-cache:v1:jinheng-nanjing',
      JSON.stringify({ 'demo-map': true })
    )
  )
  await page.goto('/#/plugins/map')
  await expectRenderedMap(page)
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  await pickPoint(page)
  await page.evaluate(() => {
    location.hash = '#/plugins/video-player'
  })
  await expect(page.locator('.video-player-demo')).toBeVisible()
  await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
  await page.evaluate(() => {
    location.hash = '#/plugins/map'
  })
  await expectRenderedMap(page)
  await expect(page.locator('.map-picking-hint')).toHaveCount(0)
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2)
  await placeMapMarker(page)
  await expect(page.locator('.map-marker-list .workspace-choice')).toHaveCount(
    3
  )
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3)
})
