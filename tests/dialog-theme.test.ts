/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\tests\dialog-theme.test.ts
 * @Description: 真实 Naive Dialog 的紧凑主题、显式尺寸和全局按钮隔离契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import { Window } from 'happy-dom'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  darkTheme,
  lightTheme,
  NButton,
  NConfigProvider,
  NDialog,
  type DialogProps,
  type GlobalTheme,
  type GlobalThemeOverrides,
} from 'naive-ui'
import {
  darkThemeOverrides,
  lightThemeOverrides,
} from '../src/config/theme/naive-overrides'

/** 从实际组件输出读取主题变量，不检查源 CSS 字符串或模拟主题合并器。 */
async function renderDialog(
  theme: GlobalTheme,
  themeOverrides: GlobalThemeOverrides,
  props: DialogProps = {}
) {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          NConfigProvider,
          { theme, themeOverrides },
          {
            default: () => [
              h(NDialog, {
                title: '删除订单',
                type: 'warning',
                negativeText: '取消',
                positiveText: '确认删除',
                ...props,
              }),
              h(
                NButton,
                { id: 'outside-dialog', size: 'small' },
                { default: () => '普通按钮' }
              ),
            ],
          }
        ),
    })
  )
  const window = new Window()
  window.document.body.innerHTML = html
  const presentation = (selector: string) => {
    const element = window.document.querySelector(selector)!
    const { style } = window.document.createElement('span')
    style.cssText = element.getAttribute('style') ?? ''
    return {
      classes: element.className.split(' '),
      height: style.getPropertyValue('--n-height'),
      fontSize: style.getPropertyValue('--n-font-size'),
      padding: style.getPropertyValue('--n-padding'),
      radius: style.getPropertyValue('--n-border-radius'),
      iconSize: style.getPropertyValue('--n-icon-size'),
    }
  }
  const result = {
    dialog: presentation('.n-dialog'),
    negative: presentation('.n-dialog__action button:first-child'),
    positive: presentation('.n-dialog__action button:last-child'),
    outside: presentation('#outside-dialog'),
  }
  window.close()
  return result
}

describe.each([
  { name: '亮色', theme: lightTheme, overrides: lightThemeOverrides },
  { name: '暗色', theme: darkTheme, overrides: darkThemeOverrides },
])('$name Dialog 主题', ({ theme, overrides }) => {
  test('原生 small 操作按钮紧凑一致，普通按钮保持自身尺寸', async () => {
    const result = await renderDialog(theme, overrides)
    for (const button of [result.negative, result.positive]) {
      expect(button.classes).toContain('n-button--small-type')
      expect(button.height).toBe('22px')
      expect(button.fontSize).toBe('12px')
      expect(button.padding).toBe('0 8px')
      expect(button.radius).toBe('6px')
    }
    expect(result.dialog.iconSize).toBe('22px')
    expect(result.outside.height).toBe('28px')
    expect(result.outside.fontSize).toBe('14px')
    expect(result.outside.padding).toBe('0 10px')
  })

  test('显式 medium 和 large 仍可使用更大的操作目标', async () => {
    const result = await renderDialog(theme, overrides, {
      negativeButtonProps: { size: 'medium' },
      positiveButtonProps: { size: 'large' },
    })
    expect(result.negative.classes).toContain('n-button--medium-type')
    expect(result.negative.height).toBe('34px')
    expect(result.positive.classes).toContain('n-button--large-type')
    expect(result.positive.height).toBe('40px')
  })

  test('调用方显式按钮主题仍优先于应用 Dialog 默认值', async () => {
    const result = await renderDialog(theme, overrides, {
      positiveButtonProps: { themeOverrides: { heightSmall: '30px' } },
    })
    expect(result.positive.height).toBe('30px')
    expect(result.negative.height).toBe('22px')
    expect(result.outside.height).toBe('28px')
  })
})
