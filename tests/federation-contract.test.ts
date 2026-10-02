import { describe, expect, test } from 'bun:test'

const readJson = async <T>(relativePath: string): Promise<T> =>
  Bun.file(new URL(relativePath, import.meta.url)).json()

describe('module federation contracts', () => {
  test('宿主与消费端保持同一应用和组件库版本', async () => {
    const host = await readJson<{
      version: string
      dependencies: Record<string, string>
      scripts: Record<string, string>
    }>('../package.json')
    const logistics = await readJson<{
      version: string
      devDependencies: Record<string, string>
    }>('../sub-apps/logistics/package.json')

    expect(host.version).toBe(logistics.version)
    expect(host.dependencies['@robot-admin/naive-ui-components']).toBe(
      logistics.devDependencies['@robot-admin/naive-ui-components']
    )
    expect(host.scripts['build:remote']).toContain('MF_REMOTE_BUILD=true')
    expect(host.scripts['type-build']).toContain('ensure-generated-types.ts')
    expect(host.scripts['verify:federation']).toContain(
      'verify:federation:integration'
    )
    expect(host.scripts['verify:federation:integration']).toContain(
      'test:e2e:federation'
    )
    expect(host.scripts).not.toHaveProperty('deploy')
  })

  test('独立远程构建在部署时保留入口且所有联邦资源可跨域加载', async () => {
    const config = await readJson<{
      buildCommand: string
      headers: Array<{
        source: string
        headers: Array<{ key: string; value: string }>
      }>
    }>('../vercel.json')
    const headerFor = (source: string, key: string) =>
      config.headers
        .find(item => item.source === source)
        ?.headers.find(header => header.key === key)?.value

    expect(config.buildCommand).toBe('bun run build && bun run build:remote')
    expect(headerFor('/federation/(.*)', 'Access-Control-Allow-Origin')).toBe(
      '*'
    )
    expect(
      headerFor(
        '/federation/(remoteEntry\\.js|mf-manifest\\.json)',
        'Cache-Control'
      )
    ).toContain('no-cache')
  })

  test('依赖审计修复版本受锁文件约束', async () => {
    const host = await readJson<{
      overrides: Record<string, string>
    }>('../package.json')
    expect(host.overrides['adm-zip']).toBe('0.6.1')
    expect(host.overrides.ws).toBe('8.22.0')
  })
})
