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
} from '@robot-admin/naive-ui-components/C_Map'
import { MAP_EXAMPLES } from './data'
import { useMapPlacement } from './useMapPlacement'
import { useMapService } from './useMapService'
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
  const { status, layers, settings, showSettings } = useMapService({
    ready: map => {
      placement.bindMap(map)
      refreshCanvas()
    },
    reset: placement.stopPlacement,
  })
  const selected = computed(() =>
    markers.value.find(item => item.id === selectedId.value)
  )
  const filteredMarkers = computed(() =>
    markers.value.filter(item =>
      `${item.title ?? ''} ${item.popup ?? ''}`.includes(search.value.trim())
    )
  )
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
  onBeforeUnmount(stopObserving)
  return {
    mapRef,
    canvasRef,
    focusCanvas,
    status,
    layers,
    settings,
    location: proxyRefs({ cityIndex, center, zoom, selectCity }),
    landmarks: proxyRefs({
      displayedMarkers,
      markers,
      selectedId,
      search,
      selected,
      filteredMarkers,
      selectMarker,
      onMarkerClick,
      addMarker,
      removeSelected,
      fit,
    }),
    placement: proxyRefs(placement),
  }
}
