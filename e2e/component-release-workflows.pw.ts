/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @Description: 验证新版组件在发布包与 RobotAdmin 路由中的组合交互
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { installMockAdminSession } from './auth-fixture'

test('工作流演示可在两次审批实例间切换', async ({ page }) => {
  await page.goto('/#/preview/workflow')
  await page.getByRole('button', { name: '查看审批实例' }).click()
  const dialog = page.locator('.c-approval-viewer')
  await expect(dialog).toContainText('已上传补充说明')
  await dialog.getByRole('combobox').selectOption('demo-leave-1')
  await expect(dialog).toContainText('准备补充交接说明')
  await expect(dialog).not.toContainText('已上传补充说明')
})

test('消息速览与批处理共用审批条目和查询', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/account/messages')
  await page.getByText('消息速览', { exact: true }).click()
  const inbox = page.locator('.c-notification-inbox')
  await expect(inbox).toBeVisible()
  await page.getByRole('button', { name: '待我审批', exact: true }).click()
  const item = inbox.getByRole('button', { name: /研发设备采购 · 部门审批/ })
  await expect(item).toBeVisible()
  await item.click()
  await page.getByRole('button', { name: '查看审批实例' }).click()
  const dialog = page.locator('.c-approval-viewer')
  await expect(dialog).toBeVisible()
  const history = dialog.getByRole('combobox')
  await expect(history.locator('option')).toHaveCount(2)
  await history.selectOption({ index: 1 })
  await expect(dialog).toContainText('补齐附件后重新提交')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  const detailDrawer = page.getByRole('dialog').filter({ hasText: '流程信息' })
  if (await detailDrawer.isVisible()) {
    await detailDrawer.getByRole('button', { name: 'close' }).click()
  }
  await page.getByText('批量处理', { exact: true }).click()
  await expect(inbox).toBeHidden()
  await expect(page.getByRole('heading', { name: '待我审批' })).toBeVisible()
})

test('Excel 向导按行报告问题且后台任务失败后可以下载', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/hooks/excel-all')
  await page.getByRole('button', { name: /导入向导与任务/ }).click()
  const sampleDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载向导样本' }).click()
  const sample = await sampleDownload
  const samplePath = await sample.path()
  if (!samplePath) throw new Error('未下载导入样本')
  const wizard = page.getByRole('region', { name: '导入物料' })
  await wizard.locator('input[type=file]').setInputFiles({
    name: sample.suggestedFilename(),
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: await readFile(samplePath),
  })
  await wizard.getByRole('button', { name: /预检/ }).click()
  await expect(wizard).toContainText('缺少物料编码')
  await expect(wizard).toContainText('编码与前面的记录重复')
  await wizard.getByRole('button', { name: /确认/ }).click()
  await expect(wizard).toContainText('已接受物料 000781')

  await page.getByText('模拟下一次导出失败', { exact: true }).click()
  await page.getByRole('button', { name: '创建演示导出任务' }).click()
  const panel = page.locator('.c-task-panel')
  await expect(panel).toContainText('演示生成失败')
  await panel.getByRole('button', { name: /重试/ }).click()
  await expect(panel).toContainText('工作簿已准备好')
  const exportDownload = page.waitForEvent('download')
  await panel.getByRole('button', { name: /下载/ }).click()
  expect((await exportDownload).suggestedFilename()).toMatch(/\.xlsx$/)
})

test('扫码和重复计划预览使用真实组件事件', async ({ page }) => {
  await page.goto('/#/preview/barcode')
  const scanner = page.locator('.c-scan-input input:not([type=file])')
  await scanner.fill('00073142')
  await scanner.press('Enter')
  await expect(page.getByTestId('barcode-scan-result')).toContainText(
    '00073142'
  )

  await page.goto('/#/preview/calendar')
  await page.getByRole('button', { name: '新建日程' }).click()
  await page.getByLabel('重复频率').selectOption('weekly')
  await expect(page.getByTestId('calendar-recurrence-rule')).toContainText(
    'FREQ=WEEKLY'
  )
})

test('公开预览可切换附件并提交图片标注', async ({ page }) => {
  await page.goto('/#/preview/file-preview')
  await page.getByRole('button', { name: '查看附件清单' }).click()
  const attachments = page.locator('.c-attachments')
  await attachments.getByRole('button', { name: /交付验收记录.docx/ }).click()
  await expect(attachments.locator('.c-attachments__preview')).toContainText(
    '交付验收'
  )

  await page.goto('/#/preview/image-cropper')
  await page.getByRole('button', { name: '标注原图' }).click()
  await page.getByRole('button', { name: '添加标注' }).click()
  await page.getByRole('button', { name: '保存标注' }).click()
  await expect(page.getByTestId('crop-annotation-result')).toBeVisible()
})

test('主页提供可用的引导入口，顶栏命令打开待审批过滤', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  const checklist = page.getByRole('region', { name: '组件上手' }).first()
  await expect(
    checklist.getByRole('button', { name: /完成一次订单查询/ })
  ).toContainText('待完成')
  await page.getByRole('link', { name: '打开搜索表单' }).click()
  const queryDemo = page.getByRole('region', { name: '多列客户选择与共享查询' })
  const picker = queryDemo.getByPlaceholder('选择客户（支持编号、名称搜索）')
  await picker.fill('0001')
  const options = page.locator('.n-popover').filter({ hasText: '客户编码' })
  await expect(options.getByText('云岭装备', { exact: true })).toBeVisible()
  await picker.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(picker).toHaveValue('0001 · 云岭装备')
  await queryDemo.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(queryDemo.getByTestId('tabbed-query-result')).toHaveText(
    '匹配 6 条 · 第 1 页'
  )
  await page.goBack()
  await expect(
    checklist.getByRole('button', { name: /完成一次订单查询/ })
  ).toContainText('已完成')
  await page.keyboard.press('Control+k')
  const search = page.locator('.robot-search-input')
  await search.fill('查看待我审批')
  await page.getByRole('option', { name: /查看待我审批/ }).click()
  await expect(page).toHaveURL(/\/account\/messages\?.*relationship=assignee/)
  await expect(page.getByRole('heading', { name: '待我审批' })).toBeVisible()
})
