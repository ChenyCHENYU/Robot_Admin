/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @FilePath: \Robot_Admin\src\views\demo\54-audio-player\useAudioWorkspace.ts
 * @Description: 声音实验室的播放状态、曲目清理和音源切换
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { AUDIO_TRACKS } from './data'

/** 在同一个播放器实例中管理曲目，生命周期交给组件统一处理。 */
export function useAudioWorkspace() {
  const message = useMessage()
  const tracks = ref(AUDIO_TRACKS.map(track => ({ ...track })))
  const activeIndex = ref(0)
  const activeTrack = computed(() => tracks.value[activeIndex.value])
  const cover = computed(
    () => activeTrack.value?.cover ?? AUDIO_TRACKS[0].cover
  )
  const theme = ref<'default' | 'minimal'>('default')
  const showPlaylist = ref(true)
  const playing = ref(false)
  const lastEvent = ref('')

  /** 只有浏览器实际成功播放后，才显示播放状态。 */
  const handlePlay = (index: number) => {
    const track = tracks.value[index]
    if (!track) return
    activeIndex.value = index
    playing.value = true
    lastEvent.value = `正在播放：${track.title}`
  }
  /** 加载或播放失败时反馈真实错误状态。 */
  const handleError = () => {
    playing.value = false
    lastEvent.value = '音频未能播放，请检查浏览器播放权限或重新尝试'
    message.error(lastEvent.value)
  }
  /** 保留曲目标识，替换当前音源，不靠重新挂载播放器完成切换。 */
  const replaceSource = () => {
    const track = activeTrack.value
    if (!track) return
    const source =
      AUDIO_TRACKS[
        (AUDIO_TRACKS.findIndex(item => item.src === track.src) + 1) %
          AUDIO_TRACKS.length
      ]
    Object.assign(track, { ...source, id: track.id })
    lastEvent.value = `当前音源已切换为：${source.title}`
  }
  /** 删除当前项后由播放器选取相邻曲目，空列表退出播放状态。 */
  const removeCurrent = () => {
    if (!activeTrack.value) return
    tracks.value.splice(activeIndex.value, 1)
    activeIndex.value = Math.max(
      0,
      Math.min(activeIndex.value, tracks.value.length - 1)
    )
    if (!tracks.value.length) playing.value = false
    lastEvent.value = '当前曲目已移除'
  }
  /** 原地清空列表，用于验证停止播放与释放媒体资源。 */
  const clearTracks = () => {
    tracks.value.splice(0)
    activeIndex.value = 0
    playing.value = false
    lastEvent.value = '播放列表已清空，恢复示例后可重新播放'
  }
  /** 恢复独立曲目快照，仍有同名曲目时保留当前选择。 */
  const restoreTracks = () => {
    const id = activeTrack.value?.id
    tracks.value.splice(
      0,
      tracks.value.length,
      ...AUDIO_TRACKS.map(track => ({ ...track }))
    )
    activeIndex.value = Math.max(
      0,
      tracks.value.findIndex(track => track.id === id)
    )
    lastEvent.value = '示例曲目已恢复'
  }
  onDeactivated(() => {
    playing.value = false
  })
  return {
    tracks,
    activeIndex,
    activeTrack,
    cover,
    theme,
    showPlaylist,
    playing,
    lastEvent,
    handlePlay,
    handleError,
    replaceSource,
    removeCurrent,
    clearTracks,
    restoreTracks,
  }
}
