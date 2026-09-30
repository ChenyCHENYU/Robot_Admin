/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\e2e\demo-pages.pw.ts
 * @Description: 组件演示页真实构建烟雾回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from '@playwright/test'

const demos = [
  ['/demo/icon', '图标组件场景示例'],
  ['/demo/form-manage/form', '表单选择器组件场景示例'],
  ['/demo/table-manage/table', '表格组件场景示例'],
  ['/plugins/calendar', '日历组件场景示例'],
  ['/demo/steps', '进度步骤条组件场景示例'],
  ['/editor/work-flow-editor', '工作流设计器场景示例'],
  ['/hooks/excel-all', 'Excel All - [useExcel] 场景示例'],
  ['/plugins/v-table-gantt', '甘特图组件场景示例'],
  ['/plugins/waterfall', '瀑布流场景示例'],
  ['/plugins/chat', '聊天组件场景示例'],
] as const

for (const [route, title] of demos) {
  test(`${title} 可在正式产物中进入且无运行时异常`, async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    await page.addInitScript(() => {
      localStorage.setItem('token', JSON.stringify('mock-access.e2e'))
      localStorage.setItem(
        'userInfo',
        JSON.stringify({ username: 'E2E', displayName: 'E2E' })
      )
    })

    await page.goto(`/#${route}`)
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
    if (route === '/demo/table-manage/table') {
      await expect(
        page.getByText('张三1', { exact: true }).first()
      ).toBeVisible()
    }
    await expect(page.locator('.n-message--error')).toHaveCount(0)
    expect(pageErrors).toEqual([])
  })
}

test('甘特图自定义渲染无需向 window 注入第三方模块', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('token', JSON.stringify('mock-access.e2e'))
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ username: 'E2E', displayName: 'E2E' })
    )
  })

  await page.goto('/#/plugins/v-table-gantt')
  await page.locator('.n-tabs-tab').filter({ hasText: '自定义渲染' }).click()
  await expect(
    page.getByRole('heading', { name: '自定义渲染甘特图' })
  ).toBeVisible()
  await expect(page.locator('.gantt-demo-page canvas').first()).toBeVisible()
  expect(
    await page.evaluate(() => Reflect.get(window, 'VTableGantt'))
  ).toBeUndefined()
  expect(pageErrors).toEqual([])
})

test('聊天自动回复留在发送时的联系人会话', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', JSON.stringify('mock-access.e2e'))
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ username: 'E2E', displayName: 'E2E' })
    )
  })
  await page.goto('/#/plugins/chat')
  await expect(page.locator('.c-chat__contact')).toHaveCount(5)
  await expect(page.locator('.c-chat__msg').first()).toBeVisible()
  const otherMessages = page.locator('.c-chat__msg.is-other')
  const firstCount = await otherMessages.count()
  await page.getByPlaceholder('输入消息...').fill('线程隔离回归消息')
  await page.locator('.c-chat__send-btn').click()

  const secondContact = page
    .locator('.c-chat__contact')
    .filter({ hasText: '张三' })
  await secondContact.click()
  await expect(secondContact).toHaveClass(/is-active/)
  const secondCount = await otherMessages.count()
  await page.waitForTimeout(1700)
  await expect(otherMessages).toHaveCount(secondCount)

  const firstContact = page
    .locator('.c-chat__contact')
    .filter({ hasText: '小助手 Bot' })
  await firstContact.click()
  await expect(firstContact).toHaveClass(/is-active/)
  await expect(otherMessages).toHaveCount(firstCount + 1)
})
