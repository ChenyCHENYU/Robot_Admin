/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @Description: 地图可见区域验收，防止瓦片已下载但画布高度为零
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, type Page } from '@playwright/test'

/** 按真实用户流程选点并确认，避免回归继续依赖旧的自动偏移添加。 */
export async function placeMapMarker(page: Page) {
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  const map = page.locator('.leaflet-container')
  await map.scrollIntoViewIfNeeded()
  await expect(map).not.toHaveClass(/leaflet-zoom-anim/)
  const bounds = (await map.boundingBox())!
  await map.click({
    position: { x: bounds.width * 0.62, y: bounds.height * 0.4 },
  })
  await page.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(page.locator('.map-marker-dialog')).toHaveCount(0)
}

/** 同时检查画布尺寸、可见瓦片、标记和缩放控件，不能仅判断资源加载成功。 */
export async function expectRenderedMap(page: Page) {
  const canvas = page.locator('.map-canvas')
  const map = canvas.locator('.leaflet-container')
  await expect(map).toHaveCount(1)
  await expect
    .poll(() =>
      map.evaluate(node => {
        const host = node.closest('.map-canvas')!.getBoundingClientRect()
        const rect = node.getBoundingClientRect()
        return (
          rect.height >= 400 &&
          Math.abs(rect.height - host.height) <= 1 &&
          Math.abs(rect.width - host.width) <= 1
        )
      })
    )
    .toBe(true)
  await expect(map.locator('.leaflet-control-zoom-in')).toBeVisible()
  await expect
    .poll(() =>
      map.evaluate(node => {
        const bounds = node.getBoundingClientRect()
        const intersects = (element: Element) => {
          const rect = element.getBoundingClientRect()
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.right > bounds.left &&
            rect.left < bounds.right &&
            rect.bottom > bounds.top &&
            rect.top < bounds.bottom
          )
        }
        return (
          Array.from(
            node.querySelectorAll<HTMLImageElement>('.leaflet-tile-loaded')
          ).some(tile => tile.naturalWidth > 0 && intersects(tile)) &&
          Array.from(node.querySelectorAll('.leaflet-marker-icon')).some(
            intersects
          )
        )
      })
    )
    .toBe(true)
}
