<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 11:44:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-09-02
 * @FilePath: \Robot_Admin\src\views\demo\36-map\index.vue
 * @Description: 地图演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="map-demo">
    <c_vTitle
      title="地图组件场景示例"
      icon="mdi:map-marker-radius"
      description="支持 OpenStreetMap、高德地图等，可添加标记点、自定义样式，适用于位置展示、轨迹追踪等场景"
    />

    <!-- 示例展示 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:map-marker-multiple"
          class="title-icon"
        />
        地图示例
      </h2>
      <p class="section-desc">
        展示不同地图类型的使用示例，包括OpenStreetMap（免费）和高德地图（需要API
        Key）。
      </p>
      <div class="examples-grid">
        <div
          v-for="example in MAP_EXAMPLES"
          :key="example.title"
          class="example-card"
        >
          <h3 class="example-title">{{ example.title }}</h3>
          <p class="example-desc">{{ example.description }}</p>
          <div class="example-map">
            <C_Map
              height="250px"
              :center="example.center"
              :zoom="example.zoom"
              :markers="example.markers"
              :map-type="example.mapType"
              :aria-label="`${example.title}地图`"
              fit-markers-on-init
              @marker-click="handleMarkerClick"
              @error="handleMapError"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 地图配置 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:map-search"
          class="title-icon"
        />
        地图配置
      </h2>
      <p class="section-desc">
        配置地图参数，实时预览效果。可以切换地图类型、调整缩放级别、添加标记点等。
      </p>
      <div class="control-panel">
        <div class="control-row">
          <span class="control-label">地图类型:</span>
          <div class="control-content">
            <NSelect
              v-model:value="mapType"
              :options="MAP_TYPES"
              style="width: 150px"
            />
          </div>
        </div>

        <div
          class="control-row"
          v-if="mapType === 'amap'"
        >
          <span class="control-label">API Key:</span>
          <div class="control-content">
            <NInput
              v-model:value="amapApiKey"
              :placeholder="AMAP_CONFIG.placeholder"
              style="width: 300px"
              type="password"
            />
            <NButton
              @click="openAmapDocs"
              type="primary"
              size="small"
            >
              申请Key
            </NButton>
          </div>
        </div>

        <div
          class="control-row"
          v-if="mapType === 'amap'"
        >
          <span class="control-label">安全配置:</span>
          <div class="control-content">
            <template v-if="AMAP_SERVICE_HOST">
              <NTag type="success">服务端代理</NTag>
              <code>{{ AMAP_SERVICE_HOST }}</code>
            </template>
            <NInput
              v-else
              v-model:value="amapSecurityCode"
              :placeholder="AMAP_CONFIG.securityCodePlaceholder"
              style="width: 360px"
              type="password"
              show-password-on="click"
            />
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">中心点:</span>
          <div class="control-content">
            <span>纬度:</span>
            <NInputNumber
              v-model:value="centerLat"
              :min="-90"
              :max="90"
              :step="0.0001"
              style="width: 120px"
            />
            <span>经度:</span>
            <NInputNumber
              v-model:value="centerLng"
              :min="-180"
              :max="180"
              :step="0.0001"
              style="width: 120px"
            />
            <NButton
              @click="setCurrentLocation"
              type="info"
              size="small"
            >
              <template #icon>
                <C_Icon name="mdi:crosshairs-gps" />
              </template>
              定位
            </NButton>
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">缩放级别:</span>
          <div class="control-content">
            <NSlider
              v-model:value="zoom"
              :min="CONFIG_OPTIONS.zoom.min"
              :max="CONFIG_OPTIONS.zoom.max"
              :step="CONFIG_OPTIONS.zoom.step"
              style="width: 200px"
            />
            <span class="slider-label">{{ zoom }}</span>
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">地图高度:</span>
          <div class="control-content">
            <NSlider
              v-model:value="mapHeight"
              :min="CONFIG_OPTIONS.height.min"
              :max="CONFIG_OPTIONS.height.max"
              :step="CONFIG_OPTIONS.height.step"
              style="width: 200px"
            />
            <span class="slider-label">{{ mapHeight }}px</span>
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">标记管理:</span>
          <div class="control-content">
            <C_ActionBar
              :actions="markerActions"
              :config="{ size: 'small' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 实时预览 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:map-search-outline"
          class="title-icon"
        />
        实时预览
      </h2>
      <div class="preview-section">
        <h3 class="preview-title">地图预览效果</h3>
        <div class="preview-map">
          <C_Map
            ref="previewMapRef"
            :height="mapHeightStyle"
            :center="mapCenter"
            :zoom="zoom"
            :markers="markers"
            :map-type="mapType"
            :amap-key="mapType === 'amap' ? amapApiKey : ''"
            :amap-security-config="amapSecurityConfig"
            aria-label="实时预览地图"
            @ready="handlePreviewReady"
            @marker-click="handlePreviewMarkerClick"
            @error="handleMapError"
          />
        </div>
        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">地图类型:</span>
            <span class="info-value">{{ getMapTypeLabel() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">中心点:</span>
            <span class="info-value"
              >{{ centerLat.toFixed(4) }}, {{ centerLng.toFixed(4) }}</span
            >
          </div>
          <div class="info-item">
            <span class="info-label">缩放级别:</span>
            <span class="info-value">{{ zoom }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">标记数量:</span>
            <span class="info-value">{{ markers.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">加载状态:</span>
            <span class="info-value">{{
              previewReady ? '已就绪' : '加载中'
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 高德地图说明 -->
    <div
      v-if="mapType === 'amap'"
      class="amap-note"
    >
      <NAlert
        type="info"
        :closable="false"
      >
        <template #icon>
          <C_Icon name="mdi:information" />
        </template>
        {{ AMAP_CONFIG.note }}
      </NAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { MAP_EXAMPLES, CONFIG_OPTIONS, AMAP_CONFIG } from './data'
  import {
    MAP_TYPES,
    type AMapSecurityConfig,
    type MapCoordinate,
    type MapExpose,
    type MapMarker,
    type MapType,
  } from '@robot-admin/naive-ui-components/C_Map'
  import { AMAP_SERVICE_HOST, MAP_KEY } from '@/constant'

  const message = useMessage()

  /** 标记管理按钮 */
  const markerActions = computed(() => [
    { label: '添加标记', onClick: addRandomMarker },
    { label: '适配全部标记', onClick: fitPreviewMarkers },
    { label: '清除标记', type: 'warning' as const, onClick: clearMarkers },
  ])

  // 状态管理
  const mapType = ref<MapType>('osm')
  const amapApiKey = ref(MAP_KEY)
  const amapSecurityCode = ref('')
  const centerLat = ref(39.9042)
  const centerLng = ref(116.4074)
  const zoom = ref(CONFIG_OPTIONS.zoom.default)
  const mapHeight = ref(CONFIG_OPTIONS.height.default)
  const markers = ref<MapMarker[]>([])
  const previewMapRef = ref<MapExpose | null>(null)
  const previewReady = ref(false)

  // 计算属性
  const mapCenter = computed<MapCoordinate>(() => [
    centerLat.value,
    centerLng.value,
  ])
  const mapHeightStyle = computed(() => `${mapHeight.value}px`)
  const amapSecurityConfig = computed<AMapSecurityConfig | undefined>(() => {
    if (mapType.value !== 'amap') return undefined
    if (AMAP_SERVICE_HOST) return { serviceHost: AMAP_SERVICE_HOST }
    const securityJsCode = amapSecurityCode.value.trim()
    return securityJsCode ? { securityJsCode } : undefined
  })

  const getMapTypeLabel = () => {
    const type = MAP_TYPES.find(t => t.value === mapType.value)
    return type?.label || mapType.value
  }

  const handlePreviewReady = (): void => {
    previewReady.value = true
  }

  // 处理标记点击
  const handleMarkerClick = (marker: MapMarker): void => {
    if (marker.popup) {
      message.info(`点击了标记: ${marker.popup}`)
    }
  }

  const handlePreviewMarkerClick = (marker: MapMarker): void => {
    if (marker.popup) {
      message.info(`预览标记: ${marker.popup}`)
    }
  }

  const handleMapError = (error: Error): void => {
    previewReady.value = false
    message.error(error.message)
  }

  // 添加随机标记
  const addRandomMarker = () => {
    const lat = centerLat.value + (Math.random() - 0.5) * 0.1
    const lng = centerLng.value + (Math.random() - 0.5) * 0.1
    const popup = `随机标记 ${markers.value.length + 1}`

    markers.value.push({ id: crypto.randomUUID(), lat, lng, popup })
    message.success(`添加了标记: ${popup}`)
  }

  const fitPreviewMarkers = (): void => {
    if (previewMapRef.value?.fitToMarkers({ maxZoom: 14 })) return
    message.warning('请先添加至少一个有效标记')
  }

  // 清除所有标记
  const clearMarkers = () => {
    markers.value = []
    message.info('已清除所有标记')
  }

  // 设置当前位置
  const setCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          centerLat.value = position.coords.latitude
          centerLng.value = position.coords.longitude
          message.success('已获取当前位置')
        },
        error => {
          message.error('获取位置失败: ' + error.message)
        }
      )
    } else {
      message.error('浏览器不支持地理定位')
    }
  }

  // 打开高德地图文档
  const openAmapDocs = () => {
    window.open(AMAP_CONFIG.docsUrl, '_blank', 'noopener,noreferrer')
  }

  watch(
    [mapType, amapApiKey, amapSecurityCode],
    () => (previewReady.value = false)
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
