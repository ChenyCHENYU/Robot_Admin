/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\statistics\useUsageStats.ts
 * @Description: 本机实时统计与可选全站查询分开显示，失败不替换数据范围
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { observabilityConfig } from '@/config/observability'
import { telemetry, recordTelemetry } from '@/utils/d_telemetry'
import { summarizeTelemetry } from '@/utils/d_telemetryStore'
import { getObservabilitySummaryApi } from '@/api/observability'
import type { UsageSummary } from '@/types/observability'
import { useLatestRequest } from '@/composables/useLatestRequest'

/** 默认本机范围明确可见，全站接口必须配置后主动选择。 */
export const useUsageStats = () => {
  const source = ref<'browser' | 'site'>('browser')
  const days = ref(7)
  const mode = ref<'all' | 'mock' | 'remote'>('all')
  const now = ref(Date.now())
  const records = ref(telemetry.snapshot())
  const remote = ref<UsageSummary | null>(null)
  const failed = ref(false)
  const { run, loading, cancel } = useLatestRequest()
  const from = computed(() => {
    const date = new Date(now.value)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - days.value + 1)
    return date.getTime()
  })
  const samples = computed(() =>
    records.value.filter(
      event =>
        event.timestamp >= from.value &&
        (mode.value === 'all' || event.mode === mode.value)
    )
  )
  const summary = computed(() =>
    source.value === 'browser'
      ? summarizeTelemetry(samples.value, from.value, now.value)
      : remote.value
  )
  const endpointConfigured = Boolean(observabilityConfig.summaryEndpoint)

  /** 不把接口异常降级成本机数字，保留全站缺失状态。 */
  const refresh = async () => {
    now.value = Date.now()
    records.value = telemetry.snapshot()
    failed.value = false
    if (source.value === 'browser') {
      cancel()
      return
    }
    remote.value = null
    try {
      const result = await run(signal =>
        getObservabilitySummaryApi(from.value, now.value, signal)
      )
      if (result) remote.value = result
    } catch {
      failed.value = true
    }
  }
  /** 导出的是当前明确的数据范围，不包含用户身份与认证信息。 */
  const exportReport = () => {
    if (!summary.value) return
    const payload = {
      summary: summary.value,
      ...(source.value === 'browser' ? { events: samples.value } : {}),
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `robot-admin-usage-${source.value}-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    recordTelemetry('feature_action', {
      route: 'dashboard-statistics',
      action: 'report_export',
    })
  }
  let stop: (() => void) | undefined
  /** 仅活跃页面订阅事件，KeepAlive 隐藏页面不重算和重画图表。 */
  const activate = () => {
    stop?.()
    records.value = telemetry.snapshot()
    now.value = Date.now()
    stop = telemetry.subscribe(() => {
      now.value = Date.now()
      records.value = telemetry.snapshot()
    })
  }
  const deactivate = () => {
    stop?.()
    stop = undefined
    cancel()
  }
  onMounted(activate)
  onActivated(activate)
  onDeactivated(deactivate)
  onBeforeUnmount(deactivate)
  watch([source, days], () => void refresh())
  return {
    source,
    days,
    mode,
    records,
    samples,
    summary,
    endpointConfigured,
    failed,
    loading,
    refresh,
    exportReport,
  }
}
