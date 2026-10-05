/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\scripts\generate-route-translations.ts
 * @Description: 从菜单 JSON 生成可供自动翻译插件扫描的原始标题
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface MenuRoute {
  meta?: { title?: string }
  children?: MenuRoute[]
}

/** 只提取展示标题，保持路由 name / path / 权限标识不参与翻译。 */
function collectTitles(routes: MenuRoute[]): string[] {
  const titles = new Set<string>()
  const visit = (items: MenuRoute[]): void => {
    for (const route of items) {
      if (route.meta?.title) titles.add(route.meta.title)
      if (route.children) visit(route.children)
    }
  }
  visit(routes)
  return [...titles].sort()
}

const sourcePath = resolve(
  import.meta.dirname,
  '../src/assets/data/dynamicRouter.json'
)
const outputPath = resolve(
  import.meta.dirname,
  '../src/utils/plugins/i18n-route.ts'
)
const routes = JSON.parse(readFileSync(sourcePath, 'utf8')) as {
  data: MenuRoute[]
}
const titles = collectTitles(routes.data)
const header = [
  '/*',
  ' * @Author: ChenYu ycyplus@gmail.com',
  ' * @Date: 2026-10-05',
  ' * @FilePath: \\Robot_Admin\\src\\utils\\plugins\\i18n-route.ts',
  ' * @Description: 菜单标题扫描入口，由 bun run gen:route-i18n 生成',
  ' * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.',
  ' */',
].join('\n')
const scanEntry =
  'export const ROUTE_TITLES = ' + JSON.stringify(titles, null, 2)
writeFileSync(
  outputPath,
  [
    header,
    '',
    "export { translateText as translateRouteTitle } from '@/utils/d_i18n'",
    '',
    '/** 让自动翻译插件扫描 JSON 中的标题，生产运行时不使用这份数组。 */',
    scanEntry,
    '',
  ].join('\n')
)
console.log(
  '已生成 ' +
    titles.length +
    ' 个菜单标题；已有翻译离线可用，新增词条需显式启用自动翻译。'
)
