/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\plugins\dash-adapter.ts
 * @Description: DASH 协议适配器（预留）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * DASH 适配器配置
 * - 目前为预留接口，待 xgplayer-dash 或 xgplayer-mp4 支持后扩展
 */
export interface DashAdapterOptions {
  /** dash.js 配置 */
  dashConfig?: {
    /** 最大缓冲长度（秒） */
    maxBufferLength?: number
    /** 自动码率切换 */
    abrEnabled?: boolean
  }
}

/** 默认 DASH 配置 */
export const DEFAULT_DASH_CONFIG: DashAdapterOptions['dashConfig'] = {
  maxBufferLength: 30,
  abrEnabled: true,
}

/**
 * DASH 适配器懒加载（预留）
 * - DASH 支持需要额外安装 xgplayer-dash 包
 * - 当前版本暂不实现，仅保留接口
 */
export async function loadDashPlayer(): Promise<null> {
  console.warn(
    '[C_VideoPlayer] DASH 协议适配器暂未实现，请安装 xgplayer-dash 包后扩展此模块'
  )
  return null
}

/**
 * 合并 DASH 配置到播放器选项
 */
export function mergeDashConfig(
  playerConfig: Record<string, unknown>,
  dashOptions?: DashAdapterOptions
): Record<string, unknown> {
  return {
    ...playerConfig,
    dash: {
      ...DEFAULT_DASH_CONFIG,
      ...dashOptions?.dashConfig,
    },
  }
}
