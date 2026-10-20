/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @Description: 文件真实内容、部署 CSP、底图容错、编辑器和十页明暗布局验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { useJSZip } from '@robot-admin/file-utils'
import { installMockAdminSession } from './auth-fixture'
import { readFileSync } from 'node:fs'
const vercel = JSON.parse(
  readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
)
const pages = [
  ['/dashboard/statistics', '.usage-statistics', 'statistics'],
  ['/plugins/file-preview', '.document-workspace', 'documents'],
  ['/plugins/map', '.map-workspace', 'map'],
  ['/plugins/video-player', '.video-player-demo', 'video'],
  ['/plugins/chat', '.conversation-workspace', 'chat'],
  ['/editor/work-flow-editor', '.workflow-workspace', 'workflow'],
  ['/editor/antv-x6-editor', '.diagram-workspace', 'diagram'],
  ['/hooks/export-zip', '.jszip-demo', 'zip'],
  ['/hooks/download-all', '.download-demo', 'download'],
  ['/hooks/excel-all', '.excel-demo', 'excel'],
] as const
/** 等待真正的页面内容，不能把上一路由未消失的加载状态当成渲染完成。 */
async function open(page: Page, route: string, root: string) {
  await page.goto('/#' + route)
  await expect(page.locator(root)).toBeVisible()
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
}
/** 使用真实发布 CSP，验证 PDF 不依赖 Blob iframe 或插件放行。 */
async function installCsp(page: Page) {
  const policy = vercel.headers[0].headers.find(
    item => item.key === 'Content-Security-Policy'
  )!.value
  await page.route('http://127.0.0.1:4192/', async route => {
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': policy },
    })
  })
}
test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
})
test('真实 CSP 下中文 PDF 有正文、翻页与缩放，损坏文件可重试', async ({
  page,
}) => {
  await installCsp(page)
  const violations: string[] = []
  page.on('console', item => {
    if (
      item.type() === 'error' &&
      /Content Security Policy|Refused to|blocked/i.test(item.text())
    )
      violations.push(item.text())
  })
  await open(page, '/plugins/file-preview', '.document-workspace')
  await page.getByRole('button', { name: /产品使用指南.pdf/ }).click()
  const reader = page.locator('.pdf-reader')
  await expect(reader).toHaveAttribute('aria-busy', 'false')
  const canvas = reader.locator('canvas')
  await expect(canvas).toHaveAttribute('width', /^[1-9]\d+$/)
  // 中文字库缺失时只剩蓝色装饰线；正文必须产生足量深色像素。
  expect(
    await canvas.evaluate((node: HTMLCanvasElement) => {
      const pixels = node
        .getContext('2d')!
        .getImageData(0, 0, node.width, node.height).data
      let ink = 0
      for (let i = 0; i < pixels.length; i += 4)
        if (
          pixels[i] < 150 &&
          pixels[i + 1] < 150 &&
          pixels[i + 2] < 150 &&
          pixels[i + 3] > 200
        )
          ink++
      return ink
    })
  ).toBeGreaterThan(2000)
  const originalWidth = await canvas.getAttribute('width')
  await page.getByRole('button', { name: '放大 PDF', exact: true }).click()
  await expect(canvas).not.toHaveAttribute('width', originalWidth!)
  await page.getByRole('button', { name: 'PDF 下一页', exact: true }).click()
  await expect(canvas).toHaveAttribute('aria-label', /第 2 页/)
  await expect(
    page.getByRole('button', { name: 'PDF 下一页', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: 'PDF 上一页', exact: true }).click()
  await expect(canvas).toHaveAttribute('aria-label', /第 1 页/)
  expect(violations).toEqual([])
  await page.getByLabel('选择预览文件').setInputFiles({
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('invalid pdf'),
  })
  await expect(reader.getByRole('alert')).toContainText('暂时无法读取')
  await expect(
    reader.getByRole('button', { name: '重新加载 PDF' })
  ).toBeEnabled()
})
test('默认街道底图可真实加载，标记与署名可见', async ({ page }) => {
  await open(page, '/plugins/map', '.map-workspace')
  await expect
    .poll(() => page.locator('.leaflet-tile-loaded').count(), {
      timeout: 25000,
    })
    .toBeGreaterThan(0)
  await expect(page.locator('.leaflet-control-attribution')).toContainText(
    'CARTO'
  )
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2)
})
test('首个底图失败自动切换备用源，标记不丢失', async ({ page }) => {
  await page.route('**/basemaps.cartocdn.com/**', route => route.abort())
  await page.route('**/tile.openstreetmap.org/**', route =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eef3f8"/></svg>',
    })
  )
  await open(page, '/plugins/map', '.map-workspace')
  await expect(page.locator('.map-workspace .workspace-toolbar')).toContainText(
    'OpenStreetMap'
  )
  await expect
    .poll(() => page.locator('.leaflet-tile-loaded').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.map-alert')).toHaveCount(0)
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3)
})
test('工作流头像离线显示，人员与审批方式修改同步画布', async ({ page }) => {
  await page.route('**/avatars.githubusercontent.com/**', route =>
    route.abort()
  )
  await open(page, '/editor/work-flow-editor', '.workflow-workspace')
  await page.getByLabel('选择流程节点').click()
  await page
    .locator('.n-base-select-option')
    .getByText('直属领导审批', { exact: true })
    .click()
  await expect(page.locator('.flow-people')).toContainText('赵六')
  expect(
    await page
      .locator('.flow-people img')
      .first()
      .evaluate((image: HTMLImageElement) => image.naturalWidth)
  ).toBe(64)
  await page.getByLabel('节点名称').fill('订单复核')
  await expect(page.locator('.approval-node')).toContainText('订单复核')
  await page.getByLabel('审批方式', { exact: true }).click()
  await page.getByText('会签 · 所有人同意', { exact: true }).click()
  await expect(page.locator('.approval-node')).toContainText('会签')
  await page.getByText('只读预览', { exact: true }).click()
  await expect(page.getByLabel('节点名称')).toBeDisabled()
})
test('图编辑 SVG 字号正确，三个场景各有真实关系', async ({ page }) => {
  await open(page, '/editor/antv-x6-editor', '.diagram-workspace')
  await expect(page.locator('.x6-node')).toHaveCount(6)
  expect(
    await page
      .locator('.x6-node text[font-size="12"]')
      .evaluateAll(nodes =>
        nodes.every(node => getComputedStyle(node).fontSize === '12px')
      )
  ).toBe(true)
  await page.getByRole('button', { name: /数据模型.*客户/ }).click()
  await expect(page.locator('.x6-node')).toHaveCount(3)
  await expect(page.locator('.x6-edge')).toHaveCount(2)
  await page.getByRole('button', { name: /类图.*订单与明细/ }).click()
  await expect(page.locator('.x6-node')).toHaveCount(3)
  await expect(page.locator('.x6-edge')).toHaveCount(2)
  await expect(page.locator('.x6-graph')).toContainText('OrderItem')
})
test('ZIP 清单与真实压缩包一致，报表生成 XLSX 而非 CSV', async ({ page }) => {
  await open(page, '/hooks/export-zip', '.jszip-demo')
  const codeDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出项目', exact: true }).click()
  const codeZip = await useJSZip()
    .createZip()
    .loadAsync(await readFile((await (await codeDownload).path())!))
  expect(codeZip.file('src/App.vue')).not.toBeNull()
  expect(codeZip.file('package.json')).not.toBeNull()
  expect(
    JSON.parse(await codeZip.file('package.json')!.async('string')).dependencies
      .vue
  ).toBeTruthy()
  await page.getByRole('button', { name: /数据报表.*表格/ }).click()
  await expect(page.locator('.file-output')).toContainText('.xlsx')
  const reportDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出报表', exact: true }).click()
  const reportZip = await useJSZip()
    .createZip()
    .loadAsync(await readFile((await (await reportDownload).path())!))
  const workbook = await reportZip
    .file('sales-report.xlsx')!
    .async('uint8array')
  expect(Array.from(workbook.slice(0, 2))).toEqual([80, 75])
  expect(
    JSON.parse(await reportZip.file('summary.json')!.async('string'))
      .totalRecords
  ).toBe(5)
})
test('下载 Excel 为真实工作簿，可重新导入并导出当前表', async ({ page }) => {
  await open(page, '/hooks/download-all', '.download-demo')
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载 Excel', exact: true }).click()
  const file = await downloading
  const path = (await file.path())!
  expect(Array.from((await readFile(path)).subarray(0, 2))).toEqual([80, 75])
  await open(page, '/hooks/excel-all', '.excel-demo')
  await page.locator('.upload-dragger input[type=file]').setInputFiles({
    name: '用户数据报表.xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: await readFile(path),
  })
  await expect(page.locator('.preview-table')).toContainText('张三')
  await expect(page.locator('.file-summary')).toContainText('5 行')
  await page.getByRole('button', { name: /导出工作簿.*单表/ }).click()
  const exported = page.waitForEvent('download')
  await page
    .getByRole('button', { name: '导出当前工作表', exact: true })
    .click()
  expect((await exported).suggestedFilename()).toMatch(/\.xlsx$/)
})
test('下载 PDF 为结构完整文档，可在文件工作台阅读', async ({ page }) => {
  await open(page, '/hooks/download-all', '.download-demo')
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载 PDF', exact: true }).click()
  const file = await downloading
  const buffer = await readFile((await file.path())!)
  expect(buffer.subarray(0, 8).toString()).toBe('%PDF-1.4')
  await open(page, '/plugins/file-preview', '.document-workspace')
  await page
    .getByLabel('选择预览文件')
    .setInputFiles({
      name: file.suggestedFilename(),
      mimeType: 'application/pdf',
      buffer,
    })
  await expect(page.locator('.pdf-reader')).toHaveAttribute(
    'aria-busy',
    'false'
  )
  await expect(page.locator('.pdf-reader canvas')).toHaveAttribute(
    'width',
    /^[1-9]\d+$/
  )
  await expect(page.locator('.pdf-reader__error')).toHaveCount(0)
})

for (const theme of ['light', 'dark'])
  for (const width of [1657, 768])
    for (const [route, root, name] of pages) {
      test(`${name} ${theme} ${width}px 布局与绘制`, async ({
        page,
      }, testInfo) => {
        await page.addInitScript(
          mode => localStorage.setItem('theme-mode', mode),
          theme
        )
        await page.setViewportSize({ width, height: 1100 })
        await page.route('**/basemaps.cartocdn.com/**', route =>
          route.fulfill({
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e9eef3"/></svg>',
          })
        )
        await open(page, route, root)
        if (name === 'diagram')
          await expect(page.locator('.x6-node')).toHaveCount(6)
        if (name === 'workflow')
          await expect(page.locator('.vue-flow__node')).toHaveCount(2)
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth
          )
        ).toBeLessThanOrEqual(1)
        const element = page.locator(root)
        expect(
          await element.evaluate(node => node.scrollWidth - node.clientWidth)
        ).toBeLessThanOrEqual(1)
        await page.screenshot({
          path: testInfo.outputPath(`${name}-${theme}-${width}.png`),
          animations: 'disabled',
        })
      })
    }
