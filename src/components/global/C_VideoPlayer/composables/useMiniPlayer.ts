/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useMiniPlayer.ts
 * @Description: 小窗播放（滚动时自动浮动）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, onBeforeUnmount, type Ref } from 'vue'

/**
 * 小窗播放 composable
 * - 当播放器滚出可视区域时自动切换为小窗浮动
 * - 小窗可拖动定位
 * - 点击小窗可滚回原位
 */
export function useMiniPlayer(
  containerRef: Ref<HTMLElement | null>,
  enabled: Ref<boolean>
) {
  /** 是否处于小窗模式 */
  const isMiniMode = ref(false)

  /** IntersectionObserver 实例 */
  let observer: IntersectionObserver | null = null

  /** 初始化观察器 */
  function initObserver() {
    if (!containerRef.value || !enabled.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        // 播放器离开视口 → 开启小窗
        isMiniMode.value = !entry.isIntersecting
      },
      {
        threshold: 0.3, // 30% 可见度阈值
      }
    )

    observer.observe(containerRef.value)
  }

  /** 销毁观察器 */
  function destroyObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    isMiniMode.value = false
  }

  /** 滚动回原始位置 */
  function scrollToPlayer() {
    containerRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  /** 关闭小窗 */
  function closeMiniPlayer() {
    isMiniMode.value = false
    destroyObserver()
  }

  onBeforeUnmount(() => {
    destroyObserver()
  })

  return {
    isMiniMode,
    initObserver,
    destroyObserver,
    scrollToPlayer,
    closeMiniPlayer,
  }
}
