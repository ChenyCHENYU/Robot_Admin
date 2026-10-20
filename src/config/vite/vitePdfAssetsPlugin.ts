/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @Description: 将 PDF.js 中文字库、标准字体和解码资源随应用同源发布
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

/** 开发与正式构建共用资源清单，不依赖第三方 CDN，也不将完整字库内联进首屏。 */
export function createPdfAssetsPlugin(): Plugin {
  const root = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../node_modules/pdfjs-dist'
  )
  const { version } = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8')
  ) as { version: string }
  const assets = ['cmaps', 'standard_fonts', 'wasm', 'iccs'].flatMap(folder =>
    readdirSync(resolve(root, folder), { withFileTypes: true })
      .filter(item => item.isFile())
      .map(item => ({
        name: `pdfjs/${version}/${folder}/${item.name}`,
        path: resolve(root, folder, item.name),
      }))
  )
  return {
    name: 'robot-pdf-assets',
    /** 开发请求只映射已枚举的资源，不接受任意文件路径。 */
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0]
        const asset = assets.find(item => path === `/${item.name}`)
        if (!asset) return next()
        response.setHeader(
          'Content-Type',
          asset.name.endsWith('.wasm')
            ? 'application/wasm'
            : 'application/octet-stream'
        )
        response.end(readFileSync(asset.path))
      })
    },
    /** 与当前 PDF.js 版本绑定输出，升级后不会复用旧字库。 */
    generateBundle() {
      for (const asset of assets)
        this.emitFile({
          type: 'asset',
          fileName: asset.name,
          source: readFileSync(asset.path),
        })
    },
  }
}
