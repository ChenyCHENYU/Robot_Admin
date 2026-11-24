/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 地图服务配置与底图连接生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  MapInstance,
  MapType,
  AMapSecurityConfig,
  MapTileConfig,
} from '@robot-admin/naive-ui-components/C_Map'

/** 按地图实例持有底图观察任务，切换或重建时取消旧任务。 */
export function useMapService(session: {
  ready: (map: MapInstance) => void
  reset: () => void
}) {
  const message = useMessage()
  const mapType = ref<MapType>('osm')
  const showSettings = ref(false)
  const apiKey = ref(import.meta.env.VITE_AMAP_KEY || '')
  const securityCode = ref('')
  const mapReady = ref(false)
  const tilesLoaded = ref(false)
  let tileTimer: ReturnType<typeof setTimeout> | undefined
  const error = ref('')
  const tileWarning = ref('')
  const revision = ref(0)
  const providerDraft = ref<MapType>('osm')
  const keyDraft = ref(apiKey.value)
  const securityDraft = ref('')
  const applySettings = () => {
    if (providerDraft.value === 'amap' && !keyDraft.value.trim()) {
      message.warning('请填写完整的高德 Web 端 API Key')
      return
    }
    mapType.value = providerDraft.value
    apiKey.value = keyDraft.value.trim()
    securityCode.value = securityDraft.value.trim()
    showSettings.value = false
    retry()
  }
  const securityConfig = computed<AMapSecurityConfig | undefined>(() => {
    const serviceHost = import.meta.env.VITE_AMAP_SERVICE_HOST
    if (serviceHost) return { serviceHost }
    return securityCode.value.trim()
      ? { securityJsCode: securityCode.value.trim() }
      : undefined
  })
  const tileConfig: MapTileConfig = {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    detectRetina: false,
    maxZoom: 19,
  }
  let cleanup = () => {}
  /** 连接失败保留标记编辑，明确提示重试或配置其他地图服务。 */
  const recoverTiles = () => {
    clearTimeout(tileTimer)
    tileWarning.value =
      '底图暂时无法连接，请重试或在地图服务设置中切换服务。地标定位与编辑仍然可用。'
  }
  const onReady = (map: MapInstance) => {
    cleanup()
    mapReady.value = true
    tilesLoaded.value = false
    error.value = ''
    session.ready(map)
    if (!('eachLayer' in map)) return
    const off: Array<() => void> = []
    tileTimer = setTimeout(recoverTiles, 8000)
    map.eachLayer(layer => {
      if (!('getTileUrl' in layer)) return
      let failures = 0
      const loaded = () => {
        tilesLoaded.value = true
        tileWarning.value = ''
        clearTimeout(tileTimer)
      }
      const failed = () => {
        failures++
        if (failures >= 3 && !tilesLoaded.value) recoverTiles()
      }
      layer.on('tileload', loaded)
      layer.on('tileerror', failed)
      off.push(() => {
        layer.off('tileload', loaded)
        layer.off('tileerror', failed)
      })
    })
    cleanup = () => {
      clearTimeout(tileTimer)
      off.forEach(stop => stop())
    }
  }
  const onError = (value: Error) => {
    cleanup()
    session.reset()
    mapReady.value = false
    error.value = value.message
  }
  const retry = () => {
    session.reset()
    cleanup()
    mapReady.value = false
    error.value = ''
    tileWarning.value = ''
    tilesLoaded.value = false
    revision.value++
  }
  onBeforeUnmount(() => cleanup())
  return {
    status: proxyRefs({ mapReady, tilesLoaded, error, tileWarning, retry }),
    layers: proxyRefs({
      revision,
      mapType,
      apiKey,
      securityConfig,
      tileConfig,
      onReady,
      onError,
    }),
    settings: proxyRefs({
      showSettings,
      providerDraft,
      keyDraft,
      securityDraft,
      applySettings,
    }),
    showSettings,
  }
}
