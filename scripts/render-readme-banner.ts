/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-12
 * @FilePath: \Robot_Admin\scripts\render-readme-banner.ts
 * @Description: 将品牌封面 SVG 导出为 README 使用的高清本地 PNG
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const source = await Bun.file(
  new URL('../docs/assets/robot-admin-banner.svg', import.meta.url)
).text()
const output = fileURLToPath(
  new URL('../docs/assets/robot-admin-banner.png', import.meta.url)
)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 340 },
    deviceScaleFactor: 2,
  })
  const valid = await page.evaluate(
    svg =>
      !new DOMParser()
        .parseFromString(svg, 'image/svg+xml')
        .querySelector('parsererror'),
    source
  )
  assert.ok(valid, '封面 SVG 必须是有效 XML')
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block}</style>${source}`
  )
  await page.evaluate(() => document.fonts.ready)
  await page.locator('svg').first().screenshot({
    path: output,
    omitBackground: true,
    animations: 'disabled',
  })
  console.info(`README 封面已导出：${output}（2400 × 680）`)
} finally {
  await browser.close()
}
