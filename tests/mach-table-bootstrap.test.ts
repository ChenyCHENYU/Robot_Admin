/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\mach-table-bootstrap.test.ts
 * @Description: 网格外观集中配置与异步插件启动边界回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createApp } from 'vue'
import { setupMachTable } from '../src/plugins/mach-table'
import machTableConfig from '../src/config/mach-table'

test('全局只统一密度条纹与边框，保留按内容测宽及内置场景行为', () => {
  expect(machTableConfig).toEqual({
    defaults: {
      size: 'compact',
      stripedRows: true,
      showCellBorders: true,
    },
  })
  expect('presets' in machTableConfig).toBe(false)
  expect('defaultPreset' in machTableConfig).toBe(false)
})

test('一次安装官方异步插件，启动入口不直接引入同步网格或 Core', async () => {
  const app = createApp({ render: () => null })
  setupMachTable(app)
  const component = app.component('MachTable') as
    { __asyncLoader?: () => Promise<unknown> } | undefined
  expect(typeof component?.__asyncLoader).toBe('function')
  const plugin = await Bun.file(
    new URL('../src/plugins/mach-table.ts', import.meta.url)
  ).text()
  expect(plugin).toContain("from '@agile-team/mach-table-vue/async'")
  expect(plugin).not.toMatch(/from ['"]@agile-team\/mach-table(?:-vue)?['"]/)
  const config = await Bun.file(
    new URL('../src/config/mach-table.ts', import.meta.url)
  ).text()
  expect(config).toMatch(/^import type .*MachTableRuntimeConfig/m)
  expect(config).not.toMatch(/^import(?!\s+type\b).*@agile-team\/mach-table/m)
  const main = await Bun.file(new URL('../src/main.ts', import.meta.url)).text()
  expect(main.match(/setupMachTable\(app\)/g)).toHaveLength(1)
  expect(main.indexOf('setupMachTable(app)')).toBeLessThan(
    main.indexOf("app.mount('#app')")
  )
})
