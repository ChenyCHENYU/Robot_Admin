/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-23
 * @FilePath: \Robot_Admin\e2e\component-hardening.pw.ts
 * @Description: 组件升级后的会话草稿、Excel 阅读与流程保存业务回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test, type Page } from '@playwright/test'
import type { WorkflowData } from '@robot-admin/naive-ui-components/C_WorkFlow'
import { readFile } from 'node:fs/promises'
import { installMockAdminSession } from './auth-fixture'

test.setTimeout(60_000)
test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
})

test('切换联系人保留各自草稿，发送只归属当前会话并清空当前输入', async ({
  page,
}) => {
  await page.goto('/#/plugins/chat')
  const chat = page.locator('.conversation-canvas')
  const input = chat.getByPlaceholder('输入消息，Enter 发送')
  const messages = chat.locator('.c-chat__messages')
  const uiContact = chat.getByRole('button', { name: /界面联调/ })
  const releaseContact = chat.getByRole('button', { name: /版本发布/ })
  await expect(input).toBeVisible()
  // 关闭演示回复，使断言只关注使用者实际发送的消息。
  await page.locator('.reply-toggle').getByRole('switch').click()
  await expect(
    page.locator('.reply-toggle').getByRole('switch')
  ).toHaveAttribute('aria-checked', 'false')

  await input.fill('界面联调：保留未发送的布局建议')
  await releaseContact.click()
  await expect(page.locator('.conversation-context h2')).toHaveText('版本发布')
  await expect(input).toHaveValue('')
  await input.fill('版本发布：等待回归后再发布')

  await uiContact.click()
  await expect(input).toHaveValue('界面联调：保留未发送的布局建议')
  await chat.getByRole('button', { name: '发送', exact: true }).click()
  await expect(input).toHaveValue('')
  await expect(
    messages.getByText('界面联调：保留未发送的布局建议', { exact: true })
  ).toHaveCount(1)

  await releaseContact.click()
  await expect(input).toHaveValue('版本发布：等待回归后再发布')
  await expect(messages).not.toContainText('界面联调：保留未发送的布局建议')
  await input.press('Enter')
  await expect(input).toHaveValue('')
  await expect(
    messages.getByText('版本发布：等待回归后再发布', { exact: true })
  ).toHaveCount(1)

  await uiContact.click()
  await expect(input).toHaveValue('')
  await expect(messages).not.toContainText('版本发布：等待回归后再发布')
  await expect(
    messages.getByText('界面联调：保留未发送的布局建议', { exact: true })
  ).toHaveCount(1)
})

test('Excel 预览保留文本编号和金额格式，切换工作表不会混入上一表内容', async ({
  page,
}) => {
  await page.goto('/#/plugins/file-preview')
  await page.getByLabel('选择预览文件').setInputFiles({
    name: '编号与金额核验.xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: await readFile(
      new URL('./fixtures/spreadsheets/settlement-review.xlsx', import.meta.url)
    ),
  })
  await expect(page.locator('.document-main .workspace-toolbar')).toContainText(
    '编号与金额核验.xlsx'
  )
  const preview = page.locator('.document-preview')
  const table = preview.locator('.excel-table')
  await expect(
    table.getByRole('cell', { name: '000042', exact: true })
  ).toBeVisible()
  await expect(
    table.getByRole('cell', { name: '12345678901234567890', exact: true })
  ).toBeVisible()
  await expect(
    table.getByRole('cell', { name: '1,234.50', exact: true })
  ).toBeVisible()
  await expect(
    table.getByRole('cell', { name: '12.5%', exact: true })
  ).toBeVisible()

  const reviewTab = preview
    .locator('.n-tabs-tab')
    .filter({ hasText: '复核记录' })
  const settlementTab = preview
    .locator('.n-tabs-tab')
    .filter({ hasText: '结算明细' })
  await expect(reviewTab).toHaveText('复核记录')
  await expect(settlementTab).toHaveText('结算明细')
  await reviewTab.click()
  await expect(
    table.getByRole('cell', { name: '跨表核对', exact: true })
  ).toBeVisible()
  await expect(table).not.toContainText('12345678901234567890')
  await expect(preview.locator('.excel-info')).toContainText(
    '当前工作表: 复核记录'
  )

  await settlementTab.click()
  await expect(
    table.getByRole('cell', { name: '000042', exact: true })
  ).toBeVisible()
  await expect(
    table.getByRole('cell', { name: '1,234.50', exact: true })
  ).toBeVisible()
  await expect(table).not.toContainText('跨表核对')
})

/** 从用户可下载的流程文件读取数据，不访问 Vue 实例或内部状态。 */
const exportWorkflow = async (page: Page): Promise<WorkflowData> => {
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出当前流程', exact: true }).click()
  const file = await downloaded
  expect(file.suggestedFilename()).toBe('leave-approval-workflow.json')
  const savedPath = await file.path()
  if (!savedPath) throw new Error('未获得流程导出文件')
  return JSON.parse(await readFile(savedPath, 'utf8')) as WorkflowData
}

/** 使用真实鼠标拖动节点标题，避免调用画布内部接口绕过事件链。 */
const dragApprovalNode = async (page: Page) => {
  const title = page
    .locator('.vue-flow__node')
    .filter({ hasText: '直属领导审批' })
    .locator('.node-title')
  await expect(title).toBeVisible()
  await title.scrollIntoViewIfNeeded()
  const bounds = await title.boundingBox()
  if (!bounds) throw new Error('审批节点不可拖动')
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 90, y - 45, { steps: 12 })
  await page.mouse.up()
}

test('拖动审批节点后导出与本机保存包含新坐标，刷新恢复且只读预览不可移动', async ({
  page,
}) => {
  await page.goto('/#/editor/work-flow-editor')
  await expect(page.locator('.vue-flow__node')).toHaveCount(2)
  const before = await exportWorkflow(page)
  const initialApproval = before.nodes.find(node => node.id === 'approval-1')!

  await dragApprovalNode(page)
  const moved = await exportWorkflow(page)
  const movedApproval = moved.nodes.find(node => node.id === 'approval-1')!
  expect(movedApproval.position.x).toBeGreaterThan(
    initialApproval.position.x + 5
  )
  expect(movedApproval.position.y).toBeLessThan(initialApproval.position.y - 5)
  expect(movedApproval.data).toEqual(initialApproval.data)
  expect(moved.edges).toEqual(before.edges)
  expect(moved.nodes.find(node => node.id === 'start-1')).toEqual(
    before.nodes.find(node => node.id === 'start-1')
  )

  await page.getByRole('button', { name: '保存到本机', exact: true }).click()
  await expect(
    page.getByText('所有场景草稿已保存到当前浏览器', { exact: true })
  ).toBeVisible()
  await page.reload()
  await expect(page.locator('.vue-flow__node')).toHaveCount(2)
  await expect(page.locator('.workspace-heading')).toContainText(
    '本机保存 已恢复'
  )
  const restored = await exportWorkflow(page)
  expect(restored).toEqual(moved)

  await page.getByText('只读预览', { exact: true }).click()
  await expect(page.getByLabel('节点名称')).toBeDisabled()
  await dragApprovalNode(page)
  const readonly = await exportWorkflow(page)
  expect(readonly).toEqual(restored)
})
