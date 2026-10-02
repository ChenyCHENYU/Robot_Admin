/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\chunk-recovery.test.ts
 * @Description: 失效模块的一次性刷新保护测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  claimChunkRecovery,
  clearChunkRecovery,
} from '../src/router/chunkRecovery'

const createStorage = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  }
}

describe('动态模块失效恢复', () => {
  test('同一路由只自动刷新一次，成功导航后可再次恢复', () => {
    const storage = createStorage()
    const url = 'https://admin.example.com/#/home'

    expect(claimChunkRecovery(storage, url, 1000)).toBe(true)
    expect(claimChunkRecovery(storage, url, 1100)).toBe(false)
    expect(claimChunkRecovery(storage, url, 61_000)).toBe(true)
    clearChunkRecovery(storage)
    expect(claimChunkRecovery(storage, url, 61_100)).toBe(true)
  })

  test('存储不可用时不进入自动刷新循环', () => {
    expect(claimChunkRecovery(undefined, '/home')).toBe(false)
    expect(
      claimChunkRecovery(
        {
          getItem: () => {
            throw new Error('denied')
          },
          setItem: () => {},
          removeItem: () => {},
        },
        '/home'
      )
    ).toBe(false)
  })
})
