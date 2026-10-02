/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\tests\theme-bootstrap.test.ts
 * @Description: 首屏主题恢复脚本的容错与兼容状态测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'

const themeBootstrapSource = await Bun.file(
  new URL('../public/theme-init.js', import.meta.url)
).text()
const runThemeBootstrap = new Function(
  'window',
  'document',
  themeBootstrapSource
) as (windowValue: unknown, documentValue: unknown) => void

/** 创建首屏脚本所需的最小 documentElement 测试替身。 */
function createRoot() {
  const attributes = new Map<string, string>()
  const style: Record<string, string> = {}
  return {
    attributes,
    root: {
      style,
      setAttribute: (name: string, value: string) =>
        attributes.set(name, value),
    },
    style,
  }
}

describe('theme bootstrap', () => {
  test('存储和系统偏好不可用时安全回退到亮色默认值', () => {
    const { attributes, root, style } = createRoot()

    expect(() =>
      runThemeBootstrap(
        {
          /** 模拟浏览器禁止访问 localStorage。 */
          get localStorage() {
            throw new Error('storage unavailable')
          },
          matchMedia: () => {
            throw new Error('matchMedia unavailable')
          },
        },
        { documentElement: root }
      )
    ).not.toThrow()

    expect(attributes.get('data-theme')).toBe('light')
    expect(attributes.get('data-design-style')).toBe('glass-morphism')
    expect(style.backgroundColor).toBe('#ffffff')
  })

  test('暗黑科技风格在首屏即归一化为暗色并回写模式', () => {
    const { attributes, root, style } = createRoot()
    const values = new Map([
      ['theme-mode', 'light'],
      ['robot-admin-design-style', 'dark-tech'],
    ])

    runThemeBootstrap(
      {
        localStorage: {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => values.set(key, value),
        },
        matchMedia: () => ({ matches: false }),
      },
      { documentElement: root }
    )

    expect(values.get('theme-mode')).toBe('dark')
    expect(attributes.get('data-theme')).toBe('dark')
    expect(attributes.get('data-design-style')).toBe('dark-tech')
    expect(style.backgroundColor).toBe('#1c1c1c')
  })
})
