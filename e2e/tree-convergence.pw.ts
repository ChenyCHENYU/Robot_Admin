/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\tree-convergence.pw.ts
 * @Description: 正式树组件的受控状态、虚拟列表、加载重试和主题布局回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page } from '@playwright/test'

/** 使用免登录预览入口，记录真实运行时错误。 */
const openTreeDemo = async (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/#/preview/tree')
  await expect(page.locator('.tree-demo-page')).toBeVisible()
  await expect(page.locator('.app-loading')).toBeHidden()
  return errors
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
})

test('树受控选择勾选与搜索清空保持独立，禁用节点没有副作用', async ({
  page,
}) => {
  const errors = await openTreeDemo(page)
  const controlled = page.locator('.controlled-tree')
  await page
    .getByRole('button', { name: '外部选择前端组', exact: true })
    .click()
  await expect(page.getByTestId('tree-selected-state')).toHaveText('frontend')
  await expect(controlled.locator('.n-tree-node--selected')).toContainText(
    '前端研发组'
  )
  const web = controlled.locator('.n-tree-node').filter({
    has: page.locator('.c-tree-node-title', { hasText: '企业 Web 应用' }),
  })
  await web.locator('.n-checkbox').click()
  await expect(page.getByTestId('tree-checked-state')).toContainText('web')
  await expect(page.getByTestId('tree-selected-state')).toHaveText('frontend')
  await expect(
    controlled
      .locator('.n-tree-node')
      .filter({ hasText: '已停用部门' })
      .locator('.n-checkbox')
  ).toHaveClass(/n-checkbox--disabled/)
  const search = controlled.getByRole('textbox', {
    name: '搜索树节点',
    exact: true,
  })
  await search.fill('客户服务')
  await expect(controlled).toContainText('客户服务组')
  await expect(controlled).not.toContainText('企业 Web 应用')
  await expect(page.getByTestId('tree-checked-state')).toContainText('web')
  await page
    .getByRole('button', { name: '清空状态与搜索', exact: true })
    .click()
  await expect(search).toHaveValue('')
  await expect(controlled).toContainText('企业 Web 应用')
  await expect(page.getByTestId('tree-checked-state')).toHaveText('未勾选')
  await expect(page.getByTestId('tree-selected-state')).toHaveText('未选择')
  expect(errors).toEqual([])
})

test('2100节点开启真实虚拟化，搜索和外部密度切换维持可见内容', async ({
  page,
}) => {
  const errors = await openTreeDemo(page)
  const virtual = page.locator('.virtual-tree')
  const rows = virtual.locator('.n-tree-node')
  await expect(rows.first()).toBeVisible()
  expect(await rows.count()).toBeLessThan(100)
  const scroller = virtual.locator('.v-vl')
  await expect(scroller).toBeVisible()
  const heights = await rows
    .first()
    .evaluate(element => element.getBoundingClientRect().height)
  expect(heights).toBeCloseTo(28, 0)
  const search = virtual.getByRole('textbox', {
    name: '搜索树节点',
    exact: true,
  })
  await search.fill('1999')
  await expect(virtual).toContainText('项目 1999')
  await page.locator('.density-select').click()
  // Native NSelect renders generic option divs; target its visible exact label.
  const comfortable = page
    .locator('.n-base-select-option:visible')
    .getByText('舒适', { exact: true })
  await expect(comfortable).toBeVisible()
  await comfortable.click()
  await expect(virtual).toHaveClass(/c-tree--comfortable/)
  await expect(search).toHaveValue('1999')
  await expect(virtual).toContainText('项目 1999')
  expect(errors).toEqual([])
})

test('本地懒加载失败后显式重试，重置和离开时不会提交旧数据', async ({
  page,
}) => {
  const errors = await openTreeDemo(page)
  const lazy = page.locator('.lazy-tree')
  await lazy.locator('.n-tree-node-switcher').first().click()
  await expect(page.getByTestId('tree-lazy-error')).toContainText(
    '演示网络暂时不可用'
  )
  await page.getByRole('button', { name: '重新加载', exact: true }).click()
  await expect(lazy).toContainText('项目合同')
  await expect(lazy).toContainText('实施计划')
  await expect(page.getByTestId('tree-lazy-error')).toHaveCount(0)
  await expect(page.locator('.lazy-footer')).toContainText('已发起 2 次加载')
  await page.getByRole('button', { name: '重置演示', exact: true }).click()
  await lazy.locator('.n-tree-node-switcher').first().click()
  await page.getByRole('button', { name: '重置演示', exact: true }).click()
  await expect(page.locator('.lazy-footer')).toContainText('已发起 0 次加载')
  await expect(lazy).not.toContainText('项目合同')
  await expect(page.getByTestId('tree-lazy-error')).toHaveCount(0)
  await lazy.locator('.n-tree-node-switcher').first().click()
  await page.goto('/#/preview/action-bar')
  await expect(page.locator('.tree-demo-page')).toHaveCount(0)
  expect(errors).toEqual([])
})

for (const mode of [
  { theme: 'light', width: 1440 },
  { theme: 'dark', width: 420 },
]) {
  test(`${mode.theme} ${mode.width}px 树主题、长标题和工具栏保持容器内布局`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      theme => localStorage.setItem('theme-mode', theme),
      mode.theme
    )
    await page.setViewportSize({ width: mode.width, height: 1000 })
    const errors = await openTreeDemo(page)
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode.theme)
    const previewBackground = await page
      .locator('.preview-layout')
      .evaluate(element => getComputedStyle(element).backgroundColor)
    expect(previewBackground).toBe(
      mode.theme === 'dark' ? 'rgb(28, 28, 28)' : 'rgb(255, 255, 255)'
    )
    const controlled = page.locator('.controlled-tree')
    expect(
      await controlled.evaluate(
        element => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(1)
    expect(
      await page
        .locator('.tree-demo-page')
        .evaluate(element => element.scrollWidth - element.clientWidth)
    ).toBeLessThanOrEqual(1)
    const theme = await controlled.evaluate(element => {
      const container = element.querySelector('.c-tree-container')!
      const toolbar = element.querySelector('.c-tree-toolbar')!
      const title = element.querySelector(
        '.c-tree-node-title[title*="设计系统"]'
      )!
      return {
        border: getComputedStyle(container).borderColor,
        toolbar: getComputedStyle(toolbar).backgroundColor,
        titleOverflow: getComputedStyle(title).textOverflow,
      }
    })
    expect(theme.toolbar).not.toBe('rgb(250, 250, 250)')
    expect(theme.titleOverflow).toBe('ellipsis')
    await page.screenshot({
      path: testInfo.outputPath(`tree-${mode.theme}.png`),
      fullPage: false,
    })
    expect(errors).toEqual([])
  })
}
