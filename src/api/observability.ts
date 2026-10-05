/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\api\observability.ts
 * @Description: 显式接入真实全站汇总，复用请求核心与认证，不提供 Mock 数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { getData } from '@robot-admin/request-core/axios'
import { observabilityConfig } from '@/config/observability'
import { validateUsageSummary } from './observability.contract'
import type { UsageSummary } from '@/types/observability'

/** 后端必须负责统计读取权限与站点范围；配置留空时不发送请求。 */
export const getObservabilitySummaryApi = async (
  from: number,
  to: number,
  signal: AbortSignal
): Promise<UsageSummary> => {
  const endpoint = observabilityConfig.summaryEndpoint
  if (!/^\/(?!\/)[\w/-]+$/.test(endpoint))
    throw new Error('全站统计接口尚未配置')
  const response = await getData<{ code: string | number; data: unknown }>(
    new URL(endpoint, window.location.origin).href,
    { params: { from, to }, signal, timeout: 8000 }
  )
  if (String(response.code) !== '0') throw new Error('全站统计查询失败')
  return validateUsageSummary(response.data)
}
