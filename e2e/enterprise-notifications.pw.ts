/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 正式产物消息闭环与远端 HTTP fixture；不代表真实后端投递验证
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const installDemoSession = async (page: Page) => {
  await installMockAdminSession(page)
  await page.addInitScript(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}')
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ ...user, id: 'mock-user:cheny' })
    )
  })
}
const statistic = (page: Page, label: string) =>
  page.locator('.message-stat').filter({ hasText: label }).locator('strong')
const openDemo = async (page: Page) => {
  await installDemoSession(page)
  await page.goto('/#/account/messages')
  await expect(page.getByTestId('enterprise-message-center')).toContainText(
    '演示模式'
  )
  await expect(
    page.getByRole('button', { name: '采购申请待你审批', exact: true })
  ).toBeVisible()
  await expect(page.locator('.app-loading')).toHaveCount(0)
}

test('演示无需后端；已读持久化、预览与全局统计同步，新到消息保持未读', async ({
  page,
}) => {
  const backend: string[] = []
  page.on('request', request => {
    if (request.url().includes('/api/notifications'))
      backend.push(request.url())
  })
  await openDemo(page)
  await expect(statistic(page, '未读消息')).toHaveText('6')
  await page.getByRole('button', { name: '全部标为已读', exact: true }).click()
  await page
    .getByRole('button', { name: '标为已读', exact: true })
    .last()
    .click()
  await expect(statistic(page, '未读消息')).toHaveText('0')
  await page.reload()
  await expect(statistic(page, '未读消息')).toHaveText('0')
  await page.getByText('演示控制', { exact: true }).click()
  await page.getByRole('button', { name: '生成新通知', exact: true }).click()
  await expect(statistic(page, '未读消息')).toHaveText('1')
  await page.getByTestId('notification-bell').getByRole('button').click()
  await expect(page.locator('.c-notification-center__panel')).toContainText(
    '演示'
  )
  await page.getByRole('button', { name: '查看全部消息', exact: true }).click()
  await expect(page).toHaveURL(/#\/account\/messages$/)
  expect(backend).toEqual([])
})

test('阅读待办不会办结；明确办理、星标、归档均可恢复检查', async ({ page }) => {
  await openDemo(page)
  await expect(statistic(page, '待办理事项')).toHaveText('4')
  await page
    .getByRole('button', { name: '采购申请待你审批', exact: true })
    .click()
  const drawer = page.locator('.message-detail-drawer')
  await expect(drawer).toContainText('打开详情仅标记已读')
  await expect(statistic(page, '待办理事项')).toHaveText('4')
  await drawer.getByRole('button', { name: '添加星标', exact: true }).click()
  await expect(
    drawer.getByRole('button', { name: '取消星标', exact: true })
  ).toBeVisible()
  await drawer
    .getByRole('button', { name: '确认完成待办', exact: true })
    .click()
  await page.getByRole('button', { name: '确认完成', exact: true }).click()
  await expect(drawer).toContainText('此待办已完成')
  await expect(statistic(page, '待办理事项')).toHaveText('3')
  await drawer.getByRole('button', { name: '归档', exact: true }).click()
  await expect(
    drawer.getByRole('button', { name: '移回收件箱', exact: true })
  ).toBeVisible()
  await drawer.getByRole('button', { name: '移回收件箱', exact: true }).click()
  await expect(
    drawer.getByRole('button', { name: '归档', exact: true })
  ).toBeVisible()
})

test('草稿明确发送、查看模拟投递、撤回与审计形成闭环', async ({ page }) => {
  await openDemo(page)
  await page
    .locator('.message-sections .n-tabs-tab')
    .filter({ hasText: '发送与记录' })
    .click()
  await page.getByRole('button', { name: '撰写消息', exact: true }).click()
  const editor = page.locator('.message-editor-modal')
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '消息标题' })
    .getByRole('textbox')
    .fill('浏览器验收公告')
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '消息正文' })
    .getByRole('textbox')
    .fill('这是一条用于验证保存、投递、撤回和审计的本地公告。')
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '消息分类' })
    .locator('.n-base-selection')
    .click()
  await page
    .locator('.n-base-select-option')
    .filter({ hasText: /^系统通知$/ })
    .click()
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '优先级' })
    .locator('.n-base-selection')
    .click()
  await page
    .locator('.n-base-select-option')
    .filter({ hasText: /^高$/ })
    .click()
  await editor
    .locator('.n-form-item')
    .filter({ hasText: '投递通道' })
    .locator('.n-base-selection')
    .click()
  await page
    .locator('.n-base-select-option')
    .filter({ hasText: /^邮件$/ })
    .click()
  await editor.getByRole('heading', { name: '撰写消息', exact: true }).click()
  await editor.getByRole('button', { name: '保存草稿', exact: true }).click()
  await expect(editor).toHaveCount(0)
  const row = page
    .locator('.message-governance tr')
    .filter({ hasText: '浏览器验收公告' })
  await expect(row).toContainText('草稿')
  await expect(row).toContainText('站内信 / 邮件')
  await row.getByRole('button', { name: '发送', exact: true }).click()
  await page.getByRole('button', { name: '确认发送', exact: true }).click()
  await expect(row).toContainText('已发送')
  await row.getByRole('button', { name: '投递记录', exact: true }).click()
  const deliveries = page.locator('.message-preview-modal')
  await expect(deliveries).toContainText('模拟送达')
  await expect(deliveries.locator('.n-list-item')).toHaveCount(2)
  await deliveries.locator('.n-base-close').click()
  await row.getByRole('button', { name: '撤回', exact: true }).click()
  await page.getByRole('button', { name: '确认撤回', exact: true }).click()
  await expect(row).toContainText('已撤回')
  await expect(page.locator('.message-governance')).toContainText('撤回消息')
  await page
    .locator('.message-sections .n-tabs-tab')
    .filter({ hasText: '收件箱' })
    .click()
  await page
    .getByPlaceholder('搜索标题、摘要、正文', { exact: true })
    .fill('浏览器验收公告')
  await page.getByRole('button', { name: '查询', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '浏览器验收公告', exact: true })
  ).toHaveCount(0)
})

test('通知偏好持久化；离线错误保留内容，恢复后可以继续演示', async ({
  page,
}) => {
  await openDemo(page)
  await page
    .locator('.message-sections .n-tabs-tab')
    .filter({ hasText: '通知偏好' })
    .click()
  const email = page.getByRole('switch', { name: '邮件', exact: true })
  await expect(email).toHaveAttribute('aria-checked', 'true')
  await email.click()
  await page.getByRole('button', { name: '保存偏好', exact: true }).click()
  await expect(page.locator('.n-message-container')).toContainText(
    '通知偏好已保存'
  )
  await page.reload()
  await page
    .locator('.message-sections .n-tabs-tab')
    .filter({ hasText: '通知偏好' })
    .click()
  await expect(email).toHaveAttribute('aria-checked', 'false')
  await page
    .locator('.message-sections .n-tabs-tab')
    .filter({ hasText: '收件箱' })
    .click()
  await page.getByText('演示控制', { exact: true }).click()
  await page.getByRole('button', { name: '模拟离线', exact: true }).click()
  await page.getByRole('button', { name: '刷新', exact: true }).click()
  await expect(page.locator('.message-error')).toBeVisible()
  await expect(
    page.getByRole('button', { name: '采购申请待你审批', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: '恢复连接', exact: true }).click()
  await expect(page.locator('.message-error')).toHaveCount(0)
  await expect(page.locator('.connection-status')).toContainText('已同步')
})

test('消息工作台亮暗主题和窄窗口保持可用，表格在容器内滚动', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1200 })
  await openDemo(page)
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/message-center-light.png',
    fullPage: true,
  })
  await page.evaluate(async () => {
    const app = (
      document.querySelector('#app') as HTMLElement & {
        __vue_app__: import('vue').App
      }
    ).__vue_app__
    const pinia = app.config.globalProperties.$pinia as {
      _s: Map<string, { setMode(mode: string): Promise<void> }>
    }
    await pinia._s.get('theme-extended')!.setMode('dark')
  })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.waitForTimeout(350) // 主题颜色使用过渡动画，截图等待其完成。
  await page.screenshot({
    path: '/private/tmp/robot-enterprise-notifications/message-center-dark.png',
    fullPage: true,
  })
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
    path: '/private/tmp/robot-enterprise-notifications/message-center-narrow.png',
    fullPage: true,
  })
})

test.describe('未来消息服务的远端适配', () => {
  test.use({ baseURL: 'http://127.0.0.1:4174' })
  const installRemote = async (page: Page) => {
    await page.addInitScript(() => {
      const context = {
        id: 'self-context',
        tenantId: 'self-tenant',
        companyId: 'self-company',
        tenantName: '测试租户',
        companyName: '测试公司',
        isPrimary: true,
        roles: [],
      }
      localStorage.setItem('token', JSON.stringify('notification-http-fixture'))
      localStorage.setItem('timeStamp', JSON.stringify(Date.now()))
      localStorage.setItem(
        'token_expires_in',
        JSON.stringify(Date.now() + 3_600_000)
      )
      localStorage.setItem(
        'userInfo',
        JSON.stringify({ id: 'self-user', username: 'self-user' })
      )
      localStorage.setItem('activeAuthContext', JSON.stringify(context))
      localStorage.setItem('authContexts', JSON.stringify([context]))
    })
  }

  test('服务端78条未读只返回一条预览仍显示78；真实Chromium清洗富文本', async ({
    page,
  }) => {
    await installRemote(page)
    const resources: string[] = []
    page.on('request', request => {
      if (request.url().includes('tracking.invalid'))
        resources.push(request.url())
    })
    const item = {
      id: 'html-fixture',
      title: '安全富文本验收',
      summary: '仅一条预览',
      content:
        '<h2>审批结果</h2><p style="position:fixed" class="overlay" onclick="window.stolen=1">安全文字<strong>重点</strong></p><ul><li>说明</li></ul><table><tr><td>完成</td></tr></table><pre><code>const a = 1</code></pre><script>window.stolen=1</script><style>body{display:none}</style><a href="javascript:alert(1)">链接文字</a><img src="https://tracking.invalid/x" onerror="window.stolen=1"><iframe srcdoc="danger"></iframe><svg onload="window.stolen=1"></svg><form action="/logout"><input name="x"></form>',
      contentType: 'html',
      kind: 'notification',
      category: 'system',
      source: 'HTTP fixture',
      priority: 'normal',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
      readAt: '2026-10-18T00:00:00Z',
      archivedAt: null,
      starred: false,
      taskStatus: null,
      revision: 1,
      attachments: [
        {
          id: 'proof',
          name: '验收附件.txt',
          url: 'https://tracking.invalid/forbidden-download',
          size: 16,
        },
      ],
    }
    let authorizedDownload = false
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname
      if (path === '/api/notifications/inbox/html-fixture/attachments/proof') {
        authorizedDownload =
          route.request().headers().authorization ===
          'Bearer notification-http-fixture'
        return route.fulfill({
          status: authorizedDownload ? 200 : 403,
          contentType: 'text/plain',
          body: 'attachment proof',
        })
      }
      const data =
        path === '/api/notifications/inbox'
          ? {
              items: [item],
              previewItems: [item],
              total: 100,
              revision: 100,
              stats: {
                total: 100,
                unread: 78,
                read: 22,
                todo: 0,
                done: 0,
                archived: 0,
                starred: 0,
                byCategory: { system: 78, business: 0, alarm: 0 },
              },
              capabilities: {
                manage: false,
                realtime: false,
                preferences: false,
              },
            }
          : path === '/api/notifications/inbox/html-fixture'
            ? item
            : path === '/api/auth/button-list'
              ? {}
              : []
      return route.fulfill({ json: { code: 0, data, msg: '成功' } })
    })
    await page.goto('/#/account/messages?message=html-fixture')
    await expect(statistic(page, '未读消息')).toHaveText('78')
    await expect(page.getByTestId('notification-bell')).toContainText('78')
    const body = page.locator('.message-detail-drawer .message-body')
    await expect(body.locator('h2')).toHaveText('审批结果')
    await expect(body.locator('strong')).toHaveText('重点')
    await expect(body.locator('td')).toHaveText('完成')
    await expect(body.locator('code')).toHaveText('const a = 1')
    await expect(
      body.locator(
        'script,style,a,img,iframe,svg,form,input,[style],[class],[onclick]'
      )
    ).toHaveCount(0)
    expect(
      await page.evaluate(() => (window as Window & { stolen?: number }).stolen)
    ).toBeUndefined()
    const downloaded = page.waitForEvent('download')
    await page
      .locator('.message-detail-drawer')
      .getByRole('button', { name: '下载', exact: true })
      .click()
    const download = await downloaded
    expect(download.suggestedFilename()).toBe('验收附件.txt')
    expect(await download.failure()).toBeNull()
    expect(authorizedDownload).toBe(true)
    expect(resources).toEqual([])
  })

  test('缺少服务明确展示错误，保留自助路由且不会退回演示或反复全局弹错', async ({
    page,
  }) => {
    await installRemote(page)
    await page.route('**/api/**', route => {
      if (
        new URL(route.request().url()).pathname.startsWith('/api/notifications')
      )
        return route.fulfill({
          status: 404,
          json: { code: 404, msg: '消息服务未接入' },
        })
      return route.fulfill({
        json: {
          code: 0,
          data: route.request().url().includes('button-list') ? {} : [],
        },
      })
    })
    await page.goto('/#/account/messages')
    await expect(page.getByTestId('enterprise-message-center')).toContainText(
      '接口模式'
    )
    await expect(page.locator('.message-error')).toBeVisible()
    await expect(
      page.getByRole('button', { name: '生成新通知', exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: '采购申请待你审批', exact: true })
    ).toHaveCount(0)
    await expect(page.locator('.n-message-container .n-message')).toHaveCount(0)
    await expect(page).toHaveURL(/#\/account\/messages$/)
  })
})
