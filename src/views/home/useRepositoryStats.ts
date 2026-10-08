/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\home\useRepositoryStats.ts
 * @Description: 首页仓库统计异步加载、缓存与取消，不阻塞登录或页面导航
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { useLatestRequest } from '@/composables/useLatestRequest'
import { withRequestTimeout } from '@/utils/abort'
import {
  getRepositoryStatsApi,
  readRepositoryCache,
  repositoryCacheKey,
  type RepositoryStats,
} from './d_repository'

/** 页面独立加载公开统计，离开时取消；缓存禁用时仍能正常显示。 */
export const useRepositoryStats = () => {
  const { run, loading } = useLatestRequest()
  const stats = ref<RepositoryStats | null>(null)
  const failed = ref(false)
  const cached = ref(false)
  const statusText = computed(() => {
    if (loading.value) return '正在获取 GitHub 数据'
    if (failed.value) return 'GitHub 暂不可用'
    if (stats.value?.commits === null) return '提交统计暂不可用'
    return cached.value ? 'GitHub · 会话缓存' : 'GitHub · 实时获取'
  })

  /** 请求超时和服务限流都仅影响统计区，允许用户主动重试。 */
  const refresh = async () => {
    failed.value = false
    try {
      const result = await run(signal =>
        withRequestTimeout(getRepositoryStatsApi, signal, 6000)
      )
      if (!result) return
      stats.value = result
      cached.value = false
      if (result.commits === null) return
      try {
        sessionStorage.setItem(repositoryCacheKey, JSON.stringify(result))
      } catch {
        /* 缓存不可写时保留已加载结果。 */
      }
    } catch {
      failed.value = true
    }
  }

  onMounted(() => {
    try {
      stats.value = readRepositoryCache(sessionStorage)
    } catch {
      /* 隐私模式下直接请求公开数据。 */
    }
    cached.value = !!stats.value
    if (!cached.value) void refresh()
  })
  return { stats, loading, failed, statusText, refresh }
}
