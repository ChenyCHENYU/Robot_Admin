/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useChapters.ts
 * @Description: 章节标记
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { computed, type Ref } from 'vue'
import type { Chapter } from '../types'

/**
 * 章节标记 composable
 * - 根据当前播放时间计算所在章节
 * - 提供跳转到指定章节的能力
 * - 计算进度条上章节标记的位置
 */
export function useChapters(
  chapters: Ref<Chapter[]>,
  currentTime: Ref<number>,
  duration: Ref<number>,
  seekFn: (time: number) => void
) {
  /** 当前所在章节 */
  const currentChapter = computed<Chapter | null>(() => {
    if (!chapters.value.length) return null
    const time = currentTime.value
    return (
      chapters.value.find(ch => time >= ch.startTime && time < ch.endTime) ??
      null
    )
  })

  /** 当前章节索引 */
  const currentChapterIndex = computed(() => {
    if (!currentChapter.value) return -1
    return chapters.value.findIndex(ch => ch.id === currentChapter.value!.id)
  })

  /** 章节在进度条上的位置百分比 */
  const chapterMarkers = computed(() => {
    if (!duration.value || !chapters.value.length) return []
    return chapters.value.map(ch => ({
      ...ch,
      startPercent: (ch.startTime / duration.value) * 100,
      endPercent: (ch.endTime / duration.value) * 100,
      widthPercent: ((ch.endTime - ch.startTime) / duration.value) * 100,
    }))
  })

  /** 跳转到指定章节 */
  function goToChapter(chapterId: string) {
    const chapter = chapters.value.find(ch => ch.id === chapterId)
    if (chapter) {
      seekFn(chapter.startTime)
    }
  }

  /** 跳转到上一章 */
  function prevChapter() {
    const idx = currentChapterIndex.value
    if (idx > 0) {
      seekFn(chapters.value[idx - 1].startTime)
    }
  }

  /** 跳转到下一章 */
  function nextChapter() {
    const idx = currentChapterIndex.value
    if (idx >= 0 && idx < chapters.value.length - 1) {
      seekFn(chapters.value[idx + 1].startTime)
    }
  }

  return {
    currentChapter,
    currentChapterIndex,
    chapterMarkers,
    goToChapter,
    prevChapter,
    nextChapter,
  }
}
