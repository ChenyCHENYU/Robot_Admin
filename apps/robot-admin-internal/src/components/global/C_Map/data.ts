/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 14:14:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 14:14:00
 * @FilePath: \Robot_Admin\src\components\global\C_Map\data.ts
 * @Description: 地图组件数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 地图类型
export const MAP_TYPES = [
  { label: 'OpenStreetMap', value: 'osm' },
  { label: '高德地图', value: 'amap' },
] as const

export type MapType = (typeof MAP_TYPES)[number]['value']

// 地图标记接口
export interface MapMarker {
  lat: number
  lng: number
  popup?: string
}

// 地图配置接口
export interface MapConfig {
  height?: string
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  mapType?: MapType
  amapKey?: string
}

// 默认配置
export const DEFAULT_MAP_CONFIG: Required<
  Omit<MapConfig, 'markers' | 'amapKey'>
> = {
  height: '400px',
  center: [39.9042, 116.4074],
  zoom: 10,
  mapType: 'osm',
}

// OpenStreetMap 瓦片配置
export const OSM_TILE_CONFIG = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  minZoom: 1,
  tileSize: 256,
  detectRetina: true,
} as const

// 高德地图配置
export const AMAP_CONFIG = {
  apiUrl: 'https://webapi.amap.com/maps?v=2.0&key=',
  note: '高德地图需要API Key，如需使用请申请：https://lbs.amap.com/api/javascript-api/guide/create/',
} as const

// 地图图标配置
export const MAP_ICONS = {
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
} as const
