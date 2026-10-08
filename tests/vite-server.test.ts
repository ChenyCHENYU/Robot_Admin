/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\vite-server.test.ts
 * @Description: 开发代理必须显式配置，缺省不依赖第三方 Mock 服务
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import createServerConfig from '../src/config/vite/viteServerConfig'

test('默认保留 localhost 与严格端口，无第三方代理；显式地址保留 API 路径重写', () => {
  expect(createServerConfig()).toMatchObject({
    host: 'localhost',
    strictPort: true,
    proxy: undefined,
  })
  const rule = createServerConfig('http://localhost:8080').proxy?.['^/api']
  expect(typeof rule).toBe('object')
  if (!rule || typeof rule === 'string') throw new Error('缺少代理规则')
  expect(rule.target).toBe('http://localhost:8080')
  expect(rule.rewrite?.('/api/sys/users')).toBe('/sys/users')
  for (const value of [
    'file:///tmp/api',
    'https://user:password@example.com',
    'https://example.com/?key=x',
    'https://example.com/#api',
  ]) {
    expect(() => createServerConfig(value)).toThrow()
  }
})
