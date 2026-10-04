/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\tests\repository-stats.test.ts
 * @Description: 仓库统计默认分支、分页总量、第三方失败和缓存有效性回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  getRepositoryStatsApi,
  parseCommitCount,
  readRepositoryCache,
  repositoryCacheDuration,
} from '../src/views/home/d_repository'

const metadata = {
  stargazers_count: 1020,
  forks_count: 70,
  default_branch: 'release/current',
}
const stats = {
  stars: 1020,
  forks: 70,
  commits: 789,
  defaultBranch: 'main',
  fetchedAt: 1000000,
}
const pagination =
  '<https://api.github.com/repositories/123/commits?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/123/commits?per_page=1&page=789>; rel="last"'

/** 用响应序列验证请求顺序与分支选择，不污染全局 fetch。 */
const createFetcher = (responses: Response[]) => {
  const calls: { url: string; options?: RequestInit }[] = []
  const fetcher = (async (input: RequestInfo | URL, options?: RequestInit) => {
    calls.push({ url: String(input), options })
    const response = responses.shift()
    if (!response) throw new Error('测试响应耗尽')
    return response
  }) as typeof fetch
  return { fetcher, calls }
}

test('提交总数使用末页，空仓库和单提交仓库使用实际响应长度', () => {
  expect(parseCommitCount(pagination, 1)).toBe(789)
  expect(parseCommitCount(null, 1)).toBe(1)
  expect(parseCommitCount(null, 0)).toBe(0)
  expect(
    parseCommitCount('<https://api.github.com/commits?page=2>; rel="next"', 1)
  ).toBeNull()
  expect(parseCommitCount('<invalid>; rel="last"', 1)).toBeNull()
  expect(
    parseCommitCount('<https://example.com/commits?page=99>; rel="last"', 1)
  ).toBeNull()
})

test('提交请求跟随仓库默认分支，外部请求不携带项目认证头', async () => {
  const { fetcher, calls } = createFetcher([
    Response.json(metadata),
    Response.json([{ sha: 'commit' }], { headers: { Link: pagination } }),
  ])
  const result = await getRepositoryStatsApi(
    new AbortController().signal,
    fetcher
  )
  expect(result).toMatchObject({
    stars: 1020,
    forks: 70,
    commits: 789,
    defaultBranch: 'release/current',
  })
  expect(calls[1].url).toEndWith('commits?per_page=1&sha=release%2Fcurrent')
  expect(calls[0].options?.credentials).toBe('omit')
  expect(calls[0].options?.headers).not.toHaveProperty('Authorization')
})

test('提交 API 限流时保留已取得的仓库计数，提交数保持未知', async () => {
  const { fetcher } = createFetcher([
    Response.json(metadata),
    new Response(null, { status: 403 }),
  ])
  const result = await getRepositoryStatsApi(
    new AbortController().signal,
    fetcher
  )
  expect(result).toMatchObject({ stars: 1020, forks: 70, commits: null })
})

test('仓库 API 失败或响应缺少计数时拒绝结果，不用虚假默认数据', async () => {
  await Promise.all(
    [
      new Response(null, { status: 403 }),
      Response.json({ default_branch: 'main' }),
    ].map(async response => {
      const { fetcher } = createFetcher([response])
      await expect(
        getRepositoryStatsApi(new AbortController().signal, fetcher)
      ).rejects.toThrow()
    })
  )
})

test('会话缓存仅接受完整计数和有效数字时间戳，过期或损坏数据会重新请求', () => {
  const storage = (value: unknown) => ({ getItem: () => JSON.stringify(value) })
  expect(readRepositoryCache(storage(stats), stats.fetchedAt + 100)).toEqual(
    stats
  )
  expect(
    readRepositoryCache(
      storage(stats),
      stats.fetchedAt + repositoryCacheDuration
    )
  ).toBeNull()
  expect(readRepositoryCache(storage(stats), stats.fetchedAt - 1)).toBeNull()
  for (const value of [
    { ...stats, commits: null },
    { ...stats, stars: -1 },
    { ...stats, fetchedAt: '1000000' },
    { ...stats, defaultBranch: '' },
  ]) {
    expect(
      readRepositoryCache(storage(value), stats.fetchedAt + 100)
    ).toBeNull()
  }
  expect(readRepositoryCache({ getItem: () => '{broken' })).toBeNull()
  expect(
    readRepositoryCache({
      getItem: () => {
        throw new Error('存储不可读')
      },
    })
  ).toBeNull()
})
