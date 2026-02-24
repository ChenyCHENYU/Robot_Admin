/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\plugins\hls-adapter.ts
 * @Description: HLS 协议适配器 - 懒加载 xgplayer-hls
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * HLS 适配器
 * - 按需加载 xgplayer-hls, 不在主包中引入
 * - 提供 HLS 特有的配置选项
 */
export interface HlsAdapterOptions {
  /** HLS.js 配置 */
  hlsConfig?: {
    /** 最大缓冲长度（秒） */
    maxBufferLength?: number
    /** 最大最大缓冲长度（秒） */
    maxMaxBufferLength?: number
    /** 自动开始加载 */
    autoStartLoad?: boolean
    /** 不超过播放器尺寸对应的码率 */
    capLevelToPlayerSize?: boolean
    /** 起始加载等级，-1 为自动 */
    startLevel?: number
  }
}

/** 默认 HLS 配置 */
export const DEFAULT_HLS_CONFIG: HlsAdapterOptions['hlsConfig'] = {
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  autoStartLoad: true,
  capLevelToPlayerSize: true,
  startLevel: -1,
}

/**
 * 懒加载 HLS 播放器构造函数
 * - 仅在需要 HLS 源时才加载 xgplayer-hls 包
 */
export async function loadHlsPlayer() {
  const module = await import('xgplayer-hls')
  return module.default
}

/**
 * 合并 HLS 配置到播放器选项
 */
export function mergeHlsConfig(
  playerConfig: Record<string, unknown>,
  hlsOptions?: HlsAdapterOptions
): Record<string, unknown> {
  return {
    ...playerConfig,
    hls: {
      ...DEFAULT_HLS_CONFIG,
      ...hlsOptions?.hlsConfig,
    },
  }
}
