/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\utils\d_telemetryStore.ts
 * @Description: 有界匿名事件缓存与聚合，不依赖框架、DOM 或身份信息
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  TelemetryEvent,
  TelemetryEventType,
  UsageSummary,
} from '@/types/observability'

export const TELEMETRY_TYPES: TelemetryEventType[] = [
  'page_view',
  'login_success',
  'login_failure',
  'company_switch',
  'feature_action',
]
const ACTIONS = new Set([
  'repository_star',
  'repository_open',
  'theme_change',
  'language_change',
  'report_export',
])
interface StoreOptions {
  storage?: Pick<Storage, 'getItem' | 'setItem'>
  storageKey: string
  retentionDays: number
  maxEvents: number
  now?: () => number
}
/** 仅保留稳定的技术标识，不能传入 URL 或任意文本。 */
const identifier = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max && /^[\w-]+$/.test(value)
/** 耗时不允许异常、负数或超过十分钟的不可比较样本。 */
const validDuration = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 600_000

/** 只接收契约字段，丢弃用户名、口令、URL 查询参数和任意业务载荷。 */
export const sanitizeTelemetryEvent = (
  value: unknown
): TelemetryEvent | null => {
  if (!value || typeof value !== 'object') return null
  const event = value as Partial<TelemetryEvent>
  const required = [
    TELEMETRY_TYPES.includes(event.type as TelemetryEventType),
    typeof event.timestamp === 'number' && Number.isFinite(event.timestamp),
    identifier(event.id, 80),
    identifier(event.session, 80),
    identifier(event.route, 100),
    ['mock', 'remote'].includes(String(event.mode)),
    ['desktop', 'tablet', 'mobile'].includes(String(event.device)),
  ]
  if (!required.every(Boolean)) return null
  const cleaned: TelemetryEvent = {
    id: event.id!,
    type: event.type!,
    timestamp: event.timestamp!,
    session: event.session!,
    route: event.route!,
    mode: event.mode!,
    device: event.device!,
  }
  if (validDuration(event.durationMs))
    cleaned.durationMs = Math.round(event.durationMs)
  if (typeof event.action === 'string' && ACTIONS.has(event.action))
    cleaned.action = event.action
  return cleaned
}

/** 存储不可用时仍能采集；每次只保留最近七天与固定数量的真实事件。 */
export const createTelemetryStore = (options: StoreOptions) => {
  const now = options.now ?? Date.now
  let events: TelemetryEvent[] = []
  const listeners = new Set<(event?: TelemetryEvent) => void>()
  /** 过滤异常时间、合并标签页事件并按 ID 去重。 */
  const prune = (list: TelemetryEvent[]) =>
    [...new Map(list.map(event => [event.id, event])).values()]
      .filter(
        event =>
          event.timestamp >= now() - options.retentionDays * 86_400_000 &&
          event.timestamp <= now()
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-options.maxEvents)
  /** 只读取指定缓存，损坏、超大或无法读取的内容均不进入内存。 */
  const readSaved = (): TelemetryEvent[] => {
    try {
      const raw = options.storage?.getItem(options.storageKey) ?? '[]'
      if (raw.length > 1_000_000) return []
      const cached: unknown = JSON.parse(raw)
      if (!Array.isArray(cached)) return []
      return cached.slice(-options.maxEvents).flatMap(value => {
        const event = sanitizeTelemetryEvent(value)
        return event ? [event] : []
      })
    } catch {
      return []
    }
  }
  events = prune(readSaved())
  /** 持久化失败不影响登录或导航。 */
  const persist = () => {
    try {
      options.storage?.setItem(options.storageKey, JSON.stringify(events))
    } catch {
      /* 保留内存记录。 */
    }
  }
  /** 一个订阅者失败不能妨碍其他订阅者与应用流程。 */
  const emit = (event?: TelemetryEvent) => {
    for (const listener of listeners) {
      try {
        listener(event ? { ...event } : undefined)
      } catch {
        /* 单独隔离观测消费者。 */
      }
    }
  }
  return {
    /** 添加经过白名单清洗的事件。 */
    record(value: unknown) {
      const event = sanitizeTelemetryEvent(value)
      if (!event) return
      const merged = prune([...readSaved(), ...events])
      const exists = merged.some(item => item.id === event.id)
      events = prune([...merged, event])
      persist()
      if (!exists && events.some(item => item.id === event.id)) emit(event)
    },
    /** 返回副本，调用者不能改写采集记录。 */
    snapshot: () => prune(events).map(event => ({ ...event })),
    /** 订阅变化并返回解绑方法。 */
    subscribe(listener: (event?: TelemetryEvent) => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    /** 响应其他标签页的缓存变化，不重复发布历史事件到外部。 */
    refresh() {
      events = prune(readSaved())
      emit()
    },
    /** 仅清理统计缓存，保留认证和主题配置。 */
    clear() {
      events = []
      persist()
      emit()
    },
  }
}

/** 用最近秩法计算样本分位数，空样本不伪装为零毫秒。 */
export const percentile = (values: number[], rank: number): number | null => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil(sorted.length * rank) - 1)]
}

/** 聚合本机匿名记录，按日期、页面、事件与窗口尺寸展示真实样本。 */
export const summarizeTelemetry = (
  events: TelemetryEvent[],
  from: number,
  to: number
): UsageSummary => {
  if (
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from > to ||
    to - from > 31 * 86_400_000
  )
    throw new Error('统计时间范围异常')
  const samples = events.filter(
    event => event.timestamp >= from && event.timestamp <= to
  )
  const views = samples.filter(event => event.type === 'page_view')
  const daily: UsageSummary['daily'] = []
  const start = new Date(from)
  start.setHours(0, 0, 0, 0)
  for (
    let date = start;
    date.getTime() <= to;
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  ) {
    const end = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    ).getTime()
    const group = samples.filter(
      event => event.timestamp >= date.getTime() && event.timestamp < end
    )
    daily.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      views: group.filter(event => event.type === 'page_view').length,
      logins: group.filter(event => event.type === 'login_success').length,
    })
  }
  const count = (type: TelemetryEventType) =>
    samples.filter(event => event.type === type).length
  const pages = [...new Set(views.map(event => event.route))]
    .map(route => {
      const group = views.filter(event => event.route === route)
      const durations = group.flatMap(event =>
        event.durationMs === undefined ? [] : [event.durationMs]
      )
      return {
        route,
        views: group.length,
        p50Ms: percentile(durations, 0.5),
        p95Ms: percentile(durations, 0.95),
      }
    })
    .sort((a, b) => b.views - a.views)
  return {
    schemaVersion: 1,
    scope: 'browser',
    from,
    to,
    updatedAt: to,
    totals: {
      views: views.length,
      sessions: new Set(samples.map(event => event.session)).size,
      loginSuccess: count('login_success'),
      loginFailure: count('login_failure'),
      companySwitches: count('company_switch'),
      actions: count('feature_action'),
    },
    daily,
    pages,
    events: TELEMETRY_TYPES.map(type => ({ type, count: count(type) })),
    devices: (['desktop', 'tablet', 'mobile'] as const).map(device => ({
      device,
      count: views.filter(event => event.device === device).length,
    })),
  }
}
