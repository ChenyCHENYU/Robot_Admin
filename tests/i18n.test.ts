/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\tests\i18n.test.ts
 * @Description: 国际化 key 兼容、离线编译与运行时词典回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { baseUtils } from 'vite-auto-i18n-plugin'
import { createI18nPlugin } from 'vite-auto-i18n-plugin/adapter'
import { createI18nRuntime } from 'vite-auto-i18n-plugin/runtime'
import createProjectI18nPlugin from '../src/config/vite/viteI18nConfig'
import {
  getTranslationKey,
  normalizeLanguage,
  type AppLanguage,
} from '../src/config/i18n'

const originalEnabled = process.env.VITE_I18N_ENABLED
const storageDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage'
)
const directories: string[] = []

/** 真实词典由测试宿主显式提供，运行时完全不依赖 Vite、Vue 或项目目录。 */
function createRuntime(namespace = 'robot_admin') {
  return createI18nRuntime<AppLanguage>({
    namespace,
    defaultLanguage: 'zh-cn',
    languages: ['en', 'ja', 'ko'],
    loaders: {
      en: () => import('../lang/en.json'),
      ja: () => import('../lang/ja.json'),
      ko: () => import('../lang/ko.json'),
    },
  })
}

/** 调用 Vite transform，保留结构化结果以检验源码映射与缓存。 */
async function compile(
  plugin: ReturnType<typeof createI18nPlugin>,
  source: string,
  id = '/src/views/home/data.ts'
) {
  if (typeof plugin.transform !== 'function')
    throw new Error('翻译编译钩子缺失')
  return plugin.transform.call({} as never, source, id)
}

/** 提取真实编译产物，兼容 Vite 允许的两种返回格式。 */
function codeOf(result: Awaited<ReturnType<typeof compile>>) {
  return typeof result === 'string' ? result : (result?.code ?? '')
}

/** 控制异步完成顺序，覆盖加载竞争而不依赖睡眠计时。 */
function deferred() {
  let resolve!: (value: Record<string, string>) => void
  let reject!: (error: Error) => void
  const promise = new Promise<Record<string, string>>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

afterEach(() => {
  if (storageDescriptor)
    Object.defineProperty(globalThis, 'localStorage', storageDescriptor)
  else Reflect.deleteProperty(globalThis, 'localStorage')
  if (originalEnabled === undefined) delete process.env.VITE_I18N_ENABLED
  else process.env.VITE_I18N_ENABLED = originalEnabled
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

describe('国际化运行链路', () => {
  test('标题 key 与真实插件算法一致，包括空格、插值和引号', () => {
    process.env.VITE_I18N_ENABLED = 'false'
    createProjectI18nPlugin()
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

  test('历史语言别名和多余空格归一化，无效值回退中文', () => {
    expect(normalizeLanguage(' en-US ')).toBe('en')
    expect(normalizeLanguage('ja_JP')).toBe('ja')
    expect(normalizeLanguage('ko-KR')).toBe('ko')
    expect(normalizeLanguage('EN')).toBe('en')
    expect(normalizeLanguage('fr')).toBe('zh-cn')
    expect(normalizeLanguage(null)).toBe('zh-cn')
  })

  test('存储异常不阻塞应用初始化，也不虚报已保存', async () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('storage blocked')
      },
    })
    const runtime = createRuntime()
    expect(runtime.getStoredLanguage()).toBe('zh-cn')
    expect(runtime.persistLanguage('en')).toBe(false)
    await runtime.initializeLanguage()
    expect(runtime.getCurrentLanguage()).toBe('zh-cn')
  })

  test('四种语言共用正文与菜单翻译入口，切换会清理缓存', async () => {
    const runtime = createRuntime()
    await runtime.initializeLanguage('en')
    expect(runtime.translateText('首页')).toBe('Home')
    expect(runtime.translateKey(getTranslationKey(' 首页 '), ' 首页 ')).toBe(
      ' Home '
    )
    expect(
      runtime.translateKey(getTranslationKey('当前工作空间'), '当前工作空间')
    ).toBe('Current workspace')
    expect(
      runtime.translateKey(getTranslationKey('首页'), '首页', 'another-app')
    ).toBe('首页')
    expect(runtime.translateText('尚未加入词典的标题')).toBe(
      '尚未加入词典的标题'
    )
    await runtime.initializeLanguage('ja')
    expect(runtime.translateText('首页')).toBe('ホーム')
    await runtime.initializeLanguage('ko')
    expect(runtime.translateText('首页')).toBe('홈')
    await runtime.initializeLanguage('zh-cn')
    expect(runtime.translateText('首页')).toBe('首页')
  })

  test('同语言请求合并，较晚完成的旧请求不覆盖新选择', async () => {
    const english = deferred()
    let calls = 0
    const runtime = createI18nRuntime({
      namespace: 'concurrent',
      defaultLanguage: 'zh-cn',
      languages: ['en', 'ja'],
      loaders: {
        en: () => {
          calls++
          return english.promise
        },
        ja: async () => ({ [getTranslationKey('首页')]: 'ホーム' }),
      },
    })
    const first = runtime.initializeLanguage('en')
    const second = runtime.initializeLanguage('en')
    await runtime.initializeLanguage('ja')
    english.resolve({ [getTranslationKey('首页')]: 'Home' })
    await Promise.all([first, second])
    expect(calls).toBe(1)
    expect(runtime.getCurrentLanguage()).toBe('ja')
    expect(runtime.translateText('首页')).toBe('ホーム')
  })

  test('过期请求失败不回退新语言，也不写存储或提示', async () => {
    const english = deferred()
    const errors: unknown[] = []
    const saved: string[] = []
    const runtime = createI18nRuntime({
      namespace: 'stale-error',
      defaultLanguage: 'zh-cn',
      languages: ['en', 'ja'],
      storage: () => ({
        getItem: () => null,
        setItem: (_, value) => {
          saved.push(value)
        },
      }),
      onError: error => {
        errors.push(error)
      },
      loaders: { en: () => english.promise, ja: async () => ({}) },
    })
    const first = runtime.initializeLanguage('en')
    await runtime.initializeLanguage('ja')
    english.reject(new Error('old request failed'))
    await first
    expect(runtime.getCurrentLanguage()).toBe('ja')
    expect(errors).toHaveLength(0)
    expect(saved).toHaveLength(0)
  })

  test('缺少词典安全回退、只提示一次，资源修复后可重试', async () => {
    let fixed = false
    let errors = 0
    const runtime = createI18nRuntime({
      namespace: 'retry',
      defaultLanguage: 'zh-cn',
      languages: ['en'],
      onError: () => {
        errors++
      },
      loaders: {
        en: async () => {
          if (!fixed) throw new Error('missing')
          return { [getTranslationKey('首页')]: 'Home' }
        },
      },
    })
    await runtime.initializeLanguage('en')
    await runtime.initializeLanguage('en')
    expect(runtime.getCurrentLanguage()).toBe('zh-cn')
    expect(errors).toBe(1)
    fixed = true
    await runtime.initializeLanguage('en')
    expect(runtime.translateText('首页')).toBe('Home')
  })

  test('损坏的词条、原型链 key 和不存在的 loader 都不会使应用抛错', async () => {
    const runtime = createI18nRuntime({
      namespace: 'invalid',
      defaultLanguage: 'zh-cn',
      languages: ['en', 'ja'],
      onError: () => {},
      loaders: {
        en: async () => ({
          broken: 42,
          blank: '  ',
          [getTranslationKey('首页')]: 'Home',
        }),
      },
    })
    await runtime.initializeLanguage('en')
    expect(runtime.translateKey('broken', '原文')).toBe('原文')
    expect(runtime.translateKey('blank', '原文')).toBe('原文')
    expect(runtime.translateKey('toString', '原文')).toBe('原文')
    await runtime.initializeLanguage('ja')
    expect(runtime.getCurrentLanguage()).toBe('zh-cn')
  })

  test('多个运行时的全局翻译按命名空间隔离，插值兼容全角花括号', async () => {
    const first = createRuntime('first-app')
    const second = createRuntime('second-app')
    await first.initializeLanguage('en')
    await second.initializeLanguage('ja')
    const target = {} as {
      $t: (key: string, fallback: string, namespace: string) => string
      $iS: (text: string, args: unknown[]) => string
    }
    first.installGlobals(target)
    second.installGlobals(target)
    const key = getTranslationKey('首页')
    expect(target.$t(key, '首页', 'first-app')).toBe('Home')
    expect(target.$t(key, '首页', 'second-app')).toBe('ホーム')
    expect(target.$t(key, '首页', 'unknown')).toBe('首页')
    expect(target.$iS('第 $｛0｝ 项，共 ${1} 项', [0, 3])).toBe(
      '第 0 项，共 3 项'
    )
  })

  test('离线编译支持 Vue 查询模块和 Unicode 转义，跳过样式及业务数据', async () => {
    process.env.VITE_I18N_ENABLED = 'false'
    const plugin = createProjectI18nPlugin()
    expect(plugin.buildEnd).toBeUndefined()
    expect(plugin.closeBundle).toBeUndefined()
    expect(plugin.configResolved).toBeUndefined()
    const result = await compile(plugin, "export const title = '首页'")
    expect(codeOf(result)).toContain(getTranslationKey('首页'))
    expect(codeOf(result)).toContain('$t(')
    expect(typeof result === 'object' && result?.map).toBeTruthy()
    expect(
      codeOf(
        await compile(
          plugin,
          "export function render() { return '首页' }",
          '/src/views/home/index.vue?vue&type=template&id=home&ts=true'
        )
      )
    ).toContain('$t(')
    expect(
      codeOf(await compile(plugin, 'export const title = "\\u9996\\u9875"'))
    ).toContain(getTranslationKey('首页'))
    expect(
      await compile(
        plugin,
        '.home { color: red }',
        '/src/views/home/index.vue?vue&type=style'
      )
    ).toBeNull()
    expect(
      await compile(
        plugin,
        "export const companyName = '江苏金恒'",
        '/src/api/auth.ts'
      )
    ).toBeNull()
    expect(
      await compile(plugin, "export const label = 'Robot Admin'")
    ).toBeNull()
  })

  test('离线编译不创建、转换、覆盖或删除词典和运行时入口', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'robot-i18n-readonly-'))
    directories.push(directory)
    const merged = '{"legacy":{"en":"Home","zh-cn":"首页"}}'
    const english = '{"custom":"Keep me"}'
    const entry = 'export const customRuntime = true'
    writeFileSync(join(directory, 'index.json'), merged)
    writeFileSync(join(directory, 'en.json'), english)
    writeFileSync(join(directory, 'index.js'), entry)
    const plugin = createI18nPlugin({
      enabled: false,
      namespace: 'readonly',
      globalPath: directory,
    })
    await compile(plugin, "export const title = '首页'")
    expect(readFileSync(join(directory, 'index.json'), 'utf8')).toBe(merged)
    expect(readFileSync(join(directory, 'en.json'), 'utf8')).toBe(english)
    expect(readFileSync(join(directory, 'index.js'), 'utf8')).toBe(entry)
  })

  test('重复源码命中缓存，编辑内容重新编译，并发实例保持命名空间正确', async () => {
    const first = createI18nPlugin({ enabled: false, namespace: 'first-app' })
    const second = createI18nPlugin({ enabled: false, namespace: 'second-app' })
    const source = "export const title = '首页'"
    const [a, b] = await Promise.all([
      compile(first, source),
      compile(second, source),
    ])
    expect(codeOf(a)).toContain('first-app')
    expect(codeOf(b)).toContain('second-app')
    expect(await compile(first, source)).toBe(a)
    const changed = await compile(first, "export const title = '关于'")
    expect(changed).not.toBe(a)
    expect(codeOf(changed)).toContain(getTranslationKey('关于'))
  })

  test('编译错误传递给 Vite，失败后仍可继续编译合法模块', async () => {
    const plugin = createI18nPlugin({
      enabled: false,
      namespace: 'parse-error',
    })
    await expect(
      compile(plugin, "export const title = '首页'; const =")
    ).rejects.toThrow()
    expect(
      codeOf(await compile(plugin, "export const title = '首页'"))
    ).toContain('$t(')
  })

  test('深度扫描保留代码块、换行、反斜杠与字面插值，不输出调试日志', async () => {
    const plugin = createI18nPlugin({ enabled: false, namespace: 'multiline' })
    const log = spyOn(console, 'log')
    try {
      const text =
        "使用说明\n```typescript\nconst path = 'C:\\demo'\nconst value = '${name}'\n```\n结束\r\n"
      const result = await compile(
        plugin,
        `export const title = ${JSON.stringify(text)}`
      )
      const evaluate = new Function(
        '$t',
        '$deepScan',
        codeOf(result)
          .replace(/^import [^\n]+\n/, '')
          .replace('export const title', 'const title') + '\nreturn title'
      )
      expect(
        evaluate(
          (_: string, fallback: string) => fallback,
          (value: string) => value
        )
      ).toBe(text)
      expect(log).not.toHaveBeenCalled()
    } finally {
      log.mockRestore()
    }
  })

  test('普通字面量与原生模板的中文回退保留引号、反斜杠和动态插值', async () => {
    const plugin = createI18nPlugin({ enabled: false, namespace: 'literal' })
    const sources = [
      `export const title = "点击'编辑'按钮"`,
      "export const title = `点击'编辑'按钮，数量：${2}`",
    ]
    await Promise.all(
      sources.map(async source => {
        const output = await compile(plugin, source)
        const evaluate = new Function(
          '$t',
          '$deepScan',
          codeOf(output)
            .replace(/^import [^\n]+\n/, '')
            .replace('export const title', 'const title') + '\nreturn title'
        )
        const original = new Function(
          source.replace('export const title', 'const title') + '\nreturn title'
        )()
        expect(
          evaluate(
            (_: string, fallback: string) => fallback,
            (value: string) => value
          )
        ).toBe(original)
      })
    )
  })
})
