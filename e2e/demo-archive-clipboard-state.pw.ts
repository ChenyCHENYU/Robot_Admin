/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\e2e\demo-archive-clipboard-state.pw.ts
 * @Description: 模板归档、压缩复制、拖拽活动状态的真实产物回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { useJSZip } from '@robot-admin/file-utils/zip'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('模板的两种模式使用同一份预览与归档文件清单', async ({ page }) => {
  await page.goto('/#/hooks/export-zip')
  await page.getByRole('button', { name: /模板库.*组合常用代码模板/ }).click()
  const preview = page.locator('.file-output')
  const files = preview.locator('ul li')
  const checkArchive = async (expectedPaths: string[]) => {
    await expect(files).toHaveText(expectedPaths)
    await expect(preview.locator('h3')).toHaveText(
      'my-template-library_templates.zip'
    )
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出模板库/ }).click()
    const result = await download
    expect(result.suggestedFilename()).toBe('my-template-library_templates.zip')
    const zip = await useJSZip()
      .createZip()
      .loadAsync(await readFile((await result.path())!))
    expect(
      Object.values(zip.files)
        .filter(entry => !entry.dir)
        .map(entry => entry.name)
    ).toEqual(expectedPaths)
    expect(await zip.file('README.md')?.async('string')).toContain('- TS 工具')
  }
  await checkArchive([
    'Vue 组件/Component.vue',
    'Vue 组件/index.ts',
    'TS 工具/utils.ts',
    'README.md',
  ])
  await page.locator('.jszip-demo .n-select:visible').click()
  await page.getByText('合并模式', { exact: true }).click()
  await checkArchive(['Component.vue', 'index.ts', 'utils.ts', 'README.md'])
})

test('压缩复制保留有效 JSON，预设链接独立于自定义输入', async ({ page }) => {
  await page.addInitScript(() => {
    let copied = ''
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied = text
        },
        readText: async () => copied,
      },
    })
  })
  await page.goto('/#/hooks/copy-text')
  const json = page.getByPlaceholder('输入 JSON 数据')
  const lastCopy = page.locator('.last-copied-content')
  await json.fill('{"status": 0, "items": [1, 2]}')
  await page.getByRole('button', { name: '压缩复制', exact: true }).click()
  await expect(lastCopy).toHaveText('{"status":0,"items":[1,2]}')
  await json.fill('[1, 2]')
  await page.getByRole('button', { name: '压缩复制', exact: true }).click()
  await expect(lastCopy).toHaveText('[1,2]')
  await json.fill(' "true" ')
  await page.getByRole('button', { name: '压缩复制', exact: true }).click()
  await expect(lastCopy).toHaveText('"true"')
  await page.getByPlaceholder('输入网址（自动添加协议）').clear()
  const preset = page.locator('.url-item').first()
  const url = await preset.locator('.url-text').textContent()
  await preset.getByRole('button', { name: /复制链接/ }).click()
  await expect(lastCopy).toHaveText(/^https?:\/\//)
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    url
  )
})

test('离开再进入拖拽示例时恢复默认活动，其他页面实例不共享修改', async ({
  page,
}) => {
  await page.goto('/#/plugins/dragable')
  const group = page.getByText('更多排序场景', { exact: true })
  await group.click()
  const activities = page.locator('.activity-item')
  const initialCount = await activities.count()
  expect(initialCount).toBeGreaterThan(0)
  await page.getByRole('button', { name: /添加活动/ }).click()
  await expect(activities).toHaveCount(initialCount + 1)
  await page.goto('/#/demo/icon')
  await expect(group).toHaveCount(0)
  await page.goto('/#/plugins/dragable')
  await group.click()
  await expect(activities).toHaveCount(initialCount)
})
