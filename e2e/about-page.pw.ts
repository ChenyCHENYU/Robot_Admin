/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\about-page.pw.ts
 * @Description: 关于页主题、异步样式稳定性与依赖版本浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
const packageJson: {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
} = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
)

test('两组依赖行真实绘制，末页、搜索与空结果保持分页器高度', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.goto('/#/about')
  const sections = page.locator('.about-dependencies')
  const inspect = async (
    index: number,
    dependencies: Record<string, string>
  ) => {
    const section = sections.nth(index)
    await expect(section.locator('tbody tr')).toHaveCount(10)
    await expect(section).toContainText(
      `${Object.keys(dependencies).length} 个直接依赖`
    )
    const body = section.locator('.n-data-table-base-table-body')
    await body.scrollIntoViewIfNeeded()
    // DOM 有行、toBeVisible 为真也不能证明内容未被零高祖先裁掉。
    const rect = (await body.boundingBox())!
    expect(rect.height).toBeGreaterThan(350)
    const row = section.locator('tbody tr').first()
    await expect(row).toBeInViewport()
    const cell = row.locator('td').first()
    await expect
      .poll(() =>
        cell.evaluate(element => {
          const rect = element.getBoundingClientRect()
          return element.contains(
            document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2
            )
          )
        })
      )
      .toBe(true)
    const pagination = section.locator('.n-pagination')
    const offset = async () =>
      (await pagination.boundingBox())!.y - (await section.boundingBox())!.y
    const before = await offset()
    await pagination
      .locator('.n-pagination-item:not(.n-pagination-item--button)')
      .last()
      .click()
    await expect(section.locator('tbody tr')).toHaveCount(
      Object.keys(dependencies).length % 10 || 10
    )
    expect(Math.abs((await offset()) - before)).toBeLessThan(2)
  }
  await inspect(0, packageJson.dependencies)
  await inspect(1, packageJson.devDependencies)
  const search = page.getByPlaceholder('搜索技术、包名或场景')
  await search.fill('vite')
  await expect(sections.last().locator('tbody')).toContainText('vite')
  const { height } = (await sections.last().boundingBox())!
  await search.fill('no-such-package-regression')
  await expect(sections.last().locator('.n-empty')).toContainText('无数据')
  expect((await sections.last().boundingBox())!.height).toBeCloseTo(height, 1)
  await search.clear()
  await expect(sections.last().locator('tbody tr')).toHaveCount(10)
})

const componentVersion = JSON.parse(
  readFileSync(
    new URL(
      '../node_modules/@robot-admin/naive-ui-components/package.json',
      import.meta.url
    ),
    'utf8'
  )
).version

test('关于页展示安装版本，跨页面加载样式后卡片与主题保持稳定', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await installMockAdminSession(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/#/about')
  await expect(page.locator('.about-page')).toBeVisible()
  await expect(page.locator('.about-hero__meta')).toContainText(
    componentVersion
  )
  await expect(
    page
      .locator('.about-tech__package')
      .filter({ hasText: '@robot-admin/naive-ui-components' })
  ).toBeVisible()
  await expect(page.getByText('Robot UI', { exact: true })).toHaveCount(0)
  const firstCard = page.locator('.about-tech').first()
  const before = await firstCard.evaluate(element => ({
    display: getComputedStyle(element).display,
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
  }))
  await page.goto('/#/demo/icon')
  await page.goto('/#/home')
  await page.goto('/#/about')
  await expect(firstCard).toBeVisible()
  const after = await firstCard.evaluate(element => ({
    display: getComputedStyle(element).display,
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
  }))
  expect(after.display).toBe(before.display)
  // 浏览器的变换与子像素舍入允许极小误差，仍能捕获异步样式造成的布局错乱。
  expect(after.width).toBeCloseTo(before.width, 1)
  expect(after.height).toBeCloseTo(before.height, 1)
  await page.locator('[data-guide="theme"] button').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect
    .poll(() =>
      firstCard.evaluate(element => getComputedStyle(element).backgroundColor)
    )
    .toBe('rgb(255, 255, 255)')
  const light = await firstCard.evaluate(
    element => getComputedStyle(element).backgroundColor
  )
  await page.locator('[data-guide="theme"] button').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect
    .poll(() =>
      firstCard.evaluate(element => getComputedStyle(element).backgroundColor)
    )
    .toBe('rgb(28, 28, 28)')
  const dark = await firstCard.evaluate(
    element => getComputedStyle(element).backgroundColor
  )
  expect(light).not.toBe(dark)
  await page.getByRole('button', { name: '查看 业务组件库 详情' }).click()
  await expect(page.locator('.about-detail__fields')).toContainText(
    componentVersion
  )
  expect(pageErrors).toEqual([])
})

test('关于页窄屏无页面横向溢出，依赖表与技术卡片共享搜索条件', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/about')
  await expect(page.locator('.about-page')).toBeVisible()
  const overflow = await page
    .locator('.about-page')
    .evaluate(element => element.scrollWidth > element.clientWidth)
  expect(overflow).toBe(false)
  await page
    .getByPlaceholder('搜索技术、包名或场景')
    .fill('@robot-admin/naive-ui-components')
  await expect(page.locator('.about-tech')).toHaveCount(1)
  await expect(
    page.locator('.about-dependencies').first().getByRole('row')
  ).toHaveCount(2)
  await expect(page.locator('.about-dependencies').last()).toContainText(
    '0 个直接依赖'
  )
})
