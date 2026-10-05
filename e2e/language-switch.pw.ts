/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\language-switch.pw.ts
 * @Description: 生产构建的语言切换、词典按需加载与刷新持久化回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 从组件库真实菜单选择语言，等待词典与应用重新准备完毕。 */
async function selectLanguage(
  page: Page,
  label: string,
  htmlLang: string
): Promise<void> {
  await page.locator('[data-guide="language"] button').hover()
  await page.getByText(label, { exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', htmlLang)
  await expect(page.locator('[data-guide="language"]')).toBeVisible()
}

test('语言菜单切换正文、模块配置、已有标签与面包屑，保留公司和页面', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await page.locator('.home-secondary-link').click()
  await expect(page.locator('.about-layout')).toBeVisible()
  const locationBeforeSwitch = page.url()
  await selectLanguage(page, 'English', 'en')
  await expect(page).toHaveURL(locationBeforeSwitch)
  await expect(page.locator('.about-heading h1')).toHaveText(
    'Technical profile'
  )
  await expect(page.locator('.about-selection h3').first()).toHaveText(
    'Core frameworks and tooling'
  )
  await expect(page.locator('[data-guide="tags"]')).toContainText('Home')
  await expect(page.locator('[data-guide="tags"]')).toContainText('About')
  await page.reload()
  await expect(page.locator('.about-heading h1')).toHaveText(
    'Technical profile'
  )
  await selectLanguage(page, '日本語', 'ja')
  await expect(page.locator('.about-heading h1')).toHaveText('技術構成')
  await selectLanguage(page, '한국어', 'ko')
  await expect(page.locator('.about-heading h1')).toHaveText('기술 구성')
  await selectLanguage(page, '简体中文', 'zh-CN')
  await expect(page.locator('.about-heading h1')).toHaveText('项目技术档案')
  await page.goto('/#/home')
  await expect(page.locator('.enterprise-overview__company')).toHaveText(
    '江苏金恒（南京）'
  )
  expect(errors).toEqual([])
})

for (const language of ['zh-cn', 'en', 'ja', 'ko'] as const) {
  test(`${language} 启动仅加载选中的词典，正文与模块级配置一起翻译`, async ({
    page,
  }) => {
    const dictionaries: string[] = []
    page.on('request', request => {
      const match = new URL(request.url()).pathname.match(
        /\/js\/(en|ja|ko)-[^/]+\.js$/
      )
      if (match) dictionaries.push(match[1])
    })
    await installMockAdminSession(page)
    await page.addInitScript(
      language => localStorage.setItem('robot_admin', language),
      language
    )
    await page.goto('/#/home')
    const headings = {
      'zh-cn': '一个工程底座，多种架构可能。',
      en: 'One foundation. Multiple architectures.',
      ja: '一つの基盤で、多様なアーキテクチャを。',
      ko: '하나의 기반, 다양한 아키텍처.',
    }
    await expect(page.locator('.home-intro h2')).toHaveText(headings[language])
    await expect(page.locator('.enterprise-overview__company')).toHaveText(
      '江苏金恒（南京）'
    )
    if (language === 'en') {
      await expect(page.locator('.home-architecture').first()).toContainText(
        'Current application'
      )
      await expect(page.locator('.home-entry-grid')).toContainText(
        'User Management'
      )
    }
    expect(dictionaries).toEqual(language === 'zh-cn' ? [] : [language])
  })
}

test('翻译资源加载失败时回退中文，保留登录后的工作空间', async ({ page }) => {
  await installMockAdminSession(page)
  await page.addInitScript(() => localStorage.setItem('robot_admin', 'en'))
  await page.route('**/js/en-*.js', route => route.abort())
  await page.goto('/#/home')
  await expect(page.locator('.home-intro h2')).toHaveText(
    '一个工程底座，多种架构可能。'
  )
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('.enterprise-overview__company')).toHaveText(
    '江苏金恒（南京）'
  )
})
