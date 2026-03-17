import type {
  BuildingLabel,
  EnergyMapping,
  ModelEntry,
  SceneConfig,
  SubSceneConfig,
} from './types'

// ===================== 场景基础配置 =====================

/** 默认场景配置 */
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  skyboxPath: '/3d-assets/textures/',
  daySkybox: [
    'posx.jpg',
    'negx.jpg',
    'posy.jpg',
    'negy.jpg',
    'posz.jpg',
    'negz.jpg',
  ],
  nightSkybox: ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
  modelBasePath: '/3d-assets/newModel/',
  textureBasePath: '/3d-assets/textures/',
  dracoDecoderPath: 'https://www.gstatic.com/draco/v1/decoders/',
  cameraPosition: { x: -145, y: 204, z: -31 },
  cameraTarget: { x: 34.2, y: 61.5, z: 59.88 },
  modelOffset: { x: 100, y: 60, z: 100 },
}

// ===================== 主场景模型 =====================

/** 建筑模型列表 */
export const BUILDING_MODELS: ModelEntry[] = [
  { file: '地形.glb', name: '地形' },
  {
    file: '周围空盒子.glb',
    name: '周围空盒子',
    materialHandler: 'transparent',
  },
  { file: '食堂.glb', name: '食堂' },
  { file: '办公楼.glb', name: '办公楼' },
  { file: '备件间及机修间.glb', name: '备件间及机修间' },
  { file: '备品备件库.glb', name: '备品备件库' },
  { file: '操作室.glb', name: '操作室' },
  { file: '成品变电所.glb', name: '成品变电所' },
  { file: 'C2C4除尘设施.glb', name: 'C2C4除尘设施' },
  { file: '焙烧车间.glb', name: '焙烧车间' },
  { file: '110KV变电站.glb', name: '110KV变电站' },
  { file: '成品仓.glb', name: '成品仓' },
  { file: '成品分级.glb', name: '成品分级' },
  { file: '地磅.glb', name: '地磅' },
  { file: '电控楼.glb', name: '电控楼' },
  { file: '电力系统.glb', name: '电力系统' },
  { file: '干燥室.glb', name: '干燥室' },
  { file: '混配.glb', name: '混配' },
  { file: '空压站.glb', name: '空压站' },
  { file: '膨润土车间.glb', name: '膨润土车间' },
  { file: '其他.glb', name: '其他' },
  { file: '球团办公楼.glb', name: '球团办公楼' },
  { file: '室外新增设备.glb', name: '室外新增设备' },
  { file: '受料槽.glb', name: '受料槽' },
  { file: '树.glb', name: '树', materialHandler: 'shadow' },
  { file: '水池.glb', name: '水池' },
  { file: '停车位.glb', name: '停车位' },
  { file: '脱硫脱硝.glb', name: '脱硫脱硝' },
  { file: '选矿车间.glb', name: '选矿车间' },
  { file: '原料大棚.glb', name: '原料大棚' },
  { file: '尾矿池单独场景.glb', name: '尾矿池单独场景' },
  { file: '消石灰制备间.glb', name: '消石灰制备间' },
  { file: '选矿办公楼.glb', name: '选矿办公楼' },
  { file: '选矿电气楼.glb', name: '选矿电气楼' },
  { file: '燃气站.glb', name: '燃气站' },
  { file: '制砖间.glb', name: '制砖间' },
  { file: '中心化验室.glb', name: '中心化验室' },
  { file: '主电除尘.glb', name: '主电除尘' },
  { file: '浊环水泵站.glb', name: '浊环水泵站' },
  { file: '围墙.glb', name: '围墙' },
  { file: '水泵房.glb', name: '水泵房' },
  { file: '氮气站.glb', name: '氮气站' },
]

/** 管道模型列表 */
export const PIPE_MODELS: ModelEntry[] = [
  { file: 'pipe/电.glb', name: '电' },
  { file: 'pipe/水.glb', name: '水' },
  { file: 'pipe/氮气管道.glb', name: '氮气管道' },
  { file: 'pipe/天然气管道.glb', name: '天然气管道' },
  { file: 'pipe/压缩空气管道.glb', name: '压缩空气管道' },
]

/** 最后加载的模型 */
export const FINAL_MODEL: ModelEntry = { file: '造球室.glb', name: '造球室' }

// ===================== 下钻子场景 =====================

/** 子场景配置表 (建筑名 → 下钻配置) */
export const SUB_SCENES: Record<string, SubSceneConfig> = {
  原料大棚: {
    name: '原料大棚单独场景',
    file: '原料大棚单独场景.glb',
    offset: { x: 200, y: 60, z: 290 },
    cameraTarget: { x: 200, y: 60, z: 270 },
    cameraPosition: { x: 148, y: 139, z: 250 },
  },
  造球室: {
    name: '造球室单独场景',
    file: '造球室单独场景.glb',
    offset: { x: 180, y: 62, z: 80 },
    cameraTarget: { x: 178, y: 62, z: 84 },
    cameraPosition: { x: 180, y: 100, z: 48 },
  },
  焙烧车间: {
    name: '焙烧车间单独场景',
    file: '焙烧车间单独场景.glb',
    offset: { x: 210, y: 60, z: 50 },
    cameraTarget: { x: 190, y: 60, z: 40 },
    cameraPosition: { x: 270, y: 106, z: 40 },
  },
  选矿车间: {
    name: '选矿车间单独场景',
    file: '选矿车间单独场景.glb',
    offset: { x: 82, y: 60, z: 296 },
    cameraTarget: { x: 82, y: 60, z: 276 },
    cameraPosition: { x: 25, y: 97, z: 276 },
  },
  干燥室: {
    name: '干燥室单独场景',
    file: '干燥室单独场景.glb',
    offset: { x: 44, y: 60, z: -110 },
    cameraTarget: { x: 44, y: 60, z: -110 },
    cameraPosition: { x: 14, y: 80, z: -110 },
  },
  配料室: {
    name: '配料室单独场景',
    file: '配料室单独场景.glb',
    offset: { x: 44, y: 60, z: 10 },
    cameraTarget: { x: 44, y: 70, z: 10 },
    cameraPosition: { x: 16, y: 90, z: 10 },
  },
  地磅: {
    name: '地磅',
    file: '',
    offset: { x: 0, y: 0, z: 0 },
    cameraTarget: { x: 0, y: 60, z: 380 },
    cameraPosition: { x: -39, y: 87, z: 380 },
  },
  尾矿池单独场景: {
    name: '尾矿池单独场景',
    file: '',
    offset: { x: 0, y: 0, z: 0 },
    cameraTarget: { x: -31, y: -35, z: 270 },
    cameraPosition: { x: 30, y: 114, z: 360 },
  },
}

// ===================== 能源管道映射 =====================

/** 能源类型 → 管道名 + 关联建筑 */
export const ENERGY_MAP: Record<string, EnergyMapping> = {
  电: {
    pipe: '电',
    buildings: [
      '110KV变电站',
      '食堂',
      '办公楼',
      '脱硫脱硝',
      '干燥室',
      '中心化验室',
      '配料室',
      '混配',
      '空压站',
      '造球室',
      '焙烧车间',
      '主电除尘',
      '选矿车间',
      '成品分级',
      '水泵房',
      'C2C4除尘设施',
    ],
  },
  水: {
    pipe: '水',
    buildings: [
      '食堂',
      '办公楼',
      '脱硫脱硝',
      '水泵房',
      '浊环水泵站',
      '选矿车间',
      '干燥室',
      '配料室',
      '混配',
      '空压站',
      '造球室',
      '焙烧车间',
    ],
  },
  天然气: {
    pipe: '天然气管道',
    buildings: ['燃气站', '食堂', '脱硫脱硝', '干燥室', '焙烧车间'],
  },
  压缩空气: {
    pipe: '压缩空气管道',
    buildings: [
      '干燥室',
      '配料室',
      '混配',
      '空压站',
      '造球室',
      '焙烧车间',
      '脱硫脱硝',
      '尾矿池单独场景',
      '选矿车间',
    ],
  },
  氮气: {
    pipe: '氮气管道',
    buildings: [
      '干燥室',
      '配料室',
      '混配',
      '空压站',
      '造球室',
      '焙烧车间',
      '脱硫脱硝',
      '氮气站',
    ],
  },
}

// ===================== 建筑标签 =====================

/** 总览模式下显示的建筑标签(可下钻建筑 + 重要设施) */
export const BUILDING_LABELS: BuildingLabel[] = [
  { name: '原料大棚', position: { x: 200, y: 115, z: 270 } },
  { name: '造球室', position: { x: 178, y: 115, z: 84 } },
  { name: '焙烧车间', position: { x: 210, y: 115, z: 50 } },
  { name: '选矿车间', position: { x: 82, y: 115, z: 276 } },
  { name: '干燥室', position: { x: 44, y: 115, z: -110 } },
  { name: '配料室', position: { x: 44, y: 115, z: 10 } },
  { name: '地磅', position: { x: 100, y: 95, z: 480 } },
  { name: '办公楼', position: { x: 130, y: 95, z: 200 } },
  { name: '110KV变电站', position: { x: 30, y: 95, z: -40 } },
  { name: '脱硫脱硝', position: { x: 250, y: 95, z: -30 } },
  { name: '成品仓', position: { x: 250, y: 95, z: 120 } },
  { name: '膨润土车间', position: { x: 160, y: 95, z: 180 } },
]
