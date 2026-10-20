/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 地图、文件、上传、组织和流程的真实交互验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { installMockAdminSession } from './auth-fixture'
const ROOT = fileURLToPath(new URL('..', import.meta.url))
test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
})
test('地图只保留一个主视图，内置标记真实解码，城市和标记管理生效', async ({
  page,
}) => {
  await page.route(
    /(?:tile\.openstreetmap\.org|basemaps\.cartocdn\.com)\//,
    route =>
      route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e9eef2"/></svg>',
      })
  )
  await page.goto('/#/plugins/map')
  await expect(page.locator('.leaflet-container')).toHaveCount(1)
  const icons = page.locator('.leaflet-marker-icon')
  await expect(icons).toHaveCount(2)
  await expect
    .poll(() =>
      icons.evaluateAll(items =>
        items.every(item => (item as HTMLImageElement).naturalWidth === 28)
      )
    )
    .toBe(true)
  await page.getByRole('button', { name: /上海外滩.*2 个内置/ }).click()
  await expect(page.locator('.map-detail')).toContainText('外滩观景台')
  await page.getByRole('button', { name: '添加标记', exact: true }).click()
  await expect(icons).toHaveCount(3)
  await expect(page.locator('.map-detail')).toContainText('自定义标记 3')
  await page.getByRole('button', { name: '移除标记', exact: true }).click()
  await expect(icons).toHaveCount(2)
  await page.getByRole('button', { name: '适配全部标记', exact: true }).click()
})
test('地图底图失败可见且能重试，标记仍可操作', async ({ page }) => {
  await page.route(
    /(?:tile\.openstreetmap\.org|basemaps\.cartocdn\.com)\//,
    route => route.abort()
  )
  await page.goto('/#/plugins/map')
  await expect(page.locator('.map-alert')).toContainText('底图暂时无法连接')
  await expect(
    page.getByRole('button', { name: '添加标记', exact: true })
  ).toBeEnabled()
  await page.getByRole('button', { name: '重试加载', exact: true }).click()
  await expect(page.locator('.leaflet-container')).toHaveCount(1)
})
test('文件库默认直接阅读真实 Word，Excel 和 PDF 可切换，本地文件可加入和移出', async ({
  page,
}) => {
  await page.goto('/#/plugins/file-preview')
  await expect(page.locator('.document-preview')).toContainText(
    '把需求、设计与交付放在同一条清晰的协作路径中'
  )
  await expect(page.locator('.n-modal')).toHaveCount(0)
  await page.getByRole('button', { name: /迭代交付计划.xlsx/ }).click()
  await expect(page.locator('.document-preview')).toContainText('需求梳理')
  await page.getByRole('button', { name: /产品使用指南.pdf/ }).click()
  await expect(page.locator('.pdf-reader canvas')).toHaveAttribute(
    'width',
    /^[1-9]\d+$/
  )
  await page
    .getByLabel('选择预览文件')
    .setInputFiles(ROOT + '/public/demo-files/project-brief.docx')
  await expect(page.locator('.document-main .workspace-toolbar')).toContainText(
    'project-brief.docx'
  )
  await expect(page.locator('.document-preview')).toContainText(
    '把需求、设计与交付放在同一条清晰的协作路径中'
  )
  await page.getByRole('button', { name: '移出文件库', exact: true }).click()
  await expect(page.locator('.workspace-section').first()).toContainText('3 项')
})
test('文档链接加载失败显示重试，移除后仍能恢复到本地示例', async ({ page }) => {
  await page.goto('/#/plugins/file-preview')
  await page.getByRole('button', { name: '添加链接', exact: true }).click()
  await page.getByLabel('文档链接').fill('/demo-files/missing.docx')
  await page.getByRole('button', { name: '添加到文件库', exact: true }).click()
  await expect(page.locator('.document-preview')).toContainText('预览失败')
  await expect(
    page
      .locator('.document-preview')
      .getByRole('button', { name: '重试', exact: true })
  ).toBeEnabled()
  await page.getByRole('button', { name: '移出文件库', exact: true }).click()
  await expect(page.locator('.document-preview')).toContainText(
    '把需求、设计与交付放在同一条清晰的协作路径中'
  )
})
test('上传首次失败可重试，暂停继续和队列清理实际生效', async ({ page }) => {
  await page.goto('/#/plugins/upload')
  await expect(page.locator('.c-upload')).toHaveCount(1)
  await page
    .locator('.c-upload input[type=file]')
    .first()
    .setInputFiles({
      name: 'workspace.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('upload demo'),
    })
  await expect(page.locator('.upload-row')).toContainText('演示传输中')
  await page.getByRole('button', { name: '全部暂停', exact: true }).click()
  await expect(page.locator('.upload-row')).toContainText('已暂停')
  await page.getByRole('button', { name: '继续传输', exact: true }).click()
  await expect(page.locator('.upload-row')).toContainText('已完成（演示）', {
    timeout: 8000,
  })
  await page.getByRole('button', { name: '清理已完成', exact: true }).click()
  await expect(page.locator('.upload-row')).toHaveCount(0)
  await page
    .getByRole('checkbox', { name: '模拟首次失败', exact: true })
    .check()
  await page
    .locator('.c-upload input[type=file]')
    .first()
    .setInputFiles({
      name: 'retry.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('retry demo'),
    })
  await expect(page.locator('.upload-row')).toContainText('失败，可重试', {
    timeout: 8000,
  })
  await page
    .locator('.upload-row')
    .getByRole('button', { name: '重试', exact: true })
    .click()
  await expect(page.locator('.upload-row')).toContainText('已完成（演示）', {
    timeout: 8000,
  })
})
test('组织首次适配视野，搜索下钻、节点详情与返回全景一致', async ({ page }) => {
  await page.goto('/#/plugins/orgchart')
  await expect(page.locator('.org-person').first()).toBeVisible()
  await page.getByRole('button', { name: '适配视野', exact: true }).click()
  const bounds = await page.locator('.org-canvas').evaluate(canvas => {
    const outer = canvas.getBoundingClientRect()
    return Array.from(canvas.querySelectorAll('.org-person')).map(node => {
      const box = node.getBoundingClientRect()
      return (
        box.left >= outer.left - 1 &&
        box.right <= outer.right + 1 &&
        box.top >= outer.top - 1 &&
        box.bottom <= outer.bottom + 1
      )
    })
  })
  expect(bounds.every(Boolean)).toBe(true)
  await page.getByLabel('搜索组织成员').fill('赵工')
  await page
    .locator('.org-search-results')
    .getByRole('button', { name: /赵工/ })
    .click()
  await expect(page.locator('.org-detail')).toContainText('前端组')
  await expect(page.locator('.org-person')).toHaveCount(1)
  await page.getByRole('button', { name: '返回组织全景', exact: true }).click()
  await expect(page.locator('.org-person')).toHaveCount(8)
})
test('审批流节点属性、场景草稿和本机保存正确，只读模式不可修改', async ({
  page,
}) => {
  await page.goto('/#/editor/work-flow-editor')
  await expect(page.locator('.vue-flow__node')).toHaveCount(2)
  await page.getByLabel('节点名称').fill('测试发起节点')
  await expect(page.locator('.vue-flow__node').first()).toContainText(
    '测试发起节点'
  )
  await page.getByRole('button', { name: '保存到本机', exact: true }).click()
  await page.getByRole('button', { name: /采购申请.*多级审批/ }).click()
  await page.getByRole('button', { name: /请假审批.*简单审批/ }).click()
  await expect(page.getByLabel('节点名称')).toHaveValue('测试发起节点')
  await page.getByText('只读预览', { exact: true }).click()
  await expect(page.getByLabel('节点名称')).toBeDisabled()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出当前流程', exact: true }).click()
  const data = JSON.parse(
    await readFile((await (await download).path())!, 'utf8')
  )
  expect(data.nodes[0].data.title).toBe('测试发起节点')
  await page.reload()
  await expect(page.getByLabel('节点名称')).toHaveValue('测试发起节点')
})
test('图模型导出和场景切换准确，只读预览保留当前模型', async ({ page }) => {
  await page.goto('/#/editor/antv-x6-editor')
  await expect(page.locator('.x6-node')).toHaveCount(6)
  await page.getByRole('button', { name: /数据模型.*客户/ }).click()
  await expect(page.locator('.x6-node')).toHaveCount(3)
  await page.getByText('只读预览', { exact: true }).click()
  await expect(
    page.getByRole('button', { name: '编辑选中节点', exact: true })
  ).toBeDisabled()
  const download = page.waitForEvent('download')
  await page
    .getByRole('button', { name: '导出当前图数据', exact: true })
    .click()
  const data = JSON.parse(
    await readFile((await (await download).path())!, 'utf8')
  )
  expect(data.tables[0].name).toBe('客户')
  expect(data.nodes).toBeUndefined()
})
test('绩效入口显示独立内容，团队下钻和导出范围一致', async ({ page }) => {
  await page.goto('/#/large-screen/xxx-xxx')
  await expect(
    page.getByRole('heading', { name: '团队绩效看板', exact: true })
  ).toBeVisible()
  await expect(page.getByText('日成本管控室', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: /前端研发.*界面实现/ }).click()
  await expect(page.locator('.performance-detail tbody tr')).toHaveCount(1)
  await expect(page.locator('.performance-kpis')).toContainText('21 / 22')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出当前范围', exact: true }).click()
  const text = await readFile((await (await download).path())!, 'utf8')
  expect(text).toContain('前端研发')
  expect(text).not.toContain('产品与设计')
})
test('深色审批节点与绩效操作按钮保留可读对比度', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
  const contrast = async (foreground: string, background: string) => {
    const colors = await page.evaluate(
      ({ foreground, background }) => [
        getComputedStyle(document.querySelector(foreground)!).color,
        getComputedStyle(document.querySelector(background)!).backgroundColor,
      ],
      { foreground, background }
    )
    const luminance = (color: string) => {
      const [r, g, b] = color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(value => {
          const channel = Number(value) / 255
          return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const [a, b] = colors.map(luminance)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  }
  await page.goto('/#/editor/work-flow-editor')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.approval-node .node-title')).toBeVisible()
  expect(
    await contrast('.approval-node .node-title', '.approval-node .node-header')
  ).toBeGreaterThanOrEqual(4.5)
  await page.goto('/#/large-screen/xxx-xxx')
  await expect(
    page.getByRole('button', { name: '导出当前范围', exact: true })
  ).toBeVisible()
  expect(
    await contrast(
      '.performance-actions .n-button__content',
      '.performance-actions .n-button'
    )
  ).toBeGreaterThanOrEqual(4.5)
})

for (const theme of ['light', 'dark'])
  for (const route of [
    '/plugins/file-preview',
    '/plugins/upload',
    '/plugins/orgchart',
    '/plugins/map',
    '/editor/work-flow-editor',
    '/editor/antv-x6-editor',
    '/large-screen/xxx-xxx',
  ]) {
    test(`${theme} ${route} 窄屏无文档横向溢出`, async ({ page }) => {
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
    })
  }
