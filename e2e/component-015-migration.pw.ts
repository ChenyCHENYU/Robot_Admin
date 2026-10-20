/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\component-015-migration.pw.ts
 * @Description: 正式组件包 0.15 搜索、父子选择、动态行和操作栏消费回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 只选当前表格的直接数据行，避免把展开区的子表重复计算。 */
const tableRows = (table: Locator) =>
  table.locator('tbody').first().locator(':scope > tr')

/** 图标按钮没有展示文字，通过产品已有的 title 找到对应操作。 */
const rowAction = (row: Locator, title: string) =>
  row.locator('td').last().getByTitle(title, { exact: true })

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1600, height: 1000 })
  // 演示均使用隔离内存源；员工远端请求即使误触发也不会产生真实写入。
  await page.route('**/employees/**', route => route.abort())
})

test('状态 0 独立查询一次，重置后提交使用已清空的最终条件', async ({
  page,
}) => {
  await page.goto('/#/demo/form-manage/form-search')
  const basic = page
    .locator('.demo-section')
    .filter({ has: page.locator('.form-search') })
    .first()
  const buttons = basic
    .locator('.form-search-item-box')
    .last()
    .getByRole('button')
  await basic.locator('.n-select').click()
  await page
    .locator('.n-base-select-option')
    .getByText('禁用', { exact: true })
    .click()
  await buttons.nth(0).click()
  const results = page
    .locator('.demo-section')
    .filter({
      has: page.getByRole('heading', { name: '搜索结果', exact: true }),
    })
    .locator('pre')
  await expect(results).toContainText('"status": 0')
  expect(JSON.parse(await results.innerText())).toMatchObject([
    { id: 2, name: '李四', status: 0 },
  ])
  await expect(
    page.getByText('搜索条件已接收（演示结果）', { exact: true })
  ).toHaveCount(1)

  await buttons.nth(1).click()
  await expect(results).toHaveCount(0)
  await expect(basic.getByPlaceholder('请输入用户名称')).toHaveValue('')
  await expect(basic.locator('.n-select')).toContainText('请选择状态')
  await expect(basic.getByPlaceholder('开始时间')).toHaveValue('')
  await expect(basic.getByPlaceholder('结束时间')).toHaveValue('')
  await basic.getByPlaceholder('请输入用户名称').fill('张三')
  await buttons.nth(0).click()
  await expect(results).toContainText('张三')
  expect(JSON.parse(await results.innerText())).toMatchObject([
    { id: 1, name: '张三', status: 1 },
  ])
})

test('自定义子表的宽松与严格选择、禁用与清空同步到唯一父实例', async ({
  page,
}) => {
  await page.goto('/#/demo/table-manage/table-expand')
  const demo = page.locator('.table-expand-demo')
  const parentTable = demo.locator('.n-data-table').first()
  const rows = tableRows(parentTable)
  await expect(rows).toHaveCount(5)
  const parent = rows.filter({ has: page.getByText('张三', { exact: true }) })
  const unavailable = rows.filter({
    has: page.getByText('王五', { exact: true }),
  })
  const unavailableCheck = unavailable.getByRole('checkbox')
  // Naive 的表格复选框用 div + 禁用 class；同时验证点击不会改变选择。
  await expect(unavailableCheck).toHaveClass(/n-checkbox--disabled/)
  await unavailableCheck.click()
  await expect(unavailableCheck).not.toBeChecked()
  await parent.locator('.n-data-table-expand-trigger').click()
  const child = demo.locator('.n-data-table').nth(1)
  await expect(tableRows(child)).toHaveCount(3)
  const childChecks = child.locator('tbody').getByRole('checkbox')
  await childChecks.first().click()
  await expect(parent.getByRole('checkbox')).toBeChecked()
  await demo.getByRole('button', { name: '清空所有选择', exact: true }).click()
  await expect(parent.getByRole('checkbox')).not.toBeChecked()
  await expect(childChecks.first()).not.toBeChecked()

  const strictMode = demo.locator('.n-radio').filter({ hasText: '严格模式' })
  await strictMode.click()
  await expect(strictMode.getByRole('radio')).toBeChecked()
  await childChecks.first().click()
  await expect(parent.getByRole('checkbox')).not.toBeChecked()
  await child.locator('thead').getByRole('checkbox').click()
  await expect(childChecks.nth(0)).toBeChecked()
  await expect(childChecks.nth(1)).toBeChecked()
  await expect(childChecks.nth(2)).toBeChecked()
  await expect(parent.getByRole('checkbox')).toBeChecked()

  await demo
    .getByRole('checkbox', { name: '启用父表格选择', exact: true })
    .uncheck()
  await expect(parent.getByRole('checkbox')).toHaveCount(0)
  await expect(childChecks.first()).not.toBeChecked()
  await childChecks.first().click()
  await expect(childChecks.first()).toBeChecked()
  await demo.getByRole('button', { name: '清空所有选择', exact: true }).click()
  await expect(childChecks.first()).not.toBeChecked()
  await demo
    .getByRole('checkbox', { name: '启用子表格选择', exact: true })
    .uncheck()
  await expect(childChecks).toHaveCount(0)
  await expect(demo.getByRole('radio', { name: /严格模式/ })).toBeDisabled()
})

test('没有 randomUUID 的环境下，动态表格仍能连续新增、复制、删除和重置', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    })
  })
  await page.goto('/#/demo/table-manage/table-dynamic')
  const demo = page.locator('.table-dynamic-demo')
  const rows = tableRows(demo.locator('.n-data-table'))
  await expect(rows).toHaveCount(5)
  const add = demo.getByRole('button', { name: '添加员工', exact: true })
  await add.click()
  await add.click()
  await expect(rows).toHaveCount(7)
  const toolbar = demo.locator('.dynamic-rows-toolbar')
  await toolbar.getByRole('button', { name: /增行$/ }).click()
  await expect(rows).toHaveCount(8)
  await expect(rows.last()).toContainText('新员工')
  await rows.last().getByRole('radio').check()
  await toolbar.getByRole('button', { name: /复制行$/ }).click()
  await expect(rows).toHaveCount(9)
  await expect(rows.last()).toContainText('新员工')
  await rows.last().getByRole('radio').check()
  await toolbar.getByRole('button', { name: /删除行$/ }).click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确认删除', exact: true })
    .click()
  await expect(rows).toHaveCount(8)
  await expect(
    demo.locator('.n-alert').filter({ hasText: '已选中' })
  ).toHaveCount(0)
  await demo.getByRole('button', { name: '重置数据', exact: true }).click()
  await expect(rows).toHaveCount(5)
  await expect(rows.first()).toContainText('张三')
})

test('行与单元格保存更新选中摘要，操作列删除同步外部数据', async ({ page }) => {
  await page.goto('/#/demo/table-manage/table-dynamic')
  const demo = page.locator('.table-dynamic-demo')
  const rows = tableRows(demo.locator('.n-data-table'))
  await expect(rows).toHaveCount(5)
  const first = rows.first()
  const nameCell = first.locator('td').nth(1)
  const summary = demo.locator('.n-alert').filter({ hasText: '已选中' })
  await first.getByRole('radio').check()
  await expect(summary).toContainText('张三')
  await rowAction(first, '编辑').click()
  await nameCell.getByRole('textbox').fill('行保存后的张三')
  await rowAction(first, '保存').click()
  await expect(nameCell.getByRole('textbox')).toHaveCount(0)
  await expect(nameCell).toContainText('行保存后的张三')
  await expect(summary).toContainText('行保存后的张三')

  await nameCell.hover()
  await nameCell.locator('.cell-edit-icon').click()
  await nameCell.getByRole('textbox').fill('单元格保存后的张三')
  await nameCell.locator('.cell-action-save').click()
  await expect(nameCell.getByRole('textbox')).toHaveCount(0)
  await expect(summary).toContainText('单元格保存后的张三')
  await rowAction(first, '删除').click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确定', exact: true })
    .click()
  await expect(rows).toHaveCount(4)
  await expect(demo.locator('tbody')).not.toContainText('单元格保存后的张三')
  await expect(summary).toHaveCount(0)
})

test('操作栏清空真实复选框，Promise 刷新在同一事件轮次内只执行一次', async ({
  page,
}) => {
  await page.goto('/#/demo/action-bar')
  const cards = page.locator('.action-bar-demo-page .n-card')
  const tableCard = cards.filter({
    has: page.locator('.n-card-header__main', { hasText: /^表格工具栏$/ }),
  })
  const firstCheck = tableCard.locator('tbody').getByRole('checkbox').first()
  await firstCheck.check()
  await expect(tableCard.locator('.actions-center')).toContainText('1 条')
  await tableCard.getByRole('button', { name: '清空', exact: true }).click()
  await expect(firstCheck).not.toBeChecked()
  await expect(tableCard.locator('.actions-center')).not.toContainText('1 条')

  const stateCard = cards.filter({
    has: page.locator('.n-card-header__main', { hasText: /^响应式按钮状态$/ }),
  })
  const refresh = stateCard.getByRole('button', { name: /刷新$/ })
  await refresh.scrollIntoViewIfNeeded()
  await expect(page.locator('.app-loading')).toBeHidden()
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  // 原生连续点击不等待 Vue 渲染，覆盖只依赖 loading DOM 更新时漏掉的重复执行。
  await refresh.evaluate(element => {
    const button = element as HTMLButtonElement
    button.click()
    button.click()
  })
  await expect(refresh).toBeDisabled()
  await expect(refresh).toHaveClass(/n-button--loading/)
  await page.clock.runFor(2200)
  await expect(refresh).toBeEnabled()
  await expect(page.getByText('刷新完成', { exact: true })).toHaveCount(1)
})

test('动态 C++ 与 Rust 语法复用应用高亮器，切换文件保留各自草稿', async ({
  page,
}) => {
  await page.goto('/#/editor/code-editor')
  const workspace = page.locator('.code-editor-demo')
  const cppFile = workspace.getByRole('button', {
    name: 'main.cpp cpp',
    exact: true,
  })
  const rustFile = workspace.getByRole('button', {
    name: 'main.rs rust',
    exact: true,
  })
  const editor = workspace.getByLabel('代码文本', { exact: true })
  const title = workspace.locator('.c-code-title')
  const code = workspace.locator('.n-code')
  await cppFile.click()
  await expect(cppFile).toHaveAttribute('aria-pressed', 'true')
  await expect(workspace.locator('.workspace-hint')).toHaveText(
    '语法高亮已就绪'
  )
  await expect(title).toHaveText('main.cpp')
  await expect(code).toContainText('class NumberProcessor')
  await expect(code.locator('.hljs-keyword').first()).toBeVisible()
  const cppDraft = (await editor.inputValue()) + '\n// C++ 迁移验收草稿'
  await editor.fill(cppDraft)
  await expect(code).toHaveText(cppDraft, { useInnerText: true })
  expect(await page.evaluate(() => Reflect.has(window, 'hljs'))).toBe(false)

  await rustFile.click()
  await expect(rustFile).toHaveAttribute('aria-pressed', 'true')
  await expect(workspace.locator('.workspace-hint')).toHaveText(
    '语法高亮已就绪'
  )
  await expect(title).toHaveText('main.rs')
  await expect(code).toContainText('struct Calculator')
  await expect(code.locator('.hljs-keyword').first()).toBeVisible()
  const rustDraft = (await editor.inputValue()) + '\n// Rust 迁移验收草稿'
  await editor.fill(rustDraft)
  await expect(code).toHaveText(rustDraft, { useInnerText: true })

  await cppFile.click()
  await expect(title).toHaveText('main.cpp')
  await expect(editor).toHaveValue(cppDraft)
  await expect(code).toHaveText(cppDraft, { useInnerText: true })
  await expect(code.locator('.hljs-keyword').first()).toBeVisible()
  await rustFile.click()
  await expect(title).toHaveText('main.rs')
  await expect(editor).toHaveValue(rustDraft)
  await expect(code).toHaveText(rustDraft, { useInnerText: true })
  await expect(code.locator('.hljs-keyword').first()).toBeVisible()
  expect(await page.evaluate(() => Reflect.has(window, 'hljs'))).toBe(false)
})

test('Markdown 真实编辑器输入后可连续手动保存，刷新恢复最终内容', async ({
  page,
}) => {
  await page.goto('/#/editor/markdown-editor')
  const workspace = page.locator('.markdown-demo-page')
  await workspace
    .getByRole('checkbox', { name: '自动保存到本机', exact: true })
    .uncheck()
  const editor = workspace.locator('.cm-content[contenteditable="true"]')
  const save = workspace.getByRole('button', {
    name: '保存到本机',
    exact: true,
  })
  const storageKey = 'robot-admin:markdown-workspace:v1'
  const firstDraft = '# 迁移验收\n\n真实编辑器输入后保存，保留文档内容。'
  await expect(editor).toBeVisible()
  await editor.click()
  await editor.press('ControlOrMeta+A')
  await page.keyboard.insertText(firstDraft)
  await expect(workspace.locator('.workspace-footer')).toContainText(
    '有尚未保存的修改'
  )
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBeNull()
  await save.click()
  await expect(
    page.getByText('全部文档草稿已保存到本机', { exact: true })
  ).toHaveCount(1)
  await expect(save).toBeEnabled()
  await expect(workspace.locator('.workspace-footer')).toContainText('已保存')
  expect(
    await page.evaluate(
      key => JSON.parse(localStorage.getItem(key)!).drafts.notes,
      storageKey
    )
  ).toBe(firstDraft)

  const finalDraft = firstDraft + '\n\n第二次保存使用最终修改。'
  await editor.click()
  await editor.press('ControlOrMeta+A')
  await page.keyboard.insertText(finalDraft)
  await expect(workspace.locator('.workspace-footer')).toContainText(
    '有尚未保存的修改'
  )
  await save.click()
  await expect(save).toBeEnabled()
  await expect(workspace.locator('.workspace-footer')).toContainText('已保存')
  expect(
    await page.evaluate(
      key => JSON.parse(localStorage.getItem(key)!).drafts.notes,
      storageKey
    )
  ).toBe(finalDraft)
  await expect(editor).toHaveText(finalDraft, { useInnerText: true })
  await page.reload()
  await expect(workspace.locator('.workspace-footer')).toContainText(
    '已恢复本机草稿'
  )
  await expect(editor).toHaveText(finalDraft, { useInnerText: true })
})

test('骨架屏结束加载后渲染真实表格按钮和头像组件，无组件解析告警', async ({
  page,
}) => {
  const resolveWarnings: string[] = []
  page.on('console', message => {
    if (
      /Failed to resolve component|resolveComponent can only be used/.test(
        message.text()
      )
    ) {
      resolveWarnings.push(message.text())
    }
  })
  await page.goto('/#/plugins/skeleton')
  const demo = page.locator('.skeleton-demo')
  const preview = demo.locator('.preview-area')
  await demo.locator('.config-bar').getByRole('switch').click()
  await expect(preview.locator('.n-table')).toBeVisible()
  await expect(preview.locator('tbody tr')).toHaveCount(4)
  const editButtons = preview.getByRole('button', { name: '编辑', exact: true })
  await expect(editButtons).toHaveCount(4)
  expect(
    await editButtons.evaluateAll(buttons =>
      buttons.every(button => button.tagName === 'BUTTON')
    )
  ).toBe(true)

  await demo
    .locator('.scene-card')
    .filter({ has: page.getByText('头像骨架', { exact: true }) })
    .click()
  await expect(preview.locator('.loaded-avatar')).toContainText('ChenYu')
  await expect(preview.locator('.loaded-avatar__icon .c-icon')).toBeVisible()
  await expect(
    preview.getByRole('img', { name: 'mdi:account-circle', exact: true })
  ).toHaveCount(1)
  expect(resolveWarnings).toEqual([])
})
