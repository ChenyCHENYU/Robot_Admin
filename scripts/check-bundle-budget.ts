/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\scripts\check-bundle-budget.ts
 * @Description: 生产构建首屏资源预算检查
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { statSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const KIB = 1024

export interface IndexAssets {
  entryScripts: string[]
  modulePreloads: string[]
  stylesheets: string[]
}

export interface BundleMetrics {
  entryBytes: number
  preloadBytes: number
  stylesheetBytes: number
  initialBytes: number
  preloadCount: number
  largestChunkBytes: number
  largestChunkName: string
}

export interface BundleBudgets {
  entryBytes: number
  preloadBytes: number
  stylesheetBytes: number
  initialBytes: number
  preloadCount: number
  largestChunkBytes: number
}

export const DEFAULT_BUNDLE_BUDGETS: BundleBudgets = {
  entryBytes: 450 * KIB,
  preloadBytes: 650 * KIB,
  stylesheetBytes: 300 * KIB,
  initialBytes: 1_450 * KIB,
  preloadCount: 90,
  largestChunkBytes: 5_000 * KIB,
}

const collectMatches = (html: string, pattern: RegExp): string[] =>
  [...html.matchAll(pattern)].map(match => match[1])

/** 解析入口 HTML 中影响首屏的构建资源。 */
export const parseIndexAssets = (html: string): IndexAssets => ({
  entryScripts: collectMatches(
    html,
    /<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/g
  ),
  modulePreloads: collectMatches(
    html,
    /<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g
  ),
  stylesheets: collectMatches(
    html,
    /<link[^>]+rel="stylesheet"[^>]+href="\/([^"]+\.css)"/g
  ),
})

const sumAssetBytes = (distDir: string, assets: string[]): number =>
  assets.reduce(
    (total, asset) => total + statSync(join(distDir, asset)).size,
    0
  )

/** 收集构建产物体积指标。 */
export const collectBundleMetrics = (distDir: string): BundleMetrics => {
  const html = readFileSync(join(distDir, 'index.html'), 'utf8')
  const assets = parseIndexAssets(html)
  const entryBytes = sumAssetBytes(distDir, assets.entryScripts)
  const preloadBytes = sumAssetBytes(distDir, assets.modulePreloads)
  const stylesheetBytes = sumAssetBytes(distDir, assets.stylesheets)
  const jsDir = join(distDir, 'js')
  const chunks = readdirSync(jsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => ({ file, bytes: statSync(join(jsDir, file)).size }))
    .sort((left, right) => right.bytes - left.bytes)
  const largest = chunks[0] ?? { file: '', bytes: 0 }

  return {
    entryBytes,
    preloadBytes,
    stylesheetBytes,
    initialBytes: entryBytes + preloadBytes + stylesheetBytes,
    preloadCount: assets.modulePreloads.length,
    largestChunkBytes: largest.bytes,
    largestChunkName: largest.file,
  }
}

/** 返回超过预算的指标说明。 */
export const evaluateBundleMetrics = (
  metrics: BundleMetrics,
  budgets: BundleBudgets = DEFAULT_BUNDLE_BUDGETS
): string[] => {
  const checks: Array<[keyof BundleBudgets, number, string]> = [
    ['entryBytes', metrics.entryBytes, '入口 JS'],
    ['preloadBytes', metrics.preloadBytes, 'modulepreload JS'],
    ['stylesheetBytes', metrics.stylesheetBytes, '首屏 CSS'],
    ['initialBytes', metrics.initialBytes, '首屏静态资源'],
    ['preloadCount', metrics.preloadCount, 'modulepreload 数量'],
    ['largestChunkBytes', metrics.largestChunkBytes, '最大异步块'],
  ]

  return checks.flatMap(([key, actual, label]) =>
    actual > budgets[key]
      ? [`${label} 超出预算：${actual} > ${budgets[key]}`]
      : []
  )
}

const formatKib = (bytes: number): string => `${(bytes / KIB).toFixed(2)} KiB`

if (import.meta.main) {
  const metrics = collectBundleMetrics(join(process.cwd(), 'dist'))
  const failures = evaluateBundleMetrics(metrics)

  console.log(
    [
      `入口 ${formatKib(metrics.entryBytes)}`,
      `预加载 ${formatKib(metrics.preloadBytes)} / ${metrics.preloadCount} 个`,
      `样式 ${formatKib(metrics.stylesheetBytes)}`,
      `首屏合计 ${formatKib(metrics.initialBytes)}`,
      `最大异步块 ${metrics.largestChunkName} ${formatKib(metrics.largestChunkBytes)}`,
    ].join(' · ')
  )

  if (failures.length > 0) {
    for (const failure of failures) console.error(`❌ ${failure}`)
    process.exitCode = 1
  } else {
    console.log('✅ 构建体积预算检查通过')
  }
}
