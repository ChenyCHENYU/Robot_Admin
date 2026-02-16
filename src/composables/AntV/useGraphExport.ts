import type { Ref } from 'vue'
import type { Graph } from '@antv/x6'
import { useMessage } from 'naive-ui'
import {
  exportJSON,
  exportPNG,
  exportSVG,
} from '@/components/global/C_AntV/utils/exportUtils'

/** 导出下拉菜单选项（三个布局共享） */
export const EXPORT_OPTIONS = [
  { label: '导出PNG', key: 'png' },
  { label: '导出SVG', key: 'svg' },
  { label: '导出JSON', key: 'json' },
] as const

/**
 * 图表导出 composable — 统一 PNG / SVG / JSON 导出逻辑
 * @param graph - X6 Graph 实例引用
 * @param filenamePrefix - 导出文件名前缀，默认 'diagram'
 */
export function useGraphExport(
  graph: Ref<Graph | null>,
  filenamePrefix = 'diagram'
) {
  const message = useMessage()
  /**
   * 处理导出操作
   * @param key - 导出格式 'png' | 'svg' | 'json'
   * @param getData - 获取当前图表数据的函数（用于 JSON 导出）
   */
  const handleExport = async (key: string, getData?: () => any) => {
    if (!graph.value) return

    try {
      switch (key) {
        case 'png':
          await exportPNG(graph.value, `${filenamePrefix}.png`)
          break
        case 'svg':
          exportSVG(graph.value, `${filenamePrefix}.svg`)
          break
        case 'json':
          if (getData) {
            exportJSON(getData(), `${filenamePrefix}.json`)
          }
          break
      }
    } catch (error) {
      console.error(`[useGraphExport] 导出失败 (${key}):`, error)
      message.error(`导出${key.toUpperCase()}失败，请重试`)
    }
  }

  return { exportOptions: EXPORT_OPTIONS, handleExport }
}
