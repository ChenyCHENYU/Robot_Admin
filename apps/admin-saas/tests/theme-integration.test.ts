/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\tests\theme-integration.test.ts
 * @Description: 主题包与 Robot_Admin 应用适配层集成测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createPinia, disposePinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick, type WatchStopHandle } from 'vue'
import { s_settingsStore } from '../src/stores/settings'
import { setupAppearanceSettingsPersistence } from '../src/stores/settings/persistence'
import { s_themeStore } from '../src/stores/theme'

/** 测试专用内存 Storage。 */
class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

  /** 当前键数量。 */
  get length(): number {
    return this.values.size
  }

  /** 清空全部键。 */
  clear(): void {
    this.values.clear()
  }

  /** 读取键值。 */
  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  /** 按索引读取键名。 */
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null
  }

  /** 删除键值。 */
  removeItem(key: string): void {
    this.values.delete(key)
  }

  /** 写入键值。 */
  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

/** 创建主题与布局 Store 所需的最小浏览器环境。 */
function createBrowserEnvironment() {
  const storage = new MemoryStorage()
  const styles = new Map<string, string>()
  const attributes = new Map<string, string>()
  const classes = new Set<string>()
  const listeners = new Map<string, Set<EventListener>>()
  const documentElement = {
    style: {
      getPropertyValue: (name: string) => styles.get(name) ?? '',
      setProperty: (name: string, value: string) => styles.set(name, value),
      removeProperty: (name: string) => {
        const previous = styles.get(name) ?? ''
        styles.delete(name)
        return previous
      },
    },
    classList: {
      add: (name: string) => classes.add(name),
      remove: (name: string) => classes.delete(name),
      toggle: (name: string, force?: boolean) => {
        const enabled = force ?? !classes.has(name)
        if (enabled) classes.add(name)
        else classes.delete(name)
        return enabled
      },
    },
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  }
  const mediaQuery = {
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }
  const browserWindow = {
    localStorage: storage,
    matchMedia: () => mediaQuery,
    addEventListener: (name: string, listener: EventListener) => {
      const group = listeners.get(name) ?? new Set<EventListener>()
      group.add(listener)
      listeners.set(name, group)
    },
    removeEventListener: (name: string, listener: EventListener) => {
      listeners.get(name)?.delete(listener)
    },
  }

  return {
    attributes,
    browserWindow,
    classes,
    document: { documentElement },
    listeners,
    storage,
    styles,
  }
}

const originalWindow = globalThis.window
const originalDocument = globalThis.document
let environment: ReturnType<typeof createBrowserEnvironment>
let stopAppearancePersistence: WatchStopHandle | null = null
let pinia: Pinia

describe('theme integration', () => {
  beforeEach(() => {
    environment = createBrowserEnvironment()
    Object.assign(globalThis, {
      window: environment.browserWindow,
      document: environment.document,
    })
    pinia = createPinia()
    setActivePinia(pinia)
    stopAppearancePersistence = null
  })

  afterEach(() => {
    stopAppearancePersistence?.()
    const themeStore = s_themeStore()
    if (typeof themeStore.destroy === 'function') themeStore.destroy()
    disposePinia(pinia)
    Object.assign(globalThis, {
      window: originalWindow,
      document: originalDocument,
    })
  })

  test('以包内 Store 为唯一主题来源并清理旧覆盖缓存', async () => {
    environment.storage.setItem(
      'robot-admin-theme-overrides',
      JSON.stringify({
        common: {
          bodyColor: '#000000',
          primaryColor: '#f5222d',
          borderRadius: '8px',
        },
      })
    )
    stopAppearancePersistence = setupAppearanceSettingsPersistence()
    const themeStore = s_themeStore()
    const settingsStore = s_settingsStore()

    themeStore.init()

    expect(
      environment.storage.getItem('robot-admin-theme-overrides')
    ).toBeNull()
    expect(settingsStore.primaryColor).toBe('#f5222d')
    expect(settingsStore.borderRadius).toBe('large')
    expect(
      JSON.parse(
        environment.storage.getItem('robot-admin-appearance-settings') ?? '{}'
      )
    ).toEqual({
      schemaVersion: 1,
      primaryColor: '#f5222d',
      borderRadius: 'large',
    })
    expect(environment.attributes.get('data-theme')).toBe('light')
    expect(themeStore.themeOverrides.common?.bodyColor).toBe('#ffffff')
    expect(themeStore.themeOverrides.common?.primaryColor).toBe('#f5222d')

    await themeStore.setMode('dark')
    await nextTick()
    expect(themeStore.isDark).toBe(true)
    expect(settingsStore.themeMode).toBe('dark')
    expect(themeStore.themeOverrides.common?.bodyColor).toBeUndefined()

    themeStore.setMenuTheme('standard')
    expect(environment.attributes.get('data-menu-theme')).toBe('standard')
    expect(environment.styles.get('--app-menu-bg')).toBe('#1c1c1c')

    settingsStore.primaryColor = '#52c41a'
    settingsStore.borderRadius = 'small'
    await nextTick()
    expect(
      JSON.parse(
        environment.storage.getItem('robot-admin-appearance-settings') ?? '{}'
      )
    ).toEqual({
      schemaVersion: 1,
      primaryColor: '#52c41a',
      borderRadius: 'small',
    })
  })

  test('暗黑科技风格拒绝不兼容的亮色状态且卸载时清理菜单副作用', async () => {
    stopAppearancePersistence = setupAppearanceSettingsPersistence()
    const themeStore = s_themeStore()
    themeStore.init()
    themeStore.setMenuTheme('standard')

    await themeStore.setDesignStyle('dark-tech')
    await themeStore.setMode('light')
    await nextTick()

    expect(themeStore.mode).toBe('dark')
    expect(environment.attributes.get('data-design-style')).toBe('dark-tech')
    expect(environment.listeners.get('storage')?.size).toBe(2)

    themeStore.destroy()
    expect(environment.attributes.has('data-menu-theme')).toBe(false)
    expect(environment.styles.has('--app-menu-bg')).toBe(false)
    expect(environment.listeners.get('storage')?.size).toBe(0)
  })
})
