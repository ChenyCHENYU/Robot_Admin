/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\config\vite\viteDependencyUpdatePlugin.ts
 * @Description: 安装清单变更时统一刷新模块图、样式与版本信息
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/** 读取内容指纹；普通触碰文件不触发额外重启。 */
export function dependencySignature(root: string): string {
  const hash = createHash('sha256')
  for (const filename of ['package.json', 'bun.lock', 'bun.lockb']) {
    const path = resolve(root, filename)
    hash.update(filename)
    if (existsSync(path)) hash.update(readFileSync(path))
  }
  return hash.digest('hex')
}

/** node_modules 的标准 ESM 被排除预构建，安装后必须清空服务端模块图。 */
export function createDependencyUpdatePlugin(): Plugin {
  let cleanup: (() => void) | undefined
  return {
    name: 'robot-admin-dependency-update',
    apply: 'serve',
    /** 只监听三份安装清单，合并一次安装过程中的多次写入。 */
    configureServer(server) {
      const { root } = server.config
      const files = new Set(
        ['package.json', 'bun.lock', 'bun.lockb'].map(name =>
          resolve(root, name)
        )
      )
      let signature = dependencySignature(root)
      let timer: ReturnType<typeof setTimeout> | undefined
      let disposed = false
      const changed = (file: string) => {
        if (!files.has(resolve(file))) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          if (disposed) return
          const next = dependencySignature(root)
          if (signature === next) return
          signature = next
          server.config.logger.info(
            '依赖安装清单已变化，重新加载开发服务以统一模块与样式版本。'
          )
          void server.restart().catch(error => {
            server.config.logger.error(`依赖更新后重启失败：${String(error)}`)
          })
        }, 400)
      }
      server.watcher.add([...files])
      server.watcher
        .on('change', changed)
        .on('add', changed)
        .on('unlink', changed)
      cleanup = () => {
        disposed = true
        clearTimeout(timer)
        server.watcher
          .off('change', changed)
          .off('add', changed)
          .off('unlink', changed)
      }
    },
    /** 重启或退出时销毁旧监听，避免重复重启。 */
    closeBundle() {
      cleanup?.()
    },
  }
}
