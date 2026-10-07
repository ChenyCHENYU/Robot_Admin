/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\e2e\demo-pages.pw.ts
 * @Description: 组件演示页真实构建烟雾回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const demos = [
  ['/demo/icon', '图标组件场景示例'],
  ['/demo/form-manage/form', '表单选择器组件场景示例'],
  ['/demo/form-manage/form-modal', '表单容器组件场景示例'],
  ['/demo/table-manage/table', '表格组件场景示例'],
  ['/plugins/calendar', '日历组件场景示例'],
  ['/demo/steps', '进度步骤条组件场景示例'],
  ['/editor/work-flow-editor', '工作流设计器场景示例'],
  ['/hooks/excel-all', 'Excel All - [useExcel] 场景示例'],
  ['/plugins/v-table-gantt', '甘特图组件场景示例'],
  ['/plugins/waterfall', '瀑布流场景示例'],
  ['/plugins/chat', '工程协作台'],
  ['/preview/progress', '进度条组件场景示例'],
  ['/preview/city', '城市选择器组件场景示例'],
  ['/preview/code', 'Code编辑器组件场景示例'],
  ['/preview/video-player', '视频播放器场景示例'],
  ['/preview/signature', '电子签名场景示例'],
  ['/preview/image-cropper', '图片裁剪场景示例'],
  ['/preview/cron', '让每一次执行，都有明确的计划。'],
  ['/preview/timeline', '每一次迭代，都有迹可循'],
] as const

for (const [route, title] of demos) {
  test(`${title} 可在正式产物中进入且无运行时异常`, async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    await installMockAdminSession(page)

    await page.goto(`/#${route}`)
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    })
    if (route === '/demo/table-manage/table') {
      await expect(
        page.getByText('张三1', { exact: true }).first()
      ).toBeVisible()
    }
    await expect(page.locator('.n-message--error')).toHaveCount(0)
    expect(pageErrors).toEqual([])
  })
}

test('模态框表单只在成功提交后关闭', async ({ page }) => {
  await installMockAdminSession(page)

  await page.goto('/#/demo/form-manage/form-modal')
  await page.getByRole('heading', { name: '模态框表单', exact: true }).click()
  const modal = page.locator('.n-modal').filter({ hasText: '用户信息管理' })
  await expect(modal).toBeVisible()
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal).toBeVisible()

  await modal.getByPlaceholder('请输入用户名').fill('tester123')
  await modal.getByPlaceholder('请输入邮箱').fill('tester@example.com')
  await modal
    .locator('.n-form-item')
    .filter({ hasText: '角色' })
    .locator('.n-select')
    .click()
  await page.getByText('普通用户', { exact: true }).last().click()
  await modal.getByPlaceholder('请输入手机号').fill('13800138000')
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal).not.toBeVisible()
})

for (const layout of [
  { name: '内联布局', action: '搜索' },
  { name: '网格布局', action: '提交表单' },
]) {
  test(`${layout.name}通过 C_Form 的提交入口派发事件`, async ({ page }) => {
    await installMockAdminSession(page)
    await page.goto('/#/demo/form-manage/form')
    await page
      .locator('.layout-buttons')
      .getByRole('button', {
        name: layout.name,
      })
      .click()
    await page.getByRole('button', { name: '填充测试' }).click()
    await page
      .locator('.form-section')
      .getByRole('button', { name: new RegExp(layout.action) })
      .click()
    await expect(
      page.getByText('已接收表单数据（演示，不会持久化）')
    ).toBeVisible()
  })
}

test('甘特图自定义渲染无需向 window 注入第三方模块', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await installMockAdminSession(page)

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
  await installMockAdminSession(page)
  await page.goto('/#/plugins/chat')
  await expect(page.locator('.c-chat__contact')).toHaveCount(3)
  await expect(page.locator('.c-chat__msg').first()).toBeVisible()
  const otherMessages = page.locator('.c-chat__msg.is-other')
  const firstCount = await otherMessages.count()
  await page.getByPlaceholder('输入消息，Enter 发送').fill('线程隔离回归消息')
  await page.locator('.c-chat__send-btn').click()

  const secondContact = page
    .locator('.c-chat__contact')
    .filter({ hasText: '版本发布' })
  await secondContact.click()
  await expect(secondContact).toHaveClass(/is-active/)
  const secondCount = await otherMessages.count()
  await page.waitForTimeout(1700)
  await expect(otherMessages).toHaveCount(secondCount)

  const firstContact = page
    .locator('.c-chat__contact')
    .filter({ hasText: '界面联调' })
  await firstContact.click()
  await expect(firstContact).toHaveClass(/is-active/)
  await expect(otherMessages).toHaveCount(firstCount + 1)
})
