/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\composables\CollapsePanel\useCollapsePanel.ts
 * @Description: 折叠面板展开/折叠逻辑
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type { CollapsePanelItem } from '@/types/modules/collapse-panel'

interface UseCollapsePanelOptions {
  /** 面板项配置 */
  items: Ref<CollapsePanelItem[]>
  /** 外部 v-model activeKeys */
  activeKeys: Ref<string[] | undefined>
  /** 非受控时的默认激活 key */
  defaultActiveKeys: string[]
  /** 是否手风琴模式 */
  accordion: Ref<boolean>
  /** localStorage 持久化 key */
  persistKey: Ref<string | undefined>
  /** activeKeys 变化回调 */
  onChange?: (keys: string[]) => void
  /** 单面板展开回调 */
  onExpand?: (key: string) => void
  /** 单面板折叠回调 */
  onCollapse?: (key: string) => void
}

/**
 * 折叠面板展开/折叠核心逻辑
 */
export function useCollapsePanel(options: UseCollapsePanelOptions) {
  const {
    items,
    activeKeys: externalKeys,
    defaultActiveKeys,
    accordion,
    persistKey,
    onChange,
    onExpand,
    onCollapse,
  } = options

  // ─── 持久化读取 ────────────────────────────────
  const loadPersistedKeys = (): string[] | null => {
    if (!persistKey.value) return null
    try {
      const raw = localStorage.getItem(`collapse-panel:${persistKey.value}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const savePersistedKeys = (keys: string[]) => {
    if (!persistKey.value) return
    try {
      localStorage.setItem(
        `collapse-panel:${persistKey.value}`,
        JSON.stringify(keys)
      )
    } catch {
      // 静默失败
    }
  }

  // ─── 内部状态 ──────────────────────────────────
  const resolveInitialKeys = (): string[] => {
    // 优先级：外部 v-model > 持久化 > 默认值
    if (externalKeys.value !== undefined) return [...externalKeys.value]
    const persisted = loadPersistedKeys()
    if (persisted) return persisted
    return [...defaultActiveKeys]
  }

  const internalKeys = ref<string[]>(resolveInitialKeys())

  /** 懒渲染追踪：记录哪些面板曾被展开过 */
  const renderedOnce = ref<Set<string>>(new Set(internalKeys.value))

  // ─── 计算属性 ──────────────────────────────────
  /** 当前激活的 key 数组（兼容受控 / 非受控） */
  const currentKeys = computed<string[]>({
    get: () =>
      externalKeys.value !== undefined
        ? externalKeys.value
        : internalKeys.value,
    set: val => {
      internalKeys.value = val
    },
  })

  /**
   * 判断面板是否展开
   */
  const isExpanded = (key: string): boolean => {
    return currentKeys.value.includes(key)
  }

  /**
   * 判断面板是否应该渲染内容
   * - lazy 面板只有被展开过至少一次后才渲染
   * - destroyOnCollapse 面板在折叠后销毁 DOM
   */
  const shouldRender = (item: CollapsePanelItem): boolean => {
    const expanded = isExpanded(item.key)

    if (item.destroyOnCollapse) return expanded
    if (item.lazy) return renderedOnce.value.has(item.key)
    return true
  }

  // ─── 操作方法 ──────────────────────────────────
  const updateKeys = (newKeys: string[]) => {
    currentKeys.value = newKeys
    onChange?.(newKeys)
    savePersistedKeys(newKeys)
  }

  const toggle = (key: string) => {
    const item = items.value.find(i => i.key === key)
    if (!item || item.disabled) return

    const expanded = isExpanded(key)

    if (expanded) {
      // 折叠
      updateKeys(currentKeys.value.filter(k => k !== key))
      onCollapse?.(key)
    } else {
      // 展开
      renderedOnce.value.add(key)

      if (accordion.value) {
        // 手风琴模式：关闭其他面板
        const prevKeys = currentKeys.value
        updateKeys([key])
        // 通知被折叠的面板
        prevKeys.forEach(k => {
          if (k !== key) onCollapse?.(k)
        })
      } else {
        updateKeys([...currentKeys.value, key])
      }
      onExpand?.(key)
    }
  }

  const expandAll = () => {
    if (accordion.value) return // 手风琴模式不支持全展开

    const allKeys = items.value.filter(i => !i.disabled).map(i => i.key)

    allKeys.forEach(k => renderedOnce.value.add(k))
    updateKeys(allKeys)
  }

  const collapseAll = () => {
    updateKeys([])
  }

  const getActiveKeys = (): string[] => {
    return [...currentKeys.value]
  }

  // ─── 键盘导航 ──────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent, key: string) => {
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault()
      toggle(key)
    }
  }

  // ─── 同步外部 v-model 变化 ─────────────────────
  watch(
    () => externalKeys.value,
    newVal => {
      if (newVal !== undefined) {
        internalKeys.value = [...newVal]
        newVal.forEach(k => renderedOnce.value.add(k))
        savePersistedKeys(newVal)
      }
    }
  )

  return {
    currentKeys,
    renderedOnce,
    isExpanded,
    shouldRender,
    toggle,
    expandAll,
    collapseAll,
    getActiveKeys,
    handleKeyDown,
  }
}
