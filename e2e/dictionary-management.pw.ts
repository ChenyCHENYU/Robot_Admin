/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\e2e\dictionary-management.pw.ts
 * @Description: 字典新增编辑、编码保留、状态说明和树节点真实几何回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const dictionaryPath = '/sys-manage/dictionary-manage'

/** 从表单标签定位，避免依赖私有组件实例。 */
const field = (editor: Locator, name: string) =>
  editor
    .locator('.n-form-item')
    .filter({
      has: editor
        .page()
        .locator('.n-form-item-label')
        .filter({ hasText: name }),
    })
    .getByRole('textbox')

/** 测量真实箭头与内容行中心，覆盖收起、展开及悬停状态。 */
async function expectCenteredSwitchers(tree: Locator) {
  const differences = await tree
    .locator('.n-tree-node-wrapper')
    .evaluateAll(rows =>
      rows.flatMap(row => {
        const arrow = row.querySelector('.n-tree-node-switcher')
        const content = row.querySelector('.n-tree-node-content')
        if (!arrow || !content) return []
        const a = arrow.getBoundingClientRect()
        const c = content.getBoundingClientRect()
        return a.height && c.height
          ? [Math.abs(a.y + a.height / 2 - c.y - c.height / 2)]
          : []
      })
    )
  expect(differences.length).toBeGreaterThan(0)
  expect(Math.max(...differences)).toBeLessThanOrEqual(1)
}

test('空类型可添加首项，标签编辑保留编码，重复值和删除都有保护', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await installMockAdminSession(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`/#${dictionaryPath}`)
  await expect(page.locator('.dictionary-details h2')).toContainText('用户状态')
  await expect(page.locator('.dictionary-items')).toContainText('normal')
  await page.getByRole('button', { name: '新增字典类型', exact: true }).click()
  const editor = page.locator('.dictionary-editor')
  await field(editor, '类型名称').fill('项目状态')
  await field(editor, '类型编码').fill('project_status_e2e')
  await editor.getByRole('button', { name: '保存字典', exact: true }).click()
  await expect(editor).not.toBeVisible()
  await expect(page.locator('.dictionary-details h2')).toContainText('项目状态')
  await page
    .getByRole('button', { name: '添加第一个字典项', exact: true })
    .click()
  await field(editor, '显示标签').fill('待启动')
  await field(editor, '存储值').fill('0')
  await field(editor, '字典项编码（选填）').fill('pending')
  await editor.getByRole('button', { name: '保存字典', exact: true }).click()
  await expect(editor).not.toBeVisible()
  let row = page
    .locator('.dictionary-items tbody tr')
    .filter({ hasText: 'pending' })
  await expect(row).toContainText('待启动')
  await row.getByRole('button', { name: '编辑', exact: true }).click()
  await field(editor, '显示标签').fill('准备就绪')
  await expect(field(editor, '字典项编码（选填）')).toHaveValue('pending')
  await editor.getByRole('button', { name: '保存字典', exact: true }).click()
  await expect(editor).not.toBeVisible()
  row = page
    .locator('.dictionary-items tbody tr')
    .filter({ hasText: 'pending' })
  await expect(row).toContainText('准备就绪')
  await expect(row).toContainText('0')
  await page
    .locator('.dictionary-details')
    .getByRole('button', { name: '新增字典项', exact: true })
    .click()
  await field(editor, '显示标签').fill('重复值')
  await field(editor, '存储值').fill('0')
  await editor.getByRole('button', { name: '保存字典', exact: true }).click()
  await expect(editor).toContainText('同一类型下的存储值不能重复')
  await editor.getByRole('button', { name: '取消', exact: true }).click()
  await page.getByRole('button', { name: '刷新', exact: true }).click()
  await expect(page.locator('.dictionary-details h2')).toContainText('项目状态')
  await row.getByRole('button', { name: '删除', exact: true }).click()
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: '删除', exact: true }).click()
  await page.getByRole('button', { name: '确认删除', exact: true }).click()
  await expect(row).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '添加第一个字典项', exact: true })
  ).toBeEnabled()
  expect(errors).toEqual([])
})

test('名称编码检索、父类型状态和亮暗窄屏布局清楚可用', async ({
  page,
}, testInfo) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1480, height: 1000 })
  await page.goto(`/#${dictionaryPath}`)
  const details = page.locator('.dictionary-details')
  await expect(details.locator('h2')).toContainText('用户状态')
  await expect(page.locator('.dictionary-workspace .n-spin')).toHaveCount(0)
  await page.screenshot({
    path: testInfo.outputPath('dictionary-desktop.png'),
    fullPage: true,
  })
  const search = page.getByRole('textbox', { name: '搜索字典', exact: true })
  await search.fill('normal')
  const tree = page.locator('.dictionary-tree')
  await expect(tree).toContainText('正常')
  await expect(tree).not.toContainText('性别')
  await tree.locator('.n-tree-node-content').filter({ hasText: '正常' }).click()
  await expect(page.locator('.selected-dictionary-item')).toContainText(
    'normal'
  )
  await search.clear()
  await details.getByRole('button', { name: '停用类型', exact: true }).click()
  await expect(details).toContainText('类型已停用，下级选项暂不生效')
  const normalRow = page
    .locator('.dictionary-items tbody tr')
    .filter({ hasText: 'normal' })
  await expect(normalRow).toContainText('已启用')
  await expect(normalRow).toContainText('所属类型已停用，暂不生效')
  await normalRow.getByRole('button', { name: '编辑', exact: true }).click()
  const editor = page.locator('.dictionary-editor')
  await expect(editor.getByRole('switch')).toBeChecked()
  await expect(editor.locator('.effective-preview')).toContainText(
    '不生效 · 所属类型已停用'
  )
  await editor.getByRole('switch').click()
  await expect(editor.locator('.effective-preview')).toContainText(
    '不生效 · 字典项已停用'
  )
  await editor.getByRole('button', { name: '保存字典', exact: true }).click()
  await expect(editor).not.toBeVisible()
  await expect(normalRow).toContainText('已停用')
  await expect(normalRow).not.toContainText('所属类型已停用，暂不生效')
  await normalRow.getByRole('button', { name: '编辑', exact: true }).click()
  await expect(editor.getByRole('switch')).not.toBeChecked()
  await expect(editor.locator('.effective-preview')).toContainText(
    '不生效 · 字典项已停用'
  )
  await editor.getByRole('switch').click()
  await editor.getByRole('button', { name: '保存字典', exact: true }).click()
  await expect(editor).not.toBeVisible()
  await expect(normalRow).toContainText('已启用')
  await expect(normalRow).toContainText('所属类型已停用，暂不生效')
  const disabledRow = page
    .locator('.dictionary-items tbody tr')
    .filter({ hasText: 'disabled' })
  await disabledRow.getByRole('button', { name: '编辑', exact: true }).click()
  await expect(editor.getByRole('switch')).not.toBeChecked()
  await expect(editor.locator('.effective-preview')).toContainText(
    '不生效 · 字典项已停用'
  )
  await editor.getByRole('button', { name: '取消', exact: true }).click()
  await expect(
    details.getByRole('button', { name: '新增字典项', exact: true })
  ).toBeDisabled()
  await details.getByRole('button', { name: '启用类型', exact: true }).click()
  await expect(
    page.locator('.dictionary-items tbody tr').filter({ hasText: 'normal' })
  ).toContainText('已启用')
  await expect(
    page.locator('.dictionary-items tbody tr').filter({ hasText: 'disabled' })
  ).toContainText('已停用')
  await page.evaluate(() => localStorage.setItem('theme-mode', 'dark'))
  await page.reload()
  await expect(details.locator('h2')).toContainText('用户状态')
  await expect(page.locator('.dictionary-workspace .n-spin')).toHaveCount(0)
  await expectCenteredSwitchers(tree)
  await page.screenshot({
    path: testInfo.outputPath('dictionary-dark.png'),
    fullPage: true,
  })
  await page.locator('#guide-menu-collapse').click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() =>
      page
        .locator('.n-layout-sider')
        .evaluate(el => Math.round(el.getBoundingClientRect().width))
    )
    .toBe(64)
  await expect
    .poll(() =>
      page
        .locator('.dictionary-management')
        .evaluate(el => el.getBoundingClientRect().width)
    )
    .toBeGreaterThan(280)
  await expect
    .poll(() =>
      page
        .locator('.dictionary-management')
        .evaluate(el => el.scrollWidth <= el.clientWidth + 1)
    )
    .toBe(true)
  await expect(
    details.getByRole('button', { name: '新增字典项', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('dictionary-mobile.png'),
    fullPage: true,
  })
})

test('菜单树箭头在收起展开悬停和亮暗主题下均按行居中', async ({
  page,
}, testInfo) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1480, height: 1000 })
  await page.goto('/#/sys-manage/menu-manage')
  await expect(page.locator('.details-panel h2')).toContainText('菜单管理')
  const tree = page.locator('.menu-tree')
  await expectCenteredSwitchers(tree)
  await page.getByRole('button', { name: '展开全部', exact: true }).click()
  await expectCenteredSwitchers(tree)
  await tree
    .locator('.n-tree-node-content')
    .filter({ hasText: '仪表盘' })
    .first()
    .hover()
  await expectCenteredSwitchers(tree)
  await page.getByRole('button', { name: '收起全部', exact: true }).click()
  await expectCenteredSwitchers(tree)
  await page
    .getByRole('textbox', { name: '搜索菜单', exact: true })
    .fill('sys-manage')
  await expectCenteredSwitchers(tree)
  await expect(page.locator('.workspace-emblem .c-icon')).not.toHaveAttribute(
    'aria-busy',
    'true'
  )
  await page.screenshot({
    path: testInfo.outputPath('menu-centered.png'),
    fullPage: true,
  })
  await page.evaluate(() => localStorage.setItem('theme-mode', 'dark'))
  await page.reload()
  await expect(page.locator('.details-panel h2')).toContainText('菜单管理')
  await expectCenteredSwitchers(tree)
})
