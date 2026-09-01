/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\tests\production-contract.test.ts
 * @Description: 发布、生产环境与安全响应头契约测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'

const readJson = async <T>(relativePath: string): Promise<T> =>
  Bun.file(new URL(relativePath, import.meta.url)).json()

describe('production contracts', () => {
  test('发布清单版本与 package.json 保持一致', async () => {
    const packageJson = await readJson<{ version: string }>('../package.json')
    const manifest = await readJson<Record<string, string>>(
      '../.github/workflows/release-please-manifest.json'
    )
    expect(manifest['.']).toBe(packageJson.version)
  })

  test('生产安全头覆盖关键 CSP 指令', async () => {
    const vercelConfig = await readJson<{
      headers: Array<{
        headers: Array<{ key: string; value: string }>
      }>
    }>('../vercel.json')
    const securityHeaders = vercelConfig.headers[0]?.headers ?? []
    const csp = securityHeaders.find(
      header => header.key === 'Content-Security-Policy'
    )?.value

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain('frame-ancestors')
    expect(csp).toContain("script-src 'self' https://webapi.amap.com;")
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).not.toContain("'unsafe-eval'")
    expect(
      securityHeaders.some(header => header.key === 'X-Content-Type-Options')
    ).toBe(true)
    expect(
      securityHeaders.find(header => header.key === 'Permissions-Policy')?.value
    ).toContain('geolocation=(self)')

    const indexHtml = await Bun.file(
      new URL('../index.html', import.meta.url)
    ).text()
    expect(indexHtml).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/i)
    expect(indexHtml).not.toMatch(/\son\w+\s*=/i)
  })

  test('完整验证包含测试、生产构建和体积预算', async () => {
    const packageJson = await readJson<{
      scripts: Record<string, string>
      devDependencies: Record<string, string>
    }>('../package.json')
    expect(packageJson.scripts.verify).toContain('bun run test')
    expect(packageJson.scripts.verify).toContain('bun run build')
    expect(packageJson.scripts.verify).toContain('bun run check:bundle')
    expect(packageJson.devDependencies['@inspira-ui/plugins']).toBeUndefined()
    expect(packageJson.devDependencies['@vue/runtime-core']).toBeUndefined()
  })

  test('地图组件使用锁定的正式包且发布资源完整', async () => {
    const packageJson = await readJson<{
      dependencies: Record<string, string>
    }>('../package.json')
    const installedPackage = await readJson<{ version: string }>(
      '../node_modules/@robot-admin/naive-ui-components/package.json'
    )
    expect(packageJson.dependencies['@robot-admin/naive-ui-components']).toBe(
      installedPackage.version
    )

    const mapDeclaration = await Bun.file(
      new URL(
        '../node_modules/@robot-admin/naive-ui-components/dist/C_Map.d.ts',
        import.meta.url
      )
    ).text()
    expect(mapDeclaration).toContain('AMapSecurityConfig')
    const assetFiles = [
      'layers-2x.png',
      'layers.png',
      'marker-icon-2x.png',
      'marker-icon.png',
      'marker-shadow.png',
    ]
    expect(
      await Promise.all(
        assetFiles.map(filename =>
          Bun.file(
            new URL(
              `../node_modules/@robot-admin/naive-ui-components/dist/images/${filename}`,
              import.meta.url
            )
          ).exists()
        )
      )
    ).toEqual(assetFiles.map(() => true))
  })
})
