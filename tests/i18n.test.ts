/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\tests\i18n.test.ts
 * @Description: 国际化 key 兼容、离线编译与运行时词典回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { afterEach, describe, expect, test } from 'bun:test'
import { baseUtils } from 'vite-auto-i18n-plugin'
import createI18nPlugin from '../src/config/vite/viteI18nConfig'
import { getTranslationKey, normalizeLanguage } from '../src/config/i18n'
import {
  getCurrentLanguage,
  getStoredLanguage,
  initializeLanguage,
  persistLanguage,
  translateKey,
  translateText,
} from '../src/utils/d_i18n'

const storageDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage'
)
const originalEnabled = process.env.VITE_I18N_ENABLED

afterEach(async () => {
  if (storageDescriptor)
    Object.defineProperty(globalThis, 'localStorage', storageDescriptor)
  else Reflect.deleteProperty(globalThis, 'localStorage')
  if (originalEnabled === undefined) delete process.env.VITE_I18N_ENABLED
  else process.env.VITE_I18N_ENABLED = originalEnabled
  await initializeLanguage('zh-cn')
})

describe('国际化运行链路', () => {
  test('标题 key 与真实插件算法一致，包括空格、插值和引号', () => {
    process.env.VITE_I18N_ENABLED = 'false'
    createI18nPlugin()
    for (const text of [
      '首页',
      ' 当前工作空间 ',
      '查看 ${0} 详情',
      '点击"编辑"按钮',
      '机器人 🤖',
    ]) {
      const generated = baseUtils.createI18nTranslator({
        value: text,
        isExpression: true,
      }) as { arguments: Array<{ value: string }> }
      expect(getTranslationKey(text)).toBe(generated.arguments[0].value)
    }
  })

  test('历史语言别名统一为组件使用的 key，无效值回退中文', () => {
    expect(normalizeLanguage('en-US')).toBe('en')
    expect(normalizeLanguage('ja_JP')).toBe('ja')
    expect(normalizeLanguage('ko-KR')).toBe('ko')
    expect(normalizeLanguage('EN')).toBe('en')
    expect(normalizeLanguage('fr')).toBe('zh-cn')
    expect(normalizeLanguage(null)).toBe('zh-cn')
  })

  test('浏览器存储异常不阻塞应用初始化，也不虚报已保存', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('storage blocked')
      },
    })
    expect(getStoredLanguage()).toBe('zh-cn')
    expect(persistLanguage('en')).toBe(false)
  })

  test('四种语言使用同一份页面与菜单翻译入口，未知词条保留原文', async () => {
    await initializeLanguage('en')
    expect(getCurrentLanguage()).toBe('en')
    expect(translateText('首页')).toBe('Home')
    expect(translateKey(getTranslationKey(' 首页 '), ' 首页 ')).toBe(' Home ')
    expect(
      translateKey(
        getTranslationKey('当前工作空间'),
        '当前工作空间',
        'robot_admin'
      )
    ).toBe('Current workspace')
    expect(translateKey(getTranslationKey('首页'), '首页', 'another-app')).toBe(
      '首页'
    )
    expect(translateText('尚未加入词典的标题')).toBe('尚未加入词典的标题')
    await initializeLanguage('ja')
    expect(translateText('首页')).toBe('ホーム')
    await initializeLanguage('ko')
    expect(translateText('首页')).toBe('홈')
    await initializeLanguage('zh-cn')
    expect(translateText('首页')).toBe('首页')
  })

  test('关闭联网翻译后，开发与生产仍然编译中文且没有翻译生命周期', async () => {
    process.env.VITE_I18N_ENABLED = 'false'
    const plugin = createI18nPlugin()
    expect(plugin.buildEnd).toBeUndefined()
    expect(plugin.closeBundle).toBeUndefined()
    expect(plugin.configResolved).toBeUndefined()
    const { transform } = plugin
    if (typeof transform !== 'function') throw new Error('翻译编译钩子缺失')
    const result = await transform.call(
      {} as never,
      "export const title = '首页'",
      '/src/views/home/data.ts'
    )
    expect(String(result)).toContain(getTranslationKey('首页'))
    expect(String(result)).toContain('$t(')
    const template = await transform.call(
      {} as never,
      "export function render() { return '首页' }",
      '/src/views/home/index.vue?vue&type=template&id=home&ts=true'
    )
    expect(String(template)).toContain('$t(')
    const style = await transform.call(
      {} as never,
      '.home { color: red }',
      '/src/views/home/index.vue?vue&type=style'
    )
    expect(style).toBeNull()
    const businessSource = "export const companyName = '江苏金恒'"
    const excluded = await transform.call(
      {} as never,
      businessSource,
      '/src/api/auth.ts'
    )
    expect(excluded).toBe(businessSource)
  })
})
