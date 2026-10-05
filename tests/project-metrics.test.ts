/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\tests\project-metrics.test.ts
 * @Description: 工程指标从当前源码与实际产物读取，首屏和 gzip 口径保持一致
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import {
  readProjectInventory,
  readBuildMetrics,
} from '../src/config/vite/viteProjectMetricsPlugin'

test('源码菜单计数来自实际清单，报告不暴露本机路径', () => {
  const root = new URL('../', import.meta.url).pathname
  const inventory = readProjectInventory(root)
  expect(inventory.routeNames).toEqual(
    expect.arrayContaining([
      { name: 'dashboard-analysis', title: '分析页' },
      { name: 'dashboard-statistics', title: '统计页' },
    ])
  )
  expect(inventory.routes.reduce((sum, item) => sum + item.count, 0)).toBe(
    inventory.routeNames.length
  )
  expect(inventory.components).toBeGreaterThanOrEqual(51)
  expect(inventory.vueFiles).toBeGreaterThanOrEqual(inventory.routeNames.length)
  expect(JSON.stringify(inventory)).not.toContain(root)
})

test('首屏按 HTML 引用计数，异步块不混入首屏，gzip 不冒充原始体积', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'robot-project-metrics-'))
  try {
    await mkdir(join(directory, 'js'))
    await mkdir(join(directory, 'css'))
    const files = {
      'js/entry.js': 'entry'.repeat(100),
      'js/shared.js': 'shared'.repeat(100),
      'js/lazy.js': 'lazy'.repeat(100),
      'css/app.css': 'body{}'.repeat(100),
    }
    await Promise.all(
      Object.entries(files).map(([name, source]) =>
        writeFile(join(directory, name), source)
      )
    )
    await writeFile(
      join(directory, 'index.html'),
      '<script type="module" src="/js/entry.js"></script><link rel="modulepreload" href="/js/shared.js"><link rel="stylesheet" href="/css/app.css">'
    )
    const build = readBuildMetrics(directory, 1234.5)
    expect(build.durationMs).toBe(1235)
    expect(build.initialBytes).toBe(
      files['js/entry.js'].length +
        files['js/shared.js'].length +
        files['css/app.css'].length
    )
    expect(build.assets.find(item => item.name === 'js/lazy.js')?.initial).toBe(
      false
    )
    expect(build.initialGzipBytes).toBe(
      gzipSync(files['js/entry.js']).length +
        gzipSync(files['js/shared.js']).length +
        gzipSync(files['css/app.css']).length
    )
    expect(build.assets).toHaveLength(4)
  } finally {
    await rm(directory, { recursive: true })
  }
})
