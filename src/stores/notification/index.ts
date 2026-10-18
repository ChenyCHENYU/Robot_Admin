/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\stores\notification\index.ts
 * @Description: 用户与公司隔离的共享消息状态，统一铃铛、收件箱和发送治理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { s_userStore } from '@/stores/user'
import { createNotificationService } from '@/api/notifications'
import { defaultNotificationPreferences } from '@/api/notifications.demo.seed'
import {
  defaultNotificationQuery,
  emptyNotificationStats,
  notificationScopeKey,
  type NotificationAudit,
  type NotificationCapabilities,
  type NotificationCategory,
  type NotificationDelivery,
  type NotificationDispatch,
  type NotificationDispatchDraft,
  type NotificationMutation,
  type NotificationPreferences,
  type NotificationQuery,
  type NotificationRecord,
  type NotificationScope,
  type NotificationService,
  type NotificationTemplate,
  type NotificationTemplateDraft,
} from '@/api/notifications.contract'
import { createAbortError, isAbortError } from '@/utils/abort'
import { isMockDataMode } from '@/config/dataMode'
import {
  createNotificationId,
  notificationOperationSignature,
} from '@/api/notifications.id'
import { requireNotificationPreferences } from '@/api/notifications.governance-validation'

/** 共享消息领域 Store；请求绑定身份代次，任何旧作用域响应均不可写回。 */
export const s_notificationStore = defineStore('notification', () => {
  const user = s_userStore()
  const items = ref<NotificationRecord[]>([])
  const previewItems = ref<NotificationRecord[]>([])
  const stats = ref(emptyNotificationStats())
  const total = ref(0)
  const revision = ref(0)
  const query = ref(defaultNotificationQuery())
  const loading = ref(false)
  const detailLoading = ref(false)
  const governanceLoading = ref(false)
  const error = ref('')
  const mode = ref<'demo' | 'remote'>(isMockDataMode() ? 'demo' : 'remote')
  const scopeKey = ref('')
  const connected = ref(false)
  const capabilities = ref<NotificationCapabilities>({
    manage: false,
    realtime: false,
    preferences: false,
  })
  const templates = ref<NotificationTemplate[]>([])
  const dispatches = ref<NotificationDispatch[]>([])
  const deliveries = ref<NotificationDelivery[]>([])
  const audit = ref<NotificationAudit[]>([])
  const preferences = ref<NotificationPreferences>(
    defaultNotificationPreferences()
  )
  let service: NotificationService | undefined
  let controller = new AbortController()
  let generation = 0
  let queryGeneration = 0
  let detailGeneration = 0
  let governanceGeneration = 0
  let preferencesGeneration = 0
  let initialization: Promise<void> | undefined
  let initialized = false
  let pendingQuery: NotificationQuery | undefined
  let stopSubscription: (() => void) | undefined
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  let pollTimer: ReturnType<typeof setInterval> | undefined
  let owners = 0
  let online = typeof navigator === 'undefined' || navigator.onLine
  let explicitScope: NotificationScope | undefined
  const pendingOperations = new Map<string, string>()
  const operationFlights = new Map<string, Promise<unknown>>()

  const resolveScope = (): NotificationScope | undefined => {
    const context = user.activeContext
    const userId = user.userInfo.id
    if (
      !user.token ||
      typeof userId !== 'string' ||
      !userId ||
      !context?.tenantId ||
      !context.companyId
    )
      return
    return { userId, tenantId: context.tenantId, companyId: context.companyId }
  }
  const requireService = (): NotificationService => {
    if (!service) throw new Error('当前没有有效消息会话，请重新登录或选择公司')
    return service
  }
  const assertCurrent = (version: number) => {
    if (version !== generation || controller.signal.aborted)
      throw createAbortError()
  }
  const recordError = (failure: unknown) => {
    if (!isAbortError(failure))
      error.value =
        failure instanceof Error ? failure.message : '消息操作失败，请重试'
  }
  const clearData = () => {
    items.value = []
    previewItems.value = []
    stats.value = emptyNotificationStats()
    total.value = 0
    revision.value = 0
    query.value = defaultNotificationQuery()
    templates.value = []
    dispatches.value = []
    deliveries.value = []
    audit.value = []
    preferences.value = defaultNotificationPreferences()
    capabilities.value = { manage: false, realtime: false, preferences: false }
    loading.value = false
    detailLoading.value = false
    governanceLoading.value = false
    error.value = ''
    connected.value = false
  }
  const teardown = () => {
    generation++
    queryGeneration++
    detailGeneration++
    governanceGeneration++
    preferencesGeneration++
    controller.abort()
    controller = new AbortController()
    stopSubscription?.()
    stopSubscription = undefined
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = undefined
    service?.dispose()
    service = undefined
    initialized = false
    initialization = undefined
    pendingQuery = undefined
    pendingOperations.clear()
    operationFlights.clear()
    scopeKey.value = ''
    clearData()
  }

  const resolveRequestedQuery = (nextQuery?: NotificationQuery) =>
    structuredClone(toRaw(nextQuery ?? pendingQuery ?? query.value))
  const applyCapabilities = (next: NotificationCapabilities) => {
    if (!next.manage) {
      governanceGeneration++
      governanceLoading.value = false
      templates.value = []
      dispatches.value = []
      deliveries.value = []
      audit.value = []
    }
    if (!next.preferences) {
      preferencesGeneration++
      preferences.value = defaultNotificationPreferences()
    }
    capabilities.value = { ...next }
  }
  const refresh = async (nextQuery?: NotificationQuery): Promise<void> => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = undefined
    }
    const current = requireService()
    const version = generation
    const requestId = ++queryGeneration
    const requested = resolveRequestedQuery(nextQuery)
    pendingQuery = requested
    loading.value = true
    try {
      const snapshot = await current.query(requested, controller.signal)
      assertCurrent(version)
      if (requestId !== queryGeneration) return
      // 归档/删除使末页变空时回到仍然有效的页码，再获取权威分页。
      const maxPage = Math.max(
        1,
        Math.ceil(snapshot.total / requested.pageSize)
      )
      if (requested.page > maxPage) {
        await refresh({ ...requested, page: maxPage })
        return
      }
      query.value = requested
      items.value = snapshot.items
      previewItems.value = snapshot.previewItems
      stats.value = snapshot.stats
      total.value = snapshot.total
      revision.value = snapshot.revision
      applyCapabilities(current.capabilities)
      error.value = ''
      connected.value = online
    } catch (failure) {
      if (version === generation && requestId === queryGeneration) {
        recordError(failure)
        connected.value = false
      }
      throw failure
    } finally {
      if (version === generation && requestId === queryGeneration) {
        loading.value = false
        pendingQuery = undefined
      }
    }
  }
  const backgroundRefresh = () => {
    if (service && online) void refresh().catch(() => undefined)
  }
  const scheduleRefresh = () => {
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      refreshTimer = undefined
      backgroundRefresh()
    }, 20)
  }
  const reuseInitialization = (): Promise<void> => {
    if (initialization) return initialization
    return initialized && !error.value ? Promise.resolve() : refresh()
  }
  const initialize = async (
    scope?: NotificationScope,
    force = false
  ): Promise<void> => {
    const nextScope = scope ?? resolveScope()
    if (scope) explicitScope = { ...scope }
    if (!nextScope) {
      explicitScope = undefined
      teardown()
      return
    }
    const nextKey = notificationScopeKey(nextScope)
    if (!force && scopeKey.value === nextKey) {
      return reuseInitialization()
    }
    teardown()
    service = createNotificationService(nextScope)
    mode.value = service.mode
    service.setOnline?.(online)
    capabilities.value = { ...service.capabilities }
    scopeKey.value = nextKey
    stopSubscription = service.subscribe(scheduleRefresh)
    const version = generation
    const pending = refresh().then(() => {
      assertCurrent(version)
      initialized = true
    })
    initialization = pending
    try {
      await pending
    } finally {
      if (version === generation) initialization = undefined
    }
  }
  const search = async (patch: Partial<NotificationQuery>) => {
    const base = pendingQuery ?? query.value
    const next = {
      ...base,
      ...patch,
      page: patch.page ?? 1,
      pageSize: Math.min(100, Math.max(1, patch.pageSize ?? base.pageSize)),
    }
    await refresh(next)
  }
  const changePage = async (page: number, pageSize = query.value.pageSize) => {
    await search({ page: Math.max(1, page), pageSize })
  }
  const loadDetail = async (id: string): Promise<NotificationRecord> => {
    const current = requireService()
    const version = generation
    const requestId = ++detailGeneration
    detailLoading.value = true
    try {
      const result = await current.detail(id, controller.signal)
      assertCurrent(version)
      if (requestId !== detailGeneration) throw createAbortError()
      return result
    } catch (failure) {
      if (version === generation && requestId === detailGeneration)
        recordError(failure)
      throw failure
    } finally {
      if (version === generation && requestId === detailGeneration)
        detailLoading.value = false
    }
  }
  const synchronizationFailure = (failure: unknown, version: number) => {
    assertCurrent(version)
    if (isAbortError(failure)) throw failure
    const reason = failure instanceof Error ? failure.message : '请稍后重试'
    error.value = `操作已完成，但消息同步失败：${reason}。请刷新查看结果，无需重复提交。`
  }
  const idempotent = async <T>(
    type: string,
    payload: unknown,
    send: (operationId: string) => Promise<T>
  ): Promise<T> => {
    const key = notificationOperationSignature(type, payload)
    const active = operationFlights.get(key)
    if (active) return active as Promise<T>
    const operationId = pendingOperations.get(key) ?? createNotificationId()
    pendingOperations.set(key, operationId)
    const version = generation
    const pending = send(operationId)
    operationFlights.set(key, pending)
    try {
      const result = await pending
      if (version === generation) pendingOperations.delete(key)
      return result
    } finally {
      if (operationFlights.get(key) === pending) operationFlights.delete(key)
    }
  }
  const execute = async <T>(
    operation: (
      current: NotificationService,
      signal: AbortSignal
    ) => Promise<T>,
    governance = false
  ): Promise<T> => {
    const current = requireService()
    const version = generation
    let result: T
    try {
      result = await operation(current, controller.signal)
      assertCurrent(version)
    } catch (failure) {
      if (version === generation) recordError(failure)
      throw failure
    }
    try {
      await refresh()
      if (governance) await refreshGovernance()
      assertCurrent(version)
    } catch (failure) {
      synchronizationFailure(failure, version)
    }
    return result
  }
  const mutate = (type: NotificationMutation, ids: string[]) => {
    const payload = { type, ids: [...new Set(ids)].sort() }
    return execute((current, signal) =>
      idempotent('mutate', payload, operationId =>
        current.mutate({ ...payload, operationId }, signal)
      )
    )
  }
  const markAllRead = (
    category?: NotificationCategory,
    throughRevision = revision.value
  ) => {
    const payload = { category, throughRevision }
    return execute((current, signal) =>
      idempotent('mark-all-read', payload, operationId =>
        current.markAllRead({ ...payload, operationId }, signal)
      )
    )
  }
  const clearMessages = (
    category?: NotificationCategory,
    throughRevision = revision.value
  ) => {
    const payload = { category, throughRevision }
    return execute((current, signal) =>
      idempotent('clear-messages', payload, operationId =>
        current.clearMessages({ ...payload, operationId }, signal)
      )
    )
  }
  const refreshGovernance = async () => {
    const current = requireService()
    const version = generation
    const requestId = ++governanceGeneration
    if (!current.capabilities.manage) return
    governanceLoading.value = true
    try {
      const result = await current.governance(controller.signal)
      assertCurrent(version)
      if (requestId !== governanceGeneration || !current.capabilities.manage)
        return
      templates.value = result.templates
      dispatches.value = result.dispatches
      deliveries.value = result.deliveries
      audit.value = result.audit
    } catch (failure) {
      if (version === generation && requestId === governanceGeneration)
        recordError(failure)
      throw failure
    } finally {
      if (version === generation && requestId === governanceGeneration)
        governanceLoading.value = false
    }
  }
  const requireManagement = (current: NotificationService) => {
    if (!current.capabilities.manage)
      throw new Error('当前消息服务未授权发送治理能力')
  }
  const saveTemplate = (draft: NotificationTemplateDraft) => {
    const snapshot = structuredClone(toRaw(draft))
    return execute((current, signal) => {
      requireManagement(current)
      return idempotent('save-template', snapshot, operationId =>
        current.saveTemplate({ ...snapshot, operationId }, signal)
      )
    }, true)
  }
  const deleteTemplate = (id: string, expectedRevision: number) =>
    execute((current, signal) => {
      requireManagement(current)
      return current.deleteTemplate(id, expectedRevision, signal)
    }, true)
  const saveDispatch = (draft: NotificationDispatchDraft) => {
    const snapshot = structuredClone(toRaw(draft))
    return execute((current, signal) => {
      requireManagement(current)
      return idempotent('save-dispatch', snapshot, operationId =>
        current.saveDispatch({ ...snapshot, operationId }, signal)
      )
    }, true)
  }
  const sendDispatch = (id: string, expectedRevision: number) =>
    execute((current, signal) => {
      requireManagement(current)
      return idempotent(
        'send-dispatch',
        { id, expectedRevision },
        operationId =>
          current.sendDispatch(id, expectedRevision, operationId, signal)
      )
    }, true)
  const withdrawDispatch = (id: string, expectedRevision: number) =>
    execute((current, signal) => {
      requireManagement(current)
      return current.withdrawDispatch(id, expectedRevision, signal)
    }, true)
  const retryDelivery = (id: string) =>
    execute((current, signal) => {
      requireManagement(current)
      return current.retryDelivery(id, signal)
    }, true)
  const listTemplates = async () => {
    await refreshGovernance()
    return templates.value
  }
  const listDispatches = async () => {
    await refreshGovernance()
    return dispatches.value
  }
  const listAudit = async () => {
    await refreshGovernance()
    return audit.value
  }
  const getPreferences = async () => {
    const current = requireService()
    const version = generation
    const requestId = ++preferencesGeneration
    if (!current.capabilities.preferences)
      throw new Error('当前消息服务未开放通知偏好')
    try {
      const result = await current.getPreferences(controller.signal)
      assertCurrent(version)
      if (
        requestId !== preferencesGeneration ||
        !current.capabilities.preferences
      )
        throw createAbortError()
      preferences.value = result
      return result
    } catch (failure) {
      if (version === generation && requestId === preferencesGeneration)
        recordError(failure)
      throw failure
    }
  }
  const savePreferences = async (value: NotificationPreferences) => {
    const snapshot = requireNotificationPreferences(
      structuredClone(toRaw(value))
    )
    const version = generation
    await execute((current, signal) => {
      if (!current.capabilities.preferences)
        throw new Error('当前消息服务未开放通知偏好')
      return current.savePreferences(snapshot, signal)
    }, true)
    assertCurrent(version)
    preferences.value = snapshot
    try {
      await getPreferences()
    } catch (failure) {
      synchronizationFailure(failure, version)
    }
  }
  const simulateIncoming = (kind: 'notification' | 'task' = 'notification') =>
    execute(current => {
      if (!current.simulateIncoming) throw new Error('仅演示模式支持模拟消息')
      return current.simulateIncoming(kind)
    })
  const simulateFailure = (operation = 'mutation') => {
    const current = requireService()
    if (!current.simulateFailure) throw new Error('仅演示模式支持故障注入')
    current.simulateFailure(operation)
  }
  const resetDemo = async () => {
    if (!requireService().resetDemo) throw new Error('仅演示模式支持重置')
    // 显式重置同时取消此前未完成的命令，避免旧详情或单项命令套到新场景。
    generation++
    queryGeneration++
    detailGeneration++
    governanceGeneration++
    preferencesGeneration++
    controller.abort()
    controller = new AbortController()
    initialization = undefined
    pendingOperations.clear()
    operationFlights.clear()
    detailLoading.value = false
    governanceLoading.value = false
    await execute(current => {
      if (!current.resetDemo) throw new Error('仅演示模式支持重置')
      return current.resetDemo()
    }, true)
    const version = generation
    try {
      await getPreferences()
    } catch (failure) {
      synchronizationFailure(failure, version)
    }
  }
  const setOnline = (value: boolean) => {
    online = value
    service?.setOnline?.(value)
    connected.value = value && !error.value
    if (value) backgroundRefresh()
  }
  const onOnline = () => setOnline(true)
  const onOffline = () => setOnline(false)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') backgroundRefresh()
  }
  const release = () => {
    owners = Math.max(0, owners - 1)
    if (owners || typeof window === 'undefined') return
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = undefined
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
    document.removeEventListener('visibilitychange', onVisibility)
  }
  const acquire = () => {
    owners++
    if (owners === 1 && typeof window !== 'undefined') {
      window.addEventListener('online', onOnline)
      window.addEventListener('offline', onOffline)
      document.addEventListener('visibilitychange', onVisibility)
      pollTimer = setInterval(() => {
        if (document.visibilityState === 'visible') backgroundRefresh()
      }, 30_000)
    }
    void initialize(explicitScope).catch(() => undefined)
    let active = true
    return () => {
      if (active) {
        active = false
        release()
      }
    }
  }
  const dispose = () => {
    while (owners) release()
    explicitScope = undefined
    teardown()
  }
  watch(
    () => [
      user.token,
      user.userInfo.id,
      user.activeContext?.tenantId,
      user.activeContext?.companyId,
    ],
    () => {
      explicitScope = undefined
      void initialize(undefined, true).catch(() => undefined)
    }
  )
  onScopeDispose(dispose)
  return {
    items,
    previewItems,
    stats,
    total,
    revision,
    query,
    loading,
    detailLoading,
    governanceLoading,
    error,
    mode,
    scopeKey,
    connected,
    capabilities,
    templates,
    dispatches,
    deliveries,
    audit,
    preferences,
    initialize,
    refresh,
    search,
    changePage,
    loadDetail,
    mutate,
    markAllRead,
    clearMessages,
    refreshGovernance,
    listTemplates,
    listDispatches,
    listAudit,
    saveTemplate,
    deleteTemplate,
    saveDispatch,
    sendDispatch,
    withdrawDispatch,
    retryDelivery,
    getPreferences,
    savePreferences,
    simulateIncoming,
    simulateFailure,
    resetDemo,
    setOnline,
    acquire,
    release,
    dispose,
  }
})
