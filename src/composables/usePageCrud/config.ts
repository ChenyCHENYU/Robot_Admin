/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: usePageCrud 全局配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { UsePageCrudOptions } from './types'

// ==================== 预设配置 ====================

export const CRUD_PRESETS = {
  /**
   * 标准 CRUD 预设
   * 适用于大多数场景
   */
  standard: {
    autoRefresh: true,
    filterParams: true,
    resetPageOnReset: true,
    resetPageOnFetchParams: false,
  },

  /**
   * RESTful 风格预设
   * ID 在路径中，适用于 RESTful API
   */
  restful: {
    autoRefresh: true,
    filterParams: true,
    resetPageOnReset: true,
    endpointOptions: {
      get: { idIn: 'path' as const, appendIdToPath: true },
      update: { idIn: 'path' as const, appendIdToPath: true },
      remove: { idIn: 'path' as const, appendIdToPath: true },
    },
  },

  /**
   * 静默模式预设
   * 禁用所有消息提示
   */
  silent: {
    autoRefresh: true,
    filterParams: true,
    notifier: undefined,
  },

  /**
   * 手动刷新预设
   * 所有操作后不自动刷新
   */
  manual: {
    autoRefresh: false,
    filterParams: true,
    resetPageOnReset: true,
  },
} as const

export type PresetName = keyof typeof CRUD_PRESETS

// ==================== 全局配置 ====================

let globalConfig: Partial<UsePageCrudOptions> = {}

/**
 * 配置全局默认选项
 *
 * @example
 * configureCrud({
 *   defaultPage: { current: 1, size: 20 },
 *   preset: 'restful',
 * })
 */
export function configureCrud(
  config: Partial<UsePageCrudOptions> & { preset?: PresetName }
) {
  const { preset, ...rest } = config

  // 合并预设和自定义配置
  if (preset && CRUD_PRESETS[preset]) {
    globalConfig = {
      ...CRUD_PRESETS[preset],
      ...rest,
    }
  } else {
    globalConfig = rest
  }
}

/**
 * 获取全局配置
 */
export function getGlobalConfig(): Partial<UsePageCrudOptions> {
  return { ...globalConfig }
}

/**
 * 重置全局配置
 */
export function resetGlobalConfig() {
  globalConfig = {}
}

/**
 * 应用预设
 */
export function applyPreset(
  preset: PresetName,
  options: Partial<UsePageCrudOptions> = {}
): Partial<UsePageCrudOptions> {
  const presetConfig = CRUD_PRESETS[preset]
  return {
    ...presetConfig,
    ...options,
  }
}
