/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\e2e\component-theme.pw.ts
 * @Description: 正式组件主题在应用搜索、原生控件与 body 用户弹层中的真实颜色回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

for (const initialMode of ['light', 'dark'] as const) {
  test(`${initialMode} 自定义品牌与圆角贯穿页面，换肤保留搜索草稿且浮层同源`, async ({
    page,
  }, info) => {
    await installMockAdminSession(page)
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.addInitScript(mode => {
      localStorage.setItem('theme-mode', mode)
      localStorage.setItem('robot-admin-design-style', 'corporate-minimal')
      localStorage.setItem(
        'robot-admin-appearance-settings',
        JSON.stringify({
          schemaVersion: 1,
          primaryColor: '#a16207',
          borderRadius: 'large',
        })
      )
    }, initialMode)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/#/demo/form-manage/form-search')
    const form = page.locator('.form-search-demo .form-search-card').first()
    const input = form.locator('input').first()
    await expect(input).toBeVisible()
    await input.fill('主题切换保留条件')
    await expect(form).toHaveCSS('--c-theme-primary', '#a16207')
    await expect(page.locator('html')).toHaveCSS('--app-primary', '#a16207')
    // 紧凑字段消费工厂的小控件圆角：项目 8px 对应 small 6px。
    await expect(form.locator('.n-input').first()).toHaveCSS(
      '--n-border-radius',
      '6px'
    )
    await page.locator('[data-guide="theme"] button').click()
    const mode = initialMode === 'light' ? 'dark' : 'light'
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode)
    await expect(input).toHaveValue('主题切换保留条件')
    await expect(form.locator('.n-input').first()).toHaveCSS(
      'background-color',
      mode === 'dark' ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)'
    )
    await expect(form).toHaveCSS('--c-theme-primary', '#a16207')
    await page.locator('.navbar-right .user-info').click()
    const panel = page.locator('.user-panel')
    await expect(panel).toBeVisible()
    await expect(panel).toHaveCSS(
      'background-color',
      mode === 'dark' ? 'rgb(37, 50, 70)' : 'rgb(255, 255, 255)'
    )
    expect(
      await panel.evaluate(element =>
        element.closest('.global-config-provider')
      )
    ).toBeNull()
    await page.screenshot({ path: info.outputPath(`theme-${mode}.png`) })
    expect(errors).toEqual([])
  })
}

test('姓名建议可键盘选择和自由输入，清空恢复本地记录', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/demo/form-manage/form-search')
  const section = page.locator('.suggestion-search-demo')
  const input = page.getByRole('textbox', { name: '姓名建议搜索' })
  await input.fill('张')
  await expect(
    page.locator('.n-auto-complete-menu').getByText('张三', { exact: true })
  ).toBeVisible()
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(input).toHaveValue('张三')
  await expect(section.locator('tbody tr')).toHaveCount(1)
  await input.fill('不存在的姓名')
  await expect(section).toContainText('当前匹配 0 条记录')
  await input.fill('')
  await expect(section.locator('tbody tr')).toHaveCount(3)
})

test('组织选人通过真实候选行确认、取消与清空', async ({ page }, info) => {
  await installMockAdminSession(page)
  await page.goto('/#/plugins/orgchart')
  const trigger = page.getByRole('button', {
    name: '选择协作成员',
    exact: true,
  })
  const panel = page.locator('.c-data-picker__panel')
  const result = page.getByRole('region', { name: '协作成员' })
  await trigger.click()
  await expect(panel.getByText('组织范围', { exact: true })).toBeVisible()
  const person = panel.getByRole('row').filter({ hasText: '赵工' })
  await person.getByRole('checkbox').check()
  await panel.getByRole('button', { name: '确定', exact: true }).click()
  await expect(result).toContainText('已确认 1 名协作成员')
  await expect(result).toContainText('赵工')
  await trigger.click()
  await expect(panel.locator('.c-data-picker__selected-panel')).toContainText(
    '赵工'
  )
  await page.screenshot({ path: info.outputPath('organization-picker.png') })
  await panel
    .getByRole('row')
    .filter({ hasText: '王主管' })
    .getByRole('checkbox')
    .check()
  await panel.getByRole('button', { name: '取消', exact: true }).click()
  await expect(result).toContainText('已取消本次选择')
  await expect(result).not.toContainText('王主管')
  await trigger.click()
  await person.getByRole('checkbox').uncheck()
  await panel.getByRole('button', { name: '确定', exact: true }).click()
  await expect(result).toContainText('已清空协作成员')
})

for (const density of ['紧凑', '标准', '舒适']) {
  test(`${density} 展开功能列与序号紧邻，仍可展开子表`, async ({
    page,
  }, info) => {
    await installMockAdminSession(page)
    await page.goto('/#/demo/table-manage/table-expand')
    await expect(page.locator('.app-loading')).toBeHidden()
    const demo = page.locator('.table-expand-demo')
    const table = demo.locator('.c-table-wrapper').first()
    const row = table.locator('tbody tr').first()
    await expect(row).toBeVisible()
    await demo
      .locator('label.n-radio-button')
      .filter({
        has: page.getByRole('radio', { name: density, exact: true }),
      })
      .click()
    // 检查实际像素，避免只验证配置宽度而忽略页面 CSS 的二次拉伸。
    const geometry = await row.evaluate(element => {
      const index = element
        .querySelector('[data-col-key="_index"]')!
        .getBoundingClientRect()
      const arrow = element.querySelector('.n-data-table-expand-trigger')!
      const expand = arrow.closest('td')!.getBoundingClientRect()
      const trigger = arrow.getBoundingClientRect()
      return {
        totalWidth: expand.width + index.width,
        cellGap: Math.abs(index.left - expand.right),
        centerDistance:
          index.left + index.width / 2 - trigger.left - trigger.width / 2,
      }
    })
    expect(geometry.totalWidth).toBeLessThanOrEqual(100)
    expect(geometry.cellGap).toBeLessThan(1)
    expect(geometry.centerDistance).toBeLessThanOrEqual(55)
    await row.locator('.n-data-table-expand-trigger').click()
    await expect(demo.locator('.n-data-table')).toHaveCount(2)
    await page.screenshot({ path: info.outputPath('table-expand-spacing.png') })
  })
}
