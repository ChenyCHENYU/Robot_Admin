<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 地图工作台，场景、标记与详情围绕一个主视区
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace map-workspace">
    <header class="workspace-heading"
      ><div
        ><small>LOCATION EXPLORER</small><h1>地图工作台</h1
        ><p>从城市地标出发，在地图与标记列表之间切换视角。</p></div
      ><div class="workspace-actions"
        ><NButton
          size="small"
          @click="showSettings = true"
          >地图服务设置</NButton
        ><NButton
          size="small"
          type="primary"
          :disabled="!mapReady"
          @click="addMarker"
          >添加标记</NButton
        ></div
      ></header
    >
    <div class="workspace-grid"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>探索场景</h2
          ><button
            v-for="(city, index) in MAP_EXAMPLES"
            :key="city.title"
            type="button"
            class="workspace-choice"
            :aria-pressed="cityIndex === index"
            @click="selectCity(index)"
            ><span class="workspace-badge">0{{ index + 1 }}</span
            ><span
              ><strong>{{ city.title }}</strong
              ><small>{{ city.markers.length }} 个内置地标</small></span
            ></button
          ></section
        ><section class="workspace-section"
          ><h2>标记列表 · {{ markers.length }}</h2
          ><NInput
            v-model:value="search"
            size="small"
            clearable
            placeholder="搜索标记"
            :input-props="{ 'aria-label': '搜索地图标记' }"
          /><div class="map-marker-list"
            ><button
              v-for="marker in filteredMarkers"
              :key="marker.id"
              type="button"
              class="workspace-choice"
              :aria-pressed="selectedId === marker.id"
              @click="selectMarker(marker)"
              ><span class="map-dot" /><span
                ><strong>{{ marker.popup }}</strong
                ><small
                  >{{ marker.lat.toFixed(4) }},
                  {{ marker.lng.toFixed(4) }}</small
                ></span
              ></button
            ><p
              v-if="!filteredMarkers.length"
              class="workspace-hint"
              >没有匹配标记</p
            ></div
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ MAP_EXAMPLES[cityIndex].title }}</h2
            ><small
              >{{
                mapType === 'osm'
                  ? tileSource === 'carto'
                    ? 'CARTO Voyager'
                    : 'OpenStreetMap'
                  : '高德地图'
              }}
              ·
              {{
                mapReady
                  ? mapType === 'amap' || tilesLoaded
                    ? '底图已就绪'
                    : '正在连接底图'
                  : '等待地图初始化'
              }}</small
            ></div
          ><div class="workspace-actions"
            ><NSelect
              v-if="mapType === 'osm'"
              :value="tileSource"
              size="small"
              class="map-basemap-select"
              aria-label="选择底图"
              :options="[
                { label: '浅色街道 · CARTO', value: 'carto' },
                { label: '标准街道 · OSM', value: 'osm' },
              ]"
              @update:value="changeTileSource"
            /><NButton
              size="tiny"
              :disabled="!markers.length || !mapReady"
              @click="fit"
              >适配全部标记</NButton
            ><NButton
              size="tiny"
              @click="selectCity(cityIndex)"
              >恢复示例</NButton
            ></div
          ></header
        >
        <NAlert
          v-if="error || tileWarning"
          class="map-alert"
          :type="error ? 'error' : 'warning'"
          :bordered="false"
          ><div>{{ error || tileWarning }}</div
          ><NButton
            size="tiny"
            class="map-retry"
            @click="retry"
            >重试加载</NButton
          ></NAlert
        >
        <div class="map-canvas"
          ><C_Map
            ref="mapRef"
            :key="revision"
            height="100%"
            :center="center"
            :zoom="zoom"
            :markers="markers"
            :map-type="mapType"
            :amap-key="apiKey"
            :amap-security-config="securityConfig"
            :tile-config="tileConfig"
            fit-markers-on-init
            aria-label="城市地标地图"
            @ready="onReady"
            @error="onError"
            @marker-click="selectMarker"
        /></div>
        <section
          v-if="selected"
          class="map-detail"
          ><div
            ><span class="workspace-hint">当前标记</span
            ><h3>{{ selected.popup }}</h3
            ><p
              >纬度 {{ selected.lat.toFixed(6) }} · 经度
              {{ selected.lng.toFixed(6) }}</p
            ></div
          ><div class="workspace-actions"
            ><NButton
              size="tiny"
              @click="selectMarker(selected)"
              >定位标记</NButton
            ><NButton
              size="tiny"
              @click="removeSelected"
              >移除标记</NButton
            ></div
          ></section
        ><footer class="workspace-footer"
          ><span>地标与自定义标记为当前会话演示数据</span
          ><span>底图依赖地图服务网络连接</span></footer
        ></main
      >
    </div>
    <NDrawer
      v-model:show="showSettings"
      :width="380"
      ><NDrawerContent
        title="地图服务设置"
        closable
        ><label class="workspace-label"
          ><span>地图服务</span
          ><NSelect
            v-model:value="providerDraft"
            :options="[
              { label: 'OpenStreetMap', value: 'osm' },
              { label: '高德地图', value: 'amap' },
            ]" /></label
        ><template v-if="providerDraft === 'amap'"
          ><label class="workspace-label"
            ><span>高德 Web 端 API Key</span
            ><NInput
              v-model:value="keyDraft"
              type="password"
              show-password-on="click"
              placeholder="完整填写 Key 后点击应用设置" /></label
          ><label class="workspace-label"
            ><span>本地开发安全码</span
            ><NInput
              v-model:value="securityDraft"
              type="password"
              show-password-on="click"
              placeholder="securityJsCode" /></label
          ><p class="workspace-hint"
            >生产环境使用项目已配置的同源安全代理。填写内容仅在本次页面会话保留。</p
          ></template
        ><p
          v-else
          class="workspace-hint"
          >默认使用 CARTO 街道底图，连接失败会尝试 OSM
          备用源。可在地图上方切换，地标会保留。</p
        ><template #footer
          ><NButton
            size="small"
            type="primary"
            @click="applySettings"
            >应用设置</NButton
          ></template
        ></NDrawerContent
      ></NDrawer
    >
  </div>
</template>
<script setup lang="ts">
  import { MAP_EXAMPLES } from './data'
  import { useMapWorkspace } from './useMapWorkspace'
  defineOptions({ name: 'Demo36Map' })
  const {
    tileSource,
    tilesLoaded,
    changeTileSource,
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
  } = useMapWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
