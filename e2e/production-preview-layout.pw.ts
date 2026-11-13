/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \Robot_Admin\e2e\production-preview-layout.pw.ts
 * @Description: 正式预发产物的免登录产销预览，核对宽窄矮屏控件、分页与原生横轨
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'
import { expectFirstPagerUsable } from './d_paginationGeometry'

const scenes = [
  {
    route: 'sales-orders',
    root: 'business-workbench',
    search: '.workbench-search',
    grids: [
      { selector: '.workbench-master-grid', paged: true },
      { selector: '.workbench-detail-grid', paged: false },
    ],
  },
  {
    route: 'remote-workbench',
    root: 'remote-workbench',
    search: '.ps-search',
    grids: [
      { selector: '.remote-order-grid', paged: true },
      { selector: '.remote-detail-grid', paged: true },
    ],
  },
  {
    route: 'production-matrix',
    root: 'production-matrix',
    search: '.matrix-toolbar',
    grids: [{ selector: '.matrix-grid', paged: false }],
  },
] as const

/** 通过实际文字范围和控件命中，防止元素存在但被标题覆盖或尺寸压成零。 */
async function expectReadableSearch(root: Locator, selector: string) {
  const search = root.locator(selector)
  // 自然滚动页居中对齐，避免 nearest 将亚像素边界放在视口外；仍严格验收全卡可见。
  await search.evaluate(element =>
    element.scrollIntoView({ block: 'center', inline: 'nearest' })
  )
  await expect(search).toBeInViewport({ ratio: 1 })
  const heading = root.locator('.business-page-heading')
  const boxes = await Promise.all([heading.boundingBox(), search.boundingBox()])
  expect(boxes[1]!.y).toBeGreaterThanOrEqual(boxes[0]!.y + boxes[0]!.height - 1)
  const labels = await search
    .locator('.n-form-item-label:visible')
    .evaluateAll(elements =>
      elements
        .filter(element => element.textContent?.trim())
        .map(element => {
          const text = element.ownerDocument.createRange()
          text.selectNodeContents(element)
          const box = element.getBoundingClientRect()
          const bounds = text.getBoundingClientRect()
          return (
            bounds.width > 0 &&
            bounds.left >= box.left - 1 &&
            bounds.right <= box.right + 1
          )
        })
    )
  expect(labels.every(Boolean), '搜索标签应完整容纳实际文字').toBe(true)
  if (selector !== '.matrix-toolbar') expect(labels.length).toBeGreaterThan(0)
  const inputs = await search.getByRole('textbox').all()
  await Promise.all(
    inputs.map(async input => {
      expect((await input.boundingBox())!.width).toBeGreaterThanOrEqual(80)
    })
  )
  const action = selector === '.matrix-toolbar' ? '检测报表' : '搜索'
  await search
    .getByRole('button', { name: action, exact: true })
    .click({ trial: true })
}

/** 横轨必须位于自己的网格根内且可真实命中；不通过改变业务数据制造滚动。 */
async function expectGridReachable(grid: Locator, paged: boolean) {
  const root = grid.locator('.mach-root')
  const viewport = root.locator('.mach-body-viewport--scroll')
  await viewport.scrollIntoViewIfNeeded()
  await expect(
    root.locator('.mach-pane--center .mach-row[data-id]').first()
  ).toBeVisible()
  const overflow = await viewport.evaluate(
    element => element.scrollWidth > element.clientWidth + 1
  )
  if (overflow) {
    await viewport.evaluate(element => {
      element.scrollLeft = element.scrollWidth
    })
    await expect
      .poll(() => viewport.evaluate(element => element.scrollLeft))
      .toBeGreaterThan(0)
  }
  // 预览页可自然纵向滚动；对齐正文底部后再检查横轨，而非仅露出部分表体。
  await viewport.evaluate(element =>
    element.scrollIntoView({ block: 'end', inline: 'nearest' })
  )
  const track = await viewport.evaluate(element => {
    const viewport = element as HTMLElement
    const box = viewport.getBoundingClientRect()
    const root = viewport.closest('.mach-root')!.getBoundingClientRect()
    const height = viewport.offsetHeight - viewport.clientHeight
    const hit = viewport.ownerDocument.elementFromPoint(
      box.left + viewport.clientWidth / 2,
      box.top + viewport.clientHeight + height / 2
    )
    return {
      inside:
        box.left >= root.left &&
        box.right <= root.right + 0.5 &&
        box.bottom <= root.bottom + 0.5,
      height,
      hit: hit === viewport,
      hitClass: hit?.className,
      bottom: box.bottom,
      windowHeight: window.innerHeight,
    }
  })
  expect(track.inside, '正文与横轨应在本网格根内').toBe(true)
  if (overflow) {
    expect(track.height, '溢出时应保留可操作横轨').toBeGreaterThan(0)
    expect(
      track.hit,
      `原生横轨中点应命中自己的视口：${JSON.stringify(track)}`
    ).toBe(true)
  }
  const pagination = root.locator('.mach-pagination')
  if (paged) {
    await pagination.scrollIntoViewIfNeeded()
    await expectFirstPagerUsable(pagination)
  } else await expect(pagination).toBeHidden()
}

for (const scene of scenes) {
  for (const size of [
    { name: 'wide', width: 1720, height: 1100 },
    { name: 'narrow', width: 760, height: 900 },
    { name: 'short', width: 1640, height: 700 },
  ]) {
    test(`预发免登录 ${scene.route} ${size.name}：搜索、分页及横轨实际可用`, async ({
      page,
    }, info) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize(size)
      await page.goto(
        `http://127.0.0.1:4174/#/preview/production-sales/${scene.route}`
      )
      const root = page.getByTestId(scene.root)
      await expect(root).toBeVisible({ timeout: 20_000 })
      await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
      await expect(
        root.locator('.mach-pane--center .mach-row[data-id]').first()
      ).toBeVisible()
      await expectReadableSearch(root, scene.search)
      // 各表会滚动外层页面；顺序验收，避免并行滚动相互抢占命中坐标。
      for (const grid of scene.grids)
        // eslint-disable-next-line no-await-in-loop
        await expectGridReachable(root.locator(grid.selector), grid.paged)
      await expectReadableSearch(root, scene.search)
      expect(
        await root.evaluate(
          element => element.scrollWidth - element.clientWidth
        )
      ).toBeLessThanOrEqual(1)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(1)
      await page.screenshot({
        path: info.outputPath(`${scene.route}-${size.name}.png`),
        animations: 'disabled',
      })
      expect(errors).toEqual([])
    })
  }
}
