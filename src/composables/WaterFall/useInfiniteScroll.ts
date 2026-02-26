/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\composables\WaterFall\useInfiniteScroll.ts
 * @Description: 无限滚动 composable
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type { InfiniteScrollStatus } from '@/types/modules/waterfall'
import { INFINITE_SCROLL_THRESHOLD } from '@/components/global/C_WaterFall/constants'

/**
 * 无限滚动
 *
 * 基于 IntersectionObserver 监听哨兵元素可见性，
 * 可见时触发 loadMore 回调。
 *
 * @param sentinelRef   哨兵 DOM
 * @param enabled       是否启用
 * @param loading       外部加载状态
 * @param noMore        是否已无更多
 * @param onLoadMore    加载回调
 */
export function useInfiniteScroll(
  sentinelRef: Ref<HTMLElement | undefined>,
  enabled: Ref<boolean>,
  loading: Ref<boolean>,
  noMore: Ref<boolean>,
  onLoadMore: () => void
) {
  const status = ref<InfiniteScrollStatus>('idle')

  let observer: IntersectionObserver | null = null

  /** 当哨兵进入视口 */
  function handleIntersect(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]
    if (!entry?.isIntersecting) return
    if (!enabled.value || loading.value || noMore.value) return

    status.value = 'loading'
    onLoadMore()
  }

  /** 开始监听 */
  function startObserving() {
    const el = sentinelRef.value
    if (!el || !enabled.value) return

    observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `${INFINITE_SCROLL_THRESHOLD}px 0px`,
    })
    observer.observe(el)
  }

  /** 停止监听 */
  function stopObserving() {
    observer?.disconnect()
    observer = null
  }

  // 同步外部状态 → 内部 status
  watch([loading, noMore], () => {
    if (noMore.value) {
      status.value = 'no-more'
    } else if (loading.value) {
      status.value = 'loading'
    } else {
      status.value = 'idle'
    }
  })

  onMounted(startObserving)
  onBeforeUnmount(stopObserving)

  watch([sentinelRef, enabled], () => {
    stopObserving()
    startObserving()
  })

  return { status: readonly(status) }
}
