/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\e2e\table-edit-validation.pw.ts
 * @Description: 正式组件包跨编辑模式的必填、自定义规则与功能列组合验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 通过页面公开模式控件切换，不修改组件内部状态。 */
const mode = (page: Page, name: string) =>
  page
    .locator('label.n-radio-button')
    .filter({ has: page.getByRole('radio', { name, exact: true }) })
    .click()

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
  await page.goto('/#/demo/table-manage/table')
  await expect(page.locator('.app-loading')).toBeHidden()
})

test('功能列与弹窗编辑共存，非法姓名邮箱阻止保存，修正后提交成功', async ({
  page,
}) => {
  const table = page.locator('.table-demo-page .c-table-wrapper').first()
  const first = table.locator('tbody tr').first()
  await expect(first).toBeVisible()
  await expect(first.getByRole('checkbox')).toHaveCount(1)
  await expect(first.locator('td[data-col-key="_index"]')).toHaveText('1')
  await first.getByTitle('编辑', { exact: true }).click()
  const modal = page.locator('.n-modal').filter({ hasText: '编辑员工信息' })
  await expect(modal.locator('.c-form-field')).toHaveCount(10)
  await expect(modal).toHaveCSS('transform', 'none')
  await expect(modal).toHaveCSS('width', '700px')
  const gender = modal.locator('.n-select').first()
  await expect(gender).toContainText('女')
  await expect(modal.locator('.n-select').nth(1)).toContainText('技术部')
  await expect(modal.locator('.n-select').nth(2)).toContainText('在职')
  await expect(modal.locator('.n-select').nth(3)).toContainText('初级')
  await gender.click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText('男', { exact: true })
    .click()
  await expect(gender).toContainText('男')
  const name = modal.getByPlaceholder('请输入姓名', { exact: true })
  const email = modal.getByPlaceholder('请输入邮箱地址', { exact: true })
  await name.fill('x')
  await email.fill('not-an-email')
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal).toBeVisible()
  await expect(modal.locator('.n-form-item-feedback')).toContainText([
    '姓名',
    '邮箱',
  ])
  await name.fill('校验通过员工')
  await email.fill('contract@example.com')
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal).toBeHidden()
  await expect(first).toContainText('校验通过员工')
  await expect(first).toContainText('男')
})

test('行编辑的必填与自定义规则生效，失败保留草稿，修正可保存', async ({
  page,
}) => {
  await mode(page, '仅行编辑')
  const row = page
    .locator('.table-demo-page .c-table-wrapper')
    .first()
    .locator('tbody tr')
    .first()
  await row.getByTitle('编辑', { exact: true }).click()
  const name = row.getByPlaceholder('请输入姓名', { exact: true })
  await name.fill('')
  await row.getByTitle('保存', { exact: true }).click()
  await expect(name).toBeVisible()
  await expect(
    page.locator('.n-message').filter({ hasText: '姓名' }).first()
  ).toBeVisible()
  await name.fill('x')
  await row.getByTitle('保存', { exact: true }).click()
  await expect(name).toBeVisible()
  await name.fill('行编辑通过')
  await row.getByTitle('保存', { exact: true }).click()
  await expect(row.locator('input')).toHaveCount(0)
  await expect(row).toContainText('行编辑通过')
})

test('单元格编辑的同一必填与长度规则生效，失败不退出编辑', async ({ page }) => {
  await mode(page, '仅单元格编辑')
  const row = page
    .locator('.table-demo-page .c-table-wrapper')
    .first()
    .locator('tbody tr')
    .first()
  await row.locator('.cell-edit-icon').first().click()
  const editor = row.locator('.cell-editing-container')
  const name = editor.getByPlaceholder('请输入姓名', { exact: true })
  await name.fill('')
  await editor.locator('button[title="保存"]').click()
  await expect(editor).toBeVisible()
  await expect(
    page.locator('.n-message').filter({ hasText: '姓名' }).first()
  ).toBeVisible()
  await name.fill('x')
  await editor.locator('button[title="保存"]').click()
  await expect(editor).toBeVisible()
  await name.fill('单元格通过')
  await editor.locator('button[title="保存"]').click()
  await expect(editor).toBeHidden()
  await expect(row).toContainText('单元格通过')
})

for (const viewport of [
  { width: 1920, height: 1080, theme: 'light' },
  { width: 1280, height: 900, theme: 'dark' },
  { width: 390, height: 500, theme: 'dark' },
]) {
  test(`弹窗按配置居中并受视口约束：${viewport.theme} ${viewport.width}px`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      theme => localStorage.setItem('theme-mode', theme),
      viewport.theme
    )
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      viewport.theme
    )
    const table = page.locator('.table-demo-page .c-table-wrapper').first()
    await table
      .locator('tbody tr')
      .first()
      .getByTitle('编辑', { exact: true })
      .click()
    const modal = page.getByRole('dialog', {
      name: '编辑员工信息',
      exact: true,
    })
    await expect(modal).toHaveCSS('transform', 'none')
    await expect(modal).toHaveCSS(
      'width',
      `${Math.min(700, viewport.width - 24)}px`
    )
    const geometry = await modal.evaluate(element => {
      const box = element.getBoundingClientRect()
      const header = element
        .querySelector('.n-card-header')!
        .getBoundingClientRect()
      const content = element.querySelector<HTMLElement>(
        ':scope > .n-card-content'
      )!
      const footer = element
        .querySelector('.c-table-edit-modal__footer')!
        .getBoundingClientRect()
      const controls = [
        ...element.querySelectorAll('.c-form-field .n-form-item-blank'),
      ].map(field => field.getBoundingClientRect())
      const first = controls[0]
      return {
        left: box.left,
        right: innerWidth - box.right,
        top: box.top,
        bottom: box.bottom,
        headerGap: first.top - header.bottom,
        firstRow: controls.filter(field => Math.abs(field.top - first.top) <= 1)
          .length,
        footerBottom: footer.bottom,
        contentOverflow: content.scrollHeight - content.clientHeight,
        horizontalOverflow: content.scrollWidth - content.clientWidth,
      }
    })
    expect(geometry.left).toBeGreaterThanOrEqual(11)
    expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(1)
    expect(geometry.top).toBeGreaterThanOrEqual(0)
    expect(geometry.bottom).toBeLessThanOrEqual(viewport.height)
    expect(geometry.headerGap).toBeGreaterThanOrEqual(8)
    expect(geometry.headerGap).toBeLessThanOrEqual(18)
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1)
    expect(geometry.firstRow).toBe(viewport.width < 500 ? 1 : 2)
    if (viewport.width < 500) {
      expect(geometry.contentOverflow).toBeGreaterThan(0)
      await modal.locator('textarea').scrollIntoViewIfNeeded()
      const afterScroll = await modal
        .locator('.c-table-edit-modal__footer')
        .boundingBox()
      expect(
        Math.abs(afterScroll!.y + afterScroll!.height - geometry.footerBottom)
      ).toBeLessThanOrEqual(1)
    }
    await expect(
      modal.getByRole('button', { name: '保存', exact: true })
    ).toBeVisible()
    await modal.screenshot({
      path: info.outputPath(
        `table-edit-${viewport.width}-${viewport.theme}.png`
      ),
      animations: 'disabled',
    })
    await modal.getByRole('button', { name: '取消', exact: true }).click()
    await expect(modal).toHaveCount(0)
  })
}
