/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 线上包编辑工作区的规则、试算、输入与响应式回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 首屏遮罩离开后再验证实际可交互区域，避免把后台 DOM 当作页面可见。 */
async function openEditor(page: Page, route: string): Promise<void> {
  await page.goto(`/#/editor/${route}`)
  await expect(page.locator('.app-loading')).toBeHidden({ timeout: 15_000 })
  await expect(page.locator('.c-page-loading')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('Cron 一个实例串联模板、待应用规则、校验与重置', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openEditor(page, 'cron-editor')
  await expect(page.locator('.c-cron')).toHaveCount(1)
  const input = page.getByRole('textbox', { name: 'Cron 表达式' })
  const preview = page.getByRole('complementary', { name: '执行计划预览' })
  await expect(preview.locator('time')).toHaveCount(5)
  await page.getByRole('button', { name: /工作日提醒/ }).click()
  await expect(input).toHaveValue('0 0 9 ? * 2-6')
  await expect(preview.locator('time')).toHaveCount(5)
  expect(
    await preview.locator('time').evaluateAll(items =>
      items.every(item => {
        const day = new Date(item.getAttribute('datetime')!).getDay()
        return day > 0 && day < 6
      })
    )
  ).toBe(true)
  await input.fill('0 0 0 * * ?')
  await expect(preview.locator('time')).toHaveCount(0)
  await expect(preview).toContainText('应用表达式后更新计划')
  await input.press('Enter')
  await expect(preview.locator('time')).toHaveCount(5)
  await input.fill('0/0 0 0 * * ?')
  await expect(preview.locator('time')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '应用', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: '重置', exact: true }).click()
  await expect(input).toHaveValue('0 30 8 * * ?')
  await expect(preview.locator('time')).toHaveCount(5)
  expect(errors).toEqual([])
})

test('公式试算保留零，隔离数据且重置恢复场景', async ({ page }) => {
  await openEditor(page, 'formula-editor')
  await expect(page.locator('.c-formula')).toHaveCount(1)
  const result = page.locator('.formula-preview__result-value')
  await expect(result).toHaveText('84')
  const completed = page.getByRole('textbox', { name: '试算值：完成任务' })
  await completed.fill('25')
  await completed.blur()
  await expect(result).toHaveText('50')
  await page.getByRole('button', { name: /交付达成率/ }).click()
  await expect(result).toHaveText('50')
  await page.getByRole('textbox', { name: '试算值：计划任务' }).fill('0')
  await expect(result).toHaveText('0')
  await page.getByRole('button', { name: '重置', exact: true }).click()
  await expect(result).toHaveText('84')
  await expect(completed).toHaveValue('42')
  await page.getByRole('button', { name: /质量门禁/ }).click()
  await expect(result).toHaveText('可交付')
  await page.getByRole('textbox', { name: '试算值：阻断问题' }).fill('1')
  await expect(result).toHaveText('需要复核')
  await page.getByRole('button', { name: /构建预算/ }).click()
  await expect(result).toHaveText('40')
  await page.getByRole('button', { name: /预算检查/ }).click()
  await expect(result).toHaveText('真 · true')
})

test('原生输入准确插入变量、定位错误、支持文本与常量结果', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openEditor(page, 'formula-editor')
  const input = page.getByRole('textbox', { name: '公式输入', exact: true })
  await input.fill('1 + 2')
  await expect(page.locator('.formula-preview__result-value')).toHaveText('3')
  await input.evaluate((element: HTMLTextAreaElement) => {
    element.setSelectionRange(4, 5)
    element.dispatchEvent(new Event('select', { bubbles: true }))
  })
  await page
    .locator('.variable-panel__item')
    .filter({ hasText: '完成任务' })
    .click()
  await expect(input).toHaveValue('1 + [完成任务]')
  await expect(page.locator('.formula-preview__result-value')).toHaveText('43')
  await input.fill('1 + * 2')
  await page.getByRole('button', { name: '定位错误', exact: true }).click()
  expect(
    await input.evaluate(
      (element: HTMLTextAreaElement) => element.selectionStart
    )
  ).toBe(4)
  await expect(page.locator('.formula-preview__result-value')).toHaveCount(0)
  await input.fill('IF(TRUE, "中文 [原样] <标签>", "other")')
  await expect(page.locator('.formula-preview__result-value')).toHaveText(
    '中文 [原样] <标签>'
  )
  await expect(
    page.locator('.formula-input__tokens .formula-token--variable')
  ).toHaveCount(0)
  expect(errors).toEqual([])
})

for (const route of ['cron-editor', 'formula-editor']) {
  for (const dark of [false, true]) {
    test(`${route} ${dark ? '暗' : '亮'}色窄屏不溢出，切页不污染菜单`, async ({
      page,
    }, testInfo) => {
      if (dark)
        await page.addInitScript(() =>
          localStorage.setItem('theme-mode', 'dark')
        )
      await page.setViewportSize({ width: 430, height: 932 })
      await openEditor(page, route)
      const root = page.locator(
        route === 'cron-editor' ? '.c-cron' : '.c-formula'
      )
      await expect(root).toBeVisible()
      if (route === 'formula-editor') {
        const card = page
          .locator('.formula-demo-page__scenarios button')
          .first()
        expect(
          await card.evaluate(
            element => getComputedStyle(element).borderTopWidth
          )
        ).toBe('1px')
        await expect(card).toHaveAttribute('aria-pressed', 'true')
      }
      expect(
        await root.evaluate(
          element => element.scrollWidth <= element.clientWidth + 1
        )
      ).toBe(true)
      await page.screenshot({
        path: testInfo.outputPath(
          `${route}-${dark ? 'dark' : 'light'}-mobile.png`
        ),
        fullPage: true,
        animations: 'disabled',
      })
      await page.evaluate(() => {
        location.hash = '#/demo/steps'
      })
      await expect(page.locator('.steps-demo')).toBeVisible()
      await expect(
        page.locator('.steps-demo .step-title').first()
      ).toBeVisible()
    })
  }
}
