/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 门户接收子应用事件并管理当前会话缓存
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { onMounted, onUnmounted, ref } from 'vue'

interface MicroAppDataItem {
  module: string
  timestamp: number
  data: unknown
}

const DATA_UPDATED_EVENT = 'micro-app-data-update'
const STORAGE_KEY = 'micro-app-data'

const parseItems = (value: unknown): MicroAppDataItem[] => {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is MicroAppDataItem =>
      item &&
      typeof item === 'object' &&
      typeof item.module === 'string' &&
      typeof item.timestamp === 'number' &&
      'data' in item
  )
}

/** 缓存和更新事件共用同一数据入口，并随门户组件清理监听。 */
export function usePortalMicroApps() {
  const microAppData = ref<MicroAppDataItem[]>([])
  const handleDataUpdate = (event: Event) => {
    if (event instanceof CustomEvent)
      microAppData.value = parseItems(event.detail)
  }
  const clearMicroAppData = () => {
    microAppData.value = []
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // 浏览器可能禁止使用会话存储。
    }
  }
  const loadMicroAppData = () => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY)
      if (cached) microAppData.value = parseItems(JSON.parse(cached))
    } catch {
      microAppData.value = []
    }
  }
  onMounted(() => {
    loadMicroAppData()
    window.addEventListener(DATA_UPDATED_EVENT, handleDataUpdate)
  })
  onUnmounted(() =>
    window.removeEventListener(DATA_UPDATED_EVENT, handleDataUpdate)
  )
  return { microAppData, loadMicroAppData, clearMicroAppData }
}
