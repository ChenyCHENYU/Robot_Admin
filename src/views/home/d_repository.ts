/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\home\d_repository.ts
 * @Description: GitHub 公开仓库统计与会话缓存，不以演示数字替代真实数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export const repositoryUrl = 'https://github.com/ChenyCHENYU/Robot_Admin'
const repositoryApi = 'https://api.github.com/repos/ChenyCHENYU/Robot_Admin'
export const repositoryCacheKey = 'robot-admin:repository-stats:v1'
export const repositoryCacheDuration = 15 * 60 * 1000

export interface RepositoryStats {
  stars: number
  forks: number
  commits: number | null
  defaultBranch: string
  fetchedAt: number
}

/** 校验外部响应与缓存计数，未知数据不展示为零。 */
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

/** 单条分页的末页页码就是默认分支的提交总数；缺失末页时保留未知状态。 */
export const parseCommitCount = (
  link: string | null,
  length: number
): number | null => {
  if (!link) return length
  const last = link.split(',').find(part => /rel="last"/.test(part))
  const target = last?.match(/<([^>]+)>/)?.[1]
  if (!target) return null
  try {
    const url = new URL(target)
    const page = Number(url.searchParams.get('page'))
    return url.origin === 'https://api.github.com' && isCount(page) && page > 0
      ? page
      : null
  } catch {
    return null
  }
}

/** 校验缓存结构，避免非数字时间戳被隐式转换后误判为有效结果。 */
const isRepositoryStats = (value: unknown): value is RepositoryStats => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const countsValid = [
    candidate.stars,
    candidate.forks,
    candidate.commits,
    candidate.fetchedAt,
  ].every(isCount)
  return (
    countsValid &&
    typeof candidate.defaultBranch === 'string' &&
    !!candidate.defaultBranch.trim()
  )
}

/** 缓存仅接收真实完整结果，损坏、未来时间或过期结果都重新请求。 */
export const readRepositoryCache = (
  storage: Pick<Storage, 'getItem'>,
  now = Date.now()
): RepositoryStats | null => {
  try {
    const value = JSON.parse(storage.getItem(repositoryCacheKey) ?? 'null')
    if (!isRepositoryStats(value)) return null
    const age = now - value.fetchedAt
    return Number.isFinite(age) && age >= 0 && age < repositoryCacheDuration
      ? value
      : null
  } catch {
    return null
  }
}

/** 公开 API 不携带项目认证头，不让第三方请求进入业务认证恢复流程。 */
const fetchPublic = (url: string, signal: AbortSignal, fetcher: typeof fetch) =>
  fetcher(url, {
    signal,
    credentials: 'omit',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

/** 提交数不可用时仍保留已经取得的 Star、Fork；取消请求继续交给生命周期处理。 */
const fetchCommitCount = async (
  branch: string,
  signal: AbortSignal,
  fetcher: typeof fetch
): Promise<number | null> => {
  try {
    const response = await fetchPublic(
      `${repositoryApi}/commits?per_page=1&sha=${encodeURIComponent(branch)}`,
      signal,
      fetcher
    )
    if (!response.ok) return null
    const commits: unknown = await response.json()
    return Array.isArray(commits)
      ? parseCommitCount(response.headers.get('link'), commits.length)
      : null
  } catch (error) {
    if (signal.aborted) throw error
    return null
  }
}

/** 先读取仓库默认分支，再统计该分支提交，避免混入本地升级分支的数据。 */
export const getRepositoryStatsApi = async (
  signal: AbortSignal,
  fetcher: typeof fetch = fetch
): Promise<RepositoryStats> => {
  const response = await fetchPublic(repositoryApi, signal, fetcher)
  if (!response.ok) throw new Error('仓库信息暂不可用')
  const metadata = await response.json()
  if (
    !isCount(metadata.stargazers_count) ||
    !isCount(metadata.forks_count) ||
    typeof metadata.default_branch !== 'string' ||
    !metadata.default_branch.trim()
  )
    throw new Error('仓库信息不完整')
  const commits = await fetchCommitCount(
    metadata.default_branch,
    signal,
    fetcher
  )
  return {
    stars: metadata.stargazers_count,
    forks: metadata.forks_count,
    commits,
    defaultBranch: metadata.default_branch,
    fetchedAt: Date.now(),
  }
}
