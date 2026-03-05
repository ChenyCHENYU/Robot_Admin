/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_AudioPlayer\types.ts
 * @Description: Audio player component type definitions
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */

/** Single audio track */
export interface AudioTrack {
  /** Unique identifier */
  id: string | number
  /** Track title */
  title: string
  /** Artist / author */
  artist?: string
  /** Audio source URL */
  src: string
  /** Cover image URL */
  cover?: string
  /** Duration in seconds (optional, for static display) */
  duration?: number
  /** Extra data */
  extra?: Record<string, unknown>
}

/** Component props */
export interface AudioPlayerProps {
  /** Playlist */
  tracks: AudioTrack[]
  /** Initial active index */
  initialIndex?: number
  /** Whether to show the playlist panel */
  showPlaylist?: boolean
  /** Whether to show the cover art */
  showCover?: boolean
  /** Whether to auto-play on mount */
  autoplay?: boolean
  /** Playback mode */
  mode?: 'list' | 'loop' | 'single' | 'shuffle'
  /** Theme appearance */
  theme?: 'default' | 'minimal'
}

/** Default props */
export const DEFAULT_AUDIO_PLAYER_PROPS: Partial<AudioPlayerProps> = {
  initialIndex: 0,
  showPlaylist: true,
  showCover: true,
  autoplay: false,
  mode: 'list',
  theme: 'default',
}

/** Playback mode icon map */
export const MODE_ICON_MAP: Record<string, { icon: string; label: string }> = {
  list: { icon: 'mdi:repeat', label: 'List Loop' },
  loop: { icon: 'mdi:repeat-once', label: 'Single Loop' },
  single: { icon: 'mdi:numeric-1-box', label: 'Play Once' },
  shuffle: { icon: 'mdi:shuffle-variant', label: 'Shuffle' },
}

/** Format seconds to mm:ss */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
