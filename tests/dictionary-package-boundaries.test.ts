/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-02
 * @FilePath: \Robot_Admin\tests\dictionary-package-boundaries.test.ts
 * @Description: 验证真实安装产物之间没有字典识别、注入或隐式适配
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const modules = new URL('../node_modules/', import.meta.url).pathname
const manifest = (name: string) =>
  JSON.parse(readFileSync(join(modules, name, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
    optionalDependencies?: Record<string, string>
  }
const declarations = (name: string) => {
  const directory = join(modules, name, 'dist')
  return readdirSync(directory)
    .filter(file => file.endsWith('.d.ts'))
    .map(file => readFileSync(join(directory, file), 'utf8'))
    .join('\n')
}

test('字典、组件库与表格的依赖声明互不引入对方', () => {
  for (const name of [
    '@robot-admin/dictionary',
    '@robot-admin/naive-ui-components',
    '@agile-team/mach-table',
    '@agile-team/mach-table-vue',
  ]) {
    const pkg = manifest(name)
    const dependencies = Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    })
    if (name === '@robot-admin/dictionary') {
      expect(dependencies).not.toContain('@robot-admin/naive-ui-components')
      expect(
        dependencies.some(value => value.startsWith('@agile-team/mach-table'))
      ).toBe(false)
    } else expect(dependencies).not.toContain('@robot-admin/dictionary')
  }
})

test('组件与表格发布类型不再携带字典字段、数据源或注入协议', () => {
  expect(declarations('@robot-admin/naive-ui-components')).not.toMatch(
    /DICTIONARY_PROVIDER_KEY|DictionaryBinding|DictionaryProvider|dictionary\??\s*:/
  )
  expect(declarations('@agile-team/mach-table')).not.toMatch(
    /createDictionaryColumn|createCachedDictionary|createDictionaryRenderer|DictionaryColumnSource/
  )
  expect(declarations('@robot-admin/dictionary')).not.toMatch(
    /DICTIONARY_PROVIDER_KEY|DictionaryLabelField\b|@robot-admin\/naive-ui-components|@agile-team\/mach-table/
  )
})
