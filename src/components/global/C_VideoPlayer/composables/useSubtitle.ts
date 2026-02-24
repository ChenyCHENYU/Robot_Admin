/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\composables\useSubtitle.ts
 * @Description: 字幕管理（原生 VTT 解析 + Overlay 渲染）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { ref, computed, type Ref, type ShallowRef } from 'vue'
import type { PlayerInstance, SubtitleTrack } from '../types'

/** 解析后的字幕条目 */
export interface SubtitleCue {
  /** 起始时间（秒） */
  start: number
  /** 结束时间（秒） */
  end: number
  /** 字幕文本 */
  text: string
}

/** 将 "HH:MM:SS.mmm" 或 "MM:SS.mmm" 格式转为秒 */
function parseVttTime(raw: string): number {
  const parts = raw.trim().split(':')
  if (parts.length === 3) {
    return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2])
  }
  // MM:SS.mmm
  return Number(parts[0]) * 60 + Number(parts[1])
}

/** 解析 WebVTT 文本为 cue 列表 */
function parseVtt(vttText: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  // 按空行分割 block
  const blocks = vttText.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    // 查找包含 "-->" 的行
    const timeLineIdx = lines.findIndex(l => l.includes('-->'))
    if (timeLineIdx === -1) continue

    const [startRaw, endRaw] = lines[timeLineIdx].split('-->')
    if (!startRaw || !endRaw) continue

    const start = parseVttTime(startRaw)
    const end = parseVttTime(endRaw.split(/\s/)[0]) // 去掉 position 等后缀
    const text = lines
      .slice(timeLineIdx + 1)
      .join('\n')
      .replace(/<[^>]+>/g, '') // 去 HTML 标签
      .trim()

    if (text) {
      cues.push({ start, end, text })
    }
  }

  return cues
}

/**
 * 字幕管理 composable
 * - fetch VTT → 解析 → 按当前播放时间匹配 cue
 * - 提供切换 / 关闭能力
 */
export function useSubtitle(
  playerRef: ShallowRef<PlayerInstance | null>,
  subtitles: SubtitleTrack[] = [],
  currentTime: Ref<number> = ref(0)
) {
  /** 当前激活的字幕语言（null = 关闭） */
  const activeLanguage = ref<string | null>(null)

  /** 字幕列表 */
  const subtitleList = ref<SubtitleTrack[]>([...subtitles])

  /** 已加载的 cue 数据：language → cues */
  const cueMap = ref<Record<string, SubtitleCue[]>>({})

  /** 是否正在加载 */
  const isLoading = ref(false)

  /** 当前应显示的字幕文本 */
  const currentText = computed(() => {
    if (!activeLanguage.value) return ''
    const cues = cueMap.value[activeLanguage.value]
    if (!cues?.length) return ''
    const t = currentTime.value
    const cue = cues.find(c => t >= c.start && t < c.end)
    return cue?.text ?? ''
  })

  /** 是否有字幕可用 */
  const hasSubtitles = computed(() => subtitleList.value.length > 0)

  /** 加载指定语言的 VTT 文件 */
  async function loadTrack(language: string): Promise<SubtitleCue[]> {
    // 已缓存
    if (cueMap.value[language]) return cueMap.value[language]

    const track = subtitleList.value.find(s => s.language === language)
    if (!track) return []

    isLoading.value = true
    try {
      const resp = await fetch(track.src)
      if (!resp.ok) {
        console.warn(
          `[C_VideoPlayer] 字幕加载失败: ${track.src} (${resp.status})`
        )
        return []
      }
      const text = await resp.text()
      const cues = parseVtt(text)
      cueMap.value[language] = cues
      return cues
    } catch (e) {
      console.warn('[C_VideoPlayer] 字幕加载异常:', e)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /** 初始化：加载默认字幕 */
  async function initSubtitles() {
    if (!subtitleList.value.length) return
    const defaultTrack =
      subtitleList.value.find(s => s.default) ?? subtitleList.value[0]
    await loadTrack(defaultTrack.language)
    activeLanguage.value = defaultTrack.language
  }

  /** 切换字幕语言 */
  async function switchSubtitle(language: string) {
    const track = subtitleList.value.find(s => s.language === language)
    if (!track) {
      console.warn(`[C_VideoPlayer] 未找到字幕轨道: ${language}`)
      return
    }
    await loadTrack(language)
    activeLanguage.value = language
  }

  /** 关闭字幕 */
  function closeSubtitle() {
    activeLanguage.value = null
  }

  /** 切换字幕开/关 */
  function toggleSubtitle() {
    if (activeLanguage.value) {
      closeSubtitle()
    } else {
      const defaultTrack =
        subtitleList.value.find(s => s.default) ?? subtitleList.value[0]
      if (defaultTrack) {
        switchSubtitle(defaultTrack.language)
      }
    }
  }

  return {
    activeLanguage,
    subtitleList,
    currentText,
    hasSubtitles,
    isLoading,
    initSubtitles,
    switchSubtitle,
    closeSubtitle,
    toggleSubtitle,
  }
}
