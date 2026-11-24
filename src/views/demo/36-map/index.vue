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
          @click="settings.showSettings = true"
          >地图服务设置</NButton
        ><NButton
          size="small"
          type="primary"
          :disabled="!status.mapReady"
          :aria-pressed="placement.isPicking"
          @click="landmarks.addMarker"
          >{{ placement.isPicking ? '取消选点' : '添加标记' }}</NButton
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
            :aria-pressed="location.cityIndex === index"
            @click="location.selectCity(index)"
            ><span class="workspace-badge">0{{ index + 1 }}</span
            ><span
              ><strong>{{ city.title }}</strong
              ><small>{{ city.markers.length }} 个内置地标</small></span
            ></button
          ></section
        ><section class="workspace-section"
          ><h2>标记列表 · {{ landmarks.markers.length }}</h2
          ><NInput
            v-model:value="landmarks.search"
            size="small"
            clearable
            placeholder="搜索标记"
            :input-props="{ 'aria-label': '搜索地图标记' }"
          /><div class="map-marker-list"
            ><button
              v-for="marker in landmarks.filteredMarkers"
              :key="marker.id"
              type="button"
              class="workspace-choice"
              :aria-pressed="landmarks.selectedId === marker.id"
              @click="landmarks.selectMarker(marker)"
              ><span class="map-dot" /><span
                ><strong>{{ marker.popup }}</strong
                ><small
                  >{{ marker.lat.toFixed(4) }},
                  {{ marker.lng.toFixed(4) }}</small
                ></span
              ></button
            ><p
              v-if="!landmarks.filteredMarkers.length"
              class="workspace-hint"
              >没有匹配标记</p
            ></div
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ MAP_EXAMPLES[location.cityIndex].title }}</h2
            ><small
              >{{ layers.mapType === 'osm' ? 'OpenStreetMap' : '高德地图' }}
              ·
              {{
                status.mapReady
                  ? layers.mapType === 'amap' || status.tilesLoaded
                    ? '底图已就绪'
                    : '正在连接底图'
                  : '等待地图初始化'
              }}</small
            ></div
          ><div class="workspace-actions"
            ><NButton
              size="tiny"
              :disabled="!landmarks.markers.length || !status.mapReady"
              @click="landmarks.fit"
              >适配全部标记</NButton
            ><NButton
              size="tiny"
              @click="location.selectCity(location.cityIndex)"
              >恢复示例</NButton
            ></div
          ></header
        >
        <NAlert
          v-if="status.error || status.tileWarning"
          class="map-alert"
          :type="status.error ? 'error' : 'warning'"
          :bordered="false"
          ><div>{{ status.error || status.tileWarning }}</div
          ><NButton
            size="tiny"
            class="map-retry"
            @click="status.retry"
            >重试加载</NButton
          ></NAlert
        >
        <div
          v-if="placement.isPicking"
          class="map-picking-hint"
          role="status"
          >点击地图空白处选择位置，可拖动或缩放地图；按 Esc 取消。</div
        >
        <div
          ref="canvasRef"
          class="map-canvas"
          :class="{ 'map-canvas--picking': placement.isPicking }"
          @mousedown.capture="focusCanvas"
          ><C_Map
            ref="mapRef"
            :key="layers.revision"
            class="map-view"
            height="100%"
            :center="location.center"
            :zoom="location.zoom"
            :markers="landmarks.displayedMarkers"
            :map-type="layers.mapType"
            :amap-key="layers.apiKey"
            :amap-security-config="layers.securityConfig"
            :tile-config="layers.tileConfig"
            fit-markers-on-init
            aria-label="城市地标地图"
            @ready="layers.onReady"
            @error="layers.onError"
            @marker-click="landmarks.onMarkerClick"
        /></div>
        <section
          v-if="landmarks.selected"
          class="map-detail"
          ><div
            ><span class="workspace-hint">当前标记</span
            ><h3>{{ landmarks.selected.popup }}</h3
            ><p
              >纬度 {{ landmarks.selected.lat.toFixed(6) }} · 经度
              {{ landmarks.selected.lng.toFixed(6) }}</p
            ></div
          ><div class="workspace-actions"
            ><NButton
              size="tiny"
              @click="landmarks.selectMarker(landmarks.selected)"
              >定位标记</NButton
            ><NButton
              size="tiny"
              @click="landmarks.removeSelected"
              >移除标记</NButton
            ></div
          ></section
        ><footer class="workspace-footer"
          ><span>地标与自定义标记为当前会话演示数据</span
          ><span>底图依赖地图服务网络连接</span></footer
        ></main
      >
    </div>
    <NModal
      :show="!!placement.pendingPosition"
      preset="card"
      title="确认标记位置"
      class="map-marker-dialog"
      :style="{ width: 'min(420px, calc(100vw - 32px))' }"
      :mask-closable="false"
      @update:show="placement.onDialogChange"
      ><p class="workspace-hint">标记将添加到刚才点选的位置，确认后才会保存。</p
      ><dl
        v-if="placement.pendingPosition"
        class="map-coordinates"
        ><div
          ><dt>纬度</dt
          ><dd
            ><output aria-label="选中纬度">{{
              placement.pendingPosition[0].toFixed(6)
            }}</output></dd
          ></div
        ><div
          ><dt>经度</dt
          ><dd
            ><output aria-label="选中经度">{{
              placement.pendingPosition[1].toFixed(6)
            }}</output></dd
          ></div
        ></dl
      ><label class="workspace-label"
        ><span>标记名称</span
        ><NInput
          v-model:value="placement.markerName"
          :maxlength="40"
          show-count
          clearable
          placeholder="输入标记名称"
          :input-props="{ 'aria-label': '标记名称' }"
          @keydown.enter="placement.confirmOnEnter" /></label
      ><template #footer
        ><div class="workspace-actions"
          ><NButton
            size="small"
            @click="placement.cancelPlacement"
            >取消添加</NButton
          ><NButton
            size="small"
            @click="placement.chooseAgain"
            >重新选点</NButton
          ><NButton
            size="small"
            type="primary"
            :disabled="!placement.canConfirm"
            @click="placement.confirmPlacement"
            >确认添加</NButton
          ></div
        ></template
      ></NModal
    >
    <NDrawer
      v-model:show="settings.showSettings"
      :width="380"
      ><NDrawerContent
        title="地图服务设置"
        closable
        ><label class="workspace-label"
          ><span>地图服务</span
          ><NSelect
            v-model:value="settings.providerDraft"
            :options="[
              { label: 'OpenStreetMap', value: 'osm' },
              { label: '高德地图', value: 'amap' },
            ]" /></label
        ><template v-if="settings.providerDraft === 'amap'"
          ><label class="workspace-label"
            ><span>高德 Web 端 API Key</span
            ><NInput
              v-model:value="settings.keyDraft"
              type="password"
              show-password-on="click"
              placeholder="完整填写 Key 后点击应用设置" /></label
          ><label class="workspace-label"
            ><span>本地开发安全码</span
            ><NInput
              v-model:value="settings.securityDraft"
              type="password"
              show-password-on="click"
              placeholder="securityJsCode" /></label
          ><p class="workspace-hint"
            >生产环境使用项目已配置的同源安全代理。填写内容仅在本次页面会话保留。</p
          ></template
        ><p
          v-else
          class="workspace-hint"
          >默认使用 OpenStreetMap 街道底图，无需 API
          Key。连接失败可重试，也可配置高德地图服务。</p
        ><template #footer
          ><NButton
            size="small"
            type="primary"
            @click="settings.applySettings"
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
    canvasRef,
    mapRef,
    focusCanvas,
    status,
    layers,
    settings,
    location,
    landmarks,
    placement,
  } = useMapWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
