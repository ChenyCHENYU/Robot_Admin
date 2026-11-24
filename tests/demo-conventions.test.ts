/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\demo-conventions.test.ts
 * @Description: 演示页面组件名与脚本契约回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const demoRoot = fileURLToPath(new URL('../src/views/demo/', import.meta.url))
const viewsRoot = fileURLToPath(new URL('../src/views/', import.meta.url))

const listDemoPages = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listDemoPages(path)
    return entry.name === 'index.vue' ? [path] : []
  })

test('每个演示页均声明唯一的 PascalCase 组件名', async () => {
  const pages = listDemoPages(demoRoot)
  const names = await Promise.all(
    pages.map(async page => {
      const source = await Bun.file(page).text()
      expect(source).toMatch(
        /<script\b[^>]*setup[^>]*lang="ts"|<script\b[^>]*lang="ts"[^>]*setup/
      )
      const name = source.match(/defineOptions\(\s*\{\s*name:\s*'([^']+)'/)?.[1]
      expect(name, page).toMatch(/^[A-Z][A-Za-z0-9]*$/)
      return name
    })
  )

  expect(pages.length).toBeGreaterThanOrEqual(60)
  expect(new Set(names).size).toBe(pages.length)
})

test('页面私有组件使用 PascalCase，项目级前缀只用于 src/components', () => {
  for (const file of new Bun.Glob('**/*.vue').scanSync(viewsRoot)) {
    const segments = file.split('/')
    expect(
      segments.find(segment => /^[Cc]_/.test(segment)),
      file
    ).toBeUndefined()
    const componentDirectory = segments.lastIndexOf('components')
    if (componentDirectory < 0) continue
    const name = segments[componentDirectory + 1].replace(/\.vue$/, '')
    expect(name, file).toMatch(/^[A-Z][A-Za-z0-9]*$/)
  }
})
