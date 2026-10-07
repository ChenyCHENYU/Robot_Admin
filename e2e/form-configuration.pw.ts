/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @FilePath: \Robot_Admin\e2e\form-configuration.pw.ts
 * @Description: 正式组件包表单配置、默认操作与跨字段校验回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/demo/form-manage/form')
  await expect(page.locator('.form-section .n-form')).toBeVisible()
})

test('默认按钮使用正式验证规则，成功只报告演示结果，重置清空模型', async ({
  page,
}) => {
  const form = page.locator('.form-section .n-form')
  const submit = form.getByRole('button', { name: /提交表单$/ })
  await submit.click()
  await expect(
    form.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await expect(
    page.getByText('已接收表单数据（演示，不会持久化）')
  ).toHaveCount(0)

  await page.getByRole('button', { name: '填充测试', exact: true }).click()
  await submit.click()
  await expect(
    page.getByText('已接收表单数据（演示，不会持久化）')
  ).toHaveCount(1)
  await form.getByRole('button', { name: '重置表单', exact: true }).click()
  await expect(form.getByPlaceholder('请输入用户名')).toHaveValue('')
  await expect(form.getByPlaceholder('请输入邮箱地址')).toHaveValue('')
})

for (const layout of [
  { name: '网格布局', extra: '预览布局', preview: '.layout-preview-modal' },
  { name: '动态布局', extra: '预览数据', preview: '.preview-section' },
]) {
  test(`${layout.name}额外操作保留默认提交按钮`, async ({ page }) => {
    await page
      .locator('.layout-buttons')
      .getByRole('button', { name: layout.name, exact: true })
      .click()
    const form = page.locator('.form-section .n-form')
    await expect(
      form.getByRole('button', { name: '重置表单', exact: true })
    ).toHaveCount(1)
    await expect(form.getByRole('button', { name: /提交表单$/ })).toHaveCount(1)
    await form.getByRole('button', { name: layout.extra, exact: true }).click()
    await expect(page.locator(layout.preview)).toBeVisible()
  })
}

test('步骤表单逐步校验，密码必须一致，最后一步只有一个默认提交按钮', async ({
  page,
}) => {
  await page
    .locator('.layout-buttons')
    .getByRole('button', { name: '步骤布局', exact: true })
    .click()
  const form = page.locator('.form-section .n-form')
  const next = form.getByRole('button', { name: /下一步/ })
  await next.click()
  await expect(form.getByText('姓名不能为空', { exact: true })).toBeVisible()
  await form.getByPlaceholder('请输入姓名', { exact: true }).fill('表单测试')
  await form.getByPlaceholder('请输入身份证号').fill('110101199001010010')
  await form.getByText('男', { exact: true }).click()
  await expect(
    form.getByRole('radio', { name: '男', exact: true })
  ).toBeChecked()
  await next.click()
  await form.getByPlaceholder('请输入手机号码').fill('13800138000')
  await form.getByPlaceholder('请输入邮箱地址').fill('hello@example.com')
  await next.click()
  await form.getByPlaceholder('请输入密码', { exact: true }).fill('Demo123456')
  await form.getByPlaceholder('请再次输入密码').fill('different123')
  await next.click()
  await expect(
    form.getByText('两次输入密码不一致', { exact: true })
  ).toBeVisible()
  await form.getByPlaceholder('请再次输入密码').fill('Demo123456')
  await next.click()
  const submit = form.getByRole('button', { name: /提交表单$/ })
  await expect(submit).toHaveCount(1)
  await submit.click()
  await expect(form.getByText('协议不能为空', { exact: true })).toBeVisible()
  await expect(
    page.getByText('已接收表单数据（演示，不会持久化）')
  ).toHaveCount(0)
  await form
    .getByRole('checkbox', { name: '我已阅读并同意《用户协议》', exact: true })
    .check()
  await form
    .getByRole('checkbox', { name: '我已阅读并同意《隐私政策》', exact: true })
    .check()
  await submit.click()
  await expect(
    page.getByText('已接收表单数据（演示，不会持久化）')
  ).toHaveCount(1)
})

test('自定义布局由组件等待异步业务完成，并阻止重复提交', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page
    .locator('.layout-buttons')
    .getByRole('button', { name: '自定义渲染', exact: true })
    .click()
  const actions = page.locator('.custom-layout-demo .demo-actions')
  await page.getByRole('button', { name: /垂直区域/ }).click()
  await page
    .locator('.field-pool .pool-field')
    .filter({ hasText: '员工编号' })
    .dragTo(page.locator('.custom-area .area-fields'))
  await expect(page.locator('.custom-area .field-item')).toHaveCount(1)
  await page.getByRole('button', { name: /填写模式/ }).click()
  await expect(actions.getByText('字段: 1', { exact: true })).toBeVisible()
  await actions.getByRole('button', { name: /填充测试数据/ }).click()
  const submit = actions.getByRole('button', { name: /提交表单/ })
  await submit.click()
  await expect(submit).toHaveClass(/n-button--loading/)
  await expect(
    actions.getByRole('button', { name: /填充测试数据/ })
  ).toBeDisabled()
  await expect(actions.getByRole('button', { name: /清空表单/ })).toBeDisabled()
  await expect(
    page.getByText('已接收表单数据（演示，不会持久化）')
  ).toHaveCount(0)
  await submit.click({ force: true })
  await expect(
    page.getByText('已接收表单数据（演示，不会持久化）')
  ).toHaveCount(1)
  await expect(submit).not.toHaveClass(/n-button--loading/)
  expect(errors).toEqual([])
})
