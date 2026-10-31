/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\tests\component-type-generation.test.ts
 * @Description: 用真实自动导入插件回归冷生成和窄入口构建的全量组件类型契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { componentNames } from '@robot-admin/naive-ui-components/resolver'
import { prepareTypes } from '../scripts/prepare-types'

test('空入口两次生成仍保留完整库组件与组合函数类型，不依赖历史页面扫描', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'robot-component-types-'))
  try {
    await prepareTypes(directory)
    const first = await readFile(join(directory, 'components.d.ts'), 'utf8')
    // 模拟窄入口覆盖，第二次准备不能只在旧文件后追加而遗漏或保留过期登记。
    await writeFile(join(directory, 'components.d.ts'), 'export {}\n')
    await prepareTypes(directory)
    const second = await readFile(join(directory, 'components.d.ts'), 'utf8')
    for (const name of componentNames) {
      expect(first).toContain(
        `${name}: typeof import('@robot-admin/naive-ui-components/${name}')['${name}']`
      )
      expect(second).toContain(
        `${name}: typeof import('@robot-admin/naive-ui-components/${name}')['${name}']`
      )
    }
    const auto = await readFile(join(directory, 'auto-imports.d.ts'), 'utf8')
    expect(auto).toContain("typeof import('vue')['ref']")
    expect(auto).toContain("typeof import('naive-ui')['useMessage']")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
