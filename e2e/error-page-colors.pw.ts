/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\error-page-colors.pw.ts
 * @Description: 异常页冷加载与导航后的真实渐变配色回归，防止懒加载扫描遗漏
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const errorPages = [
  { code: '401', from: 'rgb(248', via: 'rgb(127', icon: 'rgb(251, 146, 60)' },
  { code: '403', from: 'rgb(96', via: 'rgb(30', icon: 'rgb(129, 140, 248)' },
  { code: '404', from: 'rgb(34', via: 'rgb(88', icon: 'rgb(192, 132, 252)' },
  { code: '500', from: 'rgb(52', via: 'rgb(6', icon: 'rgb(45, 212, 191)' },
]
for (const error of errorPages) {
  test(`${error.code} 冷加载、刷新和跨页面返回保持彩色渐变`, async ({
    page,
  }) => {
    await installMockAdminSession(page)
    /** 每次导航完成后检查真实浏览器配色，不依赖类名存在。 */
    const assertColors = async () => {
      const code = page.locator('.min-h-screen h1')
      await expect(code).toHaveText(error.code)
      const colors = await code.evaluate(element => {
        const style = getComputedStyle(element)
        const wrapper = element.closest('.min-h-screen')!
        const icon = wrapper.querySelector('[class*="text-6xl"]')!
        return {
          text: style.backgroundImage,
          background: getComputedStyle(wrapper).backgroundImage,
          icon: getComputedStyle(icon).color,
          filter: getComputedStyle(document.documentElement).filter,
        }
      })
      expect(colors.text).toContain(error.from)
      expect(colors.background).toContain(error.via)
      expect(colors.icon).toBe(error.icon)
      expect(colors.filter).toBe('none')
      await expect(
        page.getByRole('button', { name: '返回首页', exact: true })
      ).toHaveCSS('background-image', /linear-gradient/)
    }
    await page.goto(`/#/error-page/${error.code}`)
    await assertColors()
    const particles = page.locator('[data-error-particle]')
    await expect(particles).toHaveCount(20)
    const positions = await particles.evaluateAll(elements =>
      elements.map(el => el.getAttribute('style'))
    )
    await expect(page.locator('.error-screen__countdown')).toContainText('4秒')
    expect(
      await particles.evaluateAll(elements =>
        elements.map(el => el.getAttribute('style'))
      )
    ).toEqual(positions)
    await page.reload()
    await assertColors()
    await page.goto('/#/home')
    await page.goto(`/#/error-page/${error.code}`)
    await assertColors()
    await page.getByRole('button', { name: '返回首页', exact: true }).click()
    await expect(page.locator('.enterprise-overview')).toBeVisible()
  })
}

for (const path of ['/401', '/404']) {
  test(`免登录 ${path} 入口同样保留配色`, async ({ page }) => {
    await page.goto(`/#${path}`)
    const code = page.locator('.min-h-screen h1')
    await expect(code).toHaveText(path === '/401' ? '401' : '404')
    await expect(code).toHaveCSS('background-image', /linear-gradient/)
  })
}
