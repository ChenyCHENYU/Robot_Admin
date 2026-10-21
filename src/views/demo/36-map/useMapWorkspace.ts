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
  MapTileConfig,
} from '@robot-admin/naive-ui-components/C_Map'
import { MAP_EXAMPLES } from './data'
import { useMapPlacement } from './useMapPlacement'
/** 单一地图主视图，资源失败与标记编辑分别保留明确状态。 */
export function useMapWorkspace() {
  const message = useMessage()
  const mapRef = ref<MapExpose | null>(null)
  const canvasRef = ref<HTMLElement | null>(null)
  let resizeObserver: ResizeObserver | undefined
  let resizeFrame = 0
  /** 容器布局完成后刷新 SDK 坐标，合并侧栏动画中的连续尺寸变化。 */
  const refreshCanvas = () => {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      const canvas = canvasRef.value
      if (canvas?.isConnected && canvas.clientWidth && canvas.clientHeight)
        mapRef.value?.refresh()
    })
  }
  /** 首次进入和 KeepAlive 恢复时重新观察实际画布。 */
  const observeCanvas = () => {
    resizeObserver?.disconnect()
    if (!canvasRef.value) return
    resizeObserver = new ResizeObserver(refreshCanvas)
    resizeObserver.observe(canvasRef.value)
    refreshCanvas()
  }
  /** 缓存隐藏或销毁后停止观察，避免后台刷新。 */
  const stopObserving = () => {
    resizeObserver?.disconnect()
    cancelAnimationFrame(resizeFrame)
  }
  /** 先无滚动聚焦地图，避免 Leaflet 默认聚焦使嵌套滚动区在按下与松开间跳动。 */
  const focusCanvas = (event: MouseEvent) => {
    if (event.button !== 0) return
    const map = mapRef.value?.getMap()
    if (map && 'getContainer' in map)
      map.getContainer().focus({ preventScroll: true })
  }
  const cityIndex = ref(0)
  const mapType = ref<MapType>('osm')
  const center = ref<MapCoordinate>([...MAP_EXAMPLES[0].center])
  const zoom = ref(13)
  const markers = ref<MapMarker[]>(
    MAP_EXAMPLES[0].markers.map(item => ({ ...item }))
  )
  const selectedId = ref<string | number | undefined>(markers.value[0]?.id)
  const search = ref('')
  const placement = useMapPlacement(marker => {
    markers.value = [...markers.value, marker]
    selectedId.value = marker.id
    search.value = ''
  })
  const displayedMarkers = computed(() =>
    placement.previewMarker.value
      ? [...markers.value, placement.previewMarker.value]
      : markers.value
  )
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
    placement.bindMap(map)
    mapReady.value = true
    tilesLoaded.value = false
    error.value = ''
    refreshCanvas()
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
    placement.stopPlacement()
    mapReady.value = false
    error.value = value.message
  }
  const retry = () => {
    placement.stopPlacement()
    cleanup()
    mapReady.value = false
    error.value = ''
    tileWarning.value = ''
    tilesLoaded.value = false
    revision.value++
  }
  const selectCity = (index: number) => {
    placement.cancelPlacement()
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
  /** 地图内点击只同步选择，避免再次移动视野打断 SDK 弹窗。 */
  const onMarkerClick = (marker: MapMarker) => {
    if (placement.isPicking.value) return
    selectedId.value = marker.id
  }
  /** 添加按钮只进入选点状态，再次点击取消；坐标来自 SDK 点击事件。 */
  const addMarker = () => {
    if (placement.isPicking.value) placement.cancelPlacement()
    else if (
      !placement.beginPlacement(`自定义标记 ${markers.value.length + 1}`)
    )
      message.warning('地图暂时无法选点，请重试加载')
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
  onMounted(observeCanvas)
  watch(showSettings, show => {
    if (show) placement.cancelPlacement()
  })
  onActivated(() => {
    observeCanvas()
    const map = mapRef.value?.getMap()
    if (map) placement.bindMap(map)
  })
  onDeactivated(stopObserving)
  onBeforeUnmount(() => {
    stopObserving()
    cleanup()
  })
  return {
    ...placement,
    displayedMarkers,
    canvasRef,
    focusCanvas,
    tilesLoaded,
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
    onMarkerClick,
    addMarker,
    removeSelected,
    fit,
  }
}
