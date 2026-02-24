/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Signature\useSignatureHistory.ts
 * @Description: 电子签名历史记录（撤销/重做）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { SignatureStroke } from '@/types/modules/signature'

interface UseSignatureHistoryOptions {
  maxHistory?: number
  onChange?: (strokes: SignatureStroke[]) => void
}

/**
 * 签名历史记录管理
 */
export function useSignatureHistory(options: UseSignatureHistoryOptions = {}) {
  const { maxHistory = 50, onChange } = options

  const strokes = ref<SignatureStroke[]>([])
  const historyStack = ref<SignatureStroke[][]>([])
  const historyIndex = ref(-1)

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(
    () => historyIndex.value < historyStack.value.length - 1
  )

  /**
   * 添加笔画到历史
   */
  const addStroke = (stroke: SignatureStroke) => {
    strokes.value.push(stroke)
    saveToHistory()
  }

  /**
   * 保存当前状态到历史栈
   */
  const saveToHistory = () => {
    // 清除当前索引之后的历史
    historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)

    // 添加新状态
    historyStack.value.push([...strokes.value])
    historyIndex.value++

    // 限制历史栈大小
    if (historyStack.value.length > maxHistory) {
      historyStack.value.shift()
      historyIndex.value--
    }

    onChange?.(strokes.value)
  }

  /**
   * 撤销
   */
  const undo = (): boolean => {
    if (!canUndo.value) return false

    historyIndex.value--
    strokes.value = [...historyStack.value[historyIndex.value]]
    onChange?.(strokes.value)

    return true
  }

  /**
   * 重做
   */
  const redo = (): boolean => {
    if (!canRedo.value) return false

    historyIndex.value++
    strokes.value = [...historyStack.value[historyIndex.value]]
    onChange?.(strokes.value)

    return true
  }

  /**
   * 清空所有历史
   */
  const clear = () => {
    strokes.value = []
    historyStack.value = [[]]
    historyIndex.value = 0
    onChange?.(strokes.value)
  }

  /**
   * 加载签名数据
   */
  const loadData = (data: SignatureStroke[]) => {
    strokes.value = [...data]
    historyStack.value = [[...data]]
    historyIndex.value = 0
    onChange?.(strokes.value)
  }

  /**
   * 判断是否为空
   */
  const isEmpty = computed(() => strokes.value.length === 0)

  // 初始化历史栈
  historyStack.value = [[]]
  historyIndex.value = 0

  return {
    strokes: readonly(strokes),
    canUndo: readonly(canUndo),
    canRedo: readonly(canRedo),
    isEmpty: readonly(isEmpty),
    addStroke,
    undo,
    redo,
    clear,
    loadData,
  }
}
