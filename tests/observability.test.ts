/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\tests\observability.test.ts
 * @Description: 匿名采集的边界、离线存储、跨标签去重与真实聚合回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import {
  createTelemetryStore,
  sanitizeTelemetryEvent,
  summarizeTelemetry,
  percentile,
} from '../src/utils/d_telemetryStore'
import { validateUsageSummary } from '../src/api/observability.contract'
import { validateViteEnv } from '../src/config/vite/viteEnvConfig'
import type { TelemetryEvent } from '../src/types/observability'

const now = new Date('2026-10-06T12:00:00+08:00').getTime()
/** 创建明确的测试事件，不在生产代码里提供演示计数。 */
const event = (
  id: string,
  overrides: Partial<TelemetryEvent> = {}
): TelemetryEvent => ({
  id,
  type: 'page_view',
  timestamp: now,
  session: 'anonymous-session',
  route: 'home',
  mode: 'mock',
  device: 'desktop',
  ...overrides,
})
/** 创建共享内存存储以复现多个标签页读写同一缓存。 */
const memoryStorage = () => {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
  }
}
const options = {
  storageKey: 'qa-only',
  maxEvents: 3,
  retentionDays: 7,
  now: () => now,
}

describe('真实匿名观测', () => {
  test('清洗附加身份字段，拒绝 URL 与无效事件，不扩散任意点击载荷', () => {
    const cleaned = sanitizeTelemetryEvent({
      ...event('1'),
      username: 'private',
      password: 'private',
      token: 'private',
      query: '?account=private',
      durationMs: Infinity,
      action: 'private',
    })
    expect(cleaned).toEqual(event('1'))
    expect(
      sanitizeTelemetryEvent(event('2', { route: 'home?token=private' }))
    ).toBeNull()
    expect(
      sanitizeTelemetryEvent(event('3', { session: 'someone@example.com' }))
    ).toBeNull()
    expect(
      sanitizeTelemetryEvent({ ...event('4'), type: 'purchase' })
    ).toBeNull()
  })
  test('保留七天和固定容量，过期与未来记录不能改变统计', () => {
    const store = createTelemetryStore(options)
    store.record(event('old', { timestamp: now - 8 * 86_400_000 }))
    store.record(event('future', { timestamp: now + 1 }))
    for (let i = 0; i < 5; i++)
      store.record(event(String(i), { timestamp: now - 5 + i }))
    expect(store.snapshot().map(item => item.id)).toEqual(['2', '3', '4'])
  })
  test('损坏缓存、超大缓存和禁用存储仍能在内存采集', () => {
    for (const storage of [
      {
        getItem: () => '{broken',
        setItem: () => {
          throw new Error('quota')
        },
      },
      {
        getItem: () => 'x'.repeat(1_000_001),
        setItem: () => {
          throw new Error('quota')
        },
      },
      {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
      },
    ]) {
      const store = createTelemetryStore({ ...options, storage })
      store.record(event('1'))
      expect(store.snapshot()).toEqual([event('1')])
    }
  })
  test('多标签页合并缓存并按 ID 去重，刷新历史不重复发布事件', () => {
    const storage = memoryStorage()
    const first = createTelemetryStore({ ...options, storage })
    const second = createTelemetryStore({ ...options, storage })
    const published: string[] = []
    first.subscribe(item => {
      if (item) published.push(item.id)
    })
    first.record(event('a'))
    second.record(event('b'))
    first.refresh()
    expect(first.snapshot().map(item => item.id)).toEqual(['a', 'b'])
    first.record(event('b'))
    expect(first.snapshot()).toHaveLength(2)
    expect(published).toEqual(['a'])
  })
  test('订阅异常与外部修改不改变缓存，取消订阅后不再通知', () => {
    const store = createTelemetryStore(options)
    store.subscribe(() => {
      throw new Error('consumer')
    })
    const stop = store.subscribe(item => {
      if (item) item.route = 'changed'
    })
    store.record(event('1'))
    stop()
    const snapshot = store.snapshot()
    snapshot[0].route = 'changed'
    expect(store.snapshot()[0].route).toBe('home')
  })
  test('真实访问、失败登录和成功登录分别聚合，会话不等同于用户', () => {
    const summary = summarizeTelemetry(
      [
        event('a', { durationMs: 30 }),
        event('b', { durationMs: 200 }),
        event('c', { durationMs: 80, session: 'second-session' }),
        event('d', { type: 'login_failure' }),
        event('e', { type: 'login_success' }),
        event('f', { type: 'company_switch' }),
        event('g', { type: 'feature_action', action: 'repository_star' }),
      ],
      now - 2 * 86_400_000,
      now
    )
    expect(summary.scope).toBe('browser')
    expect(summary.totals).toEqual({
      views: 3,
      sessions: 2,
      loginSuccess: 1,
      loginFailure: 1,
      companySwitches: 1,
      actions: 1,
    })
    expect(summary.pages).toEqual([
      { route: 'home', views: 3, p50Ms: 80, p95Ms: 200 },
    ])
    expect(summary.daily.slice(0, -1).every(item => item.views === 0)).toBe(
      true
    )
    expect(summary.daily.at(-1)?.views).toBe(3)
  })
  test('没有耗时样本保持未知，查询范围外的访问不混入图表', () => {
    const summary = summarizeTelemetry(
      [event('old', { timestamp: now - 86_400_000 }), event('new')],
      now - 1,
      now
    )
    expect(summary.totals.views).toBe(1)
    expect(summary.pages[0].p50Ms).toBeNull()
    expect(percentile([], 0.95)).toBeNull()
    expect(() => summarizeTelemetry([], now, Infinity)).toThrow('时间范围')
  })
  test('全站响应拒绝本机范围、负数、异常耗时、重复维度与缺失字段', () => {
    const source = {
      ...summarizeTelemetry([event('a')], now - 1, now),
      scope: 'site' as const,
    }
    expect(validateUsageSummary(source).scope).toBe('site')
    expect(() => validateUsageSummary({ ...source, scope: 'browser' })).toThrow(
      '数据范围'
    )
    expect(() =>
      validateUsageSummary({
        ...source,
        totals: { ...source.totals, views: -1 },
      })
    ).toThrow('数值')
    expect(() =>
      validateUsageSummary({
        ...source,
        pages: [{ ...source.pages[0], p50Ms: Infinity }],
      })
    ).toThrow('数值')
    expect(() =>
      validateUsageSummary({
        ...source,
        events: [source.events[0], source.events[0]],
      })
    ).toThrow('维度重复')
    expect(() => validateUsageSummary({ ...source, totals: {} })).toThrow(
      '数值'
    )
  })
  test('全站响应附加身份字段会被剔除，不能进入导出文件', () => {
    const source = summarizeTelemetry([event('a')], now - 1, now)
    const clean = validateUsageSummary({
      ...source,
      scope: 'site',
      token: 'private',
      totals: { ...source.totals, account: 'private' },
      pages: source.pages.map(page => ({ ...page, username: 'private' })),
    })
    expect(JSON.stringify(clean)).not.toContain('private')
  })
  test('观测配置可停用，采集与查询只允许不含敏感参数的同源路径', () => {
    const base = {
      VITE_APP_ENV: 'development',
      VITE_API_BASE: '/api',
      VITE_OBSERVABILITY_ENABLED: 'false',
    }
    expect(
      validateViteEnv(
        {
          ...base,
          VITE_TELEMETRY_COLLECT_ENDPOINT: '/api/observability/events',
        },
        'development'
      ).appEnv
    ).toBe('development')
    for (const endpoint of [
      'https://example.com/events',
      '//example.com/events',
      '/events?token=private',
      '/\\example.com',
    ]) {
      expect(() =>
        validateViteEnv(
          { ...base, VITE_TELEMETRY_SUMMARY_ENDPOINT: endpoint },
          'development'
        )
      ).toThrow('同源绝对路径')
    }
  })
})
