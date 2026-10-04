/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\config\vite\viteProjectInfoPlugin.ts
 * @Description: 从当前安装的直接依赖生成关于页版本信息
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import type { ProjectInfo } from '../../types/projectInfo'

const MODULE_ID = 'virtual:robot-admin-project-info'

/** 仅提取展示字段，不把完整依赖清单或本机路径暴露给浏览器。 */
export const readProjectInfo = (root: string): ProjectInfo => {
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8')
  ) as {
    version: string
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }
  /** 关于页只列直接依赖，不将组件库内部依赖误标为项目依赖。 */
  const readDependencies = (dependencies: Record<string, string>) =>
    Object.entries(dependencies).map(([name, declaredVersion]) => {
      const installed = JSON.parse(
        readFileSync(
          resolve(root, 'node_modules', name, 'package.json'),
          'utf8'
        )
      ) as { version: string; description?: string; homepage?: string }
      return {
        name,
        version: installed.version,
        declaredVersion,
        description: installed.description ?? '',
        url: `https://www.npmjs.com/package/${name}`,
      }
    })
  return {
    version: manifest.version,
    dependencies: readDependencies(manifest.dependencies),
    devDependencies: readDependencies(manifest.devDependencies),
  }
}

/** 虚拟模块与当前构建绑定，升级安装后无需再手改页面版本。 */
export const createProjectInfoPlugin = (): Plugin => {
  let root = process.cwd()
  return {
    name: 'robot-admin-project-info',
    /** 使用 Vite 的项目根目录解析安装依赖。 */
    configResolved(config) {
      ;({ root } = config)
    },
    /** 提供独立的虚拟模块标识。 */
    resolveId(id) {
      return id === MODULE_ID ? `\0${MODULE_ID}` : undefined
    },
    /** 将当前安装版本固化到构建产物。 */
    load(id) {
      if (id === `\0${MODULE_ID}`)
        return `export default ${JSON.stringify(readProjectInfo(root))}`
    },
  }
}
