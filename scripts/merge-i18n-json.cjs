#!/usr/bin/env node
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\scripts\merge-i18n-json.cjs
 * @Description: 翻译词典三方合并；真实冲突交由 Git 处理，不自动丢弃改动
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
const fs = require('node:fs')
const { isDeepStrictEqual } = require('node:util')

/** JSON 对象只能包含自有键，允许空文本和安全的特殊 key。 */
function readJSON(path) {
  const value = JSON.parse(fs.readFileSync(path, 'utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('翻译文件必须为 JSON 对象')
  return new Map(Object.entries(value))
}

/** 比较存在状态及完整值，区分删除、空字符串与缺失。 */
function equalEntry(left, right, key) {
  return (
    left.has(key) === right.has(key) &&
    isDeepStrictEqual(left.get(key), right.get(key))
  )
}

/** 单方改动正常合入；双方不同的改动保留 ours 并报告冲突。 */
function mergeTranslations(base, ours, theirs) {
  const merged = new Map()
  const conflicts = []
  const keys = new Set([...base.keys(), ...ours.keys(), ...theirs.keys()])
  for (const key of keys) {
    let source = ours
    if (equalEntry(ours, theirs, key)) source = ours
    else if (equalEntry(ours, base, key)) source = theirs
    else if (!equalEntry(theirs, base, key)) conflicts.push(key)
    if (source.has(key)) merged.set(key, source.get(key))
  }
  return { merged, conflicts }
}

/** Git 使用四参数三方合并；旧手动三参数接口继续明确保留 ours。 */
function main() {
  const args = process.argv.slice(2)
  if (args.length !== 3 && args.length !== 4)
    throw new Error(
      '用法: bun scripts/merge-i18n-json.cjs <ours> <theirs> <output> [base]'
    )
  const [oursPath, theirsPath, outputPath, basePath] = args
  const ours = readJSON(oursPath)
  const theirs = readJSON(theirsPath)
  const result = basePath
    ? mergeTranslations(readJSON(basePath), ours, theirs)
    : { merged: new Map([...theirs, ...ours]), conflicts: [] }
  const sorted = Object.fromEntries(
    [...result.merged].sort(([a], [b]) => a.localeCompare(b))
  )
  fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8')
  if (result.conflicts.length) {
    console.error(`翻译词条冲突，需人工合并: ${result.conflicts.join(', ')}`)
    process.exitCode = 1
  } else console.log(`已合并 ${result.merged.size} 条翻译`)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
