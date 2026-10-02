/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\stores\settings\persistence.ts
 * @Description: 外观设置白名单持久化与历史主题缓存迁移
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { watch, type WatchStopHandle } from 'vue'
import {
  sanitizeSettingsPatch,
  type BorderRadiusSize,
  type SettingsState,
} from '@robot-admin/layout/naive'
import { s_settingsStore } from './index'

const APPEARANCE_SETTINGS_KEY = 'robot-admin-appearance-settings'
const LEGACY_THEME_OVERRIDES_KEY = 'robot-admin-theme-overrides'
const APPEARANCE_SCHEMA_VERSION = 1
const LEGACY_RADIUS_MAP: Readonly<Record<string, BorderRadiusSize>> = {
  '4px': 'small',
  '6px': 'medium',
  '8px': 'large',
}

type AppearanceSettings = Pick<SettingsState, 'primaryColor' | 'borderRadius'>
type AppearancePatch = Partial<AppearanceSettings>

/** 判断未知值是否为普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 安全读取并解析 JSON 对象。 */
function readJsonStorage(key: string): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(key)
    if (value === null) return null
    const parsed: unknown = JSON.parse(value)
    if (isRecord(parsed)) return parsed
    window.localStorage.removeItem(key)
  } catch {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // 存储不可用时保持内存默认值。
    }
  }
  return null
}

/** 仅保留布局包允许的主色和圆角字段。 */
function sanitizeAppearanceSettings(input: unknown): AppearancePatch | null {
  try {
    const settings = sanitizeSettingsPatch(input)
    const result: AppearancePatch = {}
    if (settings.primaryColor !== undefined) {
      result.primaryColor = settings.primaryColor
    }
    if (settings.borderRadius !== undefined) {
      result.borderRadius = settings.borderRadius
    }
    return Object.keys(result).length > 0 ? result : null
  } catch {
    return null
  }
}

/** 从历史完整主题覆盖中提取仍有意义的两个外观字段。 */
function readLegacyAppearanceSettings(): AppearancePatch | null {
  const legacy = readJsonStorage(LEGACY_THEME_OVERRIDES_KEY)
  if (!legacy || !isRecord(legacy.common)) return null
  const borderRadius =
    typeof legacy.common.borderRadius === 'string'
      ? LEGACY_RADIUS_MAP[legacy.common.borderRadius]
      : undefined
  return sanitizeAppearanceSettings({
    primaryColor: legacy.common.primaryColor,
    borderRadius,
  })
}

/** 安全删除指定设置缓存。 */
function removeStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // 清理失败不得阻断应用初始化。
  }
}

/** 将白名单外观设置写入独立、可演进的缓存。 */
function saveAppearanceSettings(settings: AppearanceSettings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      APPEARANCE_SETTINGS_KEY,
      JSON.stringify({
        schemaVersion: APPEARANCE_SCHEMA_VERSION,
        primaryColor: settings.primaryColor,
        borderRadius: settings.borderRadius,
      })
    )
  } catch {
    // 配额或隐私限制不应影响运行时设置。
  }
}

/**
 * 恢复并持久化外观设置；同时把旧完整主题覆盖迁移为主色/圆角白名单。
 * @returns 停止持久化监听的清理函数
 */
export function setupAppearanceSettingsPersistence(): WatchStopHandle {
  const settingsStore = s_settingsStore()
  const stored = readJsonStorage(APPEARANCE_SETTINGS_KEY)
  const current =
    stored?.schemaVersion === APPEARANCE_SCHEMA_VERSION
      ? sanitizeAppearanceSettings(stored)
      : null
  const appearance = current ?? readLegacyAppearanceSettings()

  if (appearance) settingsStore.$patch(appearance)
  removeStorage(LEGACY_THEME_OVERRIDES_KEY)
  if (stored && !current) removeStorage(APPEARANCE_SETTINGS_KEY)
  saveAppearanceSettings({
    primaryColor: settingsStore.primaryColor,
    borderRadius: settingsStore.borderRadius,
  })

  return watch(
    () => [settingsStore.primaryColor, settingsStore.borderRadius] as const,
    ([primaryColor, borderRadius]) =>
      saveAppearanceSettings({ primaryColor, borderRadius })
  )
}
