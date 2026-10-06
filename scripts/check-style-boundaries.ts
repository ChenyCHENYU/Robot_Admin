/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\scripts\check-style-boundaries.ts
 * @Description: 编译全部页面及组件样式，阻止选择器逃逸到应用全局
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse, compileStyleAsync } from '@vue/compiler-sfc'
import postcss from 'postcss'
import { compileAsync } from 'sass'

/** 递归遍历源码，而不是只检查当前已注册路由。 */
async function collectVueFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(
    entries.map(entry => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory()
        ? collectVueFiles(path)
        : Promise.resolve(path.endsWith('.vue') ? [path] : [])
    })
  )
  return groups.flat()
}

const files = await collectVueFiles(resolve('src'))
const violations: string[] = []
let styleCount = 0
for (const filename of files) {
  const { descriptor, errors } = parse(await readFile(filename, 'utf8'), {
    filename,
  })
  if (errors.length) violations.push(`${filename}: ${errors.join('; ')}`)
  for (const style of descriptor.styles) {
    styleCount++
    const compiled = await compileStyleAsync({
      filename,
      id: 'data-v-style-audit',
      source: style.content,
      scoped: style.scoped,
      preprocessLang: style.lang === 'scss' ? 'scss' : undefined,
    })
    if (compiled.errors.length) {
      violations.push(`${filename}: ${compiled.errors.join('; ')}`)
      continue
    }
    postcss.parse(compiled.code).walkRules(rule => {
      if (
        rule.parent?.type === 'atrule' &&
        rule.parent.name.endsWith('keyframes')
      )
        return
      for (const selector of rule.selectors) {
        // 排除否定/关系选择器中的类，要求真正被修改的目标具备作用域。
        const positive = selector.replace(/:(?:not|has)\([^)]*\)/g, '')
        const scoped = /\[data-v-[\w-]+\]/.test(positive)
        // h() 用户弹层保留唯一命名空间；Teleport 模板仍使用 scoped。
        const ownedPortal = /\.user-panel(?:\b|[_-])/.test(positive)
        if (!scoped && !ownedPortal) violations.push(`${filename}: ${selector}`)
      }
    })
  }
}

// 全局入口也必须检查：SFC scoped 无法覆盖全局设计风格增强中的背景采样。
const globalStyles = await compileAsync(resolve('src/styles/index.scss'))
postcss.parse(globalStyles.css).walkRules(rule => {
  const samplesBackground = rule.nodes.some(
    node =>
      node.type === 'decl' &&
      /^(?:-webkit-)?backdrop-filter$/.test(node.prop) &&
      !/^(?:none|initial|unset|revert)$/.test(node.value.trim())
  )
  if (!samplesBackground) return
  for (const selector of rule.selectors) {
    const positive = selector.replace(/:(?:not|has)\([^)]*\)/g, '')
    const card = /\.(?:n-card(?:-header)?|custom-card|custom-statistic)\b/.test(
      positive
    )
    const overlay = /\.n-(?:modal|drawer|popover)\b/.test(positive)
    if (card && !overlay) {
      violations.push(
        `全局入口: ${selector} 对常驻卡片采样背景；模糊应由浮层容器负责`
      )
    }
  }
})
if (violations.length)
  throw new Error(`样式越界或编译失败：\n${violations.join('\n')}`)
console.log(
  `样式边界通过：${files.length} 个 SFC、${styleCount} 个样式块与全局入口（含全部页面）。`
)
