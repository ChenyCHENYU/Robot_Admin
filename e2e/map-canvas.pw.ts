/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @Description: 地图画布尺寸、侧栏切换和缓存恢复的真实浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { expectRenderedMap } from './map-assertions'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.route(/tile\.openstreetmap\.org\//, route =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e9eef2"/><path d="M0 60h256M80 0v256" stroke="white" stroke-width="12"/></svg>',
    })
  )
})

for (const width of [1700, 768]) {
  test(`${width}px 画布有实际尺寸，标记弹窗与缩放可操作`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 835 })
    await page.goto('/#/plugins/map')
    await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
    await expect(page.locator('.leaflet-tile-loaded').first()).toBeAttached()
    await page.screenshot({
      path: testInfo.outputPath('map-before-check.png'),
      fullPage: true,
    })
    await expectRenderedMap(page)
    const marker = page.locator('.leaflet-marker-icon').first()
    await marker.click()
    await expect(page.locator('.leaflet-popup-content')).toContainText(
      '天安门广场'
    )
    await page.locator('.leaflet-popup-close-button').click()
    await page.locator('.leaflet-control-zoom-in').click()
    await expectRenderedMap(page)
  })
}

for (const keepAlive of [false, true]) {
  test(`${keepAlive ? '缓存' : '默认'}模式下侧栏折叠、视口缩放和切页返回后地图保持可见`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1700, height: 835 })
    await page.addInitScript(cached => {
      localStorage.setItem(
        'robot-admin:menu-cache:v1:jinheng-nanjing',
        JSON.stringify({ 'demo-map': cached })
      )
    }, keepAlive)
    await page.goto('/#/plugins/map')
    await expectRenderedMap(page)
    await page.getByRole('button', { name: '收起菜单', exact: true }).click()
    await expectRenderedMap(page)
    await page.getByRole('button', { name: '添加标记', exact: true }).click()
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3)
    await page.evaluate(() => {
      location.hash = '#/plugins/video-player'
    })
    await expect(page.locator('.video-player-demo')).toBeVisible()
    await page.setViewportSize({ width: 1100, height: 900 })
    await page.evaluate(() => {
      location.hash = '#/plugins/map'
    })
    await expectRenderedMap(page)
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(
      keepAlive ? 3 : 2
    )
    await page.getByRole('button', { name: '展开菜单', exact: true }).click()
    await page.setViewportSize({ width: 768, height: 1000 })
    await expectRenderedMap(page)
    await page.screenshot({
      path: testInfo.outputPath('map-restored.png'),
      fullPage: true,
    })
  })
}
