/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 计划、编辑、素材与生成器的实际操作验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { installMockAdminSession } from './auth-fixture'
test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
})
test('商品条码可生成和下载，无效值不会下载旧条码', async ({ page }) => {
  await page.goto('/#/plugins/barcode')
  await page.getByRole('button', { name: /商品条形码/ }).click()
  await expect(
    page.locator('.preview-barcode svg,.preview-barcode canvas')
  ).toBeVisible()
  await expect(page.getByPlaceholder('请输入条形码值')).toHaveValue(
    '6901234567892'
  )
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出图片', exact: true }).click()
  const file = await download
  expect(file.suggestedFilename()).toMatch(/^barcode-EAN13\.(svg|png)$/)
  expect((await readFile((await file.path())!)).length).toBeGreaterThan(100)
  await page.getByPlaceholder('请输入条形码值').fill('123')
  await expect(page.locator('.n-alert')).toContainText('13 位数字')
  await expect(
    page.getByRole('button', { name: '导出图片', exact: true })
  ).toBeDisabled()
  await expect(
    page.locator('.preview-barcode svg,.preview-barcode canvas')
  ).toHaveCount(0)
})
test('二维码只绘制当前结果，下载为真实 PNG，空内容不能导出', async ({
  page,
}) => {
  await page.goto('/#/plugins/qrcode')
  await expect(page.locator('.c-qrcode')).toHaveCount(1)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载图片', exact: true }).click()
  const file = await download
  const data = await readFile((await file.path())!)
  expect(data.subarray(1, 4).toString()).toBe('PNG')
  await page.getByPlaceholder('请输入二维码内容（文本或 URL）').fill('')
  await expect(
    page.getByRole('button', { name: '下载图片', exact: true })
  ).toBeDisabled()
})
test('单画布签名可保存快照、恢复并下载，修改会使输出过期', async ({ page }) => {
  await page.goto('/#/plugins/signature')
  const canvas = page.locator('.signature-canvas canvas')
  await expect(canvas).toHaveCount(1)
  await canvas.hover({ position: { x: 80, y: 140 } })
  const box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + 80, box.y + 140)
  await page.mouse.down()
  await page.mouse.move(box.x + 150, box.y + 80, { steps: 8 })
  await page.mouse.move(box.x + 220, box.y + 170, { steps: 8 })
  await page.mouse.up()
  await expect(
    page.getByRole('button', { name: '生成签名图片', exact: true })
  ).toBeEnabled()
  await page.getByRole('button', { name: '保存笔迹快照', exact: true }).click()
  await page.getByRole('button', { name: '生成签名图片', exact: true }).click()
  await expect(page.locator('.signature-result img')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载签名图片', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('signature.png')
  await page
    .getByRole('checkbox', { name: '添加演示水印', exact: true })
    .check()
  await expect(page.locator('.signature-output')).toContainText('需要重新生成')
  await expect(
    page.getByRole('button', { name: '下载签名图片', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: '清空画布', exact: true }).click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '清空画布', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: '生成签名图片', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: '恢复快照', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '生成签名图片', exact: true })
  ).toBeEnabled()
})
test('甘特任务搜索、时间尺度和原生表格选择生效', async ({ page }) => {
  await page.goto('/#/plugins/v-table-gantt')
  await expect(page.locator('.gantt-stage canvas').last()).toBeVisible()
  const canvas = page.locator('.gantt-stage canvas').last()
  await expect(page.locator('.gantt-stage canvas')).toHaveCount(2)
  await canvas.click({ position: { x: 130, y: 60 } })
  await expect(page.locator('.gantt-inspector')).toContainText('软件开发项目')
  await canvas.dblclick({ position: { x: 130, y: 60 } })
  const cellEditor = page.locator(
    '.gantt-stage input[type="text"]:not([readonly])'
  )
  await expect(cellEditor).toHaveValue('软件开发项目')
  await cellEditor.fill('浏览器验收计划')
  await cellEditor.press('Enter')
  await expect(page.locator('.gantt-inspector')).toContainText('浏览器验收计划')
  await page.getByLabel('搜索计划任务').fill('需求')
  await expect(page.locator('.gantt-task-list .workspace-choice')).toHaveCount(
    1
  )
  await page.locator('.gantt-task-list .workspace-choice').click()
  await expect(page.locator('.gantt-inspector')).toContainText('项目需求评审')
  await expect(
    page.getByRole('button', { name: '定位选中任务', exact: true })
  ).toBeEnabled()
  await page.getByRole('button', { name: '定位选中任务', exact: true }).click()
  await page.getByLabel('搜索计划任务').fill('不存在的任务')
  await expect(page.locator('.gantt-stage')).toContainText('没有匹配的任务')
})
test('素材库使用可解码的本地素材，分类、预览、下载和加载更多生效', async ({
  page,
}) => {
  await page.goto('/#/plugins/waterfall')
  await expect(page.getByText('信息层级', { exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('.gallery-content img')
        .evaluateAll(
          items =>
            items.length > 0 &&
            items.every(
              item =>
                (item as HTMLImageElement).complete &&
                (item as HTMLImageElement).naturalWidth > 0
            )
        )
    )
    .toBe(true)
  await page.getByRole('button', { name: '查看更多素材', exact: true }).click()
  await expect(page.locator('.gallery-footer')).toContainText('16 / 16')
  await expect
    .poll(() =>
      page.locator('.waterfall__item').evaluateAll(items => {
        const rectangles = items.map(item => item.getBoundingClientRect())
        return rectangles.every((a, index) =>
          rectangles
            .slice(index + 1)
            .every(
              b =>
                a.right <= b.left + 1 ||
                b.right <= a.left + 1 ||
                a.bottom <= b.top + 1 ||
                b.bottom <= a.top + 1
            )
        )
      })
    )
    .toBe(true)
  await page.getByRole('button', { name: '信息层级', exact: true }).click()
  const modal = page.locator('.n-modal')
  await expect(modal).toBeVisible()
  const download = page.waitForEvent('download')
  await modal
    .getByRole('button', { name: '下载 SVG 素材', exact: true })
    .click()
  expect((await download).suggestedFilename()).toBe('study-1.svg')
})
test('看板任务可创建，并通过明确菜单跨列移动', async ({ page }) => {
  await page.goto('/#/plugins/dragable')
  await page.getByRole('button', { name: '添加任务', exact: true }).click()
  await page.getByLabel('看板任务标题').fill('浏览器验收任务')
  await page.getByRole('button', { name: '添加到待办', exact: true }).click()
  const card = page.locator('.task-card').filter({ hasText: '浏览器验收任务' })
  await expect(card).toBeVisible()
  await card
    .getByRole('button', { name: '移动任务 浏览器验收任务', exact: true })
    .click()
  await page.getByText('IN PROGRESS', { exact: true }).last().click()
  await expect(page.locator('.kanban-column').nth(1)).toContainText(
    '浏览器验收任务'
  )
})
test('代码分区可编辑、切换文件保留草稿，下载与当前文本一致', async ({
  page,
}) => {
  await page.goto('/#/editor/code-editor')
  await page.getByLabel('代码文本').fill('const workspace = true\n')
  await expect(page.locator('.c-code-wrapper')).toContainText(
    'const workspace = true'
  )
  await page.getByRole('button', { name: /models.ts/ }).click()
  await page.getByRole('button', { name: /utils.js/ }).click()
  await expect(page.getByLabel('代码文本')).toHaveValue(
    'const workspace = true\n'
  )
  const separator = page.getByRole('separator')
  await separator.focus()
  const size = await separator.getAttribute('aria-valuenow')
  await separator.press('ArrowLeft')
  expect(await separator.getAttribute('aria-valuenow')).not.toBe(size)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载当前文件', exact: true }).click()
  expect(await readFile((await (await download).path())!, 'utf8')).toBe(
    'const workspace = true\n'
  )
})
test('Markdown 文档分别保留修改，实际保存、刷新恢复与导出一致', async ({
  page,
}) => {
  await page.goto('/#/editor/markdown-editor')
  const editor = page.locator('.cm-content[contenteditable=true]')
  await expect(editor).toBeVisible()
  await editor.click()
  await editor.press('ControlOrMeta+A')
  await page.keyboard.insertText('# 浏览器验收\n\n草稿内容。')
  await page.getByRole('button', { name: '保存到本机', exact: true }).click()
  await expect(page.locator('.workspace-footer')).toContainText('已保存')
  await page.getByRole('button', { name: /版本发布说明.md/ }).click()
  await page.getByRole('button', { name: /项目协作笔记.md/ }).click()
  await expect(editor).toContainText('浏览器验收')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 Markdown', exact: true }).click()
  const text = await readFile((await (await download).path())!, 'utf8')
  expect(text).toBe('# 浏览器验收\n\n草稿内容。')
  await page.reload()
  await expect(page.locator('.cm-content')).toContainText('浏览器验收')
})
for (const theme of ['light', 'dark'])
  for (const route of [
    '/plugins/barcode',
    '/plugins/qrcode',
    '/plugins/signature',
    '/plugins/v-table-gantt',
    '/plugins/waterfall',
    '/plugins/dragable',
    '/editor/code-editor',
    '/editor/markdown-editor',
    '/demo/date',
    '/demo/time',
    '/demo/city',
    '/demo/area-cascade',
    '/demo/progress',
    '/demo/steps',
    '/plugins/skeleton',
  ]) {
    test(`${theme} ${route} 绘制及窄屏布局正常`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(
        mode => localStorage.setItem('theme-mode', mode),
        theme
      )
      await page.setViewportSize({ width: 768, height: 1000 })
      await page.goto('/#' + route)
      await expect(page.locator('h1').last()).toBeVisible()
      await expect(page.locator('.app-loading')).toHaveCount(0)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth
        )
      ).toBeLessThanOrEqual(1)
      expect(errors).toEqual([])
    })
  }
