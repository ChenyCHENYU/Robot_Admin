/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @Description: 原生 SVG 属性不能被原子 CSS 改写，常规属性工具类继续生效
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createGenerator } from 'unocss'
import config from '../unocss.config'
test('SVG 字号和笔画不生成覆盖规则，UI 的文本与间距工具类仍有效', async () => {
  const uno = await createGenerator({ ...config, safelist: [] })
  const { css } = await uno.generate(
    '<svg width="64" height="64"><text font-size="12" font-weight="600" stroke-width="2">文字</text></svg><div text="sm" p="4" class="text-lg"></div>'
  )
  expect(css).not.toContain('[font-size')
  expect(css).not.toContain('[stroke-width')
  expect(css).not.toContain('[font-weight')
  expect(css).toContain('.text-lg')
  expect(css).toContain('padding:1rem')
})
