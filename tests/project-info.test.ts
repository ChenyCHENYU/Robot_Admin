/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\tests\project-info.test.ts
 * @Description: 关于页版本来自实际安装且只展示项目直接依赖
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { readProjectInfo } from '../src/config/vite/viteProjectInfoPlugin'

test('关于页跟随当前项目与安装版本，并正确区分直接生产和开发依赖', () => {
  const root = new URL('../', import.meta.url).pathname
  const manifest = JSON.parse(readFileSync(`${root}package.json`, 'utf8'))
  const installed = JSON.parse(
    readFileSync(
      `${root}node_modules/@robot-admin/naive-ui-components/package.json`,
      'utf8'
    )
  )
  const info = readProjectInfo(root)
  expect(info.version).toBe(manifest.version)
  expect(info.dependencies.map(item => item.name).sort()).toEqual(
    Object.keys(manifest.dependencies).sort()
  )
  expect(info.devDependencies.map(item => item.name).sort()).toEqual(
    Object.keys(manifest.devDependencies).sort()
  )
  expect(
    info.dependencies.find(
      item => item.name === '@robot-admin/naive-ui-components'
    )?.version
  ).toBe(installed.version)
  expect(info.dependencies.some(item => item.name === 'driver.js')).toBe(false)
  expect(info.dependencies.some(item => item.name === '@commitlint/cli')).toBe(
    false
  )
  expect(
    info.dependencies.every(item => /^\d+\.\d+\.\d+/.test(item.version))
  ).toBe(true)
  expect(JSON.stringify(info)).not.toContain(root)
})
