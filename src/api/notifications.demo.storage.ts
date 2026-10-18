/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.demo.storage.ts
 * @Description: 消息演示存储的作用域隔离、跨实例串行与跨标签页同步
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  createNotificationDemoDocument,
  type NotificationDemoDocument,
} from './notifications.demo.seed'
import { createAbortError } from '@/utils/abort'
import { upgradeNotificationDemoDocument } from './notifications.demo.workflow'
import { isNotificationRecord } from './notifications.validation'
import {
  requireNotificationDispatch,
  requireNotificationGovernance,
  requireNotificationPreferences,
  requireNotificationTemplate,
} from './notifications.governance-validation'

export interface NotificationStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
const memory = new Map<string, string>()
const fallbackStorage: NotificationStorage = {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value)
  },
  removeItem: key => {
    memory.delete(key)
  },
}
const queues = new Map<string, Promise<unknown>>()
const listeners = new Map<string, Set<() => void>>()
export const notificationDemoStorageKey = (scopeKey: string): string =>
  `robot.notifications.v1:${scopeKey}`

const hasDocumentCollections = (data: Partial<NotificationDemoDocument>) =>
  [
    data.items,
    data.templates,
    data.dispatches,
    data.deliveries,
    data.audit,
    data.operations,
  ].every(Array.isArray)
const hasDocumentPreferences = (data: Partial<NotificationDemoDocument>) =>
  !!data.preferences?.categories &&
  !!data.preferences?.channels &&
  !!data.preferences?.quietHours
const hasValidGovernance = (
  data: Partial<NotificationDemoDocument>
): boolean => {
  try {
    requireNotificationGovernance(data)
    requireNotificationPreferences(data.preferences)
    for (const result of Object.values(data.results ?? {})) {
      if (!result || typeof result.signature !== 'string') return false
      if (result.type === 'template') requireNotificationTemplate(result.entity)
      else if (result.type === 'dispatch')
        requireNotificationDispatch(result.entity)
      else if (result.type === 'workflow') {
        if (!isNotificationRecord(result.entity)) return false
      } else return false
    }
    return true
  } catch {
    return false
  }
}
const hasDocumentIdentity = (
  data: Partial<NotificationDemoDocument>,
  scopeKey: string
) =>
  data.schema === 1 &&
  data.scopeKey === scopeKey &&
  Number.isInteger(data.revision) &&
  Number(data.revision) >= 0 &&
  (data.seedRevision === undefined ||
    (Number.isInteger(data.seedRevision) &&
      data.seedRevision >= 0 &&
      data.seedRevision <= 2))
const isDocument = (
  value: unknown,
  scopeKey: string
): value is NotificationDemoDocument => {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<NotificationDemoDocument>
  return (
    hasDocumentIdentity(data, scopeKey) &&
    hasDocumentCollections(data) &&
    hasDocumentPreferences(data) &&
    hasValidGovernance(data) &&
    data.items!.length <= 10000 &&
    data.items!.every(isNotificationRecord)
  )
}

export const createNotificationDemoStorage = (
  scopeKey: string,
  now: () => Date,
  provided?: NotificationStorage
) => {
  const storage =
    provided ??
    (typeof localStorage === 'undefined' ? fallbackStorage : localStorage)
  const key = notificationDemoStorageKey(scopeKey)
  const read = (): NotificationDemoDocument => {
    const raw = storage.getItem(key)
    if (raw === null) return createNotificationDemoDocument(scopeKey, now())
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('消息演示数据损坏，请使用“重置演示”恢复')
    }
    if (!isDocument(parsed, scopeKey))
      throw new Error('消息演示数据版本无效，请使用“重置演示”恢复')
    return parsed
  }
  const emit = () => {
    for (const listener of listeners.get(key) ?? []) {
      try {
        listener()
      } catch {
        /* 已持久化的写入不能被订阅者异常改成失败。 */
      }
    }
  }
  const write = (document: NotificationDemoDocument) => {
    storage.setItem(key, JSON.stringify(document))
    emit()
  }
  const transaction = async <T>(
    update: (document: NotificationDemoDocument) => T,
    signal?: AbortSignal
  ): Promise<T> => {
    const run = async () => {
      if (signal?.aborted) throw createAbortError()
      const current = read()
      const result = update(current)
      if (signal?.aborted) throw createAbortError()
      current.revision += 1
      write(current)
      return structuredClone(result)
    }
    const previous = queues.get(key) ?? Promise.resolve()
    const pending = previous
      .catch(() => undefined)
      .then(() => {
        if (typeof navigator !== 'undefined' && navigator.locks)
          return navigator.locks.request(key, { signal }, run)
        return run()
      })
    queues.set(key, pending)
    try {
      return await pending
    } finally {
      if (queues.get(key) === pending) queues.delete(key)
    }
  }
  /** 迁移与消息写入共用事务队列和跨标签页锁，不能覆盖同时提交的用户操作。 */
  const ensureUpgrade = async (
    assertActive: () => void,
    signal?: AbortSignal
  ) => {
    if ((read().seedRevision ?? 0) >= 2) return
    await transaction(document => {
      assertActive()
      upgradeNotificationDemoDocument(document, now())
    }, signal)
  }
  const subscribe = (listener: () => void) => {
    const bucket = listeners.get(key) ?? new Set<() => void>()
    bucket.add(listener)
    listeners.set(key, bucket)
    const onStorage = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === storage) listener()
    }
    if (typeof window !== 'undefined')
      window.addEventListener('storage', onStorage)
    return () => {
      bucket.delete(listener)
      if (!bucket.size) listeners.delete(key)
      if (typeof window !== 'undefined')
        window.removeEventListener('storage', onStorage)
    }
  }
  const reset = async (assertActive: () => void = () => undefined) => {
    const previous = queues.get(key) ?? Promise.resolve()
    const resetData = previous
      .catch(() => undefined)
      .then(() => {
        const run = () => {
          assertActive()
          let previousRevision = 0
          try {
            previousRevision = read().revision
          } catch {
            /* 损坏快照只能由显式重置恢复。 */
          }
          const document = createNotificationDemoDocument(scopeKey, now())
          document.revision = previousRevision + 1
          for (const item of document.items) {
            item.revision = document.revision
            item.receivedRevision = document.revision
          }
          assertActive()
          write(document)
        }
        if (typeof navigator !== 'undefined' && navigator.locks)
          return navigator.locks.request(key, run)
        return run()
      })
    queues.set(key, resetData)
    try {
      await resetData
    } finally {
      if (queues.get(key) === resetData) queues.delete(key)
    }
  }
  return { read, transaction, subscribe, reset, ensureUpgrade }
}
