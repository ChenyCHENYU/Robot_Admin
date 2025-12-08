import type { Graph } from '@antv/x6'

/**
 * 扩展 Graph 接口，添加导出方法的类型定义
 */
interface ExtendedGraph extends Graph {
  toPNG?: (
    callback: (dataUri: string) => void,
    options?: {
      backgroundColor?: string
      padding?: number
      quality?: number
    }
  ) => void

  toSVG?: (
    callback: (content: string) => void,
    options?: {
      padding?: number
    }
  ) => void

  toJPEG?: (
    callback: (dataUri: string) => void,
    options?: {
      backgroundColor?: string
      padding?: number
      quality?: number
    }
  ) => void
}

/**
 * 导出数据为 JSON 文件
 * @param {any} data - 要导出的数据
 * @param {string} [filename='diagram.json'] - 文件名
 * @returns {void}
 *
 * @example
 * ```typescript
 * const diagramData = { nodes: [], edges: [] }
 * exportJSON(diagramData, 'my-diagram.json')
 * ```
 */
export function exportJSON(data: any, filename = 'diagram.json'): void {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], {
      type: 'application/json',
    })
    downloadBlob(blob, filename)
    console.log('[Export] JSON导出成功:', filename)
  } catch (error) {
    console.error('[Export] JSON导出失败:', error)
    throw new Error(
      `JSON导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    )
  }
}

/**
 * 导出图表为 PNG 图片
 * @param {Graph} graph - AntV X6 图表实例
 * @param {string} [filename='diagram.png'] - 文件名
 * @param {object} [options] - 导出选项
 * @param {string} [options.backgroundColor='#ffffff'] - 背景色
 * @param {number} [options.padding=20] - 内边距
 * @param {number} [options.quality=1] - 图片质量 (0-1)
 * @returns {void}
 *
 * @example
 * ```typescript
 * exportPNG(graph, 'my-diagram.png', {
 *   backgroundColor: '#f0f0f0',
 *   padding: 30,
 *   quality: 0.9
 * })
 * ```
 */
export function exportPNG(
  graph: Graph,
  filename = 'diagram.png',
  options: {
    backgroundColor?: string
    padding?: number
    quality?: number
  } = {}
): void {
  try {
    const extendedGraph = graph as ExtendedGraph

    if (!extendedGraph.toPNG) {
      throw new Error('当前图表实例不支持 PNG 导出功能')
    }

    const exportOptions = {
      backgroundColor: '#ffffff',
      padding: 20,
      quality: 1,
      ...options,
    }

    extendedGraph.toPNG((dataUri: string) => {
      try {
        const link = document.createElement('a')
        link.download = filename
        link.href = dataUri
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log('[Export] PNG导出成功:', filename)
      } catch (error) {
        console.error('[Export] PNG下载失败:', error)
      }
    }, exportOptions)
  } catch (error) {
    console.error('[Export] PNG导出失败:', error)
    throw new Error(
      `PNG导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    )
  }
}

/**
 * 导出图表为 SVG 矢量图
 * @param {Graph} graph - AntV X6 图表实例
 * @param {string} [filename='diagram.svg'] - 文件名
 * @param {object} [options] - 导出选项
 * @param {number} [options.padding=20] - 内边距
 * @returns {void}
 *
 * @example
 * ```typescript
 * exportSVG(graph, 'my-diagram.svg', { padding: 30 })
 * ```
 */
export function exportSVG(
  graph: Graph,
  filename = 'diagram.svg',
  options: {
    padding?: number
  } = {}
): void {
  try {
    const extendedGraph = graph as ExtendedGraph

    if (!extendedGraph.toSVG) {
      throw new Error('当前图表实例不支持 SVG 导出功能')
    }

    const exportOptions = {
      padding: 20,
      ...options,
    }

    extendedGraph.toSVG((content: string) => {
      try {
        const blob = new Blob([content], { type: 'image/svg+xml' })
        downloadBlob(blob, filename)
        console.log('[Export] SVG导出成功:', filename)
      } catch (error) {
        console.error('[Export] SVG下载失败:', error)
      }
    }, exportOptions)
  } catch (error) {
    console.error('[Export] SVG导出失败:', error)
    throw new Error(
      `SVG导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    )
  }
}

/**
 * 导出图表为 JPEG 图片
 * @param {Graph} graph - AntV X6 图表实例
 * @param {string} [filename='diagram.jpg'] - 文件名
 * @param {object} [options] - 导出选项
 * @param {string} [options.backgroundColor='#ffffff'] - 背景色
 * @param {number} [options.padding=20] - 内边距
 * @param {number} [options.quality=0.8] - 图片质量 (0-1)
 * @returns {void}
 *
 * @example
 * ```typescript
 * exportJPEG(graph, 'my-diagram.jpg', { quality: 0.9 })
 * ```
 */
export function exportJPEG(
  graph: Graph,
  filename = 'diagram.jpg',
  options: {
    backgroundColor?: string
    padding?: number
    quality?: number
  } = {}
): void {
  try {
    const extendedGraph = graph as ExtendedGraph

    if (!extendedGraph.toJPEG) {
      throw new Error('当前图表实例不支持 JPEG 导出功能')
    }

    const exportOptions = {
      backgroundColor: '#ffffff',
      padding: 20,
      quality: 0.8,
      ...options,
    }

    extendedGraph.toJPEG((dataUri: string) => {
      try {
        const link = document.createElement('a')
        link.download = filename
        link.href = dataUri
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log('[Export] JPEG导出成功:', filename)
      } catch (error) {
        console.error('[Export] JPEG下载失败:', error)
      }
    }, exportOptions)
  } catch (error) {
    console.error('[Export] JPEG导出失败:', error)
    throw new Error(
      `JPEG导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    )
  }
}

/**
 * 通用的文件下载函数
 * @param {Blob} blob - Blob 对象
 * @param {string} filename - 文件名
 * @returns {void}
 *
 * @example
 * ```typescript
 * const blob = new Blob(['Hello World'], { type: 'text/plain' })
 * downloadBlob(blob, 'hello.txt')
 * ```
 */
function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理 URL 对象以释放内存
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('[Export] 文件下载失败:', error)
    throw new Error(
      `文件下载失败: ${error instanceof Error ? error.message : '未知错误'}`
    )
  }
}

/**
 * 复制内容到剪贴板
 * @param {string} content - 要复制的内容
 * @returns {Promise<boolean>} 是否复制成功
 *
 * @example
 * ```typescript
 * const success = await copyToClipboard('Hello World')
 * if (success) {
 *   console.log('复制成功')
 * } else {
 *   console.log('复制失败')
 * }
 * ```
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    // 检查浏览器是否支持 Clipboard API
    if (!navigator.clipboard) {
      console.warn('[Export] 浏览器不支持 Clipboard API，尝试使用备用方法')
      return fallbackCopyToClipboard(content)
    }

    await navigator.clipboard.writeText(content)
    console.log('[Export] 复制到剪贴板成功')
    return true
  } catch (error) {
    console.error('[Export] 复制到剪贴板失败:', error)

    // 如果 Clipboard API 失败，尝试备用方法
    console.warn('[Export] 尝试使用备用复制方法')
    return fallbackCopyToClipboard(content)
  }
}

/**
 * 备用的复制到剪贴板方法（适用于不支持 Clipboard API 的浏览器）
 * @param {string} content - 要复制的内容
 * @returns {boolean} 是否复制成功
 */
function fallbackCopyToClipboard(content: string): boolean {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = content
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const result = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (result) {
      console.log('[Export] 备用方法复制成功')
    } else {
      console.error('[Export] 备用方法复制失败')
    }

    return result
  } catch (error) {
    console.error('[Export] 备用复制方法执行失败:', error)
    return false
  }
}

/**
 * 检查图表是否支持特定的导出方法
 * @param {Graph} graph - AntV X6 图表实例
 * @param {'png' | 'svg' | 'jpeg'} exportType - 导出类型
 * @returns {boolean} 是否支持该导出方法
 *
 * @example
 * ```typescript
 * if (isExportSupported(graph, 'png')) {
 *   exportPNG(graph, 'diagram.png')
 * } else {
 *   console.warn('该图表不支持 PNG 导出')
 * }
 * ```
 */
export function isExportSupported(
  graph: Graph,
  exportType: 'png' | 'svg' | 'jpeg'
): boolean {
  const extendedGraph = graph as ExtendedGraph

  switch (exportType) {
    case 'png':
      return typeof extendedGraph.toPNG === 'function'
    case 'svg':
      return typeof extendedGraph.toSVG === 'function'
    case 'jpeg':
      return typeof extendedGraph.toJPEG === 'function'
    default:
      return false
  }
}

/**
 * 获取支持的导出格式列表
 * @param {Graph} graph - AntV X6 图表实例
 * @returns {string[]} 支持的导出格式数组
 *
 * @example
 * ```typescript
 * const supportedFormats = getSupportedExportFormats(graph)
 * console.log('支持的导出格式:', supportedFormats)
 * // 输出: ['json', 'png', 'svg']
 * ```
 */
export function getSupportedExportFormats(graph: Graph): string[] {
  const formats: string[] = ['json'] // JSON 导出总是支持的

  if (isExportSupported(graph, 'png')) {
    formats.push('png')
  }

  if (isExportSupported(graph, 'svg')) {
    formats.push('svg')
  }

  if (isExportSupported(graph, 'jpeg')) {
    formats.push('jpeg')
  }

  return formats
}
