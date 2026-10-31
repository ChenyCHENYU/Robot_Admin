/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\scripts\prepare-types.ts
 * @Description: 无服务器的类型准备，冷安装和窄构建均使用真实自动导入插件生成声明
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, rm } from 'node:fs/promises'
import { build } from 'vite'
import { createAutoImportConfig } from '../src/config/vite/viteAutoImportConfig'
import { createComponentsConfig } from '../src/config/vite/viteComponentsConfig'

/** 只构建空虚拟入口触发插件声明生命周期，不启动浏览器、端口或输出应用 bundle。 */
export async function prepareTypes(
  directory = resolve('src/types')
): Promise<void> {
  await mkdir(directory, { recursive: true })
  // 仅重建工具拥有的生成文件，避免插件沿用上次窄入口留下的残缺清单。
  await rm(resolve(directory, 'components.d.ts'), { force: true })
  const entry = '\0robot-type-declarations'
  await build({
    configFile: false,
    publicDir: false,
    logLevel: 'silent',
    plugins: [
      createAutoImportConfig(resolve(directory, 'auto-imports.d.ts')),
      createComponentsConfig(resolve(directory, 'components.d.ts')),
      {
        name: 'robot-type-declarations',
        resolveId: id => (id === entry ? entry : undefined),
        load: id => (id === entry ? 'export {}' : undefined),
      },
    ],
    build: { write: false, minify: false, rolldownOptions: { input: entry } },
  })
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  await prepareTypes()
}
