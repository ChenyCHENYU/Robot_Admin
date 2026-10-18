/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\enterprise-workflow.pw.ts
 * @Description: 正式浏览器中的业务分类、审批办理、任务状态、旧缓存升级及视觉回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { notificationScopeKey } from '../src/api/notifications.contract'
import { createNotificationDemoDocument } from '../src/api/notifications.demo.seed'

const REVIEW_TITLE = '研发设备采购 · 部门审批'
const LEGACY_TASK_TITLE = '采购申请待你审批'
const INITIATED_TITLE = '我的出差申请 · 审批中'
const CC_TITLE = '预算调整 · 抄送给我'

/** 每个用例使用独立浏览器上下文，只注入真实登录协议对应的测试会话。 */
test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

/** 等待真实页面和领域数据就绪，初始状态不依赖硬编码延时。 */
const openInbox = async (page: Page, query = '') => {
  await page.goto(`/#/account/messages${query}`)
  await expect(page.getByTestId('enterprise-message-center')).toContainText(
    '演示模式'
  )
  await expect(page.locator('.inbox-title')).toBeVisible()
  await expect(page.locator('.message-inbox tbody tr').first()).toBeVisible()
  await expect(page.locator('.app-loading')).toHaveCount(0)
}
const inboxRow = (page: Page, title: string): Locator =>
  page.locator('.message-inbox tbody tr').filter({ hasText: title })
const navigation = (page: Page, label: string): Locator =>
  page.locator('.inbox-navigation-item').filter({ hasText: label })
const statistic = (page: Page, label: string): Locator =>
  page.locator('.message-stat').filter({ hasText: label }).locator('strong')
const drawer = (page: Page): Locator => page.locator('.message-detail-drawer')

/** 仅通过表格的真实消息按钮打开详情。 */
const openDetail = async (page: Page, title: string) => {
  await inboxRow(page, title)
    .getByRole('button', { name: title, exact: true })
    .click()
  await expect(
    drawer(page).getByRole('heading', { name: title, exact: true })
  ).toBeVisible()
  await expect(drawer(page).locator('.message-body')).toBeVisible()
}

/** 关闭真实抽屉，等待遮罩退出后继续列表交互。 */
const closeDetail = async (page: Page) => {
  await drawer(page).getByRole('button', { name: 'close', exact: true }).click()
  await expect(drawer(page)).toBeHidden()
}

/** 切换业务侧栏，等待已提交查询与页标题同步。 */
const selectInbox = async (page: Page, label: string) => {
  await navigation(page, label).click()
  await expect(page.locator('.inbox-title h2')).toHaveText(label)
}

/** 使用真实 Naive 页签，查询与计数始终由应用领域服务执行。 */
const selectStatus = async (page: Page, label: string) => {
  await page
    .locator('.inbox-status-tabs .n-tabs-tab')
    .filter({ hasText: new RegExp(`^${label}$`) })
    .click()
  await expect(
    page.locator('.inbox-status-tabs .n-tabs-tab--active')
  ).toHaveText(label)
}

/** 在确认框明确提交，与详情中的原按钮区分。 */
const confirmAction = async (page: Page, label: string) => {
  const dialog = page.locator('.n-dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: label, exact: true }).click()
  await expect(dialog).toBeHidden()
}

test('通用与审批分类独立，读过的待审批仍留在我的待办且不会自行办结', async ({
  page,
}) => {
  await openInbox(page)
  await expect(statistic(page, '全部消息')).toHaveText('21')
  await expect(statistic(page, '未读消息')).toHaveText('9')
  await expect(statistic(page, '待办理事项')).toHaveText('6')
  await selectInbox(page, '通用消息')
  await expect(inboxRow(page, LEGACY_TASK_TITLE)).toBeVisible()
  await expect(inboxRow(page, REVIEW_TITLE)).toHaveCount(0)
  await selectInbox(page, '审批流程')
  await expect(inboxRow(page, REVIEW_TITLE)).toContainText('未读')
  await expect(inboxRow(page, REVIEW_TITLE)).toContainText('审批中')
  await expect(inboxRow(page, LEGACY_TASK_TITLE)).toHaveCount(0)
  await openDetail(page, REVIEW_TITLE)
  await expect(drawer(page)).toContainText('已读')
  await expect(drawer(page)).toContainText('审批中')
  await expect(drawer(page)).toContainText('已逾期')
  await expect(
    drawer(page).getByRole('button', { name: '确认完成待办', exact: true })
  ).toHaveCount(0)
  await closeDetail(page)
  await selectInbox(page, '待我审批')
  await expect(inboxRow(page, REVIEW_TITLE)).toContainText('已读')
  await expect(inboxRow(page, REVIEW_TITLE)).toContainText('审批中')
  await expect(statistic(page, '待我审批')).toHaveText('1')
  await expect(statistic(page, '待办理事项')).toHaveText('6')
})

test('同意审批形成意见时间线，已办与阅读分别更新并持久化', async ({ page }) => {
  await openInbox(page)
  await selectInbox(page, '待我审批')
  await openDetail(page, REVIEW_TITLE)
  await drawer(page)
    .getByRole('textbox', { name: '审批意见', exact: true })
    .fill('预算和设备清单已核实，同意采购。')
  await drawer(page).getByRole('button', { name: '同意', exact: true }).click()
  await expect(drawer(page)).toContainText('审批中')
  await confirmAction(page, '确认同意')
  await expect(drawer(page)).toContainText('已通过')
  await expect(drawer(page).locator('.workflow-timeline')).toContainText(
    '预算和设备清单已核实，同意采购。'
  )
  await expect(
    drawer(page).getByRole('textbox', { name: '审批意见', exact: true })
  ).toHaveCount(0)
  await expect(statistic(page, '待我审批')).toHaveText('0')
  await expect(statistic(page, '待办理事项')).toHaveText('5')
  await closeDetail(page)
  await expect(inboxRow(page, REVIEW_TITLE)).toHaveCount(0)
  await selectInbox(page, '我已审批')
  await expect(inboxRow(page, REVIEW_TITLE)).toContainText('已读')
  await expect(inboxRow(page, REVIEW_TITLE)).toContainText('已通过')
  await page.reload()
  await openDetail(page, REVIEW_TITLE)
  await expect(drawer(page).locator('.workflow-timeline')).toContainText(
    '预算和设备清单已核实，同意采购。'
  )
  await closeDetail(page)
  await page.getByText('演示控制', { exact: true }).click()
  await page.getByRole('button', { name: '生成新审批', exact: true }).click()
  await expect(statistic(page, '待我审批')).toHaveText('1')
  await selectInbox(page, '待我审批')
  await expect(inboxRow(page, '新增采购申请待你审批（演示）')).toBeVisible()
})

for (const scenario of [
  {
    button: '驳回',
    confirmation: '确认驳回',
    result: '已驳回',
    comment: '采购预算缺少审批依据，请核实。',
  },
  {
    button: '退回修改',
    confirmation: '确认退回修改',
    result: '已退回',
    comment: '请补充供应商报价附件。',
  },
] as const) {
  test(`${scenario.button}必须填写意见，明确确认后显示独立审批结果`, async ({
    page,
  }) => {
    await openInbox(page)
    await selectInbox(page, '待我审批')
    await openDetail(page, REVIEW_TITLE)
    await drawer(page)
      .getByRole('button', { name: scenario.button, exact: true })
      .click()
    await expect(drawer(page).locator('.command-warning')).toContainText(
      '请填写审批意见'
    )
    await expect(page.locator('.n-dialog')).toHaveCount(0)
    await expect(drawer(page)).toContainText('审批中')
    await drawer(page)
      .getByRole('textbox', { name: '审批意见', exact: true })
      .fill(scenario.comment)
    await drawer(page)
      .getByRole('button', { name: scenario.button, exact: true })
      .click()
    await confirmAction(page, scenario.confirmation)
    await expect(drawer(page)).toContainText(scenario.result)
    await expect(drawer(page).locator('.workflow-timeline')).toContainText(
      scenario.comment
    )
    await expect(
      drawer(page).getByRole('button', { name: '同意', exact: true })
    ).toHaveCount(0)
    await closeDetail(page)
    await selectInbox(page, '我已审批')
    await expect(inboxRow(page, REVIEW_TITLE)).toContainText(scenario.result)
  })
}

test('抄送仅查看；我发起的待审流程可撤回且不会展示审批权限', async ({
  page,
}) => {
  await openInbox(page)
  await selectInbox(page, '抄送给我')
  await openDetail(page, CC_TITLE)
  await expect(drawer(page)).toContainText('此消息为抄送通知')
  await expect(
    drawer(page).getByRole('textbox', { name: '审批意见', exact: true })
  ).toHaveCount(0)
  await expect(
    drawer(page).getByRole('button', {
      name: /^(同意|驳回|退回修改|撤回申请)$/,
    })
  ).toHaveCount(0)
  await closeDetail(page)
  await selectInbox(page, '我发起的')
  await openDetail(page, INITIATED_TITLE)
  await expect(
    drawer(page).getByRole('button', { name: /^(同意|驳回|退回修改)$/ })
  ).toHaveCount(0)
  await drawer(page)
    .getByRole('textbox', { name: '撤回说明', exact: true })
    .fill('行程时间调整，重新提交前撤回。')
  await drawer(page)
    .getByRole('button', { name: '撤回申请', exact: true })
    .click()
  await confirmAction(page, '确认撤回申请')
  await expect(drawer(page)).toContainText('已撤回')
  await expect(drawer(page).locator('.workflow-timeline')).toContainText(
    '行程时间调整，重新提交前撤回。'
  )
  await expect(
    drawer(page).getByRole('button', { name: '撤回申请', exact: true })
  ).toHaveCount(0)
})

test('普通待办可开始处理再取消，取消后保留正文并停止后续办理', async ({
  page,
}) => {
  await openInbox(page)
  await selectInbox(page, '通用消息')
  await openDetail(page, LEGACY_TASK_TITLE)
  await drawer(page)
    .getByRole('button', { name: '开始办理', exact: true })
    .click()
  await confirmAction(page, '确认开始')
  await expect(drawer(page).locator('.task-handling')).toContainText('处理中')
  await expect(
    drawer(page).getByRole('button', { name: '开始办理', exact: true })
  ).toHaveCount(0)
  await drawer(page)
    .getByRole('button', { name: '取消待办', exact: true })
    .click()
  await confirmAction(page, '确认取消')
  await expect(drawer(page).locator('.task-handling')).toContainText('已取消')
  await expect(drawer(page).locator('.message-body')).toContainText(
    LEGACY_TASK_TITLE
  )
  await expect(
    drawer(page).getByRole('button', { name: '确认完成待办', exact: true })
  ).toHaveCount(0)
  await closeDetail(page)
  await expect(inboxRow(page, LEGACY_TASK_TITLE)).toContainText('已读')
  await expect(inboxRow(page, LEGACY_TASK_TITLE)).toContainText('已取消')
  await selectStatus(page, '待办')
  await expect(inboxRow(page, LEGACY_TASK_TITLE)).toHaveCount(0)
})

test('历史快照非破坏升级，保留草稿偏好与已删消息，新审批删除后刷新不复活', async ({
  page,
}) => {
  const scope = notificationScopeKey({
    userId: 'mock-user:cheny',
    tenantId: 'jiangsu-jinheng',
    companyId: 'nanjing',
  })
  const key = `robot.notifications.v1:${scope}`
  const document = createNotificationDemoDocument(scope, new Date())
  delete document.seedRevision
  document.items = document.items.filter(
    item => item.id.startsWith('demo-message-') && item.id !== 'demo-message-2'
  )
  document.items[0]!.readAt = document.items[0]!.createdAt
  document.items[0]!.starred = true
  document.preferences.channels.sms = true
  document.dispatches.push({
    id: 'legacy-user-draft',
    title: '升级前保留的用户草稿',
    content: '保留历史输入',
    category: 'business',
    priority: 'normal',
    channels: ['inbox'],
    audience: 'self',
    scheduledAt: null,
    status: 'draft',
    revision: 1,
    createdAt: document.items[0]!.createdAt,
    updatedAt: document.items[0]!.createdAt,
  })
  await page.addInitScript(
    ({ storageKey, snapshot }) => {
      if (sessionStorage.getItem('__e2e_legacy_notifications__')) return
      sessionStorage.setItem('__e2e_legacy_notifications__', '1')
      localStorage.setItem(storageKey, snapshot)
    },
    { storageKey: key, snapshot: JSON.stringify(document) }
  )
  await openInbox(page)
  await selectInbox(page, '审批流程')
  await expect(inboxRow(page, REVIEW_TITLE)).toBeVisible()
  const migrated = await page.evaluate(
    storageKey => JSON.parse(localStorage.getItem(storageKey)!),
    key
  )
  expect(migrated.seedRevision).toBe(2)
  expect(
    migrated.items.some((item: { id: string }) => item.id === 'demo-message-2')
  ).toBe(false)
  expect(
    migrated.items.find((item: { id: string }) => item.id === 'demo-message-1')
  ).toMatchObject({ readAt: document.items[0]!.readAt, starred: true })
  expect(migrated.preferences.channels.sms).toBe(true)
  expect(migrated.dispatches[0].title).toBe('升级前保留的用户草稿')
  await inboxRow(page, REVIEW_TITLE).getByRole('checkbox').click()
  await page
    .locator('.inbox-toolbar')
    .getByRole('button', { name: '删除', exact: true })
    .click()
  await confirmAction(page, '确认删除')
  await expect(inboxRow(page, REVIEW_TITLE)).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.inbox-title h2')).toHaveText('审批流程')
  await expect(inboxRow(page, REVIEW_TITLE)).toHaveCount(0)
  await expect(inboxRow(page, '差旅费用报销 · 已通过')).toBeVisible()
  const persisted = await page.evaluate(
    storageKey => JSON.parse(localStorage.getItem(storageKey)!),
    key
  )
  expect(
    persisted.items.some(
      (item: { id: string }) => item.id === 'demo-workflow-1'
    )
  ).toBe(false)
  expect(persisted.dispatches[0].title).toBe('升级前保留的用户草稿')
})

test('序号跨页连续，第二页从11开始且返回第一页恢复1', async ({ page }) => {
  await openInbox(page)
  await expect(
    page.locator('.message-inbox th').filter({ hasText: /^序号$/ })
  ).toBeVisible()
  await expect(page.locator('.message-row-number').first()).toHaveText('1')
  await expect(page.locator('.message-row-number').last()).toHaveText('10')
  const pagination = page.locator('.message-inbox .n-pagination')
  await pagination
    .locator('.n-pagination-item')
    .filter({ hasText: /^2$/ })
    .click()
  await expect(pagination.locator('.n-pagination-item--active')).toHaveText('2')
  await expect(page.locator('.message-row-number').first()).toHaveText('11')
  await expect(page.locator('.message-row-number').last()).toHaveText('20')
  await pagination
    .locator('.n-pagination-item')
    .filter({ hasText: /^1$/ })
    .click()
  await expect(page.locator('.message-row-number').first()).toHaveText('1')
})

test('顶部预览支持审批与待办联合筛选，跳转完整消息中心保留同一条件', async ({
  page,
}) => {
  await openInbox(page)
  await page.getByTestId('notification-bell').getByRole('button').click()
  const preview = page.getByTestId('notification-preview')
  await expect(preview).toBeVisible()
  await preview
    .getByRole('navigation', { name: '消息业务分类' })
    .getByRole('button', { name: /审批流程/ })
    .click()
  await preview
    .getByRole('group', { name: '阅读与办理状态' })
    .getByRole('button', { name: '待办', exact: true })
    .click()
  await expect(preview.locator('.notification-preview__item')).toHaveCount(1)
  await expect(preview.locator('.notification-preview__item')).toContainText(
    REVIEW_TITLE
  )
  await expect(preview.locator('.notification-preview__item')).toContainText(
    '审批中'
  )
  await expect(preview.locator('.notification-preview__number')).toHaveText(
    '01'
  )
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-preview.png',
    animations: 'disabled',
  })
  await preview
    .getByRole('button', { name: '查看筛选下全部', exact: true })
    .click()
  await expect(preview).toBeHidden()
  await expect(page).toHaveURL(/topic=workflow/)
  await expect(page).toHaveURL(/status=todo/)
  await expect(page.locator('.inbox-title h2')).toHaveText('审批流程')
  await expect(
    page.locator('.inbox-status-tabs .n-tabs-tab--active')
  ).toHaveText('待办')
  await expect(page.locator('.message-inbox tbody tr')).toHaveCount(1)
  await expect(inboxRow(page, REVIEW_TITLE)).toBeVisible()
  await page.reload()
  await expect(inboxRow(page, REVIEW_TITLE)).toBeVisible()
  await expect(
    page.locator('.inbox-status-tabs .n-tabs-tab--active')
  ).toHaveText('待办')
})

test('亮暗主题与窄屏工作台和审批抽屉没有页面整体横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1100 })
  await page.addInitScript(() => localStorage.setItem('theme-mode', 'light'))
  await openInbox(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-light.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: /当前:.*点击切换/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-dark.png',
    fullPage: true,
    animations: 'disabled',
  })
  await selectInbox(page, '待我审批')
  await openDetail(page, REVIEW_TITLE)
  await expect(
    drawer(page).getByRole('textbox', { name: '审批意见', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-approval-dark.png',
    fullPage: true,
    animations: 'disabled',
  })
  await closeDetail(page)
  await page.setViewportSize({ width: 720, height: 900 })
  await expect(
    page.getByRole('button', { name: '查询', exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-narrow.png',
    fullPage: true,
    animations: 'disabled',
  })
  await openDetail(page, REVIEW_TITLE)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await expect(
    drawer(page).getByRole('textbox', { name: '审批意见', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-approval-narrow.png',
    fullPage: true,
    animations: 'disabled',
  })
})

test('390px铃铛锚点与预览面板位于视口内，展开菜单不覆盖桌面偏好', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openInbox(page)
  const bell = page.getByTestId('notification-bell').getByRole('button')
  await expect(bell).toBeVisible()
  const triggerBox = (await bell.boundingBox())!
  expect(triggerBox.x).toBeGreaterThanOrEqual(0)
  expect(triggerBox.x + triggerBox.width).toBeLessThanOrEqual(390)
  await bell.click()
  const panel = page.getByTestId('notification-preview')
  await expect(panel).toBeVisible()
  const panelBox = (await panel.boundingBox())!
  expect(panelBox.x).toBeGreaterThanOrEqual(0)
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(390)
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/refinement-bell-narrow-final.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.setViewportSize({ width: 1480, height: 1000 })
  await expect(page.locator('#guide-menu-collapse')).toHaveAttribute(
    'aria-expanded',
    'true'
  )
})
