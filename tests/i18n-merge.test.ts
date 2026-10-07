/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\i18n-merge.test.ts
 * @Description: 实际运行翻译合并 CLI，验证 Git ours/theirs 参数和词条完整性
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

test('手动合并写回 ours，保留双方新增、空值及特殊 key，冲突按明确策略保留 ours', () => {
  const directory = mkdtempSync(join(tmpdir(), 'robot-i18n-merge-'))
  try {
    const ours = join(directory, 'ours.json')
    const theirs = join(directory, 'theirs.json')
    writeFileSync(
      ours,
      '{"ours":"new","shared":"ours","empty":"","__proto__":{"title":"safe"}}'
    )
    writeFileSync(
      theirs,
      '{"theirs":"new","shared":"theirs","empty":"fallback"}'
    )
    const process = Bun.spawnSync({
      cmd: [
        Bun.which('bun')!,
        fileURLToPath(
          new URL('../scripts/merge-i18n-json.cjs', import.meta.url)
        ),
        ours,
        theirs,
        ours,
      ],
    })
    expect(process.exitCode).toBe(0)
    const result = JSON.parse(readFileSync(ours, 'utf8'))
    expect(Object.entries(result)).toEqual([
      ['__proto__', { title: 'safe' }],
      ['empty', ''],
      ['ours', 'new'],
      ['shared', 'ours'],
      ['theirs', 'new'],
    ])
    expect(JSON.parse(readFileSync(theirs, 'utf8')).shared).toBe('theirs')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('三方合并区分单方更新、删除与双方同值更新，真实冲突退出非零', () => {
  const directory = mkdtempSync(join(tmpdir(), 'robot-i18n-three-way-'))
  try {
    const ours = join(directory, 'ours.json')
    const theirs = join(directory, 'theirs.json')
    const base = join(directory, 'base.json')
    const ancestor = {
      update: 'old',
      ours: 'old',
      remove: 'old',
      same: 'old',
      empty: 'old',
    }
    writeFileSync(base, JSON.stringify(ancestor))
    writeFileSync(
      ours,
      JSON.stringify({ ...ancestor, ours: 'ours', same: 'new' })
    )
    writeFileSync(
      theirs,
      JSON.stringify({
        update: 'theirs',
        ours: 'old',
        same: 'new',
        empty: '',
        added: 'new',
      })
    )
    const cmd = [
      Bun.which('bun')!,
      fileURLToPath(new URL('../scripts/merge-i18n-json.cjs', import.meta.url)),
      ours,
      theirs,
      ours,
      base,
    ]
    expect(Bun.spawnSync({ cmd }).exitCode).toBe(0)
    expect(JSON.parse(readFileSync(ours, 'utf8'))).toEqual({
      update: 'theirs',
      ours: 'ours',
      same: 'new',
      empty: '',
      added: 'new',
    })
    writeFileSync(ours, JSON.stringify({ update: 'ours' }))
    writeFileSync(theirs, JSON.stringify({ update: 'theirs' }))
    const result = Bun.spawnSync({ cmd })
    expect(result.exitCode).toBe(1)
    expect(result.stderr.toString()).toContain('update')
    expect(JSON.parse(readFileSync(ours, 'utf8')).update).toBe('ours')
    expect(JSON.parse(readFileSync(theirs, 'utf8')).update).toBe('theirs')
    expect(JSON.parse(readFileSync(base, 'utf8'))).toEqual(ancestor)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('真实 Git 合并驱动使用祖先文件，冲突时保留双方暂存版本', () => {
  const directory = mkdtempSync(join(tmpdir(), 'robot-i18n-git-'))
  const git = (...args: string[]) =>
    Bun.spawnSync({ cmd: ['git', ...args], cwd: directory })
  const commit = (value: Record<string, string>) => {
    writeFileSync(
      join(directory, 'dictionary.json'),
      JSON.stringify(value, null, 2) + '\n'
    )
    expect(git('add', '.').exitCode).toBe(0)
    expect(git('commit', '-qm', 'fixture').exitCode).toBe(0)
  }
  try {
    expect(git('init', '-q', '-b', 'ours').exitCode).toBe(0)
    expect(git('config', 'user.name', 'Robot Test').exitCode).toBe(0)
    expect(
      git('config', 'user.email', 'robot-test@example.invalid').exitCode
    ).toBe(0)
    expect(git('config', 'commit.gpgsign', 'false').exitCode).toBe(0)
    const driver = fileURLToPath(
      new URL('../scripts/merge-i18n-json.cjs', import.meta.url)
    )
    expect(
      git(
        'config',
        'merge.i18n-json.driver',
        `"${Bun.which('bun')!}" "${driver}" "%A" "%B" "%A" "%O"`
      ).exitCode
    ).toBe(0)
    writeFileSync(join(directory, '.gitattributes'), '*.json merge=i18n-json\n')
    commit({ title: 'old' })
    const base = git('rev-parse', 'HEAD').stdout.toString().trim()
    commit({ ours: 'left', title: 'old' })
    expect(git('checkout', '-qb', 'theirs', base).exitCode).toBe(0)
    commit({ theirs: 'right', title: 'updated' })
    expect(git('checkout', '-q', 'ours').exitCode).toBe(0)
    expect(git('merge', '--no-edit', 'theirs').exitCode).toBe(0)
    expect(
      JSON.parse(readFileSync(join(directory, 'dictionary.json'), 'utf8'))
    ).toEqual({ ours: 'left', theirs: 'right', title: 'updated' })
    expect(git('checkout', '-qb', 'conflict-ours', base).exitCode).toBe(0)
    commit({ title: 'ours' })
    expect(git('checkout', '-qb', 'conflict-theirs', base).exitCode).toBe(0)
    commit({ title: 'theirs' })
    expect(git('checkout', '-q', 'conflict-ours').exitCode).toBe(0)
    expect(git('merge', '--no-edit', 'conflict-theirs').exitCode).toBe(1)
    expect(
      git('ls-files', '-u').stdout.toString().trim().split('\n')
    ).toHaveLength(3)
    expect(
      JSON.parse(git('show', ':2:dictionary.json').stdout.toString()).title
    ).toBe('ours')
    expect(
      JSON.parse(git('show', ':3:dictionary.json').stdout.toString()).title
    ).toBe('theirs')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
