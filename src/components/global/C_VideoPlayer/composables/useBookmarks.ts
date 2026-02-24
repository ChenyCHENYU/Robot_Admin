/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useBookmarks.ts
 * @Description: 书签笔记
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, type Ref } from 'vue'
import { STORAGE_KEYS } from '../constants'
import type { Bookmark } from '../types'

/**
 * 书签笔记 composable
 * - 添加 / 删除 / 更新书签
 * - localStorage 持久化
 * - 按时间排序
 */
export function useBookmarks(
  url: Ref<string>,
  currentTime: Ref<number>,
  seekFn: (time: number) => void,
  initialBookmarks: Bookmark[] = []
) {
  const bookmarks = ref<Bookmark[]>([...initialBookmarks])

  /** 存储 key */
  function getStorageKey(): string {
    return STORAGE_KEYS.BOOKMARKS + encodeURIComponent(url.value)
  }

  /** 从 localStorage 恢复书签 */
  function restoreBookmarks() {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        const parsed: Bookmark[] = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          bookmarks.value = parsed
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  /** 保存书签到 localStorage */
  function saveBookmarks() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(bookmarks.value))
    } catch {
      // 忽略存储失败
    }
  }

  /** 排序（按时间升序） */
  function sortBookmarks() {
    bookmarks.value.sort((a, b) => a.time - b.time)
  }

  /** 添加书签 */
  function addBookmark(note: string = ''): Bookmark {
    const bookmark: Bookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      time: currentTime.value,
      note,
      createdAt: Date.now(),
    }
    bookmarks.value.push(bookmark)
    sortBookmarks()
    saveBookmarks()
    return bookmark
  }

  /** 删除书签 */
  function removeBookmark(id: string) {
    const index = bookmarks.value.findIndex(b => b.id === id)
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }

  /** 更新书签备注 */
  function updateBookmark(id: string, note: string) {
    const bookmark = bookmarks.value.find(b => b.id === id)
    if (bookmark) {
      bookmark.note = note
      saveBookmarks()
    }
  }

  /** 跳转到书签位置 */
  function goToBookmark(id: string) {
    const bookmark = bookmarks.value.find(b => b.id === id)
    if (bookmark) {
      seekFn(bookmark.time)
    }
  }

  /** 清空所有书签 */
  function clearBookmarks() {
    bookmarks.value = []
    saveBookmarks()
  }

  // 初始化时恢复
  if (!initialBookmarks.length) {
    restoreBookmarks()
  }

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    goToBookmark,
    clearBookmarks,
  }
}
