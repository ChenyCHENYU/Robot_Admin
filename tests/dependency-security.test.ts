/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-23
 * @FilePath: \Robot_Admin\tests\dependency-security.test.ts
 * @Description: 依赖安全门禁失败分支与补丁行为回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  bracesMitigation,
  evaluateAuditResult,
  verifyBracesBehavior,
  verifyBracesMitigation,
} from '../scripts/check-dependency-security.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const knownAdvisory = {
  id: 1240992,
  url: bracesMitigation.url,
  severity: 'high',
  vulnerable_versions: '<=3.0.3',
}
const auditResult = (audit: unknown, status = 1) => ({
  status,
  stdout: JSON.stringify(audit),
  stderr: '',
})

const withFixture = (check: (directory: string) => void) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'robot-dependency-security-')
  )
  fs.mkdirSync(path.join(directory, 'patches'))
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    JSON.stringify({
      patchedDependencies: { 'braces@3.0.3': bracesMitigation.patch },
    })
  )
  fs.copyFileSync(
    path.join(root, bracesMitigation.patch),
    path.join(directory, bracesMitigation.patch)
  )
  fs.copyFileSync(path.join(root, 'bun.lock'), path.join(directory, 'bun.lock'))
  try {
    check(directory)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
}

describe('dependency security gate', () => {
  test('verifies the real installed patch, malicious strings/direct ASTs and normal glob behavior', () => {
    const result = evaluateAuditResult(
      auditResult({ braces: [knownAdvisory] }),
      () => verifyBracesMitigation(root)
    )
    expect(result).toEqual({
      rawFindings: 1,
      locallyMitigated: [bracesMitigation.advisory],
      behaviorChecks: 67,
    })
  })

  test('keeps a clean raw audit distinct from a local mitigation', () => {
    expect(evaluateAuditResult(auditResult({}, 0), () => 67)).toEqual({
      rawFindings: 0,
      locallyMitigated: [],
      behaviorChecks: 67,
    })
    expect(() => evaluateAuditResult(auditResult({}), () => 67)).toThrow(
      'failure exit'
    )
  })

  test('fails closed for new packages, extra advisories and changed advisory identity/scope', () => {
    const unknownCases = [
      { lodash: [knownAdvisory] },
      { braces: [knownAdvisory], lodash: [knownAdvisory] },
      { braces: [knownAdvisory, knownAdvisory] },
      {
        braces: [
          { ...knownAdvisory, url: 'https://github.com/advisories/GHSA-new' },
        ],
      },
      { braces: [{ ...knownAdvisory, vulnerable_versions: '<=3.0.4' }] },
      { braces: [{ ...knownAdvisory, severity: 'critical' }] },
    ]
    for (const audit of unknownCases) {
      expect(() => evaluateAuditResult(auditResult(audit), () => 67)).toThrow(
        'Unreviewed'
      )
    }
  })

  test('fails closed for network/command failures, malformed JSON and unexpected schemas', () => {
    for (const result of [
      { status: 1, stdout: '<html>gateway error</html>' },
      { status: 2, stdout: '{}' },
      { status: null, stdout: '{}', signal: 'SIGTERM' },
      { status: 1, stdout: '{}', error: new Error('ENOTFOUND') },
      {
        ...auditResult({ braces: [knownAdvisory] }),
        stderr: 'error: fetch failed',
      },
      auditResult(null, 0),
      auditResult([], 0),
      auditResult({ braces: {} }),
    ]) {
      expect(() => evaluateAuditResult(result, () => 67)).toThrow()
    }
  })

  test('rejects a missing patch, changed bytes and a removed manifest declaration', () => {
    withFixture(directory => {
      fs.rmSync(path.join(directory, bracesMitigation.patch))
      expect(() => verifyBracesMitigation(directory)).toThrow()
    })
    withFixture(directory => {
      fs.appendFileSync(path.join(directory, bracesMitigation.patch), '\n')
      expect(() => verifyBracesMitigation(directory)).toThrow('SHA-256')
    })
    withFixture(directory => {
      fs.writeFileSync(path.join(directory, 'package.json'), '{}')
      expect(() => verifyBracesMitigation(directory)).toThrow(
        'patchedDependencies'
      )
    })
  })

  test('rejects a different installed version or additional unresolved braces copy', () => {
    withFixture(directory => {
      fs.mkdirSync(path.join(directory, 'node_modules/braces'), {
        recursive: true,
      })
      fs.writeFileSync(
        path.join(directory, 'node_modules/braces/package.json'),
        '{"version":"3.0.2"}'
      )
      expect(() => verifyBracesMitigation(directory)).toThrow(
        'Installed braces version'
      )
    })
    withFixture(directory => {
      fs.symlinkSync(
        path.join(root, 'node_modules'),
        path.join(directory, 'node_modules'),
        'dir'
      )
      fs.appendFileSync(
        path.join(directory, 'bun.lock'),
        '\n"nested/braces": ["braces@3.0.2"]'
      )
      expect(() => verifyBracesMitigation(directory)).toThrow(
        'Only the reviewed braces resolution'
      )
    })
  })

  test('never accepts an installation that silently skips depth checks', () => {
    const unsafe = Object.assign(() => [], {
      parse: () => ({}),
      compile: () => '',
      expand: () => [],
      stringify: () => '',
    })
    expect(() => verifyBracesBehavior(unsafe)).toThrow('reject excessive depth')
    expect(() =>
      evaluateAuditResult(auditResult({ braces: [knownAdvisory] }), () => {
        throw new Error('patch behavior failed')
      })
    ).toThrow('patch behavior failed')
  })

  test('rejects a partial patch that guards parsing but leaves a direct AST entry unprotected', () => {
    const require = createRequire(import.meta.url)
    const braces = require('braces')
    const partial = Object.assign((input: string) => braces(input), braces, {
      compile: (input: unknown) =>
        typeof input === 'string' ? braces.compile(input) : '',
    })
    expect(() => verifyBracesBehavior(partial)).toThrow(
      'reject excessive depth'
    )
  })
})
