/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\config\vite\viteProjectMetricsPlugin.ts
 * @Description: 从源码目录与本次实际构建产物生成按需读取的工程指标
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import type { Plugin } from 'vite'
import type { ProjectMetrics } from '../../types/observability'
import {
  parseIndexAssets,
  DEFAULT_BUNDLE_BUDGETS,
} from '../../../scripts/check-bundle-budget.ts'

const FILE_NAME = 'project-metrics.json'

/** 只统计组件与菜单的数量、公开名称，不输出源码或本机文件路径。 */
export const readProjectInventory = (
  root: string
): ProjectMetrics['inventory'] => {
  const vueFiles = readdirSync(join(root, 'src/views'), {
    recursive: true,
  }).filter(name => typeof name === 'string' && name.endsWith('.vue')).length
  const components = readdirSync(
    join(root, 'node_modules/@robot-admin/naive-ui-components/dist')
  ).filter(name => /^C_[A-Z].+\.d\.ts$/.test(name)).length
  const data = JSON.parse(
    readFileSync(join(root, 'src/assets/data/dynamicRouter.json'), 'utf8')
  ) as {
    data: Array<InventoryRoute>
  }
  const routes = new Map<string, number>()
  const routeNames: ProjectMetrics['inventory']['routeNames'] = []
  /** 叶子菜单与代码组件分开计数，避免将两者混为页面数量。 */
  const visit = (items: InventoryRoute[], group: string) => {
    for (const item of items) {
      if (item.children?.length) visit(item.children, group)
      else if (item.name) {
        routes.set(group, (routes.get(group) ?? 0) + 1)
        routeNames.push({
          name: item.name,
          title: item.meta?.title ?? item.name,
        })
      }
    }
  }
  for (const item of data.data) {
    const group =
      item.meta?.title ??
      (item.children?.length === 1
        ? item.children[0].meta?.title
        : undefined) ??
      item.path
    visit([item], group)
  }
  return {
    vueFiles,
    components,
    routes: [...routes].map(([group, count]) => ({ group, count })),
    routeNames,
  }
}

interface InventoryRoute {
  path: string
  name?: string
  meta?: { title?: string }
  children?: InventoryRoute[]
}

/** 初始体积直接读取 HTML 引用；gzip 为构建估算，绝不当作网络实测。 */
export const readBuildMetrics = (
  directory: string,
  durationMs: number
): NonNullable<ProjectMetrics['build']> => {
  const html = readFileSync(join(directory, 'index.html'), 'utf8')
  const initial = parseIndexAssets(html)
  const initialFiles = new Set([
    ...initial.entryScripts,
    ...initial.modulePreloads,
    ...initial.stylesheets,
  ])
  const assets = readdirSync(directory, { recursive: true })
    .filter(
      (name): name is string =>
        typeof name === 'string' && /\.(js|css)$/.test(name)
    )
    .map(name => {
      const source = readFileSync(join(directory, name))
      return {
        name,
        bytes: statSync(join(directory, name)).size,
        gzipBytes: gzipSync(source).byteLength,
        initial: initialFiles.has(name),
        kind: name.endsWith('.js') ? ('js' as const) : ('css' as const),
      }
    })
  /** 按 HTML 的入口、预加载和 CSS 分别求和。 */
  const sum = (names: string[]) =>
    names.reduce(
      (total, name) =>
        total + (assets.find(asset => asset.name === name)?.bytes ?? 0),
      0
    )
  return {
    durationMs: Math.round(durationMs),
    initialBytes: sum([...initialFiles]),
    initialGzipBytes: assets
      .filter(asset => asset.initial)
      .reduce((total, asset) => total + asset.gzipBytes, 0),
    entryBytes: sum(initial.entryScripts),
    preloadBytes: sum(initial.modulePreloads),
    stylesheetBytes: sum(initial.stylesheets),
    preloadCount: initial.modulePreloads.length,
    budgetBytes: DEFAULT_BUNDLE_BUDGETS.initialBytes,
    assets,
  }
}

/** 开发态不使用旧 dist 数据；生产指标与部署产物一同生成。 */
export const createProjectMetricsPlugin = (): Plugin => {
  let root = process.cwd()
  let outDir = 'dist'
  let startedAt = 0
  /** 构建报告每次重新扫描当前工程。 */
  const report = (build: ProjectMetrics['build']): ProjectMetrics => ({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    version: (
      JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
        version: string
      }
    ).version,
    inventory: readProjectInventory(root),
    build,
  })
  return {
    name: 'robot-admin-project-metrics',
    /** 与 Vite 实际输出目录绑定，兼容 application 构建。 */
    configResolved(config) {
      ;({ root } = config)
      outDir = resolve(root, config.build.outDir)
    },
    /** 记录本次编译起点，不把它称为开发服务器冷启动。 */
    buildStart() {
      startedAt = performance.now()
    },
    /** 生成独立报告，不进入应用首屏导入图。 */
    writeBundle() {
      writeFileSync(
        join(outDir, FILE_NAME),
        JSON.stringify(
          report(readBuildMetrics(outDir, performance.now() - startedAt))
        )
      )
    },
    /** 本机开发仅提供源码清单，构建体积保持未测状态。 */
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (
          new URL(request.url ?? '/', 'http://localhost').pathname !==
          `${server.config.base}${FILE_NAME}`
        ) {
          next()
          return
        }
        response.setHeader('Content-Type', 'application/json')
        response.setHeader('Cache-Control', 'no-store')
        response.end(JSON.stringify(report(null)))
      })
    },
  }
}
