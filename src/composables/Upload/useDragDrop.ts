/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Upload\useDragDrop.ts
 * @Description: 拖拽 & 粘贴上传
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'

/**
 * 拖拽 & 粘贴上传
 *
 * 监听容器的 dragover / drop / paste 事件，
 * 提取文件（含目录遍历）后回调给上层。
 *
 * @param containerRef  容器 DOM
 * @param enabled       是否启用拖拽
 * @param pasteable     是否启用粘贴
 * @param accept        文件类型限制
 * @param onFiles       文件回调
 */
export function useDragDrop(
  containerRef: Ref<HTMLElement | undefined>,
  enabled: Ref<boolean>,
  pasteable: Ref<boolean>,
  accept: Ref<string>,
  onFiles: (files: File[]) => void
) {
  /** 是否正在拖拽悬停 */
  const isDragOver = ref(false)

  // ─── 拖拽事件 ─────────────────────────────────

  /** 处理拖入事件 */
  function handleDragEnter(e: DragEvent) {
    if (!enabled.value) return
    e.preventDefault()
    isDragOver.value = true
  }

  /** 处理拖拽经过事件 */
  function handleDragOver(e: DragEvent) {
    if (!enabled.value) return
    e.preventDefault()
    isDragOver.value = true
  }

  /** 处理拖离事件 */
  function handleDragLeave(e: DragEvent) {
    if (!enabled.value) return
    e.preventDefault()
    const container = containerRef.value
    if (container && !container.contains(e.relatedTarget as Node)) {
      isDragOver.value = false
    }
  }

  /** 处理放置事件 */
  async function handleDrop(e: DragEvent) {
    if (!enabled.value) return
    e.preventDefault()
    isDragOver.value = false

    const items = e.dataTransfer?.items
    if (!items) return

    const files = await collectDropFiles(items, e.dataTransfer)
    const filtered = filterByAccept(files, accept.value)
    if (filtered.length > 0) onFiles(filtered)
  }

  // ─── 粘贴事件 ─────────────────────────────────

  /** 粘贴事件 */
  function handlePaste(e: ClipboardEvent) {
    if (!pasteable.value) return

    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }

    const filtered = filterByAccept(files, accept.value)
    if (filtered.length > 0) {
      e.preventDefault()
      onFiles(filtered)
    }
  }

  // ─── 生命周期绑定 ─────────────────────────────

  /** 绑定事件 */
  function bindEvents() {
    const el = containerRef.value
    if (!el) return

    el.addEventListener('dragenter', handleDragEnter)
    el.addEventListener('dragover', handleDragOver)
    el.addEventListener('dragleave', handleDragLeave)
    el.addEventListener('drop', handleDrop)

    if (pasteable.value) {
      document.addEventListener('paste', handlePaste)
    }
  }

  /** 解绑事件 */
  function unbindEvents() {
    const el = containerRef.value
    if (el) {
      el.removeEventListener('dragenter', handleDragEnter)
      el.removeEventListener('dragover', handleDragOver)
      el.removeEventListener('dragleave', handleDragLeave)
      el.removeEventListener('drop', handleDrop)
    }
    document.removeEventListener('paste', handlePaste)
  }

  onMounted(bindEvents)
  onBeforeUnmount(unbindEvents)

  watch([containerRef, enabled, pasteable], () => {
    unbindEvents()
    bindEvents()
  })

  return {
    /** 是否正在拖拽悬停 */
    isDragOver: readonly(isDragOver),
  }
}

// ─── 工具函数 ────────────────────────────────

/** 从 drop 事件收集文件（含目录遍历） */
async function collectDropFiles(
  items: DataTransferItemList,
  dataTransfer: DataTransfer | null
): Promise<File[]> {
  const entries: FileSystemEntry[] = []
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry?.()
    if (entry) entries.push(entry)
  }

  if (entries.length > 0) {
    const results = await Promise.all(entries.map(readEntry))
    return results.flat()
  }

  const files: File[] = []
  const dtFiles = dataTransfer?.files
  if (dtFiles) {
    for (let i = 0; i < dtFiles.length; i++) {
      files.push(dtFiles[i])
    }
  }
  return files
}

/** 递归读取 FileSystemEntry */
async function readEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise(resolve => {
      ;(entry as FileSystemFileEntry).file(
        file => resolve([file]),
        () => resolve([])
      )
    })
  }

  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    const entries = await new Promise<FileSystemEntry[]>(resolve => {
      reader.readEntries(
        result => resolve(result),
        () => resolve([])
      )
    })
    const results = await Promise.all(entries.map(readEntry))
    return results.flat()
  }

  return []
}

/** 根据 accept 过滤文件 */
function filterByAccept(files: File[], accept: string): File[] {
  if (!accept) return files

  const acceptTypes = accept.split(',').map(s => s.trim().toLowerCase())

  return files.filter(file => {
    return acceptTypes.some(type => {
      if (type.startsWith('.')) {
        // 扩展名匹配
        return file.name.toLowerCase().endsWith(type)
      }
      if (type.endsWith('/*')) {
        // MIME 前缀匹配 (image/*, video/*)
        const prefix = type.replace('/*', '')
        return file.type.toLowerCase().startsWith(prefix)
      }
      // 精确 MIME 匹配
      return file.type.toLowerCase() === type
    })
  })
}
