/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \\Robot_Admin\\e2e\\table-preference-isolation.pw.ts
 * @Description: 同一浏览器内通过真实登录、退出及公司切换验证两种表格的个人偏好隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { solveDemoCaptcha } from './d_login'
import assertBrowserLaunchEnvironment from './runtime-browser-setup'

test.beforeAll(assertBrowserLaunchEnvironment)
test.use({ viewport: { width: 1920, height: 1080 } })

const routes = {
  native: '/production-sales/shipping',
  mach: '/demo/table-manage/mach-table',
} as const
const tableKeys = {
  native: 'production-sales:shipping:tasks:v1',
  mach: 'robot-admin:demo:mach-table:orders:v3',
} as const
type Grid = keyof typeof routes
type Widths = Record<Grid, number>
const soft = expect.configure({ soft: true })

/** 仅按公开范围契约构造期望键，不调用待测应用的实现。 */
function preferenceKeys(user: 'cheny' | 'admin', company = 'nanjing') {
  const scope = JSON.stringify([
    'robot-admin:table-preferences:v1',
    'jiangsu-jinheng',
    company,
    `mock-user:${user}`,
  ])
  return {
    native: `c_table_cols_${JSON.stringify([scope, tableKeys.native])}`,
    mach: `mach-table:grid-state:${JSON.stringify([scope, tableKeys.mach])}`,
  }
}

/** 使用现成演示账号与真实拼图登录；没有向 Store 或凭据存储写入测试身份。 */
async function login(page: Page, username: 'CHENY' | 'admin') {
  await expect(page).toHaveURL(/#\/login$/)
  await page.getByPlaceholder('请输入用户名').fill(username)
  await page.locator('input[placeholder="请输入密码"]:visible').fill('123456')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  if (username === 'CHENY')
    await page
      .getByRole('button', { name: '进入江苏金恒（南京）', exact: true })
      .click()
  await expect(page).toHaveURL(/#\/home$/, { timeout: 20000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    username
  )
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（南京）'
  )
}

/** 退出沿用现有确认及清理链路，始终留在同一个页面文档中。 */
async function logout(page: Page) {
  await page.locator('.navbar-right .user-info').click()
  await page.getByText('退出登录', { exact: true }).click()
  await page.getByRole('button', { name: '确认退出', exact: true }).click()
  await expect(page).toHaveURL(/#\/login$/)
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
}

/** 公司切换走已授权公司选择器，不改认证 Mock、路由实例或全局 Store。 */
async function switchCompany(page: Page, company: '南京' | '西安') {
  await page.locator('.navbar-right .user-info').click()
  await page.getByRole('button', { name: '切换公司', exact: true }).click()
  await page
    .getByRole('button', {
      name: `进入 江苏金恒 · 江苏金恒（${company}）`,
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(/#\/home$/, { timeout: 20000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    `江苏金恒（${company}）`
  )
}

/** 只使用同文档 hash 路由，刷新不能代替会话切换时的内存清理。 */
async function openGrid(page: Page, grid: Grid) {
  await page.evaluate(path => {
    location.hash = path
  }, routes[grid])
  if (grid === 'native') {
    await expect(page.getByTestId('shipping-workbench')).toBeVisible()
    await expect(page.locator('.shipping-queue tbody tr').first()).toBeVisible()
    await expect
      .poll(() =>
        page.locator('.shipping-queue').evaluate(root => {
          const total = [...root.querySelectorAll('thead th')].reduce(
            (sum, header) => sum + header.getBoundingClientRect().width,
            0
          )
          const available = root.querySelector(
            '.n-data-table-wrapper'
          )!.clientWidth
          return Math.abs(total - available)
        })
      )
      .toBeLessThanOrEqual(3)
  } else {
    await expect(page.locator('.mach-table-demo .mach-root')).toBeVisible()
    await expect(page.locator('.mach-table-demo .mach-overview')).toContainText(
      'Grid Ready'
    )
    await expect(
      page.locator('.mach-table-demo .mach-row[data-id]').first()
    ).toBeVisible()
  }
}

/** 同时记录 UI 宽度与落盘结果，但只读取表格偏好键，不输出认证凭据。 */
async function preferenceStorage(page: Page) {
  return page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter(
          key =>
            key.startsWith('c_table_cols_') ||
            key.startsWith('mach-table:grid-state:')
        )
        .map(key => [key, JSON.parse(localStorage.getItem(key)!)])
    )
  )
}

/** 读取公开表头的真实像素宽度，验证用户实际看到的结果。 */
async function gridWidth(page: Page, grid: Grid) {
  const header =
    grid === 'native'
      ? page
          .locator('.shipping-queue')
          .getByRole('columnheader', { name: '客户名称', exact: true })
      : page.locator(
          '.mach-table-demo .mach-header-cell[data-col-id="orderNo"]'
        )
  return (await header.boundingBox())!.width
}

/** 真实拖动头部手柄；随后跨过最大 200ms 保存窗口核验所属账号的存储。 */
async function resizeGrid(page: Page, grid: Grid, delta: number) {
  await openGrid(page, grid)
  const view =
    grid === 'native'
      ? page.getByTestId('shipping-workbench')
      : page.locator('.mach-table-demo')
  // 入场 transform 会移动手柄；只在真实过渡完成后取坐标，不关闭动画或刷新。
  await expect(view).not.toHaveClass(/\S+-enter-(?:active|from|to)/)
  const before = await gridWidth(page, grid)
  const handle =
    grid === 'native'
      ? page
          .locator('.shipping-queue')
          .getByRole('columnheader', { name: '客户名称', exact: true })
          .locator('.n-data-table-resize-button')
      : page.locator(
          '.mach-table-demo .mach-header-cell[data-col-id="orderNo"] .mach-header-resize'
        )
  await handle.hover()
  const box = (await handle.boundingBox())!
  // 固定区边界可能裁掉手柄外侧，命中可见内侧再拖动，不能用被遮挡的盒中心。
  const x = box.x + box.width * (grid === 'mach' ? 0.25 : 0.5)
  const y = box.y + box.height / 2
  const hit = await handle.evaluate(
    (element, point) => {
      const at = (x: number) => {
        const target = document.elementFromPoint(x, point.y)
        return {
          matches: !!target && element.contains(target),
          tag: target?.tagName,
          class: target?.getAttribute('class'),
        }
      }
      return { start: at(point.x), center: at(point.center) }
    },
    { x, y, center: box.x + box.width / 2 }
  )
  await test.info().attach(`${grid}-${delta}-drag-hit.json`, {
    body: JSON.stringify(hit, null, 2),
    contentType: 'application/json',
  })
  expect(hit.start.matches, `${grid} 手柄起点必须实际接收指针`).toBe(true)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta, y, { steps: 6 })
  await page.mouse.up()
  await expect.poll(() => gridWidth(page, grid)).toBeCloseTo(before + delta, 0)
  // 这段时间覆盖真实的150/200ms保存窗口，不用刷新或重试重建页面。
  await page.waitForTimeout(260)
  return gridWidth(page, grid)
}

/** 切换后立即与保存窗口后各检查一次，迟到任务不能污染新身份的默认值。 */
async function checkWidths(page: Page, expected?: Widths) {
  const result = {} as Widths
  await (['native', 'mach'] as const).reduce(async (previous, grid) => {
    await previous
    await openGrid(page, grid)
    const immediate = await gridWidth(page, grid)
    if (expected)
      soft(immediate, `${grid} 切换后立即宽度`).toBeCloseTo(expected[grid], 0)
    await page.waitForTimeout(260)
    const settled = await gridWidth(page, grid)
    if (expected)
      soft(settled, `${grid} 保存窗口后宽度`).toBeCloseTo(expected[grid], 0)
    result[grid] = settled
  }, Promise.resolve())
  return result
}

/** 从真实持久化快照读取所测业务列，不把整个页面状态作为比较对象。 */
async function storedWidths(
  page: Page,
  keys: ReturnType<typeof preferenceKeys>
) {
  return page.evaluate(keys => {
    const native = JSON.parse(localStorage.getItem(keys.native) || 'null')
    const mach = JSON.parse(localStorage.getItem(keys.mach) || 'null')
    return {
      native: native?.columns?.find(
        (column: { key: string }) => column.key === 'customer'
      )?.width,
      mach: mach?.state?.columns?.find(
        (column: { colId: string }) => column.colId === 'orderNo'
      )?.width,
    }
  }, keys)
}

/** 存储保存逻辑宽度，浏览器按物理像素取整；只允许亚像素差异。 */
function expectStoredWidths(
  stored: Awaited<ReturnType<typeof storedWidths>>,
  expected: Widths
) {
  for (const grid of ['native', 'mach'] as const)
    soft(stored[grid], `${grid} 持久化归属`).toBeCloseTo(expected[grid], 1)
}

test('同一浏览器真实退出登录后，两种表格的A/B偏好分别恢复且不串写', async ({
  page,
}, info) => {
  test.setTimeout(180000)
  await page.goto('/#/login')
  const documentOrigin = await page.evaluate(() => performance.timeOrigin)
  await login(page, 'CHENY')
  const defaults = await checkWidths(page)
  const a = {
    native: await resizeGrid(page, 'native', 84),
    mach: await resizeGrid(page, 'mach', 52),
  }
  const storageA = await preferenceStorage(page)
  await logout(page)
  await login(page, 'admin')
  const bDefaults = await checkWidths(page, defaults)
  const b = {
    native: await resizeGrid(page, 'native', 36),
    mach: await resizeGrid(page, 'mach', 26),
  }
  const storageB = await preferenceStorage(page)
  await logout(page)
  await login(page, 'CHENY')
  const restoredA = await checkWidths(page, a)
  const aSaved = await storedWidths(page, preferenceKeys('cheny'))
  expectStoredWidths(aSaved, a)
  const bSaved = await storedWidths(page, preferenceKeys('admin'))
  expectStoredWidths(bSaved, b)
  await logout(page)
  await login(page, 'admin')
  const restoredB = await checkWidths(page, b)
  await info.attach('account-widths-and-storage.json', {
    body: JSON.stringify(
      {
        defaults,
        a,
        bDefaults,
        b,
        restoredA,
        restoredB,
        storageA,
        storageB,
        final: await preferenceStorage(page),
      },
      null,
      2
    ),
    contentType: 'application/json',
  })
  await page.screenshot({ path: info.outputPath('account-admin-restored.png') })
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentOrigin)
})

test('同一账号通过公司选择器切换后，两表公司偏好独立且返回原公司恢复', async ({
  page,
}, info) => {
  test.setTimeout(180000)
  await page.goto('/#/login')
  const documentOrigin = await page.evaluate(() => performance.timeOrigin)
  await login(page, 'CHENY')
  const defaults = await checkWidths(page)
  const nanjing = {
    native: await resizeGrid(page, 'native', 58),
    mach: await resizeGrid(page, 'mach', 46),
  }
  await switchCompany(page, '西安')
  const xianDefaults = await checkWidths(page, defaults)
  const xian = {
    native: await resizeGrid(page, 'native', 25),
    mach: await resizeGrid(page, 'mach', 29),
  }
  await switchCompany(page, '南京')
  const restoredNanjing = await checkWidths(page, nanjing)
  expectStoredWidths(await storedWidths(page, preferenceKeys('cheny')), nanjing)
  expectStoredWidths(
    await storedWidths(page, preferenceKeys('cheny', 'xian')),
    xian
  )
  await switchCompany(page, '西安')
  const restoredXian = await checkWidths(page, xian)
  await info.attach('company-widths-and-storage.json', {
    body: JSON.stringify(
      {
        defaults,
        nanjing,
        xianDefaults,
        xian,
        restoredNanjing,
        restoredXian,
        storage: await preferenceStorage(page),
      },
      null,
      2
    ),
    contentType: 'application/json',
  })
  await page.screenshot({ path: info.outputPath('account-xian-restored.png') })
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentOrigin)
})

test('无身份范围的旧偏好键不被新会话读取、迁移或覆写', async ({
  page,
}, info) => {
  test.setTimeout(90000)
  const legacy = {
    native: 'c_table_cols_production-sales:shipping:tasks:v1',
    mach: 'mach-table:grid-state:robot-admin:demo:mach-table:orders:v3',
  }
  const values = {
    native: JSON.stringify({ columns: [{ key: 'customer', width: 777 }] }),
    mach: JSON.stringify({
      schemaVersion: 2,
      savedAt: 1,
      state: {
        version: 2,
        columns: [
          { colId: 'orderNo', width: 777, widthMode: 'manual', pinned: 'left' },
        ],
        sortModel: [],
        filterModel: {},
        advancedFilterModel: null,
        quickFilterText: null,
        pagination: { enabled: true, page: 1, pageSize: 20 },
        selectedRowIds: [],
        expandedRowIds: [],
        expandedGroupIds: [],
      },
    }),
  }
  await page.addInitScript(
    ({ legacy, values }) => {
      localStorage.setItem(legacy.native, values.native)
      localStorage.setItem(legacy.mach, values.mach)
    },
    { legacy, values }
  )
  await page.goto('/#/login')
  const documentOrigin = await page.evaluate(() => performance.timeOrigin)
  await login(page, 'CHENY')
  const widths = await checkWidths(page)
  soft(widths.native).not.toBeCloseTo(777, 0)
  soft(widths.mach).not.toBeCloseTo(777, 0)
  const unchanged = await page.evaluate(
    keys => ({
      native: localStorage.getItem(keys.native),
      mach: localStorage.getItem(keys.mach),
    }),
    legacy
  )
  soft(unchanged).toEqual(values)
  await info.attach('account-legacy-storage.json', {
    body: JSON.stringify(
      { widths, legacy, unchanged, storage: await preferenceStorage(page) },
      null,
      2
    ),
    contentType: 'application/json',
  })
  await page.screenshot({ path: info.outputPath('account-legacy-ignored.png') })
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentOrigin)
})
