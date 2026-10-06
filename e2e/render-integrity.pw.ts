/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\e2e\render-integrity.pw.ts
 * @Description: 验证实际绘制的文字像素，捕获 DOM 可见但 Chrome 合成层丢失的异常
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { installMockAdminSession } from './auth-fixture'
import routeData from '../src/assets/data/dynamicRouter.json' with { type: 'json' }

/** 从视口截图读取文字区域，而不是将 DOM 可见误当作实际绘制成功。 */
async function paintedTextPixels(page: Page, text: Locator): Promise<number> {
  const target = await text.evaluate(element => {
    const range = document.createRange()
    range.selectNodeContents(element)
    const r = range.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })!
    context.fillStyle = '#fff'
    context.fillRect(0, 0, 1, 1)
    const ancestors: Element[] = []
    for (
      let parent: Element | null = element;
      parent;
      parent = parent.parentElement
    ) {
      ancestors.push(parent)
    }
    for (const parent of ancestors.reverse()) {
      context.fillStyle = getComputedStyle(parent).backgroundColor
      context.fillRect(0, 0, 1, 1)
    }
    // Naive UI 暗色文字是半透明色，必须按背景合成后再核对像素。
    context.fillStyle = getComputedStyle(element).color
    context.fillRect(0, 0, 1, 1)
    return {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      color: [...context.getImageData(0, 0, 1, 1).data].slice(0, 3),
    }
  })
  // 在测试进程读取 PNG，不向被测页面注入大画布或干预其合成层。
  const image = PNG.sync.read(await page.screenshot())
  const scale = image.width / page.viewportSize()!.width
  const x = Math.max(0, Math.floor(target.x * scale))
  const y = Math.max(0, Math.floor(target.y * scale))
  const right = Math.min(image.width, x + Math.ceil(target.width * scale))
  const bottom = Math.min(image.height, y + Math.ceil(target.height * scale))
  let count = 0
  for (let row = y; row < bottom; row++) {
    for (let col = x; col < right; col++) {
      const offset = (row * image.width + col) * 4
      const distance = target.color.reduce(
        (sum, value, index) =>
          sum + Math.abs(value - image.data[offset + index]),
        0
      )
      if (distance < 100) count++
    }
  }
  return count
}

test('步骤条冷加载时正文、导航文字实际绘制完整', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/demo/steps')
  const title = page.locator('.c-steps .step-title').first()
  await expect(title).toBeVisible()
  // 等待首屏移除加载层及正常路由动画，保留浏览器真实合成行为。
  await page.waitForTimeout(1500)
  expect(
    await paintedTextPixels(page, title),
    '步骤文字必须有实际像素'
  ).toBeGreaterThan(8)
  const menu = page
    .locator('.menu-scroll-container .n-menu-item-content-header')
    .first()
  expect(
    await paintedTextPixels(page, menu),
    '导航文字必须有实际像素'
  ).toBeGreaterThan(8)
})

interface MenuRoute {
  path: string
  component?: string
  children?: MenuRoute[]
}

/** 直接从菜单数据获得页面，避免检查清单漏掉新的懒路由。 */
function collectPaths(items: MenuRoute[], parent = ''): string[] {
  return items.flatMap(item => {
    const path = item.path.startsWith('/')
      ? item.path
      : `${parent}/${item.path}`.replace(/\/{2,}/g, '/')
    if (item.children?.length) return collectPaths(item.children, path)
    return /^https?:/.test(path) || !item.component ? [] : [path]
  })
}

test('全部菜单页连续进入后，公共导航与步骤内容保持完整', async ({
  page,
}, testInfo) => {
  test.setTimeout(480_000)
  await installMockAdminSession(page)
  await page.goto('/#/demo/steps')
  await expect(page.locator('.steps-demo')).toBeVisible()
  const paths = collectPaths(routeData.data)
  // 同一浏览器必须连续导航，才能暴露懒路由驻留样式和动画的相互影响。
  /* eslint-disable no-await-in-loop */
  for (const path of paths) {
    await page.evaluate(path => {
      location.hash = path
    }, path)
    await expect(page).toHaveURL(
      new RegExp(`#${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    )
    await page.waitForTimeout(900)
    await expect(
      page.locator('[class*="-enter-active"], [class*="-leave-active"]')
    ).toHaveCount(0)
    await page.screenshot({
      path: testInfo.outputPath(`${path.replace(/\//g, '_')}.png`),
    })
    const menu = page
      .locator('.menu-scroll-container .n-menu-item-content-header')
      .first()
    if (await menu.count()) {
      expect(
        await paintedTextPixels(page, menu),
        `${path}: 公共导航必须实际绘制`
      ).toBeGreaterThan(8)
    }
    // 懒加载页面的样式仍驻留：返回同一内容，检查累计污染及 KeepAlive/动画交互。
    await page.evaluate(() => {
      location.hash = '/demo/steps'
    })
    const title = page.locator('.c-steps .step-title').first()
    await expect(title).toBeVisible()
    await page.waitForTimeout(700)
    expect(
      await paintedTextPixels(page, title),
      `${path}: 返回步骤页必须实际绘制`
    ).toBeGreaterThan(8)
    console.log(`绘制检查通过 ${path}`)
  }
  /* eslint-enable no-await-in-loop */
})

test('主题、菜单配色、窗口大小和滚动后正文持续绘制', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/demo/steps')
  await expect(page.locator('.steps-demo')).toBeVisible()
  const appearances = [
    ['glass-morphism', 'light', 'signature'],
    ['glass-morphism', 'dark', 'signature'],
    ['corporate-minimal', 'light', 'standard'],
    ['corporate-minimal', 'dark', 'standard'],
    ['dark-tech', 'dark', 'signature'],
  ]
  // 状态变化必须在同一个页面依次发生，覆盖旧合成层的更新与销毁。
  /* eslint-disable no-await-in-loop */
  for (const [style, mode, menuTheme] of appearances) {
    await page.evaluate(
      async ({ style, mode, menuTheme }) => {
        const app = (
          document.querySelector('#app') as HTMLElement & {
            __vue_app__: import('vue').App
          }
        ).__vue_app__
        const pinia = app.config.globalProperties.$pinia as {
          _s: Map<
            string,
            {
              setDesignStyle: (style: string) => Promise<void>
              setMode: (mode: string) => Promise<void>
              setMenuTheme: (menu: string) => void
            }
          >
        }
        const theme = pinia._s.get('theme-extended')!
        await theme.setDesignStyle(style)
        await theme.setMode(mode)
        theme.setMenuTheme(menuTheme)
      },
      { style, mode, menuTheme }
    )
    await page.waitForTimeout(800)
    await page.setViewportSize({ width: 1720, height: 640 })
    expect(
      await paintedTextPixels(
        page,
        page.locator('.c-steps .step-title').first()
      ),
      `${style}/${mode}: 小窗口文字实际绘制`
    ).toBeGreaterThan(8)
    await page.setViewportSize({ width: 3437, height: 1190 })
    await page.waitForTimeout(250)
    expect(
      await paintedTextPixels(
        page,
        page.locator('.c-steps .step-title').first()
      ),
      `${style}/${mode}: 宽屏文字实际绘制`
    ).toBeGreaterThan(8)
    const detail = page.locator('.step-detail h4')
    await detail.scrollIntoViewIfNeeded()
    expect(
      await paintedTextPixels(page, detail),
      `${style}/${mode}: 滚动后文字实际绘制`
    ).toBeGreaterThan(8)
    await page.locator('.steps-demo').evaluate(element => {
      element.closest('.n-layout-scroll-container')!.scrollTop = 0
    })
  }
  /* eslint-enable no-await-in-loop */
})
