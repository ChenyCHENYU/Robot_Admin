/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\robot-other-pages-015.test.ts
 * @Description: 其余演示、仪表盘、关于页和导航组件的运行时导入与渲染边界回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { parse } from '@vue/compiler-sfc'

const packageName = '@robot-admin/naive-ui-components'
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const excludedDemos =
  /[/\\]views[/\\]demo[/\\](?:07-|08-|09-|10-|11-|12-|14-|40-)/

/** 遍历这些消费侧目录，同时检查未直接注册为路由的渲染子组件。 */
async function collectSources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(
    entries.map(entry => {
      const path = join(directory, entry.name)
      if (excludedDemos.test(path)) return []
      return entry.isDirectory()
        ? collectSources(path)
        : /\.(vue|ts)$/.test(path)
          ? [path]
          : []
    })
  )
  return groups.flat()
}

const paths = (
  await Promise.all(
    [
      'src/views/demo',
      'src/views/dashboard',
      'src/views/about',
      'src/components/global',
    ].map(directory => collectSources(join(projectRoot, directory)))
  )
).flat()

const sources = await Promise.all(
  paths.map(async path => {
    const source = await readFile(path, 'utf8')
    const descriptor = path.endsWith('.vue')
      ? parse(source, { filename: path }).descriptor
      : null
    const script = descriptor
      ? [descriptor.script?.content, descriptor.scriptSetup?.content]
          .filter(Boolean)
          .join('\n')
      : source
    return {
      path: path.slice(projectRoot.length),
      ast: ts.createSourceFile(
        path,
        script,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      ),
    }
  })
)

/** type-only 根导入会被擦除，只检查实际进入运行时依赖图的导入。 */
function isRuntimeImport(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause
  if (!clause) return true
  if (clause.isTypeOnly) return false
  if (clause.name) return true
  const bindings = clause.namedBindings
  return Boolean(
    bindings &&
    (ts.isNamespaceImport(bindings) ||
      bindings.elements.some(element => !element.isTypeOnly))
  )
}

/** helper 与类型导入不需要样式，只提取手工导入的可视组件绑定。 */
function getVisualImports(node: ts.ImportDeclaration): string[] {
  if (!isRuntimeImport(node) || !ts.isStringLiteral(node.moduleSpecifier))
    return []
  if (!node.moduleSpecifier.text.startsWith(`${packageName}/`)) return []
  const bindings = node.importClause?.namedBindings
  if (!bindings || !ts.isNamedImports(bindings)) return []
  return bindings.elements
    .filter(element => !element.isTypeOnly)
    .map(element => element.propertyName?.text ?? element.name.text)
    .filter(name => name.startsWith('C_'))
}

describe('其余页面正式包消费边界', () => {
  test('运行时使用组件子入口，保留有效的 type-only 根入口导入', () => {
    const violations: string[] = []
    for (const { path, ast } of sources) {
      /** 同时检查静态导入与动态 import()，不把类型查询误判为运行时代码。 */
      function visit(node: ts.Node): void {
        if (
          ts.isImportDeclaration(node) &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === packageName &&
          isRuntimeImport(node)
        )
          violations.push(path)
        if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0]) &&
          node.arguments[0].text === packageName
        )
          violations.push(path)
        ts.forEachChild(node, visit)
      }
      visit(ast)
    }
    expect(violations).toEqual([])
  })

  test('嵌套渲染组件不依赖父级模板自动导入的字符串组件注册', () => {
    const violations: string[] = []
    for (const { path, ast } of sources) {
      /** C_ 组件由模板按需导入，运行时字符串解析需要额外的全局注册。 */
      function visit(node: ts.Node): void {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'resolveComponent' &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0]) &&
          node.arguments[0].text.startsWith('C_')
        )
          violations.push(`${path}: ${node.arguments[0].text}`)
        ts.forEachChild(node, visit)
      }
      visit(ast)
    }
    expect(violations).toEqual([])
  })

  test('渲染函数手工导入的可视组件显式带上组件级样式', () => {
    const violations: string[] = []
    for (const { path, ast } of sources) {
      const imports = ast.statements.filter(ts.isImportDeclaration)
      const modules = new Set(
        imports.flatMap(node =>
          ts.isStringLiteral(node.moduleSpecifier)
            ? [node.moduleSpecifier.text]
            : []
        )
      )
      for (const node of imports) {
        for (const name of getVisualImports(node)) {
          if (
            !modules.has(`${packageName}/${name}/style.css`) &&
            !modules.has(`${packageName}/${name}/base.css`)
          ) {
            violations.push(`${path}: ${name}`)
          }
        }
      }
    }
    expect(violations).toEqual([])
  })
})
