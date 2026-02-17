<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 10:58:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 14:22:38
 * @FilePath: \Robot_Admin\src\components\global\C_Map\index.vue
 * @Description: 地图组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-map">
    <div
      ref="mapContainer"
      class="map-container"
      :style="{ height: height }"
    ></div>
    <div
      v-if="loading"
      class="map-loading"
    >
      <NSpin size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'

  // 导入组件配置
  import { OSM_TILE_CONFIG, AMAP_CONFIG, MAP_ICONS } from './data'

  // 修复Leaflet默认图标问题
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions(MAP_ICONS)

  // 地图标记接口
  interface MapMarker {
    lat: number
    lng: number
    popup?: string
  }

  // Props定义
  const props = withDefaults(
    defineProps<{
      height?: string
      center?: [number, number]
      zoom?: number
      markers?: MapMarker[]
      mapType?: 'osm' | 'amap'
      amapKey?: string
    }>(),
    {
      height: '400px',
      center: () => [39.9042, 116.4074],
      zoom: 10,
      markers: () => [],
      mapType: 'osm',
      amapKey: '',
    }
  )

  // Emits定义
  const emit = defineEmits<{
    ready: [map: any]
    markerClick: [marker: MapMarker, event: any]
  }>()

  // 响应式状态
  const mapContainer = ref<HTMLElement>()
  const loading = ref(true)
  let map: any = null

  // 初始化OpenStreetMap
  const initOSMMap = async () => {
    if (!mapContainer.value) return

    try {
      // 清空容器
      mapContainer.value.innerHTML = ''

      // 创建地图实例
      map = L.map(mapContainer.value, {
        center: props.center,
        zoom: props.zoom,
        zoomControl: true,
        preferCanvas: true,
      })

      // 添加瓦片图层
      const tileLayer = L.tileLayer(OSM_TILE_CONFIG.url, OSM_TILE_CONFIG)
      tileLayer.addTo(map)

      // 添加标记
      addMarkers()

      // 强制刷新地图尺寸
      await nextTick()
      requestAnimationFrame(() => {
        map?.invalidateSize({ reset: true, pan: false })
      })

      loading.value = false
      emit('ready', map)
    } catch (error) {
      console.error('OpenStreetMap初始化失败:', error)
      loading.value = false
    }
  }

  // 初始化高德地图
  const initAMap = async () => {
    if (!mapContainer.value || !props.amapKey) return

    try {
      // 清空容器
      mapContainer.value.innerHTML = ''

      // 动态加载高德地图SDK
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `${AMAP_CONFIG.apiUrl}${props.amapKey}`

      script.onload = () => {
        if ((window as any).AMap) {
          const amap = new (window as any).AMap.Map(mapContainer.value, {
            zoom: props.zoom,
            center: props.center,
          })

          // 添加标记
          addAMapMarkers(amap)

          loading.value = false
          emit('ready', amap)
        }
      }

      script.onerror = () => {
        loading.value = false
      }

      document.head.appendChild(script)
    } catch {
      loading.value = false
    }
  }

  // 添加OpenStreetMap标记
  const addMarkers = () => {
    if (!map || props.mapType !== 'osm' || !props.markers) return

    // 清除现有标记
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // 添加新标记
    props.markers.forEach(marker => {
      const leafletMarker = L.marker([marker.lat, marker.lng])

      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup)
        leafletMarker.on('click', (event: any) => {
          emit('markerClick', marker, event)
        })
      }

      leafletMarker.addTo(map)
    })
  }

  // 添加高德地图标记
  const addAMapMarkers = (amap: any) => {
    if (!amap || props.mapType !== 'amap' || !props.markers) return

    props.markers.forEach(marker => {
      const amapMarker = new (window as any).AMap.Marker({
        position: [marker.lat, marker.lng],
        title: marker.popup || '',
      })

      if (marker.popup) {
        const infoWindow = new (window as any).AMap.InfoWindow({
          content: marker.popup,
          offset: new (window as any).AMap.Pixel(0, -30),
        })

        amapMarker.on('click', () => {
          infoWindow.open(amap, amapMarker.getPosition())
          emit('markerClick', marker, null)
        })
      }

      amapMarker.setMap(amap)
    })
  }

  // 监听标记变化
  watch(
    () => props.markers,
    () => {
      if (map && props.mapType === 'osm') {
        addMarkers()
      }
    },
    { deep: true }
  )

  // 监听地图类型变化
  watch(
    () => props.mapType,
    async (newType, oldType) => {
      if (newType === oldType) return

      if (map) {
        map.remove()
        map = null
        loading.value = true

        // 等待 DOM 更新后重新初始化
        await nextTick()
        if (newType === 'amap' && props.amapKey) {
          await initAMap()
        } else {
          await initOSMMap()
        }
      }
    }
  )

  // 监听中心点和缩放级别变化
  watch(
    [() => props.center, () => props.zoom],
    () => {
      if (map) {
        map.setView(props.center, props.zoom)
      }
    },
    { deep: true }
  )

  // 组件挂载
  onMounted(async () => {
    await nextTick()
    if (props.mapType === 'amap' && props.amapKey) {
      await initAMap()
    } else {
      await initOSMMap()
    }
  })

  // 组件卸载
  onUnmounted(() => {
    if (map) {
      map.remove()
      map = null
    }
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
