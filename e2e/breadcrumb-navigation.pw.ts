/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\e2e\breadcrumb-navigation.pw.ts
 * @Description: 面包屑目录导航、键盘退出、真实路由与窄屏长路径回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const tablePath = '/demo/table-manage/table'
const expandedTablePath = '/demo/table-manage/table-expand'

/** 只通过公开导航语义查找组件，弹层可正常传送到 body。 */
const breadcrumb = (page: Page) =>
  page.getByRole('navigation', { name: '面包屑', exact: true })
const panel = (page: Page) => page.locator('.c-breadcrumb-panel')

/** 等待真实入场透明度稳定，截图不捕获半透明的过渡帧。 */
async function expectPanelReady(page: Page) {
  await expect(panel(page)).toBeVisible()
  await expect
    .poll(() =>
      panel(page).evaluate(element => {
        let opacity = 1
        for (
          let ancestor: Element | null = element;
          ancestor;
          ancestor = ancestor.parentElement
        ) {
          opacity = Math.min(
            opacity,
            Number(getComputedStyle(ancestor).opacity)
          )
        }
        return opacity
      })
    )
    .toBeGreaterThanOrEqual(0.99)
}

/** 浮层背景和边界必须完整留在视口内，不能靠裁切隐藏长菜单。 */
async function expectPanelInViewport(page: Page) {
  await expectPanelReady(page)
  const bounds = await page
    .locator('.c-breadcrumb-popover')
    .evaluate(element => {
      const box = element.getBoundingClientRect()
      return { left: box.left, right: box.right, viewport: innerWidth }
    })
  expect(bounds.left).toBeGreaterThanOrEqual(0)
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport)
}

/** 同时检查真实页面宽度与当前项的可见边界，避免容器裁切掩盖溢出。 */
async function expectContainedBreadcrumb(page: Page) {
  const current = breadcrumb(page).locator('[aria-current="page"]')
  await expect(current).toBeVisible()
  // ResizeObserver 与侧栏响应状态会异步收敛，按真实边界等待而非固定延时。
  await expect
    .poll(() =>
      breadcrumb(page).evaluate(nav => {
        const navBox = nav.getBoundingClientRect()
        const currentBox = nav
          .querySelector('[aria-current="page"]')!
          .getBoundingClientRect()
        return {
          navHasWidth: navBox.width > 0,
          currentHasWidth: currentBox.width > 0,
          leftContained: currentBox.left >= navBox.left - 1,
          rightContained: currentBox.right <= navBox.right + 1,
        }
      })
    )
    .toEqual({
      navHasWidth: true,
      currentHasWidth: true,
      leftContained: true,
      rightContained: true,
    })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
})

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} 父目录展示可访问页面，当前项静态高亮，选择后实际导航`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      mode => localStorage.setItem('theme-mode', mode),
      theme
    )
    await page.goto(`/#${tablePath}`)
    await expect(page.locator('.layout-header')).toHaveClass(
      new RegExp(`${theme}-theme`)
    )
    const nav = breadcrumb(page)
    const current = nav.locator('[aria-current="page"]')
    await expect(current).toHaveText('超级表格')
    await expect(current).toHaveJSProperty('tagName', 'SPAN')
    const directory = nav.getByRole('button', {
      name: '表格模块',
      exact: true,
    })
    await expect(directory).toHaveAttribute('aria-haspopup', 'tree')
    await expect(directory).toHaveAttribute('aria-expanded', 'false')
    await directory.click()
    await expect(directory).toHaveAttribute('aria-expanded', 'true')
    await expect(panel(page).getByRole('heading')).toHaveText('表格模块')
    await expect(panel(page)).toContainText(/4\s*个页面/)
    const selectedPage = panel(page).locator('[aria-current="page"]')
    await expect(selectedPage).toHaveCount(1)
    await expect(selectedPage).toContainText('超级表格')
    await expect(selectedPage).toHaveAttribute('aria-current', 'page')
    await expect(selectedPage).toBeDisabled()
    await expectContainedBreadcrumb(page)
    await expectPanelReady(page)
    await page.screenshot({ path: info.outputPath(`breadcrumb-${theme}.png`) })

    await panel(page)
      .getByRole('treeitem', { name: 'Expand表格', exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`#${expandedTablePath}$`))
    await expect(page.locator('.table-expand-demo')).toBeVisible()
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Expand表格')
    await expect(panel(page)).toBeHidden()
  })
}

test('Escape 返回触发焦点，切换目录和历史导航关闭旧菜单', async ({ page }) => {
  await page.goto(`/#${tablePath}`)
  let directory = breadcrumb(page).getByRole('button', {
    name: '表格模块',
    exact: true,
  })
  const ancestor = breadcrumb(page).getByRole('button', {
    name: '示范组件',
    exact: true,
  })
  await ancestor.click()
  await expect(panel(page).getByRole('heading')).toHaveText('示范组件')
  await directory.click()
  await expect(ancestor).toHaveAttribute('aria-expanded', 'false')
  await expect(panel(page).getByRole('heading')).toHaveText('表格模块')
  await expect(panel(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel(page)).toBeHidden()
  await expect(directory).toHaveAttribute('aria-expanded', 'false')
  await expect(directory).toBeFocused()

  await directory.click()
  await panel(page)
    .getByRole('treeitem', { name: 'Expand表格', exact: true })
    .click()
  await expect(page).toHaveURL(new RegExp(`#${expandedTablePath}$`))
  directory = breadcrumb(page).getByRole('button', {
    name: '表格模块',
    exact: true,
  })
  await directory.click()
  await expect(panel(page)).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`#${tablePath}$`))
  await expect(panel(page)).toBeHidden()
  await expect(breadcrumb(page).locator('[aria-current="page"]')).toHaveText(
    '超级表格'
  )
})

test('同页仅 query 变化也关闭菜单，当前路径和页面保持不变', async ({
  page,
}) => {
  await page.goto(`/#${tablePath}`)
  const directory = breadcrumb(page).getByRole('button', {
    name: '表格模块',
    exact: true,
  })
  await directory.click()
  await expect(panel(page)).toBeVisible()
  const queryPath = `${tablePath}?breadcrumbQuery=1`
  await page.evaluate(path => {
    location.hash = path
  }, queryPath)
  await expect(page).toHaveURL(
    /#\/demo\/table-manage\/table\?breadcrumbQuery=1$/
  )
  await expect(panel(page)).toBeHidden()
  await expect(directory).toHaveAttribute('aria-expanded', 'false')
  await expect(breadcrumb(page).locator('[aria-current="page"]')).toHaveText(
    '超级表格'
  )
  await expect(page.locator('.table-demo-page')).toBeVisible()
})

test('窄屏保留当前页，可展开省略的完整路径且不横向溢出', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/#${tablePath}`)
  await expectContainedBreadcrumb(page)
  const fullPath = breadcrumb(page).getByRole('button', {
    name: '展开完整路径',
    exact: true,
  })
  await expect(fullPath).toBeVisible()
  await fullPath.click()
  await expect(panel(page)).toBeVisible()
  await expect(panel(page)).toContainText('超级表格')
  await expectPanelInViewport(page)
  await page.screenshot({ path: info.outputPath('breadcrumb-narrow.png') })
  await page.keyboard.press('Escape')
  await expect(fullPath).toBeFocused()
  await expectContainedBreadcrumb(page)
})

test('远端长标题深菜单直接接入，窄容器仍可完整访问授权路径', async ({
  page,
}, info) => {
  const currentTitle = '华东交付中心跨区域协同与生产排程工作台'
  const path = '/breadcrumb-workspace/delivery/regional/schedule'
  // 从公开 HTTP 菜单响应提供长路径；组件与 Store 内部状态保持真实运行。
  const menus = [
    {
      path: '/breadcrumb-workspace',
      name: 'breadcrumb-workspace',
      component: 'layout',
      meta: { title: '企业生产交付与跨区域协作工作空间' },
      children: [
        {
          path: 'delivery',
          name: 'breadcrumb-delivery',
          meta: { title: '交付管理与订单执行协调中心' },
          children: [
            {
              path: 'regional',
              name: 'breadcrumb-regional',
              meta: { title: '跨区域生产排程与业务协同管理' },
              children: [
                {
                  path: 'schedule',
                  name: 'breadcrumb-schedule',
                  component: '/demo/01-icon/index',
                  meta: { title: currentTitle },
                },
                {
                  path: 'review',
                  name: 'breadcrumb-review',
                  component: '/demo/01-icon/index',
                  meta: { title: '交付评审' },
                },
              ],
            },
            {
              path: 'overview',
              name: 'breadcrumb-delivery-overview',
              component: '/demo/01-icon/index',
              meta: { title: '交付概览' },
            },
          ],
        },
        {
          path: 'overview',
          name: 'breadcrumb-workspace-overview',
          component: '/demo/01-icon/index',
          meta: { title: '工作空间概览' },
        },
      ],
    },
  ]
  await page.route('**/api/**', route => {
    const { pathname } = new URL(route.request().url())
    const data = pathname.endsWith('/auth/menu-list')
      ? menus
      : pathname.endsWith('/auth/button-list')
        ? {}
        : []
    return route.fulfill({ json: { code: 0, data } })
  })
  await page.goto(`http://127.0.0.1:4174/#${path}`)
  await expect(breadcrumb(page).locator('[aria-current="page"]')).toHaveText(
    currentTitle
  )
  await expectContainedBreadcrumb(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expectContainedBreadcrumb(page)
  const fullPath = breadcrumb(page).getByRole('button', {
    name: '展开完整路径',
    exact: true,
  })
  await fullPath.click()
  await expect(panel(page)).toContainText(currentTitle)
  await expect(panel(page)).toContainText(/4\s*个页面/)
  const regional = panel(page).getByRole('treeitem', {
    name: /跨区域生产排程与业务协同管理/,
  })
  const selectedPage = panel(page).locator('[aria-current="page"]')
  await expect(selectedPage).toHaveCount(1)
  await expect(selectedPage).toContainText(currentTitle)
  await expect(regional).toHaveAttribute('aria-expanded', 'true')
  await regional.click()
  await expect(regional).toHaveAttribute('aria-expanded', 'false')
  await expect(selectedPage).toBeHidden()
  await regional.click()
  await expect(selectedPage).toBeVisible()
  await expect(selectedPage).toBeDisabled()
  await expectPanelInViewport(page)
  await page.screenshot({ path: info.outputPath('breadcrumb-long-path.png') })
  await panel(page)
    .getByRole('treeitem', { name: '交付评审', exact: true })
    .click()
  await expect(page).toHaveURL(
    /#\/breadcrumb-workspace\/delivery\/regional\/review$/
  )
  await expect(breadcrumb(page).locator('[aria-current="page"]')).toHaveText(
    '交付评审'
  )
  await expectContainedBreadcrumb(page)
})
