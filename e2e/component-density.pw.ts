/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\component-density.pw.ts
 * @Description: 正式组件包表单、搜索、表格共享密度与模式切换回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 读取实际布局高度，覆盖外部主题和页面样式对组件的影响。 */
const height = (locator: Locator) =>
  locator.evaluate(element => element.getBoundingClientRect().height)

/** 读取搜索卡片、表单控件与真实数据单元格的最终样式。 */
const searchGeometry = (section: Locator) =>
  section.evaluate(element => {
    const input = element.querySelector('.form-search .n-input')!
    const button = element.querySelector('.form-search-actions button')!
    const cell = element.querySelector('tbody td')!
    const card = element.querySelector(
      '.form-search-card > :is(.n-card-content, .n-card__content)'
    )!
    return {
      input: input.getBoundingClientRect().height,
      button: button.getBoundingClientRect().height,
      cellPadding: parseFloat(getComputedStyle(cell).paddingTop),
      cardPadding: parseFloat(getComputedStyle(card).paddingTop),
    }
  })

/** 点击产品真实标签，避开 Naive 透明 radio input 的文字覆盖层。 */
const clickRadio = (page: Page, name: string) =>
  page
    .locator('label.n-radio-button')
    .filter({
      has: page.getByRole('radio', { name, exact: true }),
    })
    .click()

/** 页面加载期间可存在可访问控件，交互需等待启动遮罩退出。 */
const gotoReady = async (page: Page, path: string) => {
  await page.goto(path)
  await expect(page.locator('.app-loading')).toBeHidden()
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1600, height: 1050 })
})

test('表单八布局共享密度，切换保留草稿并同步字段和提交按钮', async ({
  page,
}) => {
  await gotoReady(page, '/#/demo/form-manage/form')
  const form = page.locator('.form-section .n-form')
  const input = form.getByPlaceholder('请输入用户名', { exact: true })
  await input.fill('density_draft')
  const compactHeight = await height(form.locator('.n-input').first())
  await expect(form.locator('.c-form-field').first()).toHaveClass(
    /n-form-item--small-size/
  )
  await clickRadio(page, '舒适')
  await expect(input).toHaveValue('density_draft')
  await expect(form.locator('.c-form-field').first()).toHaveClass(
    /n-form-item--large-size/
  )
  const expandedHeight = await height(form.locator('.n-input').first())
  expect(expandedHeight).toBeGreaterThan(compactHeight)
  expect(
    Math.abs(
      expandedHeight -
        (await height(
          form.getByRole('button', { name: '提交表单', exact: true })
        ))
    )
  ).toBeLessThan(1)
  const layouts = [
    '内联布局',
    '网格布局',
    '卡片布局',
    '标签页布局',
    '步骤布局',
    '动态布局',
    '自定义渲染',
  ]
  // 同一页面依次切换，验证应用注入的密度持续生效。
  await layouts.reduce(async (previous, layout) => {
    await previous
    await page
      .locator('.layout-buttons')
      .getByRole('button', { name: layout, exact: true })
      .click()
    await expect(form).toHaveClass(/c-form--comfortable/)
    if (layout === '自定义渲染') {
      await expect(form.getByRole('button', { name: /水平区域/ })).toHaveClass(
        /n-button--large-type/
      )
    } else {
      await expect(form.locator('.c-form-field').first()).toHaveClass(
        /n-form-item--large-size/
      )
    }
  }, Promise.resolve())
})

test('搜索和表格在同屏同步大小与留白，条件只在提交后更新列表', async ({
  page,
}) => {
  await gotoReady(page, '/#/demo/form-manage/form-search')
  const basic = page
    .locator('.demo-section')
    .filter({ has: page.locator('.form-search') })
    .first()
  const table = basic.locator('.c-table-wrapper')
  await expect(table.locator('tbody tr')).toHaveCount(3)
  await expect(table.locator('thead')).toContainText('序号')
  const compact = await searchGeometry(basic)
  expect(Math.abs(compact.input - compact.button)).toBeLessThan(1)
  expect(compact.cardPadding).toBe(12)
  const input = basic.getByPlaceholder('请输入用户名称')
  await input.fill('张三')
  await clickRadio(page, '舒适')
  await expect(input).toHaveValue('张三')
  await expect(table.locator('tbody tr')).toHaveCount(3)
  const comfortable = await searchGeometry(basic)
  expect(Math.abs(comfortable.input - comfortable.button)).toBeLessThan(1)
  expect(comfortable.input).toBeGreaterThan(compact.input)
  expect(comfortable.cellPadding).toBeGreaterThan(compact.cellPadding)
  expect(comfortable.cardPadding).toBe(28)
  await basic.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(table.locator('tbody tr')).toHaveCount(1)
  await expect(table.locator('tbody')).toContainText('张三')
  await basic.getByRole('button', { name: '重置', exact: true }).click()
  await expect(input).toHaveValue('')
  await expect(table.locator('tbody tr')).toHaveCount(3)
})

test('展开搜索条件和状态0在密度切换后保留，真实列表按条件筛选', async ({
  page,
}) => {
  await gotoReady(page, '/#/demo/form-manage/form-search')
  const sections = page
    .locator('.demo-section')
    .filter({ has: page.locator('.form-search') })
  const basic = sections.nth(0)
  const advanced = sections.nth(1)
  await advanced
    .getByRole('button', { name: '展开搜索条件', exact: true })
    .click()
  await advanced.getByPlaceholder('请输入版本号').fill('density_version')
  await clickRadio(page, '舒适')
  await expect(advanced.getByPlaceholder('请输入版本号')).toHaveValue(
    'density_version'
  )
  await expect(
    advanced.getByRole('button', { name: '收起搜索条件', exact: true })
  ).toHaveAttribute('aria-expanded', 'true')
  await basic.locator('.n-select').click()
  await page
    .locator('.n-base-select-option')
    .getByText('禁用', { exact: true })
    .click()
  await basic.getByRole('button', { name: '搜索', exact: true }).click()
  const rows = basic.locator('tbody tr')
  await expect(rows).toHaveCount(1)
  await expect(rows).toContainText('李四')
  await expect(rows).toContainText('禁用')
  await expect(rows.locator('td').first()).toHaveText('1')
})

test('表格简写模式切换清理旧编辑状态，弹窗和行内控件继承密度', async ({
  page,
}) => {
  await gotoReady(page, '/#/demo/table-manage/table')
  const table = page.locator('.table-demo-page .c-table-wrapper').first()
  const row = table.locator('tbody tr').first()
  await expect(row).toBeVisible()
  await clickRadio(page, '舒适')
  await row.getByTitle('编辑', { exact: true }).click()
  const modal = page.locator('.n-modal').filter({ hasText: '编辑员工信息' })
  await expect(modal.locator('.c-form-field').first()).toHaveClass(
    /n-form-item--large-size/
  )
  // 入场缩放会在连续两次跨帧 evaluate 中产生尺寸差；等待真实动画结束后同帧读取。
  await expect(modal).not.toHaveClass(/fade-in-scale-up-transition-enter-/)
  await expect(modal).toHaveCSS('transform', 'none')
  const modalGeometry = await modal.evaluate(element => {
    const input = element.querySelector('.n-input')!
    const save = Array.from(element.querySelectorAll('button')).find(
      button => button.textContent?.trim() === '保存'
    )!
    return {
      inputHeight: input.getBoundingClientRect().height,
      buttonHeight: save.getBoundingClientRect().height,
    }
  })
  const modalInputHeight = modalGeometry.inputHeight
  expect(Math.abs(modalInputHeight - modalGeometry.buttonHeight)).toBeLessThan(
    1
  )
  await modal.getByRole('button', { name: '取消', exact: true }).click()
  await clickRadio(page, '仅行编辑')
  await row.getByTitle('编辑', { exact: true }).click()
  await expect(row.locator('.n-input').first()).toBeVisible()
  expect(await height(row.locator('.n-input').first())).toBe(modalInputHeight)
  await row.locator('.n-input input').first().fill('density_uncommitted')
  await clickRadio(page, '仅单元格编辑')
  await expect(row.locator('input')).toHaveCount(0)
  await expect(row).not.toContainText('density_uncommitted')
  await row.locator('.cell-edit-icon').first().click()
  await expect(row.locator('.cell-editing-container')).toBeVisible()
  await clickRadio(page, '禁用编辑')
  await expect(row.locator('.cell-editing-container')).toHaveCount(0)
  await expect(row.locator('.cell-edit-icon')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /新增员工/ })).toBeDisabled()
})

for (const mode of [
  { theme: 'light', width: 1600 },
  { theme: 'dark', width: 540 },
]) {
  test(`${mode.theme} ${mode.width}px 搜索控件与操作按钮等高且保持容器内换行`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      theme => localStorage.setItem('theme-mode', theme),
      mode.theme
    )
    await page.setViewportSize({ width: mode.width, height: 1000 })
    await gotoReady(page, '/#/demo/form-manage/form-search')
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode.theme)
    const basic = page
      .locator('.demo-section')
      .filter({ has: page.locator('.form-search') })
      .first()
    await expect(basic.locator('tbody tr')).toHaveCount(3)
    expect(
      Math.abs(
        (await searchGeometry(basic)).input -
          (await searchGeometry(basic)).button
      )
    ).toBeLessThan(1)
    expect(
      await basic
        .locator('.form-search')
        .evaluate(element => element.scrollWidth - element.clientWidth)
    ).toBeLessThanOrEqual(1)
    await clickRadio(page, '舒适')
    const geometry = await searchGeometry(basic)
    expect(Math.abs(geometry.input - geometry.button)).toBeLessThan(1)
    expect(
      await basic
        .locator('.form-search')
        .evaluate(element => element.scrollWidth - element.clientWidth)
    ).toBeLessThanOrEqual(1)
    await page.screenshot({
      path: testInfo.outputPath(`density-${mode.theme}.png`),
      fullPage: false,
    })
  })
}
