/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-10
 * @Description: 统一的 KeepAlive 缓存管理
 * 解决：6 个布局中重复实现相同逻辑（40 行 × 6 = 240 行）
 */

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MAX_CACHE_COUNT, DEV_CONFIG } from '@/config/keepAliveConfig'

/**
 * 统一的 KeepAlive 缓存管理 composable
 *
 * @returns 缓存视图列表和管理方法
 */
export function useLayoutCache() {
  const route = useRoute()
  const cachedViews = ref<string[]>([])
  const maxCacheCount = ref(MAX_CACHE_COUNT)

  /**
   * 判断页面是否应该被缓存
   * 极简策略：只有明确配置 meta.keepAlive = true 才缓存
   */
  const shouldCache = (routeName: string | symbol | undefined | null) => {
    if (!routeName || typeof routeName !== 'string') return false

    // 只看 meta.keepAlive 的值
    const keepAlive = route.meta?.keepAlive
    return keepAlive === true
  }

  /**
   * 添加缓存
   */
  const addCache = (name: string) => {
    if (!cachedViews.value.includes(name) && shouldCache(name)) {
      cachedViews.value.push(name)

      // 控制缓存数量
      if (cachedViews.value.length > maxCacheCount.value) {
        cachedViews.value.shift() // 移除最早的缓存
      }

      if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
        console.debug(
          `[KeepAlive] ✅ 缓存: ${name} (${cachedViews.value.length}/${maxCacheCount.value})`
        )
      }
    }
  }

  /**
   * 移除缓存
   */
  const removeCache = (name: string) => {
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
      if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
        console.debug(`[KeepAlive] ❌ 移除: ${name}`)
      }
    }
  }

  /**
   * 清空所有缓存
   */
  const clearAllCache = () => {
    cachedViews.value = []
    if (import.meta.env.DEV && DEV_CONFIG.enableLog) {
      console.debug('[KeepAlive] 🗑️ 清空所有缓存')
    }
  }

  // 暴露缓存管理方法到 window（便于调试）
  if (import.meta.env.DEV && DEV_CONFIG.exposeToWindow) {
    ;(window as any).__clearCache__ = clearAllCache
    ;(window as any).__removeCache__ = removeCache
    ;(window as any).__getCachedViews__ = () => cachedViews.value
  }

  // 监听路由变化，动态管理缓存
  watch(
    () => route.name,
    newName => {
      if (newName && typeof newName === 'string') {
        addCache(newName)
      }
    },
    { immediate: true }
  )

  return {
    cachedViews,
    maxCacheCount,
    removeCache,
    clearAllCache,
  }
}
