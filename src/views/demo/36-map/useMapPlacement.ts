/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @FilePath: \Robot_Admin\src\views\demo\36-map\useMapPlacement.ts
 * @Description: 地图点选、位置预览与标记确认，兼容 Leaflet 和高德事件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  isValidMapCoordinate,
  type MapCoordinate,
  type MapMarker,
} from '@robot-admin/naive-ui-components/C_Map'

interface ClickableMap {
  on(event: 'click', listener: (event: unknown) => void): unknown
  off(event: 'click', listener: (event: unknown) => void): unknown
}

/** 只使用地图公开的 on/off API，不依赖组件内部实例字段。 */
function isClickableMap(map: unknown): map is ClickableMap {
  return (
    !!map &&
    typeof map === 'object' &&
    'on' in map &&
    typeof map.on === 'function' &&
    'off' in map &&
    typeof map.off === 'function'
  )
}

/** 高德使用坐标 getter，Leaflet 使用数值属性。 */
function getAxis(
  point: object,
  key: 'lat' | 'lng',
  getter: 'getLat' | 'getLng'
): unknown {
  const method: unknown = Reflect.get(point, getter)
  return typeof method === 'function'
    ? method.call(point)
    : Reflect.get(point, key)
}

/** 两个 SDK 的事件坐标统一为 [纬度, 经度]，非法坐标不进入草稿。 */
function getCoordinate(event: unknown): MapCoordinate | null {
  if (!event || typeof event !== 'object') return null
  const point: unknown =
    Reflect.get(event, 'latlng') ?? Reflect.get(event, 'lnglat')
  if (!point || typeof point !== 'object') return null
  const lat = getAxis(point, 'lat', 'getLat')
  const lng = getAxis(point, 'lng', 'getLng')
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  const coordinate: MapCoordinate = [lat, lng]
  return isValidMapCoordinate(coordinate) ? coordinate : null
}

/** 只有确认动作提交标记，选点、重选和取消都不修改已保存列表。 */
export function useMapPlacement(onConfirm: (marker: MapMarker) => void) {
  const isPicking = ref(false)
  const pendingPosition = ref<MapCoordinate | null>(null)
  const markerName = ref('')
  let disconnect: (() => void) | undefined
  const canConfirm = computed(
    () =>
      isPicking.value &&
      !!pendingPosition.value &&
      markerName.value.trim().length > 0 &&
      markerName.value.trim().length <= 40
  )
  const previewMarker = computed<MapMarker | null>(() =>
    pendingPosition.value
      ? {
          id: '__pending-map-marker__',
          lat: pendingPosition.value[0],
          lng: pendingPosition.value[1],
          title: '待确认位置',
          popup: '待确认位置',
        }
      : null
  )
  const cancelPlacement = () => {
    isPicking.value = false
    pendingPosition.value = null
    markerName.value = ''
    document.removeEventListener('keydown', onKeydown)
  }
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelPlacement()
    }
  }
  const beginPlacement = (name: string) => {
    if (!disconnect) return false
    cancelPlacement()
    markerName.value = name
    isPicking.value = true
    document.addEventListener('keydown', onKeydown)
    return true
  }
  const pickPosition = (event: unknown) => {
    if (!isPicking.value || pendingPosition.value) return
    const coordinate = getCoordinate(event)
    if (coordinate) pendingPosition.value = coordinate
  }
  const chooseAgain = () => {
    pendingPosition.value = null
  }
  const confirmPlacement = () => {
    if (!canConfirm.value || !pendingPosition.value) return
    const [lat, lng] = pendingPosition.value
    const title = markerName.value.trim()
    cancelPlacement()
    onConfirm({ id: crypto.randomUUID(), lat, lng, title, popup: title })
  }
  /** 输入法确认候选字时不提交，普通回车才确认标记。 */
  const confirmOnEnter = (event: KeyboardEvent) => {
    if (event.isComposing) return
    event.preventDefault()
    confirmPlacement()
  }
  const onDialogChange = (show: boolean) => {
    if (!show) cancelPlacement()
  }
  const stopPlacement = () => {
    cancelPlacement()
    disconnect?.()
    disconnect = undefined
  }
  const bindMap = (map: unknown) => {
    stopPlacement()
    if (!isClickableMap(map)) return
    map.on('click', pickPosition)
    disconnect = () => map.off('click', pickPosition)
  }
  onDeactivated(stopPlacement)
  onBeforeUnmount(stopPlacement)
  return {
    isPicking,
    pendingPosition,
    markerName,
    previewMarker,
    canConfirm,
    beginPlacement,
    cancelPlacement,
    chooseAgain,
    confirmPlacement,
    confirmOnEnter,
    onDialogChange,
    stopPlacement,
    bindMap,
  }
}
