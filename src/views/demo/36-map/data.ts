/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 10:58:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-09-02
 * @FilePath: \Robot_Admin\src\views\demo\36-map\data.ts
 * @Description: 地图演示页面数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  MapCoordinate,
  MapMarker,
  MapType,
} from '@robot-admin/naive-ui-components/C_Map'

export interface MapExample {
  center: MapCoordinate
  description: string
  mapType: MapType
  markers: MapMarker[]
  title: string
  zoom: number
}

// 示例数据
export const MAP_EXAMPLES: readonly MapExample[] = [
  {
    title: '北京天安门',
    description: '中国北京市中心的著名地标',
    center: [39.9042, 116.4074],
    zoom: 13,
    mapType: 'osm',
    markers: [
      {
        id: 'tiananmen',
        lat: 39.9042,
        lng: 116.4074,
        popup: '天安门广场',
      },
      {
        id: 'forbidden-city',
        lat: 39.9088,
        lng: 116.3974,
        popup: '故宫博物院',
      },
    ],
  },
  {
    title: '上海外滩',
    description: '上海市黄浦区的著名景点',
    center: [31.2397, 121.4998],
    zoom: 13,
    mapType: 'osm',
    markers: [
      {
        id: 'the-bund',
        lat: 31.2397,
        lng: 121.4998,
        popup: '外滩观景台',
      },
      {
        id: 'huangpu-park',
        lat: 31.2404,
        lng: 121.4909,
        popup: '黄浦公园',
      },
    ],
  },
  {
    title: '广州塔',
    description: '广州市的标志性建筑',
    center: [23.1096, 113.3245],
    zoom: 13,
    mapType: 'osm',
    markers: [
      {
        id: 'canton-tower',
        lat: 23.1096,
        lng: 113.3245,
        popup: '广州塔',
      },
    ],
  },
]

// 配置选项
export const CONFIG_OPTIONS = {
  height: {
    label: '地图高度',
    min: 200,
    max: 800,
    step: 50,
    default: 400,
  },
  zoom: {
    label: '缩放级别',
    min: 1,
    max: 18,
    step: 1,
    default: 10,
  },
}

// 高德地图配置
export const AMAP_CONFIG = {
  docsUrl: 'https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode',
  note: '高德地图需要 Web 端 JS API Key；新 Key 还需要安全配置，生产环境推荐使用同源服务端代理。',
  placeholder: '请输入高德地图API Key',
  securityCodePlaceholder: '仅限本地开发：请输入 securityJsCode',
}

// 地图控件配置
export const MAP_CONTROLS = [
  { label: '缩放控制', value: 'zoom' },
  { label: '图层切换', value: 'layers' },
  { label: '标记管理', value: 'markers' },
  { label: '测距工具', value: 'distance' },
  { label: '绘图工具', value: 'draw' },
] as const

export type MapControl = (typeof MAP_CONTROLS)[number]['value']
