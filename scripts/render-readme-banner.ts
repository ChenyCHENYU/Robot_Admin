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

const source = new URL('../docs/assets/robot-admin-banner.svg', import.meta.url)
const output = fileURLToPath(
  new URL('../docs/assets/robot-admin-banner.png', import.meta.url)
)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 340 },
    deviceScaleFactor: 2,
  })
  // 让浏览器以 SVG 文档解析源文件，沿用 XML 校验与真实字体绘制。
  await page.goto(source.href)
  assert.equal(
    await page.locator('parsererror').count(),
    0,
    '封面 SVG 必须是有效 XML'
  )
  assert.equal(
    await page.locator('svg').first().getAttribute('xmlns'),
    'http://www.w3.org/2000/svg',
    '封面必须使用 SVG 命名空间'
  )
  await page.locator('svg').first().screenshot({
    path: output,
    omitBackground: true,
    animations: 'disabled',
  })
  console.info(`README 封面已导出：${output}（2400 × 680）`)
} finally {
  await browser.close()
}
