/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\tests\dependency-update.test.ts
 * @Description: 安装清单指纹与普通业务编辑隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect } from 'bun:test'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dependencySignature } from '../src/config/vite/viteDependencyUpdatePlugin'

test('依赖清单内容变化会更新指纹，普通页面文件不会', () => {
  const root = mkdtempSync(join(tmpdir(), 'robot-dependency-signature-'))
  try {
    writeFileSync(join(root, 'package.json'), '{"dependencies":{}}')
    writeFileSync(join(root, 'bun.lock'), 'version-a')
    const initial = dependencySignature(root)
    writeFileSync(join(root, 'view.vue'), '<div>页面编辑</div>')
    expect(dependencySignature(root)).toBe(initial)
    writeFileSync(join(root, 'bun.lock'), 'version-b')
    expect(dependencySignature(root)).not.toBe(initial)
    const changed = dependencySignature(root)
    writeFileSync(join(root, 'bun.lock'), 'version-b')
    expect(dependencySignature(root)).toBe(changed)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
