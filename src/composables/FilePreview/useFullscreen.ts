/**
 * useFullscreen — 全屏切换 composable
 */
import type { Ref } from 'vue'
import { FULLSCREEN_EVENTS } from '@/components/global/C_FilePreview/data'

/**
 * 全屏切换 composable — 管理全屏状态与跨浏览器兼容
 * @param containerRef - 需要全屏的容器元素引用
 */
export function useFullscreen(containerRef: Ref<HTMLElement | undefined>) {
  const isFullscreen = ref(false)

  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  const tryMethods = (
    methods: Array<() => Promise<void>>,
    index = 0
  ): Promise<void> => {
    if (index >= methods.length) {
      console.warn('无法切换全屏状态')
      return Promise.resolve()
    }
    return methods[index]().catch(() => tryMethods(methods, index + 1))
  }

  const toggleFullscreen = async () => {
    const element = containerRef.value
    if (!element) return

    const isCurrentlyFullscreen = !!document.fullscreenElement

    const methods = isCurrentlyFullscreen
      ? [
          () => document.exitFullscreen(),
          () => (document as any).webkitExitFullscreen(),
          () => (document as any).mozCancelFullScreen(),
          () => (document as any).msExitFullscreen(),
        ]
      : [
          () => element.requestFullscreen(),
          () => (element as any).webkitRequestFullscreen(),
          () => (element as any).mozRequestFullScreen(),
          () => (element as any).msRequestFullscreen(),
        ]

    await tryMethods(methods)
  }

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        // ignore
      }
    }
    isFullscreen.value = false
  }

  onMounted(() => {
    FULLSCREEN_EVENTS.forEach(event =>
      document.addEventListener(event, handleFullscreenChange)
    )
  })

  onUnmounted(() => {
    FULLSCREEN_EVENTS.forEach(event =>
      document.removeEventListener(event, handleFullscreenChange)
    )
  })

  return { isFullscreen, toggleFullscreen, exitFullscreen }
}
