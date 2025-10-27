import { Graph } from '@antv/x6'
import type { Ref } from 'vue'
import { useThemeStore } from '@/stores/theme'

/**
 * 获取主题相关的颜色配置
 */
function getThemeColors(isDark: boolean) {
  return {
    background: isDark ? '#18181c' : '#f5f5f5',
    gridPrimary: isDark ? 'rgba(255, 255, 255, 0.08)' : '#eee',
    gridSecondary: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ddd',
  }
}

/**
 * 默认的图表配置选项
 */
function getDefaultOptions(isDark: boolean = false) {
  const colors = getThemeColors(isDark)

  return {
    background: { color: colors.background },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        { color: colors.gridPrimary, thickness: 1 },
        { color: colors.gridSecondary, thickness: 1, factor: 4 },
      ],
    },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 2,
    },
    selecting: {
      enabled: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
    },
    resizing: true,
    rotating: true,
    snapline: true,
    keyboard: true,
    clipboard: true,
  }
}

/**
 * 获取容器的尺寸
 */
function getContainerSize(container: HTMLElement | undefined) {
  if (!container) return { width: 0, height: 0 }
  return {
    width: container.clientWidth || container.offsetWidth || 800,
    height: container.clientHeight || container.offsetHeight || 600,
  }
}

/**
 * 创建和管理 AntV X6 图表实例的组合式 API
 */
export function useGraphBase(containerRef: Ref<HTMLElement | undefined>) {
  // 直接使用 any 类型，在使用时再进行类型断言
  const graph: Ref<any> = ref(null)
  const loading = ref(false)
  const themeStore = useThemeStore()

  /**
   * 初始化图表实例
   */
  const initGraph = async (options: any = {}) => {
    await nextTick()
    loading.value = true

    try {
      if (!containerRef.value) {
        console.error('[useGraphBase] 容器引用不存在')
        return
      }

      // 销毁旧实例
      if (graph.value) {
        graph.value.dispose()
        graph.value = null
      }

      const { width, height } = getContainerSize(containerRef.value)

      // 容器尺寸为0，延迟重试
      if (width === 0 || height === 0) {
        console.warn('[useGraphBase] 容器尺寸为0，等待重试...')
        setTimeout(() => initGraph(options), 100)
        return
      }

      const { isDark } = themeStore
      const defaultOptions = getDefaultOptions(isDark)

      const finalOptions = {
        container: containerRef.value,
        width,
        height,
        ...defaultOptions,
        ...options,
      }

      console.log('[useGraphBase] 图表配置:', finalOptions)

      graph.value = new Graph(finalOptions)

      console.log('[useGraphBase] 图表初始化完成')
    } catch (error) {
      console.error('[useGraphBase] 初始化图表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新主题
   */
  function updateTheme(isDark: boolean) {
    if (!graph.value) return

    const colors = getThemeColors(isDark)

    // 更新背景色
    graph.value.drawBackground({ color: colors.background })

    // 更新网格颜色
    graph.value.drawGrid({
      type: 'doubleMesh',
      args: [
        { color: colors.gridPrimary, thickness: 1 },
        { color: colors.gridSecondary, thickness: 1, factor: 4 },
      ],
    })
  }

  // 监听主题变化
  watch(
    () => themeStore.isDark,
    isDark => {
      updateTheme(isDark)
    }
  )

  /**
   * 销毁当前图表实例
   */
  function destroyGraph() {
    if (graph.value) {
      graph.value.dispose()
      graph.value = null
    }
  }

  /**
   * 将图表内容居中显示
   */
  function centerContent() {
    graph.value?.centerContent()
  }

  /**
   * 自适应缩放图表以适应容器
   */
  function zoomToFit() {
    graph.value?.zoomToFit({ padding: 20, maxScale: 1 })
  }

  /**
   * 按指定因子缩放图表
   */
  function zoom(factor: number) {
    graph.value?.zoom(factor)
  }

  /**
   * 调整图表尺寸以适应容器变化
   */
  function resizeGraph() {
    if (graph.value && containerRef.value) {
      const { width, height } = getContainerSize(containerRef.value)
      graph.value.resize(width, height)
    }
  }

  // 组件卸载时自动销毁图表
  onUnmounted(destroyGraph)

  return {
    graph,
    loading,
    initGraph,
    destroyGraph,
    centerContent,
    zoomToFit,
    zoom,
    resizeGraph,
    updateTheme,
  }
}
