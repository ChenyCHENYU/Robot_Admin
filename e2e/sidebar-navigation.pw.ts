/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\e2e\sidebar-navigation.pw.ts
 * @Description: 真实侧栏几何、选中语义、主题、收起宽度与布局隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 等待有限的展开/颜色过渡完成，截图不记录中间帧。 */
async function settleNavigation(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter(
        animation =>
          animation.effect?.getComputedTiming().iterations !== Infinity
      )
    await Promise.all(
      finite.map(animation => animation.finished.catch(() => undefined))
    )
  })
}

/** 只找本区域的真实行内容，不把相同标题的面包屑或标签页混入断言。 */
function menuItem(menu: Locator, title: string): Locator {
  return menu
    .locator('.n-menu-item-content')
    .filter({ hasText: new RegExp(`^${title}$`) })
}

/** 通过设置抽屉的公开导入功能改变布局，避免直接操作 Vue 私有实例。 */
async function importLayoutSettings(
  page: Page,
  settings: Record<string, unknown>
): Promise<void> {
  await page.getByRole('button', { name: '布局配置', exact: true }).click()
  await page.locator('.n-drawer').getByText('🔧 功能', { exact: true }).click()
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '导入配置', exact: true }).click()
  await (
    await chooser
  ).setFiles({
    name: 'sidebar-regression.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, settings })),
  })
  await expect(
    page.getByText('配置已导入', { exact: true }).last()
  ).toBeVisible()
  await page.locator('.n-drawer-header__close').click()
  await expect(page.locator('.n-drawer')).toBeHidden()
}

for (const variant of [
  { menu: 'signature', mode: 'light', primary: '#2080f0' },
  { menu: 'standard', mode: 'light', primary: '#a16207' },
  { menu: 'standard', mode: 'dark', primary: '#2080f0' },
] as const) {
  test(`${variant.menu}/${variant.mode} 菜单保持统一几何与唯一当前页强调`, async ({
    page,
  }, info) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await installMockAdminSession(page)
    await page.setViewportSize({ width: 1440, height: 1200 })
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.addInitScript(value => {
      localStorage.setItem('theme-mode', value.mode)
      localStorage.setItem('robot-admin-menu-theme', value.menu)
      localStorage.setItem('robot-admin-design-style', 'corporate-minimal')
      localStorage.setItem(
        'robot-admin-appearance-settings',
        JSON.stringify({ schemaVersion: 1, primaryColor: value.primary })
      )
    }, variant)
    await page.goto('/#/production-sales/shipping')
    await expect(page.locator('.app-loading')).toBeHidden()
    const navigation = page.getByRole('navigation', {
      name: '主导航',
      exact: true,
    })
    const selected = menuItem(navigation, '发运协同指挥台')
    await expect(selected).toHaveClass(/--selected/)
    await menuItem(navigation, '示范组件').click()
    await menuItem(navigation, '表格模块').click()
    await page.mouse.move(1000, 10)
    await settleNavigation(page)

    const titles = ['产销业务', '生产计划调度', '超级表格']
    const geometry = await Promise.all(
      titles.map(async title =>
        menuItem(navigation, title).evaluate(element => {
          const rect = element.getBoundingClientRect()
          const style = getComputedStyle(element)
          return {
            height: rect.height,
            outerHeight: element.parentElement!.getBoundingClientRect().height,
            left: rect.left,
            right: rect.right,
            padding: Number.parseFloat(style.paddingLeft),
            shadow: style.boxShadow,
            filter: style.backdropFilter,
          }
        })
      )
    )
    for (const row of geometry) {
      expect(row.height).toBe(36)
      expect(row.outerHeight).toBe(36)
      expect(row.left).toBeCloseTo(geometry[0]!.left, 1)
      expect(row.right).toBeCloseTo(geometry[0]!.right, 1)
      expect(row.shadow).toBe('none')
      expect(row.filter).toBe('none')
    }
    expect(geometry.map(row => row.padding)).toEqual([20, 36, 52])
    await expect(selected.locator('svg').first()).toBeVisible()
    expect((await selected.locator('svg').first().boundingBox())!.width).toBe(
      18
    )
    const states = await selected.evaluate(element => {
      const parent = element
        .closest('.n-submenu')!
        .querySelector('.n-menu-item-content')!
      return {
        active: getComputedStyle(element, '::before').backgroundColor,
        parent: getComputedStyle(parent, '::before').backgroundColor,
        marker: getComputedStyle(element, '::after').width,
        markerColor: getComputedStyle(element, '::after').backgroundColor,
      }
    })
    expect(states.active).not.toBe('rgba(0, 0, 0, 0)')
    expect(states.parent).toBe('rgba(0, 0, 0, 0)')
    expect(states.marker).toBe('2px')
    expect(states.markerColor).not.toBe('rgba(0, 0, 0, 0)')
    await expect(page.locator('html')).toHaveCSS(
      '--app-primary',
      variant.primary
    )
    await selected.hover()
    await expect(selected).toHaveCSS('transform', 'none')
    await page.mouse.move(1000, 10)
    await settleNavigation(page)
    const logoTop = (await page.locator('.menu-top').boundingBox())!.y
    await menuItem(navigation, '关于').scrollIntoViewIfNeeded()
    expect((await page.locator('.menu-top').boundingBox())!.y).toBe(logoTop)
    await navigation.evaluate(element => {
      element.scrollTop = 0
      let parent = element.parentElement
      while (parent) {
        parent.scrollTop = 0
        parent = parent.parentElement
      }
    })
    await page.locator('.layout-sider').screenshot({
      path: info.outputPath(`sidebar-${variant.menu}-${variant.mode}.png`),
    })
    if (variant.menu === 'signature')
      await page.screenshot({ path: info.outputPath('desktop-sidebar.png') })
    expect(errors).toEqual([])
  })
}

test('自定义收起宽度保持图标和品牌同心，展开后可正常导航', async ({
  page,
}, info) => {
  await installMockAdminSession(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/production-sales/shipping')
  await expect(page.locator('.app-loading')).toBeHidden()
  await importLayoutSettings(page, {
    sidebarCollapsedWidth: 96,
    sidebarWidth: 220,
  })
  await page.getByRole('button', { name: '收起菜单', exact: true }).click()
  const sider = page.locator('.layout-sider')
  const menu = page.locator('[data-ra-sidebar-menu]').first()
  await expect(menu).toHaveClass(/n-menu--collapsed/)
  await settleNavigation(page)
  const centers = await sider.evaluate(element => {
    const rect = element.getBoundingClientRect()
    const logo = element
      .querySelector('.menu-top__logo')!
      .getBoundingClientRect()
    const icon = element
      .querySelector('[data-ra-sidebar-menu] .n-menu-item-content__icon')!
      .getBoundingClientRect()
    return {
      width: rect.width,
      center: rect.left + rect.width / 2,
      logo: logo.left + logo.width / 2,
      icon: icon.left + icon.width / 2,
    }
  })
  expect(centers.width).toBe(96)
  expect(Math.abs(centers.logo - centers.center)).toBeLessThanOrEqual(1)
  expect(Math.abs(centers.icon - centers.center)).toBeLessThanOrEqual(1)
  await expect(sider.locator('.menu-top__copy')).toHaveCount(0)
  await sider.screenshot({ path: info.outputPath('sidebar-collapsed-96.png') })
  await menuItem(page.locator('#guide-menu'), '产销业务').hover()
  const flyout = page
    .locator('.n-dropdown-menu')
    .filter({ hasText: '生产计划调度' })
  await expect(flyout).toBeVisible()
  const popupBox = (await flyout.boundingBox())!
  const siderBox = (await sider.boundingBox())!
  expect(popupBox.x).toBeGreaterThanOrEqual(siderBox.x + siderBox.width)
  await flyout.getByText('生产计划调度', { exact: true }).click()
  await expect(page).toHaveURL(/#\/production-sales\/production-plan$/)
  await expect(menu).toHaveClass(/n-menu--collapsed/)
  await page.getByRole('button', { name: '展开菜单', exact: true }).click()
  await expect(sider.locator('.menu-top__title')).toHaveText('Robot Admin')
  await menuItem(page.locator('#guide-menu'), '生产计划调度').click()
  await expect(page).toHaveURL(/#\/production-sales\/production-plan$/)
  await expect(
    menuItem(page.locator('#guide-menu'), '生产计划调度')
  ).toHaveClass(/--selected/)
})

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} 横向布局与右侧面板保留标准菜单行为`, async ({ page }) => {
    await installMockAdminSession(page)
    await page.addInitScript(value => {
      localStorage.setItem('theme-mode', value)
      localStorage.setItem('robot-admin-menu-theme', 'standard')
      localStorage.setItem('robot-admin-design-style', 'corporate-minimal')
    }, mode)
    await page.goto('/#/production-sales/shipping')
    await expect(page.locator('.app-loading')).toBeHidden()
    await importLayoutSettings(page, { layoutMode: 'top' })
    await expect(
      page.locator('.responsive-menu .n-menu--horizontal')
    ).toBeVisible()
    await expect(page.locator('[data-ra-sidebar-menu]')).toHaveCount(0)
    const topItem = page
      .locator('.responsive-menu .n-menu-item-content')
      .first()
    await topItem.hover()
    await expect(topItem).toHaveCSS('backdrop-filter', 'none')
    await expect(
      page.locator('.responsive-menu .n-menu-item').first()
    ).toHaveCSS('transform', 'none')
    await importLayoutSettings(page, {
      layoutMode: 'side',
      menuExpandMode: 'panel',
    })
    await expect(page.locator('#guide-menu .mg')).toBeVisible()
    await expect(page.locator('[data-ra-sidebar-menu]')).toHaveCount(0)
    await page
      .locator('#guide-menu')
      .getByRole('button', { name: '产销业务', exact: true })
      .click()
    await expect(
      page.getByRole('region', { name: '产销业务 子菜单', exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: '关闭子菜单', exact: true }).click()
    await expect(page.locator('.mg-panel')).toHaveCount(0)
  })
}
