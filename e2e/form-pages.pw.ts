/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 业务页面表单配置迁移与原有交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 按业务标签找到字段，兼容字段提示和动态布局。 */
const field = (container: Locator, label: string) =>
  container.locator('.n-form-item').filter({
    has: container
      .page()
      .locator('.n-form-item-label')
      .filter({ hasText: label }),
  })

/** 通过可见选项完成选择，覆盖组件真实值更新。 */
async function select(
  page: Page,
  container: Locator,
  label: string,
  option: string
) {
  await field(container, label).locator('.n-select').click()
  await page
    .locator('.n-base-select-option')
    .getByText(option, { exact: true })
    .last()
    .click()
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('个人资料保存后重置到最新保存值，可选手机允许留空', async ({ page }) => {
  await page.goto('/#/account/profile')
  const form = page.locator('.profile-form-card .n-form')
  await expect(form).toBeVisible()
  await expect(
    form.getByRole('button', { name: '保存修改', exact: true })
  ).toBeEnabled()
  await field(form, '昵称').getByRole('textbox').fill('表单回归昵称')
  await field(form, '手机').getByRole('textbox').fill('')
  await form.getByRole('button', { name: '保存修改', exact: true }).click()
  await expect(page.getByText('个人资料已更新', { exact: true })).toBeVisible()
  await expect(page.locator('.info-name')).toHaveText('表单回归昵称')
  await field(form, '昵称').getByRole('textbox').fill('未保存内容')
  await form.getByRole('button', { name: '重置', exact: true }).click()
  await expect(field(form, '昵称').getByRole('textbox')).toHaveValue(
    '表单回归昵称'
  )
  await expect(field(form, '手机').getByRole('textbox')).toHaveValue('')
})

test('账号密码确认不一致时阻止修改，关闭再打开清空敏感输入', async ({
  page,
}) => {
  await page.goto('/#/account/security')
  await page.getByRole('button', { name: '修改', exact: true }).click()
  const form = page.locator('.password-form')
  await form.getByPlaceholder('请输入当前密码').fill('OldPassword123')
  await form
    .getByPlaceholder('请输入新密码', { exact: true })
    .fill('NewPassword123')
  await form.getByPlaceholder('请再次输入新密码').fill('OtherPassword123')
  await form.getByRole('button', { name: '确认修改', exact: true }).click()
  await expect(
    form.getByText('两次输入的密码不一致', { exact: true })
  ).toBeVisible()
  await expect(page).toHaveURL(/#\/account\/security$/)
  await form.getByRole('button', { name: '取消', exact: true }).click()
  await page.getByRole('button', { name: '修改', exact: true }).click()
  await expect(
    page.locator('.password-form').getByPlaceholder('请输入当前密码')
  ).toHaveValue('')
})

test('角色表单校验、重复编码保护和编辑回填正常', async ({ page }) => {
  await page.goto('/#/sys-manage/role-manage')
  await page.getByRole('button', { name: '新增角色', exact: true }).click()
  const modal = page
    .locator('.n-dialog')
    .filter({ has: page.locator('.n-form') })
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(
    modal.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await field(modal, '角色名称').getByRole('textbox').fill('表单回归角色')
  await field(modal, '角色编码')
    .getByRole('textbox')
    .fill('form_regression_role')
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(modal).not.toBeVisible()
  const row = page
    .locator('tbody tr')
    .filter({ hasText: 'form_regression_role' })
  await expect(row).toContainText('表单回归角色')
  await row
    .locator('button')
    .filter({ has: page.locator('[title="编辑"]') })
    .click()
  await expect(field(modal, '角色编码').getByRole('textbox')).toBeDisabled()
  await field(modal, '角色名称').getByRole('textbox').fill('更新回归角色')
  await modal.getByRole('button', { name: '确认修改', exact: true }).click()
  await expect(row).toContainText('更新回归角色')
  await page.getByRole('button', { name: '新增角色', exact: true }).click()
  await field(modal, '角色名称').getByRole('textbox').fill('重复角色')
  await field(modal, '角色编码')
    .getByRole('textbox')
    .fill('form_regression_role')
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(page.getByText('角色编码已存在', { exact: true })).toBeVisible()
  await expect(modal).toBeVisible()
})

test('用户创建保留公司归属，表格详情编辑和重置密码按钮正常', async ({
  page,
}) => {
  await page.goto('/#/sys-manage/user-manage')
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.getByRole('button', { name: '新增用户', exact: true }).click()
  const modal = page
    .locator('.n-dialog')
    .filter({ has: page.locator('.membership-editor') })
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(
    modal.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await field(modal, '用户名').getByRole('textbox').fill('form_regression_user')
  await field(modal, '昵称').getByRole('textbox').fill('表单回归用户')
  await field(modal, '初始密码')
    .getByPlaceholder('请输入初始密码')
    .fill('FormPassword123')
  await expect(modal.locator('.membership-editor__row')).toHaveCount(1)
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(modal).not.toBeVisible()
  const row = page
    .locator('tbody tr')
    .filter({ hasText: 'form_regression_user' })
  await expect(row).toContainText('表单回归用户')
  await row
    .locator('button')
    .filter({ has: page.locator('[title="详情"]') })
    .click()
  await expect(page.locator('.n-drawer')).toContainText('表单回归用户')
  await page
    .locator('.n-drawer')
    .getByRole('button', { name: '关闭', exact: true })
    .click()
  await row
    .locator('button')
    .filter({ has: page.locator('[title="编辑"]') })
    .click()
  await expect(field(modal, '用户名').getByRole('textbox')).toBeDisabled()
  await expect(field(modal, '初始密码')).toHaveCount(0)
  await expect(modal.locator('.membership-editor__row')).toHaveCount(1)
  await modal.getByRole('button', { name: '取消', exact: true }).click()
  await row
    .locator('button')
    .filter({ has: page.locator('[title="更多操作"]') })
    .hover()
  await page.getByText('重置密码', { exact: true }).last().click()
  const password = page.locator('.n-dialog').filter({ hasText: '确认重置' })
  await password
    .getByPlaceholder('请输入新密码', { exact: true })
    .fill('ResetPassword123')
  await password.getByPlaceholder('请再次输入新密码').fill('OtherPassword123')
  await password.getByRole('button', { name: '确认重置', exact: true }).click()
  await expect(
    password.getByText('两次密码输入不一致', { exact: true })
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('用户类型联动清理部门和角色，外部字段按类型出现', async ({ page }) => {
  await page.goto('/#/sys-manage/user-manage')
  await page.getByRole('button', { name: '新增用户', exact: true }).click()
  const modal = page
    .locator('.n-dialog')
    .filter({ has: page.locator('.membership-editor') })
  await select(page, modal, '用户角色', '普通员工')
  await expect(field(modal, '用户角色')).toContainText('普通员工')
  await select(page, modal, '用户类型', '外部客户')
  await expect(field(modal, '公司名称')).toBeVisible()
  await expect(field(modal, '所属部门')).toHaveCount(0)
  await expect(field(modal, '用户角色')).toContainText('请选择角色')
  await field(modal, '公司名称').getByRole('textbox').fill('回归公司')
  await select(page, modal, '用户类型', '内部员工')
  await expect(field(modal, '公司名称')).toHaveCount(0)
  await expect(field(modal, '所属部门')).toBeVisible()
  await select(page, modal, '用户类型', '外部客户')
  await expect(field(modal, '公司名称').getByRole('textbox')).toHaveValue('')
})

test('权限编码生成、校验、增删改和刷新沿用业务流程', async ({ page }) => {
  await page.goto('/#/sys-manage/permission-manage')
  await page.getByRole('button', { name: /新增权限/ }).click()
  const modal = page
    .locator('.n-dialog')
    .filter({ has: page.locator('.n-form') })
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(
    modal.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await field(modal, '权限名称').getByRole('textbox').fill('表单回归权限')
  await select(page, modal, '所属模块', '系统管理')
  await select(page, modal, '权限类型', '按钮权限')
  await modal.getByRole('button', { name: '生成权限编码', exact: true }).click()
  await expect(field(modal, '权限编码').getByRole('textbox')).not.toHaveValue(
    ''
  )
  await field(modal, '权限编码')
    .getByRole('textbox')
    .fill('system:form_regression')
  await modal.getByRole('button', { name: '确认添加', exact: true }).click()
  await expect(modal).not.toBeVisible()
  await expect(page.locator('tbody')).toContainText('表单回归权限')
  const workspace = page.locator('.permission-management')
  const table = workspace.locator('.c-table-wrapper').first()
  const refresh = workspace
    .locator('.header-card')
    .getByRole('button', { name: /刷新$/ })
  await refresh.click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  const row = table
    .locator('tbody tr')
    .filter({ hasText: 'system:form_regression' })
  await expect(row).toContainText('表单回归权限')
  await row
    .locator('button')
    .filter({ has: page.locator('[title="更多操作"]') })
    .hover()
  await page
    .locator('.n-dropdown-menu:visible')
    .getByText('禁用', { exact: true })
    .click()
  await expect(row.locator('.permission-status')).toHaveText('禁用')
  await refresh.click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(row.locator('.permission-status')).toHaveText('禁用')
  await row
    .locator('button')
    .filter({ has: page.locator('[title="删除"]') })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '确定', exact: true })
    .click()
  await expect(row).toHaveCount(0)
  await refresh.click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(row).toHaveCount(0)
})

test('临时授权的角色、权限集合和有效期缺失时逐字段拦截', async ({ page }) => {
  await page.goto('/#/sys-manage/permission-manage')
  await page.locator('.n-tabs-tab').filter({ hasText: '临时授权' }).click()
  await page.getByRole('button', { name: /新增临时授权/ }).click()
  const modal = page.locator('.n-dialog').filter({ hasText: '确认授权' })
  await modal.getByRole('button', { name: '确认授权', exact: true }).click()
  await expect(field(modal, '目标角色')).toContainText('目标角色不能为空')
  await expect(field(modal, '授权权限')).toContainText('授权权限不能为空')
  await expect(field(modal, '有效期')).toContainText('有效期不能为空')
  await expect(modal).toBeVisible()
  await modal.getByRole('button', { name: '取消', exact: true }).click()
  await expect(modal).not.toBeVisible()
})

test('新增员工字段校验和重开默认值正常', async ({ page }) => {
  await page.goto('/#/demo/table-manage/table')
  await page.getByRole('button', { name: /新增员工/ }).click()
  const modal = page.locator('.n-modal').filter({ hasText: '新增员工' })
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(
    modal.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await modal.getByPlaceholder('请输入姓名').fill('未保存员工')
  await modal.getByRole('button', { name: '取消', exact: true }).click()
  await page.getByRole('button', { name: /新增员工/ }).click()
  await expect(modal.getByPlaceholder('请输入姓名')).toHaveValue('')
  await modal.getByPlaceholder('请输入姓名').fill('表单回归员工')
  await modal
    .getByPlaceholder('请输入邮箱地址')
    .fill('form-employee@example.com')
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal).not.toBeVisible()
  await expect(page.locator('tbody')).toContainText('表单回归员工')
})

test('下载 JSON 参数错误显示在字段，不发起下载', async ({ page }) => {
  await page.goto('/#/hooks/download-all')
  const form = page.locator('.n-form')
  await form.getByPlaceholder('请输入文件名称').fill('表单回归')
  await field(form, '自定义参数').getByRole('textbox').fill('{invalid}')
  await form.getByRole('button', { name: '自定义下载', exact: true }).click()
  await expect(
    form.getByText('参数格式错误，请输入有效的 JSON', { exact: true })
  ).toBeVisible()
})

test('Markdown 特殊字段保留编辑、字数统计和发布校验', async ({ page }) => {
  await page.goto('/#/editor/markdown-editor')
  await page.locator('.n-tabs-tab').filter({ hasText: '表单集成' }).click()
  const form = page.locator('.n-form')
  await expect(form.locator('.form-markdown-editor')).toBeVisible()
  await form.getByRole('button', { name: '发布文章', exact: true }).click()
  await expect(
    form.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await expect(
    form.getByText('字数统计: 0 / 20000', { exact: true })
  ).toBeVisible()
  await form.getByRole('button', { name: '预览文章', exact: true }).click()
  await expect(
    page.getByText('请先输入文章内容', { exact: true })
  ).toBeVisible()
})

test('操作栏演示复用提交锁，可选邮箱留空并在结束后重置', async ({ page }) => {
  await page.goto('/#/demo/action-bar')
  const card = page.locator('.n-card').filter({ has: page.locator('.n-form') })
  await field(card, '用户名').getByRole('textbox').fill('form_tester')
  await card.getByRole('button', { name: '提交', exact: true }).click()
  await expect(
    card.getByRole('button', { name: '重置', exact: true })
  ).toBeDisabled()
  await expect(
    page.getByText('提交演示完成，数据未持久化', { exact: true })
  ).toBeVisible()
  await card.getByRole('button', { name: '重置', exact: true }).click()
  await expect(field(card, '用户名').getByRole('textbox')).toHaveValue('')
})

test('抽屉与浮动表单校验成功后关闭，侧栏清空恢复默认值', async ({ page }) => {
  await page.goto('/#/demo/form-manage/form-modal')
  await page.getByRole('button', { name: '打开抽屉', exact: true }).click()
  const drawer = page.locator('.n-drawer')
  await drawer.getByRole('button', { name: '保存', exact: true }).click()
  await expect(
    drawer.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await drawer.getByPlaceholder('请输入商品名称').fill('表单回归商品')
  await drawer.getByPlaceholder('请输入价格').fill('19.9')
  await select(page, drawer, '分类', '图书')
  await drawer.getByRole('button', { name: '保存', exact: true }).click()
  await expect(drawer).not.toBeVisible()

  await page.getByRole('button', { name: '打开浮动表单', exact: true }).click()
  const popover = page.locator('.popover-form')
  await popover.getByRole('button', { name: '保存', exact: true }).click()
  await expect(
    popover.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await popover.getByPlaceholder('请输入标题').fill('浮动编辑回归')
  await select(page, popover, '优先级', '中')
  await popover.getByRole('button', { name: '保存', exact: true }).click()
  await expect(popover).not.toBeVisible()

  await page.getByRole('button', { name: '侧边栏', exact: true }).click()
  const sidebar = page.locator('.sidebar-card')
  await sidebar.getByPlaceholder('请输入关键词').fill('筛选回归')
  await sidebar.getByRole('button', { name: '清空', exact: true }).click()
  await expect(sidebar.getByPlaceholder('请输入关键词')).toHaveValue('')
})

test('创建向导逐步校验，最终只有一个提交入口', async ({ page }) => {
  await page.goto('/#/demo/form-manage/form-modal')
  await page.getByRole('button', { name: '启动向导', exact: true }).click()
  const modal = page.locator('.n-modal').filter({ hasText: '项目创建向导' })
  await modal.getByRole('button', { name: /下一步/ }).click()
  await expect(modal.getByPlaceholder('请输入项目名称')).toBeVisible()
  await expect(
    modal.locator('.n-form-item-feedback--error').first()
  ).toBeVisible()
  await modal.getByPlaceholder('请输入项目名称').fill('表单回归项目')
  await modal.getByRole('button', { name: /下一步/ }).click()
  await select(page, modal, '项目模板', 'Vue 3 项目')
  await modal.getByRole('button', { name: /下一步/ }).click()
  await expect(modal.getByPlaceholder('请输入仓库地址')).toBeVisible()
  await expect(
    modal.getByRole('button', { name: '完成创建', exact: true })
  ).toHaveCount(1)
  await modal.getByRole('button', { name: '完成创建', exact: true }).click()
  await expect(modal).not.toBeVisible()
  await expect(
    page.getByText('项目配置已校验（演示，不会创建仓库）', { exact: true })
  ).toBeVisible()
})

test('搜索表单精简模板后条件、历史和展开状态互不串联', async ({ page }) => {
  await page.goto('/#/demo/form-manage/form-search')
  const sections = page
    .locator('.demo-section')
    .filter({ has: page.locator('.form-search') })
  await expect(sections).toHaveCount(3)
  const basic = sections.nth(0)
  const advanced = sections.nth(1)
  const searchButtons = (container: Locator) =>
    container.locator('.form-search-item-box').last().getByRole('button')
  await basic.getByPlaceholder('请输入用户名称').fill('独立基础条件')
  await searchButtons(basic).nth(0).click()
  await expect(page.locator('.demo-section pre')).toContainText('独立基础条件')
  await advanced.getByPlaceholder('请输入关键词搜索').fill('独立高级条件')
  await searchButtons(advanced).nth(2).click()
  await expect(advanced.getByPlaceholder('请输入版本号')).toBeVisible()
  await expect(basic.getByPlaceholder('请输入用户名称')).toHaveValue(
    '独立基础条件'
  )
  await searchButtons(advanced).nth(1).click()
  await expect(advanced.getByPlaceholder('请输入关键词搜索')).toHaveValue('')
  await expect(basic.getByPlaceholder('请输入用户名称')).toHaveValue(
    '独立基础条件'
  )
  await basic.getByPlaceholder('请输入用户名称').focus()
  await expect(basic.locator('.history-item')).toContainText('独立基础条件')
  await expect(advanced.locator('.input-history')).toHaveCount(0)
})

test('防抖表单保留指令行为，快速重复点击只执行一次', async ({ page }) => {
  await page.goto('/#/directives/debounce-direct')
  const form = page.locator('.n-form')
  await form.getByPlaceholder('请输入用户名').fill('debounce_tester')
  const submit = form.getByRole('button', {
    name: '提交表单 (防重复点击)',
    exact: true,
  })
  await submit.dblclick()
  await expect(page.getByText('提交次数: 1', { exact: true })).toBeVisible()
  await expect(page.getByText('提交成功!', { exact: true })).toBeVisible()
  await form.getByRole('button', { name: '重置', exact: true }).click()
  await expect(form.getByPlaceholder('请输入用户名')).toHaveValue('')
  await expect(form.getByPlaceholder('请输入邮箱')).toHaveValue('')
})
