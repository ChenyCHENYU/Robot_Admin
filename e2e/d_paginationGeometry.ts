/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \Robot_Admin\e2e\d_paginationGeometry.ts
 * @Description: 分页首屏的实际裁切与可访问控件命中验收，排除浏览器亚像素舍入
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, type Locator } from '@playwright/test'

/** 按实际祖先裁切边界验收外框，并严格检查可见控件；允许不足半像素的 IO 舍入。 */
export async function expectFirstPagerUsable(pagination: Locator) {
  await expect(pagination).toBeVisible()
  const clipped = await pagination.evaluate(element => {
    const target = element.getBoundingClientRect()
    let left = 0
    let top = 0
    let right = window.innerWidth
    let bottom = window.innerHeight
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      const rect = parent.getBoundingClientRect()
      const style = getComputedStyle(parent)
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
        left = Math.max(left, rect.left + parseFloat(style.borderLeftWidth))
        right = Math.min(right, rect.right - parseFloat(style.borderRightWidth))
      }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
        top = Math.max(top, rect.top + parseFloat(style.borderTopWidth))
        bottom = Math.min(
          bottom,
          rect.bottom - parseFloat(style.borderBottomWidth)
        )
      }
    }
    return Math.max(
      0,
      left - target.left,
      target.right - right,
      top - target.top,
      target.bottom - bottom
    )
  })
  expect(
    clipped,
    '分页外框在所有裁切祖先与视口中最多允许半像素舍入'
  ).toBeLessThanOrEqual(0.5)
  // 只检查可访问控件，不把控件内部 hidden/aria-hidden 的原生桥接 select 当成可见 UI。
  const controls = [
    ...(await pagination.getByRole('button').all()),
    ...(await pagination.getByRole('combobox').all()),
  ]
  expect(controls.length).toBeGreaterThanOrEqual(5)
  await Promise.all(
    controls.map(control => expect(control).toBeInViewport({ ratio: 1 }))
  )
  await expect(
    pagination.getByRole('button', { name: '上一页', exact: true })
  ).toBeDisabled()
  // 本例停留在第一页；命中检查顺序执行，避免并行鼠标移动相互干扰。
  await pagination
    .getByRole('button', { name: '下一页', exact: true })
    .click({ trial: true })
  await pagination
    .getByRole('button', { name: '末页', exact: true })
    .click({ trial: true })
  await pagination
    .getByRole('combobox', { name: 'page size', exact: true })
    .click({ trial: true })
}
