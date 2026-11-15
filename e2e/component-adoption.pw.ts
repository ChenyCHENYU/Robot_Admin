/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @Description: 正式组件包的父子选择与按钮分隔方向消费回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
})

test('自定义子表由正式包联动，严格、宽松和独立选择可实时切换', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#/demo/table-manage/table-expand')
  const view = page.locator('.table-expand-demo')
  await expect(view.locator('.c-table-wrapper tbody tr').first()).toBeVisible()
  const disabledParent = view
    .getByRole('row')
    .filter({ has: page.getByText('王五', { exact: true }) })
    .getByRole('checkbox')
  // Naive Checkbox 在 role 容器上使用禁用类，未提供原生 disabled 属性。
  await expect(disabledParent).toHaveClass(/n-checkbox--disabled/)
  await expect(disabledParent).not.toBeChecked()
  await view
    .locator('.c-table-wrapper thead')
    .first()
    .getByRole('checkbox')
    .click()
  await expect(disabledParent).not.toBeChecked()
  await view.getByRole('button', { name: '清空所有选择', exact: true }).click()
  await view.getByRole('button', { name: '全部展开', exact: true }).click()
  const detail = view.getByRole('region', { name: '张三 的详细信息' })
  const children = detail.locator('tbody').getByRole('checkbox')
  await expect(children).toHaveCount(3)
  // 展开内容与父数据行是相邻的表格行，避免把子表勾选误认作父行状态。
  const parentRow = detail.locator(
    'xpath=ancestor::tr[1]/preceding-sibling::tr[1]'
  )
  const parentCheck = parentRow.getByRole('checkbox')
  const clear = view.getByRole('button', { name: '清空所有选择', exact: true })
  await view
    .getByText('严格模式（子表格全选才选中父行）', { exact: true })
    .click()
  await children.first().click()
  await expect(children.first()).toBeChecked()
  await expect(parentCheck).not.toBeChecked()
  await detail.locator('thead').getByRole('checkbox').click()
  await Promise.all(
    (await children.all()).map(child => expect(child).toBeChecked())
  )
  await expect(parentCheck).toBeChecked()
  await clear.click()
  await expect(parentCheck).not.toBeChecked()
  await Promise.all(
    (await children.all()).map(child => expect(child).not.toBeChecked())
  )
  await view
    .getByText('宽松模式（子表格有选中就选中父行）', { exact: true })
    .click()
  await children.first().click()
  await expect(parentCheck).toBeChecked()
  await children.first().click()
  await expect(parentCheck).not.toBeChecked()
  await view
    .getByRole('checkbox', { name: '启用父表格选择', exact: true })
    .uncheck()
  await expect(parentRow.getByRole('checkbox')).toHaveCount(0)
  await children.first().click()
  await expect(children.first()).toBeChecked()
  await clear.click()
  await expect(children.first()).not.toBeChecked()
  await view
    .getByRole('checkbox', { name: '启用子表格选择', exact: true })
    .uncheck()
  await expect(detail.getByRole('checkbox')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('按钮分隔方向只改变分隔线，保持横向操作与配置状态', async ({ page }) => {
  await page.goto('/#/demo/action-bar')
  const config = page.locator('.action-bar-config')
  const bar = config.locator('.action-bar-config__preview .c-action-bar')
  const divider = bar.locator('.action-divider')
  await expect(bar.locator('button')).toHaveCount(6)
  await expect(
    config.getByRole('radio', { name: '短横线', exact: true })
  ).toBeDisabled()
  await config.getByRole('checkbox', { name: '分隔线', exact: true }).check()
  await expect(divider).toHaveCount(5)
  await expect(divider.first()).toHaveClass(/n-divider--vertical/)
  await config.getByText('短横线', { exact: true }).click()
  await expect(bar.locator('.action-divider--horizontal')).toHaveCount(5)
  await expect(divider.first()).not.toHaveClass(/n-divider--vertical/)
  const geometry = await divider.first().evaluate(element => ({
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
  }))
  expect(geometry.width).toBe(20)
  expect(geometry.height).toBeLessThan(geometry.width)
  expect(
    await bar
      .locator('button')
      .evaluateAll(
        buttons =>
          new Set(
            buttons.map(button =>
              Math.round(button.getBoundingClientRect().top)
            )
          ).size
      )
  ).toBe(1)
  await config.getByText('竖线', { exact: true }).click()
  await expect(bar.locator('.action-divider--horizontal')).toHaveCount(0)
  await expect(divider.first()).toHaveClass(/n-divider--vertical/)
})
