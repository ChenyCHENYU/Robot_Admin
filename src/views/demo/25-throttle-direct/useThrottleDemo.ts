/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\25-throttle-direct\\useThrottleDemo.ts
 * @Description: 节流案例的交互状态、搜索和列表加载生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { DEMO_CONFIG, SEARCH_EXAMPLES } from './data'

/** 生成具有连续键的本地演示记录。 */
function makeScrollItems(start: number, count: number) {
  const timestamp = new Date().toLocaleTimeString()
  return Array.from({ length: count }, (_, offset) => ({
    id: start + offset,
    timestamp,
  }))
}

/** 各演示独立持有状态。搜索和加载只模拟本地响应。 */
export function useThrottleDemo() {
  const tabs = reactive({ code: 'basic', scenario: 'search', buttonKey: 0 })
  const basic = reactive({ custom: 0, default: 0, normal: 0 })
  const config = reactive({
    executed: 0,
    throttled: 0,
    leading: 0,
    trailing: 0,
  })
  const dynamic = reactive({
    enabled: true,
    delay: 500,
    leading: true,
    trailing: true,
    executed: 0,
    throttled: 0,
  })
  const actions = reactive({ liked: 0, shared: 0, downloaded: 0 })
  const search = reactive({
    keyword: '',
    appliedKeyword: '',
    results: SEARCH_EXAMPLES.slice(0, 3),
    count: 0,
    loading: false,
    execute: searchExamples,
  })
  const list = reactive({
    items: makeScrollItems(1, 6),
    count: 0,
    loading: false,
    loadMore,
  })
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  let loadTimer: ReturnType<typeof setTimeout> | undefined

  /** 固定本次关键词并只接受最后一次搜索的结果。 */
  function searchExamples() {
    const keyword = search.keyword.trim()
    if (!keyword) return
    clearTimeout(searchTimer)
    search.count++
    search.appliedKeyword = keyword
    search.loading = true
    searchTimer = setTimeout(() => {
      const query = keyword.toLowerCase()
      search.results = SEARCH_EXAMPLES.filter(item =>
        (item.title + item.description).toLowerCase().includes(query)
      )
      search.loading = false
    }, DEMO_CONFIG.SEARCH_RESPONSE_DELAY)
  }

  /** 合并进行中的加载操作，保持列表序号连续。 */
  function loadMore() {
    if (list.loading) return
    list.count++
    list.loading = true
    loadTimer = setTimeout(() => {
      list.items.push(...makeScrollItems(list.items.length + 1, 3))
      list.loading = false
    }, DEMO_CONFIG.LOAD_RESPONSE_DELAY)
  }

  /** 取消排队中的按钮操作和已经开始的演示响应。 */
  function cancelPending() {
    clearTimeout(searchTimer)
    clearTimeout(loadTimer)
    search.loading = false
    list.loading = false
    tabs.buttonKey++
  }

  watch(() => tabs.scenario, cancelPending)
  onDeactivated(cancelPending)
  onScopeDispose(cancelPending)
  return { tabs, basic, config, dynamic, search, list, actions }
}
