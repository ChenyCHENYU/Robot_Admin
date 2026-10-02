/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-09 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\42-signature\data.ts
 * @Description: 电子签名演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export interface ScenarioMeta {
  id: string
  icon: string
  title: string
  description: string
}

/** 演示场景配置（含图标，以 id 为键方便模板直接引用） */
export const SCENARIOS: Record<string, ScenarioMeta> = {
  basic: {
    id: 'basic',
    icon: 'mdi:draw-pen',
    title: '基础签名',
    description: '最简单的签名板，开箱即用',
  },
  custom: {
    id: 'custom',
    icon: 'mdi:palette',
    title: '自定义配置',
    description: '自定义背景颜色、工具栏显示',
  },
  watermark: {
    id: 'watermark',
    icon: 'mdi:watermark',
    title: '带水印签名',
    description: '适用于合同、协议等需要标记时间的场景',
  },
  readonly: {
    id: 'readonly',
    icon: 'mdi:eye',
    title: '只读模式',
    description: '展示已有签名，不可编辑',
  },
  api: {
    id: 'api',
    icon: 'mdi:api',
    title: 'API 演示',
    description: '签名数据的保存与恢复',
  },
}

/** 自定义配置默认值 */
export const CUSTOM_CONFIG_DEFAULTS = {
  bgColor: 'transparent',
  showToolbar: true,
}
