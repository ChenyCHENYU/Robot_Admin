/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\e2e\workspace-tabs.pw.ts
 * @Description: 真实标签导航验证路由过渡、工作台和 MachTable 往返显示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { installMockAdminSession } from './auth-fixture'

const machPath = '/demo/table-manage/mach-table'
const workbenchPath = '/production-sales/sales-orders'

/** 打开菜单目标建立标签；后续往返一律点击实际标签控件。 */
const openRoute = (page: Page, path: string) =>
  page.evaluate(async target => {
    const app = (
      document.querySelector('#app') as HTMLElement & {
        __vue_app__: App
      }
    ).__vue_app__
    await (app.config.globalProperties.$router as Router).push(target)
  }, path)

/** 比较公开主题令牌，确保工作台、场景表格与全屏使用同一套主题。 */
const readGridTheme = (grid: Locator) =>
  grid.evaluate(element => {
    const style = getComputedStyle(element)
    return [
      '--mach-header-bg',
      '--mach-header-fg',
      '--mach-header-accent-color',
      '--mach-body-bg',
      '--mach-body-fg',
      '--mach-border-color',
      '--mach-row-border-color',
      '--mach-zebra-bg',
      '--mach-font-size',
    ].map(name => style.getPropertyValue(name).trim())
  })

/** 全屏控件已在视口内，按实际鼠标坐标点击，避免自动化滚动嵌套容器后再点击。 */
const clickVisibleButton = async (button: Locator): Promise<void> => {
  await expect(button).toBeInViewport({ ratio: 1 })
  const box = (await button.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  expect(
    await button.evaluate(
      (element, point) => {
        const hit = document.elementFromPoint(point.x, point.y)
        return hit !== null && element.contains(hit)
      },
      { x, y }
    )
  ).toBe(true)
  await button.page().mouse.click(x, y)
}

for (const mode of ['light', 'dark', 'reduced-motion'] as const) {
  test(`${mode}：工作台经 tags 往返 MachTable 与首页，保留草稿和原生主题`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await installMockAdminSession(page)
    await page.addInitScript(
      theme => localStorage.setItem('theme-mode', theme),
      mode === 'dark' ? 'dark' : 'light'
    )
    if (mode === 'reduced-motion')
      await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1720, height: 1280 })
    await page.goto('/#/home')
    await expect(page.locator('.project-homepage')).toBeVisible()
    await openRoute(page, machPath)
    const machRow = page
      .locator('.mach-demo-grid .mach-body-viewport--scroll .mach-row[data-id]')
      .first()
    await expect(machRow).toBeVisible()
    const nativeTheme = await readGridTheme(
      page.locator('.mach-demo-grid .mach-root')
    )
    const quickFilter = page.getByPlaceholder('搜索订单、客户、产品或区域')
    await quickFilter.fill('星海')
    await openRoute(page, workbenchPath)
    await expect(page.getByTestId('active-order')).toHaveText('SO-2026-001')
    const note = page
      .locator('.workbench-header .n-form-item')
      .filter({
        has: page.locator('.n-form-item-label', { hasText: '订单备注' }),
      })
      .getByRole('textbox')
    await note.fill('标签往返保留的未保存草稿')
    // 每轮依赖上一轮恢复的真实路由与缓存状态，不能并发点击导航。
    /* eslint-disable no-await-in-loop */
    for (let round = 0; round < 3; round++) {
      await page.locator(`.tags-track [data-path="${machPath}"]`).click()
      await expect(page).toHaveURL(new RegExp(`${machPath}$`))
      await expect(machRow).toBeVisible()
      // Mach 演示路由显式 keepAlive:false，离开后应重建；工作台草稿则必须保留。
      await expect(quickFilter).toHaveValue('')
      await page.locator('.tags-track [data-path="/home"]').click()
      await expect(page.locator('.project-homepage')).toBeVisible()
      await page.locator(`.tags-track [data-path="${workbenchPath}"]`).click()
      await expect(page.getByTestId('active-order')).toHaveText('SO-2026-001')
      await expect(
        page
          .getByTestId('line-panel')
          .locator('.mach-body-viewport--scroll .mach-row[data-id]')
      ).toHaveCount(3)
      await expect(note).toHaveValue('标签往返保留的未保存草稿')
      await expect(page.getByTestId('draft-status')).toHaveText('有未保存修改')
      await expect(
        page.getByRole('heading', { name: '销售订单协同', exact: true })
      ).toBeInViewport()
      await expect(page.locator('.form-search-card')).toBeInViewport({
        ratio: 1,
      })
    }
    /* eslint-enable no-await-in-loop */
    await Promise.all(
      (await page.locator('.business-workbench .mach-root').all()).map(
        async grid => {
          expect(await readGridTheme(grid)).toEqual(nativeTheme)
        }
      )
    )
    const readPageScroll = () =>
      page.getByTestId('business-workbench').evaluate(element => {
        const positions: number[] = []
        for (
          let parent = element.parentElement;
          parent;
          parent = parent.parentElement
        )
          positions.push(parent.scrollTop)
        return positions
      })
    await expect(page.getByTestId('business-workbench')).not.toHaveClass(
      /-enter-|-leave-/
    )
    const beforeFullscreen = await readPageScroll()
    await clickVisibleButton(
      page.getByRole('button', { name: '明细全屏', exact: true })
    )
    await expect(
      page.getByRole('button', { name: '退出明细全屏', exact: true })
    ).toBeFocused()
    expect(
      await readGridTheme(page.getByTestId('line-panel').locator('.mach-root'))
    ).toEqual(nativeTheme)
    await clickVisibleButton(
      page.getByRole('button', { name: '退出明细全屏', exact: true })
    )
    await expect(
      page.getByRole('button', { name: '明细全屏', exact: true })
    ).toBeFocused()
    await expect.poll(readPageScroll).toEqual(beforeFullscreen)
    // 同一事件任务内快速切换真实标签，验证过渡被后续导航接管后仍可恢复。
    await page.locator('.tags-track').evaluate(track => {
      track
        .querySelector<HTMLElement>(
          '[data-path="/demo/table-manage/mach-table"]'
        )!
        .click()
      track.querySelector<HTMLElement>('[data-path="/home"]')!.click()
    })
    await expect(page.locator('.project-homepage')).toBeVisible()
    await page.locator(`.tags-track [data-path="${workbenchPath}"]`).click()
    await expect(note).toHaveValue('标签往返保留的未保存草稿')
    await expect(
      page.getByRole('heading', { name: '销售订单协同', exact: true })
    ).toBeInViewport()
    await expect(page.locator('.form-search-card')).toBeInViewport({ ratio: 1 })
    await page.screenshot({
      path: testInfo.outputPath(`workbench-after-tags-${mode}.png`),
    })
    expect(errors).toEqual([])
  })
}
