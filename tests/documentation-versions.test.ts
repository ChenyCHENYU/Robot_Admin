/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\documentation-versions.test.ts
 * @Description: AI 指南版本表与项目声明一致，避免旧文档指导新代码
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import packageJson from '../package.json'

test('AI 技术栈及生态包版本表匹配 package.json', async () => {
  const source = await Bun.file(
    new URL('../.github/copilot-instructions.md', import.meta.url)
  ).text()
  const dependencies: Record<string, string> = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
  const frameworks: Record<string, string> = {
    Vue: 'vue',
    TypeScript: 'typescript',
    Vite: 'vite',
    'Naive UI': 'naive-ui',
    Pinia: 'pinia',
    'Vue Router': 'vue-router',
    UnoCSS: 'unocss',
    Sass: 'sass',
  }
  for (const [label, name] of Object.entries(frameworks)) {
    const row = source.split('\n').find(line => line.startsWith(`| ${label} `))
    expect(row, label).toBeDefined()
    expect(row!.split('|')[2]!.trim().replace(/^[~^]/, '')).toBe(
      dependencies[name]!.replace(/^[~^]/, '')
    )
  }
  for (const [name, version] of Object.entries(dependencies).filter(([name]) =>
    name.startsWith('@robot-admin/')
  )) {
    const row = source
      .split('\n')
      .find(line => line.startsWith(`| \`${name}\``))
    expect(row, name).toBeDefined()
    expect(row!.split('|')[2]!.trim()).toBe(version)
  }
})

test('README 的 Bun 最低版本徽章匹配 engines，无坏 HTML 和损坏字符', async () => {
  const texts = await Promise.all(
    ['README.md', 'README_EN.md'].map(filename =>
      Bun.file(new URL(`../${filename}`, import.meta.url)).text()
    )
  )
  for (const text of texts) {
    expect(text).toContain(
      `bun-%E2%89%A5${packageJson.engines.bun.replace('>=', '')}`
    )
    expect(text).not.toContain('\uFFFD')
    expect(text).not.toContain('<parameter')
  }
})
