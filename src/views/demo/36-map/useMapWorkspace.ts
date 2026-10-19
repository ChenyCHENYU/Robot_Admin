/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 地图场景、标记管理与底图故障恢复
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  MapCoordinate,
  MapExpose,
  MapMarker,
  MapType,
  MapInstance,
  AMapSecurityConfig,
} from '@robot-admin/naive-ui-components/C_Map'
import { MAP_EXAMPLES } from './data'
/** 单一地图主视图，资源失败与标记编辑分别保留明确状态。 */
export function useMapWorkspace() {
  const message = useMessage()
  const mapRef = ref<MapExpose | null>(null)
  const cityIndex = ref(0)
  const mapType = ref<MapType>('osm')
  const center = ref<MapCoordinate>([...MAP_EXAMPLES[0].center])
  const zoom = ref(13)
  const markers = ref<MapMarker[]>(
    MAP_EXAMPLES[0].markers.map(item => ({ ...item }))
  )
  const selectedId = ref<string | number | undefined>(markers.value[0]?.id)
  const search = ref('')
  const showSettings = ref(false)
  const apiKey = ref(import.meta.env.VITE_AMAP_KEY || '')
  const securityCode = ref('')
  const mapReady = ref(false)
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
  const selected = computed(() =>
    markers.value.find(item => item.id === selectedId.value)
  )
  const filteredMarkers = computed(() =>
    markers.value.filter(item =>
      `${item.title ?? ''} ${item.popup ?? ''}`.includes(search.value.trim())
    )
  )
  const securityConfig = computed<AMapSecurityConfig | undefined>(() => {
    const serviceHost = import.meta.env.VITE_AMAP_SERVICE_HOST
    if (serviceHost) return { serviceHost }
    return securityCode.value.trim()
      ? { securityJsCode: securityCode.value.trim() }
      : undefined
  })
  const tileConfig = {
    errorTileUrl: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e9edf2"/><path d="M0 128H256M128 0V256" stroke="#dce2e9"/></svg>')}`,
  }
  let cleanup = () => {}
  const onReady = (map: MapInstance) => {
    cleanup()
    mapReady.value = true
    error.value = ''
    if (!('eachLayer' in map)) return
    const off: Array<() => void> = []
    map.eachLayer(layer => {
      if (!('getTileUrl' in layer)) return
      const failed = () => {
        tileWarning.value =
          '底图部分资源加载失败，标记仍可操作。可重试加载或切换地图服务。'
      }
      layer.on('tileerror', failed)
      off.push(() => layer.off('tileerror', failed))
    })
    cleanup = () => off.forEach(stop => stop())
  }
  const onError = (value: Error) => {
    mapReady.value = false
    error.value = value.message
  }
  const retry = () => {
    cleanup()
    mapReady.value = false
    error.value = ''
    tileWarning.value = ''
    revision.value++
  }
  const selectCity = (index: number) => {
    const city = MAP_EXAMPLES[index]
    cityIndex.value = index
    center.value = [...city.center]
    zoom.value = city.zoom
    markers.value = city.markers.map(item => ({ ...item }))
    selectedId.value = markers.value[0]?.id
    search.value = ''
    void nextTick(() =>
      mapRef.value?.fitToMarkers({ maxZoom: 14, padding: [40, 40] })
    )
  }
  const selectMarker = (marker: MapMarker) => {
    selectedId.value = marker.id
    const map = mapRef.value?.getMap()
    if (!map) return
    if ('flyTo' in map)
      map.flyTo([marker.lat, marker.lng], Math.max(map.getZoom(), 13))
    else map.setCenter([marker.lng, marker.lat])
  }
  const addMarker = () => {
    const offset = (markers.value.length + 1) * 0.004
    const marker = {
      id: crypto.randomUUID(),
      lat: center.value[0] + offset,
      lng: center.value[1] + offset,
      popup: `自定义标记 ${markers.value.length + 1}`,
    }
    markers.value = [...markers.value, marker]
    selectedId.value = marker.id
  }
  const removeSelected = () => {
    markers.value = markers.value.filter(item => item.id !== selectedId.value)
    selectedId.value = markers.value[0]?.id
  }
  const fit = () => {
    if (!mapRef.value?.fitToMarkers({ maxZoom: 14, padding: [40, 40] }))
      message.info('请先添加标记')
  }
  watch([mapType, apiKey, securityCode], () => {
    mapReady.value = false
    error.value = ''
    tileWarning.value = ''
  })
  onBeforeUnmount(() => cleanup())
  return {
    providerDraft,
    keyDraft,
    securityDraft,
    applySettings,
    mapRef,
    cityIndex,
    mapType,
    center,
    zoom,
    markers,
    selectedId,
    search,
    showSettings,
    apiKey,
    securityCode,
    mapReady,
    error,
    tileWarning,
    revision,
    selected,
    filteredMarkers,
    securityConfig,
    tileConfig,
    onReady,
    onError,
    retry,
    selectCity,
    selectMarker,
    addMarker,
    removeSelected,
    fit,
  }
}
