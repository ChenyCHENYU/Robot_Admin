/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-23
 * @FilePath: \Robot_Admin\scripts\check-dependency-security.js
 * @Description: 依赖审计与 braces 精确缓解验证门禁
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const bracesMitigation = Object.freeze({
  advisory: 'GHSA-vfj7-8cjw-p6xm',
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  version: '3.0.3',
  patch: 'patches/braces@3.0.3.patch',
  sha256: '6c59dad67310b2f93ed0fead159b0207845d70a6d30a5ae49384c2930df48303',
})

const depthPattern = (depth, left = '{', right = '}') =>
  left.repeat(depth) + 'a,b' + right.repeat(depth)

// 独立迭代构造 AST，避免正常的 parse 深度限制掩盖 direct-AST 入口未修复的问题。
const nestedAst = (depth, type) => {
  let node = { type: 'text', value: 'a,b' }
  for (let index = 0; index < depth; index++) {
    const brace = type === 'brace'
    const parent = {
      type,
      open: true,
      close: true,
      commas: 0,
      ranges: 0,
      nodes: [
        { type: brace ? 'open' : 'text', value: brace ? '{' : '(' },
        node,
        { type: brace ? 'close' : 'text', value: brace ? '}' : ')' },
      ],
    }
    for (const child of parent.nodes) child.parent = parent
    node = parent
  }
  const ast = { type: 'root', nodes: [node] }
  node.parent = ast
  return ast
}

export const verifyBracesBehavior = braces => {
  let checks = 0
  const rejectsDepth = operation => {
    assert.throws(
      operation,
      error =>
        error instanceof SyntaxError &&
        error.message === 'braces nesting exceeds maximum depth of 100',
      'braces must reject excessive depth before stack exhaustion'
    )
    checks++
  }
  for (const depth of [101, 4000]) {
    for (const pair of [
      ['{', '}'],
      ['(', ')'],
    ]) {
      const pattern = depthPattern(depth, ...pair)
      for (const method of ['parse', 'compile', 'expand', 'stringify']) {
        rejectsDepth(() => braces[method](pattern))
      }
      rejectsDepth(() => braces(pattern))
    }
  }
  for (const method of ['compile', 'expand', 'stringify']) {
    for (const type of ['brace', 'paren']) {
      rejectsDepth(() => braces[method](nestedAst(4000, type)))
    }
    assert.doesNotThrow(() => braces[method](depthPattern(100)))
    checks++
  }
  const examples = [
    ['*.js', '*.js', ['*.js']],
    [
      'src/{a,b}/{c,d}.ts',
      'src/(a|b)/(c|d).ts',
      ['src/a/c.ts', 'src/a/d.ts', 'src/b/c.ts', 'src/b/d.ts'],
    ],
    [
      'file-{001..003}.md',
      'file-(00[1-3]).md',
      ['file-001.md', 'file-002.md', 'file-003.md'],
    ],
    ['{1..5..2}', '(1|3|5)', ['1', '3', '5']],
    ['a/{b,{c,d}}/e', 'a/(b|(c|d))/e', ['a/b/e', 'a/c/e', 'a/d/e']],
    ['{a,,b}', '(a|b)', ['a', '', 'b']],
  ]
  for (const [pattern, compiled, expanded] of examples) {
    for (const input of [() => pattern, () => braces.parse(pattern)]) {
      assert.equal(braces.compile(input()), compiled)
      assert.deepEqual(braces.expand(input()), expanded)
      assert.equal(braces.stringify(input()), pattern)
      checks += 3
    }
  }
  assert.equal(braces.stringify('\\{literal\\}'), '{literal}')
  return checks + 1
}

export const verifyBracesMitigation = (directory = root) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(directory, 'package.json'), 'utf8')
  )
  assert.equal(
    pkg.patchedDependencies?.['braces@3.0.3'],
    bracesMitigation.patch,
    'Exact braces patchedDependencies entry is required'
  )
  const patch = fs.readFileSync(path.join(directory, bracesMitigation.patch))
  assert.equal(
    createHash('sha256').update(patch).digest('hex'),
    bracesMitigation.sha256,
    'Reviewed braces patch SHA-256 changed'
  )
  const require = createRequire(path.join(directory, 'package.json'))
  assert.equal(
    require('braces/package.json').version,
    bracesMitigation.version,
    'Installed braces version must match the reviewed patch'
  )
  const micromatchRequire = createRequire(
    require.resolve('micromatch/package.json')
  )
  assert.equal(
    micromatchRequire.resolve('braces'),
    require.resolve('braces'),
    'micromatch must resolve the verified braces installation'
  )
  const lock = fs.readFileSync(path.join(directory, 'bun.lock'), 'utf8')
  const resolutions = [...lock.matchAll(/"[^"]*braces":\s*\["braces@([^"]+)"/g)]
  assert.deepEqual(
    resolutions.map(match => match[1]),
    ['3.0.3'],
    'Only the reviewed braces resolution may be locally mitigated'
  )
  const checks = verifyBracesBehavior(require('braces'))
  assert.deepEqual(
    require('micromatch')(
      ['src/a.ts', 'src/a.vue', 'docs/a.md'],
      'src/**/*.{ts,vue}'
    ),
    ['src/a.ts', 'src/a.vue']
  )
  return checks + 1
}

/** 校验审计进程状态与响应格式，网络失败不能当作无告警。 */
const readAuditEntries = result => {
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    throw new Error('Dependency audit did not complete successfully')
  }
  if (
    /\b(error|failed|timed?\s*out|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|ECONN\w*)\b/i.test(
      result.stderr || ''
    )
  ) {
    throw new Error('Dependency audit reported an execution or network error')
  }
  let audit
  try {
    audit = JSON.parse(result.stdout)
  } catch {
    throw new Error('Dependency audit did not return valid JSON')
  }
  assert.ok(
    audit && typeof audit === 'object' && !Array.isArray(audit),
    'Dependency audit returned an unexpected JSON schema'
  )
  return Object.entries(audit)
}

/** 只接受这一条已审核公告；任何新增或范围改变都要求重新处理。 */
const assertKnownAdvisory = entries => {
  assert.equal(
    entries.length,
    1,
    'Unreviewed dependency advisory: inspect bun run security:audit:raw'
  )
  const [name, alerts] = entries[0]
  assert.ok(
    name === 'braces' && Array.isArray(alerts) && alerts.length === 1,
    'Unreviewed dependency advisory: only one exact braces advisory may be mitigated'
  )
  const alert = alerts[0]
  assert.ok(
    alert &&
      alert.id === 1240992 &&
      alert.url === bracesMitigation.url &&
      alert.severity === 'high' &&
      alert.vulnerable_versions === '<=3.0.3',
    'Unreviewed dependency advisory: the braces advisory identity or scope changed'
  )
}

/** 在实际安装补丁的完整行为验证通过后，才报告本地缓解状态。 */
export const evaluateAuditResult = (result, verifyMitigation) => {
  const entries = readAuditEntries(result)
  if (entries.length === 0) {
    assert.equal(
      result.status,
      0,
      'An empty audit with a failure exit is not a clean audit'
    )
    return {
      rawFindings: 0,
      locallyMitigated: [],
      behaviorChecks: verifyMitigation(),
    }
  }
  assertKnownAdvisory(entries)
  assert.equal(
    result.status,
    1,
    'Audit exit code does not match its reported findings'
  )
  return {
    rawFindings: 1,
    locallyMitigated: [bracesMitigation.advisory],
    behaviorChecks: verifyMitigation(),
  }
}

export const checkDependencySecurity = (directory = root) => {
  const audit = spawnSync('bun', ['audit', '--json'], {
    cwd: directory,
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 8 * 1024 * 1024,
  })
  return evaluateAuditResult(audit, () => verifyBracesMitigation(directory))
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const result = checkDependencySecurity()
    console.log(JSON.stringify(result, null, 2))
    if (result.rawFindings) {
      console.log(
        'One upstream advisory remains; its development-toolchain depth issue is locally mitigated and verified. This is not a zero-finding raw audit.'
      )
    }
  } catch (error) {
    console.error(`Dependency security check failed: ${error.message}`)
    process.exitCode = 1
  }
}
