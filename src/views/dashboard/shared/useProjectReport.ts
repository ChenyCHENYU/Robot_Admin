/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\shared\useProjectReport.ts
 * @Description: 仅进入仪表盘才读取构建报告；卸载或重试取消旧请求
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ProjectMetrics } from '@/types/observability'
import { useLatestRequest } from '@/composables/useLatestRequest'

/** 缺失报告明确降级，不读取旧产物或造示例数字。 */
export const useProjectReport = () => {
  const { run, loading } = useLatestRequest()
  const report = ref<ProjectMetrics | null>(null)
  const failed = ref(false)
  /** 重试只更新工程报告，不触发整页刷新或重置统计。 */
  const refresh = async () => {
    failed.value = false
    try {
      const result = await run(async signal => {
        const response = await fetch(
          `${import.meta.env.BASE_URL}project-metrics.json`,
          { signal, cache: 'no-store' }
        )
        if (!response.ok) throw new Error('工程报告不可用')
        const data = (await response.json()) as ProjectMetrics
        if (data.schemaVersion !== 1 || !Array.isArray(data.inventory?.routes))
          throw new Error('工程报告格式异常')
        return data
      })
      if (result) report.value = result
    } catch {
      failed.value = true
    }
  }
  onMounted(() => void refresh())
  return { report, failed, loading, refresh }
}
