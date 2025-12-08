/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 10:58:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 11:15:58
 * @FilePath: \Robot_Admin\src\views\demo\36-map\data.ts
 * @Description: 地图演示页面数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 地图类型选项
export const MAP_TYPES = [
  { label: 'OpenStreetMap', value: 'osm' },
  { label: '高德地图', value: 'amap' },
] as const

export type MapType = (typeof MAP_TYPES)[number]['value']

// 示例数据
export const MAP_EXAMPLES = [
  {
    title: '北京天安门',
    description: '中国北京市中心的著名地标',
    center: [39.9042, 116.4074] as [number, number],
    zoom: 13,
    mapType: 'osm' as MapType,
    markers: [
      {
        lat: 39.9042,
        lng: 116.4074,
        popup: '天安门广场',
      },
      {
        lat: 39.9088,
        lng: 116.3974,
        popup: '故宫博物院',
      },
    ],
  },
  {
    title: '上海外滩',
    description: '上海市黄浦区的著名景点',
    center: [31.2397, 121.4998] as [number, number],
    zoom: 13,
    mapType: 'osm' as MapType,
    markers: [
      {
        lat: 31.2397,
        lng: 121.4998,
        popup: '外滩观景台',
      },
      {
        lat: 31.2404,
        lng: 121.4909,
        popup: '黄浦公园',
      },
    ],
  },
  {
    title: '广州塔',
    description: '广州市的标志性建筑',
    center: [23.1096, 113.3245] as [number, number],
    zoom: 13,
    mapType: 'osm' as MapType,
    markers: [
      {
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
  note: '高德地图需要API Key，如需使用请申请：https://lbs.amap.com/api/javascript-api/guide/create/',
  placeholder: '请输入高德地图API Key',
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
