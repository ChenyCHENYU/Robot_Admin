/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 真实路由模块等待、快速跳转、主题、取消与失败恢复的加载反馈回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const stepsModule =
  /(?:\/js\/31-steps-[^/]+\.js|\/src\/views\/demo\/31-steps\/index\.vue(?:\?.*)?)$/

/** 通过真实浏览器地址导航，不直接访问组件或隐藏的应用状态。 */
const navigate = (page: Page, path: string) =>
  page.evaluate(target => {
    window.location.hash = target
  }, path)

/** 首屏加载完成后开始路由切换，避免把两类反馈混为一谈。 */
const openWorkspace = async (page: Page, dark = false) => {
  await installMockAdminSession(page)
  if (dark)
    await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/#/sys-manage/role-manage')
  await expect(page.locator('.role-management tbody')).toContainText(
    '超级管理员'
  )
  await expect(page.locator('.app-loading')).toBeHidden()
  await expect(page.locator('.c-page-loading')).toHaveCount(0)
}

/** 仅在测试中阻塞一个尚未加载的真实页面模块，结束后立即放行。 */
const holdSteps = async (page: Page) => {
  let release!: () => void
  const barrier = new Promise<void>(resolve => {
    release = resolve
  })
  await page.route(stepsModule, async route => {
    await barrier
    await route.continue()
  })
  return release
}

for (const dark of [false, true]) {
  test(`${dark ? '暗色' : '亮色'}慢路由显示波形 SVG，模块就绪后结束且保留布局`, async ({
    page,
  }, info) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await openWorkspace(page, dark)
    const release = await holdSteps(page)
    await navigate(page, '/demo/steps')
    const overlay = page.locator('.c-page-loading')
    try {
      await expect(overlay.getByRole('status')).toBeVisible()
      await expect(overlay.locator('svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      )
      expect(
        await overlay.evaluate(el => getComputedStyle(el).pointerEvents)
      ).toBe('none')
      const colors = await overlay.evaluate(el => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--c-primary)'
        document.querySelector('.role-management')!.append(probe)
        const primary = getComputedStyle(probe).color
        probe.remove()
        return { color: getComputedStyle(el).color, primary }
      })
      expect(colors.color).toBe(colors.primary)
      await expect(page.locator('.role-management')).toBeVisible()
      await page.screenshot({
        path: info.outputPath(`page-loading-${dark ? 'dark' : 'light'}.png`),
      })
    } finally {
      release()
    }
    await expect(
      page.getByText('进度步骤条组件场景示例', { exact: true })
    ).toBeVisible()
    await expect(overlay).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('缓存页快速切换不闪遮罩，也不延长路由', async ({ page }) => {
  await openWorkspace(page)
  await navigate(page, '/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await expect(page.locator('.c-page-loading')).toHaveCount(0)
  // 观测真实挂载次数，验证遮罩从未插入，而非恰好错过一帧。
  await page.evaluate(() => {
    let seen = false
    const observer = new MutationObserver(records => {
      if (
        records.some(record =>
          [...record.addedNodes].some(
            node =>
              node instanceof Element &&
              (node.matches('.c-page-loading') ||
                node.querySelector('.c-page-loading'))
          )
        )
      )
        seen = true
    })
    observer.observe(document.body, { childList: true, subtree: true })
    document.body.dataset.finishLoadingObservation = 'pending'
    window.addEventListener(
      'finish-loading-observation',
      () => {
        observer.disconnect()
        document.body.dataset.finishLoadingObservation = String(seen)
      },
      { once: true }
    )
  })
  await navigate(page, '/sys-manage/role-manage')
  await expect(page.locator('.role-management tbody')).toContainText(
    '超级管理员'
  )
  await page.evaluate(() =>
    window.dispatchEvent(new Event('finish-loading-observation'))
  )
  await expect(page.locator('body')).toHaveAttribute(
    'data-finish-loading-observation',
    'false'
  )
})

test('慢导航途中换页，旧模块迟到不会恢复遮罩或覆盖目标页', async ({ page }) => {
  await openWorkspace(page)
  const release = await holdSteps(page)
  await navigate(page, '/demo/steps')
  try {
    await expect(page.locator('.c-page-loading')).toBeVisible()
    await navigate(page, '/home')
    await expect(page.locator('.project-homepage')).toBeVisible()
    await expect(page.locator('.c-page-loading')).toHaveCount(0)
  } finally {
    release()
  }
  await expect(page).toHaveURL(/#\/home$/)
  await expect(
    page.getByText('进度步骤条组件场景示例', { exact: true })
  ).toHaveCount(0)
  await expect(page.locator('.c-page-loading')).toHaveCount(0)
})

test('减少动态效果时保留清晰状态提示，轨道与波形停止动画', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openWorkspace(page)
  const release = await holdSteps(page)
  await navigate(page, '/demo/steps')
  try {
    const status = page.locator('.c-page-loading').getByRole('status')
    await expect(status).toBeVisible()
    expect(
      await status
        .locator('svg [class]')
        .evaluateAll(elements =>
          elements.every(el => getComputedStyle(el).animationName === 'none')
        )
    ).toBe(true)
  } finally {
    release()
  }
  await expect(page.locator('.c-page-loading')).toHaveCount(0)
})

test('模块失败后走既有恢复流程，页面恢复时没有遗留遮罩', async ({ page }) => {
  await openWorkspace(page)
  let failed = false
  await page.route(stepsModule, async route => {
    if (!failed) {
      failed = true
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await navigate(page, '/demo/steps')
  await expect.poll(() => failed).toBe(true)
  // 正式产物仅自动刷新恢复一次；模块重新获取成功后应用正常挂载。
  await expect(
    page.getByText('进度步骤条组件场景示例', { exact: true })
  ).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.c-page-loading')).toHaveCount(0)
  await expect(page.locator('.app-loading')).toBeHidden()
})
