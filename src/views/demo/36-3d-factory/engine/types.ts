/** 3D 向量 */
export interface Vec3Like {
  x: number
  y: number
  z: number
}

/** 场景配置 */
export interface SceneConfig {
  /** 天空盒纹理路径 */
  skyboxPath: string
  /** 日间天空盒 */
  daySkybox: string[]
  /** 夜间天空盒 */
  nightSkybox: string[]
  /** 模型基路径 */
  modelBasePath: string
  /** 纹理基路径 */
  textureBasePath: string
  /** DRACO 解码器路径 */
  dracoDecoderPath: string
  /** 初始相机位置 */
  cameraPosition: Vec3Like
  /** 初始相机目标点 */
  cameraTarget: Vec3Like
  /** 模型全局偏移 */
  modelOffset: Vec3Like
}

/** 模型配置项 */
export interface ModelEntry {
  /** 文件名 */
  file: string
  /** 场景中 name */
  name: string
  /** 特殊材质处理 */
  materialHandler?: 'transparent' | 'shadow'
}

/** 子场景下钻配置 */
export interface SubSceneConfig {
  /** 子场景名称 */
  name: string
  /** GLB 文件名,空字符串表示仅缩放到已有模型 */
  file: string
  /** 模型偏移 */
  offset: Vec3Like
  /** 下钻后相机目标 */
  cameraTarget: Vec3Like
  /** 下钻后相机位置 */
  cameraPosition: Vec3Like
}

/** 建筑标签配置 */
export interface BuildingLabel {
  /** 建筑名称 */
  name: string
  /** 标签世界坐标 */
  position: Vec3Like
}

/** 能源管道映射 */
export interface EnergyMapping {
  /** 管道模型名称 */
  pipe: string
  /** 关联的建筑名称列表 */
  buildings: string[]
}

/** 事件标签点 */
export interface EventPoint {
  /** 标识 */
  name: string
  /** 显示值 */
  value: string
  /** 平面坐标 */
  position: { x: number; y: number }
  /** 环保数据 */
  num1?: string
  num2?: string
  num3?: string
}

/** 日夜模式 */
export type DayNightMode = 'day' | 'night'

/** 场景层级 */
export type SceneLevel = 1 | 2

/** 加载进度 */
export interface LoadProgress {
  /** 已加载数量 */
  loaded: number
  /** 总数 */
  total: number
  /** 当前模型名 */
  modelName: string
}

/** 引擎事件类型 */
export type EngineEvent =
  | 'progress'
  | 'loaded'
  | 'labelClick'
  | 'drillDown'
  | 'returnOverview'

/** 清理回调 */
export type DisposeCallback = () => void
